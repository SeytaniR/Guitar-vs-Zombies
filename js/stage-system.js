// StageSystem - Procedural Infinite Stages, Difficulty Scaling and Progression Rewards
class StageSystem {
    constructor() {
        this.highestUnlockedStage = this.loadHighestStage();
        this.selectedStage = this.loadSelectedStage();
        this.initMaps();
        this.selectedMapId = this.loadSelectedMap();
    }

    initMaps() {
        this.maps = [
            {
                id: 'map_void',
                name: 'The Void Club',
                subtitle: 'Clube Subterrâneo & Escombros Urbanos',
                description: 'Fachada do lendário pub underground "The Void", barricadas de concreto e ônibus blindado abandonado.',
                badge: 'URBANO',
                badgeClass: 'badge-urban',
                themeColor: '#00ffcc',
                src: 'assets/maps/map_void.jpg',
                thumb: 'assets/maps/thumb_void.jpg'
            },
            {
                id: 'map_ruins',
                name: 'Palco dos Escombros',
                subtitle: 'Arena Central do Apocalipse',
                description: 'Palco de metal destruído no coração das ruínas metropolitanas, cercado por amplificadores e fumaça.',
                badge: 'CONCERTO',
                badgeClass: 'badge-concert',
                themeColor: '#ff0055',
                src: 'assets/maps/map_ruins.jpg',
                thumb: 'assets/maps/thumb_ruins.jpg'
            },
            {
                id: 'map_wasteland',
                name: 'Wasteland do Metal',
                subtitle: 'Deserto Anárquico & Posto Tóxico',
                description: 'Autoestrada árida estilo Mad Max, posto de gasolina fortificado, cactos e sucatas sob tempestade de areia.',
                badge: 'DESERTO',
                badgeClass: 'badge-desert',
                themeColor: '#ffaa00',
                src: 'assets/maps/map_wasteland.jpg',
                thumb: 'assets/maps/thumb_wasteland.jpg'
            }
        ];
    }

    loadSelectedMap() {
        try {
            const val = localStorage.getItem('gvs_selected_map');
            if (val && this.maps.some(m => m.id === val)) return val;
        } catch(e) {}
        return 'map_void';
    }

    getAllMaps() {
        return this.maps;
    }

    rollRandomMap() {
        if (!this.maps || this.maps.length === 0) return null;
        const randIdx = Math.floor(Math.random() * this.maps.length);
        this.selectedMapId = this.maps[randIdx].id;
        this.save();
        return this.getSelectedMap();
    }

    getSelectedMap() {
        return this.maps.find(m => m.id === this.selectedMapId) || this.maps[0];
    }

    setSelectedMap(mapId) {
        if (this.maps.some(m => m.id === mapId)) {
            this.selectedMapId = mapId;
            this.save();
            return true;
        }
        return false;
    }

    cycleMap(direction = 1) {
        const idx = this.maps.findIndex(m => m.id === this.selectedMapId);
        const nextIdx = (idx + direction + this.maps.length) % this.maps.length;
        this.setSelectedMap(this.maps[nextIdx].id);
        return this.getSelectedMap();
    }

    getMapForStage(stage = this.selectedStage) {
        return this.rollRandomMap();
    }

    loadHighestStage() {
        try {
            const val = parseInt(localStorage.getItem('gvs_highest_stage'), 10);
            return (val && !isNaN(val) && val >= 1) ? val : 1;
        } catch(e) {
            return 1;
        }
    }

    loadSelectedStage() {
        try {
            const val = parseInt(localStorage.getItem('gvs_selected_stage'), 10);
            return (val && !isNaN(val) && val >= 1) ? Math.min(val, this.highestUnlockedStage) : 1;
        } catch(e) {
            return 1;
        }
    }

    save() {
        try {
            localStorage.setItem('gvs_highest_stage', this.highestUnlockedStage.toString());
            localStorage.setItem('gvs_selected_stage', this.selectedStage.toString());
            localStorage.setItem('gvs_selected_map', this.selectedMapId);
        } catch(e) {}
    }

    setSelectedStage(stage) {
        if (stage >= 1 && stage <= this.highestUnlockedStage) {
            this.selectedStage = stage;
            this.rollRandomMap();
            this.save();
            return true;
        }
        return false;
    }

    unlockNextStage() {
        if (this.selectedStage >= this.highestUnlockedStage) {
            this.highestUnlockedStage = this.selectedStage + 1;
            this.selectedStage = this.highestUnlockedStage;
            this.rollRandomMap();
            this.save();
        }
    }

