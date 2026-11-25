// AAA Talent Tree System for Guitar vs Zombies
const _trT = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
class TalentSystem {
    constructor() {
        this.gold = 0;
        this.activeBranch = 'offense'; // 'offense', 'defense', 'rhythm'
        this.selectedTalentId = 'power_chord';

        // 17 Comprehensive Talents across 3 Branches with Slow Progression Curve
        this.talents = {
            // === BRANCH 1: OFENSIVO (Riffs & Dano) ===
            'power_chord': {
                id: 'power_chord',
                branch: 'offense',
                name: 'Power Chord',
                icon: 'assets/talents/guitar_power.jpg',
                desc: 'Aumenta a potência acústica das notas musicais, elevando o dano base de todos os disparos.',
                level: 0,
                maxLevel: 20,
                baseCost: 80,
                costMult: 1.55,
                prereq: null,
                getBenefit: (lvl) => _trT('talentDmgBase', `+${lvl * 5} Dano Base`, { amount: lvl * 5 }),
                getNextBenefit: (lvl) => _trT('talentDmgBase', `+${(lvl + 1) * 5} Dano Base`, { amount: (lvl + 1) * 5 }),
                getValue: (lvl) => lvl * 5
            },
            'ferocious_solo': {
                id: 'ferocious_solo',
                branch: 'offense',
                name: 'Solo Feroz',
                icon: 'assets/talents/skull_crit.jpg',
                desc: 'Amplifica a ferocidade das notas, aumentando substancialmente o multiplicador de dano crítico.',
                level: 0,
                maxLevel: 15,
                baseCost: 200,
                costMult: 1.60,
                prereq: { id: 'power_chord', level: 3 },
                getBenefit: (lvl) => _trT('talentCritDmg', `+${lvl * 12}% Dano Crítico`, { amount: lvl * 12 }),
                getNextBenefit: (lvl) => _trT('talentCritDmg', `+${(lvl + 1) * 12}% Dano Crítico`, { amount: (lvl + 1) * 12 }),
                getValue: (lvl) => lvl * 0.12
            },
            'fuzz_lightning': {
                id: 'fuzz_lightning',
                branch: 'offense',
                name: 'Fuzz Elétrico',
                icon: 'assets/talents/lightning_note.jpg',
                desc: 'Distorção de alta voltagem. Acertos críticos disparam arcos de raios que atingem zumbis próximos.',
                level: 0,
                maxLevel: 10,
                baseCost: 500,
                costMult: 1.65,
                prereq: { id: 'ferocious_solo', level: 4 },
                getBenefit: (lvl) => lvl > 0 ? _trT('talentChainLightning', `Raios atingem até ${lvl} zumbis adjacentes`, { amount: lvl }) : _trT('talentNoChain', 'Sem raios em cadeia'),
                getNextBenefit: (lvl) => _trT('talentChainLightning', `Raios atingem até ${lvl + 1} zumbis adjacentes`, { amount: lvl + 1 }),
                getValue: (lvl) => lvl // number of chain targets
            },
            'sonic_knockback': {
                id: 'sonic_knockback',
                branch: 'offense',
                name: 'Impacto Sonoro',
                icon: 'assets/talents/guitar_power.jpg',
                desc: 'Ondas graves que empurram os zumbis com mais força para trás a cada disparo certeiro.',
                level: 0,
                maxLevel: 12,
                baseCost: 240,
                costMult: 1.60,
                prereq: { id: 'power_chord', level: 4 },
                getBenefit: (lvl) => _trT('talentKnockback', `+${lvl * 15}% Força de Empurrão`, { amount: lvl * 15 }),
                getNextBenefit: (lvl) => _trT('talentKnockback', `+${(lvl + 1) * 15}% Força de Empurrão`, { amount: (lvl + 1) * 15 }),
                getValue: (lvl) => lvl * 0.15
            },
            'air_sniper': {
                id: 'air_sniper',
                branch: 'offense',
                name: 'Air Sniper',
                icon: 'assets/talents/skull_crit.jpg',
                desc: 'Especialista em tiro ao prato. Causa dano massivo amplificado ao atingir zumbis saltadores no ar.',
                level: 0,
                maxLevel: 10,
                baseCost: 700,
                costMult: 1.70,
                prereq: { id: 'fuzz_lightning', level: 2 },
                getBenefit: (lvl) => _trT('tb_air_sniper', `+${lvl * 25}% Dano em Air Shots`, { amount: lvl * 25 }),
                getNextBenefit: (lvl) => _trT('tb_air_sniper', `+${(lvl + 1) * 25}% Dano em Air Shots`, { amount: (lvl + 1) * 25 }),
                getValue: (lvl) => lvl * 0.25
            },
            'special_fury': {
                id: 'special_fury',
                branch: 'offense',
                name: 'Fúria do Especial',
                icon: 'assets/talents/special_fury.jpg',
                desc: 'Potencializa o dano da Barra de Especial acima de 2.0x até o teto máximo de 3.0x.',
                level: 0,
                maxLevel: 10,
                baseCost: 400,
                costMult: 1.55,
                prereq: { id: 'ferocious_solo', level: 3 },
                getBenefit: (lvl) => _trT('tb_special_fury', `Dano do Especial: ${(2 + Math.min(10, lvl) * 0.1).toFixed(1)}x (teto 3.0x)`, { mult: (2 + Math.min(10, lvl) * 0.1).toFixed(1) }),
                getNextBenefit: (lvl) => _trT('tb_special_fury', `Dano do Especial: ${(2 + Math.min(10, lvl + 1) * 0.1).toFixed(1)}x (teto 3.0x)`, { mult: (2 + Math.min(10, lvl + 1) * 0.1).toFixed(1) }),
                getValue: (lvl) => Math.min(1.0, Math.round(lvl * 0.1 * 10) / 10)
            },

            // === BRANCH 2: DEFENSIVO (Palco & Resistência) ===
            'punk_toughness': {
                id: 'punk_toughness',
                branch: 'defense',
                name: 'Resistência Punk',
                icon: 'assets/talents/heart_regen.jpg',
                desc: 'O espírito incansável do rock expande a barra de vida máxima do guitarrista.',
                level: 0,
                maxLevel: 20,
                baseCost: 90,
                costMult: 1.55,
                prereq: null,
                getBenefit: (lvl) => _trT('talentMaxHp', `+${lvl * 15} Vida Máxima`, { amount: lvl * 15 }),
                getNextBenefit: (lvl) => _trT('talentMaxHp', `+${(lvl + 1) * 15} Vida Máxima`, { amount: (lvl + 1) * 15 }),
                getValue: (lvl) => lvl * 15
            },
            'armored_amp': {
                id: 'armored_amp',
                branch: 'defense',
                name: 'Amplificador Blindado',
                icon: 'assets/talents/amp_shield.jpg',
                desc: 'Caixa de som reforçada com aço que absorve e amortece os golpes recebidos dos zumbis.',
                level: 0,
                maxLevel: 15,
                baseCost: 220,
                costMult: 1.60,
                prereq: { id: 'punk_toughness', level: 3 },
                getBenefit: (lvl) => _trT('tb_armored_amp', `Reduz todo dano em -${lvl} HP`, { amount: lvl }),
                getNextBenefit: (lvl) => _trT('tb_armored_amp', `Reduz todo dano em -${lvl + 1} HP`, { amount: lvl + 1 }),
                getValue: (lvl) => lvl
            },
            'shock_barrier': {
                id: 'shock_barrier',
                branch: 'defense',
                name: 'Barreira Sônica',
                icon: 'assets/talents/amp_shield.jpg',
                desc: 'O amplificador acumula energia e gera um escudo periódico que anula 1 ataque completo de zumbi.',
                level: 0,
                maxLevel: 10,
                baseCost: 560,
                costMult: 1.68,
                prereq: { id: 'armored_amp', level: 4 },
                getBenefit: (lvl) => lvl > 0 ? _trT('tb_shock_barrier', `Escudo recarrega a cada ${Math.max(8, 22 - lvl)}s`, { sec: Math.max(8, 22 - lvl) }) : _trT('tb_shock_none', 'Sem escudo ativo'),
                getNextBenefit: (lvl) => _trT('tb_shock_barrier', `Escudo recarrega a cada ${Math.max(8, 22 - (lvl + 1))}s`, { sec: Math.max(8, 22 - (lvl + 1)) }),
                getValue: (lvl) => lvl > 0 ? Math.max(8, 22 - lvl) : 0
            },
            'rhythmic_heal': {
                id: 'rhythmic_heal',
                branch: 'defense',
                name: 'Cura Rítmica',
                icon: 'assets/talents/heart_regen.jpg',
                desc: 'Tocar no tempo perfeito restaura energia vital. Cura vida a cada 10 notas seguidas no ritmo.',
                level: 0,
                maxLevel: 12,
                baseCost: 360,
                costMult: 1.62,
                prereq: { id: 'punk_toughness', level: 5 },
                getBenefit: (lvl) => _trT('tb_rhythmic_heal', `+${lvl * 1} HP curado a cada 10 notas`, { amount: lvl }),
                getNextBenefit: (lvl) => _trT('tb_rhythmic_heal', `+${(lvl + 1) * 1} HP curado a cada 10 notas`, { amount: lvl + 1 }),
                getValue: (lvl) => lvl * 1
            },
            'rock_never_dies': {
                id: 'rock_never_dies',
                branch: 'defense',
                name: 'Rock Never Dies',
                icon: 'assets/talents/heart_regen.jpg',
                desc: 'Ao ser revivido, o guitarrista liberta uma super onda de choque e ganha escudo temporário.',
                level: 0,
                maxLevel: 5,
                baseCost: 1000,
                costMult: 1.85,
                prereq: { id: 'shock_barrier', level: 3 },
                getBenefit: (lvl) => lvl > 0 ? _trT('tb_rock_never_dies', `Revive com ${lvl}s de imunidade e repulsão`, { sec: lvl }) : _trT('tb_rock_none', 'Revive padrão'),
                getNextBenefit: (lvl) => _trT('tb_rock_never_dies', `Revive com ${lvl + 1}s de imunidade e repulsão`, { sec: lvl + 1 }),
                getValue: (lvl) => lvl
            },

            // === BRANCH 3: RITMO & TURNÊ (Economia & Ritmo) ===
            'golden_pick': {
                id: 'golden_pick',
                branch: 'rhythm',
                name: 'Palheta Dourada',
                icon: 'assets/talents/gold_pick.jpg',
                desc: 'Palheta lendária que atrai riqueza. Aumenta a quantidade de moedas de ouro caídas dos zumbis.',
                level: 0,
                maxLevel: 20,
                baseCost: 80,
                costMult: 1.52,
                prereq: null,
                getBenefit: (lvl) => _trT('tb_golden_pick', `+${lvl * 1} Moeda extra por zumbi`, { amount: lvl }),
                getNextBenefit: (lvl) => _trT('tb_golden_pick', `+${(lvl + 1) * 1} Moeda extra por zumbi`, { amount: lvl + 1 }),
                getValue: (lvl) => lvl
            },
            'fine_sync': {
                id: 'fine_sync',
                branch: 'rhythm',
                name: 'Sincronia Fina',
                icon: 'assets/talents/lightning_note.jpg',
                desc: 'Afinação perfeita nos dedos. Expande a área de tolerância para acertar notas com PERFECT!.',
                level: 0,
                maxLevel: 15,
                baseCost: 220,
                costMult: 1.60,
                prereq: { id: 'golden_pick', level: 3 },
                getBenefit: (lvl) => _trT('tb_fine_sync', `+${lvl * 4}% Janela de PERFECT!`, { amount: lvl * 4 }),
                getNextBenefit: (lvl) => _trT('tb_fine_sync', `+${(lvl + 1) * 4}% Janela de PERFECT!`, { amount: (lvl + 1) * 4 }),
                getValue: (lvl) => lvl * 0.04
            },
            'hyper_overdrive': {
                id: 'hyper_overdrive',
                branch: 'rhythm',
                name: 'Overdrive Acelerado',
                icon: 'assets/talents/guitar_power.jpg',
                desc: 'Acelera a taxa de preenchimento do medidor de Rock ao acertar notas musicais.',
                level: 0,
                maxLevel: 10,
                baseCost: 380,
                costMult: 1.65,
                prereq: { id: 'fine_sync', level: 3 },
                getBenefit: (lvl) => _trT('tb_hyper_overdrive', `+${lvl * 10}% Ganho de Rock Meter`, { amount: lvl * 10 }),
                getNextBenefit: (lvl) => _trT('tb_hyper_overdrive', `+${(lvl + 1) * 10}% Ganho de Rock Meter`, { amount: (lvl + 1) * 10 }),
                getValue: (lvl) => lvl * 0.10
            },
            'lucrative_streak': {
                id: 'lucrative_streak',
                branch: 'rhythm',
                name: 'Streak Lucrativo',
                icon: 'assets/talents/gold_pick.jpg',
                desc: 'A plateia delira com sequências perfeitas. Concede bônus em moedas a cada 15 notas em sequência.',
                level: 0,
                maxLevel: 10,
                baseCost: 520,
                costMult: 1.68,
                prereq: { id: 'golden_pick', level: 5 },
                getBenefit: (lvl) => _trT('tb_lucrative_streak', `+${lvl * 8} Moedas por 15-Streak`, { amount: lvl * 8 }),
                getNextBenefit: (lvl) => _trT('tb_lucrative_streak', `+${(lvl + 1) * 8} Moedas por 15-Streak`, { amount: (lvl + 1) * 8 }),
                getValue: (lvl) => lvl * 8
            },
            'solo_mastery': {
                id: 'solo_mastery',
                branch: 'rhythm',
                name: 'Maestria do Solo',
                icon: 'assets/talents/gold_pick.jpg',
                desc: 'Permite que o combo da highway alcance multiplicadores lendários acima de x4 (até x9!).',
                level: 0,
                maxLevel: 5,
                baseCost: 1100,
                costMult: 1.85,
                prereq: { id: 'hyper_overdrive', level: 4 },
                getBenefit: (lvl) => _trT('tb_solo_mastery', `Multiplicador máximo: x${4 + lvl}`, { mult: 4 + lvl }),
                getNextBenefit: (lvl) => _trT('tb_solo_mastery', `Multiplicador máximo: x${4 + lvl + 1}`, { mult: 4 + lvl + 1 }),
                getValue: (lvl) => 4 + lvl
            },
            'special_encore': {
                id: 'special_encore',
                branch: 'rhythm',
                name: 'Bis do Especial',
                icon: 'assets/talents/special_duration.jpg',
                desc: 'Aumenta a duração do Solo Especial de todos os guitarristas durante o combate.',
                level: 0,
                maxLevel: 10,
                baseCost: 350,
                costMult: 1.55,
                prereq: { id: 'fine_sync', level: 2 },
                getBenefit: (lvl) => _trT('tb_special_encore', `+${(lvl * 0.5).toFixed(1)}s na duração do Especial`, { sec: (lvl * 0.5).toFixed(1) }),
                getNextBenefit: (lvl) => _trT('tb_special_encore', `+${((lvl + 1) * 0.5).toFixed(1)}s na duração do Especial`, { sec: ((lvl + 1) * 0.5).toFixed(1) }),
                getValue: (lvl) => Math.round(lvl * 0.5 * 10) / 10
            },

            // === BRANCH 4: DRONES (Pets Invulneráveis & Tecnologia Aérea) ===
            'drone_firepower': {
                id: 'drone_firepower',
                branch: 'drones',
                name: 'Núcleo de Potência Drone',
                icon: 'assets/talents/drone_firepower.jpg',
                desc: 'Amplifica o poder de combate de todos os drones: aumenta Dano, Mísseis, Queimadura, Cura, Escudo e Veneno.',
                level: 0,
                maxLevel: 15,
                baseCost: 140,
                costMult: 1.55,
                prereq: null,
                getBenefit: (lvl) => _trT('tb_drone_firepower', `+${lvl * 6}% Poder de Combate dos Drones`, { amount: lvl * 6 }),
                getNextBenefit: (lvl) => _trT('tb_drone_firepower', `+${(lvl + 1) * 6}% Poder de Combate dos Drones`, { amount: (lvl + 1) * 6 }),
                getValue: (lvl) => lvl * 0.06
            },
            'drone_overclock': {
                id: 'drone_overclock',
                branch: 'drones',
                name: 'Overclock de Propulsores',
                icon: 'assets/talents/drone_overclock.jpg',
                desc: 'Turbina os circuitos de disparo dos drones, reduzindo o intervalo entre ataques, curas e pulsos de controle.',
                level: 0,
                maxLevel: 12,
                baseCost: 240,
                costMult: 1.58,
                prereq: { id: 'drone_firepower', level: 3 },
                getBenefit: (lvl) => _trT('tb_drone_overclock', `-${lvl * 3}% Tempo de Recarga dos Drones`, { amount: lvl * 3 }),
                getNextBenefit: (lvl) => _trT('tb_drone_overclock', `-${(lvl + 1) * 3}% Tempo de Recarga dos Drones`, { amount: (lvl + 1) * 3 }),
                getValue: (lvl) => lvl * 0.03
            },
            'drone_cc_mastery': {
                id: 'drone_cc_mastery',
                branch: 'drones',
                name: 'Matriz Neural de Controle',
                icon: 'assets/talents/drone_cc_mastery.jpg',
                desc: 'Prolonga a duração de Congelamento, Stun, Sono e Veneno dos drones Controladores e intensifica a lentidão.',
                level: 0,
                maxLevel: 10,
                baseCost: 340,
                costMult: 1.60,
                prereq: { id: 'drone_overclock', level: 3 },
                getBenefit: (lvl) => _trT('tb_drone_cc_mastery', `+${lvl * 8}% Duração CC & +${lvl * 2}% Lentidão`, { dur: lvl * 8, slow: lvl * 2 }),
                getNextBenefit: (lvl) => _trT('tb_drone_cc_mastery', `+${(lvl + 1) * 8}% Duração CC & +${(lvl + 1) * 2}% Lentidão`, { dur: (lvl + 1) * 8, slow: (lvl + 1) * 2 }),
                getValue: (lvl) => lvl * 0.08
            },
            'drone_synergy': {
                id: 'drone_synergy',
                branch: 'drones',
                name: 'Ressonância Drone-Herói',
                icon: 'assets/talents/drone_synergy.jpg',
                desc: 'Sincroniza o drone com o guitarrista, ampliando a Aura de Dano, a restauração de Rock Mana e o Escudo Acústico.',
                level: 0,
                maxLevel: 12,
                baseCost: 380,
                costMult: 1.62,
                prereq: { id: 'drone_firepower', level: 5 },
                getBenefit: (lvl) => _trT('tb_drone_synergy', `+${lvl * 5}% Sinergia (Aura, Mana & Escudo)`, { amount: lvl * 5 }),
                getNextBenefit: (lvl) => _trT('tb_drone_synergy', `+${(lvl + 1) * 5}% Sinergia (Aura, Mana & Escudo)`, { amount: (lvl + 1) * 5 }),
                getValue: (lvl) => lvl * 0.05
            },
            'drone_xp_boost': {
                id: 'drone_xp_boost',
                branch: 'drones',
                name: 'Telemetria de Evolução',
                icon: 'assets/talents/drone_xp_boost.jpg',
                desc: 'Acelera o aprendizado em combate, aumentando o XP obtido pelos drones em abates, fases e duelos PvP.',
                level: 0,
                maxLevel: 10,
                baseCost: 260,
                costMult: 1.56,
                prereq: { id: 'drone_overclock', level: 2 },
                getBenefit: (lvl) => _trT('tb_drone_xp_boost', `+${lvl * 10}% XP de Combate para Drones`, { amount: lvl * 10 }),
                getNextBenefit: (lvl) => _trT('tb_drone_xp_boost', `+${(lvl + 1) * 10}% XP de Combate para Drones`, { amount: (lvl + 1) * 10 }),
                getValue: (lvl) => lvl * 0.10
            }
        };

        this.loadProgress();
        this.setupDOM();
    }

