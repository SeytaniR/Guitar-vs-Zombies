// ==========================================
// COUNTDOWN SYSTEM (5-SECOND MATCH START & RESUME)
// ==========================================
// Manages the 5-second slow-rolling track preparation countdown at match start
// (PvE and PvP) and upon unpausing via the settings/gear modal ("CONTINUAR PARTIDA").
// Gives players time to visually track incoming notes and place their fingers.

class CountdownSystem {
    constructor() {
        this.isActive = false;
        this.timer = 0;
        this.duration = 5.0;
        this.mode = 'start'; // 'start' | 'resume'
        this.startSongTime = 0;
        this.targetSongTime = 0;
        this.currentSecond = 5;
        this.onComplete = null;
        this.finishTimeout = null;

        this.overlayEl = null;
        this.badgeEl = null;
        this.numEl = null;
        this.subEl = null;
        this.modePillEl = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initDOM();
        this.initialized = true;
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        this.overlayEl = document.getElementById('battle-countdown-overlay');
        this.badgeEl = document.getElementById('countdown-badge');
        this.numEl = document.getElementById('countdown-number');
        this.subEl = document.getElementById('countdown-subtitle');
        this.modePillEl = document.getElementById('countdown-mode-pill');
    }

    startMatchCountdown(onComplete) {
        this.init();
        const rhythm = (typeof window !== 'undefined' && window.game) ? window.game.rhythm : null;
        this.mode = 'start';
        this.duration = 5.0;
        this.timer = 5.0;
        this.isActive = true;
        this.currentSecond = 5;
        this.onComplete = onComplete || null;

        // At match start, the track rolls smoothly over 5 seconds:
        // Advancing from -2.0s to 0.0s (rate: 2.0s / 5.0s = 0.4x calm scrolling speed)
        this.startSongTime = -2.0;
        this.targetSongTime = 0.0;

        if (rhythm) {
            rhythm.isPaused = false;
            rhythm.isCountdownActive = true;
            rhythm.customSongTime = this.startSongTime;
            if (rhythm.songAudio) {
                try {
                    rhythm.songAudio.pause();
                    rhythm.songAudio.currentTime = 0;
                } catch (e) {}
            }
        }

        if (typeof window !== 'undefined' && window.game) {
            window.game.isBattlePaused = false;
            if (window.game.combat) {
                window.game.combat.isPaused = true;
            }
        }

        this.showOverlay();
        this.updateSecondUI(5);
        this.playTickSfx();
    }

    startResumeCountdown(onComplete) {
        this.init();
        const rhythm = (typeof window !== 'undefined' && window.game) ? window.game.rhythm : null;
        this.mode = 'resume';
        this.duration = 5.0;
        this.timer = 5.0;
        this.isActive = true;
        this.currentSecond = 5;
        this.onComplete = onComplete || null;

        const curTime = (rhythm && typeof rhythm.customSongTime === 'number') ? Math.max(0, rhythm.customSongTime) : 0;
        // Rewind up to 2.0s so incoming notes slowly scroll back into view
        const rewind = Math.min(2.0, curTime);
        this.targetSongTime = curTime;
        this.startSongTime = curTime - rewind;

        if (rhythm) {
            rhythm.isPaused = false;
            rhythm.isCountdownActive = true;
            rhythm.customSongTime = this.startSongTime;
            if (rhythm.songAudio) {
                try {
                    rhythm.songAudio.pause();
                    rhythm.songAudio.currentTime = this.startSongTime;
                } catch (e) {}
            }
        }

        if (typeof window !== 'undefined' && window.game) {
            window.game.isBattlePaused = false;
            if (window.game.combat) {
                window.game.combat.isPaused = true;
            }
        }

        this.showOverlay();
        this.updateSecondUI(5);
        this.playTickSfx();
    }

    update(dt) {
        if (!this.isActive) return;
        this.timer -= dt;
        const rhythm = (typeof window !== 'undefined' && window.game) ? window.game.rhythm : null;

        if (this.timer > 0) {
            const progress = Math.min(1.0, Math.max(0, 1.0 - (this.timer / this.duration)));
            if (rhythm) {
                rhythm.customSongTime = this.startSongTime + (this.targetSongTime - this.startSongTime) * progress;
            }

            const sec = Math.min(5, Math.max(1, Math.ceil(this.timer)));
            if (sec !== this.currentSecond) {
                this.currentSecond = sec;
                this.updateSecondUI(sec);
                this.playTickSfx();
            }
        } else {
            this.finishCountdown();
        }
    }

