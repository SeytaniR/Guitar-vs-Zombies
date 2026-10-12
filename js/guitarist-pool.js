// Guitarist Pool System - Catalog of 6 Playable Heroes with Rarities, Passives & Visual Styles
class GuitaristPoolSystem {
    constructor() {
        this.guitarists = [
            {
                id: 'johnny_blaze',
                name: 'Johnny "Riff" Blaze',
                title: 'O Punk Rocker Clássico',
                rarity: 'COMUM',
                rarityKey: 'common',
                badgeClass: 'badge-common',
                icon: 'assets/heroes/johnny_blaze.jpg',
                sheet: 'heroSheet',
                sheetSrc: 'assets/hero2.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Stratocaster "Hellfire"',
                themeColor: '#ff6600',
                projectileColor: '#00f0ff',
                desc: 'Veterano das garagens e ruas do apocalipse. Ataques sonoros equilibrados e riffs cortantes de puro punk rock.',
                passiveName: 'Espírito do Rock',
                passiveDesc: '+15% de Dano Base e +10% de velocidade dos projéteis sónicos.',
                stats: {
                    damageMult: 1.15,
                    projSpeedMult: 1.10,
                    critChanceBonus: 0.05,
                    rockPowerRate: 1.0,
                    goldBonus: 0,
                    armorPen: 0
                }
            },
            {
                id: 'vulkan_ironhead',
                name: 'Vulkan "Ironhead"',
                title: 'O Piromaníaco das Wastelands',
                rarity: 'RARO',
                rarityKey: 'rare',
                badgeClass: 'badge-rare',
                icon: 'assets/heroes/vulkan_ironhead.jpg',
                sheet: 'heroVulkanSheet',
                sheetSrc: 'assets/hero_vulkan.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Scrap-Metal V8 Flamejante',
                themeColor: '#ff3300',
                projectileColor: '#ff4500',
                desc: 'Sobrevivente forjado em ferro-velho e cinzas. Sua guitarra com escapamento duplo incinera hordas de mortos-vivos.',
                passiveName: 'Pirotecnia Brutal',
                passiveDesc: '35% de chance de infligir Queimadura Contínua (-14 HP/s) e +10% de recarga do Rock Meter.',
                stats: {
                    damageMult: 1.10,
                    burnChance: 0.35,
                    burnDps: 14,
                    rockPowerRate: 1.10,
                    goldBonus: 0,
                    armorPen: 0
                }
            },
            {
                id: 'dr_radix',
                name: 'Dr. Radix Biohazard',
                title: 'O Solista Bioquímico',
                rarity: 'RARO',
                rarityKey: 'rare',
                badgeClass: 'badge-rare',
                icon: 'assets/heroes/dr_radix.jpg',
                sheet: 'heroHazmatSheet',
                sheetSrc: 'assets/hero_hazmat.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Guitarratox "Uranium-235"',
                themeColor: '#39ff14',
                projectileColor: '#39ff14',
                desc: 'Cientista louco em traje de contenção. Seus solos cáusticos radioativos corroem as armaduras mais resistentes.',
                passiveName: 'Radiação Acústica',
                passiveDesc: 'Ignora 50% da armadura balística de zumbis soldados e desacelera o avanço da horda em 15%.',
                stats: {
                    damageMult: 1.08,
                    armorPen: 0.50,
                    slowHorde: 0.15,
                    rockPowerRate: 1.0,
                    goldBonus: 0
                }
            },
            {
                id: 'cypher_volt',
                name: 'Cypher-7 (Volt)',
                title: 'O Virtuoso Cibernético',
                rarity: 'ÉPICO',
                rarityKey: 'epic',
                badgeClass: 'badge-epic',
                icon: 'assets/heroes/cypher_volt.jpg',
                sheet: 'heroCyborgSheet',
                sheetSrc: 'assets/hero_cyborg.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Laser-Caster Bionica Neon',
                themeColor: '#00f0ff',
                projectileColor: '#00f0ff',
                desc: 'Ciborgue de combate com processador sônico neural. Solos em frequência de plasma azul com altíssima taxa de impacto.',
                passiveName: 'Overdrive Bionico',
                passiveDesc: 'Acertos PERFECT disparam descargas de relâmpago em cadeia que atingem até 2 zumbis adicionais.',
                stats: {
                    damageMult: 1.20,
                    chainLightning: true,
                    chainTargets: 2,
                    rockPowerRate: 1.25,
                    goldBonus: 0,
                    armorPen: 0.20
                }
            },
            {
                id: 'kragthor_titan',
                name: 'Kragthor, o Bárbaro',
                title: 'O Titã do Heavy Metal',
                rarity: 'LENDÁRIO',
                rarityKey: 'legendary',
                badgeClass: 'badge-legendary',
                icon: 'assets/heroes/kragthor_titan.jpg',
                sheet: 'heroGladiatorSheet',
                sheetSrc: 'assets/hero_gladiator.jpg',
                cols: 4,
                rows: 4,
                instrument: 'Flying-V "Magma Fury"',
                themeColor: '#ffcc00',
                projectileColor: '#ffaa00',
                desc: 'Colosso do Valhalla do Metal com cabeça em chamas. Seus acordes provocam terremotos de destruição em massa.',
                passiveName: 'Fúria dos Titãs',
                passiveDesc: '+35% de Dano Crítico e +60% de Força de Repulsão (Knockback) contra hordas pesadas.',
                stats: {
                    damageMult: 1.25,
                    critDamageMult: 1.35,
                    knockbackBonus: 0.60,
                    rockPowerRate: 1.15,
                    goldBonus: 0
                }
            },
            {
                id: 'roxie_anarchy',
                name: 'Roxie "Anarchy" Slash',
                title: 'A Valquíria do Punk Mítico',
                rarity: 'MÍTICO',
                rarityKey: 'mythic',
                badgeClass: 'badge-mythic',
                icon: 'assets/heroes/roxie_anarchy.jpg',
                sheet: 'heroAnarchySheet',
                sheetSrc: 'assets/hero_anarchy.jpg',
                cols: 4,
                rows: 3,
                instrument: 'Machado Duplo "Riot Axe"',
                themeColor: '#ff00a0',
                projectileColor: '#ff00a0',
                desc: 'Lenda viva da anarquia musical. Empunha um machado de batalha duplo com lâminas de plasma violeta devastador.',
                passiveName: 'Anarquia Absoluta',
                passiveDesc: '+25% de Ouro obtido de cada zumbi derrotado e multiplicador de combo acelera com o dobro de velocidade!',
                stats: {
                    damageMult: 1.25,
                    goldBonus: 0.25,
                    fastCombo: true,
                    rockPowerRate: 1.30
                }
            }
        ];

        // Normalize property aliases for full backward and forward compatibility
        this.guitarists.forEach(g => {
            g.rarityClass = g.rarityClass || g.badgeClass || 'badge-common';
            g.badgeClass = g.rarityClass;
            g.accentColor = g.accentColor || g.themeColor || '#ffaa00';
            g.themeColor = g.accentColor;
            if (!g.passive) {
                g.passive = {
                    name: g.passiveName,
                    desc: g.passiveDesc
                };
            }
        });

        this.selectedId = this.loadSelectedGuitaristId();
    }

    loadSelectedGuitaristId() {
        try {
            return localStorage.getItem('gvs_selected_guitarist') || 'johnny_blaze';
        } catch(e) {
            return 'johnny_blaze';
        }
    }

    setSelectedGuitarist(id) {
        const found = this.guitarists.find(g => g.id === id);
        if (found) {
            this.selectedId = id;
            try {
                localStorage.setItem('gvs_selected_guitarist', id);
            } catch(e) {}
            return true;
        }
        return false;
    }

    getActiveGuitarist() {
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
