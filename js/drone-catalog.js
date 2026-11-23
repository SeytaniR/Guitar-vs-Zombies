// ==========================================================================
// DRONE CATALOG - 13 Invulnerable Combat Drones (3 Free Starters + 10 Shop)
// Scaled progression from Common (0g) -> Rare -> Epic -> Legendary -> Mythic
// ==========================================================================

const DRONE_CATALOG = [
    // --- 3 STARTER DRONES (FREE & UNLOCKED BY DEFAULT) ---
    {
        id: 'pyro_shredder', name: 'Pyro-Shredder MK-I', type: 'offensive',
        rarityKey: 'rarityCommon', rarity: 'COMUM', rarityClass: 'badge-common',
        badgeKey: 'droneTypeOffensive', badge: 'OFENSIVO', badgeClass: 'badge-danger',
        icon: 'assets/drones/drone_offensive.jpg', sheet: 'droneOffensiveSheet',
        sheetSrc: 'assets/drones/drone_offensive_sheet.jpg', cols: 4, rows: 3,
        color: '#ff4411', accentColor: '#ffaa00',
        unlockCost: 0, unlockedByDefault: true, isInvulnerable: true, hasHp: false,
        powerMult: 1.00, cooldownMult: 1.00, auraBonus: 0, missileEvery: 4, chainTargets: 0, aoeRadius: 75,
        title: 'Canhão Sônico Incendiário',
        skillName: 'Salva Pyro-Riff & Míssil Solar',
        skillDesc: 'Dispara rajadas térmicas contínuas e, a cada 4º tiro, lança um míssil explosivo em área com Queimadura + Aura de Dano ao herói.'
    },
    {
        id: 'harmonic_pulse', name: 'Harmonic Pulse-Bot', type: 'support',
        rarityKey: 'rarityCommon', rarity: 'COMUM', rarityClass: 'badge-common',
        badgeKey: 'droneTypeSupport', badge: 'SUPORTE', badgeClass: 'badge-toxic',
        icon: 'assets/drones/drone_support.jpg', sheet: 'droneSupportSheet',
        sheetSrc: 'assets/drones/drone_support_sheet.jpg', cols: 4, rows: 3,
        color: '#00ff88', accentColor: '#ffd700',
        unlockCost: 0, unlockedByDefault: true, isInvulnerable: true, hasHp: false,
        powerMult: 1.00, cooldownMult: 1.00, specialCharge: 4.0, shieldEvery: 3, shieldCap: 120,
        title: 'Sintetizador Angelical de Cura & Buffs',
        skillName: 'Ressurreição Harmônica & Escudo',
        skillDesc: 'Emite ondas vitais periódicas que curam HP, restauram MP, aceleram o ataque do guitarrista e geram Escudo Acústico.'
    },
    {
        id: 'cryo_vortex', name: 'Cryo-Vortex Disruptor', type: 'controller',
        rarityKey: 'rarityCommon', rarity: 'COMUM', rarityClass: 'badge-common',
        badgeKey: 'droneTypeController', badge: 'CONTROLADOR', badgeClass: 'badge-agile',
        icon: 'assets/drones/drone_controller.jpg', sheet: 'droneControllerSheet',
        sheetSrc: 'assets/drones/drone_controller_sheet.jpg', cols: 4, rows: 3,
        color: '#00e5ff', accentColor: '#b336ff',
        unlockCost: 0, unlockedByDefault: true, isInvulnerable: true, hasHp: false,
        powerMult: 1.00, cooldownMult: 1.00, ccDurationMult: 1.00, poisonMult: 1.00, dualCc: false, aoeRadius: 85,
        title: 'Orbe Tático de Controle de Grupo & DoT',
        skillName: 'Matriz de Controle Total (CC & DoT)',
        skillDesc: 'Alterna pulsos táticos em área: Congelamento (Lentidão), Stun Tesla, Onda de Sono, Veneno Corrosivo e Vórtice de Empurrão.'
    },

    // --- 3 RARE DRONES (EARLY-MID PROGRESSION: 3.5k - 8k GOLD) ---
    {
        id: 'volt_viper', name: 'Volt-Viper MK-II', type: 'offensive',
        rarityKey: 'rarityRare', rarity: 'RARO', rarityClass: 'badge-rare',
        badgeKey: 'droneTypeOffensive', badge: 'OFENSIVO', badgeClass: 'badge-danger',
        icon: 'assets/drones/drone_volt_viper.jpg', sheet: 'droneVoltViperSheet',
        sheetSrc: 'assets/drones/drone_volt_viper_sheet.jpg', cols: 4, rows: 3,
        color: '#00d4ff', accentColor: '#ffee00',
        unlockCost: 3500, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.18, cooldownMult: 0.95, auraBonus: 3, missileEvery: 4, chainTargets: 2, aoeRadius: 82,
        title: 'Drone Interceptador de Arco Tesla',
        skillName: 'Descarga Tesla em Cadeia',
        skillDesc: 'Dispara raios de alta voltagem que saltam para +2 zumbis próximos e lança mísseis eletromagnéticos em área.'
    },
    {
        id: 'med_chorus', name: 'Med-Chorus Seraph', type: 'support',
        rarityKey: 'rarityRare', rarity: 'RARO', rarityClass: 'badge-rare',
        badgeKey: 'droneTypeSupport', badge: 'SUPORTE', badgeClass: 'badge-toxic',
        icon: 'assets/drones/drone_med_chorus.jpg', sheet: 'droneMedChorusSheet',
        sheetSrc: 'assets/drones/drone_med_chorus_sheet.jpg', cols: 4, rows: 3,
        color: '#00d8ff', accentColor: '#ffe066',
        unlockCost: 5500, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.18, cooldownMult: 0.95, specialCharge: 6.0, shieldEvery: 3, shieldCap: 140,
        title: 'Serafim Sônico de Cura & Especial',
        skillName: 'Coro Restaurador & Carga Especial',
        skillDesc: 'Cura ampliada de HP e Rock Mana, carrega +6% da Barra de Especial por pulso e protege com Escudo Seráfico.'
    },
    {
        id: 'venom_wasp', name: 'Venom-Wasp Swarm', type: 'controller',
        rarityKey: 'rarityRare', rarity: 'RARO', rarityClass: 'badge-rare',
        badgeKey: 'droneTypeController', badge: 'CONTROLADOR', badgeClass: 'badge-agile',
        icon: 'assets/drones/drone_venom_wasp.jpg', sheet: 'droneVenomWaspSheet',
        sheetSrc: 'assets/drones/drone_venom_wasp_sheet.jpg', cols: 4, rows: 3,
        color: '#b833ff', accentColor: '#ffd900',
        unlockCost: 8000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.18, cooldownMult: 0.94, ccDurationMult: 1.12, poisonMult: 1.45, dualCc: false, aoeRadius: 92,
        title: 'Vespa Bio-Tóxica de Neuro-Veneno',
        skillName: 'Ferrão Corrosivo & Ciclo CC',
        skillDesc: 'Aplica Veneno Corrosivo com +45% de dano contínuo além de Congelamento, Stun, Sono e Empurrão em área.'
    },

    // --- 3 EPIC DRONES (MID PROGRESSION: 14k - 32k GOLD) ---
    {
        id: 'plasma_reaper', name: 'Plasma-Reaper X9', type: 'offensive',
        rarityKey: 'rarityEpic', rarity: 'ÉPICO', rarityClass: 'badge-epic',
        badgeKey: 'droneTypeOffensive', badge: 'OFENSIVO', badgeClass: 'badge-danger',
        icon: 'assets/drones/drone_plasma_reaper.jpg', sheet: 'dronePlasmaReaperSheet',
        sheetSrc: 'assets/drones/drone_plasma_reaper_sheet.jpg', cols: 4, rows: 3,
        color: '#ff0066', accentColor: '#ff66cc',
        unlockCost: 14000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.36, cooldownMult: 0.90, auraBonus: 6, missileEvery: 3, chainTargets: 1, aoeRadius: 92,
        title: 'Ceifador Carmesim de Plasma',
        skillName: 'Foice de Plasma & Míssil Rápido',
        skillDesc: 'Dispara lâminas de plasma de alto impacto e lança mísseis explosivos incendiários a cada 3º disparo!'
    },
    {
        id: 'aegis_synth', name: 'Aegis-Synth Guardian', type: 'support',
        rarityKey: 'rarityEpic', rarity: 'ÉPICO', rarityClass: 'badge-epic',
        badgeKey: 'droneTypeSupport', badge: 'SUPORTE', badgeClass: 'badge-toxic',
        icon: 'assets/drones/drone_aegis_synth.jpg', sheet: 'droneAegisSynthSheet',
        sheetSrc: 'assets/drones/drone_aegis_synth_sheet.jpg', cols: 4, rows: 3,
        color: '#2299ff', accentColor: '#00ffcc',
        unlockCost: 22000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.36, cooldownMult: 0.90, specialCharge: 6.5, shieldEvery: 2, shieldCap: 185,
        title: 'Guardião Fortaleza de Escudo Hex',
        skillName: 'Barreira Aegis Acústica',
        skillDesc: 'Gera Escudo Acústico reforçado (até 185 HP) a cada 2º pulso, além de cura, mana e buff de velocidade.'
    },
    {
        id: 'chrono_owl', name: 'Chrono-Owl Weaver', type: 'controller',
        rarityKey: 'rarityEpic', rarity: 'ÉPICO', rarityClass: 'badge-epic',
        badgeKey: 'droneTypeController', badge: 'CONTROLADOR', badgeClass: 'badge-agile',
        icon: 'assets/drones/drone_chrono_owl.jpg', sheet: 'droneChronoOwlSheet',
        sheetSrc: 'assets/drones/drone_chrono_owl_sheet.jpg', cols: 4, rows: 3,
        color: '#9955ff', accentColor: '#ffd700',
        unlockCost: 32000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.36, cooldownMult: 0.89, ccDurationMult: 1.35, poisonMult: 1.25, dualCc: false, aoeRadius: 100,
        title: 'Coruja Cronológica do Tempo',
        skillName: 'Distorção Temporal de Controle',
        skillDesc: 'Estende em +35% a duração de Congelamento, Stun e Sono, congelando a marcha da horda por muito mais tempo.'
    },

    // --- 3 LEGENDARY DRONES (LATE PROGRESSION: 50k - 105k GOLD) ---
    {
        id: 'nova_valkyrie', name: 'Nova-Valkyrie Omega', type: 'offensive',
        rarityKey: 'rarityLegendary', rarity: 'LENDÁRIO', rarityClass: 'badge-legendary',
        badgeKey: 'droneTypeOffensive', badge: 'OFENSIVO', badgeClass: 'badge-danger',
        icon: 'assets/drones/drone_nova_valkyrie.jpg', sheet: 'droneNovaValkyrieSheet',
        sheetSrc: 'assets/drones/drone_nova_valkyrie_sheet.jpg', cols: 4, rows: 3,
        color: '#ff7700', accentColor: '#fff066',
        unlockCost: 50000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.58, cooldownMult: 0.85, auraBonus: 11, missileEvery: 3, chainTargets: 2, aoeRadius: 110,
        title: 'Valquíria Solar de Supernova',
        skillName: 'Bombardeio Supernova Ômega',
        skillDesc: 'Explosões solares com +40% de raio AoE, arcos de energia em cadeia e aura de dano superior ao guitarrista.'
    },
    {
        id: 'celestial_amp', name: 'Celestial Amp-Angel', type: 'support',
        rarityKey: 'rarityLegendary', rarity: 'LENDÁRIO', rarityClass: 'badge-legendary',
        badgeKey: 'droneTypeSupport', badge: 'SUPORTE', badgeClass: 'badge-toxic',
        icon: 'assets/drones/drone_celestial_amp.jpg', sheet: 'droneCelestialAmpSheet',
        sheetSrc: 'assets/drones/drone_celestial_amp_sheet.jpg', cols: 4, rows: 3,
        color: '#ffd700', accentColor: '#88ffff',
        unlockCost: 75000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.58, cooldownMult: 0.84, specialCharge: 8.5, shieldEvery: 2, shieldCap: 230, auraBonus: 8,
        title: 'Arcanjo Amplificador Celestial',
        skillName: 'Sinfonia Divina de Overdrive',
        skillDesc: 'Cura suprema, +8.5% de Barra Especial por pulso, Escudo Celestial (até 230 HP) e Aura de +8% de Dano ao herói!'
    },
    {
        id: 'abyss_siren', name: 'Abyss-Siren Phantom', type: 'controller',
        rarityKey: 'rarityLegendary', rarity: 'LENDÁRIO', rarityClass: 'badge-legendary',
        badgeKey: 'droneTypeController', badge: 'CONTROLADOR', badgeClass: 'badge-agile',
        icon: 'assets/drones/drone_abyss_siren.jpg', sheet: 'droneAbyssSirenSheet',
        sheetSrc: 'assets/drones/drone_abyss_siren_sheet.jpg', cols: 4, rows: 3,
        color: '#aa22ff', accentColor: '#00f0ff',
        unlockCost: 105000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.58, cooldownMult: 0.83, ccDurationMult: 1.40, poisonMult: 1.40, dualCc: true, aoeRadius: 112,
        title: 'Sereia Espectral do Abismo',
        skillName: 'Pesadelo Sônico Duplo (CC x2)',
        skillDesc: 'Cada pulso aplica DOIS efeitos de controle simultâneos em massa (Gelo + Veneno, Stun + Sono, etc.) na horda!'
    },

    // --- 1 MYTHIC APEX DRONE (ENDGAME CHALLENGE: 150k GOLD) ---
    {
        id: 'apocalypse_rex', name: 'Apocalypse-Rex Apex', type: 'offensive',
        rarityKey: 'rarityMythic', rarity: 'MÍTICO', rarityClass: 'badge-mythic',
        badgeKey: 'droneTypeOffensive', badge: 'OFENSIVO', badgeClass: 'badge-danger',
        icon: 'assets/drones/drone_apocalypse_rex.jpg', sheet: 'droneApocalypseRexSheet',
        sheetSrc: 'assets/drones/drone_apocalypse_rex_sheet.jpg', cols: 4, rows: 3,
        color: '#ff1a1a', accentColor: '#ffd700',
        unlockCost: 150000, unlockedByDefault: false, isInvulnerable: true, hasHp: false,
        powerMult: 1.85, cooldownMult: 0.78, auraBonus: 18, missileEvery: 2, chainTargets: 3, aoeRadius: 125,
        title: 'Canhão Orbital Mítico do Apocalipse',
        skillName: 'Juízo Final Orbital (Míssil x2)',
        skillDesc: 'A arma aérea definitiva: lança Míssil Orbital a cada 2º tiro, salta em +3 zumbis e concede Aura Mítica de Dano!'
    }
];

if (typeof window !== 'undefined') window.DRONE_CATALOG = DRONE_CATALOG;
if (typeof module !== 'undefined' && module.exports) module.exports = DRONE_CATALOG;
