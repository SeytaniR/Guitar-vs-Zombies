// StageSystem - Procedural Infinite Stages, Difficulty Scaling and Progression Rewards
class StageSystem {
    constructor() {
        this.highestUnlockedStage = this.loadHighestStage();
        this.selectedStage = this.loadSelectedStage();
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
        } catch(e) {}
    }

    setSelectedStage(stage) {
        if (stage >= 1 && stage <= this.highestUnlockedStage) {
            this.selectedStage = stage;
            this.save();
            return true;
        }
        return false;
    }

    unlockNextStage() {
        if (this.selectedStage >= this.highestUnlockedStage) {
            this.highestUnlockedStage = this.selectedStage + 1;
            this.save();
        }
    }

    getStageName(stage) {
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
        return Math.min(100, 12 + Math.floor(stage * 2.2));
    }

    getStageRewards(stage = this.selectedStage) {
        const coins = Math.floor(45 + stage * 22 + Math.pow(stage, 1.22) * 3);
        const xp = Math.floor(55 + stage * 25 + Math.pow(stage, 1.20) * 3);
        return { coins, xp };
    }

    getStageInfo(stage = this.selectedStage) {
        const range = this.getZombieLevelRange(stage);
        const rewards = this.getStageRewards(stage);
        return {
            stage,
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
