// AAA Combat System for Guitar vs Zombies - Zoomed Out, Grounded & Leaper Zombie
class SpriteSheet {
    constructor(image, cols, rows) {
        this.image = image;
        this.cols = cols;
        this.rows = rows;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = cols * rows;
        this.ready = false;
        this.cleanImage = null;
        this.whiteImage = null; // Pre-calculated silhouette for 100% clean hit flashes

        image.onload = () => {
            this.frameWidth = image.width / cols;
            this.frameHeight = image.height / rows;
            this.processImages(image);
            this.ready = true;
        };

        if (image.complete && image.naturalWidth > 0) {
            this.frameWidth = image.width / cols;
            this.frameHeight = image.height / rows;
            this.processImages(image);
            this.ready = true;
        }
    }

    processImages(img) {
        // 1. Transparent Clean Canvas
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cx = c.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0);
        const imgData = cx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;

        // 2. White Silhouette Canvas (Fixes the white box bug completely)
        const wc = document.createElement('canvas');
        wc.width = img.width;
        wc.height = img.height;
        const wcx = wc.getContext('2d', { willReadFrequently: true });
        const whiteData = wcx.createImageData(c.width, c.height);
        const wd = whiteData.data;

        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            // Green screen detection with compression tolerance
            const isGreen = g > 130 && g > r * 1.25 && g > b * 1.25;

            if (isGreen) {
                if (g > 158 && g > r * 1.38 && g > b * 1.38) {
                    d[i + 3] = 0; // Transparent
                } else {
                    // Suppress green spill on edge borders
                    d[i + 1] = Math.min(g, Math.max(r, b));
                    const maxRb = Math.max(r, b);
                    const spillDiff = g - maxRb;
                    if (spillDiff > 20) {
                        d[i + 3] = Math.max(0, 255 - spillDiff * 4);
                    }
                }
            }

            // Populate pure white silhouette for hit-flash effects
            if (d[i + 3] > 10) {
                wd[i] = 255;
                wd[i + 1] = 255;
                wd[i + 2] = 255;
                wd[i + 3] = d[i + 3];
            }
        }

        cx.putImageData(imgData, 0, 0);
        wcx.putImageData(whiteData, 0, 0);

        this.cleanImage = c;
        this.whiteImage = wc;
    }

    drawFrame(ctx, frameIndex, x, y, scale = 1, flip = false, flashWhite = false, alpha = 1.0) {
        if (!this.ready || !this.cleanImage) return;

        const f = Math.floor(frameIndex) % this.totalFrames;
        const col = f % this.cols;
        const row = Math.floor(f / this.cols);

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        if (alpha < 1.0) ctx.globalAlpha = Math.max(0, alpha);
        if (flip) ctx.scale(-1, 1);

        const dw = this.frameWidth * scale;
        const dh = this.frameHeight * scale;
        const dx = -dw / 2;
        const dy = -dh / 2;

        // Draw regular character sprite
        ctx.drawImage(
            this.cleanImage,
            col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
            dx, dy, dw, dh
        );

        // Flash white silhouette overlay (100% bug-free)
        if (flashWhite && this.whiteImage) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.drawImage(
                this.whiteImage,
                col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                dx, dy, dw, dh
            );
            ctx.restore();
        }

        ctx.restore();
    }
}

class CombatSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

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

        this.assets = {
            bg: imgBg,
            heroSheet: new SpriteSheet(imgHero, 4, 3),
            heroVulkanSheet: new SpriteSheet(imgHeroVulkan, 4, 3),
            heroHazmatSheet: new SpriteSheet(imgHeroHazmat, 4, 3),
            heroCyborgSheet: new SpriteSheet(imgHeroCyborg, 4, 3),
            heroGladiatorSheet: new SpriteSheet(imgHeroGladiator, 4, 4), // 4x4 (16 frames)
            heroAnarchySheet: new SpriteSheet(imgHeroAnarchy, 4, 3),
            zombieSheet: new SpriteSheet(imgZombie, 4, 3),
            mutantSheet: new SpriteSheet(imgMutant, 4, 3),
            leaperSheet: new SpriteSheet(imgLeaper, 4, 3),
            soldierSheet: new SpriteSheet(imgSoldier, 4, 3),
            sporeSheet: new SpriteSheet(imgSpore, 4, 3),
            bloaterSheet: new SpriteSheet(imgBloater, 4, 3),
            gladiatorSheet: new SpriteSheet(imgGladiator, 4, 3),
            hazmatSheet: new SpriteSheet(imgHazmat, 4, 3),
            fxSheet: new SpriteSheet(imgFx, 4, 3)
        };

        // Entities
        this.entities = {
            zombies: [],
            projectiles: [],
            explosions: [],
            particles: [],
            floatingTexts: [],
            shockwaves: [],
            ambientEmbers: [],
            acidPuddles: [],
            sporeClouds: []
        };

        this.time = 0;
        this.shakePower = 0;
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

        // Ambient Embers in atmosphere
        for (let i = 0; i < 25; i++) {
            this.entities.ambientEmbers.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: -10 - Math.random() * 15,
                vy: 8 + Math.random() * 14,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.5,
                hue: Math.random() > 0.4 ? '#ff6600' : '#ffaa00'
            });
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('pointerdown', () => {
            if (this.isGameOver) {
                this.reviveHero();
            }
        });
    }

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

    // Calculates the exact ground lane coordinates on the scenery road
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

        // The asphalt street lane in bg2.jpg is located at 77% of image height
        const laneY = drawY + drawH * 0.77;

        return { drawX, drawY, drawW, drawH, laneY };
    }

    getHeroPosition() {
        const metrics = this.getRoadMetrics();
        const heroX = Math.max(50, Math.round(this.canvas.width * 0.16));
        const heroY = Math.round(metrics.laneY);
        return { x: heroX, y: heroY };
    }

    triggerShake(amount = 6) {
        this.shakePower = Math.max(this.shakePower, amount);
    }

    resetBattle(enemyList = null) {
        this.entities.zombies = [];
        this.entities.projectiles = [];
        this.entities.explosions = [];
        this.entities.shockwaves = [];
        this.entities.floatingTexts = [];
        this.entities.acidPuddles = [];
        this.entities.sporeClouds = [];
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

        // Draw from the 5 selected map enemies!
        const pool = (this.activeEnemyTypes && this.activeEnemyTypes.length > 0)
            ? this.activeEnemyTypes
            : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);

        const enemyDef = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : { type: 'normal', scale: 0.50, speed: 38, hp: 80, attackInterval: 1.1, attackDamage: 7, name: 'Zumbi Punk' };

        const type = enemyDef.type || 'normal';
        const scale = enemyDef.scale || 0.50;
        const speed = (enemyDef.speed || 38) + (Math.random() * 8 - 4);
        const hp = enemyDef.hp || 80;
        const attackInterval = enemyDef.attackInterval || 1.1;
        const attackDamage = enemyDef.attackDamage || 7;
        const name = enemyDef.name || 'Zumbi';
        const badge = enemyDef.badge || '';
        const tint = enemyDef.tint || null;

        const laneOffset = (Math.random() - 0.5) * 18;

        this.entities.zombies.push({
            type: type,
            name: name,
            badge: badge,
            tint: tint,
            x: this.canvas.width + 50 + Math.random() * 40,
            y: metrics.laneY + laneOffset,
            speed: speed,
            scale: scale,
            hp: hp,
            maxHp: hp,
            frame: 0,
            walkTimer: Math.random() * 10,
            attackTimer: 0,
            isAttacking: false,
            attackInterval: attackInterval,
            attackCooldown: 0.3,
            attackDamage: attackDamage,
            attackSlot: Math.floor(Math.random() * 3), // Stagger stop positions
            flashTime: 0,
            active: true,

            // Leaper specific properties
            jumpState: 'ground', // 'ground', 'windup', 'leaping', 'landing'
            jumpTimer: 0,
            jumpDuration: 0.52,
            jumpStartX: 0,
            jumpTargetX: 0,
            jumpArcY: 0,
            hasJumped: false,

            // Soldier specific properties (Armored & Tactical Rush)
            armorBroken: false,
            isRushing: false,
            rushSpeed: speed * 1.9,

            // Spore specific properties (Regeneration & Spore Mist)
            sporeTimer: Math.random() * 1.5,

            // Bloater specific properties (Earthquake ground slam)
            slamCooldown: 3.5 + Math.random() * 2,
            isSlamming: false,
            slamProgress: 0,

            // Gladiator specific properties (Chain deflection & Iron punch)
            deflectChance: 0.35,

            // Hazmat specific properties (Acid puddles & Meltdown)
            puddleDropTimer: 1.8 + Math.random() * 1.0
        });
    }

    // Called by RhythmSystem when player hits notes
    launchAttack(isCrit = false, chordIndex = 0) {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();
        this.heroStrumAnim = 0.8;

        // Target nearest zombie on screen (prioritize attacking zombies crowding the hero)
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

        // Calculate dynamic damage using Talent Tree bonuses & Active Guitarist Passives
        const activeHero = this.getActiveHeroData();
        const baseBonus = window.talentSystem ? window.talentSystem.getStat('power_chord') : 0;
        const critBonus = window.talentSystem ? window.talentSystem.getStat('ferocious_solo') : 0;

        let heroDmgMult = 1.0;
        let heroSpeedMult = 1.0;
        let heroCritMultBonus = 0;
        let projColor = isCrit ? '#ff00ff' : '#00ffff';

        if (activeHero) {
            if (activeHero.id === 'johnny_blaze') {
                heroDmgMult = 1.15; // +15% Base Damage
                heroSpeedMult = 1.10; // +10% Projectile Speed
            } else if (activeHero.id === 'kragthor_titan') {
                heroCritMultBonus = 0.35; // +35% Crit Damage
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

        // Muzzle sonic blast
        this.entities.shockwaves.push({
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

        // Find nearest zombie on lane/screen
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

            // Floating mini tick damage (throttled)
            if (Math.random() > 0.45) {
                this.addFloatingText(`${tickDamage}`, target.x + (Math.random() - 0.5) * 16, target.y - 30, tickColor, false);
            }

            // Laser beam / electric sparks from guitar to zombie
            for (let i = 0; i < 4; i++) {
                const prog = Math.random();
                const sx = heroPos.x + 22 + (target.x - heroPos.x - 22) * prog;
                const sy = heroPos.y - 18 + ((target.y - 18) - (heroPos.y - 18)) * prog;
                this.entities.particles.push({
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

            if (target.hp <= 0) {
                target.active = false;
                this.zombiesKilled++;
                this.battleStats.zombiesKilled++;
                this.score += 150;
                this.addFloatingText("+KILL! ⚡", target.x, target.y - 42, tickColor, true);
            }
        } else {
            // Muzzle sparks
            this.entities.particles.push({
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

    createExplosion(x, y, isCrit = false) {
        this.triggerShake(isCrit ? 8 : 4);

        // Animated explosion (frames 8 to 11 of fxSheet)
        this.entities.explosions.push({
            x: x,
            y: y,
            frame: 8,
            maxFrame: 11.9,
            scale: isCrit ? 0.38 : 0.28,
            active: true
        });

        // Radial Shockwave
        this.entities.shockwaves.push({
            x: x,
            y: y,
            radius: 4,
            maxRadius: isCrit ? 36 : 24,
            color: isCrit ? '#ff0055' : '#00f0ff',
            lineWidth: 3,
            alpha: 1.0
        });

        // Particle Burst
        const particleCount = isCrit ? 16 : 10;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 110;
            this.entities.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                color: isCrit 
                    ? (Math.random() > 0.5 ? '#ff00ff' : '#ffff00')
                    : (Math.random() > 0.5 ? '#00ffff' : '#ff0099'),
                size: 1.5 + Math.random() * 2,
                life: 0.45,
                maxLife: 0.45
            });
        }

        if (window.soundEngine) {
            window.soundEngine.playHit();
            if (isCrit) window.soundEngine.playExplosion();
        }
    }

    // Special Mutant Death Event: Massive Radioactive Soundblast!
    triggerMutantBlast(x, y) {
        this.triggerShake(14);

        // Huge Radioactive Shockwave across the road
        this.entities.shockwaves.push({
            x: x,
            y: y,
            radius: 8,
            maxRadius: 180,
            color: '#39ff14',
            lineWidth: 6,
            alpha: 1.0
        });

        // Massive radioactive particle burst
        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 200;
            this.entities.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 25,
                color: Math.random() > 0.4 ? '#39ff14' : '#00ffff',
                size: 2.5 + Math.random() * 3,
                life: 0.65,
                maxLife: 0.65
            });
        }

        // Damage and knock back ALL other zombies on the street!
        this.entities.zombies.forEach(other => {
            if (other.active) {
                other.hp -= 70;
                other.x += 24; // Push back horde
                other.flashTime = 0.2;
                this.addFloatingText("-70 ☢️", other.x, other.y - 35, '#39ff14', true);

                if (other.hp <= 0) {
                    other.active = false;
                    this.zombiesKilled++;
                    this.score += 200;
                }
            }
        });

        this.addFloatingText("☢️ MUTANT OVERLOAD! ☢️", x, y - 55, '#39ff14', true);
        this.score += 600;
        this.rockPower = Math.min(100, this.rockPower + 35);

        if (window.soundEngine) {
            window.soundEngine.playExplosion();
        }
    }

    triggerSporeBurst(x, y) {
        this.entities.shockwaves.push({
            x: x, y: y,
            radius: 8, maxRadius: 90,
            color: '#ff9900', lineWidth: 4, alpha: 1.0
        });

        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 120;
            this.entities.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                color: Math.random() > 0.4 ? '#ff9900' : '#ffff66',
                size: 2.2 + Math.random() * 2,
                life: 0.5, maxLife: 0.5
            });
        }

        const heroPos = this.getHeroPosition();
        if (Math.abs(heroPos.x - x) < 130) {
            this.takeDamage(12, false, "-12 VENENO! 🍄", '#ff9900');
        }
    }

    triggerHazmatMeltdown(x, y) {
        this.triggerShake(7);
        this.entities.shockwaves.push({
            x: x, y: y,
            radius: 10, maxRadius: 130,
            color: '#39ff14', lineWidth: 5, alpha: 1.0
        });

        for (let i = 0; i < 28; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 160;
            this.entities.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                color: '#39ff14',
                size: 2.5 + Math.random() * 2,
                life: 0.55, maxLife: 0.55
            });
        }

        // Spawn lingering acid puddle
        this.entities.acidPuddles.push({
            x: x, y: y + 4,
            width: 46, life: 6.5, maxLife: 6.5, bubbleTimer: 0
        });

        this.entities.zombies.forEach(other => {
            if (other.active && Math.abs(other.x - x) < 110) {
                other.hp -= 40;
                other.flashTime = 0.2;
                this.addFloatingText("-40 🧪", other.x, other.y - 30, '#39ff14', false);
                if (other.hp <= 0) {
                    other.active = false;
                    this.zombiesKilled++;
                    this.score += 150;
                }
            }
        });

        if (window.soundEngine) window.soundEngine.playExplosion();
    }

    triggerBloaterGroundPound(z) {
        this.triggerShake(10);
        this.entities.shockwaves.push({
            x: z.x - 12, y: z.y + 4,
            radius: 10, maxRadius: 85,
            color: '#ffcc00', lineWidth: 5, alpha: 1.0
        });

        // Dust & asphalt chunks
        for (let i = 0; i < 18; i++) {
            this.entities.particles.push({
                x: z.x - 12 + (Math.random() - 0.5) * 30,
                y: z.y + 2,
                vx: (Math.random() - 0.5) * 80,
                vy: -Math.random() * 45 - 15,
                color: Math.random() > 0.4 ? '#ffcc00' : '#666666',
                size: 2 + Math.random() * 2.5,
                life: 0.45, maxLife: 0.45
            });
        }

        // Destroys nearby player projectiles in mid-air!
        let deflected = 0;
        this.entities.projectiles.forEach(p => {
            if (p.active && Math.abs(p.x - z.x) < 90) {
                p.active = false;
                deflected++;
                this.createExplosion(p.x, p.y, false);
            }
        });
        if (deflected > 0) {
            this.addFloatingText(`💥 ANULOU ${deflected} NOTAS!`, z.x, z.y - 45, '#ffcc00', true);
        }

        // If hero is within earthquake range
        const heroPos = this.getHeroPosition();
        if (Math.abs(heroPos.x - z.x) < 170) {
            this.takeDamage(14, true, "-14 SISMO! 💥", '#ffaa00');
        }
    }

    addFloatingText(text, x, y, color = '#ffff00', isCrit = false) {
        this.entities.floatingTexts.push({
            text: text,
            x: x + (Math.random() - 0.5) * 16,
            y: y - 14,
            vy: -50,
            alpha: 1.0,
            scale: isCrit ? 1.3 : 0.95,
            color: color
        });
    }

    healHero(amount) {
        if (this.heroHp <= 0 || amount <= 0) return;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + amount);
        this.addFloatingText(`+${amount} HP 💚`, this.getHeroPosition().x, this.getHeroPosition().y - 45, '#00ff66', false);
    }

    takeDamage(rawDamage, isHeavy = false, label = '', color = '#ff2222') {
        if (this.isGameOver) return;
        const heroPos = this.getHeroPosition();

        // 1. Temporary immunity (Rock Never Dies)
        if (this.heroImmunityTimer > 0) {
            this.addFloatingText("⚡ IMUNE!", heroPos.x, heroPos.y - 35, '#ffcc00', false);
            return;
        }

        // 2. Shock Barrier Talent Check
        if (this.shockBarrierReady) {
            this.shockBarrierReady = false;
            const barrierCd = window.talentSystem ? window.talentSystem.getStat('shock_barrier') : 18;
            this.shockBarrierTimer = barrierCd;
            this.triggerShake(5);
            this.entities.shockwaves.push({
                x: heroPos.x, y: heroPos.y - 15,
                radius: 10, maxRadius: 55,
                color: '#00a2ff', lineWidth: 4, alpha: 1.0
            });
            this.addFloatingText("🛡️ BLOQUEADO!", heroPos.x, heroPos.y - 40, '#00a2ff', true);
            return;
        }

        // 3. Armor Damage Reduction
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
                
                this.entities.shockwaves.push({
                    x: other.x,
                    y: other.y + (other.jumpArcY || 0) - 15,
                    radius: 3,
                    maxRadius: 20,
                    color: '#00ffff',
                    lineWidth: 2.5,
                    alpha: 1.0
                });

                this.addFloatingText(`⚡ ${damage}`, other.x, other.y + (other.jumpArcY || 0) - 35, '#00ffff', false);

                if (other.hp <= 0) {
                    other.active = false;
                    this.zombiesKilled++;
                    this.score += 100;
                }

                hit++;
                if (hit >= targetCount) break;
            }
        }
    }

    reviveHero() {
        this.heroHp = this.heroMaxHp;
        this.isGameOver = false;
        this.entities.zombies = []; // Clear current horde on revive
        this.entities.projectiles = [];
        
        const rndBonus = window.talentSystem ? window.talentSystem.getStat('rock_never_dies') : 0;
        if (rndBonus > 0) {
            this.heroImmunityTimer = rndBonus;
            this.entities.shockwaves.push({
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

        if (this.shakePower > 0) {
            this.shakePower *= Math.pow(0.05, dt);
            if (this.shakePower < 0.2) this.shakePower = 0;
        }

        if (this.heroStrumAnim > 0) {
            this.heroStrumAnim -= 4 * dt;
            if (this.heroStrumAnim < 0) this.heroStrumAnim = 0;
        }

        if (this.heroFlashTime > 0) {
            this.heroFlashTime -= dt;
        }

        // Check Hero Defeat
        if (this.heroHp <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            this.triggerShake(12);
            this.addFloatingText("☠️ DERROTADO! ☠️", this.getHeroPosition().x, this.getHeroPosition().y - 50, '#ff2222', true);
        }

        // Spawn zombies from the right
        this.spawnTimer += dt;
        const targetSpawnInterval = Math.max(1.4, 3.2 - (this.zombiesKilled * 0.05));
        if (this.spawnTimer >= targetSpawnInterval) {
            this.spawnTimer = 0;
            this.spawnZombie();
        }

        const heroPos = this.getHeroPosition();

        // Update talent-based barrier and immunity timers
        const barrierCd = window.talentSystem ? window.talentSystem.getStat('shock_barrier') : 0;
        if (barrierCd > 0) {
            if (!this.shockBarrierReady) {
                this.shockBarrierTimer -= dt;
                if (this.shockBarrierTimer <= 0) {
                    this.shockBarrierReady = true;
                    this.shockBarrierTimer = barrierCd;
                    this.triggerShake(3);
                    this.entities.shockwaves.push({
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

        // Update Zombies (Move LEFT towards Hero, with Leap State Machine and persistent attack)
        this.entities.zombies.forEach(z => {
            if (z.flashTime > 0) z.flashTime -= dt;

            // Vulkan Ironhead Burning Passive Tick
            if (z.burnTimer > 0) {
                z.burnTimer -= dt;
                z.burnTick = (z.burnTick || 0) + dt;
                if (z.burnTick >= 0.5) {
                    z.burnTick = 0;
                    z.hp -= 7;
                    z.flashTime = 0.08;
                    this.battleStats.damageDealt += 7;
                    this.addFloatingText("-7 🔥", z.x, z.y - 30, '#ff4400', false);
                    this.entities.particles.push({
                        x: z.x + (Math.random() - 0.5) * 16,
                        y: z.y - 15,
                        vx: (Math.random() - 0.5) * 20,
                        vy: -Math.random() * 30 - 10,
                        color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00',
                        size: 2,
                        life: 0.3,
                        maxLife: 0.3
                    });
                    if (z.hp <= 0 && z.active) {
                        z.active = false;
                        this.zombiesKilled++;
                        this.battleStats.zombiesKilled++;
                        this.score += 100;
                        this.addFloatingText("+BURN KILL! 🔥", z.x, z.y - 40, '#ff5500', true);
                    }
                }
            }

            const attackDistance = heroPos.x + 28 + (z.attackSlot * 12);

            // Special logic for Feral Leaper
            if (z.type === 'leaper') {
                if (z.jumpState === 'ground') {
                    const distToHero = z.x - heroPos.x;
                    // Trigger leap when approaching between 110px and 160px from the hero
                    if (distToHero > 105 && distToHero < 165 && !z.hasJumped) {
                        z.jumpState = 'windup';
                        z.jumpTimer = 0.22;
                        z.frame = 5; // Deep crouch windup
                    } else if (z.x > attackDistance) {
                        // Galloping sprint on all fours (Frames 0, 1, 2, 3)
                        z.x -= z.speed * dt;
                        z.walkTimer += dt * 13;
                        z.isAttacking = false;
                        z.frame = Math.floor(z.walkTimer) % 4;
                    } else {
                        // Reached hero: Attack!
                        z.x = attackDistance;
                        z.isAttacking = true;
                    }
                } else if (z.jumpState === 'windup') {
                    z.frame = 5; // Deep crouch
                    z.jumpTimer -= dt;
                    if (z.jumpTimer <= 0) {
                        z.jumpState = 'leaping';
                        z.jumpTimer = 0;
                        z.jumpStartX = z.x;
                        z.jumpTargetX = attackDistance;

                        // Dust puff at takeoff
                        for (let i = 0; i < 6; i++) {
                            this.entities.particles.push({
                                x: z.x, y: z.y + 2,
                                vx: (Math.random() - 0.5) * 40 + 20, vy: -Math.random() * 25,
                                color: '#aaaaaa', size: 2, life: 0.3, maxLife: 0.3
                            });
                        }
                    }
                } else if (z.jumpState === 'leaping') {
                    z.jumpTimer += dt;
                    const progress = Math.min(1.0, z.jumpTimer / z.jumpDuration);
                    z.x = z.jumpStartX + (z.jumpTargetX - z.jumpStartX) * progress;
                    
                    // Parabolic arc leaping high over the asphalt!
                    z.jumpArcY = -Math.sin(progress * Math.PI) * 58;

                    // Mid-air frames: 6 on takeoff, 7 at apex diving
                    z.frame = progress < 0.35 ? 6 : 7;

                    if (progress >= 1.0) {
                        // Impact landing!
                        z.jumpState = 'landing';
                        z.jumpTimer = 0.12;
                        z.jumpArcY = 0;
                        z.x = z.jumpTargetX;
                        z.hasJumped = true;
                        z.frame = 10; // Crouched impact on road
                        this.triggerShake(4);

                        // Dust burst on landing
                        for (let i = 0; i < 8; i++) {
                            this.entities.particles.push({
                                x: z.x, y: z.y + 2,
                                vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 25,
                                color: '#888888', size: 2, life: 0.35, maxLife: 0.35
                            });
                        }
                    }
                } else if (z.jumpState === 'landing') {
                    z.frame = 10;
                    z.jumpTimer -= dt;
                    if (z.jumpTimer <= 0) {
                        z.jumpState = 'ground';
                        z.isAttacking = true;
                    }
                }

                // If in attack range (post-jump or normal close combat)
                if (z.isAttacking) {
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;

                    // Rapid claw slashes: alternate frames 8 & 9
                    z.frame = 8 + (Math.floor(z.attackTimer * 7.5) % 2);

                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.takeDamage(z.attackDamage, false, `-${z.attackDamage} SLASH!`, '#ff9900');
                    }
                }
            } else if (z.type === 'soldier') {
                // Soldier: Tactical Rush below 50% HP
                if (!z.armorBroken && z.hp < z.maxHp * 0.5 && !z.isRushing) {
                    z.isRushing = true;
                    z.speed = z.rushSpeed;
                    this.addFloatingText("⚡ CARGA TÁTICA!", z.x, z.y - 35, '#ff3344', true);
                    this.triggerShake(3);
                }

                if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.isAttacking = false;
                    if (z.isRushing) {
                        z.walkTimer += dt * 12;
                        z.frame = 8 + (Math.floor(z.walkTimer) % 4); // Dash sprint frames 8-11
                    } else {
                        z.walkTimer += dt * 6.5;
                        z.frame = Math.floor(z.walkTimer) % 4; // March frames 0-3
                    }
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;
                    z.frame = 4 + (Math.floor(z.attackTimer * 6) % 4); // Combat claw/bayonet frames 4-7
                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.takeDamage(z.attackDamage, false, `-${z.attackDamage} CORONHADA!`, '#ff3344');
                    }
                }
            } else if (z.type === 'spore') {
                // Spore: Fungal Mist & Ally Regeneration
                z.sporeTimer += dt;
                if (z.sporeTimer > 1.3) {
                    z.sporeTimer = 0;
                    this.entities.particles.push({
                        x: z.x + (Math.random() - 0.5) * 20,
                        y: z.y - 15 + (Math.random() - 0.5) * 15,
                        vx: -15 - Math.random() * 15,
                        vy: -Math.random() * 20 - 5,
                        color: Math.random() > 0.5 ? '#ffaa00' : '#39ff14',
                        size: 2, life: 0.6, maxLife: 0.6
                    });
                    this.entities.zombies.forEach(other => {
                        if (other.active && other !== z && Math.abs(other.x - z.x) < 85 && other.hp < other.maxHp) {
                            other.hp = Math.min(other.maxHp, other.hp + 12);
                            this.addFloatingText("+12 HP 🍄", other.x, other.y - 25, '#39ff14', false);
                        }
                    });
                }

                if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.walkTimer += dt * 6.0;
                    z.isAttacking = false;
                    z.frame = Math.floor(z.walkTimer) % 4; // Shambling frames 0-3
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;
                    z.frame = 8 + (Math.floor(z.attackTimer * 6) % 4); // Virulent slash frames 8-11
                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.takeDamage(z.attackDamage, false, `-${z.attackDamage} ESPOROS!`, '#ffaa00');
                    }
                }
            } else if (z.type === 'bloater') {
                // Bloater: Ground Pound Slam
                if (!z.isAttacking && z.x > attackDistance + 35) {
                    z.slamCooldown -= dt;
                    if (z.slamCooldown <= 0 && !z.isSlamming) {
                        z.isSlamming = true;
                        z.slamProgress = 0;
                        z.slamCooldown = 5.0;
                    }
                }

                if (z.isSlamming) {
                    z.slamProgress += dt;
                    if (z.slamProgress < 0.4) {
                        z.frame = 4 + Math.floor(z.slamProgress * 7.5); // Windup frames 4-7
                    } else if (z.slamProgress < 0.8) {
                        z.frame = 8 + Math.floor((z.slamProgress - 0.4) * 7.5); // Slam frames 8-10
                    } else {
                        this.triggerBloaterGroundPound(z);
                        z.isSlamming = false;
                    }
                } else if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.walkTimer += dt * 5.0;
                    z.isAttacking = false;
                    z.frame = Math.floor(z.walkTimer) % 4; // Waddle frames 0-3
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;
                    z.frame = 8 + (Math.floor(z.attackTimer * 5.5) % 4); // Smash frames 8-11
                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.triggerShake(5);
                        this.takeDamage(z.attackDamage, true, `-${z.attackDamage} ESMAGAR!`, '#ffaa00');
                    }
                }
            } else if (z.type === 'gladiator') {
                // Gladiator: Chained Brawler
                if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.walkTimer += dt * 7.0;
                    z.isAttacking = false;
                    z.frame = Math.floor(z.walkTimer) % 4; // Stride frames 0-3
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;
                    z.frame = 8 + (Math.floor(z.attackTimer * 6.5) % 4); // Piston punch frames 8-11
                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.triggerShake(4);
                        this.takeDamage(z.attackDamage, true, `-${z.attackDamage} SOCO DE AÇO!`, '#ff3333');
                    }
                }
            } else if (z.type === 'hazmat') {
                // Hazmat: Toxic Slime Puddles
                z.puddleDropTimer -= dt;
                if (z.puddleDropTimer <= 0 && z.x > attackDistance + 25) {
                    z.puddleDropTimer = 2.4;
                    this.entities.acidPuddles.push({
                        x: z.x + 8,
                        y: z.y + 4,
                        width: 38,
                        life: 6.0,
                        maxLife: 6.0,
                        bubbleTimer: 0
                    });
                }

                if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.walkTimer += dt * 6.2;
                    z.isAttacking = false;
                    z.frame = Math.floor(z.walkTimer) % 4; // Hazmat walk frames 0-3
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;
                    z.frame = 8 + (Math.floor(z.attackTimer * 6.0) % 4); // Acid reach frames 8-11
                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        this.takeDamage(z.attackDamage, false, `-${z.attackDamage} RADIAÇÃO!`, '#39ff14');
                    }
                }
            } else {
                // Logic for Normal, Runner & Mutant
                if (z.x > attackDistance) {
                    z.x -= z.speed * dt;
                    z.walkTimer += dt * (z.speed / 36) * 7.5;
                    z.isAttacking = false;
                    z.frame = Math.floor(z.walkTimer) % 8;
                } else {
                    z.x = attackDistance;
                    z.isAttacking = true;
                    z.attackTimer += dt;
                    z.attackCooldown -= dt;

                    const animSpeed = z.type === 'mutant' ? 5 : 6.5;
                    z.frame = 8 + (Math.floor(z.attackTimer * animSpeed) % 4);

                    if (z.attackCooldown <= 0 && !this.isGameOver) {
                        z.attackCooldown = z.attackInterval;
                        if (z.type === 'mutant') {
                            this.entities.shockwaves.push({
                                x: z.x - 8, y: z.y + 2,
                                radius: 3, maxRadius: 28,
                                color: '#39ff14', lineWidth: 3, alpha: 1.0
                            });
                            this.takeDamage(z.attackDamage, true, `-${z.attackDamage} CRUSH!`, '#ff3300');
                        } else {
                            this.takeDamage(z.attackDamage, false, `-${z.attackDamage} HP`, '#ff2222');
                        }
                    }
                }
            }
        });

        // Update Projectiles (Fired ONLY on note hits)
        this.entities.projectiles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.frame = 3 + (Math.floor(this.time / 90) % 4);

            p.trailTimer += dt;
            if (p.trailTimer > 0.03) {
                p.trailTimer = 0;
                this.entities.particles.push({
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

            // Check Acid Puddles slow & dissolve
            for (const puddle of this.entities.acidPuddles) {
                if (Math.abs(p.x - puddle.x) < puddle.width / 2) {
                    p.damage = Math.max(8, Math.round(p.damage * 0.985));
                }
            }

            // Check collision with zombies (including mid-air leaper snipes!)
            for (const z of this.entities.zombies) {
                const currentY = z.y + (z.jumpArcY || 0);
                const hitRadius = (z.type === 'mutant' || z.type === 'bloater') ? 34 : 22;
                if (z.active && Math.abs(p.x - z.x) < hitRadius && Math.abs(p.y - (currentY - 15)) < 26) {
                    // Check Gladiator Chain Deflection
                    if (z.type === 'gladiator' && !p.isCrit && Math.random() < z.deflectChance) {
                        p.active = false;
                        this.addFloatingText("🛡️ CORRENTE DEFLETIU!", z.x, currentY - 34, '#ff3333', true);
                        this.triggerShake(2);
                        for (let i = 0; i < 7; i++) {
                            this.entities.particles.push({
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

                    // Dr. Radix Passive: Acoustic Radiation slows horde by 15%
                    if (heroId === 'dr_radix') {
                        z.speed = Math.max(12, z.speed * 0.85);
                    }

                    // Soldier Kevlar Armor Check
                    if (z.type === 'soldier' && !z.armorBroken) {
                        if (p.isCrit) {
                            z.armorBroken = true;
                            this.addFloatingText("🛡️ CAPACETE QUEBRADO! STUN!", z.x, currentY - 45, '#ffff00', true);
                            this.triggerShake(6);
                            for (let i = 0; i < 8; i++) {
                                this.entities.particles.push({
                                    x: z.x, y: currentY - 20,
                                    vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 40,
                                    color: '#8899aa', size: 2.5, life: 0.35, maxLife: 0.35
                                });
                            }
                        } else {
                            // Dr. Radix ignores 50% ballistic armor (80% dmg instead of 55%)
                            const armorReduction = heroId === 'dr_radix' ? 0.80 : 0.55;
                            p.damage = Math.round(p.damage * armorReduction);
                            this.addFloatingText(heroId === 'dr_radix' ? "BLINDADO PENETRADO! ☢️" : "BLINDADO! -45%", z.x, currentY - 34, '#88aacc', false);
                        }
                    }

                    // Vulkan Ironhead Passive: Brutal Pyrotechnics (35% burn chance)
                    if (heroId === 'vulkan_ironhead' && Math.random() < 0.35) {
                        z.burnTimer = 3.0;
                        z.burnTick = 0;
                        this.addFloatingText("🔥 QUEIMANDO!", z.x, currentY - 48, '#ff5500', true);
                    }

                    // Knockback bonus from talent & Kragthor Titan Passive (+60% knockback)
                    let knockMult = 1.0 + (window.talentSystem ? window.talentSystem.getStat('sonic_knockback') : 0);
                    if (heroId === 'kragthor_titan') {
                        knockMult *= 1.6;
                    }

                    // AIR SHOT MECHANIC: Snipe leaper out of mid-air!
                    let isAirShot = false;
                    if (z.type === 'leaper' && z.jumpState === 'leaping') {
                        isAirShot = true;
                        z.jumpState = 'ground';
                        z.jumpArcY = 0;
                        z.hasJumped = true;
                        z.x += 35 * knockMult; // Huge knockback
                        p.isCrit = true;
                        const airBonus = window.talentSystem ? window.talentSystem.getStat('air_sniper') : 0;
                        p.damage = Math.round(p.damage * (1.8 + airBonus));
                        this.addFloatingText("🎯 AIR SHOT! CRIT!", z.x, currentY - 45, '#ffcc00', true);
                        this.triggerShake(7);
                    } else if (z.type === 'bloater') {
                        z.x += 2 * knockMult; // High mass resistance
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

                    // Fuzz Lightning Talent & Cypher Volt Bionic Overdrive: Chain lightning on crits
                    if (p.isCrit) {
                        let chainTargets = window.talentSystem ? window.talentSystem.getStat('fuzz_lightning') : 0;
                        if (heroId === 'cypher_volt') {
                            chainTargets = Math.max(chainTargets, 2); // Guaranteed 2 chain targets
                        }
                        if (chainTargets > 0) {
                            const chainDmg = Math.max(16, Math.round(p.damage * 0.45));
                            this.triggerChainLightning(z, chainTargets, chainDmg);
                        }
                    }

                    if (z.hp <= 0) {
                        z.active = false;
                        this.zombiesKilled++;
                        this.battleStats.zombiesKilled++;

                        // Gold drop with Palheta Dourada & Roxie Anarchy bonus (+25% Gold)
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
                        this.addFloatingText(`+${earnedGold} 🪙`, z.x, currentY - 58, '#ffd700', false);

                        if (z.type === 'mutant') {
                            this.triggerMutantBlast(z.x, z.y);
                        } else if (z.type === 'spore') {
                            this.triggerSporeBurst(z.x, z.y);
                            this.score += p.isCrit ? 260 : 130;
                            this.rockPower = Math.min(100, this.rockPower + 10);
                            this.addFloatingText("+KILL! 🍄", z.x, currentY - 42, '#ffaa00', true);
                        } else if (z.type === 'hazmat') {
                            this.triggerHazmatMeltdown(z.x, z.y);
                            this.score += p.isCrit ? 280 : 140;
                            this.rockPower = Math.min(100, this.rockPower + 12);
                            this.addFloatingText("+KILL! ☢️", z.x, currentY - 42, '#39ff14', true);
                        } else {
                            this.score += p.isCrit ? 250 : 120;
                            this.rockPower = Math.min(100, this.rockPower + (z.type === 'leaper' ? 12 : 8));
                            this.addFloatingText("+KILL!", z.x, currentY - 42, '#00ff66', true);
                        }
                    }
                    break;
                }
            }

            if (p.x > this.canvas.width + 80 || p.x < -60) p.active = false;
        });

        // Update Explosions
        this.entities.explosions.forEach(ex => {
            ex.frame += 16 * dt;
            if (ex.frame > ex.maxFrame) ex.active = false;
        });

        // Update Shockwaves
        this.entities.shockwaves.forEach(sw => {
            sw.radius += (sw.maxRadius - sw.radius) * (14 * dt);
            sw.alpha -= 2.8 * dt;
        });

        // Update Particles
        this.entities.particles.forEach(pt => {
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vy += 60 * dt;
            pt.life -= dt;
        });

        // Update Floating Text
        this.entities.floatingTexts.forEach(ft => {
            ft.y += ft.vy * dt;
            ft.alpha -= 1.5 * dt;
        });

        // Update Ambient Embers
        this.entities.ambientEmbers.forEach(em => {
            em.x += em.vx * dt;
            em.y += em.vy * dt;
            if (em.x < -20) em.x = this.canvas.width + 20;
            if (em.y > this.canvas.height) em.y = -10;
        });

        // Update Acid Puddles
        this.entities.acidPuddles.forEach(puddle => {
            puddle.life -= dt;
            puddle.bubbleTimer += dt;
            if (puddle.bubbleTimer > 0.18) {
                puddle.bubbleTimer = 0;
                this.entities.particles.push({
                    x: puddle.x + (Math.random() - 0.5) * puddle.width,
                    y: puddle.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 20 - 5,
                    color: '#39ff14',
                    size: 1.5 + Math.random() * 1.5,
                    life: 0.35,
                    maxLife: 0.35
                });
            }
        });

        // Clean dead entities
        this.entities.zombies = this.entities.zombies.filter(z => z.active);
        this.entities.projectiles = this.entities.projectiles.filter(p => p.active);
        this.entities.explosions = this.entities.explosions.filter(ex => ex.active);
        this.entities.shockwaves = this.entities.shockwaves.filter(sw => sw.alpha > 0);
        this.entities.particles = this.entities.particles.filter(pt => pt.life > 0);
        this.entities.floatingTexts = this.entities.floatingTexts.filter(ft => ft.alpha > 0);
        this.entities.acidPuddles = this.entities.acidPuddles.filter(p => p.life > 0);
    }

    draw() {
        if (!this.canvas || this.canvas.width <= 10 || this.canvas.height <= 10) {
            this.resize();
            if (!this.canvas || this.canvas.width <= 10 || this.canvas.height <= 10) return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        if (this.shakePower > 0) {
            const rx = (Math.random() - 0.5) * this.shakePower * 2;
            const ry = (Math.random() - 0.5) * this.shakePower * 2;
            this.ctx.translate(rx, ry);
        }

        // 1. Draw Background (Zoomed out & aligned)
        this.drawBackground();

        // 2. Draw Embers
        this.drawAmbientEmbers();

        // 3. Draw Hero Ground Shadow & Amp
        const heroPos = this.getHeroPosition();
        this.drawAmpAndShadow(heroPos.x, heroPos.y);

        // 3.5. Draw Acid Puddles on the asphalt road
        this.entities.acidPuddles.forEach(puddle => {
            const alpha = Math.min(0.85, puddle.life / (puddle.maxLife || 6.0));
            this.ctx.save();
            this.ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.42})`;
            this.ctx.beginPath();
            this.ctx.ellipse(puddle.x, puddle.y, puddle.width / 2, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner radioactive rim
            this.ctx.strokeStyle = `rgba(180, 255, 100, ${alpha * 0.7})`;
            this.ctx.lineWidth = 1.2;
            this.ctx.stroke();
            this.ctx.restore();
        });

        // 4. Sort and Draw Zombies (Y-depth sorting, accounting for jump height)
        const sortedZombies = [...this.entities.zombies].sort((a, b) => {
            const ay = a.y + (a.jumpArcY || 0);
            const by = b.y + (b.jumpArcY || 0);
            return ay - by;
        });

        sortedZombies.forEach(z => {
            const currentY = z.y + (z.jumpArcY || 0);

            // Ground Shadow: stays on the road even when leaping!
            const airHeight = Math.abs(z.jumpArcY || 0);
            const shadowFade = Math.max(0.12, 0.45 - (airHeight / 110));
            const shadowMult = (z.type === 'mutant' || z.type === 'bloater' ? 1.3 : (z.scale / 0.5)) * Math.max(0.55, 1 - (airHeight / 95));

            this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowFade})`;
            this.ctx.beginPath();
            this.ctx.ellipse(z.x, z.y + 2, 16 * shadowMult, 5 * shadowMult, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Select sheet and vertical alignment offset
            let sheet = this.assets.zombieSheet;
            let yOffset = 12;

            if (z.type === 'mutant') {
                sheet = this.assets.mutantSheet;
                yOffset = 14;
            } else if (z.type === 'leaper') {
                sheet = this.assets.leaperSheet;
                yOffset = 12;
            } else if (z.type === 'soldier') {
                sheet = this.assets.soldierSheet;
                yOffset = 12;
            } else if (z.type === 'spore') {
                sheet = this.assets.sporeSheet;
                yOffset = 12;
            } else if (z.type === 'bloater') {
                sheet = this.assets.bloaterSheet;
                yOffset = 14;
            } else if (z.type === 'gladiator') {
                sheet = this.assets.gladiatorSheet;
                yOffset = 13;
            } else if (z.type === 'hazmat') {
                sheet = this.assets.hazmatSheet;
                yOffset = 12;
            }

            // Draw Zombie Sprite (FLIPPED so facing hero on the left)
            sheet.drawFrame(
                this.ctx,
                z.frame,
                z.x,
                currentY - yOffset,
                z.scale,
                true, // Flip horizontally
                z.flashTime > 0
            );

            // Mini Health bar
            const isSpecial = z.type === 'mutant' || z.type === 'leaper' || z.type === 'soldier' || z.type === 'spore' || z.type === 'bloater' || z.type === 'gladiator' || z.type === 'hazmat';
            if (z.hp < z.maxHp || isSpecial) {
                const bw = (z.type === 'mutant' || z.type === 'bloater') ? 34 : (24 * (z.scale / 0.5));
                const bh = (z.type === 'mutant' || z.type === 'bloater') ? 4 : 3.5;
                const bx = z.x - bw / 2;
                const by = currentY - ((z.type === 'mutant' || z.type === 'bloater') ? 52 : (42 * (z.scale / 0.5)));
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                this.ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

                let barColor = '#00ff66';
                if (z.type === 'mutant') barColor = '#39ff14';
                else if (z.type === 'leaper') barColor = '#ff9900';
                else if (z.type === 'soldier') barColor = '#ff4455';
                else if (z.type === 'spore') barColor = '#ffaa00';
                else if (z.type === 'bloater') barColor = '#ffcc00';
                else if (z.type === 'gladiator') barColor = '#ff3333';
                else if (z.type === 'hazmat') barColor = '#39ff14';

                this.ctx.fillStyle = barColor;
                this.ctx.fillRect(bx, by, Math.max(0, bw * (z.hp / z.maxHp)), bh);

                this.ctx.save();
                this.ctx.font = "bold 8px 'Segoe UI', sans-serif";
                let nameColor = '#ffffff';
                if (z.type === 'mutant') nameColor = '#39ff14';
                else if (z.type === 'leaper') nameColor = '#ff9900';
                else if (z.type === 'soldier') nameColor = '#ff4455';
                else if (z.type === 'spore') nameColor = '#ffaa00';
                else if (z.type === 'bloater') nameColor = '#ffcc00';
                else if (z.type === 'gladiator') nameColor = '#ff5533';
                else if (z.type === 'hazmat') nameColor = '#39ff14';

                this.ctx.fillStyle = nameColor;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(z.name || "ZUMBI", z.x, by - 2);
                this.ctx.restore();
            }
        });

        // 5. Draw Hero (Left Side, facing Right, grounded on street lane)
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

        // Hero Name Tag above hero head
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

        // Electric aura if rock power is high
        if (this.rockPower > 30) {
            this.drawElectricAura(heroPos.x + 10, heroPos.y - 18);
        }

        // Draw Shock Barrier if ready
        if (this.shockBarrierReady) {
            this.drawShockBarrier(heroPos.x + 4, heroPos.y - 16);
        }

        // Draw Rock Never Dies Immunity Aura if active
        if (this.heroImmunityTimer > 0) {
            this.drawImmunityAura(heroPos.x + 4, heroPos.y - 16);
        }

        // 6. Draw Projectiles (Compact, sharp sonic note bullets)
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

        // 7. Draw Explosions
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.entities.explosions.forEach(ex => {
            this.assets.fxSheet.drawFrame(
                this.ctx,
                ex.frame,
                ex.x,
                ex.y,
                ex.scale,
                false
            );
        });
        this.ctx.restore();

        // 8. Draw Shockwaves
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.entities.shockwaves.forEach(sw => {
            this.ctx.save();
            this.ctx.strokeStyle = sw.color;
            this.ctx.lineWidth = sw.lineWidth;
            this.ctx.globalAlpha = Math.max(0, sw.alpha);
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });

        // 9. Particles
        this.entities.particles.forEach(pt => {
            this.ctx.save();
            this.ctx.fillStyle = pt.color;
            this.ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        this.ctx.restore();

        // 10. Floating Combat Text
        this.entities.floatingTexts.forEach(ft => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Impact', sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(ft.text, ft.x, ft.y);
            this.ctx.fillStyle = ft.color;
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        });

        // 11. Vignette
        this.drawVignette();

        // 12. Game Over Overlay
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
        // Hero Ground Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        this.ctx.beginPath();
        this.ctx.ellipse(heroX, heroY + 2, 16, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Mini Rocker Amplifier Stack behind the hero
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

    drawElectricAura(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        let curX = x;
        let curY = y;
        for (let i = 0; i < 4; i++) {
            curX += (Math.random() - 0.5) * 12;
            curY += (Math.random() - 0.5) * 12;
            this.ctx.lineTo(curX, curY);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawAmbientEmbers() {
        this.ctx.save();
        this.entities.ambientEmbers.forEach(em => {
            this.ctx.fillStyle = em.hue;
            this.ctx.globalAlpha = em.alpha;
            this.ctx.beginPath();
            this.ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    drawVignette() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        if (cw <= 10 || ch <= 10) return;
        const r0 = Math.max(1, cw * 0.4);
        const r1 = Math.max(2, cw * 0.9);
        const grad = this.ctx.createRadialGradient(
            cw / 2, ch / 2, r0,
            cw / 2, ch / 2, r1
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, cw, ch);
    }

    drawShockBarrier(x, y) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        const pulse = Math.sin(this.time / 120) * 3;
        const radius = 28 + pulse;

        // Glowing outer shield arc in front of the hero
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, -Math.PI * 0.45, Math.PI * 0.45);
        this.ctx.strokeStyle = '#00a2ff';
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();

        // Inner harmonic resonance arc
        this.ctx.beginPath();
        this.ctx.arc(x, y, Math.max(10, radius - 6), -Math.PI * 0.35, Math.PI * 0.35);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1.8;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawImmunityAura(x, y) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        const pulse = (Math.sin(this.time / 90) + 1) * 0.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 32 + pulse * 6, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(255, 204, 0, ${0.4 + pulse * 0.5})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#ffcc00';
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.restore();
    }
}
