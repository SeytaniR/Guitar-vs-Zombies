// SkillSystem - Modular 4-Lane Skill Loadout, Mana Execution & Effects Engine
class SkillSystem {
    constructor() {
        this.skills = [
            {
                id: 'basic_strike',
                name: 'Ataque Sônico',
                type: 'attack',
                manaCost: 0,
                damageMult: 1.0,
                desc: 'Disparo sônico equilibrado direto das cordas da guitarra.',
                icon: '🎵',
                color: '#00ffff',
                apply: (combat, target, baseDmg) => {
                    return { damage: baseDmg, label: '', color: '#00ffff' };
                }
            },
            {
                id: 'power_chord',
                name: 'Power Chord Pesado',
                type: 'dps',
                manaCost: 8,
                damageMult: 2.2,
                desc: 'Riff explosivo devastador com 220% de dano e forte repulsão.',
                icon: '⚡',
                color: '#ff00ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.2);
                    if (target) {
                        target.x += 24;
                    }
                    combat.triggerShake(4.5);
                    return { damage: dmg, label: '💥 POWER CHORD!', color: '#ff00ff' };
                }
            },
            {
                id: 'healing_melody',
                name: 'Melodia Regenerativa',
                type: 'heal',
                manaCost: 12,
                damageMult: 0.75,
                desc: 'Solo acústico suave que restaura +20 HP do guitarrista enquanto fere o zumbi.',
                icon: '💚',
                color: '#00ff66',
                apply: (combat, target, baseDmg) => {
                    const healAmount = 20 + (window.talentSystem ? window.talentSystem.getStat('regen_pick') * 3 : 0);
                    combat.healHero(healAmount);
                    return { damage: Math.round(baseDmg * 0.75), label: '💚 REGEN!', color: '#00ff66' };
                }
            },
            {
                id: 'acoustic_stun',
                name: 'Choque Atordoante',
                type: 'stun',
                manaCost: 10,
                damageMult: 1.2,
                desc: 'Onda sonora de alta voltagem que causa 120% de dano e paralisa o alvo por 2.0s.',
                icon: '💫',
                color: '#ffcc00',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.2);
                    if (target) {
                        target.stunTimer = 2.0;
                        combat.addFloatingText('💫 ATORDOADO!', target.x, target.y - 48, '#ffcc00', true);
                    }
                    return { damage: dmg, label: '⚡ STUN!', color: '#ffcc00' };
                }
            },
            {
                id: 'fuzz_slow',
                name: 'Fuzz Dissuasivo',
                type: 'slow',
                manaCost: 9,
                damageMult: 0.9,
                desc: 'Distorção grave e pesada que reduz a velocidade de todos os zumbis em 50% por 3.5s.',
                icon: '❄️',
                color: '#00d4ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.9);
                    combat.entities.zombies.forEach(z => {
                        if (z.active) {
                            z.slowTimer = 3.5;
                            z.slowFactor = 0.50;
                        }
                    });
                    combat.addFloatingText('❄️ LENTIDÃO NA HORDA!', combat.getHeroPosition().x + 80, combat.getHeroPosition().y - 60, '#00d4ff', true);
                    return { damage: dmg, label: '❄️ LENTO!', color: '#00d4ff' };
                }
            },
            {
                id: 'pyro_riff',
                name: 'Riff Pirotécnico',
                type: 'burn',
                manaCost: 10,
                damageMult: 1.3,
                desc: 'Labareda sônica abrasadora que inflige queimadura contínua (22 DPS por 3.5s).',
                icon: '🔥',
                color: '#ff4500',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.3);
                    if (target) {
                        target.burnTimer = 3.5;
                        target.burnDps = 22;
                        combat.addFloatingText('🔥 QUEIMADURA!', target.x, target.y - 48, '#ff4500', true);
                    }
                    return { damage: dmg, label: '🔥 CHAMA!', color: '#ff4500' };
                }
            },
            {
                id: 'sonic_shield',
                name: 'Escudo Harmônico',
                type: 'shield',
                manaCost: 14,
                damageMult: 0.8,
                desc: 'Efeito ressonante que ergue uma barreira absorvendo até 35 de dano sofrido por 4s.',
                icon: '🛡️',
                color: '#00a2ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.8);
                    combat.heroShieldHp = (combat.heroShieldHp || 0) + 35;
                    combat.heroShieldTimer = 4.0;
                    combat.addFloatingText('🛡️ ESCUDO SÔNICO (+35)', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#00a2ff', true);
                    return { damage: dmg, label: '🛡️ DEFESA!', color: '#00a2ff' };
                }
            },
            {
                id: 'overdrive_frenzy',
                name: 'Frenesi Overdrive',
                type: 'buff',
                manaCost: 15,
                damageMult: 1.25,
                desc: 'Eleva a velocidade de ataque do guitarrista em +50% por 4.0 segundos.',
                icon: '🚀',
                color: '#ff0055',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.25);
                    combat.heroAttackSpeedBuffTimer = 4.0;
                    combat.heroAttackSpeedBuffMult = 1.50;
                    combat.addFloatingText('🚀 VELOCIDADE +50%!', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#ff0055', true);
                    return { damage: dmg, label: '🚀 FRENESI!', color: '#ff0055' };
                }
            }
        ];

        this.equipped = this.loadEquipped();
    }

    loadEquipped() {
        try {
            const raw = localStorage.getItem('gvs_equipped_lane_skills');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === 4) {
                    return parsed;
                }
            }
        } catch(e) {}
        return ['basic_strike', 'basic_strike', 'basic_strike', 'basic_strike'];
    }

    saveEquipped() {
        try {
            localStorage.setItem('gvs_equipped_lane_skills', JSON.stringify(this.equipped));
        } catch(e) {}
    }

    getSkillById(id) {
        return this.skills.find(s => s.id === id) || this.skills[0];
    }

    getEquippedSkill(laneIndex) {
        const id = this.equipped[laneIndex] || 'basic_strike';
        return this.getSkillById(id);
    }

    getSkillForLane(laneIndex) {
        return this.getEquippedSkill(laneIndex);
    }

    getEquippedSkills() {
        return this.equipped.map(id => this.getSkillById(id));
    }

    equipSkill(laneIndex, skillId) {
        if (laneIndex >= 0 && laneIndex < 4) {
            this.equipped[laneIndex] = skillId;
            this.saveEquipped();
            return true;
        }
        return false;
    }

    equipSkillToLane(laneIndex, skillId) {
        return this.equipSkill(laneIndex, skillId);
    }

    getAllSkills() {
        return this.skills;
    }
}

window.skillSystem = new SkillSystem();