    // Cost formula with exponential slow progression (doubled base cost for long-term progression)
    getCost(talent) {
        if (talent.level >= talent.maxLevel) return Infinity;
        return Math.floor(2 * talent.baseCost * Math.pow(talent.costMult, talent.level));
    }

    isUnlocked(talent) {
        if (!talent.prereq) return true;
        const req = this.talents[talent.prereq.id];
        return req && req.level >= talent.prereq.level;
    }

    canAfford(talent) {
        return this.gold >= this.getCost(talent);
    }

    upgrade(talentId) {
        const talent = this.talents[talentId];
        if (!talent) return false;
        if (!this.isUnlocked(talent)) return false;
        if (talent.level >= talent.maxLevel) return false;

        const cost = this.getCost(talent);
        if (this.gold < cost) return false;

        this.gold -= cost;
        talent.level++;
        this.saveProgress();

        if (window.soundEngine) {
            window.soundEngine.playGuitarChord(4); // celebratory chord
        }

        this.updateUI();
        this.syncWithCombat();
        if (window.game && typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
        if (window.droneSystem && typeof window.droneSystem.renderPreBattleDroneCard === 'function') {
            window.droneSystem.renderPreBattleDroneCard();
            window.droneSystem.renderShopDrones();
            window.droneSystem.updatePvPDroneCardPreview();
        }
        return true;
    }

    addGold(amount) {
        this.gold += amount;
        this.saveProgress();
        this.updateHUDGold();
    }

    getStat(talentId) {
        const t = this.talents[talentId];
        return t ? t.getValue(t.level) : 0;
    }

    getTotalUpgrades() {
        let total = 0;
        for (const k in this.talents) {
            total += this.talents[k].level;
        }
        return total;
    }

    getMaxTotalUpgrades() {
        return Object.values(this.talents).reduce((sum, t) => sum + (t.maxLevel || 0), 0);
    }

    saveProgress() {
        const doSave = () => {
            try {
                const data = { gold: this.gold, levels: {} };
                for (const k in this.talents) data.levels[k] = this.talents[k].level;
                localStorage.setItem('gvs_talent_data', JSON.stringify(data));
            } catch (e) { console.warn("Could not save talent progress", e); }
        };
        if (typeof window !== 'undefined' && window.PerfUtils && typeof window.PerfUtils.deferSave === 'function') {
            window.PerfUtils.deferSave('talent_data', doSave);
        } else {
            doSave();
        }
    }

    loadProgress() {
        try {
            const raw = localStorage.getItem('gvs_talent_data');
            if (raw) {
                const data = JSON.parse(raw);
                if (typeof data.gold === 'number') this.gold = data.gold;
                if (data.levels) {
                    for (const k in data.levels) {
                        if (this.talents[k]) {
                            this.talents[k].level = Math.min(this.talents[k].maxLevel, data.levels[k]);
                        }
                    }
                }
            } else {
                // Initial starter gold (5,000) for new players
                this.gold = 5000;
            }
        } catch (e) {
            console.warn("Could not load talent progress", e);
        }
    }

    syncWithCombat() {
        if (!window.game || !window.game.combat) return;
        const combat = window.game.combat;

        // Update Hero Max HP
        const hpBonus = this.getStat('punk_toughness');
        const prevMax = combat.heroMaxHp;
        combat.heroMaxHp = 100 + hpBonus;
        if (combat.heroMaxHp > prevMax) {
            combat.heroHp = Math.min(combat.heroMaxHp, combat.heroHp + (combat.heroMaxHp - prevMax));
        }
    }

    setupDOM() {
        // Talent Toggle Button
        const toggleBtn = document.getElementById('menu-btn-talents') || document.getElementById('talents-toggle');
        const modal = document.getElementById('talent-modal');
        const closeBtn = document.getElementById('talent-close-btn');

        if (toggleBtn && modal && typeof toggleBtn.addEventListener === 'function') {
            toggleBtn.addEventListener('click', () => {
                modal.classList.add('open');
                this.updateUI();
            });
        }
        if (closeBtn && modal && typeof closeBtn.addEventListener === 'function') {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        // Branch Tabs
        if (typeof document.querySelectorAll === 'function') {
            document.querySelectorAll('.talent-tab').forEach(tab => {
                if (typeof tab.addEventListener !== 'function') return;
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.talent-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.activeBranch = tab.getAttribute('data-branch');
                    for (const k in this.talents) {
                        if (this.talents[k].branch === this.activeBranch) {
                            this.selectedTalentId = k;
                            break;
                        }
                    }
                    this.updateUI();
                });
            });
        }

        // Upgrade Action Button in Inspector
        const upgradeBtn = document.getElementById('talent-upgrade-action');
        if (upgradeBtn && typeof upgradeBtn.addEventListener === 'function') {
            upgradeBtn.addEventListener('click', () => {
                this.upgrade(this.selectedTalentId);
            });
        }

        this.updateHUDGold();
    }

