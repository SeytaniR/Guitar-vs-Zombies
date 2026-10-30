// MetaMissionSystem - Procedural Zombie & Guitarist Meta Progression (v1.7.6 Build 48)
// Procedural scaling: 10 -> 100 -> 1,000 -> 10,000 -> 100,000 kills
// Automatically encompasses all current and newly added zombies and guitarists!

class MetaMissionSystem {
    constructor() {
        this.STORAGE_KEY = 'gvs_meta_missions';
        this.TIERS = [10, 100, 1000, 10000, 100000];
        this.MAX_TIER = 5;

        // In-memory state
        this.state = this.loadState();
        this.activeCategory = 'zombies'; // 'zombies' | 'guitarists'
        this.activeFilter = 'all';       // 'all' | 'ready' | 'active' | 'completed'
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
                    heroKills: parsed.heroKills || parsed.guitaristKills || {},
                    heroClaimedTiers: parsed.heroClaimedTiers || parsed.guitaristClaimedTiers || {},
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
            heroKills: {},
            heroClaimedTiers: {},
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

    // ==========================================
    // PROCEDURAL POOL DISCOVERY
    // ==========================================
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

    getAllGuitarists() {
        if (window.guitaristPool && Array.isArray(window.guitaristPool.guitarists)) {
            return window.guitaristPool.guitarists;
        }
        if (typeof GuitaristPoolSystem !== 'undefined') {
            const gp = new GuitaristPoolSystem();
            return gp.guitarists || [];
        }
        return [];
    }

    // ==========================================
    // PROCEDURAL REWARDS (Rebalanced: 10% of legacy base)
    // ==========================================
    getTierReward(tierIndex, zombieDef) {
        // Reduced by 90% from legacy values (1M -> 100k at Tier 5)
        const baseGold = [25, 150, 1200, 10000, 100000];
        const baseXP = [10, 60, 400, 3000, 25000];
        const titles = [
            'Iniciante 🥉',
            'Veterano 🥈',
            'Carrasco 🥇',
            'Mestre Lendário 💎',
            'DEUS DA CAÇADA 👑⚡'
        ];

        const t = Math.max(0, Math.min(this.MAX_TIER - 1, tierIndex));
        let diffMult = 1.0;
        if (zombieDef) {
            if (zombieDef.hp >= 300) diffMult = 1.45;
            else if (zombieDef.hp >= 200) diffMult = 1.25;
            else if (zombieDef.hp >= 150) diffMult = 1.15;

            if (zombieDef.badgeClass === 'badge-tank' || zombieDef.badgeClass === 'badge-danger') {
                diffMult = Math.max(diffMult, 1.3);
            }
        }

        const gold = Math.max(5, Math.round(baseGold[t] * diffMult));
        const xp = Math.max(2, Math.round(baseXP[t] * diffMult));
        const title = titles[t];

        return { gold, xp, title, tier: t + 1, target: this.TIERS[t] };
    }

    getGuitaristTierReward(tierIndex, heroDef) {
        // Same procedural scaling as rebalanced zombie bounties
        const baseGold = [25, 150, 1200, 10000, 100000];
        const baseXP = [10, 60, 400, 3000, 25000];
        const titles = [
            'Rocker Iniciante 🥉',
            'Rocker Veterano 🥈',
            'Virtuoso do Palco 🥇',
            'Lenda da Guitarra 💎',
            'DEUS DO ROCK 👑⚡'
        ];

        const t = Math.max(0, Math.min(this.MAX_TIER - 1, tierIndex));
        let rarityMult = 1.0;
        if (heroDef) {
            if (heroDef.rarityKey === 'legendary') rarityMult = 1.35;
            else if (heroDef.rarityKey === 'epic') rarityMult = 1.20;
            else if (heroDef.rarityKey === 'rare') rarityMult = 1.10;
        }

        const gold = Math.max(5, Math.round(baseGold[t] * rarityMult));
        const xp = Math.max(2, Math.round(baseXP[t] * rarityMult));
        const title = titles[t];

        return { gold, xp, title, tier: t + 1, target: this.TIERS[t] };
    }

    // ==========================================
    // MISSION QUERIES
    // ==========================================
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
        const claimedTier = this.state.claimedTiers[zombieId] || 0;

        const isMaxCompleted = claimedTier >= this.MAX_TIER;
        const currentTierIndex = Math.min(this.MAX_TIER - 1, claimedTier);
        const targetKills = this.TIERS[currentTierIndex];
        const prevTarget = currentTierIndex > 0 ? this.TIERS[currentTierIndex - 1] : 0;
        const isReadyToClaim = !isMaxCompleted && totalKills >= targetKills;

        const progressPercent = isMaxCompleted ? 100 : Math.min(100, Math.floor((totalKills / targetKills) * 100));
        const currentReward = this.getTierReward(currentTierIndex, zombieDef);

        return {
            category: 'zombies',
            id: zombieId,
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

    getGuitaristMission(heroIdOrDef) {
        let heroDef = null;
        let heroId = null;

        if (typeof heroIdOrDef === 'string') {
            heroId = heroIdOrDef;
            heroDef = this.getAllGuitarists().find(h => h.id === heroId);
        } else if (heroIdOrDef && typeof heroIdOrDef === 'object') {
            heroDef = heroIdOrDef;
            heroId = heroDef.id;
        }

        if (!heroId) return null;

        const totalKills = this.state.heroKills[heroId] || 0;
        const claimedTier = this.state.heroClaimedTiers[heroId] || 0;

        const isMaxCompleted = claimedTier >= this.MAX_TIER;
        const currentTierIndex = Math.min(this.MAX_TIER - 1, claimedTier);
        const targetKills = this.TIERS[currentTierIndex];
        const prevTarget = currentTierIndex > 0 ? this.TIERS[currentTierIndex - 1] : 0;
        const isReadyToClaim = !isMaxCompleted && totalKills >= targetKills;

        const progressPercent = isMaxCompleted ? 100 : Math.min(100, Math.floor((totalKills / targetKills) * 100));
        const currentReward = this.getGuitaristTierReward(currentTierIndex, heroDef);

        return {
            category: 'guitarists',
            id: heroId,
            heroId,
            hero: heroDef || {
                id: heroId,
                name: heroId.replace('_', ' ').toUpperCase(),
                icon: 'assets/heroes/johnny_blaze.jpg',
                rarity: 'COMUM',
                badgeClass: 'badge-common',
                instrument: 'Guitarra Elétrica'
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

    getAllZombieMissions() {
        return this.getAllZombies().map(z => this.getZombieMission(z)).filter(Boolean);
    }

    getAllGuitaristMissions() {
        return this.getAllGuitarists().map(h => this.getGuitaristMission(h)).filter(Boolean);
    }

    getAllMissions() {
        return this.getAllZombieMissions();
    }

    // ==========================================
    // KILL TRACKING
    // ==========================================
    recordKill(zombieOrId, heroOrId = null) {
        // 1. Record Zombie Extermination
        let zombieId = null;
        let zombieName = null;
        if (typeof zombieOrId === 'string') {
            zombieId = zombieOrId;
        } else if (zombieOrId && typeof zombieOrId === 'object') {
            zombieId = zombieOrId.enemyId || zombieOrId.id || zombieOrId.type;
            zombieName = zombieOrId.baseName || zombieOrId.name;
        }

        if (zombieId) {
            const currentKills = (this.state.kills[zombieId] || 0) + 1;
            this.state.kills[zombieId] = currentKills;
            const claimedTier = this.state.claimedTiers[zombieId] || 0;
            if (claimedTier < this.MAX_TIER && currentKills === this.TIERS[claimedTier]) {
                this.onMilestoneReached(zombieId, zombieName, currentKills, 'zombie');
            }
        }

        // 2. Record Active Guitarist Elimination (Any zombie kill counts for active guitarist)
        let heroId = heroOrId;
        if (!heroId && window.combat && typeof window.combat.getActiveHeroData === 'function') {
            const h = window.combat.getActiveHeroData();
            if (h) heroId = h.id;
        }
        if (!heroId && window.guitaristPool) {
            heroId = window.guitaristPool.selectedHeroId || window.guitaristPool.activeHeroId;
        }

        if (heroId) {
            this.recordGuitaristKill(heroId);
        } else {
            this.saveState();
            this.updateBadgeCounter();
        }
    }

    recordGuitaristKill(heroId) {
        if (!heroId) return;
        const currentHeroKills = (this.state.heroKills[heroId] || 0) + 1;
        this.state.heroKills[heroId] = currentHeroKills;

        const claimedTier = this.state.heroClaimedTiers[heroId] || 0;
        if (claimedTier < this.MAX_TIER && currentHeroKills === this.TIERS[claimedTier]) {
            const heroDef = this.getAllGuitarists().find(h => h.id === heroId);
            const heroName = heroDef ? heroDef.name : heroId;
            this.onMilestoneReached(heroId, heroName, currentHeroKills, 'guitarist');
        }

        this.saveState();
        this.updateBadgeCounter();
    }

    onMilestoneReached(entityId, entityName, kills, type = 'zombie') {
        const name = entityName || entityId;
        if (window.combat && typeof window.combat.addFloatingText === 'function') {
            const cx = window.combat.canvas ? window.combat.canvas.width / 2 : 200;
            const cy = window.combat.canvas ? window.combat.canvas.height * 0.28 : 120;
            const label = type === 'guitarist'
                ? `🎸 MESTRIA: ${name} (${kills.toLocaleString()} Kills)!`
                : `🎯 META CONCLUÍDA: ${name} (${kills.toLocaleString()} Kills)!`;
            window.combat.addFloatingText(label, cx, cy, '#ffd700', true);
            if (window.soundEngine && typeof window.soundEngine.playLevelUp === 'function') {
                window.soundEngine.playLevelUp();
            }
        }
    }

    // ==========================================
    // CLAIMING REWARDS
    // ==========================================
    claimZombieReward(zombieId) {
        const mission = this.getZombieMission(zombieId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;
        this.grantRewards(reward);

        const nextClaimed = mission.claimedTier + 1;
        this.state.claimedTiers[zombieId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();

        this.playClaimSfx();
        this.updateBadgeCounter();
        this.render();

        return {
            success: true,
            id: zombieId,
            zombieId,
            category: 'zombies',
            claimedTier: nextClaimed,
            reward,
            isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimGuitaristReward(heroId) {
        const mission = this.getGuitaristMission(heroId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;
        // Specifically grant hero XP to this guitarist!
        if (window.guitaristPool && typeof window.guitaristPool.addHeroXp === 'function') {
            window.guitaristPool.addHeroXp(heroId, reward.xp);
        }
        if (window.talentSystem && typeof window.talentSystem.addGold === 'function') {
            window.talentSystem.addGold(reward.gold);
        } else if (window.game) {
            window.game.gold = (window.game.gold || 0) + reward.gold;
            if (typeof window.game.saveState === 'function') window.game.saveState();
        }

        const nextClaimed = mission.claimedTier + 1;
        this.state.heroClaimedTiers[heroId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();

        this.playClaimSfx();
        this.updateBadgeCounter();
        this.render();

        return {
            success: true,
            id: heroId,
            heroId,
            category: 'guitarists',
            claimedTier: nextClaimed,
            reward,
            isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimReward(idOrType, maybeId = null) {
        if (maybeId) {
            return (idOrType === 'guitarist' || idOrType === 'guitarists')
                ? this.claimGuitaristReward(maybeId)
                : this.claimZombieReward(maybeId);
        }
        const zRes = this.claimZombieReward(idOrType);
        if (zRes) return zRes;
        return this.claimGuitaristReward(idOrType);
    }

    grantRewards(reward) {
        if (window.talentSystem && typeof window.talentSystem.addGold === 'function') {
            window.talentSystem.addGold(reward.gold);
        } else if (window.game) {
            window.game.gold = (window.game.gold || 0) + reward.gold;
            if (typeof window.game.saveState === 'function') window.game.saveState();
        }

        if (window.guitaristPool && typeof window.guitaristPool.addHeroXp === 'function') {
            const activeHero = window.combat
                ? window.combat.getActiveHeroData()
                : (window.guitaristPool.getActiveHero ? window.guitaristPool.getActiveHero() : null);
            if (activeHero) {
                window.guitaristPool.addHeroXp(activeHero.id, reward.xp);
            }
        }
    }

    playClaimSfx() {
        if (window.soundEngine) {
            if (typeof window.soundEngine.playStageClear === 'function') {
                window.soundEngine.playStageClear();
            } else if (typeof window.soundEngine.playExplosion === 'function') {
                window.soundEngine.playExplosion();
            }
        }
    }

    claimAllRewards(category = null) {
        const cat = category || this.activeCategory;
        let missionsToClaim = [];

        if (cat === 'all') {
            missionsToClaim = [
                ...this.getAllZombieMissions().filter(m => m.isReadyToClaim),
                ...this.getAllGuitaristMissions().filter(m => m.isReadyToClaim)
            ];
        } else if (cat === 'guitarists') {
            missionsToClaim = this.getAllGuitaristMissions().filter(m => m.isReadyToClaim);
        } else {
            missionsToClaim = this.getAllZombieMissions().filter(m => m.isReadyToClaim);
        }

        if (missionsToClaim.length === 0) return { count: 0, totalGold: 0, totalXp: 0 };

        let totalGold = 0;
        let totalXp = 0;

        missionsToClaim.forEach(m => {
            const res = m.category === 'guitarists'
                ? this.claimGuitaristReward(m.heroId)
                : this.claimZombieReward(m.zombieId);
            if (res && res.success) {
                totalGold += res.reward.gold;
                totalXp += res.reward.xp;
            }
        });

        this.render();
        return { count: missionsToClaim.length, totalGold, totalXp };
    }

    getPendingClaimsCount(category = null) {
        if (category === 'zombies') {
            return this.getAllZombieMissions().filter(m => m.isReadyToClaim).length;
        }
        if (category === 'guitarists') {
            return this.getAllGuitaristMissions().filter(m => m.isReadyToClaim).length;
        }
        return this.getAllZombieMissions().filter(m => m.isReadyToClaim).length +
               this.getAllGuitaristMissions().filter(m => m.isReadyToClaim).length;
    }

    updateBadgeCounter() {
        if (typeof document === 'undefined') return;
        const totalPending = this.getPendingClaimsCount();
        const badge = document.getElementById('menu-missions-badge');
        if (badge) {
            badge.innerText = totalPending.toString();
            if (badge.classList) {
                if (totalPending > 0) {
                    badge.classList.remove('hidden');
                    badge.classList.add('pulse-badge');
                } else {
                    badge.classList.add('hidden');
                    badge.classList.remove('pulse-badge');
                }
            }
        }

        const currentCatPending = this.getPendingClaimsCount(this.activeCategory);
        const claimAllBtn = document.getElementById('missions-claim-all-btn');
        if (claimAllBtn) {
            claimAllBtn.disabled = (currentCatPending === 0);
            claimAllBtn.innerText = currentCatPending > 0
                ? `✨ REIVINDICAR (${currentCatPending})`
                : '✨ REIVINDICAR TODAS';
        }

        // Update category sub-badges
        const zCount = this.getPendingClaimsCount('zombies');
        const hCount = this.getPendingClaimsCount('guitarists');
        const zTabBadge = document.getElementById('cat-badge-zombies');
        const hTabBadge = document.getElementById('cat-badge-guitarists');
        if (zTabBadge) {
            zTabBadge.innerText = zCount > 0 ? `(${zCount})` : '';
            if (zTabBadge.style) zTabBadge.style.display = zCount > 0 ? 'inline' : 'none';
        }
        if (hTabBadge) {
            hTabBadge.innerText = hCount > 0 ? `(${hCount})` : '';
            if (hTabBadge.style) hTabBadge.style.display = hCount > 0 ? 'inline' : 'none';
        }
    }

    // ==========================================
    // DOM & UI RENDERING
    // ==========================================
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

        // Category Switcher Tabs
        if (modal && typeof modal.querySelectorAll === 'function') {
            const catBtns = modal.querySelectorAll('.missions-cat-tab');
            catBtns.forEach(btn => {
                btn.onclick = () => {
                    catBtns.forEach(b => b.classList && b.classList.remove('active'));
                    if (btn.classList) btn.classList.add('active');
                    this.activeCategory = (btn.dataset && btn.dataset.cat) ? btn.dataset.cat : 'zombies';
                    this.render();
                };
            });

            // Filter Tabs
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
        if (modal && modal.classList) {
            modal.classList.remove('open');
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
        const isGuitarists = (this.activeCategory === 'guitarists');
        const missions = isGuitarists ? this.getAllGuitaristMissions() : this.getAllZombieMissions();

        const killsDict = isGuitarists ? this.state.heroKills : this.state.kills;
        const totalKills = Object.values(killsDict).reduce((a, b) => a + (Number(b) || 0), 0);
        const maxCompletedCount = missions.filter(m => m.isMaxCompleted).length;
        const totalClaimedGold = this.state.totalClaimedGold || 0;

        const statKills = document.getElementById('missions-stat-kills');
        const statGold = document.getElementById('missions-stat-gold');
        const statCompleted = document.getElementById('missions-stat-completed');
        const statKillsLabel = document.getElementById('missions-stat-kills-label');

        if (statKills) statKills.innerText = totalKills.toLocaleString();
        if (statKillsLabel) statKillsLabel.innerText = isGuitarists ? 'Kills Heróis:' : 'Kills Hordas:';
        if (statGold) statGold.innerText = totalClaimedGold.toLocaleString();
        if (statCompleted) statCompleted.innerText = `${maxCompletedCount} / ${missions.length}`;
    }

    renderCards() {
        const container = document.getElementById('missions-cards-grid');
        if (!container) return;

        const isGuitarists = (this.activeCategory === 'guitarists');
        let missions = isGuitarists ? this.getAllGuitaristMissions() : this.getAllZombieMissions();

        // Search Filter
        if (this.searchQuery) {
            missions = missions.filter(m => {
                const name = (m.zombie ? m.zombie.name : (m.hero ? m.hero.name : '')).toLowerCase();
                const badge = (m.zombie ? m.zombie.badge : (m.hero ? m.hero.rarity : '')).toLowerCase();
                return name.includes(this.searchQuery) || badge.includes(this.searchQuery);
            });
        }

        // Tab Filter
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
                    <span class="empty-icon">${isGuitarists ? '🎸' : '🧟'}</span>
                    <p>Nenhuma missão meta encontrada para o filtro selecionado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = missions.map(m => isGuitarists ? this.createHeroCardHTML(m) : this.createCardHTML(m)).join('');

        if (container && typeof container.querySelectorAll === 'function') {
            container.querySelectorAll('.mission-claim-btn[data-zombie]').forEach(btn => {
                btn.onclick = () => {
                    const zombieId = btn.dataset ? btn.dataset.zombie : null;
                    if (zombieId) this.claimZombieReward(zombieId);
                };
            });
            container.querySelectorAll('.mission-claim-btn[data-hero]').forEach(btn => {
                btn.onclick = () => {
                    const heroId = btn.dataset ? btn.dataset.hero : null;
                    if (heroId) this.claimGuitaristReward(heroId);
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

                <div class="mission-progress-block">
                    <div class="mission-progress-track">
                        <div class="mission-progress-fill ${isReadyToClaim ? 'fill-ready' : ''}" style="width: ${progressPercent}%;"></div>
                    </div>
                    <div class="mission-progress-labels">
                        <span>Progresso</span>
                        <span>${kills.toLocaleString()} / ${targetKills.toLocaleString()} (${progressPercent}%)</span>
                    </div>
                </div>

                <div class="mission-reward-box">
                    <div class="reward-title-tag">RECOMPENSA DO MARCO:</div>
                    <div class="reward-chips-row">
                        <span class="reward-chip chip-gold">🪙 +${reward.gold.toLocaleString()} Ouro</span>
                        <span class="reward-chip chip-xp">⭐ +${reward.xp.toLocaleString()} XP</span>
                        <span class="reward-chip chip-title">🎖️ ${reward.title}</span>
                    </div>
                </div>

                <div class="mission-card-footer">
                    ${actionBtnHTML}
                </div>
            </div>
        `;
    }

    createHeroCardHTML(m) {
        const { hero, kills, targetKills, progressPercent, isReadyToClaim, isMaxCompleted, reward, currentTierNum } = m;
        const iconSrc = hero.icon || 'assets/heroes/johnny_blaze.jpg';
        const badgeText = hero.rarity || 'HERÓI';
        const badgeClass = hero.badgeClass || 'badge-common';

        let actionBtnHTML = '';
        if (isMaxCompleted) {
            actionBtnHTML = `
                <div class="mission-status-badge badge-master">
                    <span>👑 LENDA DO ROCK</span>
                    <small>100.000 Kills Concluídas!</small>
                </div>
            `;
        } else if (isReadyToClaim) {
            actionBtnHTML = `
                <button type="button" class="mission-claim-btn ready-claim pulse-gold" data-hero="${m.heroId}">
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
            <div class="mission-card hero-mission-card ${isReadyToClaim ? 'card-ready' : ''} ${isMaxCompleted ? 'card-master' : ''}">
                <div class="mission-card-top">
                    <div class="mission-avatar-wrap hero-avatar-wrap">
                        <img src="${iconSrc}" alt="${hero.name}" class="mission-avatar-img hero-avatar-img">
                        <span class="mission-archetype-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="mission-info-col">
                        <div class="mission-title-row">
                            <h4 class="mission-zombie-name hero-name">${hero.name}</h4>
                            <span class="mission-lifetime-kills hero-kills">🎸 ${kills.toLocaleString()} Kills</span>
                        </div>
                        <div class="mission-tier-indicator">
                            <span class="tier-pill hero-tier-pill">Tier ${isMaxCompleted ? '5/5' : `${currentTierNum}/5`}</span>
                            <span class="tier-target-label">Meta: <strong>${targetKills.toLocaleString()}</strong> eliminações totais</span>
                        </div>
                    </div>
                </div>

                <div class="mission-progress-block">
                    <div class="mission-progress-track">
                        <div class="mission-progress-fill hero-fill ${isReadyToClaim ? 'fill-ready' : ''}" style="width: ${progressPercent}%;"></div>
                    </div>
                    <div class="mission-progress-labels">
                        <span>${hero.instrument || 'Guitarra'}</span>
                        <span>${kills.toLocaleString()} / ${targetKills.toLocaleString()} (${progressPercent}%)</span>
                    </div>
                </div>

                <div class="mission-reward-box">
                    <div class="reward-title-tag">MESTRIA DO GUITARRISTA:</div>
                    <div class="reward-chips-row">
                        <span class="reward-chip chip-gold">🪙 +${reward.gold.toLocaleString()} Ouro</span>
                        <span class="reward-chip chip-xp">⭐ +${reward.xp.toLocaleString()} XP Herói</span>
                        <span class="reward-chip chip-title hero-title">🎖️ ${reward.title}</span>
                    </div>
                </div>

                <div class="mission-card-footer">
                    ${actionBtnHTML}
                </div>
            </div>
        `;
    }
}

window.MetaMissionSystem = MetaMissionSystem;
