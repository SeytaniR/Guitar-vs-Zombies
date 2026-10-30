// Enemy Pool System - Dynamic Zombie Variety & Map Encounters
class EnemyPoolSystem {
    constructor() {
        this.masterPool = [
            {
                id: 'punk_walker',
                name: 'Zumbi Punk Rocker',
                badge: 'COMUM',
                fullBadge: 'Normal / Punk',
                badgeClass: 'badge-common',
                icon: 'assets/zombies/punk_walker.jpg',
                type: 'normal',
                sheet: 'zombieSheet',
                desc: 'Veterano do submundo punk. Marcha constante em hordas regulares com mordidas cadenciadas.',
                hp: 80,
                speed: 38,
                attackDamage: 7,
                attackInterval: 1.1,
                scale: 0.50
            },
            {
                id: 'feral_leaper',
                name: 'Corredor Saltador',
                badge: 'ÁGIL',
                fullBadge: 'Ágil / Salto Aéreo',
                badgeClass: 'badge-agile',
                icon: 'assets/zombies/feral_leaper.jpg',
                type: 'leaper',
                sheet: 'leaperSheet',
                desc: 'Galope veloz em 4 apoios. Salta em arco acrobático direto sobre outros zumbis!',
                hp: 65,
                speed: 76,
                attackDamage: 5,
                attackInterval: 0.55,
                scale: 0.50
            },
            {
                id: 'toxic_mutant',
                name: 'Mutante Radioativo',
                badge: 'TANK',
                fullBadge: 'Tank / Devastador',
                badgeClass: 'badge-tank',
                icon: 'assets/zombies/toxic_mutant.jpg',
                type: 'mutant',
                sheet: 'mutantSheet',
                desc: 'Colosso blindado com pústulas tóxicas. Alta vida, resiste a tiros e golpeia com força devastadora.',
                hp: 230,
                speed: 23,
                attackDamage: 18,
                attackInterval: 1.4,
                scale: 1.05
            },
            // === Sargento Blindado ===
            {
                id: 'armored_soldier',
                name: 'Sargento Blindado',
                badge: 'BLINDADO',
                fullBadge: 'Blindado / Carga',
                badgeClass: 'badge-danger',
                icon: 'assets/zombies/armored_soldier.jpg',
                type: 'soldier',
                sheet: 'soldierSheet',
                desc: 'Militar reanimado com capacete balístico. Reduz dano de tiros comuns em 40% (exceto Críticos). Arranca em carga rápida abaixo de 50% HP!',
                hp: 210,
                speed: 36,
                attackDamage: 12,
                attackInterval: 1.0,
                scale: 0.52
            },
            // === NOVO 2: Infectado Esporo ===
            {
                id: 'fungal_spore',
                name: 'Infectado Esporo',
                badge: 'ESPORO',
                fullBadge: 'Fungo / Regenerativo',
                badgeClass: 'badge-toxic',
                icon: 'assets/zombies/fungal_spore.jpg',
                type: 'spore',
                sheet: 'sporeSheet',
                desc: 'Hospedeiro fúngico pulsante. Emite nuvens de esporos que regeneram zumbis aliados (+15 HP) e explode em veneno tóxico ao morrer!',
                hp: 125,
                speed: 33,
                attackDamage: 9,
                attackInterval: 1.15,
                scale: 0.50
            },
            // === NOVO 3: Gordo Devorador ===
            {
                id: 'bloater_pounder',
                name: 'Gordo Devorador',
                badge: 'COLOSSO',
                fullBadge: 'Colosso / Sísmico',
                badgeClass: 'badge-tank',
                icon: 'assets/zombies/bloater_pounder.jpg',
                type: 'bloater',
                sheet: 'bloaterSheet',
                desc: 'Colosso grotesco de alta resistência. Desfere murros sísmicos no asfalto que estremecem a tela e dissipam projéteis sônicos em vôo!',
                hp: 440,
                speed: 21,
                attackDamage: 20,
                attackInterval: 1.7,
                scale: 0.65
            },
            // === NOVO 4: Gladiador do Asfalto ===
            {
                id: 'chained_gladiator',
                name: 'Gladiador do Asfalto',
                badge: 'GLADIADOR',
                fullBadge: 'Gladiador / Deflexão',
                badgeClass: 'badge-rusher',
                icon: 'assets/zombies/chained_gladiator.jpg',
                type: 'gladiator',
                sheet: 'gladiatorSheet',
                desc: 'Guerreiro de aço e couro. Gira correntes com 35% de chance de defletir notas e desfere socos pesados de pistão no corpo a corpo!',
                hp: 195,
                speed: 35,
                attackDamage: 18,
                attackInterval: 1.15,
                scale: 0.52
            },
            // === NOVO 5: Operário Hazmat ===
            {
                id: 'toxic_hazmat',
                name: 'Operário Hazmat',
                badge: 'TÓXICO',
                fullBadge: 'Químico / Poça Ácida',
                badgeClass: 'badge-toxic',
                icon: 'assets/zombies/toxic_hazmat.jpg',
                type: 'hazmat',
                sheet: 'hazmatSheet',
                desc: 'Traje de contenção com vazamento químico. Goteja poças corrosivas no asfalto que enfraquecem notas musicais e explode em gás ácido ao morrer!',
                hp: 160,
                speed: 31,
                attackDamage: 11,
                attackInterval: 1.2,
                scale: 0.52
            }
        ];

        this.currentSelectedEnemies = [];
    }

    // Sorteia exatamente 5 zumbis distintos para a nova partida
    rollMapEnemies(count = 5) {
        const poolCopy = [...this.masterPool];
        // Fisher-Yates shuffle
        for (let i = poolCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
        }
        this.currentSelectedEnemies = poolCopy.slice(0, Math.min(count, poolCopy.length));
        return this.currentSelectedEnemies;
    }

    getEnemiesForCurrentMatch() {
        if (this.currentSelectedEnemies.length === 0) {
            this.rollMapEnemies(5);
        }
        return this.currentSelectedEnemies;
    }
}

window.enemyPool = new EnemyPoolSystem();
