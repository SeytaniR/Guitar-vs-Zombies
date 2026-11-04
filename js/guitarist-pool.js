// Guitarist Pool System - Catalog of 6 Heroes with Procedural Leveling (1-100), Scaled Stats & Custom Rarities
class GuitaristPoolSystem {
    constructor() {
        this.maxLevel = 100;
        this.guitarists = [
            {
                id: 'johnny_blaze',
                name: 'Johnny "Riff" Blaze',
                title: 'O Punk Rocker Clássico',
                rarity: 'COMUM',
                rarityKey: 'common',
                unlockCost: 0,
                badgeClass: 'badge-common',
                icon: 'assets/heroes/johnny_blaze.jpg',
                sheet: 'heroSheet',
                sheetSrc: 'assets/hero2.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Stratocaster "Hellfire"',
                themeColor: '#ff6600',
                projectileColor: '#00f0ff',
                desc: 'Veterano das garagens do apocalipse. Ataques sónicos equilibrados com evolução consistente de dano e velocidade.',
                passiveName: 'Espírito do Rock',
                passiveDesc: '+1.0% de Dano e +0.4% de Dano Crítico por nível (chegando a +99% de dano e +89% de crítico no Nv. 100).',
                baseStats: {
                    baseAttackSpeed: 1.0,            // 1 ataque por segundo base (1.0/s)
                    damageMultPerLevel: 0.010,       // +1% damage per level
                    baseCritBonusPercent: 50.0,      // +50% base crit damage
                    critBonusPerLevel: 0.40,         // +0.4% crit bonus per level
                    projSpeedBonusPerLevel: 0.002,   // +0.2% proj speed per level
                    manaRegenRatePerLevel: 0.002,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'vulkan_ironhead',
                name: 'Vulkan "Ironhead"',
                title: 'O Piromaníaco das Wastelands',
                rarity: 'RARO',
                rarityKey: 'rare',
                unlockCost: 5000,
                badgeClass: 'badge-rare',
                icon: 'assets/heroes/vulkan_ironhead.jpg',
                sheet: 'heroVulkanSheet',
                sheetSrc: 'assets/hero_vulkan.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Scrap-Metal V8 Flamejante',
                themeColor: '#ff3300',
                projectileColor: '#ff4500',
                desc: 'Sobrevivente forjado em ferro-velho e cinzas. Seu escapamento flamejante incinera zumbis e acelera a regeneração de mana.',
                passiveName: 'Pirotecnia Brutal',
                passiveDesc: '+1.0% de Dano, +0.3% de Mana Regen e chance de queimadura contínua que cresce a cada nível.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.010,
                    baseCritBonusPercent: 52.0,
                    critBonusPerLevel: 0.45,
                    burnChanceBase: 0.20,
                    burnChancePerLevel: 0.0015,
                    manaRegenRatePerLevel: 0.003,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'dr_radix',
                name: 'Dr. Radix Biohazard',
                title: 'O Solista Bioquímico',
                rarity: 'RARO',
                rarityKey: 'rare',
                unlockCost: 7500,
                badgeClass: 'badge-rare',
                icon: 'assets/heroes/dr_radix.jpg',
                sheet: 'heroHazmatSheet',
                sheetSrc: 'assets/hero_hazmat.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Guitarratox "Uranium-235"',
                themeColor: '#39ff14',
                projectileColor: '#39ff14',
                desc: 'Cientista louco em traje de contenção. Seus acordes cáusticos perfuram armaduras de zumbis e desaceleram a horda.',
                passiveName: 'Radiação Acústica',
                passiveDesc: '+1.0% de Dano, +0.35% de Perfuração de Armadura e +0.12% de lentidão contínua da marcha zumbi por nível.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.010,
                    baseCritBonusPercent: 50.0,
                    critBonusPerLevel: 0.45,
                    armorPenBase: 0.20,
                    armorPenPerLevel: 0.0035,
                    slowHordeBase: 0.08,
                    slowHordePerLevel: 0.0012,
                    manaRegenRatePerLevel: 0.002
                }
            },
            {
                id: 'cypher_volt',
                name: 'Cypher-7 (Volt)',
                title: 'O Virtuoso Cibernético',
                rarity: 'ÉPICO',
                rarityKey: 'epic',
                unlockCost: 15000,
                badgeClass: 'badge-epic',
                icon: 'assets/heroes/cypher_volt.jpg',
                sheet: 'heroCyborgSheet',
                sheetSrc: 'assets/hero_cyborg.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Laser-Caster Bionica Neon',
                themeColor: '#00f0ff',
                projectileColor: '#00f0ff',
                desc: 'Ciborgue com processador neural. Seus acordes conduzem descargas elétricas que saltam entre múltiplos zumbis.',
                passiveName: 'Overdrive Bionico',
                passiveDesc: '+1.1% de Dano e +0.6% de Dano Crítico por nível, com arcos elétricos devastadores em notas PERFECT.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.011,
                    baseCritBonusPercent: 55.0,
                    critBonusPerLevel: 0.60,
                    chainLightning: true,
                    chainTargets: 2,
                    manaRegenRatePerLevel: 0.004,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'kragthor_titan',
                name: 'Kragthor, o Bárbaro',
                title: 'O Titã do Heavy Metal',
                rarity: 'LENDÁRIO',
                rarityKey: 'legendary',
                unlockCost: 30000,
                badgeClass: 'badge-legendary',
                icon: 'assets/heroes/kragthor_titan.jpg',
                sheet: 'heroGladiatorSheet',
                sheetSrc: 'assets/hero_gladiator.jpg',
                cols: 4,
                rows: 4,
                instrument: 'Flying-V "Magma Fury"',
                themeColor: '#ffcc00',
                projectileColor: '#ffaa00',
                desc: 'Colosso do Valhalla do Metal com cabeça em chamas. Seus acordes provocam terremotos de impacto e crítico colossal.',
                passiveName: 'Fúria dos Titãs',
                passiveDesc: '+1.15% de Dano, +0.85% de Dano Crítico por nível e repelência brutal contra zumbis pesados.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0115,
                    baseCritBonusPercent: 65.0,
                    critBonusPerLevel: 0.85,
                    knockbackBonusBase: 0.25,
                    knockbackPerLevel: 0.004,
                    manaRegenRatePerLevel: 0.003
                }
            },
            {
                id: 'roxie_anarchy',
                name: 'Roxie "Anarchy" Slash',
                title: 'A Valquíria do Punk Mítico',
                rarity: 'MÍTICO',
                rarityKey: 'mythic',
                unlockCost: 50000,
                badgeClass: 'badge-mythic',
                icon: 'assets/heroes/roxie_anarchy.jpg',
                sheet: 'heroAnarchySheet',
                sheetSrc: 'assets/hero_anarchy.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Guitarra Custom "Riot Slash"',
                themeColor: '#ff00a0',
                projectileColor: '#ff00a0',
                desc: 'Lenda viva da anarquia musical. Seus solos de alta voltagem concedem multiplicação de ouro e geração acelerada de Rock Mana.',
                passiveName: 'Anarquia Absoluta',
                passiveDesc: '+1.20% de Dano, +0.70% de Dano Crítico, +0.25% de Ouro Extra e +0.50% de Mana Regen por nível!',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0120,
                    baseCritBonusPercent: 60.0,
                    critBonusPerLevel: 0.70,
                    goldBonusBase: 0.10,
                    goldBonusPerLevel: 0.0025,
                    manaRegenRatePerLevel: 0.005
                }
            },
            {
                id: 'finn_punk',
                name: 'Finn "Punk Hero"',
                title: 'O Campeão Multiversal do Som',
                rarity: 'LENDÁRIO',
                rarityKey: 'legendary',
                unlockCost: 60000,
                badgeClass: 'badge-legendary',
                icon: 'assets/heroes/finn_punk.jpg',
                sheet: 'heroFinnSheet',
                sheetSrc: 'assets/hero_finn.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Espada-Guitarra Sonora de Ooo',
                themeColor: '#00e5ff',
                projectileColor: '#00ffaa',
                desc: 'Herói aventureiro com gorro de urso e jaqueta de rebite. Seus solos cortam fendas dimensionais emitindo lâminas sónicas letais.',
                passiveName: 'Hora do Rock Multiversal',
                passiveDesc: '+1.22% de Dano, +0.75% de Dano Crítico e +0.3% de velocidade de projéteis sónicos por nível.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0122,
                    baseCritBonusPercent: 65.0,
                    critBonusPerLevel: 0.75,
                    projSpeedBonusPerLevel: 0.003,
                    manaRegenRatePerLevel: 0.004,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'ignis_draco',
                name: 'Ignis "Draco" Hellfret',
                title: 'O Dragão Devorador de Riffs',
                rarity: 'MÍTICO',
                rarityKey: 'mythic',
                unlockCost: 80000,
                badgeClass: 'badge-mythic',
                icon: 'assets/heroes/ignis_draco.jpg',
                sheet: 'heroDracoSheet',
                sheetSrc: 'assets/hero_draco.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Guitarra Dracônica "Inferno"',
                themeColor: '#ff3300',
                projectileColor: '#ff6600',
                desc: 'Guerreiro réptil ancestral de sangue ígneo. Seus riffs inflamam o ar em labaredas vulcânicas de combustão contínua.',
                passiveName: 'Sopro Ígneo Acústico',
                passiveDesc: '+1.26% de Dano, +0.82% de Dano Crítico e +0.35% de chance de queimadura contínua dracônica por nível.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0126,
                    baseCritBonusPercent: 68.0,
                    critBonusPerLevel: 0.82,
                    burnChanceBase: 0.25,
                    burnChancePerLevel: 0.0035,
                    manaRegenRatePerLevel: 0.0045,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'fenrir_howler',
                name: 'Fenrir "Bloodfang" Howler',
                title: 'A Fera da Lua Cheia do Metal',
                rarity: 'ANCESTRAL',
                rarityKey: 'ancestral',
                unlockCost: 100000,
                badgeClass: 'badge-ancestral',
                icon: 'assets/heroes/fenrir_howler.jpg',
                sheet: 'heroFenrirSheet',
                sheetSrc: 'assets/hero_fenrir.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Axe-Star "Lobo da Noite"',
                themeColor: '#ff0033',
                projectileColor: '#cc0029',
                desc: 'Lobisomem titânico que canaliza a fúria da lua cheia. Seus acordes uivantes dilaceram os mortos-vivos com sangramento e vampirismo.',
                passiveName: 'Frenesi da Lua de Sangue',
                passiveDesc: '+1.30% de Dano, +0.90% de Dano Crítico e drenagem contínua de essência vital dos zumbis por nível.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0130,
                    baseCritBonusPercent: 72.0,
                    critBonusPerLevel: 0.90,
                    knockbackBonusBase: 0.28,
                    knockbackPerLevel: 0.005,
                    manaRegenRatePerLevel: 0.005,
                    goldBonusPerLevel: 0.0
                }
            },
            {
                id: 'spiky_sponge',
                name: 'Bob "Spiky" Punkrocker',
                title: 'A Anarquia Amarela das Fossas',
                rarity: 'CÓSMICO',
                rarityKey: 'cosmic',
                unlockCost: 135000,
                badgeClass: 'badge-cosmic',
                icon: 'assets/heroes/spiky_sponge.jpg',
                sheet: 'heroSpongeSheet',
                sheetSrc: 'assets/hero_sponge.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Flying-V a Jato "Fenda do Biquíni"',
                themeColor: '#ffd700',
                projectileColor: '#00ffff',
                desc: 'Esponja punk com moicano e turbinas a jato na guitarra. Seus riffs hipersônicos destroçam zumbis com velocidade vertiginosa e enriquecem o show.',
                passiveName: 'Propulsão Hipersônica',
                passiveDesc: '+1.35% de Dano, +0.95% de Dano Crítico, +0.35% de Ouro Extra e +0.60% de Mana Regen por nível!',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0135,
                    baseCritBonusPercent: 75.0,
                    critBonusPerLevel: 0.95,
                    goldBonusBase: 0.15,
                    goldBonusPerLevel: 0.0035,
                    manaRegenRatePerLevel: 0.006
                }
            },
            {
                id: 'saul_slash',
                name: 'Saul "The God" Slash',
                title: 'O Deus Imortal da Cartola & Les Paul',
                rarity: 'DIVINO',
                rarityKey: 'divine',
                unlockCost: 180000,
                badgeClass: 'badge-divine',
                icon: 'assets/heroes/saul_slash.jpg',
                sheet: 'heroSlashSheet',
                sheetSrc: 'assets/hero_slash.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Gibson Les Paul Goldtop Sagrada "1959"',
                themeColor: '#e6b800',
                projectileColor: '#ffaa00',
                desc: 'A maior lenda viva da história do rock. Seus solos sagrados desintegram multidões de mortos-vivos com sustain divino e explosões douradas.',
                passiveName: 'Apetite Pela Destruição',
                passiveDesc: '+1.45% de Dano, +1.10% de Dano Crítico, +0.45% de Ouro Extra e +0.70% de Mana Regen por nível! O ápice do poder musical.',
                baseStats: {
                    baseAttackSpeed: 1.0,
                    damageMultPerLevel: 0.0145,
                    baseCritBonusPercent: 85.0,
                    critBonusPerLevel: 1.10,
                    goldBonusBase: 0.20,
                    goldBonusPerLevel: 0.0045,
                    manaRegenRatePerLevel: 0.007
                }
            }
        ];

        // Normalization
        this.guitarists.forEach(g => {
            g.rarityClass = g.badgeClass || 'badge-common';
            g.badgeClass = g.rarityClass;
            g.accentColor = g.themeColor || '#ffaa00';
            g.passive = { name: g.passiveName, desc: g.passiveDesc };
        });

        this.heroLevels = this.loadHeroLevels();
        this.unlockedHeroes = this.loadUnlockedHeroes();
        this.playerXp = this.loadPlayerXp();
        this.selectedId = this.loadSelectedGuitaristId();
    }

    loadPlayerXp() {
        try {
            const raw = localStorage.getItem('gvs_player_xp');
            if (raw !== null && !isNaN(parseInt(raw, 10))) return Math.max(0, parseInt(raw, 10));
        } catch(e) {}
        return 0;
    }

    savePlayerXp() {
        try {
            localStorage.setItem('gvs_player_xp', (this.playerXp || 0).toString());
        } catch(e) {}
    }

    addPlayerXp(amount) {
        const val = Math.max(0, parseInt(amount, 10) || 0);
        this.playerXp = (this.playerXp || 0) + val;
        this.savePlayerXp();
        this.updateXpDisplays();
        return this.playerXp;
    }

    getPlayerXp() {
        return this.playerXp || 0;
    }

    updateXpDisplays() {
        if (typeof document === 'undefined') return;
        const count = (this.playerXp || 0).toLocaleString();
        const menuXp = document.getElementById('menu-xp-count');
        if (menuXp) menuXp.innerText = count;
        const statXp = document.getElementById('missions-stat-inventory-xp');
        if (statXp) statXp.innerText = count;
        const showcaseInvXp = document.getElementById('showcase-hero-inv-xp');
        if (showcaseInvXp) showcaseInvXp.innerText = count;
    }

    injectXpIntoHero(heroId, amount = null) {
        const data = this.getHeroLevelData(heroId);
        if (data.level >= this.maxLevel) return { success: false, reason: 'Nível Máximo Atingido (100)' };
        if ((this.playerXp || 0) <= 0) return { success: false, reason: 'Sem XP no inventário!' };

        const reqXp = this.getXpRequiredForNextLevel(data.level);
        const neededForLevel = Math.max(1, reqXp - data.xp);

        let toInject = (amount !== null && amount > 0) ? Math.min(amount, this.playerXp) : Math.min(neededForLevel, this.playerXp);
        toInject = Math.max(0, toInject);
        if (toInject <= 0) return { success: false, reason: 'XP insuficiente!' };

        this.playerXp -= toInject;
        this.savePlayerXp();

        const addRes = this.addHeroXp(heroId, toInject);
        this.updateXpDisplays();

        return {
            success: true,
            injectedXp: toInject,
            leveledUp: addRes.leveledUp,
            newLevel: addRes.newLevel,
            currentXp: addRes.currentXp,
            remainingPlayerXp: this.playerXp
        };
    }

    loadHeroLevels() {
        try {
            const raw = localStorage.getItem('gvs_hero_levels');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                }
            }
        } catch(e) {}
        return {};
    }

    saveHeroLevels() {
        try {
            localStorage.setItem('gvs_hero_levels', JSON.stringify(this.heroLevels));
        } catch(e) {}
    }

    getHeroLevelData(heroId) {
        if (!this.heroLevels[heroId]) {
            this.heroLevels[heroId] = { level: 1, xp: 0 };
        }
        return this.heroLevels[heroId];
    }

    getXpRequiredForNextLevel(levelOrHeroId) {
        const level = typeof levelOrHeroId === 'number' ? levelOrHeroId : (this.getHeroLevelData(levelOrHeroId).level);
        if (level >= this.maxLevel) return Infinity;
        return Math.floor(75 * Math.pow(1.062, level - 1) + (level - 1) * 14);
    }

    getGoldCostForLevelUp(levelOrHeroId) {
        const level = typeof levelOrHeroId === 'number' ? levelOrHeroId : (this.getHeroLevelData(levelOrHeroId).level);
        if (level >= this.maxLevel) return Infinity;
        return Math.floor(3 * (32 * Math.pow(1.054, level - 1) + level * 7));
    }

    addHeroXp(heroId, amount) {
        const data = this.getHeroLevelData(heroId);
        if (data.level >= this.maxLevel) return { leveledUp: false, newLevel: this.maxLevel };

        data.xp += amount;
        let leveledUp = false;

        while (data.level < this.maxLevel) {
            const req = this.getXpRequiredForNextLevel(data.level);
            if (data.xp >= req) {
                data.xp -= req;
                data.level++;
                leveledUp = true;
            } else {
                break;
            }
        }

        if (data.level >= this.maxLevel) {
            data.xp = 0;
        }

        this.saveHeroLevels();
        return { leveledUp, newLevel: data.level, currentXp: data.xp };
    }

    setLevel(heroId, level) {
        const data = this.getHeroLevelData(heroId);
        data.level = Math.max(1, Math.min(this.maxLevel, parseInt(level, 10) || 1));
        data.xp = 0;
        this.saveHeroLevels();
        return data;
    }

    levelUpWithGold(heroId) {
        const data = this.getHeroLevelData(heroId);
        if (data.level >= this.maxLevel) return { success: false, reason: 'Nível Máximo Atingido' };

        const cost = this.getGoldCostForLevelUp(data.level);
        if (!window.talentSystem || window.talentSystem.gold < cost) {
            return { success: false, reason: `Ouro insuficiente (necessário: 🪙 ${cost})` };
        }

        window.talentSystem.gold -= cost;
        if (typeof window.talentSystem.saveProgress === 'function') {
            window.talentSystem.saveProgress();
        } else if (typeof window.talentSystem.save === 'function') {
            window.talentSystem.save();
        }
        data.level++;
        data.xp = 0;
        this.saveHeroLevels();
        return { success: true, newLevel: data.level, cost: cost };
    }

    getHeroStats(heroId) {
        const hero = this.guitarists.find(g => g.id === heroId) || this.guitarists[0];
        const lvlData = this.getHeroLevelData(hero.id);
        const lvl = lvlData.level;
        const b = hero.baseStats;

        // Procedural scaling: level 1 is base (+0%), level 100 has 99 level increments
        const lvlIncrements = lvl - 1;
        const damageMult = 1.0 + (b.damageMultPerLevel * lvlIncrements);
        const critDamageBonusPercent = b.baseCritBonusPercent + (b.critBonusPerLevel * lvlIncrements);
        const manaRegenRate = 1.0 + ((b.manaRegenRatePerLevel || 0.002) * lvlIncrements);
        const goldBonus = (b.goldBonusBase || 0) + ((b.goldBonusPerLevel || 0) * lvlIncrements);
        const armorPen = (b.armorPenBase || 0) + ((b.armorPenPerLevel || 0) * lvlIncrements);
        const slowHorde = (b.slowHordeBase || 0) + ((b.slowHordePerLevel || 0) * lvlIncrements);
        const burnChance = (b.burnChanceBase || 0) + ((b.burnChancePerLevel || 0) * lvlIncrements);
        const knockbackBonus = (b.knockbackBonusBase || 0) + ((b.knockbackPerLevel || 0) * lvlIncrements);

        return {
            level: lvl,
            baseAttackSpeed: b.baseAttackSpeed || 1.0,
            damageMult: damageMult,
            critDamageBonusPercent: critDamageBonusPercent,
            manaRegenRate: manaRegenRate,
            goldBonus: goldBonus,
            armorPen: armorPen,
            slowHorde: slowHorde,
            burnChance: burnChance,
            knockbackBonus: knockbackBonus,
            chainLightning: !!b.chainLightning,
            chainTargets: b.chainTargets || 0
        };
    }

    loadUnlockedHeroes() {
        try {
            const raw = localStorage.getItem('gvs_unlocked_guitarists');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    if (!parsed.includes('johnny_blaze')) parsed.unshift('johnny_blaze');
                    return parsed;
                }
            }
        } catch(e) {}
        return ['johnny_blaze'];
    }

    saveUnlockedHeroes() {
        try {
            localStorage.setItem('gvs_unlocked_guitarists', JSON.stringify(this.unlockedHeroes));
        } catch(e) {}
    }

    isHeroUnlocked(heroId) {
        if (!heroId || heroId === 'johnny_blaze') return true;
        return Array.isArray(this.unlockedHeroes) && this.unlockedHeroes.includes(heroId);
    }

    getHeroUnlockCost(heroId) {
        const hero = this.guitarists.find(g => g.id === heroId);
        return (hero && hero.unlockCost !== undefined) ? hero.unlockCost : 5000;
    }

    unlockHeroWithGold(heroId) {
        if (this.isHeroUnlocked(heroId)) {
            return { success: false, reason: 'Guitarrista já desbloqueado!' };
        }
        const cost = this.getHeroUnlockCost(heroId);
        if (!window.talentSystem || window.talentSystem.gold < cost) {
            return { success: false, reason: `Ouro insuficiente (necessário: 🪙 ${cost})` };
        }

        window.talentSystem.gold -= cost;
        if (typeof window.talentSystem.saveProgress === 'function') {
            window.talentSystem.saveProgress();
        } else if (typeof window.talentSystem.save === 'function') {
            window.talentSystem.save();
        }

        if (!this.unlockedHeroes.includes(heroId)) {
            this.unlockedHeroes.push(heroId);
        }
        this.saveUnlockedHeroes();
        this.setSelectedGuitarist(heroId);

        return { success: true, heroId, cost };
    }

    loadSelectedGuitaristId() {
        try {
            const id = localStorage.getItem('gvs_selected_guitarist');
            if (id && this.isHeroUnlocked(id)) return id;
        } catch(e) {}
        return 'johnny_blaze';
    }

    setSelectedGuitarist(id) {
        const found = this.guitarists.find(g => g.id === id);
        if (found && this.isHeroUnlocked(id)) {
            this.selectedId = id;
            try {
                localStorage.setItem('gvs_selected_guitarist', id);
            } catch(e) {}
            return true;
        }
        return false;
    }

    getActiveGuitarist() {
        if (!this.isHeroUnlocked(this.selectedId)) {
            this.selectedId = 'johnny_blaze';
        }
        return this.guitarists.find(g => g.id === this.selectedId) || this.guitarists[0];
    }

    getSelectedGuitarist() {
        return this.getActiveGuitarist();
    }

    getAllGuitarists() {
        return this.guitarists;
    }
}

window.guitaristPool = new GuitaristPoolSystem();