    updateHUDGold() {
        const el = document.getElementById('menu-gold-count') || document.getElementById('gold-count');
        if (el) el.innerText = this.gold.toLocaleString();
        const modalGold = document.getElementById('modal-gold-count');
        if (modalGold) modalGold.innerText = this.gold.toLocaleString();
    }

    updateUI() {
        this.updateHUDGold();

        // Modal Gold & Progress
        const modalGold = document.getElementById('modal-gold-count');
        if (modalGold) modalGold.innerText = this.gold.toLocaleString();

        const progressEl = document.getElementById('modal-total-upgrades');
        if (progressEl) progressEl.innerText = `${this.getTotalUpgrades()} / ${this.getMaxTotalUpgrades()}`;

        // Render Branch Nodes
        const container = document.getElementById('talent-nodes-container');
        if (container) {
            container.innerHTML = '';

            const branchTalents = Object.values(this.talents).filter(t => t.branch === this.activeBranch);

            branchTalents.forEach(t => {
                const unlocked = this.isUnlocked(t);
                const cost = this.getCost(t);
                const affordable = this.canAfford(t);
                const isMax = t.level >= t.maxLevel;
                const isSelected = t.id === this.selectedTalentId;

                const node = document.createElement('div');
                node.className = `talent-node ${unlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''} ${isMax ? 'maxed' : ''}`;
                node.onclick = () => {
                    this.selectedTalentId = t.id;
                    this.updateUI();
                };

                const tName = _trT(`talent_${t.id}_name`, t.name);
                node.innerHTML = `
                    <div class="node-icon-wrap">
                        <img src="${t.icon}" alt="${tName}" class="node-icon">
                        ${!unlocked ? '<div class="node-lock-badge">🔒</div>' : ''}
                        ${isMax ? '<div class="node-max-badge">MAX</div>' : ''}
                    </div>
                    <div class="node-info">
                        <div class="node-name">${tName}</div>
                        <div class="node-level">${_trT('levelShort', 'Nv.')} ${t.level}/${t.maxLevel}</div>
                    </div>
                    <div class="node-benefit-preview">${t.getBenefit(t.level)}</div>
                `;

                container.appendChild(node);
            });
        }

        // Render Inspector for Selected Talent
        this.renderInspector();
    }

