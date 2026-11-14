// ==========================================================================
// SPECIAL SYSTEM - Solo Especial 2x Power-Up (PvE & PvP)
// Charges via player combo up to 100%. Single-use per match.
// Grants 2x Points and 2x Damage for the duration defined by the active guitarist.
// After activation, the meter exhausts and CANNOT recharge for that match.
// ==========================================================================
class SpecialSystem {
    constructor() {
        this.specialMeter = 0;           // 0 to 100 (%)
        this.isSpecialActive = false;     // True during active duration
        this.specialUsed = false;         // True once activated; blocks recharging
        this.specialDuration = 6.0;       // Duration in seconds (from active guitarist)
        this.specialDurationMax = 12.0;   // Strict ceiling/cap in seconds
        this.specialTimeLeft = 0;         // Countdown timer
        this.btnEl = null;
        this.fillEl = null;
        this.pctEl = null;
        this.initialized = false;
    }

    init() {
        this.btnEl = document.getElementById('battle-special-btn');
        this.fillEl = document.getElementById('special-progress-fill');
        this.pctEl = document.getElementById('special-meter-text');

        if (this.btnEl && !this.initialized) {
            if (typeof this.btnEl.addEventListener === 'function') {
                this.btnEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.activateSpecial();
                });
                this.btnEl.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });
            }
        }

        if (!this.initialized && typeof window !== 'undefined') {
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.key === ' ' || e.key === 's' || e.key === 'S') {
                    if (window.game && window.game.currentScreen === 'battle' && !window.game.isBattlePaused) {
                        if (this.canActivate()) {
                            e.preventDefault();
                            this.activateSpecial();
                        }
                    }
                }
            });
            this.initialized = true;
        }

        this.reset();
    }

    reset() {
        this.specialMeter = 0;
        this.isSpecialActive = false;
        this.specialUsed = false;
        this.specialTimeLeft = 0;

        // Fetch active hero special duration
        const heroStats = (window.guitaristPool && typeof window.guitaristPool.getHeroStats === 'function')
            ? window.guitaristPool.getHeroStats(window.guitaristPool.selectedGuitaristId)
            : null;
        this.specialDuration = (heroStats && heroStats.specialDuration) ? heroStats.specialDuration : 6.0;
        this.specialDurationMax = (heroStats && heroStats.specialDurationMax) ? heroStats.specialDurationMax : 12.0;

        if (window.game && window.game.combat) {
            window.game.combat.isSpecialActive = false;
        }

        this.updateUI();
    }

    onComboHit(combo) {
        if (this.specialUsed || this.isSpecialActive) return;
        // Charges based on combo: each hit gives base 2.0% + combo scaling up to 5.0%
        const comboBonus = Math.min(3.0, (combo || 0) * 0.08);
        const gain = 2.0 + comboBonus;
        this.specialMeter = Math.min(100, this.specialMeter + gain);
        this.updateUI();
    }

    canActivate() {
        return !this.specialUsed && !this.isSpecialActive && this.specialMeter >= 100;
    }

    activateSpecial() {
        if (!this.canActivate()) return false;

        // Mark as used immediately - can only be activated ONCE per battle!
        this.specialUsed = true;
        this.isSpecialActive = true;

        // Refresh duration from active hero
        const heroStats = (window.guitaristPool && typeof window.guitaristPool.getHeroStats === 'function')
            ? window.guitaristPool.getHeroStats(window.guitaristPool.selectedGuitaristId)
            : null;
        this.specialDuration = (heroStats && heroStats.specialDuration) ? heroStats.specialDuration : 6.0;
        this.specialDurationMax = (heroStats && heroStats.specialDurationMax) ? heroStats.specialDurationMax : 12.0;
        this.specialTimeLeft = Math.min(this.specialDurationMax, this.specialDuration);

        if (window.game && window.game.combat) {
            window.game.combat.isSpecialActive = true;
            const combat = window.game.combat;
            const heroPos = combat.getHeroPosition();

            // Audio & VFX explosive activation feedback
            if (window.soundEngine && typeof window.soundEngine.playPowerChord === 'function') {
                window.soundEngine.playPowerChord();
            }
            if (combat.fx) {
                combat.fx.spawnBurst(heroPos.x, heroPos.y, '#ffd700', 16, 90, 4, 0.5);
                combat.fx.shockwaves.push({ x: heroPos.x, y: heroPos.y, radius: 6, maxRadius: 55, color: '#ffd700', lineWidth: 4, alpha: 1.0 });
            }
            combat.triggerShake(9);
            combat.addFloatingText('🔥 SOLO ESPECIAL 2X ATIVADO! ⚡', combat.canvas.width / 2, combat.canvas.height * 0.42, '#ffd700', true);
        }

        this.updateUI();
        return true;
    }

    update(dt) {
        if (!this.isSpecialActive) return;

        this.specialTimeLeft -= dt;
        if (this.specialTimeLeft <= 0) {
            this.specialTimeLeft = 0;
            this.isSpecialActive = false;
            this.specialMeter = 0;

            if (window.game && window.game.combat) {
                window.game.combat.isSpecialActive = false;
                window.game.combat.addFloatingText('⚡ ESPECIAL ENCERRADO!', window.game.combat.canvas.width / 2, window.game.combat.canvas.height * 0.42, '#aaaaaa', false);
            }
        } else {
            // Visual meter drain while active to show duration remaining
            this.specialMeter = Math.max(0, (this.specialTimeLeft / this.specialDuration) * 100);
        }

        this.updateUI();
    }

    updateUI() {
        if (!this.btnEl) {
            this.btnEl = document.getElementById('battle-special-btn');
            this.fillEl = document.getElementById('special-progress-fill');
            this.pctEl = document.getElementById('special-meter-text');
        }
        if (!this.btnEl) return;

        const isReady = this.canActivate();
        const isActive = this.isSpecialActive;
        const isExhausted = this.specialUsed && !isActive;

        // Button interactive state
        this.btnEl.disabled = !isReady && !isActive;

        // CSS Classes
        if (this.btnEl.classList) {
            if (typeof this.btnEl.classList.toggle === 'function') {
                this.btnEl.classList.toggle('ready', isReady);
                this.btnEl.classList.toggle('active', isActive);
                this.btnEl.classList.toggle('exhausted', isExhausted);
            } else {
                if (isReady) this.btnEl.classList.add('ready'); else this.btnEl.classList.remove('ready');
                if (isActive) this.btnEl.classList.add('active'); else this.btnEl.classList.remove('active');
                if (isExhausted) this.btnEl.classList.add('exhausted'); else this.btnEl.classList.remove('exhausted');
            }
        }

        // Progress bar fill width
        if (this.fillEl && this.fillEl.style) {
            this.fillEl.style.width = `${Math.min(100, Math.max(0, this.specialMeter))}%`;
        }

        // Percentage / Status label
        if (this.pctEl) {
            if (isActive) {
                this.pctEl.innerText = `🔥 2X (${this.specialTimeLeft.toFixed(1)}s)`;
            } else if (isExhausted) {
                this.pctEl.innerText = 'USADO ✖';
            } else if (isReady) {
                this.pctEl.innerText = 'PRONTO! ⚡';
            } else {
                this.pctEl.innerText = `${Math.floor(this.specialMeter)}%`;
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.SpecialSystem = SpecialSystem;
    window.specialSystem = new SpecialSystem();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpecialSystem;
}
