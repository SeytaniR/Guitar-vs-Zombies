// Audio Engine using Web Audio API (Procedural Rock Sounds)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this.distortionCurve = this.makeDistortionCurve(50);
        this.initialized = false;
        this.crowdMasterGain = null;
        this.crowdPaths = { cheer: 'assets/audio/crowd_cheer.ogg', boo: 'assets/audio/crowd_boo.mp3' };
        this.crowdBuffers = { cheer: null, boo: null };
        this.crowdLoading = { cheer: null, boo: null };
        this.crowdActive = null;
        this._crowdReqToken = 0;

        // Rock power chords (frequencies in Hz: Root, 5th, Octave)
        this.chords = [
            [82.41, 123.47, 164.81],   // E5
            [98.00, 146.83, 196.00],   // G5
            [110.00, 164.81, 220.00],  // A5
            [130.81, 196.00, 261.63],  // C5
            [146.83, 220.00, 293.66]   // D5
        ];
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.crowdMasterGain = this.ctx.createGain();
            this.crowdMasterGain.gain.setValueAtTime(this.muted ? 0 : 1.0, this.ctx.currentTime);
            this.crowdMasterGain.connect(this.ctx.destination);
            this.initialized = true;
            this.preloadCrowdSfx();
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.ctx) {
            if (this.masterGain) this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
            if (this.crowdMasterGain) this.crowdMasterGain.gain.setValueAtTime(this.muted ? 0 : 1.0, this.ctx.currentTime);
        }
        if (this.crowdActive && this.crowdActive.audioEl) this.crowdActive.audioEl.muted = this.muted;
        return this.muted;
    }

    makeDistortionCurve(amount = 50) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 1024;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    playGuitarChord(chordIndex = 0) {
        if (!this.ctx || this.muted) return;
        const tMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (this._lastChordMs && (tMs - this._lastChordMs) < 22) return;
        this._lastChordMs = tMs;
        this.resume();

        const chord = this.chords[chordIndex % this.chords.length];
        const now = this.ctx.currentTime;
        const duration = 0.55;

        // Create distortion waveshaper (zero 4x FIR resampling overhead on mobile)
        const waveshaper = this.ctx.createWaveShaper();
        waveshaper.curve = this.distortionCurve;
        waveshaper.oversample = 'none';

        // Lowpass filter for warm amp tone
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);

        // Gain envelope
        const chordGain = this.ctx.createGain();
        chordGain.gain.setValueAtTime(0.35, now);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        waveshaper.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.masterGain);

        // 3 oscillators per power chord
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = idx === 0 ? 'sawtooth' : 'square';
            osc.frequency.setValueAtTime(freq, now);
            // Slight detune for fat chorus feel
            osc.detune.setValueAtTime((idx - 1) * 7, now);
            osc.connect(waveshaper);
            osc.start(now);
            osc.stop(now + duration);
        });
    }

    playSustainTick(lane = 0) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const chord = this.chords[lane % this.chords.length];
        const freq = chord[1] || 164.81;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.5, now);
        osc.frequency.linearRampToValueAtTime(freq * 1.52, now + 0.04);
        osc.frequency.linearRampToValueAtTime(freq * 1.48, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playDrum(type = 'kick') {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;

        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'snare') {
            // Reuse cached noise buffer per sampleRate (zero per-hit Float32Array allocation)
            if (!this._snareNoiseBuf || this._snareNoiseBuf.sampleRate !== this.ctx.sampleRate) {
                const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                this._snareNoiseBuf = buffer;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = this._snareNoiseBuf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start(now);
        }
    }

    playHit() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playExplosion() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playPowerChord(chordIndex = 0) {
        this.playGuitarChord(chordIndex || 0);
    }

    playMultiKill(tier = 1) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const baseFreq = 120 * Math.pow(1.14, Math.min(8, tier));
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = tier >= 4 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, now + 0.16);
        gain.gain.setValueAtTime(Math.min(0.42, 0.2 + tier * 0.03), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.22);

        if (tier >= 3) this.playDrum('kick');
        if (tier >= 5) this.playExplosion();
    }

    playSkillSfx(type = 'dps') {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;

        try {
            if (type === 'burn' || type === 'aoe_burn' || type === 'fire') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.32);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.32);
            } else if (type === 'stun' || type === 'emp' || type === 'chain_lightning' || type === 'radiation') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(680, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.22);
            } else if (type === 'earthquake' || type === 'heavy_dps' || type === 'cataclysm' || type === 'heavy_aoe') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(95, now);
                osc.frequency.exponentialRampToValueAtTime(25, now + 0.40);
                gain.gain.setValueAtTime(0.48, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.40);
                this.playDrum('kick');
            } else if (type === 'heal' || type === 'shield' || type === 'buff') {
                [330, 440, 660].forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + 0.35);
                });
            } else {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.18);
            }
        } catch(e) {}
    }

    preloadCrowdSfx() {
        if (!this.ctx || typeof fetch !== 'function') return;
        this.loadCrowdBuffer('cheer');
        this.loadCrowdBuffer('boo');
    }

    loadCrowdBuffer(type) {
        if (this.crowdBuffers[type]) return Promise.resolve(this.crowdBuffers[type]);
        if (this.crowdLoading[type]) return this.crowdLoading[type];
        const url = this.crowdPaths[type];
        if (!this.ctx || !url || typeof fetch !== 'function') return Promise.resolve(null);
        this.crowdLoading[type] = fetch(url)
            .then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error('HTTP ' + res.status)))
            .then(buf => this.ctx.decodeAudioData(buf))
            .then(decoded => {
                this.crowdBuffers[type] = decoded;
                this.crowdLoading[type] = null;
                return decoded;
            })
            .catch(() => { this.crowdLoading[type] = null; return null; });
        return this.crowdLoading[type];
    }

    fadeOutAndStopCrowd(entry, fadeSec = 0.30) {
        if (!entry) return;
        entry.isFadingOut = true;
        if (entry.fadeTimer) { clearInterval(entry.fadeTimer); entry.fadeTimer = null; }
        if (entry.stopTimer) { clearTimeout(entry.stopTimer); entry.stopTimer = null; }

        if (entry.gainNode && entry.source && this.ctx) {
            try {
                const now = this.ctx.currentTime;
                const g = entry.gainNode.gain;
                const curVal = Math.max(0.0001, (typeof g.value === 'number' && g.value > 0) ? g.value : (entry.targetVol || 0.6));
                g.cancelScheduledValues(now);
                g.setValueAtTime(curVal, now);
                g.linearRampToValueAtTime(0.0001, now + fadeSec);
                entry.source.stop(now + fadeSec + 0.03);
            } catch (e) {}
        } else if (entry.audioEl) {
            const el = entry.audioEl;
            const steps = Math.max(2, Math.round((fadeSec * 1000) / 30));
            const startVol = el.volume || 0;
            let step = 0;
            entry.fadeTimer = setInterval(() => {
                step++;
                el.volume = Math.max(0, startVol * (1 - step / steps));
                if (step >= steps) {
                    clearInterval(entry.fadeTimer);
                    entry.fadeTimer = null;
                    try { el.pause(); el.currentTime = 0; } catch (e) {}
                }
            }, 30);
        }
        if (this.crowdActive === entry) this.crowdActive = null;
    }

    stopCrowdSfx(fadeSec = 0.35) {
        this._crowdReqToken++;
        if (this.crowdActive) this.fadeOutAndStopCrowd(this.crowdActive, fadeSec);
    }

    _startWebAudioCrowd(type, buffer, fadeIn, fadeOut, volume) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.ctx.createGain();
        source.connect(gainNode);
        gainNode.connect(this.crowdMasterGain || this.ctx.destination);

        const now = this.ctx.currentTime;
        const dur = Math.max(0.5, buffer.duration || (type === 'cheer' ? 9.5 : 2.5));
        const fi = Math.min(fadeIn, dur * 0.35);
        const fo = Math.min(fadeOut, dur * 0.45);
        const fadeOutStart = Math.max(now + fi, now + dur - fo);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + fi);
        gainNode.gain.setValueAtTime(volume, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0.0001, now + dur);

        const entry = {
            type, source, gainNode, audioEl: null, startedAt: now, duration: dur,
            endTime: now + dur, fadeOutSec: fo, targetVol: volume,
            isFadingOut: false, fadeTimer: null, stopTimer: null
        };
        this.crowdActive = entry;
        source.onended = () => { if (this.crowdActive === entry) this.crowdActive = null; };
        source.start(now);
        return entry;
    }

    _startHtmlAudioCrowd(type, fadeIn, fadeOut, volume) {
        const url = this.crowdPaths[type];
        if (typeof Audio === 'undefined' || !url) return null;
        const audioEl = new Audio(url);
        audioEl.volume = 0;
        audioEl.muted = this.muted;
        const entry = {
            type, source: null, gainNode: null, audioEl, startedAt: performance.now() / 1000,
            duration: type === 'cheer' ? 9.5 : 2.5, fadeOutSec: fadeOut,
            targetVol: volume, isFadingOut: false, fadeTimer: null, stopTimer: null
        };
        this.crowdActive = entry;

        const fiMs = Math.max(60, fadeIn * 1000);
        const steps = Math.max(2, Math.round(fiMs / 30));
        let step = 0;
        entry.fadeTimer = setInterval(() => {
            if (entry.isFadingOut) { clearInterval(entry.fadeTimer); entry.fadeTimer = null; return; }
            step++;
            audioEl.volume = Math.min(entry.targetVol, entry.targetVol * (step / steps));
            if (step >= steps) { clearInterval(entry.fadeTimer); entry.fadeTimer = null; }
        }, 30);

        audioEl.addEventListener('timeupdate', () => {
            if (entry.isFadingOut || !audioEl.duration || isNaN(audioEl.duration)) return;
            entry.duration = audioEl.duration;
            const rem = audioEl.duration - audioEl.currentTime;
            if (rem <= entry.fadeOutSec && rem >= 0) {
                audioEl.volume = Math.max(0, entry.targetVol * (rem / Math.max(0.05, entry.fadeOutSec)));
            }
        });
        audioEl.addEventListener('ended', () => {
            if (entry.fadeTimer) { clearInterval(entry.fadeTimer); entry.fadeTimer = null; }
            if (this.crowdActive === entry) this.crowdActive = null;
        });
        const p = audioEl.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
        return entry;
    }

    playCrowdSfx(type, opts = {}) {
        if (this.muted) return { started: false, continued: false, muted: true, type };
        const fadeIn = opts.fadeIn != null ? opts.fadeIn : 0.30;
        const fadeOut = opts.fadeOut != null ? opts.fadeOut : 0.75;
        const volume = opts.volume != null ? opts.volume : 0.62;
        this.resume();

        const active = this.crowdActive;
        if (active) {
            let remaining = 0;
            if (active.gainNode && this.ctx) {
                remaining = active.endTime - this.ctx.currentTime;
            } else if (active.audioEl) {
                const dur = (active.audioEl.duration && !isNaN(active.audioEl.duration)) ? active.audioEl.duration : active.duration;
                remaining = !active.audioEl.ended ? Math.max(0, dur - (active.audioEl.currentTime || 0)) : 0;
            }
            const minContinue = (type === 'cheer') ? 1.2 : 0.6;
            if (active.type === type && remaining > minContinue) {
                const target = Math.max(active.targetVol, volume);
                active.targetVol = target;
                active.isFadingOut = false;
                if (active.gainNode && this.ctx) {
                    const now = this.ctx.currentTime;
                    const g = active.gainNode.gain;
                    const curVal = Math.max(0.0001, (typeof g.value === 'number' && g.value > 0) ? g.value : active.targetVol);
                    const swellDur = Math.min(fadeIn, 0.30, remaining * 0.3);
                    const tailFade = Math.min(fadeOut, Math.max(0.25, (remaining - swellDur) * 0.45));
                    const tailStart = Math.max(now + swellDur, active.endTime - tailFade);
                    g.cancelScheduledValues(now);
                    g.setValueAtTime(curVal, now);
                    g.linearRampToValueAtTime(target, now + swellDur);
                    g.setValueAtTime(target, tailStart);
                    g.linearRampToValueAtTime(0.0001, active.endTime);
                } else if (active.audioEl) {
                    if (active.fadeTimer) { clearInterval(active.fadeTimer); active.fadeTimer = null; }
                    const startV = active.audioEl.volume || 0;
                    let step = 0;
                    active.fadeTimer = setInterval(() => {
                        step++;
                        active.audioEl.volume = Math.min(target, startV + (target - startV) * (step / 6));
                        if (step >= 6) { clearInterval(active.fadeTimer); active.fadeTimer = null; }
                    }, 30);
                }
                return { started: false, continued: true, type };
            }
            this.fadeOutAndStopCrowd(active, active.type === type ? 0.25 : 0.22);
        }

        const token = ++this._crowdReqToken;
        if (this.ctx && this.crowdBuffers[type]) {
            this._startWebAudioCrowd(type, this.crowdBuffers[type], fadeIn, fadeOut, volume);
            return { started: true, continued: false, type, backend: 'webaudio' };
        }
        if (this.ctx && typeof fetch === 'function') {
            this.loadCrowdBuffer(type).then(buf => {
                if (token !== this._crowdReqToken || this.muted) return;
                if (this.crowdActive && this.crowdActive.type === type) return;
                if (buf) this._startWebAudioCrowd(type, buf, fadeIn, fadeOut, volume);
                else this._startHtmlAudioCrowd(type, fadeIn, fadeOut, volume);
            });
            return { started: true, continued: false, pending: true, type };
        }
        this._startHtmlAudioCrowd(type, fadeIn, fadeOut, volume);
        return { started: true, continued: false, type, backend: 'htmlaudio' };
    }

    playCrowdCheer(opts = {}) { return this.playCrowdSfx('cheer', { fadeIn: 0.35, fadeOut: 0.85, volume: 0.62, ...opts }); }
    playCrowdBoo(opts = {}) { return this.playCrowdSfx('boo', { fadeIn: 0.18, fadeOut: 0.55, volume: 0.65, ...opts }); }
}

window.soundEngine = new SoundEngine();
