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
        const imgBg = new Image(); imgBg.src = 'assets/bg2.jpg';
        const imgHero = new Image(); imgHero.src = 'assets/hero2.jpg';
        const imgHeroVulkan = new Image(); imgHeroVulkan.src = 'assets/hero_vulkan.jpg';
        const imgHeroHazmat = new Image(); imgHeroHazmat.src = 'assets/hero_hazmat.jpg';
        const imgHeroCyborg = new Image(); imgHeroCyborg.src = 'assets/hero_cyborg.jpg';
        const imgHeroGladiator = new Image(); imgHeroGladiator.src = 'assets/hero_gladiator.jpg';
        const imgHeroAnarchy = new Image(); imgHeroAnarchy.src = 'assets/hero_anarchy.jpg';
        const imgZombie = new Image(); imgZombie.src = 'assets/zombie2.jpg';
        const imgMutant = new Image(); imgMutant.src = 'assets/zombie_mutant.jpg';
        const imgLeaper = new Image(); imgLeaper.src = 'assets/zombie_leaper.jpg';
        const imgSoldier = new Image(); imgSoldier.src = 'assets/zombie_soldier.jpg';
        const imgSpore = new Image(); imgSpore.src = 'assets/zombie_spore.jpg';
        const imgBloater = new Image(); imgBloater.src = 'assets/zombie_bloater.jpg';
        const imgGladiator = new Image(); imgGladiator.src = 'assets/zombie_gladiator.jpg';
        const imgHazmat = new Image(); imgHazmat.src = 'assets/zombie_hazmat.jpg';
        const imgFx = new Image(); imgFx.src = 'assets/fx2.jpg';

        const SheetClass = window.SpriteSheet || SpriteSheet;
        this.assets = {
            bg: imgBg,
            heroSheet: new SheetClass(imgHero, 4, 3),
            heroVulkanSheet: new SheetClass(imgHeroVulkan, 4, 3),
            heroHazmatSheet: new SheetClass(imgHeroHazmat, 4, 3),
            heroCyborgSheet: new SheetClass(imgHeroCyborg, 4, 3),
            heroGladiatorSheet: new SheetClass(imgHeroGladiator, 4, 4),
            heroAnarchySheet: new SheetClass(imgHeroAnarchy, 4, 3),
            zombieSheet: new SheetClass(imgZombie, 4, 3),
            mutantSheet: new SheetClass(imgMutant, 4, 3),
            leaperSheet: new SheetClass(imgLeaper, 4, 3),
            soldierSheet: new SheetClass(imgSoldier, 4, 3),
            sporeSheet: new SheetClass(imgSpore, 4, 3),
            bloaterSheet: new SheetClass(imgBloater, 4, 3),
            gladiatorSheet: new SheetClass(imgGladiator, 4, 3),
            hazmatSheet: new SheetClass(imgHazmat, 4, 3),
            fxSheet: new SheetClass(imgFx, 4, 3)
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

        this.time = 0;
        this.heroStrumAnim = 0.8;
        this.heroFlashTime = 0;
        this.heroHp = 100;
        this.heroMaxHp = 100;
        this.isGameOver = false;
        this.combo = 0;
        this.rockPower = 0;
        this.zombiesKilled = 0;
        this.score = 0;

        // Talent-driven combat states
        this.shockBarrierTimer = 15;
        this.shockBarrierReady = false;
        this.heroImmunityTimer = 0;

        this.spawnTimer = 0;

        // Match Enemy Pool & Real-Time Battle Statistics (SS)
        this.matchActive = false;
        this.activeEnemyTypes = [];
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
        this.canvas.addEventListener('pointerdown', () => {
            if (this.isGameOver) {
                this.reviveHero();
            }
        });
    }

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
            return {
                drawX: 0,
                drawY: 0,
                drawW: cw,
                drawH: ch,
                laneY: ch * 0.78
            };
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
        this.isGameOver = false;
        this.rockPower = 0;
        this.combo = 0;
        this.score = 0;
        this.zombiesKilled = 0;
        this.spawnTimer = 0;

        this.activeEnemyTypes = (enemyList && enemyList.length > 0)
            ? enemyList
            : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);

        this.battleStats = {
            damageDealt: 0,
            zombiesKilled: 0,
            coinsEarned: 0,
            hitsReceived: 0,
            matchStartTime: performance.now()
        };
        this.matchActive = true;
    }

    spawnZombie() {
        if (this.isGameOver || !this.matchActive) return;
        const metrics = this.getRoadMetrics();

        const pool = (this.activeEnemyTypes && this.activeEnemyTypes.length > 0)
            ? this.activeEnemyTypes
            : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);

        const enemyDef = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : { type: 'normal', scale: 0.50, speed: 38, hp: 80, attackInterval: 1.1, attackDamage: 7, name: 'Zumbi Punk' };

        const ZombieClass = window.ZombieEntity || ZombieEntity;
        const zombie = new ZombieClass(enemyDef, metrics.laneY, this.canvas.width);
        this.entities.zombies.push(zombie);
    }

    launchAttack(isCrit = false, chordIndex = 0) {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();
        this.heroStrumAnim = 0.8;

        let target = null;
        let minX = Infinity;
        for (const z of this.entities.zombies) {
            if (z.active && z.x > heroPos.x - 10 && z.x < minX) {
                minX = z.x;
                target = z;
            }
        }

        const startX = heroPos.x + 22;
        const startY = heroPos.y - 18;
        const targetX = target ? target.x : this.canvas.width + 80;
        const targetY = target ? (target.y + (target.jumpArcY || 0) - 18) : heroPos.y - 18;
        const angle = Math.atan2(targetY - startY, targetX - startX);

        const activeHero = this.getActiveHeroData();
        const baseBonus = window.talentSystem ? window.talentSystem.getStat('power_chord') : 0;
        const critBonus = window.talentSystem ? window.talentSystem.getStat('ferocious_solo') : 0;

        let heroDmgMult = 1.0;
        let heroSpeedMult = 1.0;
        let heroCritMultBonus = 0;
        let projColor = isCrit ? '#ff00ff' : '#00ffff';

        if (activeHero) {
            if (activeHero.id === 'johnny_blaze') {
                heroDmgMult = 1.15;
                heroSpeedMult = 1.10;
            } else if (activeHero.id === 'kragthor_titan') {
                heroCritMultBonus = 0.35;
            }
            if (activeHero.projectileColor) {
                projColor = activeHero.projectileColor;
            }
        }

        const baseDmg = Math.round((45 + baseBonus) * heroDmgMult);
        const critMult = 2.2 + critBonus + heroCritMultBonus;
        const calcDamage = isCrit ? Math.round(baseDmg * critMult) : baseDmg;
        const projSpeed = 440 * heroSpeedMult;

        this.entities.projectiles.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * projSpeed,
            vy: Math.sin(angle) * projSpeed,
            target: target,
            isCrit: isCrit,
            damage: calcDamage,
            frame: 3 + Math.floor(Math.random() * 4),
            trailTimer: 0,
            active: true,
            heroId: activeHero ? activeHero.id : null,
            projColor: projColor
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
            window.soundEngine.playGuitarChord(chordIndex);
        }
    }

    launchSustainTick(lane = 0) {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();
        this.heroStrumAnim = 0.5;

        let target = null;
        let minX = Infinity;
        for (const z of this.entities.zombies) {
            if (z.active && z.x > heroPos.x - 10 && z.x < minX) {
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

            for (let i = 0; i < 4; i++) {
                const prog = Math.random();
                const sx = heroPos.x + 22 + (target.x - heroPos.x - 22) * prog;
                const sy = heroPos.y - 18 + ((target.y - 18) - (heroPos.y - 18)) * prog;
                this.fx.particles.push({
                    x: sx,
                    y: sy + (Math.random() - 0.5) * 12,
                    vx: (Math.random() - 0.5) * 40,
                    vy: (Math.random() - 0.5) * 40,
                    color: tickColor,
                    size: 1.5 + Math.random() * 1.5,
                    life: 0.18,
                    maxLife: 0.18
                });
            }

            if (target.hp <= 0 && target.active) {
                target.active = false;
                this.onZombieKilled(target, 150, "+KILL! ⚡", tickColor);
            }
        } else {
            this.fx.particles.push({
                x: heroPos.x + 22,
                y: heroPos.y - 18,
                vx: 50 + Math.random() * 40,
                vy: (Math.random() - 0.5) * 30,
                color: tickColor,
                size: 2,
                life: 0.15,
                maxLife: 0.15
            });
        }
    }

    onZombieKilled(z, bonusScore = 120, label = '+KILL!', color = '#00ff66') {
        this.zombiesKilled++;
        this.battleStats.zombiesKilled++;
        this.score += bonusScore;

        const activeHero = this.getActiveHeroData();
        const heroId = activeHero ? activeHero.id : null;

        const baseGold = z.type === 'bloater' ? 14 : (z.type === 'mutant' ? 12 : (z.type === 'soldier' ? 9 : (z.type === 'gladiator' ? 8 : (z.type === 'hazmat' ? 7 : (z.type === 'spore' ? 6 : 4)))));
        const goldBonus = window.talentSystem ? window.talentSystem.getStat('golden_pick') : 0;
        let earnedGold = baseGold + goldBonus;

        if (heroId === 'roxie_anarchy') {
            earnedGold = Math.round(earnedGold * 1.25);
            this.rockPower = Math.min(100, this.rockPower + 4);
        }

        this.battleStats.coinsEarned += earnedGold;
        if (window.talentSystem) {
            window.talentSystem.addGold(earnedGold);
        }

        const currentY = z.y + (z.jumpArcY || 0);
        this.addFloatingText(`+${earnedGold} 🪙`, z.x, currentY - 58, '#ffd700', false);

        if (z.type === 'mutant') {
            this.fx.triggerMutantBlast(z.x, z.y, this.entities.zombies, window.soundEngine, (other, sc) => this.onZombieKilled(other, sc, '+KILL! ☢️', '#39ff14'));
            this.rockPower = Math.min(100, this.rockPower + 35);
        } else if (z.type === 'spore') {
            this.fx.triggerSporeBurst(z.x, z.y, this.getHeroPosition(), (dmg, isHvy, lbl, col) => this.takeDamage(dmg, isHvy, lbl, col));
            this.rockPower = Math.min(100, this.rockPower + 10);
            this.addFloatingText("+KILL! 🍄", z.x, currentY - 42, '#ffaa00', true);
        } else if (z.type === 'hazmat') {
            this.fx.triggerHazmatMeltdown(z.x, z.y, this.entities.zombies, window.soundEngine, (other, sc) => this.onZombieKilled(other, sc, '+KILL! 🧪', '#39ff14'));
            this.rockPower = Math.min(100, this.rockPower + 12);
            this.addFloatingText("+KILL! ☢️", z.x, currentY - 42, '#39ff14', true);
        } else {
            this.rockPower = Math.min(100, this.rockPower + (z.type === 'leaper' ? 12 : 8));
            this.addFloatingText(label, z.x, currentY - 42, color, true);
        }
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
            const barrierCd = window.talentSystem ? window.talentSystem.getStat('shock_barrier') : 18;
            this.shockBarrierTimer = barrierCd;
            this.triggerShake(5);
            this.fx.shockwaves.push({
                x: heroPos.x, y: heroPos.y - 15,
                radius: 10, maxRadius: 55,
                color: '#00a2ff', lineWidth: 4, alpha: 1.0
            });
            this.addFloatingText("🛡️ BLOQUEADO!", heroPos.x, heroPos.y - 40, '#00a2ff', true);
            return;
        }

        const armReduction = window.talentSystem ? window.talentSystem.getStat('armored_amp') : 0;
        const finalDamage = Math.max(1, rawDamage - armReduction);

        this.heroHp = Math.max(0, this.heroHp - finalDamage);
        this.heroFlashTime = 0.2;
        this.triggerShake(isHeavy ? 9 : 3.5);
        this.addFloatingText(label || `-${finalDamage} HP`, heroPos.x, heroPos.y - 35, color, isHeavy);

        if (window.soundEngine) window.soundEngine.playHit();
    }

    triggerChainLightning(sourceZombie, targetCount, damage) {
        let hit = 0;
        for (const other of this.entities.zombies) {
            if (other.active && other !== sourceZombie && Math.abs(other.x - sourceZombie.x) < 140) {
                other.hp -= damage;
                other.flashTime = 0.15;

                this.fx.shockwaves.push({
                    x: other.x,
                    y: other.y + (other.jumpArcY || 0) - 15,
                    radius: 3,
                    maxRadius: 20,
                    color: '#00ffff',
                    lineWidth: 2.5,
                    alpha: 1.0
                });

                this.addFloatingText(`⚡ ${damage}`, other.x, other.y + (other.jumpArcY || 0) - 35, '#00ffff', false);

                if (other.hp <= 0 && other.active) {
                    other.active = false;
                    this.onZombieKilled(other, 100, '+CHAIN KILL! ⚡', '#00ffff');
                }

                hit++;
                if (hit >= targetCount) break;
            }
        }
    }

    reviveHero() {
        this.heroHp = this.heroMaxHp;
        this.isGameOver = false;
        this.entities.zombies = [];
        this.entities.projectiles = [];

        const rndBonus = window.talentSystem ? window.talentSystem.getStat('rock_never_dies') : 0;
        if (rndBonus > 0) {
            this.heroImmunityTimer = rndBonus;
            this.fx.shockwaves.push({
                x: this.getHeroPosition().x, y: this.getHeroPosition().y - 15,
                radius: 10, maxRadius: 120,
                color: '#ffcc00', lineWidth: 6, alpha: 1.0
            });
            this.addFloatingText("⚡ ROCK NEVER DIES! ⚡", this.getHeroPosition().x + 50, this.getHeroPosition().y - 40, '#ffcc00', true);
        } else {
            this.addFloatingText("⚡ REVIVIDO! ⚡", this.getHeroPosition().x + 50, this.getHeroPosition().y - 40, '#ffcc00', true);
        }
    }

    update(deltaTime) {
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
            this.isGameOver = true;
            this.triggerShake(12);
            this.addFloatingText("☠️ DERROTADO! ☠️", this.getHeroPosition().x, this.getHeroPosition().y - 50, '#ff2222', true);
        }

        // Spawn Wave Timer
        this.spawnTimer += dt;
        const targetSpawnInterval = Math.max(1.4, 3.2 - (this.zombiesKilled * 0.05));
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
                    this.fx.shockwaves.push({
                        x: heroPos.x, y: heroPos.y - 15,
                        radius: 5, maxRadius: 40,
                        color: '#00a2ff', lineWidth: 3, alpha: 1.0
                    });
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

            for (const puddle of this.fx.acidPuddles) {
                if (Math.abs(p.x - puddle.x) < puddle.width / 2) {
                    p.damage = Math.max(8, Math.round(p.damage * 0.985));
                }
            }

            // Collisions with Zombies
            for (const z of this.entities.zombies) {
                const currentY = z.y + (z.jumpArcY || 0);
                const hitRadius = (z.type === 'mutant' || z.type === 'bloater') ? 34 : 22;

                if (z.active && Math.abs(p.x - z.x) < hitRadius && Math.abs(p.y - (currentY - 15)) < 26) {
                    if (z.type === 'gladiator' && !p.isCrit && Math.random() < z.deflectChance) {
                        p.active = false;
                        this.addFloatingText("🛡️ CORRENTE DEFLETIU!", z.x, currentY - 34, '#ff3333', true);
                        this.triggerShake(2);
                        for (let i = 0; i < 7; i++) {
                            this.fx.particles.push({
                                x: p.x, y: p.y,
                                vx: (Math.random() - 0.5) * 50 + 20, vy: (Math.random() - 0.5) * 50,
                                color: '#ffffaa', size: 2, life: 0.25, maxLife: 0.25
                            });
                        }
                        continue;
                    }

                    p.active = false;
                    z.flashTime = 0.14;

                    const activeHero = this.getActiveHeroData();
                    const heroId = p.heroId || (activeHero ? activeHero.id : null);

                    if (heroId === 'dr_radix') {
                        z.speed = Math.max(12, z.speed * 0.85);
                    }

                    if (z.type === 'soldier' && !z.armorBroken) {
                        if (p.isCrit) {
                            z.armorBroken = true;
                            this.addFloatingText("🛡️ CAPACETE QUEBRADO! STUN!", z.x, currentY - 45, '#ffff00', true);
                            this.triggerShake(6);
                            for (let i = 0; i < 8; i++) {
                                this.fx.particles.push({
                                    x: z.x, y: currentY - 20,
                                    vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 40,
                                    color: '#8899aa', size: 2.5, life: 0.35, maxLife: 0.35
                                });
                            }
                        } else {
                            const armorReduction = heroId === 'dr_radix' ? 0.80 : 0.55;
                            p.damage = Math.round(p.damage * armorReduction);
                            this.addFloatingText(heroId === 'dr_radix' ? "BLINDADO PENETRADO! ☢️" : "BLINDADO! -45%", z.x, currentY - 34, '#88aacc', false);
                        }
                    }

                    if (heroId === 'vulkan_ironhead' && Math.random() < 0.35) {
                        z.burnTimer = 3.0;
                        z.burnTick = 0;
                        this.addFloatingText("🔥 QUEIMANDO!", z.x, currentY - 48, '#ff5500', true);
                    }

                    let knockMult = 1.0 + (window.talentSystem ? window.talentSystem.getStat('sonic_knockback') : 0);
                    if (heroId === 'kragthor_titan') {
                        knockMult *= 1.6;
                    }

                    let isAirShot = false;
                    if (z.type === 'leaper' && z.jumpState === 'leaping') {
                        isAirShot = true;
                        z.jumpState = 'ground';
                        z.jumpArcY = 0;
                        z.hasJumped = true;
                        z.x += 35 * knockMult;
                        p.isCrit = true;
                        const airBonus = window.talentSystem ? window.talentSystem.getStat('air_sniper') : 0;
                        p.damage = Math.round(p.damage * (1.8 + airBonus));
                        this.addFloatingText("🎯 AIR SHOT! CRIT!", z.x, currentY - 45, '#ffcc00', true);
                        this.triggerShake(7);
                    } else if (z.type === 'bloater') {
                        z.x += 2 * knockMult;
                    } else {
                        z.x += (z.type === 'mutant' ? 4 : 8) * knockMult;
                    }

                    z.hp -= p.damage;
                    this.battleStats.damageDealt += p.damage;

                    if (!isAirShot) {
                        this.addFloatingText(
                            p.isCrit ? `CRIT ${p.damage}!` : `${p.damage}`,
                            z.x, currentY - ((z.type === 'mutant' || z.type === 'bloater') ? 44 : 30),
                            p.isCrit ? (p.projColor || '#ff00ff') : '#ffffff',
                            p.isCrit
                        );
                    }

                    this.createExplosion(p.x, p.y, p.isCrit);

                    if (p.isCrit) {
                        let chainTargets = window.talentSystem ? window.talentSystem.getStat('fuzz_lightning') : 0;
                        if (heroId === 'cypher_volt') {
                            chainTargets = Math.max(chainTargets, 2);
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

            if (p.x > this.canvas.width + 80 || p.x < -60) p.active = false;
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
        this.drawAmpAndShadow(heroPos.x, heroPos.y);

        // 4. Acid Puddles
        this.fx.drawAcidPuddles(this.ctx);

        // 5. Draw Zombies (Sorted by depth)
        const sortedZombies = [...this.entities.zombies].sort((a, b) => {
            const ay = a.y + (a.jumpArcY || 0);
            const by = b.y + (b.jumpArcY || 0);
            return ay - by;
        });
        sortedZombies.forEach(z => z.draw(this.ctx, this.assets));

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
            this.ctx.fillStyle = activeHero.accentColor || '#ffaa00';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(activeHero.name, heroPos.x + 8, heroPos.y - 42);
            this.ctx.restore();
        }

        if (this.rockPower > 30) {
            this.fx.drawElectricAura(this.ctx, heroPos.x + 10, heroPos.y - 18);
        }

        if (this.shockBarrierReady) {
            this.fx.drawShockBarrier(this.ctx, heroPos.x + 4, heroPos.y - 16, this.time);
        }

        if (this.heroImmunityTimer > 0) {
            this.fx.drawImmunityAura(this.ctx, heroPos.x + 4, heroPos.y - 16, this.time);
        }

        // 7. Projectiles
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.entities.projectiles.forEach(p => {
            this.assets.fxSheet.drawFrame(
                this.ctx,
                p.frame,
                p.x,
                p.y,
                p.isCrit ? 0.25 : 0.18,
                false
            );
        });
        this.ctx.restore();

        // 8. VFX Module (Explosions, Shockwaves, Particles, Floating Text)
        this.fx.drawEffects(this.ctx, this.assets.fxSheet);

        // 9. Vignette & Game Over
        this.fx.drawVignette(this.ctx, this.canvas.width, this.canvas.height);

        if (this.isGameOver) {
            this.drawGameOverOverlay();
        }

        this.ctx.restore();
    }

    drawGameOverOverlay() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(15, 0, 5, 0.75)';
        this.ctx.fillRect(0, 0, cw, ch);

        this.ctx.font = "bold 24px 'Impact', sans-serif";
        this.ctx.fillStyle = '#ff2222';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ROCK OVER! ☠️", cw / 2, ch / 2 - 15);

        this.ctx.font = "bold 13px 'Segoe UI', sans-serif";
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText("TOQUE PARA REVIVER E CONTINUAR", cw / 2, ch / 2 + 15);

        this.ctx.restore();
    }

    drawBackground() {
        const bg = this.assets.bg;
        if (!bg.complete || bg.naturalWidth === 0 || this.canvas.width <= 10 || this.canvas.height <= 10) {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const metrics = this.getRoadMetrics();
        if (metrics.drawW <= 0 || metrics.drawH <= 0) return;
        this.ctx.drawImage(bg, metrics.drawX, metrics.drawY, metrics.drawW, metrics.drawH);
    }

    drawAmpAndShadow(heroX, heroY) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        this.ctx.beginPath();
        this.ctx.ellipse(heroX, heroY + 2, 16, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const ampX = heroX - 28;
        const ampY = heroY - 26;
        const ampW = 16;
        const ampH = 26;

        this.ctx.fillStyle = '#151515';
        this.ctx.fillRect(ampX, ampY, ampW, ampH);
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(ampX, ampY, ampW, ampH);

        const pulse = Math.sin(this.time / 80) * 1.0;
        this.ctx.fillStyle = '#282828';
        this.ctx.beginPath();
        this.ctx.arc(ampX + ampW / 2, ampY + 8, 4 + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(ampX + ampW / 2, ampY + 18, 4 + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ff0033';
        this.ctx.beginPath();
        this.ctx.arc(ampX + 3, ampY + 3, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

window.CombatSystem = CombatSystem;
