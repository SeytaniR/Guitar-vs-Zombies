// Polymorphic Zombie Entity Class (Encapsulates AI, Animations, States, and Rendering for All 8 Archetypes)
class ZombieEntity {
    constructor(enemyDef, laneY, canvasWidth) {
        this.type = enemyDef.type || 'normal';
        this.name = enemyDef.name || 'Zumbi';
        this.badge = enemyDef.badge || '';
        this.tint = enemyDef.tint || null;
        this.scale = enemyDef.scale || 0.50;

        const baseSpeed = enemyDef.speed || 38;
        this.speed = baseSpeed + (Math.random() * 8 - 4);

        const hp = enemyDef.hp || 80;
        this.hp = hp;
        this.maxHp = hp;

        this.attackInterval = enemyDef.attackInterval || 1.1;
        this.attackDamage = enemyDef.attackDamage || 7;
        this.attackCooldown = 0.3;
        this.attackTimer = 0;
        this.isAttacking = false;
        this.attackSlot = Math.floor(Math.random() * 3); // Stagger stopping positions

        const laneOffset = (Math.random() - 0.5) * 18;
        this.x = canvasWidth + 50 + Math.random() * 40;
        this.y = laneY + laneOffset;

        this.frame = 0;
        this.walkTimer = Math.random() * 10;
        this.flashTime = 0;
        this.active = true;

        // Vulkan Ironhead Burn Status
        this.burnTimer = 0;
        this.burnTick = 0;

        // Archetype: Leaper
        this.jumpState = 'ground'; // 'ground', 'windup', 'leaping', 'landing'
        this.jumpTimer = 0;
        this.jumpDuration = 0.52;
        this.jumpStartX = 0;
        this.jumpTargetX = 0;
        this.jumpArcY = 0;
        this.hasJumped = false;

        // Archetype: Soldier
        this.armorBroken = false;
        this.isRushing = false;
        this.rushSpeed = this.speed * 1.9;

        // Archetype: Spore
        this.sporeTimer = Math.random() * 1.5;

        // Archetype: Bloater
        this.slamCooldown = 3.5 + Math.random() * 2;
        this.isSlamming = false;
        this.slamProgress = 0;

        // Archetype: Gladiator
        this.deflectChance = 0.35;

        // Archetype: Hazmat
        this.puddleDropTimer = 1.8 + Math.random() * 1.0;
    }

    update(dt, combat) {
        if (this.flashTime > 0) this.flashTime -= dt;

        // Burn Status Processing (Vulkan Ironhead passive)
        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            this.burnTick += dt;
            if (this.burnTick >= 0.5) {
                this.burnTick = 0;
                this.hp -= 7;
                this.flashTime = 0.08;
                combat.battleStats.damageDealt += 7;
                combat.addFloatingText("-7 🔥", this.x, this.y - 30, '#ff4400', false);

                combat.fx.particles.push({
                    x: this.x + (Math.random() - 0.5) * 16,
                    y: this.y - 15,
                    vx: (Math.random() - 0.5) * 20,
                    vy: -Math.random() * 30 - 10,
                    color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00',
                    size: 2,
                    life: 0.3,
                    maxLife: 0.3
                });

                if (this.hp <= 0 && this.active) {
                    this.active = false;
                    combat.onZombieKilled(this, 100, "+BURN KILL! 🔥", '#ff5500');
                    return;
                }
            }
        }

        const heroPos = combat.getHeroPosition();
        const attackDistance = heroPos.x + 28 + (this.attackSlot * 12);

