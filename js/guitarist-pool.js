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
                unlockCost: 500,
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
                unlockCost: 750,
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
                unlockCost: 1500,
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
                unlockCost: 3000,
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
                unlockCost: 5000,
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
        this.selectedId = this.loadSelectedGuitaristId();
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
        return (hero && hero.unlockCost !== undefined) ? hero.unlockCost : 1000;
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
