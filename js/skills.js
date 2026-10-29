// SkillSystem - Modular 4-Lane Skill Loadout, Unique Guitarist Skill Catalogues (5+ per Hero), Mana Cost & Stage Rules
class SkillSystem {
    constructor() {
        this.skills = [
            // Universal Base Attack (Always available for all guitarists)
            {
                id: 'basic_strike',
                heroId: 'all',
                name: 'Palhetada Sônica',
                type: 'basic',
                manaCost: 0,
                damageMult: 1.0,
                desc: 'Palhetada rítmica constante disparada contra os zumbis. Ataque básico padrão sem consumo de MP.',
                icon: '🎵',
                color: '#00ffff',
                apply: (combat, target, baseDmg) => {
                    return { damage: baseDmg, label: '', color: '#00ffff' };
                }
            },

            // ==========================================
            // 1. Johnny "Riff" Blaze (Punk Rocker Clássico)
            // ==========================================
            {
                id: 'blaze_power_chord',
                heroId: 'johnny_blaze',
                name: 'Power Chord Clássico',
                type: 'dps',
                manaCost: 8,
                damageMult: 2.2,
                desc: 'Riff explosivo de garagem com 220% de dano e forte repulsão sônica (+25px).',
                icon: '⚡',
                color: '#ff5500',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.2);
                    if (target) target.x += 25;
                    combat.triggerShake(4);
                    return { damage: dmg, label: '⚡ POWER CHORD!', color: '#ff5500' };
                }
            },
            {
                id: 'blaze_garage_shred',
                heroId: 'johnny_blaze',
                name: 'Solo Punk de Garagem',
                type: 'buff',
                manaCost: 11,
                damageMult: 1.4,
                desc: 'Sequência veloz de palhetadas que causa 140% de dano e eleva o ritmo de ataque em +35% por 3.5s.',
                icon: '🎸',
                color: '#ffaa00',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.4);
                    combat.heroAttackSpeedBuffTimer = 3.5;
                    combat.heroAttackSpeedBuffMult = 1.35;
                    combat.addFloatingText('🚀 VELOCIDADE +35%!', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#ffaa00', true);
                    return { damage: dmg, label: '🎸 SOLO PUNK!', color: '#ffaa00' };
                }
            },
            {
                id: 'blaze_stage_dive',
                heroId: 'johnny_blaze',
                name: 'Stage Dive Acústico',
                type: 'aoe',
                manaCost: 13,
                damageMult: 1.8,
                desc: 'Salto sísmico de palco: 180% no alvo e 80% de dano colateral em área a até 90px.',
                icon: '💥',
                color: '#ff3300',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.8);
                    combat.triggerShake(6);
                    if (target) {
                        combat.entities.zombies.forEach(z => {
                            if (z.active && z !== target && Math.abs(z.x - target.x) < 90) {
                                z.hp -= Math.round(baseDmg * 0.8);
                                z.flashTime = 0.15;
                                combat.addFloatingText(`💥 -${Math.round(baseDmg * 0.8)}`, z.x, z.y - 30, '#ff3300', false);
                            }
                        });
                    }
                    return { damage: dmg, label: '💥 STAGE DIVE!', color: '#ff3300' };
                }
            },
            {
                id: 'blaze_sound_concussion',
                heroId: 'johnny_blaze',
                name: 'Microfonia Ensurdecedora',
                type: 'stun',
                manaCost: 10,
                damageMult: 1.25,
                desc: 'Aproxima os captadores da caixa gerando microfonia violenta: causa 125% de dano e atordoa o zumbi por 2.0s.',
                icon: '🔊',
                color: '#ffcc00',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.25);
                    if (target) {
                        target.stunTimer = 2.0;
                        combat.addFloatingText('🔊 ENSURDECIDO!', target.x, target.y - 48, '#ffcc00', true);
                    }
                    return { damage: dmg, label: '🔊 MICROFONIA!', color: '#ffcc00' };
                }
            },
            {
                id: 'blaze_adrenaline_surge',
                heroId: 'johnny_blaze',
                name: 'Adrenalina de Palco',
                type: 'heal',
                manaCost: 12,
                damageMult: 1.1,
                desc: 'Êxtase de rock n roll que revigora o músico, restaurando +22 HP do guitarrista.',
                icon: '💚',
                color: '#00ff66',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.1);
                    const healBonus = window.talentSystem ? window.talentSystem.getStat('rhythmic_heal') * 3 : 0;
                    combat.healHero(22 + healBonus);
                    return { damage: dmg, label: '💚 +22 HP ROCK!', color: '#00ff66' };
                }
            },

            // ==========================================
            // 2. Vulkan "Ironhead" (Piromaníaco das Wastelands)
            // ==========================================
            {
                id: 'vulkan_flamethrower',
                heroId: 'vulkan_ironhead',
                name: 'Riff Pirotécnico de Palco',
                type: 'burn',
                manaCost: 10,
                damageMult: 1.35,
                desc: 'Labareda sônica expelida pelo braço da guitarra que incendeia o zumbi (26 DPS por 4.0s).',
                icon: '🔥',
                color: '#ff3300',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.35);
                    if (target) {
                        target.burnTimer = 4.0;
                        target.burnDps = 26;
                        combat.addFloatingText('🔥 EM CHAMAS!', target.x, target.y - 48, '#ff3300', true);
                    }
                    return { damage: dmg, label: '🔥 PIROTECNIA!', color: '#ff3300' };
                }
            },
            {
                id: 'vulkan_v8_backfire',
                heroId: 'vulkan_ironhead',
                name: 'Riff V8 Valvulado',
                type: 'dps',
                manaCost: 12,
                damageMult: 2.15,
                desc: 'Riff estrondoso acoplado a válvulas de alta octanagem: 215% de dano e recuo brutal de 35px no zumbi frontal.',
                icon: '🏎️',
                color: '#ff6600',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.15);
                    if (target) target.x += 35;
                    combat.triggerShake(5);
                    return { damage: dmg, label: '💥 V8 BACKFIRE!', color: '#ff6600' };
                }
            },
            {
                id: 'vulkan_napalm_wave',
                heroId: 'vulkan_ironhead',
                name: 'Onda Piromusical de Palco',
                type: 'aoe_burn',
                manaCost: 14,
                damageMult: 1.5,
                desc: 'Detona pirotecnia de palco em toda a pista, espalhando chamas sobre todos os zumbis ativos (16 DPS por 3.5s).',
                icon: '🌋',
                color: '#ff1100',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.5);
                    combat.entities.zombies.forEach(z => {
                        if (z.active) {
                            z.burnTimer = 3.5;
                            z.burnDps = 16;
                        }
                    });
                    combat.addFloatingText('🌋 SHOW DE FOGO!', combat.getHeroPosition().x + 80, combat.getHeroPosition().y - 55, '#ff1100', true);
                    return { damage: dmg, label: '🌋 PIROTECNIA!', color: '#ff1100' };
                }
            },
            {
                id: 'vulkan_molten_pick',
                heroId: 'vulkan_ironhead',
                name: 'Palheta Incandescente de Metal',
                type: 'pierce',
                manaCost: 9,
                damageMult: 1.85,
                desc: 'Palhetada pesada de aço fundido com 185% de dano que rasga blindagens e perfura zumbis.',
                icon: '🎸',
                color: '#ff9900',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.85);
                    combat.triggerShake(3);
                    return { damage: dmg, label: '🎸 PALHETA EM BRASA!', color: '#ff9900' };
                }
            },
            {
                id: 'vulkan_ember_shield',
                heroId: 'vulkan_ironhead',
                name: 'Paredão Valvulado Incandescente',
                type: 'shield',
                manaCost: 13,
                damageMult: 0.85,
                desc: 'Ergue uma muralha de amplificadores valvulados incandescentes que absorve até 42 de dano recebido por 4.5s.',
                icon: '🔊',
                color: '#cc3300',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.85);
                    combat.heroShieldHp = (combat.heroShieldHp || 0) + 42;
                    combat.heroShieldTimer = 4.5;
                    combat.addFloatingText('🔊 PAREDÃO VALVULADO (+42)', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#cc3300', true);
                    return { damage: dmg, label: '🔊 PAREDÃO VALVULADO!', color: '#cc3300' };
                }
            },

            // ==========================================
            // 3. Dr. Radix Biohazard (Solista Bioquímico)
            // ==========================================
            {
                id: 'radix_caustic_spray',
                heroId: 'dr_radix',
                name: 'Riff Ácido Corrosivo',
                type: 'acid',
                manaCost: 8,
                damageMult: 1.6,
                desc: 'Acordes saturados com pedal Fuzz ácido: causa 160% de dano e corrói a carcaça do zumbi (-20 HP).',
                icon: '🧪',
                color: '#39ff14',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.6);
                    if (target) {
                        target.hp -= 20;
                        combat.addFloatingText('🧪 CORROSÃO SÔNICA (-20)', target.x, target.y - 45, '#39ff14', false);
                    }
                    return { damage: dmg, label: '🧪 RIFF CÁUSTICO!', color: '#39ff14' };
                }
            },
            {
                id: 'radix_uranium_ray',
                heroId: 'dr_radix',
                name: 'Solo Radioativo de Alta Frequência',
                type: 'radiation',
                manaCost: 13,
                damageMult: 2.35,
                desc: 'Solo agudo e estridente modulado em radiação gama com 235% de dano que irradia o alvo com choque bioacústico.',
                icon: '☢️',
                color: '#00ff66',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.35);
                    combat.triggerShake(5);
                    return { damage: dmg, label: '☢️ SOLO RADIOATIVO!', color: '#00ff66' };
                }
            },
            {
                id: 'radix_decay_cloud',
                heroId: 'dr_radix',
                name: 'Distorção Tóxica de Fuzz',
                type: 'slow_toxic',
                manaCost: 11,
                damageMult: 1.0,
                desc: 'Ondas graves e fumaça tóxica de amplificador que reduzem a velocidade da marcha zumbi em 50% por 4.0s.',
                icon: '☣️',
                color: '#33cc33',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.0);
                    combat.entities.zombies.forEach(z => {
                        if (z.active) {
                            z.slowTimer = 4.0;
                            z.slowFactor = 0.50;
                        }
                    });
                    combat.addFloatingText('☣️ MARCHA DESACELERADA!', combat.getHeroPosition().x + 80, combat.getHeroPosition().y - 55, '#33cc33', true);
                    return { damage: dmg, label: '☣️ DISTORÇÃO TÓXICA!', color: '#33cc33' };
                }
            },
            {
                id: 'radix_mutant_burst',
                heroId: 'dr_radix',
                name: 'Acorde Dissonante Bioacústico',
                type: 'aoe',
                manaCost: 14,
                damageMult: 1.75,
                desc: 'Acorde dissonante de grunge tóxico com 175% de dano que reverbera em explosão ácida nos zumbis vizinhos.',
                icon: '💥',
                color: '#76ff03',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.75);
                    combat.triggerShake(4.5);
                    if (target) {
                        combat.entities.zombies.forEach(z => {
                            if (z.active && z !== target && Math.abs(z.x - target.x) < 85) {
                                z.hp -= Math.round(baseDmg * 0.7);
                                z.flashTime = 0.15;
                            }
                        });
                    }
                    return { damage: dmg, label: '💥 ACORDE DISSONANTE!', color: '#76ff03' };
                }
            },
            {
                id: 'radix_antidote_infusion',
                heroId: 'dr_radix',
                name: 'Dose Energética Bio-Rock',
                type: 'heal',
                manaCost: 12,
                damageMult: 0.85,
                desc: 'Mistura estimulante de laboratório do rockstar que purifica o organismo e restaura +26 HP do herói.',
                icon: '🧬',
                color: '#00e676',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.85);
                    combat.healHero(26);
                    return { damage: dmg, label: '🧬 +26 HP BIO-ROCK!', color: '#00e676' };
                }
            },

            // ==========================================
            // 4. Cypher-7 (Volt) (Virtuoso Cibernético)
            // ==========================================
            {
                id: 'cypher_tesla_chain',
                heroId: 'cypher_volt',
                name: 'Arpejo Tesla em Cadeia',
                type: 'chain_lightning',
                manaCost: 10,
                damageMult: 1.65,
                desc: 'Arpejo elétrico disparado pelos captadores eletromagnéticos com 165% de dano que encadeia em mais 2 zumbis.',
                icon: '⚡',
                color: '#00f0ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.65);
                    if (target && typeof combat.triggerChainLightning === 'function') {
                        combat.triggerChainLightning(target, 2, Math.round(dmg * 0.5));
                    }
                    return { damage: dmg, label: '⚡ ARPEJO TESLA!', color: '#00f0ff' };
                }
            },
            {
                id: 'cypher_emp_stun',
                heroId: 'cypher_volt',
                name: 'Pulso Eletrostático de Palco (PEM)',
                type: 'stun',
                manaCost: 12,
                damageMult: 1.3,
                desc: 'Descarga sintetizada de alto pulso elétrico que sobrecarrega os nervos dos zumbis, paralisando-os por 2.4s.',
                icon: '⚡',
                color: '#00a2ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.3);
                    if (target) {
                        target.stunTimer = 2.4;
                        combat.addFloatingText('⚡ PEM PARALISANTE!', target.x, target.y - 48, '#00a2ff', true);
                    }
                    return { damage: dmg, label: '⚡ PEM PARALISANTE!', color: '#00a2ff' };
                }
            },
            {
                id: 'cypher_neural_overclock',
                heroId: 'cypher_volt',
                name: 'Overclock Neural de Shredding',
                type: 'buff',
                manaCost: 11,
                damageMult: 1.35,
                desc: 'Processamento bionico ultrarrápido dos dedos sobre a escala da guitarra: +55% na velocidade de ataque por 4.0s.',
                icon: '🚀',
                color: '#b000ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.35);
                    combat.heroAttackSpeedBuffTimer = 4.0;
                    combat.heroAttackSpeedBuffMult = 1.55;
                    combat.addFloatingText('🚀 OVERCLOCK +55%!', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#b000ff', true);
                    return { damage: dmg, label: '🚀 OVERCLOCK SHRED!', color: '#b000ff' };
                }
            },
            {
                id: 'cypher_plasma_lance',
                heroId: 'cypher_volt',
                name: 'Laser-Caster Concentrado',
                type: 'dps_crit',
                manaCost: 14,
                damageMult: 2.4,
                desc: 'Disparo sônico de alta precisão através do captador laser da guitarra customizada com 240% de dano crítico.',
                icon: '🔮',
                color: '#00ffff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.4);
                    combat.triggerShake(5);
                    return { damage: dmg, label: '🔮 LASER-CASTER CRÍTICO!', color: '#00ffff' };
                }
            },
            {
                id: 'cypher_cyber_barrier',
                heroId: 'cypher_volt',
                name: 'Barreira Eletroacústica Hex',
                type: 'shield',
                manaCost: 13,
                damageMult: 0.9,
                desc: 'Frequências sonoras moduladas em campo de proteção acústica que absorve até 45 de dano recebido por 4.5s.',
                icon: '🛡️',
                color: '#0080ff',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.9);
                    combat.heroShieldHp = (combat.heroShieldHp || 0) + 45;
                    combat.heroShieldTimer = 4.5;
                    combat.addFloatingText('🛡️ BARREIRA ACÚSTICA (+45)', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#0080ff', true);
                    return { damage: dmg, label: '🛡️ BARREIRA ACÚSTICA!', color: '#0080ff' };
                }
            },

            // ==========================================
            // 5. Kragthor, o Bárbaro (Titã do Heavy Metal)
            // ==========================================
            {
                id: 'kragthor_earthquake',
                heroId: 'kragthor_titan',
                name: 'Riff Sísmico do Valhalla',
                type: 'earthquake',
                manaCost: 11,
                damageMult: 1.75,
                desc: 'Riff brutal nas cordas mais graves que faz o asfalto tremer em reverberação sísmica, atordoando o alvo por 2.2s.',
                icon: '🌋',
                color: '#ffaa00',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.75);
                    combat.triggerShake(7);
                    if (target) target.stunTimer = 2.2;
                    return { damage: dmg, label: '🌋 RIFF SÍSMICO!', color: '#ffaa00' };
                }
            },
            {
                id: 'kragthor_magma_hammer',
                heroId: 'kragthor_titan',
                name: 'Slam Titânico de Flying-V',
                type: 'heavy_dps',
                manaCost: 14,
                damageMult: 2.6,
                desc: 'Kragthor esmaga sua pesada guitarra Flying-V de magma no chão com 260% de dano, arremessando o zumbi 42px para trás.',
                icon: '🎸',
                color: '#ff5500',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.6);
                    if (target) target.x += 42;
                    combat.triggerShake(7.5);
                    return { damage: dmg, label: '🎸 SLAM DE FLYING-V!', color: '#ff5500' };
                }
            },
            {
                id: 'kragthor_war_roar',
                heroId: 'kragthor_titan',
                name: 'Grito Gutural de Death Metal',
                type: 'slow_aoe',
                manaCost: 10,
                damageMult: 1.25,
                desc: 'Rugido gutural amplificado em decibéis extremos que aterroriza os zumbis com lentidão de 55% por 3.5s.',
                icon: '🎙️',
                color: '#ffd700',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.25);
                    combat.entities.zombies.forEach(z => {
                        if (z.active) {
                            z.slowTimer = 3.5;
                            z.slowFactor = 0.45;
                        }
                    });
                    combat.addFloatingText('🎙️ GUTURAL METAL!', combat.getHeroPosition().x + 80, combat.getHeroPosition().y - 55, '#ffd700', true);
                    return { damage: dmg, label: '🎙️ GUTURAL METAL!', color: '#ffd700' };
                }
            },
            {
                id: 'kragthor_stone_fortress',
                heroId: 'kragthor_titan',
                name: 'Muralha de Gabinetes de Som',
                type: 'shield',
                manaCost: 15,
                damageMult: 0.8,
                desc: 'Ergue uma fortaleza impenetrável de caixas acústicas 4x12 empilhadas que absorve 60 de dano recebido por 5.0s.',
                icon: '🔊',
                color: '#ffd700',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 0.8);
                    combat.heroShieldHp = (combat.heroShieldHp || 0) + 60;
                    combat.heroShieldTimer = 5.0;
                    combat.addFloatingText('🔊 MURALHA DE SOM (+60)', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#ffd700', true);
                    return { damage: dmg, label: '🔊 MURALHA DE SOM!', color: '#ffd700' };
                }
            },
            {
                id: 'kragthor_valhalla_thunder',
                heroId: 'kragthor_titan',
                name: 'Solo Trovejante de Valhalla',
                type: 'heavy_aoe',
                manaCost: 16,
                damageMult: 2.2,
                desc: 'Solo monumental de heavy metal nórdico que invoca raios sônicos com 220% de dano e abalo sísmico na pista inteira.',
                icon: '⚡',
                color: '#ffcc00',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.2);
                    combat.triggerShake(9);
                    if (target) {
                        combat.entities.zombies.forEach(z => {
                            if (z.active && z !== target && Math.abs(z.x - target.x) < 110) {
                                z.hp -= Math.round(baseDmg * 0.9);
                                z.flashTime = 0.2;
                            }
                        });
                    }
                    return { damage: dmg, label: '⚡ SOLO TROVEJANTE!', color: '#ffcc00' };
                }
            },

            // ==========================================
            // 6. Roxie "Anarchy" Slash (Valquíria do Punk Mítico)
            // ==========================================
            {
                id: 'roxie_riot_riff',
                heroId: 'roxie_anarchy',
                name: 'Riff de Rebelião Punk',
                type: 'riot_dps',
                manaCost: 9,
                damageMult: 1.85,
                desc: 'Sequência de acordes rebeldes ensurdecedores que golpeia o alvo com 185% de dano e distorção pura.',
                icon: '🎸',
                color: '#ff00a0',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.85);
                    combat.triggerShake(4.5);
                    return { damage: dmg, label: '🎸 RIFF REBELDE!', color: '#ff00a0' };
                }
            },
            {
                id: 'roxie_double_cleave',
                heroId: 'roxie_anarchy',
                name: 'Palhetada Dupla Lacerante',
                type: 'bleed',
                manaCost: 13,
                damageMult: 2.45,
                desc: 'Ataque em tremolo picking ultra-veloz que rasga a matéria zumbi com 245% de dano e sangramento sônico (24 DPS por 3.0s).',
                icon: '🎸',
                color: '#ff0055',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.45);
                    if (target) {
                        target.burnTimer = 3.0;
                        target.burnDps = 24;
                        combat.addFloatingText('🩸 SANGRAMENTO SÔNICO!', target.x, target.y - 48, '#ff0055', true);
                    }
                    combat.triggerShake(5);
                    return { damage: dmg, label: '🎸 PALHETADA LACERANTE!', color: '#ff0055' };
                }
            },
            {
                id: 'roxie_vampiric_drain',
                heroId: 'roxie_anarchy',
                name: 'Solo Sônico Vampírico',
                type: 'lifesteal',
                manaCost: 12,
                damageMult: 1.5,
                desc: 'Solo sombrio de gothic metal que inflige 150% de dano e drena a essência vital dos mortos-vivos (50% como cura direta).',
                icon: '🩸',
                color: '#e6004c',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.5);
                    const lifesteal = Math.max(15, Math.round(dmg * 0.5));
                    combat.healHero(lifesteal);
                    return { damage: dmg, label: `🩸 SOLO VAMPÍRICO (+${lifesteal})`, color: '#e6004c' };
                }
            },
            {
                id: 'roxie_anarchy_frenzy',
                heroId: 'roxie_anarchy',
                name: 'Mosh Pit Anárquico',
                type: 'buff',
                manaCost: 14,
                damageMult: 1.45,
                desc: 'Caos do mosh pit punk: eleva a velocidade de ataque em +50% por 4.0s e recarrega imediatamente +10 MP de Rock.',
                icon: '🤘',
                color: '#ff1493',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 1.45);
                    combat.heroAttackSpeedBuffTimer = 4.0;
                    combat.heroAttackSpeedBuffMult = 1.50;
                    combat.rockMana = Math.min(combat.maxRockMana, combat.rockMana + 10);
                    combat.addFloatingText('🤘 MOSH PIT (+50% VELOCIDADE)!', combat.getHeroPosition().x, combat.getHeroPosition().y - 50, '#ff1493', true);
                    return { damage: dmg, label: '🤘 MOSH PIT!', color: '#ff1493' };
                }
            },
            {
                id: 'roxie_chaos_cataclysm',
                heroId: 'roxie_anarchy',
                name: 'Solo Cataclísmico do Caos',
                type: 'cataclysm',
                manaCost: 17,
                damageMult: 2.8,
                desc: 'Apoteose sônica punk com quebra de palco: 280% de dano monumental, onda de choque estéreo e recuo massivo na horda.',
                icon: '💥',
                color: '#ff00aa',
                apply: (combat, target, baseDmg) => {
                    const dmg = Math.round(baseDmg * 2.8);
                    combat.triggerShake(10);
                    if (target) target.x += 35;
                    combat.entities.zombies.forEach(z => {
                        if (z.active && z !== target) {
                            z.hp -= Math.round(baseDmg * 0.75);
                            z.x += 18;
                            z.flashTime = 0.2;
                        }
                    });
                    return { damage: dmg, label: '💥 SOLO CATACLÍSMICO!', color: '#ff00aa' };
                }
            }
        ];

        // Legacy ID mapping for backward compatibility
        this.legacyMap = {
            'power_chord': 'blaze_power_chord',
            'healing_melody': 'blaze_adrenaline_surge',
            'acoustic_stun': 'blaze_sound_concussion',
            'fuzz_slow': 'radix_decay_cloud',
            'pyro_riff': 'vulkan_flamethrower',
            'sonic_shield': 'vulkan_ember_shield',
            'overdrive_frenzy': 'cypher_neural_overclock'
        };

        this.heroLoadouts = {};
    }

    getActiveHeroId() {
        if (window.guitaristPool && typeof window.guitaristPool.getActiveGuitarist === 'function') {
            const h = window.guitaristPool.getActiveGuitarist();
            if (h && h.id) return h.id;
        }
        return 'johnny_blaze';
    }

    getSkillsForHero(heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        return this.skills.filter(s => s.heroId === 'all' || s.heroId === hid);
    }

    getSkillById(id) {
        if (!id) return this.skills[0];
        const resolvedId = this.legacyMap[id] || id;
        return this.skills.find(s => s.id === resolvedId) || this.skills[0];
    }

    hasAtLeastOneBasicStrike(loadout) {
        return Array.isArray(loadout) && loadout.some(id => (this.legacyMap[id] || id) === 'basic_strike');
    }

    getDefaultLoadoutForHero(heroId) {
        const heroSkills = this.getSkillsForHero(heroId).filter(s => s.id !== 'basic_strike');
        const s0 = heroSkills[0] ? heroSkills[0].id : 'basic_strike';
        const s1 = heroSkills[1] ? heroSkills[1].id : 'basic_strike';
        // At least 2 slots are basic_strike by default, satisfying the >= 1 basic strike rule
        return ['basic_strike', s0, s1, 'basic_strike'];
    }

    loadEquipped(heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        if (this.heroLoadouts[hid]) {
            return this.heroLoadouts[hid];
        }

        try {
            const raw = localStorage.getItem(`gvs_equipped_skills_${hid}`);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === 4) {
                    const resolved = parsed.map(id => this.legacyMap[id] || id);
                    if (this.hasAtLeastOneBasicStrike(resolved)) {
                        this.heroLoadouts[hid] = resolved;
                        return resolved;
                    }
                }
            }
        } catch(e) {}

        const def = this.getDefaultLoadoutForHero(hid);
        this.heroLoadouts[hid] = def;
        return def;
    }

    saveEquipped(heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        const loadout = this.loadEquipped(hid);
        try {
            localStorage.setItem(`gvs_equipped_skills_${hid}`, JSON.stringify(loadout));
            // Also update legacy single loadout key for backward compatibility
            localStorage.setItem('gvs_equipped_lane_skills', JSON.stringify(loadout));
        } catch(e) {}
    }

    canEquipSkill(laneIndex, newSkillId, heroId = null) {
        if (laneIndex < 0 || laneIndex >= 4) {
            return { allowed: false, reason: 'Trilho inválido.' };
        }
        const hid = heroId || this.getActiveHeroId();
        const currentLoadout = [...this.loadEquipped(hid)];

        const resolvedNew = this.legacyMap[newSkillId] || newSkillId;
        if (resolvedNew === 'basic_strike') {
            return { allowed: true };
        }

        const simulated = [...currentLoadout];
        simulated[laneIndex] = resolvedNew;

        if (!this.hasAtLeastOneBasicStrike(simulated)) {
            return {
                allowed: false,
                reason: '⚠️ Regra do Palco: Você precisa manter pelo menos 1 slot equipado com Ataque Básico!'
            };
        }

        return { allowed: true };
    }

    equipSkill(laneIndex, skillId, heroId = null) {
        if (laneIndex < 0 || laneIndex >= 4) return false;
        const hid = heroId || this.getActiveHeroId();
        const check = this.canEquipSkill(laneIndex, skillId, hid);
        if (!check.allowed) {
            return false;
        }

        const resolved = this.legacyMap[skillId] || skillId;
        const loadout = this.loadEquipped(hid);
        loadout[laneIndex] = resolved;
        this.heroLoadouts[hid] = loadout;
        this.saveEquipped(hid);
        return true;
    }

    equipSkillToLane(laneIndex, skillId, heroId = null) {
        return this.equipSkill(laneIndex, skillId, heroId);
    }

    getEquippedSkill(laneIndex, heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        const loadout = this.loadEquipped(hid);
        const skillId = loadout[laneIndex] || 'basic_strike';
        return this.getSkillById(skillId);
    }

    getSkillForLane(laneIndex, heroId = null) {
        return this.getEquippedSkill(laneIndex, heroId);
    }

    getEquippedSkills(heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        const loadout = this.loadEquipped(hid);
        return loadout.map(id => this.getSkillById(id));
    }

    getAllSkills() {
        return this.skills;
    }

    getSkillTypeBadge(skill) {
        if (!skill) return { label: 'BÁSICO', color: '#00ff66', bg: 'rgba(0,255,102,0.15)' };
        switch (skill.type) {
            case 'basic': return { label: '⚡ BÁSICO', color: '#00ff66', bg: 'rgba(0,255,102,0.18)' };
            case 'dps': case 'heavy_dps': case 'riot_dps': return { label: '💥 DANO', color: '#ff5500', bg: 'rgba(255,85,0,0.18)' };
            case 'dps_crit': return { label: '🔮 CRÍTICO', color: '#00ffff', bg: 'rgba(0,255,255,0.18)' };
            case 'aoe': case 'heavy_aoe': return { label: '💥 ÁREA', color: '#ff3300', bg: 'rgba(255,51,0,0.18)' };
            case 'stun': case 'earthquake': return { label: '💫 STUN', color: '#ffcc00', bg: 'rgba(255,204,0,0.18)' };
            case 'burn': case 'aoe_burn': return { label: '🔥 CHAMA', color: '#ff4400', bg: 'rgba(255,68,0,0.18)' };
            case 'acid': case 'radiation': return { label: '☢️ TÓXICO', color: '#39ff14', bg: 'rgba(57,255,20,0.18)' };
            case 'chain_lightning': return { label: '⚡ RELÂMPAGO', color: '#00f0ff', bg: 'rgba(0,240,255,0.18)' };
            case 'buff': return { label: '🚀 BUFF', color: '#b000ff', bg: 'rgba(176,0,255,0.18)' };
            case 'heal': return { label: '💚 CURA', color: '#00e676', bg: 'rgba(0,230,118,0.18)' };
            case 'shield': return { label: '🛡️ ESCUDO', color: '#00a2ff', bg: 'rgba(0,162,255,0.18)' };
            case 'lifesteal': return { label: '🩸 VAMPIRISMO', color: '#e6004c', bg: 'rgba(230,0,76,0.18)' };
            case 'bleed': return { label: '🩸 SANGRAMENTO', color: '#ff0055', bg: 'rgba(255,0,85,0.18)' };
            case 'pierce': return { label: '🎸 PERFURAÇÃO', color: '#ffaa00', bg: 'rgba(255,170,0,0.18)' };
            case 'cataclysm': return { label: '👑 CATACLISMO', color: '#ff00aa', bg: 'rgba(255,0,170,0.22)' };
            default: return { label: '⚡ ESPECIAL', color: '#ffaa00', bg: 'rgba(255,170,0,0.15)' };
        }
    }

    resetHeroLoadout(heroId = null) {
        const hid = heroId || this.getActiveHeroId();
        const def = this.getDefaultLoadoutForHero(hid);
        this.heroLoadouts[hid] = [...def];
        this.saveEquipped(hid);
        return this.heroLoadouts[hid];
    }

    drawLaneFretOverlay(ctx, laneIndex, bx, hitZoneY, isPressed, trackW) {
        const skill = this.getEquippedSkill(laneIndex);
        if (!skill || !ctx) return;
        const combat = (typeof window !== 'undefined' && window.game) ? window.game.combat : null;
        const currentMana = combat ? combat.rockMana : 100;
        const hasMana = !skill.manaCost || currentMana >= skill.manaCost;

        ctx.save();
        // 1. Draw Skill Icon inside fret button
        ctx.font = '13px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = hasMana ? 1.0 : 0.45;
        ctx.fillText(skill.icon || '⚡', bx, hitZoneY);

        // 2. Halo effect if ready special skill
        if (hasMana && skill.manaCost > 0) {
            const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
            const pulse = (Math.sin(now * 0.006 + laneIndex * 1.5) + 1) * 0.5;
            ctx.strokeStyle = (skill.color || '#00d4ff') + '44';
            ctx.lineWidth = 3.5 + pulse * 2;
            ctx.beginPath();
            ctx.arc(bx, hitZoneY, 20 + pulse * 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = skill.color || '#00d4ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(bx, hitZoneY, 18 + pulse * 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 3. Mini Mana Badge underneath the target circle
        const badgeY = hitZoneY + 27;
        const badgeText = skill.manaCost > 0 
            ? (hasMana ? `⚡ ${skill.manaCost} MP` : '⚡ SEM MP')
            : 'BÁSICO';
        const badgeColor = skill.manaCost > 0
            ? (hasMana ? '#00ffff' : '#ff4444')
            : '#00ff66';

        ctx.font = 'bold 8.5px "Segoe UI", sans-serif';
        const textMetrics = ctx.measureText(badgeText);
        const bw = Math.max(38, textMetrics.width + 10);
        const bh = 14;

        ctx.fillStyle = hasMana ? 'rgba(10, 15, 28, 0.85)' : 'rgba(38, 10, 10, 0.88)';
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(bx - bw / 2, badgeY - bh / 2, bw, bh, 4);
        } else {
            ctx.rect(bx - bw / 2, badgeY - bh / 2, bw, bh);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = badgeColor;
        ctx.fillText(badgeText, bx, badgeY + 0.5);
        ctx.restore();
    }
}

window.skillSystem = new SkillSystem();
