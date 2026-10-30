// MetaMissionSystem - Procedural Zombie Extermination & Bounty Meta Progression
// Procedural scaling: 10 -> 100 -> 1,000 -> 10,000 -> 100,000 kills
// Automatically encompasses all current and newly added zombies in EnemyPoolSystem!

class MetaMissionSystem {
    constructor() {
        this.STORAGE_KEY = 'gvs_meta_missions';
        this.TIERS = [10, 100, 1000, 10000, 100000];
        this.MAX_TIER = 5;

        // In-memory state
        this.state = this.loadState();
        this.activeFilter = 'all'; // 'all', 'ready', 'active', 'completed'
        this.searchQuery = '';

        this.initDOM();
    }

    loadState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    kills: parsed.kills || {},
                    claimedTiers: parsed.claimedTiers || {},
                    totalClaimedGold: parsed.totalClaimedGold || 0,
                    totalClaimedXp: parsed.totalClaimedXp || 0
                };
            }
        } catch (e) {
            console.warn('Failed to parse meta missions state:', e);
        }
        return {
            kills: {},
            claimedTiers: {},
            totalClaimedGold: 0,
            totalClaimedXp: 0
        };
    }

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save meta missions state:', e);
        }
    }

    getAllZombies() {
        if (window.enemyPool && Array.isArray(window.enemyPool.masterPool)) {
            return window.enemyPool.masterPool;
        }
        if (typeof EnemyPoolSystem !== 'undefined') {
            const ep = new EnemyPoolSystem();
            return ep.masterPool || [];
        }
        return [];
    }

    getTierReward(tierIndex, zombieDef) {
        // tierIndex: 0 (10 kills) to 4 (100k kills)
        const baseGold = [250, 1500, 12000, 100000, 1000000];
        const baseXP = [100, 600, 4000, 30000, 250000];
        const titles = [
            'Iniciante 🥉',
            'Veterano 🥈',
            'Carrasco 🥇',
            'Mestre Lendário 💎',
            'DEUS DA CAÇADA 👑⚡'
        ];

        const t = Math.max(0, Math.min(this.MAX_TIER - 1, tierIndex));
        
        // Procedural difficulty bonus based on base HP and danger tier
        let diffMult = 1.0;
        if (zombieDef) {
            if (zombieDef.hp >= 300) diffMult = 1.45;
            else if (zombieDef.hp >= 200) diffMult = 1.25;
            else if (zombieDef.hp >= 150) diffMult = 1.15;

            if (zombieDef.badgeClass === 'badge-tank' || zombieDef.badgeClass === 'badge-danger') {
                diffMult = Math.max(diffMult, 1.3);
            }
        }

        const gold = Math.round(baseGold[t] * diffMult);
        const xp = Math.round(baseXP[t] * diffMult);
        const title = titles[t];

        return {
            gold,
            xp,
            title,
            tier: t + 1,
            target: this.TIERS[t]
        };
    }

    getZombieMission(zombieIdOrDef) {
        let zombieDef = null;
        let zombieId = null;

        if (typeof zombieIdOrDef === 'string') {
            zombieId = zombieIdOrDef;
            zombieDef = this.getAllZombies().find(z => z.id === zombieId || z.type === zombieId);
        } else if (zombieIdOrDef && typeof zombieIdOrDef === 'object') {
            zombieDef = zombieIdOrDef;
            zombieId = zombieDef.id || zombieDef.type;
        }

        if (!zombieId) return null;

        const totalKills = this.state.kills[zombieId] || 0;
        const claimedTier = this.state.claimedTiers[zombieId] || 0; // 0 to 5

        const isMaxCompleted = claimedTier >= this.MAX_TIER;
        const currentTierIndex = Math.min(this.MAX_TIER - 1, claimedTier);
        const targetKills = this.TIERS[currentTierIndex];
        const prevTarget = currentTierIndex > 0 ? this.TIERS[currentTierIndex - 1] : 0;

        const isReadyToClaim = !isMaxCompleted && totalKills >= targetKills;

        let progressPercent = 0;
        if (isMaxCompleted) {
            progressPercent = 100;
        } else {
            progressPercent = Math.min(100, Math.floor((totalKills / targetKills) * 100));
        }

        const currentReward = this.getTierReward(currentTierIndex, zombieDef);

        return {
            zombieId,
            zombie: zombieDef || {
                id: zombieId,
                name: zombieId.replace('_', ' ').toUpperCase(),
                icon: 'assets/zombies/punk_walker.jpg',
                badge: 'ZUMBI',
                badgeClass: 'badge-common',
                desc: 'Alvo de caçada procedural.'
            },
            kills: totalKills,
            claimedTier,
            currentTierIndex,
            currentTierNum: currentTierIndex + 1,
            targetKills,
            prevTarget,
            progressPercent,
            isReadyToClaim,
            isMaxCompleted,
            reward: currentReward,
            allTiers: this.TIERS
        };
    }

    getAllMissions() {
        const zombies = this.getAllZombies();
        return zombies.map(z => this.getZombieMission(z)).filter(Boolean);
    }

    recordKill(zombieOrId) {
        let zombieId = null;
        let zombieName = null;

        if (typeof zombieOrId === 'string') {
            zombieId = zombieOrId;
        } else if (zombieOrId && typeof zombieOrId === 'object') {
            zombieId = zombieOrId.enemyId || zombieOrId.id || zombieOrId.type;
            zombieName = zombieOrId.baseName || zombieOrId.name;
        }

        if (!zombieId) return;

        const currentKills = (this.state.kills[zombieId] || 0) + 1;
        this.state.kills[zombieId] = currentKills;
        this.saveState();

        const claimedTier = this.state.claimedTiers[zombieId] || 0;
        if (claimedTier < this.MAX_TIER) {
            const currentTarget = this.TIERS[claimedTier];
            if (currentKills === currentTarget) {
                this.onMilestoneReached(zombieId, zombieName, currentKills);
            }
        }

        this.updateBadgeCounter();
    }

    onMilestoneReached(zombieId, zombieName, kills) {
        const name = zombieName || zombieId;
        if (window.combat && typeof window.combat.addFloatingText === 'function') {
            const cx = window.combat.canvas ? window.combat.canvas.width / 2 : 200;
            const cy = window.combat.canvas ? window.combat.canvas.height * 0.28 : 120;
            window.combat.addFloatingText(`🎯 META CONCLUÍDA: ${name} (${kills} Kills)!`, cx, cy, '#ffd700', true);
            if (window.soundEngine && typeof window.soundEngine.playLevelUp === 'function') {
                window.soundEngine.playLevelUp();
            }
        }
    }

    claimReward(zombieId) {
        const mission = this.getZombieMission(zombieId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;

        // Grant Gold to Talents / Game
        if (window.talentSystem && typeof window.talentSystem.addGold === 'function') {
            window.talentSystem.addGold(reward.gold);
        } else if (window.game) {
            window.game.gold = (window.game.gold || 0) + reward.gold;
            if (typeof window.game.saveState === 'function') window.game.saveState();
        }

        // Grant Hero XP
        if (window.guitaristPool && typeof window.guitaristPool.addHeroXp === 'function') {
            const activeHero = window.combat
                ? window.combat.getActiveHeroData()
                : (window.guitaristPool.getActiveHero ? window.guitaristPool.getActiveHero() : null);
            if (activeHero) {
                window.guitaristPool.addHeroXp(activeHero.id, reward.xp);
            }
        }

        const nextClaimed = mission.claimedTier + 1;
        this.state.claimedTiers[zombieId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();

        if (window.soundEngine) {
            if (typeof window.soundEngine.playStageClear === 'function') {
                window.soundEngine.playStageClear();
            } else if (typeof window.soundEngine.playExplosion === 'function') {
                window.soundEngine.playExplosion();
            }
        }

        this.updateBadgeCounter();
        this.render();

        return {
            success: true,
            zombieId,
            claimedTier: nextClaimed,
            reward,
            isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimAllRewards() {
        const missions = this.getAllMissions().filter(m => m.isReadyToClaim);
        if (missions.length === 0) return { count: 0, totalGold: 0, totalXp: 0 };

        let totalGold = 0;
        let totalXp = 0;

        missions.forEach(m => {
            const res = this.claimReward(m.zombieId);
            if (res && res.success) {
                totalGold += res.reward.gold;
                totalXp += res.reward.xp;
            }
        });

        this.render();
        return { count: missions.length, totalGold, totalXp };
    }

    getPendingClaimsCount() {
        const missions = this.getAllMissions();
        return missions.filter(m => m.isReadyToClaim).length;
    }

    updateBadgeCounter() {
        if (typeof document === 'undefined') return;
        const count = this.getPendingClaimsCount();
        const badge = document.getElementById('menu-missions-badge');
        if (badge) {
            badge.innerText = count.toString();
            if (badge.classList) {
                if (count > 0) {
                    badge.classList.remove('hidden');
                    badge.classList.add('pulse-badge');
                } else {
                    badge.classList.add('hidden');
                    badge.classList.remove('pulse-badge');
                }
            }
        }
        const claimAllBtn = document.getElementById('missions-claim-all-btn');
        if (claimAllBtn) {
            claimAllBtn.disabled = (count === 0);
            claimAllBtn.innerText = count > 0 ? `✨ REIVINDICAR TODAS (${count})` : '✨ REIVINDICAR TODAS';
        }
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('meta-missions-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('missions-modal-close-btn');
        if (closeBtn) closeBtn.onclick = () => this.close();

        const claimAllBtn = document.getElementById('missions-claim-all-btn');
        if (claimAllBtn) claimAllBtn.onclick = () => this.claimAllRewards();

        const searchInput = document.getElementById('missions-search-input');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.searchQuery = (e.target.value || '').trim().toLowerCase();
                this.renderCards();
            };
        }

        if (modal && typeof modal.querySelectorAll === 'function') {
            const filterBtns = modal.querySelectorAll('.missions-filter-btn');
            filterBtns.forEach(btn => {
                btn.onclick = () => {
                    filterBtns.forEach(b => b.classList && b.classList.remove('active'));
                    if (btn.classList) btn.classList.add('active');
                    this.activeFilter = (btn.dataset && btn.dataset.filter) ? btn.dataset.filter : 'all';
                    this.renderCards();
                };
            });
        }
    }

    open() {
        this.initDOM();
        const modal = document.getElementById('meta-missions-modal');
        if (modal) {
            if (modal.classList) modal.classList.add('open');
            this.render();
        }
    }

    close() {
        const modal = document.getElementById('meta-missions-modal');
        if (modal) {
            if (modal.classList) modal.classList.remove('open');
        }
        this.updateBadgeCounter();
        if (window.game && typeof window.game.updateMenuHUD === 'function') {
            window.game.updateMenuHUD();
        }
    }

    render() {
        this.updateStatsHeader();
        this.updateBadgeCounter();
        this.renderCards();
    }

    updateStatsHeader() {
        const missions = this.getAllMissions();
        const totalKills = Object.values(this.state.kills).reduce((a, b) => a + (Number(b) || 0), 0);
        const maxCompletedCount = missions.filter(m => m.isMaxCompleted).length;
        const totalClaimedGold = this.state.totalClaimedGold || 0;

        const statKills = document.getElementById('missions-stat-kills');
        const statGold = document.getElementById('missions-stat-gold');
        const statCompleted = document.getElementById('missions-stat-completed');

        if (statKills) statKills.innerText = totalKills.toLocaleString();
        if (statGold) statGold.innerText = totalClaimedGold.toLocaleString();
        if (statCompleted) statCompleted.innerText = `${maxCompletedCount} / ${missions.length}`;
    }

    renderCards() {
        const container = document.getElementById('missions-cards-grid');
        if (!container) return;

        let missions = this.getAllMissions();

        // Apply Search
        if (this.searchQuery) {
            missions = missions.filter(m => {
                const name = (m.zombie.name || '').toLowerCase();
                const badge = (m.zombie.badge || '').toLowerCase();
                return name.includes(this.searchQuery) || badge.includes(this.searchQuery);
            });
        }

        // Apply Tab Filter
        if (this.activeFilter === 'ready') {
            missions = missions.filter(m => m.isReadyToClaim);
        } else if (this.activeFilter === 'active') {
            missions = missions.filter(m => !m.isReadyToClaim && !m.isMaxCompleted);
        } else if (this.activeFilter === 'completed') {
            missions = missions.filter(m => m.isMaxCompleted);
        }

        if (missions.length === 0) {
            container.innerHTML = `
                <div class="missions-empty-state">
                    <span class="empty-icon">🧟</span>
                    <p>Nenhuma missão meta encontrada para o filtro selecionado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = missions.map(m => this.createCardHTML(m)).join('');

        // Bind Individual Claim Buttons
        if (container && typeof container.querySelectorAll === 'function') {
            container.querySelectorAll('.mission-claim-btn[data-zombie]').forEach(btn => {
                btn.onclick = () => {
                    const zombieId = btn.dataset ? btn.dataset.zombie : null;
                    if (zombieId) this.claimReward(zombieId);
                };
            });
        }
    }

    createCardHTML(m) {
        const { zombie, kills, targetKills, progressPercent, isReadyToClaim, isMaxCompleted, reward, currentTierNum } = m;
        const iconSrc = zombie.icon || 'assets/zombies/punk_walker.jpg';
        const badgeText = zombie.badge || 'ZUMBI';
        const badgeClass = zombie.badgeClass || 'badge-common';

        let actionBtnHTML = '';
        if (isMaxCompleted) {
            actionBtnHTML = `
                <div class="mission-status-badge badge-master">
                    <span>👑 MESTRE CAÇADOR</span>
                    <small>100.000 Kills Concluídas!</small>
                </div>
            `;
        } else if (isReadyToClaim) {
            actionBtnHTML = `
                <button type="button" class="mission-claim-btn ready-claim pulse-gold" data-zombie="${m.zombieId}">
                    <span class="btn-shine"></span>
                    <span class="btn-label">✨ REIVINDICAR</span>
                    <span class="btn-reward-preview">+${reward.gold.toLocaleString()} 🪙</span>
                </button>
            `;
        } else {
            actionBtnHTML = `
                <button type="button" class="mission-claim-btn in-progress" disabled>
                    <span>🔒 ${kills.toLocaleString()} / ${targetKills.toLocaleString()}</span>
                </button>
            `;
        }

        return `
            <div class="mission-card ${isReadyToClaim ? 'card-ready' : ''} ${isMaxCompleted ? 'card-master' : ''}">
                <div class="mission-card-top">
                    <div class="mission-avatar-wrap">
                        <img src="${iconSrc}" alt="${zombie.name}" class="mission-avatar-img">
                        <span class="mission-archetype-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="mission-info-col">
                        <div class="mission-title-row">
                            <h4 class="mission-zombie-name">${zombie.name}</h4>
                            <span class="mission-lifetime-kills">💀 ${kills.toLocaleString()} Kills</span>
                        </div>
                        <div class="mission-tier-indicator">
                            <span class="tier-pill">Tier ${isMaxCompleted ? '5/5' : `${currentTierNum}/5`}</span>
                            <span class="tier-target-label">Meta: <strong>${targetKills.toLocaleString()}</strong> eliminações</span>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mission-progress-block">
                    <div class="mission-progress-track">
                        <div class="mission-progress-fill ${isReadyToClaim ? 'fill-ready' : ''}" style="width: ${progressPercent}%;"></div>
                    </div>
                    <div class="mission-progress-labels">
                        <span>Progresso</span>
                        <span>${kills.toLocaleString()} / ${targetKills.toLocaleString()} (${progressPercent}%)</span>
                    </div>
                </div>

                <!-- Reward Details -->
                <div class="mission-reward-box">
                    <div class="reward-title-tag">RECOMPENSA DO MARCO:</div>
                    <div class="reward-chips-row">
                        <span class="reward-chip chip-gold">🪙 +${reward.gold.toLocaleString()} Ouro</span>
                        <span class="reward-chip chip-xp">⭐ +${reward.xp.toLocaleString()} XP</span>
                        <span class="reward-chip chip-title">🎖️ ${reward.title}</span>
                    </div>
                </div>

                <!-- Card Action Button -->
                <div class="mission-card-footer">
                    ${actionBtnHTML}
                </div>
            </div>
        `;
    }
}

window.MetaMissionSystem = MetaMissionSystem;
