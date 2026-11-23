// ==========================================================================
// DRONE SYSTEM - Companion Hovering Pets (Offensive, Support & Controller)
// Floats above the guitarist's head (and opponent's head in PvP).
// Invulnerable (no HP, takes zero damage). Includes XP, Levels 1-100,
// Gold/XP Upgrades, Shop Tab, Pre-Battle PvE Card & PvP Loadout + AI Drone.
// ==========================================================================

const _trD = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);

class DroneSystem {
    constructor() {
        this.drones = [
            {
                id: 'pyro_shredder',
                name: 'Pyro-Shredder MK-I',
                type: 'offensive',
                badgeKey: 'droneTypeOffensive',
                badge: 'OFENSIVO',
                badgeClass: 'badge-danger',
                icon: 'assets/drones/drone_offensive.jpg',
                sheet: 'droneOffensiveSheet',
                sheetSrc: 'assets/drones/drone_offensive_sheet.jpg',
                cols: 4,
                rows: 3,
                color: '#ff4411',
                accentColor: '#ffaa00',
                unlockCost: 0,
                unlockedByDefault: true,
                isInvulnerable: true,
                hasHp: false,
                title: 'Canhão Sônico Incendiário',
                desc: 'Drone de ataque pesado que flutua sobre o guitarrista disparando lasers de plasma e mísseis incendiários na horda.',
                skillName: 'Salva Pyro-Riff & Míssil Solar',
                skillDesc: 'Dispara rajadas térmicas contínuas e, a cada 4º tiro, lança um míssil explosivo em área com Queimadura + Aura de Dano ao herói.'
            },
            {
                id: 'harmonic_pulse',
                name: 'Harmonic Pulse-Bot',
                type: 'support',
                badgeKey: 'droneTypeSupport',
                badge: 'SUPORTE',
                badgeClass: 'badge-toxic',
                icon: 'assets/drones/drone_support.jpg',
                sheet: 'droneSupportSheet',
                sheetSrc: 'assets/drones/drone_support_sheet.jpg',
                cols: 4,
                rows: 3,
                color: '#00ff88',
                accentColor: '#ffd700',
                unlockCost: 0,
                unlockedByDefault: true,
                isInvulnerable: true,
                hasHp: false,
                title: 'Sintetizador Angelical de Cura & Buffs',
                desc: 'Unidade harmônica de suporte que restaura vida, regenera Rock Mana e amplifica a velocidade e o escudo do guitarrista.',
                skillName: 'Ressurreição Harmônica & Escudo',
                skillDesc: 'Emite ondas vitais periódicas que curam HP, restauram MP, aceleram o ataque do guitarrista e geram Escudo Acústico.'
            },
            {
                id: 'cryo_vortex',
                name: 'Cryo-Vortex Disruptor',
                type: 'controller',
                badgeKey: 'droneTypeController',
                badge: 'CONTROLADOR',
                badgeClass: 'badge-agile',
                icon: 'assets/drones/drone_controller.jpg',
                sheet: 'droneControllerSheet',
                sheetSrc: 'assets/drones/drone_controller_sheet.jpg',
                cols: 4,
                rows: 3,
                color: '#00e5ff',
                accentColor: '#b336ff',
                unlockCost: 0,
                unlockedByDefault: true,
                isInvulnerable: true,
                hasHp: false,
                title: 'Orbe Tático de Controle de Grupo & DoT',
                desc: 'Disruptor criogênico e neuro-tóxico que paralisa a horda com lentidão, congelamento, stun elétrico, sono e veneno.',
                skillName: 'Matriz de Controle Total (CC & DoT)',
                skillDesc: 'Alterna pulsos táticos em área: Congelamento (Lentidão), Stun Tesla, Onda de Sono, Veneno Corrosivo e Vórtice de Empurrão.'
            }
        ];

        this.selectedId = this.loadSelectedId();
        this.unlockedDrones = this.loadUnlockedDrones();
        this.droneLevels = this.loadDroneLevels();
        this.activeShopTab = 'heroes';

        // Real-time combat state
        this.actionTimer = 0;
        this.actionCount = 0;
        this.ccCycleIndex = 0;
        this.oppActionTimer = 0;
        this.oppActionCount = 0;
        this.oppCcCycleIndex = 0;
        this.activeBeams = [];
    }

    loadSelectedId() {
        try {
            const saved = localStorage.getItem('gvs_selected_drone');
            if (saved && this.drones.some(d => d.id === saved)) return saved;
        } catch (e) {}
        return 'pyro_shredder';
    }

