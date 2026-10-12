// Audio Engine using Web Audio API (Procedural Rock Sounds)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this.distortionCurve = this.makeDistortionCurve(50);
        this.initialized = false;

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
            this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
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
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
        }
        return this.muted;
    }

    makeDistortionCurve(amount = 50) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
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
        this.resume();

        const chord = this.chords[chordIndex % this.chords.length];
        const now = this.ctx.currentTime;
        const duration = 0.55;

        // Create distortion waveshaper
        const waveshaper = this.ctx.createWaveShaper();
        waveshaper.curve = this.distortionCurve;
        waveshaper.oversample = '4x';

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
            // Noise burst
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
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
}

window.soundEngine = new SoundEngine();
