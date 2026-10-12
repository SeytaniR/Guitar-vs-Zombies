// AAA Talent Tree System for Guitar vs Zombies
class TalentSystem {
    constructor() {
        this.gold = 0;
        this.activeBranch = 'offense'; // 'offense', 'defense', 'rhythm'
        this.selectedTalentId = 'power_chord';

        // 15 Comprehensive Talents across 3 Branches with Slow Progression Curve
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
                getBenefit: (lvl) => `+${lvl * 5} Dano Base`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 5} Dano Base`,
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
                getBenefit: (lvl) => `+${lvl * 12}% Dano Crítico`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 12}% Dano Crítico`,
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
                getBenefit: (lvl) => lvl > 0 ? `Raios atingem até ${lvl} zumbis adjacentes` : 'Sem raios em cadeia',
                getNextBenefit: (lvl) => `Raios atingem até ${lvl + 1} zumbis adjacentes`,
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
                getBenefit: (lvl) => `+${lvl * 15}% Força de Empurrão`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 15}% Força de Empurrão`,
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
                getBenefit: (lvl) => `+${lvl * 25}% Dano em Air Shots`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 25}% Dano em Air Shots`,
                getValue: (lvl) => lvl * 0.25
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
                getBenefit: (lvl) => `+${lvl * 15} Vida Máxima`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 15} Vida Máxima`,
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
                getBenefit: (lvl) => `Reduz todo dano em -${lvl} HP`,
                getNextBenefit: (lvl) => `Reduz todo dano em -${lvl + 1} HP`,
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
                getBenefit: (lvl) => lvl > 0 ? `Escudo recarrega a cada ${Math.max(8, 22 - lvl)}s` : 'Sem escudo ativo',
                getNextBenefit: (lvl) => `Escudo recarrega a cada ${Math.max(8, 22 - (lvl + 1))}s`,
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
                getBenefit: (lvl) => `+${lvl * 1} HP curado a cada 10 notas`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 1} HP curado a cada 10 notas`,
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
                getBenefit: (lvl) => lvl > 0 ? `Revive com ${lvl}s de imunidade e repulsão` : 'Revive padrão',
                getNextBenefit: (lvl) => `Revive com ${lvl + 1}s de imunidade e repulsão`,
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
                getBenefit: (lvl) => `+${lvl * 1} Moeda extra por zumbi`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 1} Moeda extra por zumbi`,
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
                getBenefit: (lvl) => `+${lvl * 4}% Janela de PERFECT!`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 4}% Janela de PERFECT!`,
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
                getBenefit: (lvl) => `+${lvl * 10}% Ganho de Rock Meter`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 10}% Ganho de Rock Meter`,
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
                getBenefit: (lvl) => `+${lvl * 8} Moedas por 15-Streak`,
                getNextBenefit: (lvl) => `+${(lvl + 1) * 8} Moedas por 15-Streak`,
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
                getBenefit: (lvl) => `Multiplicador máximo: x${4 + lvl}`,
                getNextBenefit: (lvl) => `Multiplicador máximo: x${4 + lvl + 1}`,
                getValue: (lvl) => 4 + lvl
            }
        };

        this.loadProgress();
        this.setupDOM();
    }

    // Cost formula with exponential slow progression
    getCost(talent) {
        if (talent.level >= talent.maxLevel) return Infinity;
        return Math.floor(talent.baseCost * Math.pow(talent.costMult, talent.level));
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

    saveProgress() {
        try {
            const data = {
                gold: this.gold,
                levels: {}
            };
            for (const k in this.talents) {
                data.levels[k] = this.talents[k].level;
            }
            localStorage.setItem('gvs_talent_data', JSON.stringify(data));
        } catch (e) {
            console.warn("Could not save talent progress", e);
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
                // Initial starter stash for fun immediate first upgrade
                this.gold = 50;
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
        const toggleBtn = document.getElementById('talents-toggle');
        const modal = document.getElementById('talent-modal');
        const closeBtn = document.getElementById('talent-close-btn');

        if (toggleBtn && modal) {
            toggleBtn.addEventListener('click', () => {
                modal.classList.add('open');
                this.updateUI();
            });
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        // Branch Tabs
        document.querySelectorAll('.talent-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.talent-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeBranch = tab.getAttribute('data-branch');
                
                // Select first talent in new branch
                for (const k in this.talents) {
                    if (this.talents[k].branch === this.activeBranch) {
                        this.selectedTalentId = k;
                        break;
                    }
                }
                this.updateUI();
            });
        });

        // Upgrade Action Button in Inspector
        const upgradeBtn = document.getElementById('talent-upgrade-action');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.upgrade(this.selectedTalentId);
            });
        }

        this.updateHUDGold();
    }

    updateHUDGold() {
        const el = document.getElementById('gold-count');
        if (el) el.innerText = this.gold.toLocaleString();
    }

    updateUI() {
        this.updateHUDGold();

        // Modal Gold & Progress
        const modalGold = document.getElementById('modal-gold-count');
        if (modalGold) modalGold.innerText = this.gold.toLocaleString();

        const progressEl = document.getElementById('modal-total-upgrades');
        if (progressEl) progressEl.innerText = `${this.getTotalUpgrades()} / 188`;

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

                node.innerHTML = `
                    <div class="node-icon-wrap">
                        <img src="${t.icon}" alt="${t.name}" class="node-icon">
                        ${!unlocked ? '<div class="node-lock-badge">🔒</div>' : ''}
                        ${isMax ? '<div class="node-max-badge">MAX</div>' : ''}
                    </div>
                    <div class="node-info">
                        <div class="node-name">${t.name}</div>
                        <div class="node-level">Nv. ${t.level}/${t.maxLevel}</div>
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

        if (iconEl) iconEl.src = talent.icon;
        if (nameEl) nameEl.innerText = talent.name;
        if (descEl) descEl.innerText = talent.desc;
        if (levelBadge) levelBadge.innerText = `NÍVEL ${talent.level} / ${talent.maxLevel}`;

        const pct = Math.round((talent.level / talent.maxLevel) * 100);
        if (barFill) barFill.style.width = `${pct}%`;

        if (currentBenefit) currentBenefit.innerText = talent.level > 0 ? talent.getBenefit(talent.level) : 'Nenhum bônus';
        if (nextBenefit) nextBenefit.innerText = talent.level < talent.maxLevel ? talent.getNextBenefit(talent.level) : 'Nível Máximo Atingido!';

        const unlocked = this.isUnlocked(talent);
        const cost = this.getCost(talent);
        const affordable = this.canAfford(talent);
        const isMax = talent.level >= talent.maxLevel;

        if (reqEl) {
            if (!unlocked && talent.prereq) {
                const reqTalent = this.talents[talent.prereq.id];
                reqEl.innerText = `🔒 Requer: ${reqTalent.name} Nv. ${talent.prereq.level}`;
                reqEl.style.display = 'block';
            } else {
                reqEl.style.display = 'none';
            }
        }

        if (costEl) {
            costEl.innerText = isMax ? 'MÁXIMO' : `${cost.toLocaleString()} 🪙`;
        }

        if (upgradeBtn) {
            if (isMax) {
                upgradeBtn.innerText = 'NÍVEL MÁXIMO';
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn maxed';
            } else if (!unlocked) {
                upgradeBtn.innerText = 'BLOQUEADO';
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn locked';
            } else if (!affordable) {
                upgradeBtn.innerText = `FALTAM ${(cost - this.gold).toLocaleString()} 🪙`;
                upgradeBtn.disabled = true;
                upgradeBtn.className = 'upgrade-btn broke';
            } else {
                upgradeBtn.innerText = `MELHORAR (${cost.toLocaleString()} 🪙)`;
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