    loadUnlockedDrones() {
        const allIds = this.drones.map(d => d.id);
        try {
            const raw = localStorage.getItem('gvs_unlocked_drones');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    allIds.forEach(id => { if (!parsed.includes(id)) parsed.push(id); });
                    return parsed;
                }
            }
        } catch (e) {}
        return allIds;
    }

    saveUnlockedDrones() {
        try { localStorage.setItem('gvs_unlocked_drones', JSON.stringify(this.unlockedDrones)); } catch (e) {}
    }

    isDroneUnlocked(droneId) {
        const d = this.drones.find(x => x.id === droneId);
        if (d && d.unlockedByDefault) return true;
        return this.unlockedDrones.includes(droneId);
    }

    loadDroneLevels() {
        const defaults = {};
        this.drones.forEach(d => { defaults[d.id] = { level: 1, xp: 0 }; });
        try {
            const raw = localStorage.getItem('gvs_drone_levels');
            if (raw) {
                const parsed = JSON.parse(raw);
                for (const id in defaults) {
                    if (parsed[id] && typeof parsed[id].level === 'number') {
                        defaults[id].level = Math.max(1, Math.min(100, Math.floor(parsed[id].level)));
                        defaults[id].xp = Math.max(0, Math.floor(parsed[id].xp || 0));
                    }
                }
            }
        } catch (e) {}
        return defaults;
    }

    saveDroneLevels() {
        try { localStorage.setItem('gvs_drone_levels', JSON.stringify(this.droneLevels)); } catch (e) {}
    }

    getAllDrones() { return this.drones; }

    getSelectedDrone() {
        return this.drones.find(d => d.id === this.selectedId) || this.drones[0];
    }

    getActiveDrone() { return this.getSelectedDrone(); }
    selectDrone(droneId) { return this.setSelectedDrone(droneId); }

    setSelectedDrone(droneId) {
        if (this.drones.some(d => d.id === droneId) && this.isDroneUnlocked(droneId)) {
            this.selectedId = droneId;
            try { localStorage.setItem('gvs_selected_drone', droneId); } catch (e) {}
            return true;
        }
        return false;
    }

    cycleDrone(direction = 1) {
        const all = this.drones;
        const currIdx = all.findIndex(d => d.id === this.selectedId);
        const nextIdx = (currIdx + direction + all.length) % all.length;
        this.setSelectedDrone(all[nextIdx].id);
        if (window.soundEngine && typeof window.soundEngine.playGuitarChord === 'function') {
            window.soundEngine.playGuitarChord(2);
        }
        this.renderPreBattleDroneCard();
        this.populatePvPDroneDropdown();
        this.updatePvPDroneCardPreview();
    }

    getDroneLevelData(droneId) {
        if (!this.droneLevels[droneId]) this.droneLevels[droneId] = { level: 1, xp: 0 };
        return this.droneLevels[droneId];
    }

    setLevel(droneId, level) {
        const data = this.getDroneLevelData(droneId);
        data.level = Math.max(1, Math.min(100, Math.floor(level)));
        this.saveDroneLevels();
        return data;
    }

    getXpRequiredForNextLevel(level) {
        if (level >= 100) return Infinity;
        return Math.floor(45 * Math.pow(level, 1.32));
    }

    getGoldCostForLevelUp(droneIdOrLevel) {
        let lvl = typeof droneIdOrLevel === 'number' ? droneIdOrLevel : this.getDroneLevelData(droneIdOrLevel).level;
        if (lvl >= 100) return Infinity;
        return Math.floor(85 * Math.pow(lvl, 1.38));
    }

    addDroneXp(droneId, xpAmount) {
        const data = this.getDroneLevelData(droneId);
        if (data.level >= 100) return { leveledUp: false, newLevel: 100 };
        data.xp += Math.max(0, Math.round(xpAmount));
        let leveledUp = false;
        while (data.level < 100) {
            const req = this.getXpRequiredForNextLevel(data.level);
            if (data.xp >= req) {
                data.xp -= req;
                data.level++;
                leveledUp = true;
            } else break;
        }
        if (data.level >= 100) data.xp = 0;
        this.saveDroneLevels();
        return { leveledUp, newLevel: data.level, currentXp: data.xp, reqXp: this.getXpRequiredForNextLevel(data.level) };
    }

    injectXpIntoDrone(droneId) {
        const data = this.getDroneLevelData(droneId);
        if (data.level >= 100) return { success: false, reason: _trD('xpHeroMaxReason', 'Nível Máximo Atingido (100)') };
        const pool = window.guitaristPool;
        const playerXp = (pool && typeof pool.getPlayerXp === 'function') ? pool.getPlayerXp() : 0;
        if (playerXp <= 0) return { success: false, reason: _trD('xpInvEmptyReason', 'Sem XP no inventário!') };
        const req = this.getXpRequiredForNextLevel(data.level);
        const needed = Math.max(1, req - data.xp);
        const toInject = Math.min(needed, playerXp);
        if (pool) {
            pool.playerXp = Math.max(0, pool.playerXp - toInject);
            pool.savePlayerXp();
        }
        const res = this.addDroneXp(droneId, toInject);
        return { success: true, injectedXp: toInject, leveledUp: res.leveledUp, newLevel: res.newLevel, remainingPlayerXp: pool ? pool.playerXp : 0 };
    }

    levelUpWithGold(droneId, talentSystem = window.talentSystem) {
        const data = this.getDroneLevelData(droneId);
        if (data.level >= 100) return { success: false, reason: _trD('xpHeroMaxReason', 'Nível Máximo Atingido (100)') };
        const cost = this.getGoldCostForLevelUp(data.level);
        const currentGold = (talentSystem && typeof talentSystem.gold === 'number') ? talentSystem.gold : 0;
        if (currentGold < cost) return { success: false, reason: _trD('goldRequiredReason', `Ouro insuficiente (necessário: 🪙 ${cost})`, { cost }) };
        if (talentSystem) {
            talentSystem.gold -= cost;
            if (typeof talentSystem.saveProgress === 'function') talentSystem.saveProgress();
            if (typeof talentSystem.updateHUDGold === 'function') talentSystem.updateHUDGold();
        }
        data.level++;
        data.xp = 0;
        this.saveDroneLevels();
        return { success: true, newLevel: data.level, cost };
    }

    getDroneStats(droneId, overrideLevel = null) {
        const drone = this.drones.find(d => d.id === droneId) || this.drones[0];
        const lvl = overrideLevel !== null ? Math.max(1, Math.min(100, overrideLevel)) : this.getDroneLevelData(drone.id).level;
        const inc = lvl - 1;

        if (drone.type === 'offensive') {
            const damage = Math.round(26 * (1 + 0.022 * inc));
            const missileDamage = Math.round(damage * 1.75);
            const cooldown = Math.max(1.05, Number((1.80 - inc * 0.007).toFixed(2)));
            const heroDamageBonusPct = Number((6 + inc * 0.20).toFixed(1));
            const burnDps = Math.round(18 + inc * 0.25);
            return { level: lvl, type: 'offensive', damage, missileDamage, cooldown, heroDamageBonusPct, burnDps, isInvulnerable: true, hasHp: false };
        }
        if (drone.type === 'support') {
            const healAmount = Math.round(7 + inc * 0.22);
            const manaGrant = Math.round(6 + inc * 0.10);
            const cooldown = Math.max(2.10, Number((3.20 - inc * 0.011).toFixed(2)));
            const atkSpeedBuffPct = Math.round(20 + inc * 0.25);
            const shieldAmount = Math.round(14 + inc * 0.30);
            return { level: lvl, type: 'support', healAmount, manaGrant, cooldown, atkSpeedBuffPct, shieldAmount, heroDamageBonusPct: 0, isInvulnerable: true, hasHp: false };
        }
        const ccDamage = Math.round(14 * (1 + 0.016 * inc));
        const cooldown = Math.max(1.35, Number((2.20 - inc * 0.0085).toFixed(2)));
        const slowPct = Math.min(68, Math.round(42 + inc * 0.25));
        const stunDuration = Number((1.15 + inc * 0.009).toFixed(2));
        const sleepDuration = Number((1.50 + inc * 0.010).toFixed(2));
        const poisonDps = Math.round(14 + inc * 0.22);
        const knockbackPx = Math.round(28 + inc * 0.20);
        return { level: lvl, type: 'controller', ccDamage, cooldown, slowPct, stunDuration, sleepDuration, poisonDps, knockbackPx, heroDamageBonusPct: 0, isInvulnerable: true, hasHp: false };
    }

    getDroneSummaryLine(droneId, overrideLevel = null) {
        const st = this.getDroneStats(droneId, overrideLevel);
        if (st.type === 'offensive') {
            return _trD('droneStatSummaryOff', `💥 ${st.damage} Dano • 🚀 Míssil ${st.missileDamage} • ⏱️ ${st.cooldown}s • 🎸 +${st.heroDamageBonusPct}% Dano`, { dmg: st.damage, msl: st.missileDamage, cd: st.cooldown, aura: st.heroDamageBonusPct });
        }
        if (st.type === 'support') {
            return _trD('droneStatSummarySup', `💚 +${st.healAmount} HP • ⚡ +${st.manaGrant} MP • 🛡️ +${st.shieldAmount} Escudo • 🚀 +${st.atkSpeedBuffPct}% Vel`, { hp: st.healAmount, mp: st.manaGrant, shd: st.shieldAmount, spd: st.atkSpeedBuffPct });
        }
        return _trD('droneStatSummaryCtrl', `❄️ -${st.slowPct}% Vel • ⚡ Stun ${st.stunDuration}s • 💤 Sono ${st.sleepDuration}s • 🧪 ${st.poisonDps}/s`, { slow: st.slowPct, stun: st.stunDuration, sleep: st.sleepDuration, psn: st.poisonDps });
    }

    // ==========================================
    // REAL-TIME COMBAT LOGIC & FLOATING POSITION
    // ==========================================
    resetBattle() {
        this.actionTimer = 0.6;
        this.actionCount = 0;
        this.ccCycleIndex = 0;
        this.oppActionTimer = 0.9;
        this.oppActionCount = 0;
        this.oppCcCycleIndex = 0;
        this.activeBeams = [];
    }

    getPlayerDronePosition(combat) {
        const heroPos = combat ? combat.getHeroPosition() : { x: 60, y: 200 };
        const t = ((combat && combat.time) || 0) / 1000;
        return {
            x: Math.round(heroPos.x - 4 + Math.cos(t * 2.3) * 6),
            y: Math.round(heroPos.y - 68 + Math.sin(t * 3.6) * 4.5)
        };
    }

    getOpponentDronePosition(combat, pvp) {
        const oppPos = (pvp && typeof pvp.getOpponentPosition === 'function') ? pvp.getOpponentPosition(combat) : { x: 700, y: 200 };
        const t = ((combat && combat.time) || 0) / 1000;
        return {
            x: Math.round(oppPos.x + 4 + Math.cos(t * 2.3 + 1.5) * 6),
            y: Math.round(oppPos.y - 68 + Math.sin(t * 3.6 + 1.5) * 4.5)
        };
    }

    addBeam(x1, y1, x2, y2, color, width = 3, life = 0.28) {
        this.activeBeams.push({ x1, y1, x2, y2, color, width, life, maxLife: life });
        if (this.activeBeams.length > 16) this.activeBeams.shift();
    }

    update(dt, combat) {
        if (!combat || combat.isGameOver || !combat.matchActive) return;

        // 1. Decay active visual laser/harmonic/cryo beams
        for (let i = this.activeBeams.length - 1; i >= 0; i--) {
            this.activeBeams[i].life -= dt;
            if (this.activeBeams[i].life <= 0) this.activeBeams.splice(i, 1);
        }

        // 2. Tick Controller Drone status effects (Sleep & Poison DoT) on active zombies
        for (const z of combat.entities.zombies) {
            if (!z.active) continue;
            if (z.sleepTimer > 0) {
                z.sleepTimer -= dt;
                z.stunTimer = Math.max(z.stunTimer || 0, 0.05);
            }
            if (z.freezeTimer > 0) {
                z.freezeTimer -= dt;
            }
            if (z.poisonTimer > 0) {
                z.poisonTimer -= dt;
                const pDmg = (z.poisonDps || 14) * dt;
                z.hp -= pDmg;
                if (z.hp <= 0 && z.active) {
                    if (z.side === 'opponent' && combat.isPvPMode && combat.pvpSystem) {
                        z.active = false;
                        combat.pvpSystem.opponentZombiesKilled++;
                        if (combat.pvpSystem.opponent) combat.pvpSystem.opponent.score += 150;
                    } else {
                        z.active = false;
                        combat.onZombieKilled(z, 130, _trD('dronePoisonKill', '+VENENO! 🧪'), '#b336ff');
                    }
                }
            }
        }

        // 3. Player Drone Action Loop
        const drone = this.getActiveDrone();
        const stats = this.getDroneStats(drone.id);
        this.actionTimer += dt;
        if (this.actionTimer >= stats.cooldown) {
            this.actionTimer = 0;
            this.executePlayerDroneAction(drone, stats, combat);
        }

        // 4. PvP Simulated Opponent Drone Action Loop
        if (combat.isPvPMode && combat.pvpSystem && combat.pvpSystem.opponent && combat.pvpSystem.state === 'playing') {
            this.updateOpponentDrone(dt, combat, combat.pvpSystem);
        }
    }

    findClosestZombie(combat, side = 'player', refX = 0) {
        let closest = null, minDist = Infinity;
        for (const z of combat.entities.zombies) {
            if (!z.active || z.x > combat.canvas.width - 4) continue;
            if (combat.isPvPMode) {
                if (side === 'player' && (z.side !== 'player' || z.x > combat.canvas.width * 0.52)) continue;
                if (side === 'opponent' && (z.side !== 'opponent' || z.x < combat.canvas.width * 0.48)) continue;
            }
            const dist = Math.abs(z.x - refX);
            if (dist < minDist) { minDist = dist; closest = z; }
        }
        return closest;
    }

    executePlayerDroneAction(drone, stats, combat) {
        const dPos = this.getPlayerDronePosition(combat);
        const heroPos = combat.getHeroPosition();
        this.actionCount++;

        if (drone.type === 'offensive') {
            const target = this.findClosestZombie(combat, 'player', heroPos.x);
            if (!target) return;
            const ty = target.y + (target.jumpArcY || 0) - 18;
            const isMissile = (this.actionCount % 4 === 0);
            const dmg = isMissile ? stats.missileDamage : stats.damage;

            this.addBeam(dPos.x + 8, dPos.y + 4, target.x, ty, isMissile ? '#ffaa00' : '#ff3300', isMissile ? 4.5 : 2.8, 0.26);
            target.hp -= dmg;
            target.flashTime = 0.14;
            combat.battleStats.damageDealt += dmg;

            if (isMissile) {
                if (!target.isBurnImmune && target.type !== 'firefighter') {
                    target.burnTimer = Math.max(target.burnTimer || 0, 3.0);
                    target.burnDps = Math.max(target.burnDps || 0, stats.burnDps);
                }
                combat.fx.spawnBurst(target.x, ty, '#ff5500', 12, 75, 2.8, 0.35);
                combat.fx.shockwaves.push({ x: target.x, y: ty, radius: 5, maxRadius: 55, color: '#ff5500', lineWidth: 3, alpha: 1.0 });
                combat.addFloatingText(_trD('droneFxPyroMissile', `🚀 MÍSSIL PYRO! -${dmg} 🔥`, { dmg }), target.x, ty - 28, '#ffaa00', true);
                for (const other of combat.entities.zombies) {
                    if (other.active && other !== target && Math.abs(other.x - target.x) < 75 && (!combat.isPvPMode || other.side === 'player')) {
                        const splash = Math.round(dmg * 0.6);
                        other.hp -= splash;
                        other.flashTime = 0.12;
                        combat.battleStats.damageDealt += splash;
                        if (other.hp <= 0 && other.active) {
                            other.active = false;
                            combat.onZombieKilled(other, 140, _trD('droneKillToast', '+DRONE KILL! 🛸'), '#ff5500');
                        }
                    }
                }
            } else {
                combat.fx.spawnBurst(target.x, ty, '#ff3300', 5, 45, 2.0, 0.22);
                combat.addFloatingText(`🛸 -${dmg}`, target.x, ty - 20, '#ff7733', false);
            }

            if (target.hp <= 0 && target.active) {
                target.active = false;
                combat.onZombieKilled(target, 140, _trD('droneKillToast', '+DRONE KILL! 🛸'), '#ff5500');
            }
            return;
        }

        if (drone.type === 'support') {
            this.addBeam(dPos.x, dPos.y + 8, heroPos.x + 4, heroPos.y - 24, '#00ff88', 3.5, 0.32);
            combat.fx.spawnBurst(heroPos.x + 4, heroPos.y - 24, '#00ff88', 8, 50, 2.2, 0.35);
            combat.fx.shockwaves.push({ x: heroPos.x + 4, y: heroPos.y - 20, radius: 4, maxRadius: 42, color: '#00ff88', lineWidth: 2.5, alpha: 0.95 });

            // 1. Heal Guitarist
            if (combat.heroHp < combat.heroMaxHp) {
                combat.heroHp = Math.min(combat.heroMaxHp, combat.heroHp + stats.healAmount);
            }
            // 2. Restore Rock Mana & Special Charge
            combat.rockMana = Math.min(combat.maxRockMana, combat.rockMana + stats.manaGrant);
            if (window.specialSystem && !window.specialSystem.specialUsed && !window.specialSystem.isSpecialActive) {
                window.specialSystem.specialMeter = Math.min(100, window.specialSystem.specialMeter + 4.0);
                window.specialSystem.updateUI();
            }
            // 3. Apply Attack Speed Overdrive Buff
            combat.heroAttackSpeedBuffTimer = Math.max(combat.heroAttackSpeedBuffTimer || 0, 2.6);
            combat.heroAttackSpeedBuffMult = Math.max(combat.heroAttackSpeedBuffMult || 1.0, 1 + stats.atkSpeedBuffPct / 100);

            if (this.actionCount % 3 === 0) {
                combat.heroShieldHp = Math.min(120, (combat.heroShieldHp || 0) + stats.shieldAmount);
                combat.heroShieldTimer = Math.max(combat.heroShieldTimer || 0, 6.0);
                combat.addFloatingText(_trD('droneFxSupportShield', `🛸 +${stats.healAmount} HP 🛡️ +${stats.shieldAmount} ESCUDO!`, { hp: stats.healAmount, shd: stats.shieldAmount }), heroPos.x + 10, heroPos.y - 54, '#ffd700', true);
            } else {
                combat.addFloatingText(_trD('droneFxSupportPulse', `🛸 +${stats.healAmount} HP 💚 +${stats.manaGrant} MP ⚡`, { hp: stats.healAmount, mp: stats.manaGrant }), heroPos.x + 10, heroPos.y - 52, '#00ff88', false);
            }
            return;
        }

        // Controller Drone: Cycles 5 tactical CC & DoT effects
        const target = this.findClosestZombie(combat, 'player', heroPos.x);
        if (!target) return;
        const ty = target.y + (target.jumpArcY || 0) - 18;
        const mode = this.ccCycleIndex % 5;
        this.ccCycleIndex++;

        const colors = ['#00e5ff', '#ffff00', '#d488ff', '#39ff14', '#b336ff'];
        const beamCol = colors[mode];
        this.addBeam(dPos.x + 6, dPos.y + 4, target.x, ty, beamCol, 3.6, 0.30);
        combat.fx.spawnBurst(target.x, ty, beamCol, 10, 65, 2.4, 0.32);
        combat.fx.shockwaves.push({ x: target.x, y: ty, radius: 5, maxRadius: 58, color: beamCol, lineWidth: 2.5, alpha: 1.0 });

        for (const z of combat.entities.zombies) {
            if (!z.active || Math.abs(z.x - target.x) > 85 || (combat.isPvPMode && z.side !== 'player')) continue;
            z.hp -= stats.ccDamage;
            z.flashTime = 0.14;
            combat.battleStats.damageDealt += stats.ccDamage;

            if (mode === 0) {
                // Cryo-Freeze & Slow
                if (typeof z.applySlow === 'function') z.applySlow(1 - stats.slowPct / 100, 3.5);
                z.freezeTimer = 3.5;
            } else if (mode === 1) {
                // Tesla Stun
                if (typeof z.applyStun === 'function') z.applyStun(stats.stunDuration);
            } else if (mode === 2) {
                // Hypnotic Sleep
                z.sleepTimer = stats.sleepDuration;
                if (typeof z.applyStun === 'function') z.applyStun(stats.sleepDuration);
            } else if (mode === 3) {
                // Neuro-Venom DoT
                z.poisonTimer = 3.5;
                z.poisonDps = stats.poisonDps;
            } else {
                // Gravity Vortex Pushback
                z.x = Math.min(combat.canvas.width - 18, z.x + stats.knockbackPx);
                if (typeof z.applySlow === 'function') z.applySlow(0.65, 2.0);
            }

            if (z.hp <= 0 && z.active) {
                z.active = false;
                combat.onZombieKilled(z, 135, _trD('droneKillToast', '+DRONE KILL! 🛸'), beamCol);
            }
        }

        const callouts = [
            _trD('droneFxCryo', `❄️ CONGELADO! (-${stats.slowPct}% VEL)`, { pct: stats.slowPct }),
            _trD('droneFxStun', `⚡ STUN TESLA! (${stats.stunDuration}s)`, { sec: stats.stunDuration }),
            _trD('droneFxSleep', `💤 SONO HIPNÓTICO! (${stats.sleepDuration}s)`, { sec: stats.sleepDuration }),
            _trD('droneFxPoison', `🧪 VENENO NEURAL! (${stats.poisonDps}/s)`, { dps: stats.poisonDps }),
            _trD('droneFxVortex', `💨 VÓRTICE! (+${stats.knockbackPx}px)`, { px: stats.knockbackPx })
        ];
        combat.addFloatingText(callouts[mode], target.x, ty - 28, beamCol, true);
    }

    updateOpponentDrone(dt, combat, pvp) {
        const opp = pvp.opponent;
        if (!opp || !opp.drone) return;
        const stats = this.getDroneStats(opp.drone.id, opp.droneLevel || opp.level || 1);
        this.oppActionTimer += dt;
        if (this.oppActionTimer < stats.cooldown) return;
        this.oppActionTimer = 0;
        this.oppActionCount++;

        const dPos = this.getOpponentDronePosition(combat, pvp);
        const oppPos = pvp.getOpponentPosition(combat);

        if (opp.drone.type === 'offensive') {
            const target = this.findClosestZombie(combat, 'opponent', oppPos.x);
            if (!target) return;
            const ty = target.y + (target.jumpArcY || 0) - 18;
            const dmg = (this.oppActionCount % 4 === 0) ? stats.missileDamage : stats.damage;
            this.addBeam(dPos.x - 8, dPos.y + 4, target.x, ty, '#ff4422', 2.8, 0.25);
            target.hp -= dmg;
            target.flashTime = 0.14;
            combat.addFloatingText(`🛸 -${dmg}`, target.x, ty - 20, '#ff5533', false);
            if (target.hp <= 0 && target.active) {
                target.active = false;
                pvp.opponentZombiesKilled++;
                opp.score += 140;
            }
        } else if (opp.drone.type === 'support') {
            this.addBeam(dPos.x, dPos.y + 8, oppPos.x - 4, oppPos.y - 24, '#00ff88', 3.0, 0.28);
            opp.hp = Math.min(opp.maxHp || 100, opp.hp + Math.max(3, Math.round(stats.healAmount * 0.55)));
            combat.addFloatingText(`🛸 +${Math.max(3, Math.round(stats.healAmount * 0.55))} HP 💚`, oppPos.x - 10, oppPos.y - 52, '#00ff88', false);
        } else {
            const target = this.findClosestZombie(combat, 'opponent', oppPos.x);
            if (!target) return;
            const ty = target.y + (target.jumpArcY || 0) - 18;
            this.addBeam(dPos.x - 6, dPos.y + 4, target.x, ty, '#00e5ff', 3.0, 0.26);
            target.hp -= stats.ccDamage;
            target.x = Math.max(combat.canvas.width * 0.50, target.x - 18);
            if (typeof target.applyStun === 'function') target.applyStun(0.8);
            if (target.hp <= 0 && target.active) {
                target.active = false;
                pvp.opponentZombiesKilled++;
                opp.score += 135;
            }
        }
    }

    draw(ctx, combat) {
        if (!ctx || !combat) return;

        // 1. Draw Active Laser / Harmonic / Cryo Beams
        for (const b of this.activeBeams) {
            const alpha = Math.max(0, b.life / b.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = b.color;
            ctx.lineWidth = b.width;
            ctx.beginPath();
            ctx.moveTo(b.x1, b.y1);
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, b.width * 0.4);
            ctx.beginPath();
            ctx.moveTo(b.x1, b.y1);
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();
            ctx.restore();
        }

        // 2. Draw Player Drone Floating Above Head
        const drone = this.getActiveDrone();
        const lvl = this.getDroneLevelData(drone.id).level;
        const pPos = this.getPlayerDronePosition(combat);
        this.drawDroneUnit(ctx, combat, drone, lvl, pPos.x, pPos.y, false);

        // 3. Draw PvP Opponent Drone Floating Above Opponent's Head
        if (combat.isPvPMode && combat.pvpSystem && combat.pvpSystem.opponent && combat.pvpSystem.opponent.drone) {
            const opp = combat.pvpSystem.opponent;
            const oPos = this.getOpponentDronePosition(combat, combat.pvpSystem);
            this.drawDroneUnit(ctx, combat, opp.drone, opp.droneLevel || opp.level || 1, oPos.x, oPos.y, true);
        }

        // 4. Draw Sleep / Freeze / Poison Status Icons Above Affected Zombies
        for (const z of combat.entities.zombies) {
            if (!z.active) continue;
            const zy = z.y + (z.jumpArcY || 0);
            if (z.sleepTimer > 0 || z.freezeTimer > 0 || z.poisonTimer > 0) {
                ctx.save();
                ctx.font = "bold 10px 'Segoe UI Emoji', sans-serif";
                ctx.textAlign = 'center';
                const icons = `${z.sleepTimer > 0 ? '💤' : ''}${z.freezeTimer > 0 ? '❄️' : ''}${z.poisonTimer > 0 ? '🧪' : ''}`;
                ctx.fillText(icons, z.x, zy - 44);
                ctx.restore();
            }
        }
    }

    drawDroneUnit(ctx, combat, drone, level, x, y, flip = false) {
        const t = (combat.time || 0) / 1000;
        const pulse = 0.85 + Math.sin(t * 6) * 0.15;
        const sheet = combat.assets ? combat.assets[drone.sheet] : null;
        const frame = Math.floor((combat.time || 0) / 90) % 12;

        ctx.save();
        // Subtle glowing hover aura ring under drone
        ctx.strokeStyle = drone.color || '#00e5ff';
        ctx.globalAlpha = 0.55 * pulse;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, y + 11, 13 * pulse, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        if (sheet && sheet.ready) {
            sheet.drawFrame(ctx, frame, x, y, 0.17, flip, false, 1.0);
        } else {
            // Immediate crisp procedural vector fallback while sprite sheet loads
            ctx.fillStyle = drone.color || '#00e5ff';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = drone.accentColor || '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + (flip ? -3 : 3), y - 1, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Compact floating level tag above drone (no HP bar since drones are invulnerable!)
        ctx.font = "bold 7.5px 'Segoe UI', sans-serif";
        ctx.textAlign = 'center';
        const tag = `🛸 ${_trD('levelShort', 'Nv.')}${level}`;
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(tag, x, y - 14);
        ctx.fillStyle = drone.accentColor || '#ffd700';
        ctx.fillText(tag, x, y - 14);
        ctx.restore();
    }

    // ==========================================
    // PRE-BATTLE PVE, PVP & SHOP UI RENDERERS
    // ==========================================
    renderPreBattleDroneCard() {
        if (typeof document === 'undefined') return;
        const drone = this.getActiveDrone();
        if (!drone) return;
        const lvlData = this.getDroneLevelData(drone.id);
        const reqXp = this.getXpRequiredForNextLevel(lvlData.level);
        const goldCost = this.getGoldCostForLevelUp(lvlData.level);
        const el = (id) => document.getElementById(id);

        const dName = _trD(`drone_${drone.id}_name`, drone.name);
        const dType = _trD(drone.badgeKey, drone.badge);
        const dSkill = _trD(`drone_${drone.id}_skill_name`, drone.skillName);
        const dSkillDesc = _trD(`drone_${drone.id}_skill_desc`, drone.skillDesc);
        const summary = this.getDroneSummaryLine(drone.id);

        const imgEl = el('showcase-drone-img'), badgeEl = el('showcase-drone-type-badge');
        const nameEl = el('showcase-drone-name'), statsEl = el('showcase-drone-stats-text');
        const skillNameEl = el('showcase-drone-skill-name'), skillDescEl = el('showcase-drone-skill-desc');
        const lvlBadge = el('showcase-drone-level-badge'), xpText = el('showcase-drone-xp-text'), xpFill = el('showcase-drone-xp-fill');
        const invXpEl = el('showcase-drone-inv-xp'), injectBtn = el('drone-inject-xp-btn'), lvlUpBtn = el('drone-level-up-btn');

        if (imgEl) imgEl.src = drone.icon;
        if (badgeEl) {
            badgeEl.innerText = dType.toUpperCase();
            badgeEl.className = `hero-rarity-badge ${drone.badgeClass || 'badge-common'}`;
        }
        if (nameEl) nameEl.innerText = `${dName} (${_trD('levelShort', 'Nv.')} ${lvlData.level})`;
        if (statsEl) statsEl.innerText = summary;
        if (skillNameEl) skillNameEl.innerText = dSkill;
        if (skillDescEl) skillDescEl.innerText = dSkillDesc;

        const playerXp = (window.guitaristPool && typeof window.guitaristPool.getPlayerXp === 'function') ? window.guitaristPool.getPlayerXp() : 0;
        if (invXpEl) invXpEl.innerText = playerXp.toLocaleString();
        if (lvlBadge) lvlBadge.innerText = _trD('heroLevelBadge', `⭐ NÍVEL ${lvlData.level} / 100`, { lvl: lvlData.level });
        if (xpText) xpText.innerText = lvlData.level >= 100 ? _trD('heroMaxXp', 'MÁXIMO') : `XP: ${lvlData.xp} / ${reqXp}`;
        if (xpFill) xpFill.style.width = `${lvlData.level >= 100 ? 100 : Math.min(100, Math.round((lvlData.xp / reqXp) * 100))}%`;

        if (lvlUpBtn) {
            lvlUpBtn.disabled = (lvlData.level >= 100);
            lvlUpBtn.innerText = lvlData.level >= 100
                ? _trD('heroMaxLevel', '⭐ NÍVEL MÁXIMO (100)')
                : _trD('heroLevelUp', `⬆️ SUBIR NÍVEL (🪙 ${goldCost})`, { cost: goldCost });
            lvlUpBtn.onclick = () => {
                if (lvlData.level >= 100) return;
                const res = this.levelUpWithGold(drone.id);
                if (res.success) {
                    if (window.soundEngine) window.soundEngine.playPowerChord();
                    this.renderPreBattleDroneCard();
                    this.renderShopDrones();
                    if (window.game) window.game.updateMenuCurrencies();
                } else alert(res.reason || _trD('insufficientGold', 'Ouro insuficiente!'));
            };
        }

        if (injectBtn) {
            injectBtn.style.display = (lvlData.level >= 100) ? 'none' : 'inline-flex';
            const needed = Math.max(1, reqXp - lvlData.xp);
            if (playerXp <= 0) {
                injectBtn.disabled = true;
                injectBtn.innerText = _trD('noXpInInventory', '✨ SEM XP NO INVENTÁRIO');
            } else {
                injectBtn.disabled = false;
                const toInject = Math.min(needed, playerXp);
                injectBtn.innerText = (playerXp >= needed)
                    ? _trD('btnInjectLevelUp', '✨ INJETAR XP (+1 NÍVEL)')
                    : _trD('btnInjectXp', `✨ INJETAR XP (+${toInject.toLocaleString()} XP)`, { amount: toInject.toLocaleString() });
                injectBtn.onclick = () => {
                    const res = this.injectXpIntoDrone(drone.id);
                    if (res.success) {
                        if (window.soundEngine) window.soundEngine.playPowerChord();
                        this.renderPreBattleDroneCard();
                        this.renderShopDrones();
                        if (window.game) { window.game.renderHeroRoster(); window.game.updateMenuCurrencies(); }
                    } else alert(res.reason);
                };
            }
        }

        // Populate 3 Drones Roster Grid inside drawer
        const grid = el('map-drones-roster-grid');
        if (!grid) return;
        grid.innerHTML = '';
        this.drones.forEach(d => {
            const isSel = (d.id === drone.id);
            const dLvl = this.getDroneLevelData(d.id).level;
            const tBadge = _trD(d.badgeKey, d.badge);
            const tName = _trD(`drone_${d.id}_name`, d.name);
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `hero-roster-card ${isSel ? 'active' : ''}`;
            card.title = `${tName} (${tBadge} • ${_trD('levelShort', 'Nv.')} ${dLvl})`;
            card.innerHTML = `
                <div class="hero-roster-art" style="border-color: ${d.accentColor || '#00e5ff'}; pointer-events: none;">
                    <img src="${d.icon}" alt="${tName}" class="hero-roster-img" style="pointer-events: none;">
                </div>
                <div class="hero-roster-name" style="pointer-events: none;">${tName.split(' ')[0]}</div>
                <span class="hero-roster-mini-badge ${d.badgeClass || 'badge-common'}" style="pointer-events: none;">${tBadge} • ${_trD('levelShort', 'Nv.')}${dLvl}</span>
                ${isSel ? '<span class="hero-card-check">✓</span>' : ''}
            `;
            card.onclick = (e) => {
                if (e) e.preventDefault();
                this.setSelectedDrone(d.id);
                if (window.soundEngine) window.soundEngine.playGuitarChord(2);
                this.renderPreBattleDroneCard();
                this.populatePvPDroneDropdown();
                this.updatePvPDroneCardPreview();
            };
            grid.appendChild(card);
        });
    }

    populatePvPDroneDropdown() {
        if (typeof document === 'undefined') return;
        const dropdown = document.getElementById('pvp-drone-dropdown');
        if (!dropdown || typeof document.createElement !== 'function') return;
        const active = this.getActiveDrone();
        dropdown.innerHTML = '';
        this.drones.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            const lvl = this.getDroneLevelData(d.id).level;
            const tName = _trD(`drone_${d.id}_name`, d.name);
            const tType = _trD(d.badgeKey, d.badge);
            opt.innerText = `${tName} [${tType}] (${_trD('levelShort', 'Nv.')} ${lvl})`;
            if (active && d.id === active.id) opt.selected = true;
            dropdown.appendChild(opt);
        });
        dropdown.onchange = (e) => {
            this.setSelectedDrone(e.target.value);
            this.updatePvPDroneCardPreview();
            this.renderPreBattleDroneCard();
            if (window.soundEngine && typeof window.soundEngine.playGuitarChord === 'function') {
                window.soundEngine.playGuitarChord(1);
            }
        };
    }

    updatePvPDroneCardPreview(drone = null) {
        if (typeof document === 'undefined') return;
        if (!drone) drone = this.getActiveDrone();
        if (!drone) return;
        const lvl = this.getDroneLevelData(drone.id).level;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        const avatar = document.getElementById('pvp-drone-avatar');
        if (avatar) avatar.src = drone.icon;
        setVal('pvp-drone-name', _trD(`drone_${drone.id}_name`, drone.name));
        setVal('pvp-drone-level', `⭐ ${_trD('levelShort', 'Nv.')} ${lvl}`);
        setVal('pvp-drone-type', _trD(drone.badgeKey, drone.badge).toUpperCase());
        setVal('pvp-drone-stats', this.getDroneSummaryLine(drone.id, lvl));
        setVal('pvp-drone-skill', _trD(`drone_${drone.id}_skill_desc`, drone.skillDesc));
    }

    switchShopTab(tabName = 'heroes') {
        this.activeShopTab = tabName;
        if (typeof document === 'undefined') return;
        const hGrid = document.getElementById('shop-heroes-grid');
        const dGrid = document.getElementById('shop-drones-grid');
        const hTab = document.getElementById('shop-tab-heroes');
        const dTab = document.getElementById('shop-tab-drones');
        if (hGrid) hGrid.style.display = (tabName === 'heroes') ? 'grid' : 'none';
        if (dGrid) dGrid.style.display = (tabName === 'drones') ? 'grid' : 'none';
        if (hTab && hTab.classList) hTab.classList.toggle('active', tabName === 'heroes');
        if (dTab && dTab.classList) dTab.classList.toggle('active', tabName === 'drones');
        if (tabName === 'drones') this.renderShopDrones();
        else if (window.guitaristPool && typeof window.guitaristPool.renderShop === 'function') window.guitaristPool.renderShop();
    }

    renderShopDrones() {
        if (typeof document === 'undefined') return;
        const grid = document.getElementById('shop-drones-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const active = this.getActiveDrone();

        this.drones.forEach(d => {
            const isEquipped = (d.id === active.id);
            const lvlData = this.getDroneLevelData(d.id);
            const goldCost = this.getGoldCostForLevelUp(lvlData.level);
            const dName = _trD(`drone_${d.id}_name`, d.name);
            const dTitle = _trD(`drone_${d.id}_title`, d.title);
            const dType = _trD(d.badgeKey, d.badge);
            const dSkillName = _trD(`drone_${d.id}_skill_name`, d.skillName);
            const dSkillDesc = _trD(`drone_${d.id}_skill_desc`, d.skillDesc);
            const summary = this.getDroneSummaryLine(d.id, lvlData.level);

            const card = document.createElement('div');
            card.className = `shop-hero-card ${isEquipped ? 'active' : ''} unlocked`;
            card.innerHTML = `
                <div class="shop-hero-card-top">
                    <div class="shop-hero-thumb-wrap" style="border-color: ${d.accentColor || '#00e5ff'};">
                        <img src="${d.icon}" alt="${dName}" class="shop-hero-thumb">
                        <span class="hero-rarity-badge ${d.badgeClass || 'badge-common'}">${dType}</span>
                    </div>
                    <div class="shop-hero-meta">
                        <h4 class="shop-hero-name">${dName}</h4>
                        <span class="shop-hero-title">${dTitle}</span>
                        <div class="shop-hero-inst">${summary}</div>
                        <div class="shop-hero-special-chip">🛡️ ${_trD('droneInvulnerableTag', 'Invulnerável (Não sofre dano)')}</div>
                    </div>
                </div>
                <div class="shop-hero-passive">
                    <strong>🛸 ${dSkillName}</strong>
                    <p>${dSkillDesc}</p>
                </div>
                <div class="shop-hero-footer" style="flex-wrap: wrap; gap: 6px;">
                    <div class="shop-hero-level-info">⭐ ${_trD('levelShort', 'Nv.')} ${lvlData.level}/100</div>
                    <div class="shop-hero-action" style="display: flex; gap: 5px;">
                        ${lvlData.level < 100 ? `<button type="button" class="shop-hero-btn buy drone-lvl-btn" style="padding: 5px 8px; font-size: 9.5px;">⬆️ +1 ${_trD('levelShort', 'Nv.')} (🪙 ${goldCost})</button>` : ''}
                        ${isEquipped
                            ? `<button type="button" class="shop-hero-btn active" disabled>🛸 ${_trD('shopEquipped', 'EQUIPADO')}</button>`
                            : `<button type="button" class="shop-hero-btn equip">✓ ${_trD('shopEquip', 'EQUIPAR')}</button>`
                        }
                    </div>
                </div>
            `;

            const equipBtn = card.querySelector('.shop-hero-btn.equip');
            if (equipBtn) {
                equipBtn.onclick = () => {
                    this.setSelectedDrone(d.id);
                    if (window.soundEngine) window.soundEngine.playGuitarChord(2);
                    this.renderShopDrones();
                    this.renderPreBattleDroneCard();
                    this.populatePvPDroneDropdown();
                    this.updatePvPDroneCardPreview();
                };
            }

            const lvlBtn = card.querySelector('.drone-lvl-btn');
            if (lvlBtn) {
                lvlBtn.onclick = () => {
                    const res = this.levelUpWithGold(d.id);
                    if (res.success) {
                        if (window.soundEngine) window.soundEngine.playPowerChord();
                        this.renderShopDrones();
                        this.renderPreBattleDroneCard();
                        if (window.game) {
                            window.game.updateShopCurrencies();
                            window.game.updateMenuCurrencies();
                        }
                    } else alert(res.reason || _trD('insufficientGold', 'Ouro insuficiente!'));
                };
            }

            grid.appendChild(card);
        });
    }
}

if (typeof window !== 'undefined') {
    window.DroneSystem = DroneSystem;
    window.droneSystem = new DroneSystem();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DroneSystem;
}
