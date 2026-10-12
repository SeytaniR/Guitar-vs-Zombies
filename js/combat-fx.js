// Combat VFX & Particle System Engine (Explosions, Shockwaves, Damage Numbers, Auras & Atmosphere)
class CombatFX {
    constructor() {
        this.explosions = [];
        this.shockwaves = [];
        this.particles = [];
        this.floatingTexts = [];
        this.ambientEmbers = [];
        this.acidPuddles = [];
        this.shakePower = 0;
    }

    initEmbers(count = 25, width = 800, height = 600) {
        this.ambientEmbers = [];
        for (let i = 0; i < count; i++) {
            this.ambientEmbers.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: -10 - Math.random() * 15,
                vy: 8 + Math.random() * 14,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.5,
                hue: Math.random() > 0.4 ? '#ff6600' : '#ffaa00'
            });
        }
    }

    reset() {
        this.explosions = [];
        this.shockwaves = [];
        this.particles = [];
        this.floatingTexts = [];
        this.acidPuddles = [];
        this.shakePower = 0;
    }

    triggerShake(amount = 6) {
        this.shakePower = Math.max(this.shakePower, amount);
    }

    addFloatingText(text, x, y, color = '#ffff00', isCrit = false) {
        this.floatingTexts.push({
            text: text,
            x: x + (Math.random() - 0.5) * 16,
            y: y - 14,
            vy: -50,
            alpha: 1.0,
            scale: isCrit ? 1.3 : 0.95,
            color: color
        });
    }

    createExplosion(x, y, isCrit = false, soundEngine = null) {
        this.triggerShake(isCrit ? 8 : 4);

        // Animated explosion (frames 8 to 11 of fxSheet)
        this.explosions.push({
            x: x,
            y: y,
            frame: 8,
            maxFrame: 11.9,
            scale: isCrit ? 0.38 : 0.28,
            active: true
        });

        // Radial Shockwave
        this.shockwaves.push({
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
            this.particles.push({
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

        if (soundEngine) {
            soundEngine.playHit();
            if (isCrit) soundEngine.playExplosion();
        }
    }

    triggerMutantBlast(x, y, zombies, soundEngine, onKilledCallback) {
        this.triggerShake(14);

        // Huge Radioactive Shockwave across the road
        this.shockwaves.push({
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
            this.particles.push({
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

        // Damage and knock back all other zombies on the street
        zombies.forEach(other => {
            if (other.active) {
                other.hp -= 70;
                other.x += 24;
                other.flashTime = 0.2;
                this.addFloatingText("-70 ☢️", other.x, other.y - 35, '#39ff14', true);

                if (other.hp <= 0) {
                    other.active = false;
                    if (onKilledCallback) onKilledCallback(other, 200);
                }
            }
        });

        this.addFloatingText("☢️ MUTANT OVERLOAD! ☢️", x, y - 55, '#39ff14', true);
        if (soundEngine) soundEngine.playExplosion();
    }

    triggerSporeBurst(x, y, heroPos, onHeroDamage) {
        this.shockwaves.push({
            x: x, y: y,
            radius: 8, maxRadius: 90,
            color: '#ff9900', lineWidth: 4, alpha: 1.0
        });

        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 120;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                color: Math.random() > 0.4 ? '#ff9900' : '#ffff66',
                size: 2.2 + Math.random() * 2,
                life: 0.5, maxLife: 0.5
            });
        }

        if (heroPos && Math.abs(heroPos.x - x) < 130 && onHeroDamage) {
            onHeroDamage(12, false, "-12 VENENO! 🍄", '#ff9900');
        }
    }

    triggerHazmatMeltdown(x, y, zombies, soundEngine, onKilledCallback) {
        this.triggerShake(7);
        this.shockwaves.push({
            x: x, y: y,
            radius: 10, maxRadius: 130,
            color: '#39ff14', lineWidth: 5, alpha: 1.0
        });

        for (let i = 0; i < 28; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 160;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                color: '#39ff14',
                size: 2.5 + Math.random() * 2,
                life: 0.55, maxLife: 0.55
            });
        }

        // Spawn lingering acid puddle
        this.acidPuddles.push({
            x: x, y: y + 4,
            width: 46, life: 6.5, maxLife: 6.5, bubbleTimer: 0
        });

        zombies.forEach(other => {
            if (other.active && Math.abs(other.x - x) < 110) {
                other.hp -= 40;
                other.flashTime = 0.2;
                this.addFloatingText("-40 🧪", other.x, other.y - 30, '#39ff14', false);
                if (other.hp <= 0) {
                    other.active = false;
                    if (onKilledCallback) onKilledCallback(other, 150);
                }
            }
        });

        if (soundEngine) soundEngine.playExplosion();
    }

    triggerBloaterGroundPound(z, projectiles, heroPos, onHeroDamage) {
        this.triggerShake(10);
        this.shockwaves.push({
            x: z.x - 12, y: z.y + 4,
            radius: 10, maxRadius: 85,
            color: '#ffcc00', lineWidth: 5, alpha: 1.0
        });

        // Dust & asphalt chunks
        for (let i = 0; i < 18; i++) {
            this.particles.push({
                x: z.x - 12 + (Math.random() - 0.5) * 30,
                y: z.y + 2,
                vx: (Math.random() - 0.5) * 80,
                vy: -Math.random() * 45 - 15,
                color: Math.random() > 0.4 ? '#ffcc00' : '#666666',
                size: 2 + Math.random() * 2.5,
                life: 0.45, maxLife: 0.45
            });
        }

        // Destroys nearby player projectiles in mid-air
        let deflected = 0;
        projectiles.forEach(p => {
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
        if (heroPos && Math.abs(heroPos.x - z.x) < 170 && onHeroDamage) {
            onHeroDamage(14, true, "-14 SISMO! 💥", '#ffaa00');
        }
    }

    update(dt, canvasWidth, canvasHeight) {
        // Decay shake power
        if (this.shakePower > 0) {
            this.shakePower *= Math.pow(0.05, dt);
            if (this.shakePower < 0.2) this.shakePower = 0;
        }

        // Update Explosions
        this.explosions.forEach(ex => {
            ex.frame += 16 * dt;
            if (ex.frame > ex.maxFrame) ex.active = false;
        });

        // Update Shockwaves
        this.shockwaves.forEach(sw => {
            sw.radius += (sw.maxRadius - sw.radius) * (14 * dt);
            sw.alpha -= 2.8 * dt;
        });

        // Update Particles
        this.particles.forEach(pt => {
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vy += 60 * dt;
            pt.life -= dt;
        });

        // Update Floating Text
        this.floatingTexts.forEach(ft => {
            ft.y += ft.vy * dt;
            ft.alpha -= 1.5 * dt;
        });

        // Update Ambient Embers
        this.ambientEmbers.forEach(em => {
            em.x += em.vx * dt;
            em.y += em.vy * dt;
            if (em.x < -20) em.x = canvasWidth + 20;
            if (em.y > canvasHeight) em.y = -10;
        });

        // Update Acid Puddles
        this.acidPuddles.forEach(puddle => {
            puddle.life -= dt;
            puddle.bubbleTimer += dt;
            if (puddle.bubbleTimer > 0.18) {
                puddle.bubbleTimer = 0;
                this.particles.push({
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
        this.explosions = this.explosions.filter(ex => ex.active);
        this.shockwaves = this.shockwaves.filter(sw => sw.alpha > 0);
        this.particles = this.particles.filter(pt => pt.life > 0);
        this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);
        this.acidPuddles = this.acidPuddles.filter(p => p.life > 0);
    }

    drawAcidPuddles(ctx) {
        this.acidPuddles.forEach(puddle => {
            const alpha = Math.min(0.85, puddle.life / (puddle.maxLife || 6.0));
            ctx.save();
            ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.42})`;
            ctx.beginPath();
            ctx.ellipse(puddle.x, puddle.y, puddle.width / 2, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(180, 255, 100, ${alpha * 0.7})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        });
    }

    drawEffects(ctx, fxSheet) {
        // Explosions
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.explosions.forEach(ex => {
            if (fxSheet) {
                fxSheet.drawFrame(ctx, ex.frame, ex.x, ex.y, ex.scale, false);
            }
        });
        ctx.restore();

        // Shockwaves
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.shockwaves.forEach(sw => {
            ctx.save();
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.lineWidth;
            ctx.globalAlpha = Math.max(0, sw.alpha);
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // Particles
        this.particles.forEach(pt => {
            ctx.save();
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();

        // Floating Text
        this.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Impact', sans-serif`;
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(ft.text, ft.x, ft.y);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });
    }

    drawAmbientEmbers(ctx) {
        ctx.save();
        this.ambientEmbers.forEach(em => {
            ctx.fillStyle = em.hue;
            ctx.globalAlpha = em.alpha;
            ctx.beginPath();
            ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawVignette(ctx, cw, ch) {
        if (cw <= 10 || ch <= 10) return;
        const r0 = Math.max(1, cw * 0.4);
        const r1 = Math.max(2, cw * 0.9);
        const grad = ctx.createRadialGradient(
            cw / 2, ch / 2, r0,
            cw / 2, ch / 2, r1
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
    }

    drawElectricAura(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        let curX = x;
        let curY = y;
        for (let i = 0; i < 4; i++) {
            curX += (Math.random() - 0.5) * 12;
            curY += (Math.random() - 0.5) * 12;
            ctx.lineTo(curX, curY);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawShockBarrier(ctx, x, y, time) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = Math.sin(time / 120) * 3;
        const radius = 28 + pulse;

        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.strokeStyle = '#00a2ff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, Math.max(10, radius - 6), -Math.PI * 0.35, Math.PI * 0.35);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
    }

    drawImmunityAura(ctx, x, y, time) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = (Math.sin(time / 90) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 32 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 204, 0, ${0.4 + pulse * 0.5})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
    }
}

window.CombatFX = CombatFX;
