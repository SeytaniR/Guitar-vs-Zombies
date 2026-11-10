// MetaMissionSystem - Procedural Zombie, Guitarist & Performance Progression (v1.7.9 Build 51)
// Procedural scaling: Zombie & Guitarist (10 -> 100 -> 1k -> 10k -> 100k)
// Performance: Unbelievable, Critical Hits, 90%+ Accuracy, 100% Full Combo, Max Streak, Tour Shows

class MetaMissionSystem {
    constructor() {
        this.STORAGE_KEY = 'gvs_meta_missions';
        this.TIERS = [10, 100, 1000, 10000, 100000];
        this.MAX_TIER = 5;

        this.state = this.loadState();
        this.activeCategory = 'zombies'; // 'zombies' | 'guitarists' | 'performance'
        this.activeFilter = 'all';       // 'all' | 'ready' | 'active' | 'completed'
        this.searchQuery = '';
        if (typeof window !== 'undefined') {
            window.metaMissionSystem = this;
            window.metaMissions = this;
        }

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
                    performanceStats: parsed.performanceStats || {},
                    performanceClaimedTiers: parsed.performanceClaimedTiers || {},
                    totalClaimedGold: parsed.totalClaimedGold || 0,
                    totalClaimedXp: parsed.totalClaimedXp || 0
                };
            }
        } catch (e) {
            console.warn('Failed to parse meta missions state:', e);
        }
        return {
            kills: {}, claimedTiers: {},
            heroKills: {}, heroClaimedTiers: {},
            performanceStats: {}, performanceClaimedTiers: {},
            totalClaimedGold: 0, totalClaimedXp: 0
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
        if (window.enemyPool && Array.isArray(window.enemyPool.masterPool)) return window.enemyPool.masterPool;
        if (typeof EnemyPoolSystem !== 'undefined') return new EnemyPoolSystem().masterPool || [];
        return [];
    }

    getAllGuitarists() {
        if (window.guitaristPool && Array.isArray(window.guitaristPool.guitarists)) return window.guitaristPool.guitarists;
        if (typeof GuitaristPoolSystem !== 'undefined') return new GuitaristPoolSystem().guitarists || [];
        return [];
    }

    getPerformanceDefinitions() {
        return [
            {
                id: 'unbelievable', name: 'Acertos UNBELIEVABLE!', badge: 'RITMO', badgeClass: 'badge-legendary',
                icon: 'assets/talents/lightning_note.jpg', desc: 'Acertos no centro exato da pista ou multikills 7x.', unitLabel: 'Acertos',
                tiers: [10, 100, 1000, 10000, 100000],
                rewards: [{ gold: 15, xp: 10, title: 'Pulso Firme 🥉' }, { gold: 80, xp: 40, title: 'Ouvido Absoluto 🥈' }, { gold: 500, xp: 200, title: 'Mestre do Ritmo 🥇' }, { gold: 3500, xp: 1200, title: 'Fenômeno Sônico 💎' }, { gold: 25000, xp: 8000, title: 'DEUS DO RITMO 👑⚡' }]
            },
            {
                id: 'critical_hits', name: 'Disparos Críticos', badge: 'COMBATE', badgeClass: 'badge-danger',
                icon: 'assets/talents/skull_crit.jpg', desc: 'Tiros sônicos com Dano Crítico causados nos zumbis.', unitLabel: 'Críticos',
                tiers: [10, 100, 1000, 10000, 100000],
                rewards: [{ gold: 15, xp: 10, title: 'Mira Certeira 🥉' }, { gold: 80, xp: 40, title: 'Destruidor Sônico 🥈' }, { gold: 500, xp: 200, title: 'Impacto Fatal 🥇' }, { gold: 3500, xp: 1200, title: 'Cataclismo de Riffs 💎' }, { gold: 25000, xp: 8000, title: 'DEUS DO CRÍTICO 👑⚡' }]
            },
            {
                id: 'high_accuracy_songs', name: 'Shows com Precisão ≥ 90%', badge: 'SHOW', badgeClass: 'badge-tank',
                icon: 'assets/talents/guitar_power.jpg', desc: 'Shows concluídos com precisão de ritmo igual ou superior a 90%.', unitLabel: 'Shows',
                tiers: [1, 5, 20, 50, 150],
                rewards: [{ gold: 25, xp: 15, title: 'Show Impecável 🥉' }, { gold: 120, xp: 60, title: 'Espetáculo Limpo 🥈' }, { gold: 750, xp: 350, title: 'Perfeccionista do Palco 🥇' }, { gold: 5000, xp: 2000, title: 'Sinfonia Sem Falhas 💎' }, { gold: 35000, xp: 12000, title: 'MAESTRO ABSOLUTO 👑⚡' }]
            },
            {
                id: 'perfect_accuracy_songs', name: 'Shows Perfeitos (100% FC)', badge: 'FULL COMBO', badgeClass: 'badge-legendary',
                icon: 'assets/talents/gold_pick.jpg', desc: 'Músicas finalizadas sem errar nenhuma nota (100% Full Combo).', unitLabel: 'Shows 100%',
                tiers: [1, 3, 10, 25, 60],
                rewards: [{ gold: 30, xp: 20, title: 'Primeiro Full Combo 🥉' }, { gold: 150, xp: 80, title: 'Mãos de Aço 🥈' }, { gold: 1000, xp: 500, title: 'Virtuoso Sem Erros 🥇' }, { gold: 6000, xp: 2500, title: 'Lenda dos Teclados 💎' }, { gold: 40000, xp: 15000, title: 'DEUS DO FULL COMBO 👑⚡' }]
            },
            {
                id: 'max_streak', name: 'Maior Combo de Notas', badge: 'COMBO', badgeClass: 'badge-rusher',
                icon: 'assets/talents/amp_shield.jpg', desc: 'Sequência ininterrupta máxima de notas acertadas no ritmo.', unitLabel: 'Notas Seguidas', isPeakStat: true,
                tiers: [25, 50, 100, 250, 500],
                rewards: [{ gold: 20, xp: 15, title: 'No Embalo 🥉' }, { gold: 100, xp: 50, title: 'Sequência Incandescente 🥈' }, { gold: 600, xp: 250, title: 'Combo Destruidor 🥇' }, { gold: 4000, xp: 1500, title: 'Fúria Rítmica 💎' }, { gold: 30000, xp: 10000, title: 'COMBO INFINITO 👑⚡' }]
            },
            {
                id: 'songs_completed', name: 'Shows Realizados na Turnê', badge: 'TURNÊ', badgeClass: 'badge-common',
                icon: 'assets/branding/app-icon.png', desc: 'Total de músicas e shows finalizados até o acorde final.', unitLabel: 'Shows',
                tiers: [1, 5, 20, 60, 150],
                rewards: [{ gold: 15, xp: 10, title: 'Primeiro Show 🥉' }, { gold: 80, xp: 40, title: 'Banda de Garagem 🥈' }, { gold: 500, xp: 200, title: 'Estrela Local 🥇' }, { gold: 3000, xp: 1000, title: 'Headliner de Festival 💎' }, { gold: 20000, xp: 7000, title: 'TURNÊ MUNDIAL 👑⚡' }]
            }
        ];
    }

    getPvPDefinitions() {
        return [
            {
                id: 'pvp_matches', name: 'Duelos PvP Disputados', badge: 'PVP', badgeClass: 'badge-legendary',
                icon: 'assets/branding/app-icon.png', desc: 'Participe de duelos rítmicos online no confronto de palcos.', unitLabel: 'Duelos',
                tiers: [1, 5, 20, 50, 150],
                rewards: [{ gold: 30, xp: 25, title: 'Desafiante do Palco 🥉' }, { gold: 120, xp: 80, title: 'Duelista Assíduo 🥈' }, { gold: 600, xp: 350, title: 'Veterano da Arena 🥇' }, { gold: 3500, xp: 1500, title: 'Gladiador Sônico 💎' }, { gold: 25000, xp: 8000, title: 'LENDA DO PVP 👑⚡' }]
            },
            {
                id: 'pvp_wins', name: 'Vitórias em Duelo PvP', badge: 'VITÓRIA', badgeClass: 'badge-tank',
                icon: 'assets/talents/guitar_power.jpg', desc: 'Vença duelos PvP por nocaute ou pontuação rítmica superior.', unitLabel: 'Vitórias',
                tiers: [1, 3, 10, 30, 100],
                rewards: [{ gold: 45, xp: 35, title: 'Primeira Conquista 🥉' }, { gold: 150, xp: 100, title: 'Dominador do Riff 🥈' }, { gold: 800, xp: 450, title: 'Campeão da Arena 🥇' }, { gold: 5000, xp: 2200, title: 'Soberano dos Duelos 💎' }, { gold: 35000, xp: 12000, title: 'IMORTAL DO PALCO 👑⚡' }]
            },
            {
                id: 'pvp_kos', name: 'Nocautes de Guitarrista (KOs)', badge: 'NOCAUTE', badgeClass: 'badge-danger',
                icon: 'assets/talents/skull_crit.jpg', desc: 'Derrube todo o HP do oponente antes do encerramento da música.', unitLabel: 'KOs',
                tiers: [1, 3, 8, 20, 50],
                rewards: [{ gold: 40, xp: 30, title: 'Golpe Brutal 🥉' }, { gold: 140, xp: 90, title: 'Solo Destruidor 🥈' }, { gold: 750, xp: 400, title: 'Carrasco de Riffs 🥇' }, { gold: 4500, xp: 2000, title: 'Devastador Sônico 💎' }, { gold: 30000, xp: 10000, title: 'MESTRE DO NOCAUTE 👑⚡' }]
            },
            {
                id: 'pvp_heals', name: 'Cura Cruzada Tática', badge: 'TÁTICA', badgeClass: 'badge-rusher',
                icon: 'assets/talents/lightning_note.jpg', desc: 'Dispare tiros livres na pista para curar e sobrecarregar o oponente.', unitLabel: 'Curas',
                tiers: [5, 25, 100, 300, 1000],
                rewards: [{ gold: 25, xp: 20, title: 'Sobrecarga Tática 🥉' }, { gold: 100, xp: 60, title: 'Estrategista Verde 🥈' }, { gold: 550, xp: 280, title: 'Mestre da Sabotagem 🥇' }, { gold: 3000, xp: 1400, title: 'Caos Cruzado 💎' }, { gold: 20000, xp: 7000, title: 'ALQUIMISTA SÔNICO 👑⚡' }]
            },
            {
                id: 'pvp_high_score', name: 'Pontuação Épica no PvP', badge: 'PLACAR', badgeClass: 'badge-legendary',
                icon: 'assets/talents/gold_pick.jpg', desc: 'Atinja pontuações altas em partidas individuais de PvP.', unitLabel: 'Pontos', isPeakStat: true,
                tiers: [10000, 25000, 50000, 100000, 200000],
                rewards: [{ gold: 25, xp: 20, title: 'Ritmo de Elite 🥉' }, { gold: 110, xp: 70, title: 'Show Competitivo 🥈' }, { gold: 650, xp: 320, title: 'Virtuoso Pontuador 🥇' }, { gold: 4000, xp: 1800, title: 'Pontuação Suprema 💎' }, { gold: 30000, xp: 10000, title: 'PONTUAÇÃO DIVINA 👑⚡' }]
            },
            {
                id: 'pvp_zombie_kills', name: 'Zumbis Abatidos no PvP', badge: 'DEFESA', badgeClass: 'badge-common',
                icon: 'assets/zombies/punk_walker.jpg', desc: 'Destrua os zumbis que marcham pela sua pista durante confrontos PvP.', unitLabel: 'Abates',
                tiers: [10, 50, 200, 600, 2000],
                rewards: [{ gold: 20, xp: 15, title: 'Guardião da Pista 🥉' }, { gold: 90, xp: 50, title: 'Defensor Firme 🥈' }, { gold: 500, xp: 250, title: 'Exterminador do Duelo 🥇' }, { gold: 3200, xp: 1200, title: 'Muralha Rítmica 💎' }, { gold: 22000, xp: 7500, title: 'FLAGELO DOS MORTOS 👑⚡' }]
            }
        ];
    }

    getTierReward(tierIndex, zombieDef) {
        const baseGold = [25, 150, 1200, 10000, 100000];
        const baseXP = [10, 60, 400, 3000, 25000];
        const titles = ['Iniciante 🥉', 'Veterano 🥈', 'Carrasco 🥇', 'Mestre Lendário 💎', 'DEUS DA CAÇADA 👑⚡'];
        const t = Math.max(0, Math.min(this.MAX_TIER - 1, tierIndex));
        let diffMult = 1.0;
        if (zombieDef) {
            if (zombieDef.hp >= 300) diffMult = 1.45;
            else if (zombieDef.hp >= 200) diffMult = 1.25;
            else if (zombieDef.hp >= 150) diffMult = 1.15;
            if (zombieDef.badgeClass === 'badge-tank' || zombieDef.badgeClass === 'badge-danger') diffMult = Math.max(diffMult, 1.3);
        }
        const gold = Math.max(5, Math.round(baseGold[t] * diffMult));
        const xp = Math.max(2, Math.round(baseXP[t] * diffMult));
        return { gold, xp, title: titles[t], tier: t + 1, target: this.TIERS[t] };
    }

    getGuitaristTierReward(tierIndex, heroDef) {
        const baseGold = [25, 150, 1200, 10000, 100000];
        const baseXP = [10, 60, 400, 3000, 25000];
        const titles = ['Rocker Iniciante 🥉', 'Rocker Veterano 🥈', 'Virtuoso do Palco 🥇', 'Lenda da Guitarra 💎', 'DEUS DO ROCK 👑⚡'];
        const t = Math.max(0, Math.min(this.MAX_TIER - 1, tierIndex));
        let rarityMult = 1.0;
        if (heroDef) {
            if (heroDef.rarityKey === 'legendary') rarityMult = 1.35;
            else if (heroDef.rarityKey === 'epic') rarityMult = 1.20;
            else if (heroDef.rarityKey === 'rare') rarityMult = 1.10;
        }
        const gold = Math.max(5, Math.round(baseGold[t] * rarityMult));
        const xp = Math.max(2, Math.round(baseXP[t] * rarityMult));
        return { gold, xp, title: titles[t], tier: t + 1, target: this.TIERS[t] };
    }

    getZombieMission(zombieIdOrDef) {
        let zombieDef = null, zombieId = null;
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

        const zObj = zombieDef || {
            id: zombieId,
            name: zombieId.replace('_', ' ').toUpperCase(),
            icon: 'assets/zombies/punk_walker.jpg',
            badge: 'ZUMBI', badgeClass: 'badge-common',
            desc: 'Alvo de caçada procedural.'
        };

        return {
            category: 'zombies', id: zombieId, zombieId, zombie: zObj,
            name: zObj.name, icon: zObj.icon || 'assets/zombies/punk_walker.jpg',
            badgeText: zObj.badge || 'ZUMBI', badgeClass: zObj.badgeClass || 'badge-common',
            desc: zObj.desc || 'Eliminação da horda zumbi.', unitLabel: 'Kills',
            currentVal: totalKills, targetVal: targetKills, kills: totalKills,
            claimedTier, currentTierIndex, currentTierNum: currentTierIndex + 1,
            targetKills, prevTarget, progressPercent, isReadyToClaim, isMaxCompleted,
            reward: currentReward, allTiers: this.TIERS
        };
    }

    getGuitaristMission(heroIdOrDef) {
        let heroDef = null, heroId = null;
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

        const hObj = heroDef || {
            id: heroId,
            name: heroId.replace('_', ' ').toUpperCase(),
            icon: 'assets/heroes/johnny_blaze.jpg',
            rarity: 'COMUM', badgeClass: 'badge-common', instrument: 'Guitarra Elétrica'
        };

        return {
            category: 'guitarists', id: heroId, heroId, hero: hObj,
            name: hObj.name, icon: hObj.icon || 'assets/heroes/johnny_blaze.jpg',
            badgeText: hObj.rarity || 'HERÓI', badgeClass: hObj.badgeClass || 'badge-common',
            desc: hObj.instrument || 'Guitarra Elétrica', unitLabel: 'Kills',
            currentVal: totalKills, targetVal: targetKills, kills: totalKills,
            claimedTier, currentTierIndex, currentTierNum: currentTierIndex + 1,
            targetKills, prevTarget, progressPercent, isReadyToClaim, isMaxCompleted,
            reward: currentReward, allTiers: this.TIERS
        };
    }

    getPerformanceMission(statIdOrDef) {
        let def = null;
        if (typeof statIdOrDef === 'string') {
            def = this.getPerformanceDefinitions().find(d => d.id === statIdOrDef) || this.getPvPDefinitions().find(d => d.id === statIdOrDef);
        } else if (statIdOrDef && typeof statIdOrDef === 'object') {
            def = statIdOrDef;
        }
        if (!def) return null;

        const currentVal = this.state.performanceStats[def.id] || 0;
        const claimedTier = this.state.performanceClaimedTiers[def.id] || 0;
        const isMaxCompleted = claimedTier >= this.MAX_TIER;
        const currentTierIndex = Math.min(this.MAX_TIER - 1, claimedTier);
        const targetVal = def.tiers[currentTierIndex];
        const isReadyToClaim = !isMaxCompleted && currentVal >= targetVal;
        const progressPercent = isMaxCompleted ? 100 : Math.min(100, Math.floor((currentVal / targetVal) * 100));
        const rew = def.rewards[currentTierIndex];
        const reward = { gold: rew.gold, xp: rew.xp, title: rew.title, tier: currentTierIndex + 1, target: targetVal };

        return {
            category: (def.id && def.id.startsWith('pvp_')) ? 'pvp' : 'performance', id: def.id, statId: def.id,
            name: def.name, icon: def.icon, badgeText: def.badge, badgeClass: def.badgeClass,
            desc: def.desc, unitLabel: def.unitLabel, currentVal, targetVal,
            claimedTier, currentTierIndex, currentTierNum: currentTierIndex + 1,
            progressPercent, isReadyToClaim, isMaxCompleted, reward, allTiers: def.tiers
        };
    }

    getAllZombieMissions() {
        return this.getAllZombies().map(z => this.getZombieMission(z)).filter(Boolean);
    }

    getAllGuitaristMissions() {
        return this.getAllGuitarists().map(h => this.getGuitaristMission(h)).filter(Boolean);
    }

    getAllPerformanceMissions() {
        return this.getPerformanceDefinitions().map(d => this.getPerformanceMission(d)).filter(Boolean);
    }

    getAllPvPMissions() {
        return this.getPvPDefinitions().map(d => {
            const m = this.getPerformanceMission(d);
            if (m) m.category = 'pvp';
            return m;
        }).filter(Boolean);
    }

    getAllMissions() {
        return this.getAllZombieMissions();
    }

    recordKill(zombieOrId, heroOrId = null) {
        let zombieId = null, zombieName = null;
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

    recordStat(statId, amount = 1) {
        const def = this.getPerformanceDefinitions().find(d => d.id === statId) || this.getPvPDefinitions().find(d => d.id === statId);
        if (!def) return;

        const cur = this.state.performanceStats[statId] || 0;
        const nextVal = def.isPeakStat ? Math.max(cur, amount) : (cur + amount);
        this.state.performanceStats[statId] = nextVal;

        const claimedTier = this.state.performanceClaimedTiers[statId] || 0;
        if (claimedTier < this.MAX_TIER) {
            const target = def.tiers[claimedTier];
            if (cur < target && nextVal >= target) {
                this.onMilestoneReached(def.id, def.name, nextVal, (def.id && def.id.startsWith('pvp_')) ? 'pvp' : 'performance');
            }
        }

        this.saveState();
        this.updateBadgeCounter();
    }

    recordMaxStreak(streak) {
        if (typeof streak === 'number' && streak > 0) this.recordStat('max_streak', streak);
    }

    recordPvPOutcome(data = {}) {
        this.recordStat('pvp_matches', 1);
        if (data.isWin) this.recordStat('pvp_wins', 1);
        if (data.reason === 'player_ko') this.recordStat('pvp_kos', 1);
        if (data.overheals > 0) this.recordStat('pvp_heals', data.overheals);
        if (data.score > 0) this.recordStat('pvp_high_score', data.score);
        if (data.kills > 0) this.recordStat('pvp_zombie_kills', data.kills);
    }

    recordSongCompletion(accPct, stats = {}) {
        this.recordStat('songs_completed', 1);
        const accuracy = typeof accPct === 'number' ? accPct : 0;
        if (accuracy >= 90) this.recordStat('high_accuracy_songs', 1);
        if (accuracy >= 100 || (stats && stats.misses === 0 && (stats.hitNotes || 0) > 0)) {
            this.recordStat('perfect_accuracy_songs', 1);
        }
        if (stats && typeof stats.maxStreak === 'number' && stats.maxStreak > 0) {
            this.recordMaxStreak(stats.maxStreak);
        }
    }

    onMilestoneReached(entityId, entityName, val, type = 'zombie') {
        const name = entityName || entityId;
        if (window.combat && typeof window.combat.addFloatingText === 'function') {
            const cx = window.combat.canvas ? window.combat.canvas.width / 2 : 200;
            const cy = window.combat.canvas ? window.combat.canvas.height * 0.28 : 120;
            let label = `🎯 META CONCLUÍDA: ${name} (${val.toLocaleString()})!`;
            if (type === 'guitarist') label = `🎸 MESTRIA: ${name} (${val.toLocaleString()} Kills)!`;
            else if (type === 'pvp') label = `⚔️ MARCO PVP: ${name} (${val.toLocaleString()})!`;
            else if (type === 'performance') label = `⚡ MARCO DE RITMO: ${name} (${val.toLocaleString()})!`;

            window.combat.addFloatingText(label, cx, cy, '#ffd700', true);
            if (window.soundEngine && typeof window.soundEngine.playLevelUp === 'function') window.soundEngine.playLevelUp();
        }
    }

    claimZombieReward(zombieId, shouldRender = true) {
        const mission = this.getZombieMission(zombieId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;
        this.grantRewards(reward);

        const nextClaimed = mission.claimedTier + 1;
        this.state.claimedTiers[zombieId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();
        if (shouldRender) {
            this.playClaimSfx();
            this.showClaimToast(reward.gold, reward.xp, reward.title);
            this.updateBadgeCounter();
            this.render();
            if (window.game && typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
        }

        return {
            success: true, id: zombieId, zombieId, category: 'zombies',
            claimedTier: nextClaimed, reward, isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimGuitaristReward(heroId, shouldRender = true) {
        const mission = this.getGuitaristMission(heroId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;
        this.grantRewards(reward);

        const nextClaimed = mission.claimedTier + 1;
        this.state.heroClaimedTiers[heroId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();
        if (shouldRender) {
            this.playClaimSfx();
            this.showClaimToast(reward.gold, reward.xp, reward.title);
            this.updateBadgeCounter();
            this.render();
            if (window.game && typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
        }

        return {
            success: true, id: heroId, heroId, category: 'guitarists',
            claimedTier: nextClaimed, reward, isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimPerformanceReward(statId, shouldRender = true) {
        const mission = this.getPerformanceMission(statId);
        if (!mission || !mission.isReadyToClaim) return null;

        const { reward } = mission;
        this.grantRewards(reward);

        const nextClaimed = mission.claimedTier + 1;
        this.state.performanceClaimedTiers[statId] = nextClaimed;
        this.state.totalClaimedGold = (this.state.totalClaimedGold || 0) + reward.gold;
        this.state.totalClaimedXp = (this.state.totalClaimedXp || 0) + reward.xp;
        this.saveState();
        if (shouldRender) {
            this.playClaimSfx();
            this.showClaimToast(reward.gold, reward.xp, reward.title);
            this.updateBadgeCounter();
            this.render();
            if (window.game && typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
        }

        return {
            success: true, id: statId, statId, category: 'performance',
            claimedTier: nextClaimed, reward, isMaxCompleted: nextClaimed >= this.MAX_TIER
        };
    }

    claimReward(idOrType, maybeId = null) {
        if (maybeId) {
            if (idOrType === 'guitarist' || idOrType === 'guitarists') return this.claimGuitaristReward(maybeId);
            if (idOrType === 'performance' || idOrType === 'ritmo') return this.claimPerformanceReward(maybeId);
            return this.claimZombieReward(maybeId);
        }
        const pRes = this.claimPerformanceReward(idOrType);
        if (pRes) return pRes;
        const zRes = this.claimZombieReward(idOrType);
        if (zRes) return zRes;
        return this.claimGuitaristReward(idOrType);
    }

    grantRewards(reward) {
        if (!reward) return;
        // 1. Direct deposit of Gold to TalentSystem wallet
        if (window.talentSystem && typeof window.talentSystem.addGold === 'function') {
            window.talentSystem.addGold(reward.gold);
        } else if (window.game) {
            window.game.gold = (window.game.gold || 0) + reward.gold;
            if (typeof window.game.saveState === 'function') window.game.saveState();
        }

        // 2. Direct deposit of XP to Player XP Inventory
        if (window.guitaristPool && typeof window.guitaristPool.addPlayerXp === 'function') {
            window.guitaristPool.addPlayerXp(reward.xp);
        }

        // 3. Keep HUD and currency representations in sync
        if (window.talentSystem && typeof window.talentSystem.updateHUDGold === 'function') {
            window.talentSystem.updateHUDGold();
        }
        if (window.game && typeof window.game.updateMenuCurrencies === 'function') {
            window.game.updateMenuCurrencies();
        }
    }

    playClaimSfx() {
        if (window.soundEngine) {
            if (typeof window.soundEngine.playStageClear === 'function') window.soundEngine.playStageClear();
            else if (typeof window.soundEngine.playPowerChord === 'function') window.soundEngine.playPowerChord();
            else if (typeof window.soundEngine.playExplosion === 'function') window.soundEngine.playExplosion();
        }
    }

    showClaimToast(gold, xp, title = null) {
        if (typeof document === 'undefined') return;
        let toast = document.getElementById('missions-claim-toast');
        if (!toast) {
            if (typeof document.createElement !== 'function') return;
            toast = document.createElement('div');
            toast.id = 'missions-claim-toast';
            toast.className = 'missions-claim-toast';
            const modal = document.getElementById('meta-missions-modal') || document.body;
            if (modal && typeof modal.appendChild === 'function') modal.appendChild(toast);
        }
        if (!toast || !toast.classList) return;
        const titleHtml = title ? `<span class="toast-title">🎉 ${title}</span>` : '';
        toast.innerHTML = `
            ${titleHtml}
            <div class="toast-chips-row">
                <span class="toast-chip gold">+🪙 ${gold.toLocaleString()} Ouro</span>
                <span class="toast-chip xp">+✨ ${xp.toLocaleString()} XP no Inventário</span>
            </div>
        `;
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            if (toast && toast.classList) toast.classList.remove('show');
        }, 3000);
    }

    claimAllRewards(category = null) {
        const cat = category || this.activeCategory;
        let missionsToClaim = [];

        if (cat === 'all') {
            missionsToClaim = [
                ...this.getAllZombieMissions().filter(m => m.isReadyToClaim),
                ...this.getAllGuitaristMissions().filter(m => m.isReadyToClaim),
                ...this.getAllPerformanceMissions().filter(m => m.isReadyToClaim)
            ];
        } else if (cat === 'guitarists') {
            missionsToClaim = this.getAllGuitaristMissions().filter(m => m.isReadyToClaim);
        } else if (cat === 'performance') {
            missionsToClaim = this.getAllPerformanceMissions().filter(m => m.isReadyToClaim);
        } else {
            missionsToClaim = this.getAllZombieMissions().filter(m => m.isReadyToClaim);
        }

        if (missionsToClaim.length === 0) return { count: 0, totalGold: 0, totalXp: 0 };

        let totalGold = 0, totalXp = 0;
        missionsToClaim.forEach(m => {
            let res = null;
            if (m.category === 'guitarists') res = this.claimGuitaristReward(m.heroId || m.id, false);
            else if (m.category === 'performance' || m.category === 'pvp') res = this.claimPerformanceReward(m.statId || m.id, false);
            else res = this.claimZombieReward(m.zombieId || m.id, false);

            if (res && res.success) {
                totalGold += res.reward.gold;
                totalXp += res.reward.xp;
            }
        });

        this.playClaimSfx();
        this.showClaimToast(totalGold, totalXp, `${missionsToClaim.length} Missões Reivindicadas!`);
        this.updateBadgeCounter();
        this.render();
        if (window.game && typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
        return { count: missionsToClaim.length, totalGold, totalXp };
    }

    getPendingClaimsCount(category = null) {
        if (category === 'zombies') return this.getAllZombieMissions().filter(m => m.isReadyToClaim).length;
        if (category === 'guitarists') return this.getAllGuitaristMissions().filter(m => m.isReadyToClaim).length;
        if (category === 'performance') return this.getAllPerformanceMissions().filter(m => m.isReadyToClaim).length;
        if (category === 'pvp') return this.getAllPvPMissions().filter(m => m.isReadyToClaim).length;
        return this.getAllZombieMissions().filter(m => m.isReadyToClaim).length +
               this.getAllGuitaristMissions().filter(m => m.isReadyToClaim).length +
               this.getAllPerformanceMissions().filter(m => m.isReadyToClaim).length +
               this.getAllPvPMissions().filter(m => m.isReadyToClaim).length;
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
            const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
            claimAllBtn.innerText = currentCatPending > 0
                ? tr('btnClaimCount', `✨ REIVINDICAR (${currentCatPending})`, { count: currentCatPending })
                : tr('btnClaimAll', '✨ REIVINDICAR TODAS');
        }

        const zCount = this.getPendingClaimsCount('zombies');
        const hCount = this.getPendingClaimsCount('guitarists');
        const pCount = this.getPendingClaimsCount('performance');
        const pvCount = this.getPendingClaimsCount('pvp');
        const zTabBadge = document.getElementById('cat-badge-zombies');
        const hTabBadge = document.getElementById('cat-badge-guitarists');
        const pTabBadge = document.getElementById('cat-badge-performance');
        const pvTabBadge = document.getElementById('cat-badge-pvp');
        if (pvTabBadge) {
            pvTabBadge.innerText = pvCount > 0 ? `(${pvCount})` : '';
            if (pvTabBadge.style) pvTabBadge.style.display = pvCount > 0 ? 'inline' : 'none';
        }

        if (zTabBadge) {
            zTabBadge.innerText = zCount > 0 ? `(${zCount})` : '';
            if (zTabBadge.style) zTabBadge.style.display = zCount > 0 ? 'inline' : 'none';
        }
        if (hTabBadge) {
            hTabBadge.innerText = hCount > 0 ? `(${hCount})` : '';
            if (hTabBadge.style) hTabBadge.style.display = hCount > 0 ? 'inline' : 'none';
        }
        if (pTabBadge) {
            pTabBadge.innerText = pCount > 0 ? `(${pCount})` : '';
            if (pTabBadge.style) pTabBadge.style.display = pCount > 0 ? 'inline' : 'none';
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
            const catBtns = modal.querySelectorAll('.missions-cat-tab');
            catBtns.forEach(btn => {
                btn.onclick = () => {
                    catBtns.forEach(b => b.classList && b.classList.remove('active'));
                    if (btn.classList) btn.classList.add('active');
                    this.activeCategory = (btn.dataset && btn.dataset.cat) ? btn.dataset.cat : 'zombies';
                    this.render();
                };
            });

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
        if (modal && modal.classList) modal.classList.remove('open');
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
        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        let missions = [];
        let totalCount = 0;
        let labelText = tr('statKillsHordes', 'Kills Hordas:');

        if (this.activeCategory === 'guitarists') {
            missions = this.getAllGuitaristMissions();
            totalCount = Object.values(this.state.heroKills).reduce((a, b) => a + (Number(b) || 0), 0);
            labelText = tr('statKillsHeroes', 'Kills Heróis:');
        } else if (this.activeCategory === 'performance') {
            missions = this.getAllPerformanceMissions();
            totalCount = Object.values(this.state.performanceStats).reduce((a, b) => a + (Number(b) || 0), 0);
            labelText = tr('statRhythmActions', 'Ações de Ritmo:');
        } else if (this.activeCategory === 'pvp') {
            missions = this.getAllPvPMissions();
            totalCount = Object.entries(this.state.performanceStats).filter(([k]) => k.startsWith('pvp_')).reduce((a, [, v]) => a + (Number(v) || 0), 0);
            labelText = tr('statPvPActions', 'Ações no PvP:');
        } else {
            missions = this.getAllZombieMissions();
            totalCount = Object.values(this.state.kills).reduce((a, b) => a + (Number(b) || 0), 0);
            labelText = tr('statKillsHordes', 'Kills Hordas:');
        }

        const maxCompletedCount = missions.filter(m => m.isMaxCompleted).length;
        const totalClaimedGold = this.state.totalClaimedGold || 0;

        const statKills = document.getElementById('missions-stat-kills');
        const statGold = document.getElementById('missions-stat-gold');
        const statWallet = document.getElementById('missions-stat-wallet-gold');
        const statInvXp = document.getElementById('missions-stat-inventory-xp');
        const statCompleted = document.getElementById('missions-stat-completed');
        const statKillsLabel = document.getElementById('missions-stat-kills-label');

        const currentWalletGold = (window.talentSystem && typeof window.talentSystem.gold === 'number')
            ? window.talentSystem.gold
            : (window.game ? (window.game.gold || 0) : 0);
        const currentInvXp = (window.guitaristPool && typeof window.guitaristPool.getPlayerXp === 'function')
            ? window.guitaristPool.getPlayerXp()
            : 0;

        if (statKills) statKills.innerText = totalCount.toLocaleString();
        if (statKillsLabel) statKillsLabel.innerText = labelText;
        if (statGold) statGold.innerText = totalClaimedGold.toLocaleString();
        if (statWallet) statWallet.innerText = currentWalletGold.toLocaleString();
        if (statInvXp) statInvXp.innerText = currentInvXp.toLocaleString();
        if (statCompleted) statCompleted.innerText = `${maxCompletedCount} / ${missions.length}`;
    }

    renderCards() {
        const container = document.getElementById('missions-cards-grid');
        if (!container) return;

        let missions = [];
        if (this.activeCategory === 'guitarists') missions = this.getAllGuitaristMissions();
        else if (this.activeCategory === 'performance') missions = this.getAllPerformanceMissions();
        else if (this.activeCategory === 'pvp') missions = this.getAllPvPMissions();
        else missions = this.getAllZombieMissions();

        if (this.searchQuery) {
            missions = missions.filter(m => {
                const name = (m.name || '').toLowerCase();
                const badge = (m.badgeText || '').toLowerCase();
                return name.includes(this.searchQuery) || badge.includes(this.searchQuery);
            });
        }

        if (this.activeFilter === 'ready') missions = missions.filter(m => m.isReadyToClaim);
        else if (this.activeFilter === 'active') missions = missions.filter(m => !m.isReadyToClaim && !m.isMaxCompleted);
        else if (this.activeFilter === 'completed') missions = missions.filter(m => m.isMaxCompleted);

        if (missions.length === 0) {
            const icon = this.activeCategory === 'guitarists' ? '🎸' : (this.activeCategory === 'pvp' ? '⚔️' : (this.activeCategory === 'performance' ? '⚡' : '🧟'));
            const emptyMsg = typeof i18n !== 'undefined' ? i18n.t('noMissionsFound', 'Nenhuma missão encontrada para o filtro selecionado.') : 'Nenhuma missão encontrada para o filtro selecionado.';
            container.innerHTML = `
                <div class="missions-empty-state">
                    <span class="empty-icon">${icon}</span>
                    <p>${emptyMsg}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = missions.map(m => this.createCardHTML(m)).join('');

        if (container && typeof container.querySelectorAll === 'function') {
            container.querySelectorAll('.mission-claim-btn[data-claim-id]').forEach(btn => {
                btn.onclick = () => {
                    const cat = btn.dataset ? btn.dataset.claimCat : null;
                    const id = btn.dataset ? btn.dataset.claimId : null;
                    if (!id) return;
                    if (cat === 'guitarists') this.claimGuitaristReward(id);
                    else if (cat === 'performance' || cat === 'pvp') this.claimPerformanceReward(id);
                    else this.claimZombieReward(id);
                };
            });
        }
    }

    createCardHTML(m) {
        const isReady = m.isReadyToClaim;
        const isMax = m.isMaxCompleted;
        const catClass = m.category === 'guitarists' ? 'hero-mission-card' : (m.category === 'pvp' ? 'pvp-mission-card' : (m.category === 'performance' ? 'perf-mission-card' : ''));
        const fillClass = m.category === 'guitarists' ? 'hero-fill' : (m.category === 'pvp' ? 'pvp-fill' : (m.category === 'performance' ? 'perf-fill' : ''));
        const titleClass = m.category === 'guitarists' ? 'hero-title' : (m.category === 'pvp' ? 'pvp-title' : (m.category === 'performance' ? 'perf-title' : ''));
        const tierPillClass = m.category === 'guitarists' ? 'hero-tier-pill' : (m.category === 'pvp' ? 'pvp-tier-pill' : (m.category === 'performance' ? 'perf-tier-pill' : ''));

        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        let actionBtnHTML = '';
        if (isMax) {
            let masterTitle = tr('masterHunter', 'MESTRE CAÇADOR');
            if (m.category === 'guitarists') masterTitle = tr('rockLegend', 'LENDA DO ROCK');
            else if (m.category === 'pvp') masterTitle = 'LENDA DO PVP';
            else if (m.category === 'performance') masterTitle = tr('supremeMastery', 'MESTRIA SUPREMA');

            const completedText = tr('completedUnits', `${m.targetVal.toLocaleString()} ${m.unitLabel} Concluídas!`, { target: m.targetVal.toLocaleString(), unit: m.unitLabel });
            actionBtnHTML = `
                <div class="mission-status-badge badge-master">
                    <span>👑 ${masterTitle}</span>
                    <small>${completedText}</small>
                </div>
            `;
        } else if (isReady) {
            const claimLabel = tr('claim', 'REIVINDICAR');
            actionBtnHTML = `
                <button type="button" class="mission-claim-btn ready-claim pulse-gold"
                        data-claim-cat="${m.category}" data-claim-id="${m.id}"
                        ${m.category === 'zombies' ? `data-zombie="${m.id}"` : ''}
                        ${m.category === 'guitarists' ? `data-hero="${m.id}"` : ''}>
                    <span class="btn-label">✨ ${claimLabel}</span>
                    <span class="btn-reward-preview">+${m.reward.gold.toLocaleString()} 🪙 • +${m.reward.xp.toLocaleString()} ✨</span>
                </button>
            `;
        } else {
            actionBtnHTML = `
                <button type="button" class="mission-claim-btn in-progress" disabled>
                    <span>🔒 ${m.currentVal.toLocaleString()} / ${m.targetVal.toLocaleString()}</span>
                </button>
            `;
        }

        let sectionTag = tr('milestoneReward', 'RECOMPENSA DO MARCO:');
        if (m.category === 'guitarists') sectionTag = tr('heroMastery', 'MESTRIA DO GUITARRISTA:');
        else if (m.category === 'pvp') sectionTag = 'MARCO DO DUELO PVP:';
        else if (m.category === 'performance') sectionTag = tr('perfMilestone', 'MARCO DE PERFORMANCE:');

        const goldLabel = tr('goldUnit', 'Ouro');
        const targetLabel = tr('target', 'Meta:');

        return `
            <div class="mission-card ${catClass} ${isReady ? 'card-ready' : ''} ${isMax ? 'card-master' : ''}">
                <div class="mission-card-top">
                    <div class="mission-avatar-wrap ${m.category === 'guitarists' ? 'hero-avatar-wrap' : ''}">
                        <img src="${m.icon}" alt="${m.name}" class="mission-avatar-img ${m.category === 'guitarists' ? 'hero-avatar-img' : ''}">
                        <span class="mission-archetype-badge ${m.badgeClass}">${m.badgeText}</span>
                    </div>
                    <div class="mission-info-col">
                        <div class="mission-title-row">
                            <h4 class="mission-zombie-name ${m.category === 'guitarists' ? 'hero-name' : ''}">${m.name}</h4>
                            <span class="mission-lifetime-kills ${m.category === 'guitarists' ? 'hero-kills' : ''}">${m.category === 'guitarists' ? '🎸' : (m.category === 'pvp' ? '⚔️' : (m.category === 'performance' ? '⚡' : '💀'))} ${m.currentVal.toLocaleString()} ${m.unitLabel}</span>
                        </div>
                        <div class="mission-tier-indicator">
                            <span class="tier-pill ${tierPillClass}">Tier ${isMax ? '5/5' : `${m.currentTierNum}/5`}</span>
                            <span class="tier-target-label">${targetLabel} <strong>${m.targetVal.toLocaleString()}</strong> ${m.unitLabel.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                <div class="mission-progress-block">
                    <div class="mission-progress-track">
                        <div class="mission-progress-fill ${fillClass} ${isReady ? 'fill-ready' : ''}" style="width: ${m.progressPercent}%;"></div>
                    </div>
                    <div class="mission-progress-labels">
                        <span>${m.desc || 'Progresso'}</span>
                        <span>${m.currentVal.toLocaleString()} / ${m.targetVal.toLocaleString()} (${m.progressPercent}%)</span>
                    </div>
                </div>

                <div class="mission-reward-box">
                    <div class="reward-title-tag">${sectionTag}</div>
                    <div class="reward-chips-row">
                        <span class="reward-chip chip-gold">🪙 +${m.reward.gold.toLocaleString()} ${goldLabel}</span>
                        <span class="reward-chip chip-xp">⭐ +${m.reward.xp.toLocaleString()} XP</span>
                        <span class="reward-chip chip-title ${titleClass}">🎖️ ${m.reward.title}</span>
                    </div>
                </div>

                <div class="mission-card-footer">
                    ${actionBtnHTML}
                </div>
            </div>
        `;
    }

    createHeroCardHTML(m) {
        return this.createCardHTML(m);
    }
}

window.MetaMissionSystem = MetaMissionSystem;