    updateSecondUI(sec) {
        if (!this.numEl || !this.subEl) return;
        this.numEl.innerText = sec;
        if (this.numEl.classList) {
            this.numEl.classList.remove('pop');
            if (typeof this.numEl.offsetWidth !== 'undefined') void this.numEl.offsetWidth;
            this.numEl.classList.add('pop');
        }

        const subtitlesStart = {
            5: "PREPARE-SE!",
            4: "POSICIONE OS DEDOS!",
            3: "AFINE AS CORDAS!",
            2: "ATENÇÃO!",
            1: "QUASE LÁ!"
        };
        const subtitlesResume = {
            5: "RETOMANDO PARTIDA!",
            4: "POSICIONE OS DEDOS!",
            3: "OLHO NA PISTA!",
            2: "ATENÇÃO!",
            1: "QUASE LÁ!"
        };
        const colors = {
            5: '#00f0ff',
            4: '#ffdd00',
            3: '#ff9900',
            2: '#ff3366',
            1: '#ff2222'
        };

        const subs = (this.mode === 'resume') ? subtitlesResume : subtitlesStart;
        this.subEl.innerText = subs[sec] || "PREPARE-SE!";
        if (this.numEl.style) this.numEl.style.color = colors[sec] || '#00f0ff';
        if (this.modePillEl) {
            this.modePillEl.innerText = (this.mode === 'resume') ? "⏸️ RETOMAR" : "🎸 PREPARAÇÃO";
        }
    }

    playTickSfx() {
        if (typeof window !== 'undefined' && window.soundEngine && typeof window.soundEngine.playDrum === 'function') {
            window.soundEngine.playDrum('hihat');
        }
    }

    finishCountdown() {
        this.isActive = false;
        const rhythm = (typeof window !== 'undefined' && window.game) ? window.game.rhythm : null;

        if (rhythm) {
            rhythm.isCountdownActive = false;
            rhythm.customSongTime = this.targetSongTime;
            if (rhythm.songAudio) {
                try {
                    rhythm.songAudio.currentTime = Math.max(0, this.targetSongTime);
                    const p = rhythm.songAudio.play();
                    if (p !== undefined) p.catch(() => { rhythm.audioNeedsUnlock = true; });
                } catch (e) {
                    console.warn("Audio countdown start error", e);
                }
            }
        }

        if (typeof window !== 'undefined' && window.game) {
            window.game.isBattlePaused = false;
            if (window.game.combat) {
                window.game.combat.isPaused = false;
                window.game.combat.matchActive = true;
            }
        }

        if (this.numEl) {
            this.numEl.innerText = "ROCK! 🤘";
            if (this.numEl.style) this.numEl.style.color = "#00ff66";
            if (this.numEl.classList) {
                this.numEl.classList.remove('pop');
                if (typeof this.numEl.offsetWidth !== 'undefined') void this.numEl.offsetWidth;
                this.numEl.classList.add('pop');
            }
        }
        if (this.subEl) {
            this.subEl.innerText = "VAI COM TUDO!";
            if (this.subEl.style) this.subEl.style.color = "#ffdd00";
        }

        if (typeof window !== 'undefined' && window.soundEngine) {
            if (typeof window.soundEngine.playPowerChord === 'function') {
                window.soundEngine.playPowerChord(0);
            } else if (typeof window.soundEngine.playGuitarChord === 'function') {
                window.soundEngine.playGuitarChord(0);
            }
        }

        if (this.finishTimeout) clearTimeout(this.finishTimeout);
        this.finishTimeout = setTimeout(() => {
            this.hideOverlay();
            if (typeof this.onComplete === 'function') {
                this.onComplete();
                this.onComplete = null;
            }
        }, 550);
    }

    showOverlay() {
        if (!this.overlayEl) this.initDOM();
        if (this.overlayEl && this.overlayEl.style) {
            this.overlayEl.style.display = 'flex';
            if (this.overlayEl.classList) this.overlayEl.classList.remove('hide');
        }
    }

    hideOverlay() {
        if (this.overlayEl && this.overlayEl.classList) {
            this.overlayEl.classList.add('hide');
            setTimeout(() => {
                if (!this.isActive && this.overlayEl && this.overlayEl.style) {
                    this.overlayEl.style.display = 'none';
                }
            }, 250);
        }
    }

    cancel() {
        this.isActive = false;
        if (this.finishTimeout) { clearTimeout(this.finishTimeout); this.finishTimeout = null; }
        const rhythm = (typeof window !== 'undefined' && window.game) ? window.game.rhythm : null;
        if (rhythm) rhythm.isCountdownActive = false;
        if (this.overlayEl && this.overlayEl.style) {
            this.overlayEl.style.display = 'none';
            if (this.overlayEl.classList) this.overlayEl.classList.remove('hide');
        }
    }
}

// Global instance setup
if (typeof window !== 'undefined') {
    window.CountdownSystem = CountdownSystem;
    window.countdownSystem = new CountdownSystem();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CountdownSystem };
}