    renderInspector() {
        const talent = this.talents[this.selectedTalentId];
        if (!talent) return;

        const iconEl = document.getElementById('inspector-icon');
        const nameEl = document.getElementById('inspector-name');
        const descEl = document.getElementById('inspector-desc');
        const levelBadge = document.getElementById('inspector-level');
        const barFill = document.getElementById('inspector-progress-fill');
        const currentBenefit = document.getElementById('inspector-current-benefit');
        const nextBenefit = document.getElementById('inspector-next-benefit');
        const costEl = document.getElementById('inspector-cost-val');
        const upgradeBtn = document.getElementById('talent-upgrade-action');
        const reqEl = document.getElementById('inspector-requirement');

        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        if (iconEl) iconEl.src = talent.icon;
        if (nameEl) nameEl.innerText = tr(`talent_${talent.id}_name`, talent.name);
        if (descEl) descEl.innerText = tr(`talent_${talent.id}_desc`, talent.desc);
        if (levelBadge) levelBadge.innerText = tr('inspectorLevel', `NÍVEL ${talent.level} / ${talent.maxLevel}`, { level: talent.level, max: talent.maxLevel });

        const pct = Math.round((talent.level / talent.maxLevel) * 100);
        if (barFill) barFill.style.width = `${pct}%`;

        if (currentBenefit) currentBenefit.innerText = talent.level > 0 ? talent.getBenefit(talent.level) : tr('noBonus', 'Nenhum bônus');
        if (nextBenefit) nextBenefit.innerText = talent.level < talent.maxLevel ? talent.getNextBenefit(talent.level) : tr('maxLevelReached', 'Nível Máximo Atingido!');

        const unlocked = this.isUnlocked(talent);
        const cost = this.getCost(talent);
        const affordable = this.canAfford(talent);
        const isMax = talent.level >= talent.maxLevel;

        if (reqEl) {
            if (!unlocked && talent.prereq) {
                const reqTalent = this.talents[talent.prereq.id];
                const reqName = tr(`talent_${reqTalent.id}_name`, reqTalent.name);
                reqEl.innerText = tr('requiresPrereq', `🔒 Requer: ${reqName} Nv. ${talent.prereq.level}`, { name: reqName, level: talent.prereq.level });
                reqEl.style.display = 'block';
            } else {
                reqEl.style.display = 'none';
            }
        }

        if (costEl) {
            costEl.innerText = isMax ? tr('maxLevel', 'MÁXIMO') : `${cost.toLocaleString()} 🪙`;
        }

        if (upgradeBtn) {
            if (isMax) {
                upgradeBtn.innerText = tr('maxLevel', 'NÍVEL MÁXIMO');
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn maxed';
            } else if (!unlocked) {
                upgradeBtn.innerText = tr('locked', 'BLOQUEADO');
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn locked';
            } else if (!affordable) {
                upgradeBtn.innerText = tr('needGold', `FALTAM ${(cost - this.gold).toLocaleString()} 🪙`, { amount: (cost - this.gold).toLocaleString() });
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn broke';
            } else {
                upgradeBtn.innerText = `${tr('btnUpgrade', 'MELHORAR')} (${cost.toLocaleString()} 🪙)`;
                upgradeBtn.disabled = false;
                upgradeBtn.className = 'upgrade-btn ready';
            }
        }
    }

    open() {
        const modal = document.getElementById('talent-modal');
        if (modal) {
            modal.classList.add('open');
            this.updateUI();
        }
    }

    close() {
        const modal = document.getElementById('talent-modal');
        if (modal) {
            modal.classList.remove('open');
        }
    }
}

window.talentSystem = new TalentSystem();
