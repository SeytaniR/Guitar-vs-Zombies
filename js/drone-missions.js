// Drone Quests Catalog (8 Procedural 5-Tier Drone Missions for Guitar vs Zombies)
(function () {
    const DRONE_MISSION_DEFS = [
        {
            id: 'drone_actions', name: 'Ações Táticas de Drone', badge: 'COMBATE', badgeClass: 'badge-rusher',
            icon: 'assets/drones/drone_offensive.jpg', desc: 'Disparos, pulsos de suporte e rajadas de controle realizados pelos seus drones.', unitLabel: 'Ações',
            tiers: [25, 150, 750, 3000, 12000],
            rewards: [
                { gold: 30, xp: 25, title: 'Piloto Novato 🥉' },
                { gold: 140, xp: 90, title: 'Operador Aéreo 🥈' },
                { gold: 750, xp: 400, title: 'Comandante Tático 🥇' },
                { gold: 4200, xp: 1800, title: 'Asa Cibernética 💎' },
                { gold: 28000, xp: 10000, title: 'MESTRE DOS DRONES 👑⚡' }
            ]
        },
        {
            id: 'drone_kills', name: 'Abates por Drones', badge: 'OFENSIVO', badgeClass: 'badge-danger',
            icon: 'assets/drones/drone_apocalypse_rex.jpg', desc: 'Zumbis destruídos diretamente pelos lasers, mísseis ou veneno do seu drone.', unitLabel: 'Abates',
            tiers: [10, 75, 400, 2000, 10000],
            rewards: [
                { gold: 35, xp: 30, title: 'Mira Orbital 🥉' },
                { gold: 160, xp: 110, title: 'Caçador Aéreo 🥈' },
                { gold: 900, xp: 500, title: 'Predador dos Céus 🥇' },
                { gold: 5000, xp: 2200, title: 'Aniquilador Tático 💎' },
                { gold: 35000, xp: 12000, title: 'CEIFADOR ORBITAL 👑⚡' }
            ]
        },
        {
            id: 'drone_damage', name: 'Dano Total de Drones', badge: 'PODER', badgeClass: 'badge-legendary',
            icon: 'assets/drones/drone_nova_valkyrie.jpg', desc: 'Dano acumulado causado em combate por lasers, arcos elétricos, mísseis e veneno.', unitLabel: 'Dano',
            tiers: [1500, 15000, 100000, 500000, 2500000],
            rewards: [
                { gold: 30, xp: 25, title: 'Feixe Inicial 🥉' },
                { gold: 150, xp: 100, title: 'Bateria Pesada 🥈' },
                { gold: 850, xp: 450, title: 'Chuva de Plasma 🥇' },
                { gold: 4800, xp: 2000, title: 'Tempestade Solar 💎' },
                { gold: 32000, xp: 11000, title: 'SUPERNOVA SÔNICA 👑⚡' }
            ]
        },
        {
            id: 'drone_heals', name: 'Pulsos de Suporte & Cura', badge: 'SUPORTE', badgeClass: 'badge-tank',
            icon: 'assets/drones/drone_support.jpg', desc: 'Ondas de cura, mana, escudo e velocidade ativadas por drones de suporte.', unitLabel: 'Pulsos',
            tiers: [10, 60, 250, 1000, 4000],
            rewards: [
                { gold: 30, xp: 25, title: 'Recarga Rápida 🥉' },
                { gold: 130, xp: 85, title: 'Escudeiro Sônico 🥈' },
                { gold: 700, xp: 380, title: 'Guardião Harmônico 🥇' },
                { gold: 4000, xp: 1700, title: 'Anjo Cibernético 💎' },
                { gold: 26000, xp: 9000, title: 'AMPLIFICADOR DIVINO 👑⚡' }
            ]
        },
        {
            id: 'drone_cc_applied', name: 'Controles de Grupo (CC)', badge: 'CONTROLADOR', badgeClass: 'badge-common',
            icon: 'assets/drones/drone_controller.jpg', desc: 'Efeitos de congelamento, stun, sono, veneno e empurrão aplicados nos zumbis.', unitLabel: 'Efeitos',
            tiers: [15, 100, 500, 2500, 10000],
            rewards: [
                { gold: 30, xp: 25, title: 'Pulso Paralisante 🥉' },
                { gold: 140, xp: 95, title: 'Sabotador Tático 🥈' },
                { gold: 780, xp: 420, title: 'Senhor do Vórtice 🥇' },
                { gold: 4400, xp: 1900, title: 'Zero Absoluto 💎' },
                { gold: 28000, xp: 10000, title: 'DOMINADOR NEURAL 👑⚡' }
            ]
        },
        {
            id: 'drone_missiles', name: 'Sobrecargas & Mísseis', badge: 'ARSENAL', badgeClass: 'badge-danger',
            icon: 'assets/drones/drone_plasma_reaper.jpg', desc: 'Mísseis Pyro, escudos harmônicos extras e controles duplos disparados.', unitLabel: 'Sobrecargas',
            tiers: [5, 30, 150, 600, 2500],
            rewards: [
                { gold: 35, xp: 30, title: 'Ignição Extra 🥉' },
                { gold: 150, xp: 100, title: 'Ogiva Dupla 🥈' },
                { gold: 820, xp: 440, title: 'Artilharia Pesada 🥇' },
                { gold: 4500, xp: 2000, title: 'Protocolo Ômega 💎' },
                { gold: 30000, xp: 10500, title: 'CHUVA APOCALÍPTICA 👑⚡' }
            ]
        },
        {
            id: 'drone_unlocked', name: 'Esquadrão de Drones', badge: 'COLEÇÃO', badgeClass: 'badge-legendary',
            icon: 'assets/drones/drone_celestial_amp.jpg', desc: 'Desbloqueie drones adicionais na Loja para ampliar seu arsenal aéreo.', unitLabel: 'Drones', isPeakStat: true,
            tiers: [4, 6, 8, 10, 13],
            rewards: [
                { gold: 150, xp: 100, title: 'Hangar Aberto 🥉' },
                { gold: 600, xp: 350, title: 'Colecionador Aéreo 🥈' },
                { gold: 2500, xp: 1200, title: 'Frota de Elite 🥇' },
                { gold: 10000, xp: 4500, title: 'Arsenal Completo 💎' },
                { gold: 50000, xp: 20000, title: 'ALMIRANTE DOS DRONES 👑⚡' }
            ]
        },
        {
            id: 'drone_max_level', name: 'Maestria & Nível de Drone', badge: 'UPGRADE', badgeClass: 'badge-tank',
            icon: 'assets/talents/drone_overclock.jpg', desc: 'Alcance níveis mais altos evoluindo qualquer drone com XP ou Ouro.', unitLabel: 'Nível Máx', isPeakStat: true,
            tiers: [5, 15, 35, 65, 100],
            rewards: [
                { gold: 60, xp: 45, title: 'Primeiro Ajuste 🥉' },
                { gold: 280, xp: 180, title: 'Overclock Firme 🥈' },
                { gold: 1400, xp: 750, title: 'Núcleo Turbinado 🥇' },
                { gold: 7500, xp: 3200, title: 'Engenheiro Supremo 💎' },
                { gold: 40000, xp: 16000, title: 'DRONE LENDÁRIO LV.100 👑⚡' }
            ]
        }
    ];

    if (typeof window !== 'undefined') window.DRONE_MISSION_DEFS = DRONE_MISSION_DEFS;
    if (typeof module !== 'undefined' && module.exports) module.exports = DRONE_MISSION_DEFS;
})();