    completeStage(stage = this.selectedStage) {
        this.unlockNextStage();
        const rewards = this.getStageRewards(stage);
        if (window.talentSystem && typeof window.talentSystem.addGold === 'function') {
            window.talentSystem.addGold(rewards.coins);
        }
        if (window.guitaristPool && typeof window.guitaristPool.getSelectedGuitarist === 'function') {
            const hero = window.guitaristPool.getSelectedGuitarist();
            if (hero && typeof window.guitaristPool.addHeroXp === 'function') {
                window.guitaristPool.addHeroXp(hero.id, rewards.xp);
            }
        }
        return { stage, rewards };
    }

    isBossStage(stage = this.selectedStage) {
        return stage > 0 && (stage % 5 === 0);
    }

    getBossZombieDef(stage = this.selectedStage) {
        const bossPoolIds = [
            'bloater_pounder',
            'toxic_mutant',
            'god_of_war_spartan',
            'chained_gladiator',
            'dark_knight_undead',
            'inferno_firefighter',
            'builder_demolisher'
        ];
        const cycle = Math.max(0, Math.floor(stage / 5) - 1);
        const bossId = bossPoolIds[cycle % bossPoolIds.length];
        const master = (window.enemyPool && window.enemyPool.masterPool) ? window.enemyPool.masterPool : [];
        const baseDef = master.find(z => z.id === bossId) || master[0] || { id: 'toxic_mutant', name: 'Mutante Radioativo', type: 'mutant', hp: 299 };
        return {
            ...baseDef,
            isBoss: true,
            hpMultiplier: 3.5,
            badge: 'CHEFE',
            badgeClass: 'badge-boss',
            name: baseDef.name
        };
    }

    getStageName(stage) {
        if (this.isBossStage(stage)) {
            const bossDef = this.getBossZombieDef(stage);
            return `Fase ${stage}: 👑 CONFRONTO DE CHEFE: ${bossDef.name.toUpperCase()}!`;
        }

        const namedPrefixes = [
            'Rua das Garagens',
            'Subúrbio Desolado',
            'Avenida Neon',
            'Ponto de Ônibus Sombrio',
            'Distrito Industrial',
            'Pátio Ferroviário',
            'Viaduto dos Infectados',
            'Centro Metropolitano',
            'Praça das Chamas',
            'Boulevard Radioativo',
            'Beco dos Desesperados',
            'Autoestrada Infernal',
            'Zona de Contenção',
            'Complexo Quarentena',
            'Wasteland Nuclear'
        ];

        if (stage <= namedPrefixes.length) {
            return `Fase ${stage}: ${namedPrefixes[stage - 1]}`;
        }

        const sectors = ['Setor Alfa', 'Setor Ômega', 'Zona Tóxica', 'Abismo Sônico', 'Wasteland', 'Pilar do Heavy Metal'];
        const sectorIndex = (stage - 1) % sectors.length;
        const cycle = Math.floor((stage - 1) / sectors.length) + 1;
        return `Fase ${stage}: ${sectors[sectorIndex]} MK-${cycle}`;
    }

    getZombieBaseLevel(stage = this.selectedStage) {
        return Math.max(1, Math.floor(1 + (stage - 1) * 1.4));
    }

    getZombieLevelRange(stage = this.selectedStage) {
        const base = this.getZombieBaseLevel(stage);
        const max = base + Math.min(12, Math.floor(stage * 0.45));
        return { min: base, max: max };
    }

    getTargetKills(stage = this.selectedStage) {
        if (this.isBossStage(stage)) return 8;
        return Math.min(100, 12 + Math.floor(stage * 2.2));
    }

    getStageRewards(stage = this.selectedStage) {
        const isBoss = this.isBossStage(stage);
        const mult = isBoss ? 2.0 : 1.0;
        const coins = Math.floor((45 + stage * 22 + Math.pow(stage, 1.22) * 3) * mult);
        const xp = Math.floor((55 + stage * 25 + Math.pow(stage, 1.20) * 3) * mult);
        return { coins, xp, isBoss };
    }

    getStageInfo(stage = this.selectedStage) {
        const range = this.getZombieLevelRange(stage);
        const rewards = this.getStageRewards(stage);
        return {
            stage,
            isBossStage: this.isBossStage(stage),
            name: this.getStageName(stage),
            minZombieLevel: range.min,
            maxZombieLevel: range.max,
            targetKills: this.getTargetKills(stage),
            rewardCoins: rewards.coins,
            rewardXp: rewards.xp
        };
    }
}

window.stageSystem = new StageSystem();