        switch (this.type) {
            case 'leaper':
                this.updateLeaper(dt, combat, heroPos, attackDistance);
                break;
            case 'soldier':
                this.updateSoldier(dt, combat, attackDistance);
                break;
            case 'spore':
                this.updateSpore(dt, combat, attackDistance);
                break;
            case 'bloater':
                this.updateBloater(dt, combat, attackDistance);
                break;
            case 'gladiator':
                this.updateGladiator(dt, combat, attackDistance);
                break;
            case 'hazmat':
                this.updateHazmat(dt, combat, attackDistance);
                break;
            default:
                this.updateStandard(dt, combat, attackDistance);
                break;
        }
    }

    updateLeaper(dt, combat, heroPos, attackDistance) {
        if (this.jumpState === 'ground') {
            const distToHero = this.x - heroPos.x;
            if (distToHero > 105 && distToHero < 165 && !this.hasJumped) {
                this.jumpState = 'windup';
                this.jumpTimer = 0.22;
                this.frame = 5; // Deep crouch windup
            } else if (this.x > attackDistance) {
                this.x -= this.speed * dt;
                this.walkTimer += dt * 13;
                this.isAttacking = false;
                this.frame = Math.floor(this.walkTimer) % 4; // Gallop
            } else {
                this.x = attackDistance;
                this.isAttacking = true;
            }
        } else if (this.jumpState === 'windup') {
            this.frame = 5;
            this.jumpTimer -= dt;
            if (this.jumpTimer <= 0) {
                this.jumpState = 'leaping';
                this.jumpTimer = 0;
                this.jumpStartX = this.x;
                this.jumpTargetX = attackDistance;

                for (let i = 0; i < 6; i++) {
                    combat.fx.particles.push({
                        x: this.x, y: this.y + 2,
                        vx: (Math.random() - 0.5) * 40 + 20, vy: -Math.random() * 25,
                        color: '#aaaaaa', size: 2, life: 0.3, maxLife: 0.3
                    });
                }
            }
        } else if (this.jumpState === 'leaping') {
            this.jumpTimer += dt;
            const progress = Math.min(1.0, this.jumpTimer / this.jumpDuration);
            this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * progress;
            this.jumpArcY = -Math.sin(progress * Math.PI) * 58;
            this.frame = progress < 0.35 ? 6 : 7;

            if (progress >= 1.0) {
                this.jumpState = 'landing';
                this.jumpTimer = 0.12;
                this.jumpArcY = 0;
                this.x = this.jumpTargetX;
                this.hasJumped = true;
                this.frame = 10;
                combat.triggerShake(4);

                for (let i = 0; i < 8; i++) {
                    combat.fx.particles.push({
                        x: this.x, y: this.y + 2,
                        vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 25,
                        color: '#888888', size: 2, life: 0.35, maxLife: 0.35
                    });
                }
            }
        } else if (this.jumpState === 'landing') {
            this.frame = 10;
            this.jumpTimer -= dt;
            if (this.jumpTimer <= 0) {
                this.jumpState = 'ground';
                this.isAttacking = true;
            }
        }

        if (this.isAttacking) {
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 8 + (Math.floor(this.attackTimer * 7.5) % 2);

            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.takeDamage(this.attackDamage, false, `-${this.attackDamage} SLASH!`, '#ff9900');
            }
        }
    }

    updateSoldier(dt, combat, attackDistance) {
        if (!this.armorBroken && this.hp < this.maxHp * 0.5 && !this.isRushing) {
            this.isRushing = true;
            this.speed = this.rushSpeed;
            combat.addFloatingText("⚡ CARGA TÁTICA!", this.x, this.y - 35, '#ff3344', true);
            combat.triggerShake(3);
        }

        if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.isAttacking = false;
            if (this.isRushing) {
                this.walkTimer += dt * 12;
                this.frame = 8 + (Math.floor(this.walkTimer) % 4);
            } else {
                this.walkTimer += dt * 6.5;
                this.frame = Math.floor(this.walkTimer) % 4;
            }
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 4 + (Math.floor(this.attackTimer * 6) % 4);
            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.takeDamage(this.attackDamage, false, `-${this.attackDamage} CORONHADA!`, '#ff3344');
            }
        }
    }

    updateSpore(dt, combat, attackDistance) {
        this.sporeTimer += dt;
        if (this.sporeTimer > 1.3) {
            this.sporeTimer = 0;
            combat.fx.particles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y - 15 + (Math.random() - 0.5) * 15,
                vx: -15 - Math.random() * 15,
                vy: -Math.random() * 20 - 5,
                color: Math.random() > 0.5 ? '#ffaa00' : '#39ff14',
                size: 2, life: 0.6, maxLife: 0.6
            });
            combat.entities.zombies.forEach(other => {
                if (other.active && other !== this && Math.abs(other.x - this.x) < 85 && other.hp < other.maxHp) {
                    other.hp = Math.min(other.maxHp, other.hp + 12);
                    combat.addFloatingText("+12 HP 🍄", other.x, other.y - 25, '#39ff14', false);
                }
            });
        }

        if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.walkTimer += dt * 6.0;
            this.isAttacking = false;
            this.frame = Math.floor(this.walkTimer) % 4;
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 8 + (Math.floor(this.attackTimer * 6) % 4);
            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.takeDamage(this.attackDamage, false, `-${this.attackDamage} ESPOROS!`, '#ffaa00');
            }
        }
    }

    updateBloater(dt, combat, attackDistance) {
        if (!this.isAttacking && this.x > attackDistance + 35) {
            this.slamCooldown -= dt;
            if (this.slamCooldown <= 0 && !this.isSlamming) {
                this.isSlamming = true;
                this.slamProgress = 0;
                this.slamCooldown = 5.0;
            }
        }

        if (this.isSlamming) {
            this.slamProgress += dt;
            if (this.slamProgress < 0.4) {
                this.frame = 4 + Math.floor(this.slamProgress * 7.5);
            } else if (this.slamProgress < 0.8) {
                this.frame = 8 + Math.floor((this.slamProgress - 0.4) * 7.5);
            } else {
                combat.fx.triggerBloaterGroundPound(this, combat.entities.projectiles, combat.getHeroPosition(), (dmg, isHvy, lbl, col) => {
                    combat.takeDamage(dmg, isHvy, lbl, col);
                });
                this.isSlamming = false;
            }
        } else if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.walkTimer += dt * 5.0;
            this.isAttacking = false;
            this.frame = Math.floor(this.walkTimer) % 4;
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 8 + (Math.floor(this.attackTimer * 5.5) % 4);
            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.triggerShake(5);
                combat.takeDamage(this.attackDamage, true, `-${this.attackDamage} ESMAGAR!`, '#ffaa00');
            }
        }
    }

    updateGladiator(dt, combat, attackDistance) {
        if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.walkTimer += dt * 7.0;
            this.isAttacking = false;
            this.frame = Math.floor(this.walkTimer) % 4;
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 8 + (Math.floor(this.attackTimer * 6.5) % 4);
            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.triggerShake(4);
                combat.takeDamage(this.attackDamage, true, `-${this.attackDamage} SOCO DE AÇO!`, '#ff3333');
            }
        }
    }

    updateHazmat(dt, combat, attackDistance) {
        this.puddleDropTimer -= dt;
        if (this.puddleDropTimer <= 0 && this.x > attackDistance + 25) {
            this.puddleDropTimer = 2.4;
            combat.fx.acidPuddles.push({
                x: this.x + 8,
                y: this.y + 4,
                width: 38,
                life: 6.0,
                maxLife: 6.0,
                bubbleTimer: 0
            });
        }

        if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.walkTimer += dt * 6.2;
            this.isAttacking = false;
            this.frame = Math.floor(this.walkTimer) % 4;
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;
            this.frame = 8 + (Math.floor(this.attackTimer * 6.0) % 4);
            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                combat.takeDamage(this.attackDamage, false, `-${this.attackDamage} RADIAÇÃO!`, '#39ff14');
            }
        }
    }

    updateStandard(dt, combat, attackDistance) {
        if (this.x > attackDistance) {
            this.x -= this.speed * dt;
            this.walkTimer += dt * (this.speed / 36) * 7.5;
            this.isAttacking = false;
            this.frame = Math.floor(this.walkTimer) % 8;
        } else {
            this.x = attackDistance;
            this.isAttacking = true;
            this.attackTimer += dt;
            this.attackCooldown -= dt;

            const animSpeed = this.type === 'mutant' ? 5 : 6.5;
            this.frame = 8 + (Math.floor(this.attackTimer * animSpeed) % 4);

            if (this.attackCooldown <= 0 && !combat.isGameOver) {
                this.attackCooldown = this.attackInterval;
                if (this.type === 'mutant') {
                    combat.fx.shockwaves.push({
                        x: this.x - 8, y: this.y + 2,
                        radius: 3, maxRadius: 28,
                        color: '#39ff14', lineWidth: 3, alpha: 1.0
                    });
                    combat.takeDamage(this.attackDamage, true, `-${this.attackDamage} CRUSH!`, '#ff3300');
                } else {
                    combat.takeDamage(this.attackDamage, false, `-${this.attackDamage} HP`, '#ff2222');
                }
            }
        }
    }

    draw(ctx, assets) {
        const currentY = this.y + (this.jumpArcY || 0);

        // Ground Shadow
        const airHeight = Math.abs(this.jumpArcY || 0);
        const shadowFade = Math.max(0.12, 0.45 - (airHeight / 110));
        const shadowMult = (this.type === 'mutant' || this.type === 'bloater' ? 1.3 : (this.scale / 0.5)) * Math.max(0.55, 1 - (airHeight / 95));

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowFade})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, 16 * shadowMult, 5 * shadowMult, 0, 0, Math.PI * 2);
        ctx.fill();

        // Select sprite sheet & offset
        let sheet = assets.zombieSheet;
        let yOffset = 12;

        if (this.type === 'mutant') {
            sheet = assets.mutantSheet;
            yOffset = 14;
        } else if (this.type === 'leaper') {
            sheet = assets.leaperSheet;
            yOffset = 12;
        } else if (this.type === 'soldier') {
            sheet = assets.soldierSheet;
            yOffset = 12;
        } else if (this.type === 'spore') {
            sheet = assets.sporeSheet;
            yOffset = 12;
        } else if (this.type === 'bloater') {
            sheet = assets.bloaterSheet;
            yOffset = 14;
        } else if (this.type === 'gladiator') {
            sheet = assets.gladiatorSheet;
            yOffset = 13;
        } else if (this.type === 'hazmat') {
            sheet = assets.hazmatSheet;
            yOffset = 12;
        }

        // Draw Sprite
        sheet.drawFrame(
            ctx,
            this.frame,
            this.x,
            currentY - yOffset,
            this.scale,
            true, // Face left towards hero
            this.flashTime > 0
        );

        // Health bar & Badge/Name Tag
        const isSpecial = this.type === 'mutant' || this.type === 'leaper' || this.type === 'soldier' || this.type === 'spore' || this.type === 'bloater' || this.type === 'gladiator' || this.type === 'hazmat';
        if (this.hp < this.maxHp || isSpecial) {
            const bw = (this.type === 'mutant' || this.type === 'bloater') ? 34 : (24 * (this.scale / 0.5));
            const bh = (this.type === 'mutant' || this.type === 'bloater') ? 4 : 3.5;
            const bx = this.x - bw / 2;
            const by = currentY - ((this.type === 'mutant' || this.type === 'bloater') ? 52 : (42 * (this.scale / 0.5)));

            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

            let barColor = '#00ff66';
            if (this.type === 'mutant') barColor = '#39ff14';
            else if (this.type === 'leaper') barColor = '#ff9900';
            else if (this.type === 'soldier') barColor = '#ff4455';
            else if (this.type === 'spore') barColor = '#ffaa00';
            else if (this.type === 'bloater') barColor = '#ffcc00';
            else if (this.type === 'gladiator') barColor = '#ff3333';
            else if (this.type === 'hazmat') barColor = '#39ff14';

            ctx.fillStyle = barColor;
            ctx.fillRect(bx, by, Math.max(0, bw * (this.hp / this.maxHp)), bh);

            ctx.save();
            ctx.font = "bold 8px 'Segoe UI', sans-serif";
            let nameColor = '#ffffff';
            if (this.type === 'mutant') nameColor = '#39ff14';
            else if (this.type === 'leaper') nameColor = '#ff9900';
            else if (this.type === 'soldier') nameColor = '#ff4455';
            else if (this.type === 'spore') nameColor = '#ffaa00';
            else if (this.type === 'bloater') nameColor = '#ffcc00';
            else if (this.type === 'gladiator') nameColor = '#ff5533';
            else if (this.type === 'hazmat') nameColor = '#39ff14';

            ctx.fillStyle = nameColor;
            ctx.textAlign = 'center';
            ctx.fillText(this.name || "ZUMBI", this.x, by - 2);
            ctx.restore();
        }
    }
}

window.ZombieEntity = ZombieEntity;
