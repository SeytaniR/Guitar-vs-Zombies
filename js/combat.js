// AAA Combat System Coordinator for Guitar vs Zombies
// Orchestrates combat arena, hero states, projectile physics, wave progression, and delegates VFX/Entities.

class CombatSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Modular VFX Subsystem
        const FXClass = window.CombatFX || CombatFX;
        this.fx = new FXClass();

        // Asset Loader
        const SheetClass = window.SpriteSheet || SpriteSheet;
        const loadImg = src => { const img = new Image(); img.src = src; return img; };
        const loadSheet = (src, cols = 4, rows = 3) => new SheetClass(loadImg(src), cols, rows);
        this.assets = {
            map_void: loadImg('assets/maps/map_void.jpg'),
            map_ruins: loadImg('assets/maps/map_ruins.jpg'),
            map_wasteland: loadImg('assets/maps/map_wasteland.jpg'),
            get bg() {
                const mapId = (window.stageSystem && typeof window.stageSystem.getSelectedMap === 'function')
                    ? window.stageSystem.getSelectedMap().id
                    : 'map_void';
                return this[mapId] || this.map_void;
            },
            heroSheet: loadSheet('assets/hero2.jpg'),
            heroVulkanSheet: loadSheet('assets/hero_vulkan.jpg'),
            heroHazmatSheet: loadSheet('assets/hero_hazmat.jpg'),
            heroCyborgSheet: loadSheet('assets/hero_cyborg.jpg'),
            heroGladiatorSheet: loadSheet('assets/hero_gladiator.jpg', 4, 4),
            heroAnarchySheet: loadSheet('assets/hero_anarchy.jpg'),
            zombieSheet: loadSheet('assets/zombie2.jpg'),
            mutantSheet: loadSheet('assets/zombie_mutant.jpg'),
            leaperSheet: loadSheet('assets/zombie_leaper.jpg'),
            soldierSheet: loadSheet('assets/zombie_soldier.jpg'),
            sporeSheet: loadSheet('assets/zombie_spore.jpg'),
            bloaterSheet: loadSheet('assets/zombie_bloater.jpg'),
            gladiatorSheet: loadSheet('assets/zombie_gladiator.jpg'),
            hazmatSheet: loadSheet('assets/zombie_hazmat.jpg'),
            fxSheet: loadSheet('assets/fx2.jpg')
        };

        // Core Combat Entities with backwards-compatible accessors to FX
        const fxRef = this.fx;
        this.entities = {
            zombies: [],
            projectiles: [],
            get particles() { return fxRef.particles; },
            get explosions() { return fxRef.explosions; },
            get shockwaves() { return fxRef.shockwaves; },
            get floatingTexts() { return fxRef.floatingTexts; },
            get acidPuddles() { return fxRef.acidPuddles; },
            get ambientEmbers() { return fxRef.ambientEmbers; }
        };

        this.time = 0; this.heroStrumAnim = 0.8; this.heroFlashTime = 0;
        this.heroHp = 100; this.heroMaxHp = 100; this.isGameOver = false; this.combo = 0;

        // Rock Mana & Attack Speed System (replaces old rock power)
        this.rockMana = 30; this.maxRockMana = 100; this.rockManaRegen = 2.0;
        this.baseAttackSpeed = 1.0; this.heroAttackTimer = 0;
        this.heroAttackSpeedBuffTimer = 0; this.heroAttackSpeedBuffMult = 1.0;
        this.heroShieldHp = 0; this.heroShieldTimer = 0;
        this.perfectStreak = 0; this.guaranteedCritReady = false;
        this.pendingAttackModifiers = []; this.stageCompleted = false;

        this.zombiesKilled = 0; this.score = 0; this.spawnTimer = 0;
        this.shockBarrierTimer = 15; this.shockBarrierReady = false; this.heroImmunityTimer = 0;
        this.matchActive = false; this.activeEnemyTypes = [];
        this.battleStats = {
            damageDealt: 0,
            zombiesKilled: 0,
            coinsEarned: 0,
            hitsReceived: 0,
            matchStartTime: performance.now()
        };

        this.fx.initEmbers(25, 800, 600);

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('pointerdown', () => { if (this.isGameOver) this.reviveHero(); });
    }

    // Rock Power backward compatibility property mapping to Rock Mana
    get rockPower() { return (this.rockMana / this.maxRockMana) * 100; }
    set rockPower(v) { this.rockMana = Math.max(0, Math.min(this.maxRockMana, (v / 100) * this.maxRockMana)); }

    // Proxy FX helper methods for backwards compatibility
    get shakePower() { return this.fx.shakePower; }
    set shakePower(v) { this.fx.shakePower = v; }
    triggerShake(amount = 6) { this.fx.triggerShake(amount); }
    addFloatingText(text, x, y, color = '#ffff00', isCrit = false) { this.fx.addFloatingText(text, x, y, color, isCrit); }
    createExplosion(x, y, isCrit = false) { this.fx.createExplosion(x, y, isCrit, window.soundEngine); }

    resize() {
        const parent = this.canvas.parentElement;
        const w = (parent && parent.clientWidth) || window.innerWidth || 360;
        const h = (parent && parent.clientHeight) || Math.round(window.innerHeight * 0.5) || 300;
        if (w > 0 && h > 0) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    }

    getActiveHeroData() {
        if (window.guitaristPool && typeof window.guitaristPool.getSelectedGuitarist === 'function') {
            return window.guitaristPool.getSelectedGuitarist();
        }
        return null;
    }

    getActiveHeroStats() {
        const heroData = this.getActiveHeroData();
        if (heroData && window.guitaristPool && typeof window.guitaristPool.getHeroStats === 'function') {
            return window.guitaristPool.getHeroStats(heroData.id);
        }
        return {
            level: 1, baseAttackSpeed: 1.0, damageMult: 1.0, critDamageBonusPercent: 50.0, manaRegenRate: 1.0,
            goldBonus: 0, armorPen: 0, slowHorde: 0, burnChance: 0, knockbackBonus: 0,
            chainLightning: false, chainTargets: 0
        };
    }

    getHeroAttackSpeed() {
        const heroStats = this.getActiveHeroStats();
        let spd = (heroStats && heroStats.baseAttackSpeed) ? heroStats.baseAttackSpeed : (this.baseAttackSpeed || 1.0);
        if (this.heroAttackSpeedBuffTimer > 0) spd *= (this.heroAttackSpeedBuffMult || 1.4);
        if (window.talentSystem) spd += window.talentSystem.getStat('speed_shred') * 0.04;
        const comboBonus = Math.min(2.0, Math.max(0, (this.combo || 0) * 0.01));
        return spd + comboBonus;
    }

    getActiveHeroSheet() {
        const heroData = this.getActiveHeroData();
        if (heroData && this.assets && this.assets[heroData.sheet]) {
            return this.assets[heroData.sheet];
        }
        return this.assets.heroSheet;
    }

    getRoadMetrics() {
        const cw = Math.max(100, this.canvas.width || 360);
        const ch = Math.max(100, this.canvas.height || 300);
        const bg = this.assets.bg;

        if (!bg.complete || bg.naturalWidth === 0) {
            return { drawX: 0, drawY: 0, drawW: cw, drawH: ch, laneY: ch * 0.78 };
        }

        const aspect = bg.naturalHeight / bg.naturalWidth; // 571 / 1024 = ~0.5576
        let drawH = ch * 1.05;
        let drawW = drawH / aspect;
        if (drawW < cw * 1.25) {
            drawW = cw * 1.25;
            drawH = drawW * aspect;
        }

        const drawX = -Math.round((drawW - cw) * 0.2);
        const drawY = ch - drawH;
        const laneY = drawY + drawH * 0.77;

        return { drawX, drawY, drawW, drawH, laneY };
    }

    getHeroPosition() {
        const metrics = this.getRoadMetrics();
        const heroX = Math.max(50, Math.round(this.canvas.width * 0.16));
        const heroY = Math.round(metrics.laneY);
        return { x: heroX, y: heroY };
    }

    resetBattle(enemyList = null) {
        this.entities.zombies = [];
        this.entities.projectiles = [];
        this.fx.reset();
        this.heroHp = this.heroMaxHp;
        this.isGameOver = false; this.isPaused = false; this.isVictory = false;
        this.rockMana = 30; this.combo = 0; this.comboKills = 0; this.score = 0;
        this.zombiesKilled = 0; this.spawnTimer = 0; this.pendingAttackModifiers = [];
        this.stageCompleted = false; this.heroAttackTimer = 0; this.heroShieldHp = 0; this.heroShieldTimer = 0;
        this.perfectStreak = 0; this.guaranteedCritReady = false;
        const activeMap = (window.stageSystem && window.stageSystem.getSelectedMap) ? window.stageSystem.getSelectedMap().id : 'map_void';
        if (this.fx && typeof this.fx.initEmbers === 'function') {
            this.fx.initEmbers(25, this.canvas.width || 800, this.canvas.height || 600, activeMap);
        }

        this.activeEnemyTypes = (enemyList && enemyList.length > 0)
            ? enemyList
            : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);

        this.battleStats = { damageDealt: 0, zombiesKilled: 0, coinsEarned: 0, hitsReceived: 0, matchStartTime: performance.now() };
        this.matchActive = true;
        const cw = Math.max(200, this.canvas ? this.canvas.width : 360);
        this.spawnZombie(cw * 0.78);
        this.spawnZombie(cw * 0.92);
    }

    spawnZombie(initialX = null) {
        if (this.isGameOver || !this.matchActive) return;
        const metrics = this.getRoadMetrics();

        const pool = (this.activeEnemyTypes && this.activeEnemyTypes.length > 0)
            ? this.activeEnemyTypes
            : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);

        const enemyDef = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : { type: 'normal', scale: 0.50, speed: 38, hp: 80, attackInterval: 1.1, attackDamage: 7, name: 'Zumbi Punk' };

        const stage = window.stageSystem ? window.stageSystem.selectedStage : 1;
        const range = window.stageSystem ? window.stageSystem.getZombieLevelRange(stage) : { min: 1, max: 2 };
        const zombieLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

        const ZombieClass = window.ZombieEntity || ZombieEntity;
        const zombie = new ZombieClass(enemyDef, metrics.laneY, this.canvas.width, zombieLevel, initialX);
        this.entities.zombies.push(zombie);
    }

    registerWrongTap(laneIndex = 0) {
        if (this.isGameOver || !this.matchActive) return;
        this.combo = 0;
        this.comboKills = 0;
        this.perfectStreak = 0;
        const heroPos = this.getHeroPosition();
        this.addFloatingText('ERROU! 💨', heroPos.x + 20, heroPos.y - 45, '#ff4444', false);
        this.pendingAttackModifiers.push({ mult: 0, isCrit: false, isMiss: true, skill: null, lane: laneIndex });
        this.heroAttackTimer = 0;
        this.performHeroAutoAttack();
    }

    registerRhythmNote(rating, laneIndex = 0) {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();

        if (rating === 'miss') {
            this.pendingAttackModifiers.push({ mult: 0.5, isCrit: false, skill: null, isMiss: false });
            this.addFloatingText('MISS (-50%)', heroPos.x, heroPos.y - 45, '#ff3333', false);
            this.combo = 0;
            this.comboKills = 0;
            this.perfectStreak = 0;
            return;
        }

        // Mana Award based on note precision
        let manaAward = 2.0;
        let ratingMult = 1.0;
        let isCrit = false;

        // Natural Critical Rule: 5 consecutive perfect notes guarantee crit on next shot
        if (this.guaranteedCritReady) {
            isCrit = true;
            this.guaranteedCritReady = false;
        }

        if (rating === 'perfect') {
            manaAward = 4.5;
            ratingMult = 1.4;
            this.perfectStreak = (this.perfectStreak || 0) + 1;
            if (this.perfectStreak >= 5) {
                this.guaranteedCritReady = true;
                this.perfectStreak = 0;
                this.addFloatingText('🎯 5x PERFECT! PRÓXIMO CRÍTICO!', heroPos.x, heroPos.y - 50, '#ff00ff', true);
            } else {
                this.addFloatingText(`🎯 PERFECT! (${this.perfectStreak}/5)`, heroPos.x, heroPos.y - 45, '#ffcc00', false);
            }
        } else {
            this.perfectStreak = 0;
            if (rating === 'great') {
                manaAward = 3.2;
                ratingMult = 1.2;
            } else {
                manaAward = 2.0;
                ratingMult = 1.0;
            }
        }

        // Hyper Overdrive talent bonus
        const overdriveBonus = window.talentSystem ? window.talentSystem.getStat('hyper_overdrive') : 0;
        manaAward *= (1.0 + overdriveBonus);

        this.rockMana = Math.min(this.maxRockMana, this.rockMana + manaAward);
        if (rating === 'perfect' || rating === 'great') {
            this.addFloatingText(`+${Math.round(manaAward)} MP ⚡`, heroPos.x - 10, heroPos.y - 32, '#00e5ff', false);
        }

        // Retrieve equipped skill for this rhythm lane
        const skill = window.skillSystem ? window.skillSystem.getEquippedSkill(laneIndex) : null;
        let skillToApply = skill;
        let manaPenalty = 1.0;

        if (skill && skill.manaCost > 0) {
            if (this.rockMana >= skill.manaCost) {
                this.rockMana -= skill.manaCost;
                this.addFloatingText(`${skill.icon} ${skill.name} (-${skill.manaCost} MP)`, heroPos.x + 20, heroPos.y - 50, skill.color || '#ff00ff', true);
            } else {
                // Insufficient Mana: note becomes a common basic attack (no skill applied, normal basic damage, 0 MP spent)
                skillToApply = null;
                manaPenalty = 1.0;
                this.addFloatingText('⚡ SEM MP! (BÁSICO)', heroPos.x, heroPos.y - 45, '#00d4ff', false);
            }
        }

        this.pendingAttackModifiers.push({
            mult: ratingMult * manaPenalty,
            isCrit: isCrit,
            skill: skillToApply,
            lane: laneIndex
        });

        this.heroStrumAnim = 0.8;
    }

    performHeroAutoAttack() {
        if (this.isGameOver || !this.matchActive) return;
        const heroPos = this.getHeroPosition();
        this.heroStrumAnim = 0.8;

        let target = null;
        let minX = Infinity;
        for (const z of this.entities.zombies) {
            if (z.active && z.x <= this.canvas.width - 5 && z.x > heroPos.x - 10 && z.x < minX) {
                minX = z.x;
                target = z;
            }
        }

        const startX = heroPos.x + 22, startY = heroPos.y - 18;
        const mod = this.pendingAttackModifiers.length > 0
            ? this.pendingAttackModifiers.shift()
            : { mult: 1.0, isCrit: false, skill: null, lane: 0 };

        const isMiss = !!mod.isMiss;
        let targetX = target ? target.x : this.canvas.width;
        let targetY = target ? (target.y + (target.jumpArcY || 0) - 18) : heroPos.y - 18;
        if (isMiss) {
            target = null;
            targetX = this.canvas.width + 40;
            targetY += (Math.random() > 0.5 ? 65 : -65);
        }
        const angle = Math.atan2(targetY - startY, targetX - startX);

        const activeHero = this.getActiveHeroData();
        const heroStats = this.getActiveHeroStats();
        const talentBaseBonus = window.talentSystem ? window.talentSystem.getStat('power_chord') : 0;
        const baseDmg = (45 + talentBaseBonus) * (heroStats.damageMult || 1.0) * (mod.mult || 1.0);
        let calcDamage = isMiss ? 0 : Math.round(baseDmg);
        let isCrit = !isMiss && (mod.isCrit || this.guaranteedCritReady);
        if (!isMiss && this.guaranteedCritReady) { this.guaranteedCritReady = false; }

        if (isCrit) {
            const critBonusPercent = (heroStats.critDamageBonusPercent || 50) + (window.talentSystem ? window.talentSystem.getStat('ferocious_solo') * 6 : 0);
            calcDamage = Math.round(baseDmg * (1 + critBonusPercent / 100));
        }
        if (!isMiss) calcDamage = Math.max(1, calcDamage);

        let projColor = isMiss ? '#777777' : (isCrit ? '#ff00ff' : '#00ffff');
        if (!isMiss && mod.skill && mod.skill.color) projColor = mod.skill.color;
        else if (!isMiss && activeHero && activeHero.projectileColor) projColor = activeHero.projectileColor;

        const projSpeed = isMiss ? 380 : 440;
        this.entities.projectiles.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * projSpeed, vy: Math.sin(angle) * projSpeed,
            target: target, isCrit: isCrit, isMiss: isMiss,
            damage: calcDamage, skill: isMiss ? null : mod.skill,
            frame: 3 + Math.floor(Math.random() * 4), trailTimer: 0,
            active: true, heroId: activeHero ? activeHero.id : null,
            projColor: projColor,
            isSkillShot: !isMiss && !!mod.skill && mod.skill.manaCost > 0
        });

        // Muzzle sonic shockwave
        this.fx.shockwaves.push({
            x: startX,
            y: startY,
            radius: 4,
            maxRadius: 24,
            color: projColor,
            lineWidth: 2.5,
            alpha: 1.0
        });

        if (window.soundEngine) {
            window.soundEngine.playGuitarChord(mod.lane || 0);
        }
    }

    launchAttack(isCrit = false, chordIndex = 0) {
        if (this.isGameOver) return;
        this.registerRhythmNote(isCrit ? 'perfect' : 'great', chordIndex);
        this.performHeroAutoAttack();
    }

    launchSustainTick(lane = 0) {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();
        this.heroStrumAnim = 0.5;

        let target = null;
        let minX = Infinity;
        for (const z of this.entities.zombies) {
            if (z.active && z.x <= this.canvas.width - 5 && z.x > heroPos.x - 10 && z.x < minX) {
                minX = z.x;
                target = z;
            }
        }

        const tickDamage = 14 + (window.talentSystem ? Math.round(window.talentSystem.getStat('power_chord') * 0.25) : 0);
        const colors = ['#00ff66', '#ff0055', '#ffcc00', '#00d4ff'];
        const tickColor = colors[lane % 4];

        if (target) {
            target.hp -= tickDamage;
            target.flashTime = 0.08;
            this.battleStats.damageDealt += tickDamage;
            this.rockPower = Math.min(100, this.rockPower + 0.8);

            if (Math.random() > 0.45) {
                this.addFloatingText(`${tickDamage}`, target.x + (Math.random() - 0.5) * 16, target.y - 30, tickColor, false);
            }
            this.fx.spawnBurst(target.x, target.y - 18, tickColor, 4, 35, 1.8, 0.18);

            if (target.hp <= 0 && target.active) {
                target.active = false;
                this.onZombieKilled(target, 150, "+KILL! ⚡", tickColor);
            }
        } else {
            this.fx.spawnBurst(heroPos.x + 22, heroPos.y - 18, tickColor, 1, 40, 2, 0.15);
        }
    }

    onZombieKilled(z, bonusScore = 120, label = '+KILL!', color = '#00ff66') {
        this.zombiesKilled++;
        this.battleStats.zombiesKilled++;
        this.score += bonusScore;
        this.comboKills = (this.comboKills || 0) + 1;
        this.fx.addMultiKillBanner(this.comboKills, this.canvas.width / 2, this.canvas.height * 0.38);

        try {
            const tk = parseInt(localStorage.getItem('gvs_total_kills') || '0', 10);
            localStorage.setItem('gvs_total_kills', (tk + 1).toString());
            const hs = parseInt(localStorage.getItem('gvs_highscore') || '0', 10);
            if (this.score > hs) {
                localStorage.setItem('gvs_highscore', this.score.toString());
            }
        } catch (e) {}

        const activeHero = this.getActiveHeroData();
        const heroStats = this.getActiveHeroStats();
        const goldBonus = window.talentSystem ? window.talentSystem.getStat('golden_pick') : 0;
        const heroGoldMult = 1.0 + (heroStats.goldBonus || 0);

        // Procedural Gold Calculation
        const earnedGold = (z.getGoldDrop && typeof z.getGoldDrop === 'function')
            ? z.getGoldDrop(heroGoldMult, goldBonus)
            : Math.max(1, Math.round((5 + goldBonus) * heroGoldMult));

        this.battleStats.coinsEarned += earnedGold;
        if (window.talentSystem) {
            window.talentSystem.addGold(earnedGold);
        }

        // Award Guitarist Procedural XP
        const earnedXp = Math.max(2, Math.round(earnedGold * 1.35));
        if (activeHero && window.guitaristPool) {
            const xpRes = window.guitaristPool.addHeroXp(activeHero.id, earnedXp);
            if (xpRes && xpRes.leveledUp) {
                this.addFloatingText(`⭐ NÍVEL ${xpRes.newLevel}! UP!`, this.getHeroPosition().x, this.getHeroPosition().y - 65, '#ffd700', true);
                this.triggerShake(5);
            }
        }

        const textX = Math.min(this.canvas.width - 45, Math.max(30, z.x));
        const currentY = z.y + (z.jumpArcY || 0);
        this.addFloatingText(`+${earnedGold} 🪙 (+${earnedXp} XP)`, textX, currentY - 58, '#ffd700', false);

        // Rock Mana bonus on kill
        this.rockMana = Math.min(this.maxRockMana, this.rockMana + 5.0);

        // Check Stage Clear Target
        const targetKills = window.stageSystem ? window.stageSystem.getTargetKills() : 20;
        if (this.zombiesKilled >= targetKills && !this.stageCompleted) {
            this.stageCompleted = true;
            this.triggerStageClear();
        }

        if (z.type === 'mutant') {
            this.fx.triggerMutantBlast(z.x, z.y, this.entities.zombies, window.soundEngine, (other, sc) => this.onZombieKilled(other, sc, '+KILL! ☢️', '#39ff14'));
            this.rockMana = Math.min(this.maxRockMana, this.rockMana + 25);
        } else if (z.type === 'spore') {
            this.fx.triggerSporeBurst(z.x, z.y, this.getHeroPosition(), (dmg, isHvy, lbl, col) => this.takeDamage(dmg, isHvy, lbl, col));
            this.rockMana = Math.min(this.maxRockMana, this.rockMana + 10);
            this.addFloatingText("+KILL! 🍄", textX, currentY - 42, '#ffaa00', true);
        } else if (z.type === 'hazmat') {
            this.fx.triggerHazmatMeltdown(z.x, z.y, this.entities.zombies, window.soundEngine, (other, sc) => this.onZombieKilled(other, sc, '+KILL! 🧪', '#39ff14'));
            this.rockMana = Math.min(this.maxRockMana, this.rockMana + 12);
            this.addFloatingText("+KILL! ☢️", textX, currentY - 42, '#39ff14', true);
        } else {
            this.addFloatingText(label, textX, currentY - 42, color, true);
        }
    }

    triggerStageClear() {
        const stage = window.stageSystem ? window.stageSystem.selectedStage : 1;
        const rewards = window.stageSystem ? window.stageSystem.getStageRewards(stage) : { coins: 80, xp: 100 };
        if (window.talentSystem) window.talentSystem.addGold(rewards.coins);
        const activeHero = this.getActiveHeroData();
        if (activeHero && window.guitaristPool) window.guitaristPool.addHeroXp(activeHero.id, rewards.xp);
        if (window.stageSystem) window.stageSystem.unlockNextStage();

        this.triggerShake(7);
        this.fx.shockwaves.push({
            x: this.canvas.width / 2, y: this.canvas.height / 2,
            radius: 8, maxRadius: 150, color: '#ffd700', lineWidth: 5, alpha: 1.0
        });
        this.addFloatingText(`🏆 FASE ${stage} CONCLUÍDA!`, this.canvas.width / 2, this.canvas.height / 2 - 35, '#ffd700', true);
        this.addFloatingText(`+${rewards.coins} 🪙  +${rewards.xp} XP`, this.canvas.width / 2, this.canvas.height / 2 + 10, '#00ff66', true);
        if (window.soundEngine) window.soundEngine.playExplosion();

        try {
            const hs = parseInt(localStorage.getItem('gvs_highscore') || '0', 10);
            if (this.score > hs) localStorage.setItem('gvs_highscore', this.score.toString());
        } catch (e) {}
    }

    healHero(amount) {
        if (this.heroHp <= 0 || amount <= 0) return;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + amount);
        this.addFloatingText(`+${amount} HP 💚`, this.getHeroPosition().x, this.getHeroPosition().y - 45, '#00ff66', false);
    }

    takeDamage(rawDamage, isHeavy = false, label = '', color = '#ff2222') {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();

        if (this.heroImmunityTimer > 0) {
            this.addFloatingText("⚡ IMUNE!", heroPos.x, heroPos.y - 35, '#ffcc00', false);
            return;
        }

        if (this.shockBarrierReady) {
            this.shockBarrierReady = false;
            this.shockBarrierTimer = window.talentSystem ? window.talentSystem.getStat('shock_barrier') : 18;
            this.triggerShake(5);
            this.fx.shockwaves.push({ x: heroPos.x, y: heroPos.y - 15, radius: 10, maxRadius: 55, color: '#00a2ff', lineWidth: 4, alpha: 1.0 });
            this.addFloatingText("🛡️ BLOQUEADO!", heroPos.x, heroPos.y - 40, '#00a2ff', true);
            return;
        }

        const armReduction = window.talentSystem ? window.talentSystem.getStat('armored_amp') : 0;
        let finalDamage = Math.max(1, rawDamage - armReduction);

        // Harmonic Shield Absorption
        if (this.heroShieldHp > 0) {
            if (this.heroShieldHp >= finalDamage) {
                this.heroShieldHp -= finalDamage;
                this.addFloatingText(`🛡️ ESCUDO (-${finalDamage})`, heroPos.x, heroPos.y - 35, '#00a2ff', true);
                this.triggerShake(2);
                return;
            } else {
                finalDamage -= this.heroShieldHp;
                this.heroShieldHp = 0;
            }
        }

        this.heroHp = Math.max(0, this.heroHp - finalDamage);
        this.heroFlashTime = 0.2;
        this.triggerShake(isHeavy ? 9 : 3.5);
        this.addFloatingText(label || `-${finalDamage} HP`, heroPos.x, heroPos.y - 35, color, isHeavy);

        if (this.heroHp <= 0) {
            this.handleHeroDefeat();
            return;
        }

        if (window.soundEngine) window.soundEngine.playHit();
    }

    handleHeroDefeat() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.matchActive = false;
        this.triggerShake(12);
        this.addFloatingText("☠️ DERROTADO! ☠️", this.getHeroPosition().x, this.getHeroPosition().y - 50, '#ff2222', true);
        try {
            const hs = parseInt(localStorage.getItem('gvs_highscore') || '0', 10);
            if (this.score > hs) localStorage.setItem('gvs_highscore', this.score.toString());
        } catch (e) {}
        if (window.game && typeof window.game.showDefeatModal === 'function') {
            window.game.showDefeatModal();
        }
    }

    triggerChainLightning(sourceZombie, targetCount, damage) {
        let hit = 0;
        for (const other of this.entities.zombies) {
            if (other.active && other !== sourceZombie && other.x <= this.canvas.width - 5 && Math.abs(other.x - sourceZombie.x) < 140) {
                other.hp -= damage;
                other.flashTime = 0.15;
                const oy = other.y + (other.jumpArcY || 0);
                this.fx.shockwaves.push({ x: other.x, y: oy - 15, radius: 3, maxRadius: 20, color: '#00ffff', lineWidth: 2.5, alpha: 1.0 });
                this.addFloatingText(`⚡ ${damage}`, other.x, oy - 35, '#00ffff', false);

                if (other.hp <= 0 && other.active) {
                    other.active = false;
                    this.onZombieKilled(other, 100, '+CHAIN KILL! ⚡', '#00ffff');
                }

                if (++hit >= targetCount) break;
            }
        }
    }

    reviveHero() {
        this.heroHp = this.heroMaxHp;
        this.isGameOver = false;
        this.entities.zombies = [];
        this.entities.projectiles = [];

        const rndBonus = window.talentSystem ? window.talentSystem.getStat('rock_never_dies') : 0;
        const heroPos = this.getHeroPosition();
        if (rndBonus > 0) {
            this.heroImmunityTimer = rndBonus;
            this.fx.shockwaves.push({ x: heroPos.x, y: heroPos.y - 15, radius: 10, maxRadius: 120, color: '#ffcc00', lineWidth: 6, alpha: 1.0 });
            this.addFloatingText("⚡ ROCK NEVER DIES! ⚡", heroPos.x + 50, heroPos.y - 40, '#ffcc00', true);
        } else {
            this.addFloatingText("⚡ REVIVIDO! ⚡", heroPos.x + 50, heroPos.y - 40, '#ffcc00', true);
        }
    }

    update(deltaTime) {
        if (this.isPaused || !this.matchActive) return;
        this.time += deltaTime;
        const dt = deltaTime / 1000;

        if (this.heroStrumAnim > 0) {
            this.heroStrumAnim -= 4 * dt;
            if (this.heroStrumAnim < 0) this.heroStrumAnim = 0;
        }

        if (this.heroFlashTime > 0) {
            this.heroFlashTime -= dt;
        }

        if (this.heroHp <= 0 && !this.isGameOver) {
            this.handleHeroDefeat();
            return;
        }

        // 1. Rock Mana Passive Regeneration
        const heroStats = this.getActiveHeroStats();
        const manaRegen = (this.rockManaRegen || 2.0) * (heroStats.manaRegenRate || 1.0);
        this.rockMana = Math.min(this.maxRockMana, this.rockMana + manaRegen * dt);

        // 2. Shield & Attack Speed Buff Timers
        if (this.heroShieldTimer > 0) {
            this.heroShieldTimer -= dt;
            if (this.heroShieldTimer <= 0) this.heroShieldHp = 0;
        }

        if (this.heroAttackSpeedBuffTimer > 0) {
            this.heroAttackSpeedBuffTimer -= dt;
        }

        // 3. Continuous Procedural Attack Speed Loop
        if (!this.isGameOver && this.matchActive) {
            this.heroAttackTimer += dt;
            const currentSpeed = this.getHeroAttackSpeed();
            const attackInterval = 1.0 / Math.max(0.3, currentSpeed);
            if (this.heroAttackTimer >= attackInterval) {
                this.heroAttackTimer = 0;
                this.performHeroAutoAttack();
            }
        }

        // Spawn Wave Timer
        this.spawnTimer += dt;
        const targetSpawnInterval = Math.max(1.4, 3.2 - (this.zombiesKilled * 0.05));
        if (this.entities.zombies.length === 0 && this.spawnTimer < targetSpawnInterval - 0.4) {
            this.spawnTimer = targetSpawnInterval - 0.4;
        }
        if (this.spawnTimer >= targetSpawnInterval) {
            this.spawnTimer = 0;
            this.spawnZombie();
        }

        const heroPos = this.getHeroPosition();

        // Barrier & Immunity Timers
        const barrierCd = window.talentSystem ? window.talentSystem.getStat('shock_barrier') : 0;
        if (barrierCd > 0) {
            if (!this.shockBarrierReady) {
                this.shockBarrierTimer -= dt;
                if (this.shockBarrierTimer <= 0) {
                    this.shockBarrierReady = true;
                    this.shockBarrierTimer = barrierCd;
                    this.triggerShake(3);
                    this.fx.shockwaves.push({ x: heroPos.x, y: heroPos.y - 15, radius: 5, maxRadius: 40, color: '#00a2ff', lineWidth: 3, alpha: 1.0 });
                    this.addFloatingText("🛡️ BARREIRA PRONTA!", heroPos.x, heroPos.y - 42, '#00a2ff', false);
                }
            }
        } else {
            this.shockBarrierReady = false;
        }

        if (this.heroImmunityTimer > 0) {
            this.heroImmunityTimer -= dt;
        }

        // Update Zombies via polymorphic ZombieEntity
        this.entities.zombies.forEach(z => z.update(dt, this));

        // Update Projectiles
        this.entities.projectiles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.frame = 3 + (Math.floor(this.time / 90) % 4);

            p.trailTimer += dt;
            if (p.trailTimer > 0.03) {
                p.trailTimer = 0;
                this.fx.particles.push({
                    x: p.x - (p.vx * 0.015),
                    y: p.y - (p.vy * 0.015),
                    vx: (Math.random() - 0.5) * 15 - 15,
                    vy: (Math.random() - 0.5) * 15,
                    color: p.projColor || (p.isCrit ? '#ff00ff' : '#00ffff'),
                    size: 1.2 + Math.random() * 1.4,
                    life: 0.22,
                    maxLife: 0.22
                });
            }

            // Screen boundary dissipation: spark and fizzle before exiting screen
            if (p.x >= this.canvas.width - 4) {
                p.active = false;
                this.fx.spawnBurst(this.canvas.width - 4, p.y, p.projColor || '#00ffff', 3, 20, 1.2, 0.15);
                return;
            }

            for (const puddle of this.fx.acidPuddles) {
                if (Math.abs(p.x - puddle.x) < puddle.width / 2) {
                    p.damage = Math.max(8, Math.round(p.damage * 0.985));
                }
            }

            // Collisions with visible on-screen Zombies (miss shots bypass zombies)
            if (p.isMiss) return;
            for (const z of this.entities.zombies) {
                if (!z.active || z.x > this.canvas.width - 4) continue;
                const currentY = z.y + (z.jumpArcY || 0);
                const hitRadius = (z.type === 'mutant' || z.type === 'bloater') ? 34 : 22;

                if (Math.abs(p.x - z.x) < hitRadius && Math.abs(p.y - (currentY - 15)) < 26) {
                    if (z.type === 'gladiator' && !p.isCrit && Math.random() < z.deflectChance) {
                        p.active = false;
                        this.addFloatingText("🛡️ CORRENTE DEFLETIU!", z.x, currentY - 34, '#ff3333', true);
                        this.triggerShake(2);
                        this.fx.spawnBurst(p.x, p.y, '#ffffaa', 6, 50, 2, 0.25);
                        continue;
                    }

                    p.active = false;
                    z.flashTime = 0.14;

                    const activeHero = this.getActiveHeroData();
                    const heroStats = this.getActiveHeroStats();
                    const heroId = p.heroId || (activeHero ? activeHero.id : null);

                    // Execute Equipped Lane Skill effect if present on projectile
                    let skillLabel = null;
                    let skillColor = p.projColor || '#ff00ff';
                    if (p.skill && typeof p.skill.apply === 'function') {
                        const sRes = p.skill.apply(this, z, p.damage);
                        if (sRes) {
                            if (typeof sRes.damage === 'number' && !isNaN(sRes.damage)) p.damage = sRes.damage;
                            if (sRes.label) skillLabel = sRes.label;
                            if (sRes.color) skillColor = sRes.color;
                        }
                        if (window.soundEngine && typeof window.soundEngine.playSkillSfx === 'function') {
                            window.soundEngine.playSkillSfx(p.skill.type);
                        }
                    }

                    if (heroStats.slowHorde > 0 || heroId === 'dr_radix') {
                        const slowAmt = 1.0 - (heroStats.slowHorde || 0.15);
                        z.speed = Math.max(12, z.speed * slowAmt);
                    }

                    if (z.type === 'soldier' && !z.armorBroken) {
                        if (p.isCrit) {
                            z.armorBroken = true;
                            this.addFloatingText("🛡️ CAPACETE QUEBRADO! STUN!", z.x, currentY - 45, '#ffff00', true);
                            this.triggerShake(6);
                            this.fx.spawnBurst(z.x, currentY - 20, '#8899aa', 7, 50, 2.5, 0.35);
                        } else {
                            const pen = heroStats.armorPen || (heroId === 'dr_radix' ? 0.50 : 0);
                            const armorReduction = 0.55 * (1 - pen);
                            p.damage = Math.round(p.damage * (1 - armorReduction));
                            this.addFloatingText(pen > 0 ? "BLINDADO PENETRADO! ☢️" : "BLINDADO! -45%", z.x, currentY - 34, '#88aacc', false);
                        }
                    }

                    if (heroStats.burnChance && Math.random() < heroStats.burnChance) {
                        z.burnTimer = 3.2;
                        z.burnDps = 16;
                        this.addFloatingText("🔥 QUEIMANDO!", z.x, currentY - 48, '#ff5500', true);
                    }

                    let knockMult = 1.0 + (window.talentSystem ? window.talentSystem.getStat('sonic_knockback') : 0);
                    if (heroStats.knockbackBonus) {
                        knockMult *= (1.0 + heroStats.knockbackBonus);
                    } else if (heroId === 'kragthor_titan') {
                        knockMult *= 1.6;
                    }

                    let isAirShot = false;
                    let knockDist = (z.type === 'mutant' ? 4 : 8) * knockMult;
                    if (z.type === 'leaper' && z.jumpState === 'leaping') {
                        isAirShot = true;
                        z.jumpState = 'ground';
                        z.jumpArcY = 0;
                        z.hasJumped = true;
                        knockDist = 35 * knockMult;
                        p.isCrit = true;
                        const airBonus = window.talentSystem ? window.talentSystem.getStat('air_sniper') : 0;
                        p.damage = Math.round(p.damage * (1.8 + airBonus));
                        this.addFloatingText("🎯 AIR SHOT! CRIT!", z.x, currentY - 45, '#ffcc00', true);
                        this.triggerShake(7);
                    } else if (z.type === 'bloater') {
                        knockDist = 2 * knockMult;
                    }
                    z.x = Math.min(this.canvas.width - 15, z.x + knockDist);

                    z.hp -= p.damage;
                    this.battleStats.damageDealt += p.damage;

                    if (!isAirShot) {
                        this.addFloatingText(
                            p.isCrit ? `CRIT ${p.damage}!` : `${p.damage}`,
                            z.x, currentY - ((z.type === 'mutant' || z.type === 'bloater') ? 44 : 30),
                            p.isCrit ? (p.projColor || '#ff00ff') : '#ffffff',
                            p.isCrit
                        );
                        if (skillLabel) {
                            this.addFloatingText(skillLabel, z.x, currentY - 58, skillColor, true);
                        }
                    }

                    this.createExplosion(p.x, p.y, p.isCrit);

                    if (p.isCrit) {
                        let chainTargets = window.talentSystem ? window.talentSystem.getStat('fuzz_lightning') : 0;
                        if (heroStats.chainLightning || heroId === 'cypher_volt') {
                            chainTargets = Math.max(chainTargets, heroStats.chainTargets || 2);
                        }
                        if (chainTargets > 0) {
                            const chainDmg = Math.max(16, Math.round(p.damage * 0.45));
                            this.triggerChainLightning(z, chainTargets, chainDmg);
                        }
                    }

                    if (z.hp <= 0 && z.active) {
                        z.active = false;
                        const killScore = p.isCrit ? 250 : 120;
                        this.onZombieKilled(z, killScore);
                    }
                    break;
                }
            }

            if (p.x > this.canvas.width + 10 || p.x < -60) p.active = false;
        });

        // Update VFX Module
        this.fx.update(dt, this.canvas.width, this.canvas.height);

        // Clean dead entities
        this.entities.zombies = this.entities.zombies.filter(z => z.active);
        this.entities.projectiles = this.entities.projectiles.filter(p => p.active);
    }

    draw() {
        if (!this.canvas || this.canvas.width <= 10 || this.canvas.height <= 10) {
            this.resize();
            if (!this.canvas || this.canvas.width <= 10 || this.canvas.height <= 10) return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        if (this.fx.shakePower > 0) {
            const rx = (Math.random() - 0.5) * this.fx.shakePower * 2;
            const ry = (Math.random() - 0.5) * this.fx.shakePower * 2;
            this.ctx.translate(rx, ry);
        }

        // 1. Background
        this.drawBackground();

        // 2. Ambient Embers
        this.fx.drawAmbientEmbers(this.ctx);

        // 3. Hero Ground Shadow & Amp
        const heroPos = this.getHeroPosition();
        this.fx.drawAmpAndShadow(this.ctx, heroPos.x, heroPos.y, this.time);

        // 4. Acid Puddles
        this.fx.drawAcidPuddles(this.ctx);

        // 5. Draw Zombies (Sorted by depth without per-frame array allocation)
        if (this.entities.zombies.length > 1) {
            this.entities.zombies.sort((a, b) => (a.y + (a.jumpArcY || 0)) - (b.y + (b.jumpArcY || 0)));
        }
        this.entities.zombies.forEach(z => z.draw(this.ctx, this.assets));

        // 6. Draw Hero
        const activeSheet = this.getActiveHeroSheet();
        const activeHero = this.getActiveHeroData();
        const totalHeroFrames = activeSheet ? (activeSheet.totalFrames || 12) : 12;
        const heroFrame = (this.time / 100) % totalHeroFrames;

        if (activeSheet) {
            activeSheet.drawFrame(
                this.ctx,
                heroFrame,
                heroPos.x,
                heroPos.y - 12,
                0.52,
                false,
                this.heroFlashTime > 0
            );
        }

        if (activeHero) {
            this.ctx.save();
            this.ctx.font = "bold 9px 'Segoe UI', sans-serif";
            this.ctx.textAlign = 'center';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeStyle = '#000000';
            this.ctx.strokeText(activeHero.name, heroPos.x + 8, heroPos.y - 42);
            this.ctx.fillStyle = activeHero.accentColor || '#ffaa00';
            this.ctx.fillText(activeHero.name, heroPos.x + 8, heroPos.y - 42);
            this.ctx.restore();
        }

        if (this.rockPower > 30) this.fx.drawElectricAura(this.ctx, heroPos.x + 10, heroPos.y - 18);
        if (this.shockBarrierReady) this.fx.drawShockBarrier(this.ctx, heroPos.x + 4, heroPos.y - 16, this.time);
        if (this.heroImmunityTimer > 0) this.fx.drawImmunityAura(this.ctx, heroPos.x + 4, heroPos.y - 16, this.time);

        // 7. Projectiles
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.entities.projectiles.forEach(p => {
            const sc = p.isSkillShot ? 0.28 : (p.isCrit ? 0.25 : 0.18);
            this.assets.fxSheet.drawFrame(this.ctx, p.frame, p.x, p.y, sc, false);
        });
        this.ctx.restore();

        // 8. VFX Module (Explosions, Shockwaves, Particles, Floating Text)
        this.fx.drawEffects(this.ctx, this.assets.fxSheet);

        // 9. Vignette & Game Over
        this.fx.drawVignette(this.ctx, this.canvas.width, this.canvas.height);
        if (this.isGameOver) this.fx.drawGameOverOverlay(this.ctx, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    drawGameOverOverlay() { this.fx.drawGameOverOverlay(this.ctx, this.canvas.width, this.canvas.height); }

    drawBackground() {
        const bg = this.assets.bg;
        if (!bg.complete || bg.naturalWidth === 0 || this.canvas.width <= 10 || this.canvas.height <= 10) {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        const m = this.getRoadMetrics();
        if (m.drawW > 0 && m.drawH > 0) this.ctx.drawImage(bg, m.drawX, m.drawY, m.drawW, m.drawH);
    }

    drawAmpAndShadow(heroX, heroY) { this.fx.drawAmpAndShadow(this.ctx, heroX, heroY, this.time); }
}

window.CombatSystem = CombatSystem;
