// AAA Rhythm Highway System (Guitar Hero Style) - Manual Player Control
class RhythmSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.tracks = 4;
        this.notes = [];
        this.particles = [];
        this.floatingRatings = [];
        this.laneFlashes = [0, 0, 0, 0];
        this.lanePresses = [false, false, false, false];
        this.laneHolding = [false, false, false, false];
        this.activeHoldNotes = [null, null, null, null];
        this.pointerLaneMap = new Map();

        this.colors = [
            { main: '#00ff66', glow: 'rgba(0, 255, 102, 0.45)', core: '#e6fff0' }, // Green
            { main: '#ff0055', glow: 'rgba(255, 0, 85, 0.45)', core: '#ffe6ed' },  // Red
            { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.45)', core: '#fffce6' }, // Yellow
            { main: '#00d4ff', glow: 'rgba(0, 212, 255, 0.45)', core: '#e6faff' }  // Blue
        ];

        this.time = 0;
        this.noteSpeed = 340; // Balanced readable speed
        this.spawnTimer = 0;
        this.spawnInterval = 0.58; // Beat cadence

        // Pure manual play only
        this.streak = 0;
        this.multiplier = 1;
        this.onHitCallback = null;

        // Custom Song Engine state
        this.currentSong = null;
        this.songAudio = null;
        this.isCustomSongPlaying = false;
        this.songStats = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupInputHandlers();
    }

    resize() {
        const parent = this.canvas.parentElement;
        const w = (parent && parent.clientWidth > 0) ? parent.clientWidth : (window.innerWidth || 360);
        const h = (parent && parent.clientHeight > 0) ? parent.clientHeight : (Math.floor(window.innerHeight * 0.5) || 300);
        this.canvas.width = w;
        this.canvas.height = h;
    }

    getHitZoneY() {
        return Math.round(this.canvas.height - 54);
    }

    setupInputHandlers() {
        const getLaneFromX = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const trackWidth = this.canvas.width / this.tracks;
            return Math.min(this.tracks - 1, Math.max(0, Math.floor(x / trackWidth)));
        };

        const lastTapTime = [0, 0, 0, 0];
        const onDown = (lane, id) => {
            if (this.isPaused) return;
            const now = performance.now();
            if (now - lastTapTime[lane] < 60) return;
            lastTapTime[lane] = now;
            if (id !== undefined) this.pointerLaneMap.set(id, lane);
            if (window.soundEngine) window.soundEngine.resume();

            // Unlock audio on mobile interaction if paused
            if (this.isCustomSongPlaying && this.songAudio && this.songAudio.paused) {
                this.songAudio.currentTime = Math.max(0, this.customSongTime);
                this.songAudio.play().catch(e => console.warn("Audio unlock tap issue", e));
            }

            this.triggerLaneDown(lane);
        };

        const onUp = (id) => {
            if (id !== undefined && this.pointerLaneMap.has(id)) {
                const lane = this.pointerLaneMap.get(id);
                this.pointerLaneMap.delete(id);
                let stillHeld = false;
                for (const otherLane of this.pointerLaneMap.values()) {
                    if (otherLane === lane) { stillHeld = true; break; }
                }
                if (!stillHeld) this.triggerLaneUp(lane);
            }
        };

        const onMove = (clientX, id) => {
            if (id === undefined || !this.pointerLaneMap.has(id)) return;
            const oldLane = this.pointerLaneMap.get(id);
            const newLane = getLaneFromX(clientX);
            if (oldLane !== newLane) {
                this.pointerLaneMap.set(id, newLane);
                let stillHeld = false;
                for (const otherLane of this.pointerLaneMap.values()) {
                    if (otherLane === oldLane) { stillHeld = true; break; }
                }
                if (!stillHeld) this.triggerLaneUp(oldLane);
            }
        };

        let hasPointerEvents = false;
        // Pointer Events (supports stylus, mouse, and unified pointers)
        this.canvas.addEventListener('pointerdown', (e) => {
            hasPointerEvents = true;
            e.preventDefault();
            try { this.canvas.setPointerCapture(e.pointerId); } catch(err) {}
            onDown(getLaneFromX(e.clientX), e.pointerId);
        });
        this.canvas.addEventListener('pointermove', (e) => {
            if (this.pointerLaneMap.has(e.pointerId)) onMove(e.clientX, e.pointerId);
        });
        this.canvas.addEventListener('pointerup', (e) => {
            e.preventDefault();
            try { this.canvas.releasePointerCapture(e.pointerId); } catch(err) {}
            onUp(e.pointerId);
        });
        this.canvas.addEventListener('pointercancel', (e) => onUp(e.pointerId));
        window.addEventListener('pointerup', (e) => onUp(e.pointerId));

        // Touch Events fallback (only runs on devices without pointer events)
        this.canvas.addEventListener('touchstart', (e) => {
            if (hasPointerEvents) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                onDown(getLaneFromX(t.clientX), 'touch_' + t.identifier);
            }
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            if (hasPointerEvents) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) onMove(e.changedTouches[i].clientX, 'touch_' + e.changedTouches[i].identifier);
        }, { passive: false });
        this.canvas.addEventListener('touchend', (e) => {
            if (hasPointerEvents) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) onUp('touch_' + e.changedTouches[i].identifier);
        }, { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => {
            if (hasPointerEvents) return;
            for (let i = 0; i < e.changedTouches.length; i++) onUp('touch_' + e.changedTouches[i].identifier);
        });

        // Keyboard Support (A, S, D, F or 1, 2, 3, 4)
        const keyMap = {
            'a': 0, 'A': 0, '1': 0,
            's': 1, 'S': 1, '2': 1,
            'd': 2, 'D': 2, '3': 2,
            'f': 3, 'F': 3, '4': 3
        };

        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (keyMap[e.key] !== undefined) {
                const lane = keyMap[e.key];
                onDown(lane, 'key_' + e.key.toLowerCase());
            }
        });

        window.addEventListener('keyup', (e) => {
            if (keyMap[e.key] !== undefined) {
                onUp('key_' + e.key.toLowerCase());
            }
        });
    }

    triggerLaneHit(lane) {
        // Shorthand for tap / compatibility
        this.triggerLaneDown(lane);
        setTimeout(() => this.triggerLaneUp(lane), 60);
    }

    triggerLaneDown(lane) {
        this.laneFlashes[lane] = 1.0;
        this.laneHolding[lane] = true;
        this.lanePresses[lane] = true;
        const hitZoneY = this.getHitZoneY();
        const hitWindow = 95; // Balanced generous window for mobile touch latency

        // Find closest note in this lane
        let closestNote = null;
        let minDist = Infinity;

        for (const note of this.notes) {
            if (note.track === lane && note.active && !note.hit) {
                const dist = Math.abs(note.y - hitZoneY);
                if (dist < hitWindow && dist < minDist) {
                    minDist = dist;
                    closestNote = note;
                }
            }
        }

        const trackWidth = this.canvas.width / this.tracks;
        const noteX = lane * trackWidth + trackWidth / 2;

        if (closestNote) {
            closestNote.hit = true;
            let rating = 'GOOD';
            let isCrit = false;
            let ratingColor = '#00d4ff';

            const syncBonus = window.talentSystem ? window.talentSystem.getStat('fine_sync') : 0;
            const perfectWindow = Math.round(24 * (1.0 + syncBonus));
            const greatWindow = Math.round(54 * (1.0 + syncBonus * 0.5));

            let ratingKey = 'good';
            if (minDist <= perfectWindow) {
                rating = 'PERFECT!';
                ratingKey = 'perfect';
                isCrit = (window.game && window.game.combat && window.game.combat.guaranteedCritReady) || false;
                ratingColor = '#ffcc00';
                this.streak++;
                if (this.songStats) this.songStats.perfects++;
            } else if (minDist <= greatWindow) {
                rating = 'GREAT!';
                ratingKey = 'great';
                isCrit = false;
                ratingColor = '#00ff66';
                this.streak++;
                if (this.songStats) this.songStats.greats++;
            } else {
                rating = 'GOOD';
                ratingKey = 'good';
                ratingColor = '#00d4ff';
                this.streak++;
                if (this.songStats) this.songStats.goods++;
            }

            if (this.songStats) {
                this.songStats.hitNotes++;
                this.songStats.maxStreak = Math.max(this.songStats.maxStreak, this.streak);
            }

            // Streak milestone talents:
            // 1. Lucrative Streak (coins every 15 streak)
            if (this.streak > 0 && this.streak % 15 === 0) {
                const streakGold = window.talentSystem ? window.talentSystem.getStat('lucrative_streak') : 0;
                if (streakGold > 0 && window.talentSystem) {
                    window.talentSystem.addGold(streakGold);
                    this.addFloatingRating(`+${streakGold} 🪙 STREAK!`, noteX, hitZoneY - 50, '#ffd700', true);
                }
            }

            // 2. Rhythmic Heal (heal hero every 10 streak)
            if (this.streak > 0 && this.streak % 10 === 0) {
                const healAmt = window.talentSystem ? window.talentSystem.getStat('rhythmic_heal') : 0;
                if (healAmt > 0 && window.game && window.game.combat) {
                    window.game.combat.healHero(healAmt);
                }
            }

            // High Combo Screen Shake (Combos altos tremem a tela com adrenalina)
            if (this.streak >= 10 && this.streak % 5 === 0) {
                const shakeIntensity = Math.min(10, 3 + Math.floor(this.streak / 10));
                if (window.game && window.game.combat) window.game.combat.triggerShake(shakeIntensity);
            }

            // Solo Mastery Talent: maximum multiplier up to x9
            const maxMult = window.talentSystem ? window.talentSystem.getStat('solo_mastery') : 4;
            this.multiplier = Math.min(maxMult, 1 + Math.floor(this.streak / 6));

            // Check if this note is a HOLD / SUSTAIN note (duration >= 0.2s)
            if (closestNote.duration && closestNote.duration >= 0.2) {
                closestNote.isHold = true;
                closestNote.holding = true;
                closestNote.heldTime = 0;
                closestNote.lastTick = 0;
                closestNote.active = true;
                this.activeHoldNotes[lane] = closestNote;
                this.addFloatingRating(rating + ' 〰️ SEGURE!', noteX, hitZoneY - 25, ratingColor, isCrit);
            } else {
                closestNote.active = false;
                this.addFloatingRating(rating, noteX, hitZoneY - 25, ratingColor, isCrit);
            }

            this.createHitSparks(noteX, hitZoneY, this.colors[lane].main, isCrit);

            // Register note rating with CombatSystem (sync combo & apply note damage modifier / skill)
            if (window.game && window.game.combat) {
                window.game.combat.combo = this.streak;
                window.game.combat.registerRhythmNote(ratingKey, lane);
            }

            if (this.onHitCallback) {
                this.onHitCallback(isCrit, lane);
            }
        } else {
            // Penalty for wrong tap: tapping with no valid note
            this.streak = 0;
            this.multiplier = 1;
            if (this.songStats) this.songStats.misses++;
            this.addFloatingRating('ERROU! 💨', noteX, hitZoneY - 25, '#ff4444', false);
            this.createHitSparks(noteX, hitZoneY, '#555555', false);
            if (window.soundEngine && typeof window.soundEngine.playMiss === 'function') window.soundEngine.playMiss();
            if (window.game && window.game.combat) {
                window.game.combat.combo = 0;
                window.game.combat.comboKills = 0;
                window.game.combat.registerWrongTap(lane);
            }
        }
    }

    triggerLaneUp(lane) {
        this.laneHolding[lane] = false;
        this.lanePresses[lane] = false;

        const note = this.activeHoldNotes[lane];
        if (note && note.holding) {
            note.holding = false;
            const trackWidth = this.canvas.width / this.tracks;
            const noteX = lane * trackWidth + trackWidth / 2;
            const hitZoneY = this.getHitZoneY();
            const ratio = note.duration > 0 ? (note.heldTime / note.duration) : 1;

            if (ratio >= 0.75) {
                note.completed = true;
                note.active = false;
                this.addFloatingRating('SUSTAIN OK! ⭐', noteX, hitZoneY - 30, '#00ff66', true);
                if (window.game && window.game.combat) {
                    window.game.combat.score += 100 * this.multiplier;
                }
                this.createHitSparks(noteX, hitZoneY, this.colors[lane].main, true);
            } else {
                note.dropped = true;
                note.active = false;
                this.addFloatingRating('SOLTO CEDO! 💨', noteX, hitZoneY - 20, '#ffaa00', false);
            }
            this.activeHoldNotes[lane] = null;
        }
    }

    createHitSparks(x, y, color, isCrit, sparkCount = null) {
        const count = sparkCount || (isCrit ? 14 : 7);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 180;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                color: color,
                size: 2.2 + Math.random() * 2.5,
                life: 0.35
            });
        }
    }

    addFloatingRating(text, x, y, color, isCrit) {
        this.floatingRatings.push({
            text: text,
            x: x,
            y: y,
            vy: -55,
            color: color,
            alpha: 1.0,
            scale: isCrit ? 1.5 : 1.15
        });
    }

    spawnNote() {
        const lane = Math.floor(Math.random() * this.tracks);
        const isHold = Math.random() < 0.22; // 22% chance of hold note in endless mode
        const dur = isHold ? (0.6 + Math.random() * 0.8) : 0;
        this.notes.push({
            track: lane,
            y: -25,
            duration: dur,
            isHold: isHold,
            colorInfo: this.colors[lane],
            active: true,
            hit: false,
            missed: false,
            holding: false,
            heldTime: 0,
            lastTick: 0
        });
    }

    update(deltaTime) {
        if (this.isPaused) return;
        this.time += deltaTime;
        const dt = deltaTime / 1000;
        const hitZoneY = this.getHitZoneY();

        if (this.isCustomSongPlaying) {
            const trackWidth = this.canvas.width / this.tracks;
            const songDuration = Math.max(10, (this.currentSong && this.currentSong.duration) || 30);

            // Clock synchronization: if audio is actively playing, use its currentTime; otherwise use delta time software clock
            let curTime = 0;
            const audioPlaying = this.songAudio && !this.songAudio.paused && !this.songAudio.ended && this.songAudio.currentTime > 0;
            if (audioPlaying) {
                curTime = this.songAudio.currentTime;
                this.customSongTime = curTime;
            } else {
                this.customSongTime += dt;
                curTime = this.customSongTime;
            }

            // Check if song finished (audio ended or reached duration)
            if ((this.songAudio && this.songAudio.ended) || curTime >= songDuration + 0.8) {
                this.finishCustomSong();
                return;
            }

            // Sync notes on the highway according to exact audio timestamp
            this.notes.forEach(note => {
                if (note.holding) {
                    note.y = hitZoneY; // Clamped at hitzone during hold
                } else {
                    note.y = hitZoneY - (note.time - curTime) * this.noteSpeed;
                }

                // Missed note passed hit zone (if not struck and not holding)
                if (note.active && !note.hit && !note.holding && curTime > note.time + 0.28) {
                    note.active = false;
                    note.missed = true;
                    if (this.songStats) this.songStats.misses++;
                    this.addFloatingRating('MISS', note.track * trackWidth + trackWidth / 2, hitZoneY - 10, '#ff2222', false);
                    this.streak = 0;
                    this.multiplier = 1;
                    if (window.game && window.game.combat) {
                        window.game.combat.combo = 0;
                        window.game.combat.comboKills = 0;
                        window.game.combat.registerRhythmNote('miss', note.track);
                    }
                }
            });

            this.updateCustomSongProgressBar();
        } else {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.spawnNote();
                if (this.streak > 8 && Math.random() > 0.65) {
                    setTimeout(() => this.spawnNote(), 140);
                }
            }

            this.notes.forEach(note => {
                if (note.holding) {
                    note.y = hitZoneY;
                } else {
                    note.y += this.noteSpeed * dt;
                }

                // Missed note
                if (note.y > hitZoneY + 95 && note.active && !note.hit && !note.holding) {
                    note.active = false;
                    note.missed = true;
                    const trackWidth = this.canvas.width / this.tracks;
                    this.addFloatingRating('MISS', note.track * trackWidth + trackWidth / 2, hitZoneY - 10, '#ff2222', false);
                    this.streak = 0;
                    this.multiplier = 1;
                    if (window.game && window.game.combat) {
                        window.game.combat.combo = 0;
                        window.game.combat.comboKills = 0;
                        window.game.combat.registerRhythmNote('miss', note.track);
                    }
                }
            });

            this.notes = this.notes.filter(n => (n.y < this.canvas.height + 40 && n.active) || n.holding);
        }

        // Active Sustain / Hold notes tick processing
        for (let l = 0; l < 4; l++) {
            const holdNote = this.activeHoldNotes[l];
            if (holdNote && holdNote.holding) {
                holdNote.heldTime += dt;
                this.laneFlashes[l] = Math.max(this.laneFlashes[l], 0.65);

                const trackWidth = this.canvas.width / this.tracks;
                const noteX = l * trackWidth + trackWidth / 2;

                // Sustain tick every ~0.085s
                if (holdNote.heldTime - holdNote.lastTick >= 0.085) {
                    holdNote.lastTick = holdNote.heldTime;
                    if (window.soundEngine) window.soundEngine.playSustainTick(l);
                    if (window.game && window.game.combat) {
                        window.game.combat.launchSustainTick(l);
                        window.game.combat.score += 20 * this.multiplier;
                    }
                    if (this.songStats) {
                        this.songStats.sustainTicks = (this.songStats.sustainTicks || 0) + 1;
                    }
                    this.createHitSparks(noteX, hitZoneY, this.colors[l].main, false, 3);
                }

                // Natural completion when held to duration
                if (holdNote.heldTime >= holdNote.duration) {
                    holdNote.completed = true;
                    holdNote.holding = false;
                    holdNote.active = false;
                    this.activeHoldNotes[l] = null;

                    this.addFloatingRating('SUSTAIN FULL! ⭐', noteX, hitZoneY - 35, '#ffcc00', true);
                    if (window.game && window.game.combat) {
                        window.game.combat.score += 150 * this.multiplier;
                        window.game.combat.rockPower = Math.min(100, window.game.combat.rockPower + 10);
                    }
                    if (window.soundEngine) window.soundEngine.playGuitarChord(l);
                    this.createHitSparks(noteX, hitZoneY, this.colors[l].main, true);
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            if (this.laneFlashes[i] > 0) {
                this.laneFlashes[i] -= 5 * dt;
                if (this.laneFlashes[i] < 0) this.laneFlashes[i] = 0;
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 2.2 * dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.floatingRatings.forEach(r => {
            r.y += r.vy * dt;
            r.alpha -= 2.2 * dt;
        });
        this.floatingRatings = this.floatingRatings.filter(r => r.alpha > 0);
    }

    draw() {
        if (this.canvas.width <= 10 || this.canvas.height <= 10) {
            this.resize();
            if (this.canvas.width <= 10 || this.canvas.height <= 10) return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const trackW = cw / this.tracks;
        const hitZoneY = this.getHitZoneY();

        // 1. Draw Fretboard Background & Strings
        this.ctx.fillStyle = '#0f0f18';
        this.ctx.fillRect(0, 0, cw, ch);

        for (let i = 0; i < this.tracks; i++) {
            const tx = i * trackW;

            if (this.laneFlashes[i] > 0) {
                this.ctx.fillStyle = this.colors[i].glow;
                this.ctx.globalAlpha = this.laneFlashes[i] * 0.7;
                this.ctx.fillRect(tx, 0, trackW, ch);
                this.ctx.globalAlpha = 1.0;
            }

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(tx + trackW / 2, 0);
            this.ctx.lineTo(tx + trackW / 2, ch);
            this.ctx.stroke();

            this.ctx.strokeStyle = '#222233';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(tx, 0);
            this.ctx.lineTo(tx, ch);
            this.ctx.stroke();
        }

        // 2. Draw Hit Zone Bar
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.28)';
        this.ctx.lineWidth = 7;
        this.ctx.beginPath();
        this.ctx.moveTo(0, hitZoneY);
        this.ctx.lineTo(cw, hitZoneY);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, hitZoneY);
        this.ctx.lineTo(cw, hitZoneY);
        this.ctx.stroke();
        this.ctx.restore();

        // 3. Draw Fret Buttons (Target Pads)
        for (let i = 0; i < this.tracks; i++) {
            const bx = i * trackW + trackW / 2;
            const col = this.colors[i];
            const isPressed = this.laneFlashes[i] > 0.2;

            this.ctx.save();
            this.ctx.translate(bx, hitZoneY);
            if (isPressed) this.ctx.scale(1.18, 1.18);

            // Fast GPU halo stroke instead of multi-pass shadowBlur
            this.ctx.strokeStyle = col.main + (isPressed ? '66' : '33');
            this.ctx.lineWidth = isPressed ? 7 : 5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 19, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = col.main;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.fillStyle = isPressed ? col.main : 'rgba(0, 0, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();

            if (window.skillSystem && typeof window.skillSystem.drawLaneFretOverlay === 'function') {
                window.skillSystem.drawLaneFretOverlay(this.ctx, i, bx, hitZoneY, isPressed, trackW);
            }
        }

        // 4.1. Draw Sustain / Hold Ribbons (behind note heads)
        this.notes.forEach(note => {
            if (!note.active && !note.holding) return;
            if (!note.duration || note.duration < 0.2) return;

            const col = note.colorInfo || this.colors[note.track];
            const x = note.track * trackW + trackW / 2;

            let headY = note.y;
            if (note.holding) headY = hitZoneY;

            let tailY = headY;
            if (this.isCustomSongPlaying) {
                const curTime = (this.songAudio && !this.songAudio.paused && this.songAudio.currentTime > 0) ? this.songAudio.currentTime : this.customSongTime;
                tailY = hitZoneY - ((note.time + note.duration) - curTime) * this.noteSpeed;
            } else {
                tailY = headY - (note.duration * this.noteSpeed);
            }
            if (tailY > ch + 40 || headY < -60) return;
            const ribTop = Math.min(tailY, headY), ribBottom = Math.max(tailY, headY);
            const ribHeight = ribBottom - ribTop;
            if (ribHeight <= 2) return;

            const ribWidth = 14;
            this.ctx.save();
            const grad = this.ctx.createLinearGradient(0, ribTop, 0, ribBottom);
            grad.addColorStop(0, col.main);
            grad.addColorStop(0.5, note.holding ? '#ffffff' : col.glow);
            grad.addColorStop(1, col.main);

            this.ctx.fillStyle = grad;
            this.ctx.globalAlpha = note.holding ? 0.95 : 0.75;

            // Rounded sustain ribbon
            this.ctx.beginPath();
            if (typeof this.ctx.roundRect === 'function') {
                this.ctx.roundRect(x - ribWidth / 2, ribTop, ribWidth, ribHeight, 6);
            } else {
                this.ctx.rect(x - ribWidth / 2, ribTop, ribWidth, ribHeight);
            }
            this.ctx.fill();

            // Core electric laser line inside ribbon
            this.ctx.strokeStyle = note.holding ? '#ffffff' : col.core;
            this.ctx.lineWidth = note.holding ? 3.5 : 2.0;
            this.ctx.beginPath();
            this.ctx.moveTo(x, ribTop + 4);
            this.ctx.lineTo(x, ribBottom - 4);
            this.ctx.stroke();

            // Animated chevrons / energy pulses along sustain trail
            const pulseOffset = (performance.now() * 0.25) % 24;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1.5;
            for (let py = ribTop + pulseOffset; py < ribBottom - 6; py += 24) {
                this.ctx.beginPath();
                this.ctx.moveTo(x - 5, py);
                this.ctx.lineTo(x, py + 4);
                this.ctx.lineTo(x + 5, py);
                this.ctx.stroke();
            }

            // End cap (stopper gem at the tail)
            this.ctx.fillStyle = col.main;
            this.ctx.beginPath();
            this.ctx.arc(x, ribTop, 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, ribTop, 2.5, 0, Math.PI * 2);
            this.ctx.fill();

            // If actively holding, draw electric aura at hit zone
            if (note.holding) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, hitZoneY, 20 + Math.sin(performance.now() * 0.03) * 4, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });

        // 4.2. Draw Falling Notes (Neon Guitar Picks)
        this.notes.forEach(note => {
            if (!note.active && !note.holding) return;
            if (note.hit && !note.holding) return;

            let drawY = note.y;
            if (note.holding) drawY = hitZoneY;
            if (drawY < -50 || drawY > ch + 50) return;

            const x = note.track * trackW + trackW / 2;
            const col = note.colorInfo;

            this.ctx.save();
            this.ctx.translate(x, drawY);

            // Fast GPU halo stroke instead of multi-pass shadowBlur
            this.ctx.strokeStyle = col.main + (note.holding ? '88' : '44');
            this.ctx.lineWidth = note.holding ? 6 : 4;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -19);
            this.ctx.bezierCurveTo(21, -19, 19, 13, 0, 21);
            this.ctx.bezierCurveTo(-19, 13, -21, -19, 0, -19);
            this.ctx.stroke();

            this.ctx.fillStyle = col.main;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -18);
            this.ctx.bezierCurveTo(20, -18, 18, 12, 0, 20);
            this.ctx.bezierCurveTo(-18, 12, -20, -18, 0, -18);
            this.ctx.fill();

            this.ctx.fillStyle = col.core;
            this.ctx.beginPath();
            this.ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        // 5. Hit Sparks (Fast GPU rect batch)
        this.ctx.save();
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.life / 0.35);
            this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        this.ctx.restore();

        // 6. Floating Ratings
        this.floatingRatings.forEach(r => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, r.alpha);
            this.ctx.font = `bold ${Math.round(18 * r.scale)}px 'Impact', sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(r.text, r.x, r.y);
            this.ctx.fillStyle = r.color;
            this.ctx.fillText(r.text, r.x, r.y);
            this.ctx.restore();
        });

        // 7. HUD Prompt & Multiplier
        this.drawHighwayHUD(cw, ch);
    }

    drawHighwayHUD(cw, ch) {
        this.ctx.save();
        this.ctx.font = "bold 13px 'Segoe UI', sans-serif";
        this.ctx.fillStyle = this.multiplier > 1 ? '#ffcc00' : '#888888';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`COMBO x${this.multiplier}`, 12, 22);

        if (this.streak > 4) {
            this.ctx.font = "bold 12px 'Segoe UI', sans-serif";
            this.ctx.fillStyle = '#00ff66';
            this.ctx.fillText(`STREAK: ${this.streak} 🔥`, 12, 40);
        } else if (!this.autoPlay && this.notes.length > 0) {
            this.ctx.font = "bold 11px 'Segoe UI', sans-serif";
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            this.ctx.fillText(`TOQUE NAS PISTAS NO RITMO! 👇`, 12, 40);
        }
        this.ctx.restore();
    }

    generateFallbackNotes(duration, bpm) {
        duration = Math.max(15, duration || 30);
        bpm = Math.max(60, bpm || 120);
        const beatSec = 60 / bpm;
        const totalBeats = Math.floor(duration / beatSec);
        const notes = [];
        for (let b = 2; b < totalBeats; b++) {
            const time = b * beatSec;
            if (time > duration - 1) break;
            const mb = b % 8;
            const lane = (mb === 0) ? 0 : (mb === 2 || mb === 6) ? 2 : (mb === 4) ? 1 : (mb === 7) ? 3 : (b % 4);
            const dur = (mb === 0) ? 1.0 : (mb === 4) ? 0.8 : 0;
            notes.push({ time: Math.round(time * 1000) / 1000, lane, duration: dur, id: 'n_' + Math.random().toString(36).substr(2, 9) });
        }
        return notes;
    }

    playCustomSong(song) {
        this.stopCustomSong();

        this.currentSong = song;
        this.isCustomSongPlaying = true;
        this.streak = 0;
        this.multiplier = 1;
        this.customSongTime = 0;
        this.customSongStartTime = performance.now();
        this.activeHoldNotes = [null, null, null, null];
        this.laneHolding = [false, false, false, false];

        // If the song has 0 notes, generate a fallback chart so the highway is never empty!
        if (!song.notes || song.notes.length === 0) {
            console.log("Custom song has 0 notes; generating dynamic fallback chart for playback.");
            song.notes = this.generateFallbackNotes(song.duration || 30, song.bpm || 120);
        }

        this.songStats = {
            totalNotes: song.notes.length,
            hitNotes: 0,
            perfects: 0,
            greats: 0,
            goods: 0,
            misses: 0,
            maxStreak: 0,
            scoreStart: window.game && window.game.combat ? window.game.combat.score : 0
        };

        // Initialize notes from song chart
        this.notes = song.notes.map(n => {
            const dur = Math.max(0, Number(n.duration) || 0);
            return {
                track: (n.lane !== undefined && n.lane >= 0 && n.lane < 4) ? n.lane : 0,
                colorInfo: this.colors[(n.lane !== undefined && n.lane >= 0 && n.lane < 4) ? n.lane : 0],
                time: Math.max(0, Number(n.time) || 0),
                duration: dur,
                isHold: dur >= 0.2,
                y: -200,
                active: true,
                hit: false,
                missed: false,
                holding: false,
                heldTime: 0,
                lastTick: 0
            };
        });

        // Sort notes chronologically
        this.notes.sort((a, b) => a.time - b.time);

        if (song.audioData && typeof song.audioData === 'string' && song.audioData.length > 50 && !song.audioData.startsWith('blob:')) {
            try {
                this.songAudio = new Audio(song.audioData);
                this.songAudio.currentTime = 0;
                this.songAudio.onerror = (e) => {
                    console.warn("RhythmSystem audio error, continuing with precision software clock:", e);
                };
                const playPromise = this.songAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.warn("Song audio play blocked by browser autoplay policy; will auto-resume on first tap", e);
                    });
                }
            } catch (err) {
                console.warn("Could not initialize custom song audio element:", err);
                this.songAudio = null;
            }
        } else {
            this.songAudio = null;
        }

        this.updateCustomSongHUD();
    }

    stopCustomSong() {
        if (this.songAudio) {
            try { this.songAudio.pause(); } catch (e) {}
            this.songAudio = null;
        }
        this.isCustomSongPlaying = false;
        this.currentSong = null;
        this.notes = [];
        this.activeHoldNotes = [null, null, null, null];
        this.laneHolding = [false, false, false, false];
        this.customSongTime = 0;
        this.updateCustomSongHUD();
    }

    pauseAudio() {
        this.isPaused = true;
        if (this.songAudio && !this.songAudio.paused) {
            try { this.songAudio.pause(); } catch (e) {}
        }
    }

    resumeAudio() {
        this.isPaused = false;
        if (this.isCustomSongPlaying && this.songAudio && this.songAudio.paused) {
            try { this.songAudio.play().catch(e => console.warn("Audio resume", e)); } catch (e) {}
        }
    }

    finishCustomSong() {
        if (!this.isCustomSongPlaying) return;
        const song = this.currentSong;
        const stats = { ...this.songStats };
        this.stopCustomSong();
        if (window.game && typeof window.game.showVictoryModal === 'function') {
            window.game.showVictoryModal(song, stats);
        } else {
            this.showSongResultsModal(song, stats);
        }
    }

    updateCustomSongHUD() {
        const banner = document.getElementById('active-song-banner'), def = document.getElementById('default-divider-content');
        if (!banner || !def) return;
        if (this.isCustomSongPlaying && this.currentSong) {
            banner.style.display = 'flex'; def.style.display = 'none';
            const t = document.getElementById('active-song-title'), a = document.getElementById('active-song-artist'), c = document.getElementById('active-song-cover');
            if (t) t.innerText = this.currentSong.title;
            if (a) a.innerText = this.currentSong.artist;
            if (c) c.src = this.currentSong.cover || 'assets/covers/default_cover.jpg';
            const exitBtn = document.getElementById('active-song-exit-btn');
            if (exitBtn) exitBtn.onclick = () => { if (confirm("⚠️ Encerrar a música e voltar ao menu?")) { this.stopCustomSong(); if (window.game) window.game.switchScreen('menu'); } };
        } else {
            banner.style.display = 'none'; def.style.display = 'block';
        }
    }

    updateCustomSongProgressBar() {
        if (!this.isCustomSongPlaying || !this.currentSong) return;
        if (!this.hudBarCache) {
            this.hudBarCache = {
                bar: document.getElementById('active-song-progress-fill'),
                timeEl: document.getElementById('active-song-time'),
                lastW: '',
                lastSec: -1
            };
        }
        const h = this.hudBarCache;
        const cur = (this.songAudio && !this.songAudio.paused && this.songAudio.currentTime > 0) ? this.songAudio.currentTime : (this.customSongTime || 0);
        const total = Math.max(10, this.currentSong.duration || 30);
        const pct = Math.min(100, Math.max(0, Math.round((cur / total) * 100)));
        const w = `${pct}%`;
        if (h.bar && w !== h.lastW) {
            h.lastW = w;
            h.bar.style.width = w;
        }
        const curSec = Math.floor(cur);
        if (h.timeEl && curSec !== h.lastSec) {
            h.lastSec = curSec;
            const fmt = s => `${Math.floor(s / 60)}:${Math.floor(s % 60) < 10 ? '0' : ''}${Math.floor(s % 60)}`;
            h.timeEl.innerText = `${fmt(cur)} / ${fmt(total)}`;
        }
    }

    showSongResultsModal(song, stats) {
        if (window.game && typeof window.game.showVictoryModal === 'function') {
            window.game.showVictoryModal(song, stats);
            return;
        }
        const modal = document.getElementById('song-results-modal');
        if (modal) modal.classList.add('open');
    }
}
