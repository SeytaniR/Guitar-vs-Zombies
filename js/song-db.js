// Song Database & Storage System (IndexedDB + Export/Import Engine)
class SongDB {
    constructor() {
        this.dbName = 'GVS_MusicStudio_DB';
        this.dbVersion = 1;
        this.db = null;
        this.defaultSongId = 'default_thunder_strike';
    }

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('songs')) {
                    const store = db.createObjectStore('songs', { keyPath: 'id' });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
            };

            request.onsuccess = async (e) => {
                this.db = e.target.result;
                // Ensure default starter song exists
                await this.ensureDefaultSong();
                setTimeout(() => this.syncBrowserCustomSongs(), 600);
                resolve(this.db);
            };

            request.onerror = (e) => {
                console.error("IndexedDB open error:", e);
                reject(e);
            };
        });
    }

    async ensureDefaultSong() {
        try {
            const existing1 = await this.getSong('default_thunder_strike');
            if (!existing1) {
                const s1 = await this.createDefaultRockSong('default_thunder_strike', 'Thunder Strike', 'Cyber Shock', 136, 'assets/covers/default_cover.jpg');
                await this.saveSong(s1);
            }

            const existing2 = await this.getSong('default_hellfire_riff');
            if (!existing2) {
                const s2 = await this.createDefaultRockSong('default_hellfire_riff', 'Hellfire Riff', 'Johnny Blaze', 148, 'assets/heroes/johnny_blaze.jpg');
                await this.saveSong(s2);
            }

            const existing3 = await this.getSong('default_anarchy_riot');
            if (!existing3) {
                const s3 = await this.createDefaultRockSong('default_anarchy_riot', 'Anarchy Riot', 'Roxie Anarchy', 160, 'assets/heroes/roxie_anarchy.jpg');
                await this.saveSong(s3);
            }

            const existing4 = await this.getSong('default_gravit_stand');
            if (!existing4) {
                let gravitData = null;
                try {
                    const res = await fetch('assets/songs/gravit_stand.json');
                    if (res.ok) gravitData = await res.json();
                } catch(err) {}

                if (gravitData && gravitData.notes) {
                    gravitData.id = 'default_gravit_stand';
                    gravitData.isDefault = true;
                    await this.saveSong(gravitData);
                } else {
                    const s4 = await this.createDefaultRockSong('default_gravit_stand', 'Gravit Stand', 'Antigravity Rockers', 142, 'assets/branding/wallpaper.jpg');
                    s4.description = 'Faixa original lendária de alta voltagem (142 BPM)! Sincronia pesada para o apocalipse zumbi.';
                    await this.saveSong(s4);
                }
            }
        } catch (e) {
            console.warn("Could not check/create default starter song:", e);
        }
    }

    async syncBrowserCustomSongs() {
        try {
            const songs = await this.getAllSongs();
            if (!songs || songs.length === 0) return;
            for (const s of songs) {
                const titleLower = (s.title || '').toLowerCase();
                const isGravit = titleLower.includes('gravit');
                const isCustom = !s.isDefault || isGravit;
                if (isCustom && s.notes && s.notes.length > 0) {
                    fetch('/api/sync-song', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(s)
                    }).then(r => r.json()).then(data => {
                        if (data && data.success) {
                            console.log(`[AutoSync] ✅ Música "${s.title}" sincronizada com o servidor!`);
                        }
                    }).catch(() => {});
                }
            }
        } catch (e) {
            console.warn('[AutoSync] Error checking custom songs:', e);
        }
    }

    // Generates a complete 30-second procedural heavy rock song with charted notes
    async createDefaultRockSong(id = 'default_thunder_strike', title = 'Thunder Strike', artist = 'Cyber Shock', bpm = 136, cover = 'assets/covers/default_cover.jpg') {
        // High quality charted notes for a 30s rock solo at 136 BPM
        // 136 BPM = 2.266 beats/sec = 0.4411s per beat
        bpm = Math.max(60, bpm || 136);
        const beatSec = 60 / bpm;
        const notes = [];

        // Chart pattern: intro groove -> solo riffs -> climax
        const pattern = [
            // Intro (beats 4 to 12)
            { b: 4, l: 0 }, { b: 5, l: 1 }, { b: 6, l: 0 }, { b: 7, l: 2 },
            { b: 8, l: 0 }, { b: 9, l: 1 }, { b: 10, l: 2 }, { b: 11, l: 3 },
            // Riff 1 (beats 12 to 24)
            { b: 12, l: 0 }, { b: 12.5, l: 0 }, { b: 13, l: 1 }, { b: 14, l: 2 },
            { b: 15, l: 3 }, { b: 16, l: 2 }, { b: 17, l: 1 }, { b: 18, l: 0 },
            { b: 19, l: 1 }, { b: 19.5, l: 2 }, { b: 20, l: 3 }, { b: 21, l: 2 },
            { b: 22, l: 1 }, { b: 23, l: 0 },
            // Fast Solo Section (beats 24 to 40)
            { b: 24, l: 0 }, { b: 24.5, l: 1 }, { b: 25, l: 2 }, { b: 25.5, l: 3 },
            { b: 26, l: 2 }, { b: 26.5, l: 1 }, { b: 27, l: 0 }, { b: 28, l: 3 },
            { b: 29, l: 2 }, { b: 29.5, l: 1 }, { b: 30, l: 0 }, { b: 31, l: 1 },
            { b: 32, l: 2 }, { b: 32.5, l: 3 }, { b: 33, l: 2 }, { b: 33.5, l: 1 },
            { b: 34, l: 0 }, { b: 35, l: 1 }, { b: 36, l: 2 }, { b: 37, l: 3 },
            { b: 38, l: 2 }, { b: 39, l: 1 }, { b: 40, l: 0 },
            // Climax Thunder Riff (beats 41 to 58)
            { b: 41, l: 3 }, { b: 41.5, l: 2 }, { b: 42, l: 1 }, { b: 42.5, l: 0 },
            { b: 43, l: 1 }, { b: 44, l: 2 }, { b: 44.5, l: 3 }, { b: 45, l: 2 },
            { b: 46, l: 1 }, { b: 47, l: 0 }, { b: 48, l: 3 }, { b: 49, l: 2 },
            { b: 50, l: 1 }, { b: 50.5, l: 2 }, { b: 51, l: 3 }, { b: 52, l: 0 },
            { b: 53, l: 1 }, { b: 54, l: 2 }, { b: 55, l: 3 }, { b: 56, l: 3 },
            { b: 57, l: 2 }, { b: 58, l: 0 }
        ];

        pattern.forEach(p => {
            notes.push({
                time: Math.round((p.b * beatSec) * 1000) / 1000,
                lane: p.l,
                id: 'n_' + Math.random().toString(36).substr(2, 9)
            });
        });

        // Generate synthetic audio for the starter track
        const audioData = await this.synthesizeRockAudioWav(30, bpm);

        return {
            id: id,
            title: title,
            artist: artist,
            description: `Faixa oficial de alta voltagem (${bpm} BPM)! Perfeita para detonar hordas mutantes no asfalto.`,
            bpm: bpm,
            duration: 30,
            cover: cover,
            audioData: audioData,
            notes: notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDefault: true
        };
    }

    // Synthesizes a real 16-bit PCM WAV audio file using OfflineAudioContext
    async synthesizeRockAudioWav(durationSec = 30, bpm = 136) {
        try {
            const sampleRate = 22050; // Lightweight & responsive
            const totalSamples = sampleRate * durationSec;
            const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            const offline = new OfflineCtx(1, totalSamples, sampleRate);

            const beatSec = 60 / bpm;
            const totalBeats = Math.floor(durationSec / beatSec);

            // Chords: E5, G5, A5, C5, D5
            const chordFreqs = [
                [82.41, 123.47, 164.81],
                [98.00, 146.83, 196.00],
                [110.00, 164.81, 220.00],
                [130.81, 196.00, 261.63],
                [146.83, 220.00, 293.66]
            ];

            // Waveshaper distortion
            const waveshaper = offline.createWaveShaper();
            const n_samples = 4096;
            const curve = new Float32Array(n_samples);
            const k = 45;
            const deg = Math.PI / 180;
            for (let i = 0; i < n_samples; ++i) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
            }
            waveshaper.curve = curve;

            // Master Filter
            const filter = offline.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2600, 0);

            waveshaper.connect(filter);
            filter.connect(offline.destination);

            // Program Drums and Guitar Riffs across beats
            for (let b = 0; b < totalBeats; b++) {
                const t = b * beatSec;
                if (t >= durationSec - 0.5) break;

                // 1. Drums (Kick on 1 & 3, Snare on 2 & 4)
                if (b % 2 === 0) {
                    // Kick drum
                    const osc = offline.createOscillator();
                    const gain = offline.createGain();
                    osc.frequency.setValueAtTime(130, t);
                    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
                    gain.gain.setValueAtTime(0.7, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
                    osc.connect(gain);
                    gain.connect(offline.destination);
                    osc.start(t);
                    osc.stop(t + 0.14);
                } else {
                    // Snare drum
                    const osc = offline.createOscillator();
                    const gain = offline.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(200, t);
                    osc.frequency.exponentialRampToValueAtTime(70, t + 0.1);
                    gain.gain.setValueAtTime(0.45, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                    osc.connect(gain);
                    gain.connect(offline.destination);
                    osc.start(t);
                    osc.stop(t + 0.1);
                }

                // 2. Guitar Chords (Change every 4 beats)
                const chordIdx = Math.floor(b / 4) % chordFreqs.length;
                const freqs = chordFreqs[chordIdx];
                const chordDuration = beatSec * 0.9;

                const chordGain = offline.createGain();
                chordGain.gain.setValueAtTime(0.22, t);
                chordGain.gain.exponentialRampToValueAtTime(0.01, t + chordDuration);
                chordGain.connect(waveshaper);

                freqs.forEach((f, i) => {
                    const osc = offline.createOscillator();
                    osc.type = i === 0 ? 'sawtooth' : 'square';
                    osc.frequency.setValueAtTime(f, t);
                    osc.connect(chordGain);
                    osc.start(t);
                    osc.stop(t + chordDuration);
                });
            }

            const renderedBuffer = await offline.startRendering();
            return this.audioBufferToWavDataUrl(renderedBuffer);
        } catch (err) {
            console.warn("Offline rendering fallback:", err);
            return "";
        }
    }

    // Converts an AudioBuffer to a valid WAV Data URL
    audioBufferToWavDataUrl(buffer) {
        const numChannels = 1;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const data = buffer.getChannelData(0);
        const dataLength = data.length * bytesPerSample;
        const bufferLength = 44 + dataLength;

        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);

        // RIFF chunk
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');

        // FMT chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);

        // DATA chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Write 16-bit PCM samples
        let offset = 44;
        for (let i = 0; i < data.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        // Convert to Base64 Data URL
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        const chunkSize = 8192;
        for (let i = 0; i < len; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
            binary += String.fromCharCode.apply(null, chunk);
        }
        return 'data:audio/wav;base64,' + btoa(binary);
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    async getAllSongs() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('songs', 'readonly');
            const store = tx.objectStore('songs');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e);
        });
    }

    async getSong(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('songs', 'readonly');
            const store = tx.objectStore('songs');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e);
        });
    }

    async saveSong(song) {
        await this.init();
        song.updatedAt = Date.now();
        if (!song.createdAt) song.createdAt = Date.now();
        if (!song.id) song.id = 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('songs', 'readwrite');
            const store = tx.objectStore('songs');
            const request = store.put(song);

            request.onsuccess = () => resolve(song);
            request.onerror = (e) => reject(e);
        });
    }

    async deleteSong(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('songs', 'readwrite');
            const store = tx.objectStore('songs');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e);
        });
    }

    // Export a single song as a .gvsong (JSON package)
    async exportSong(id) {
        const song = await this.getSong(id);
        if (!song) throw new Error("Música não encontrada para exportar");

        const exportPayload = {
            format: 'GuitarVsZombies_SongPackage',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            song: {
                id: song.id,
                title: song.title,
                artist: song.artist,
                description: song.description,
                bpm: song.bpm || 120,
                duration: song.duration,
                cover: song.cover,
                audioData: song.audioData,
                notes: song.notes || []
            }
        };

        const jsonStr = JSON.stringify(exportPayload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const safeTitle = (song.title || 'musica').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeArtist = (song.artist || 'artista').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}-${safeArtist}.gvsong`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return filename;
    }

    // Generate balanced rock chart notes for a given duration and BPM
    generateFallbackChart(durationSec = 30, bpm = 120) {
        durationSec = Math.max(15, durationSec || 30);
        bpm = Math.max(60, Math.min(240, bpm || 120));
        const beatSec = 60 / bpm;
        const totalBeats = Math.floor(durationSec / beatSec);
        const notes = [];

        for (let b = 2; b < totalBeats; b++) {
            const time = b * beatSec;
            if (time > durationSec - 1) break;

            const measureBeat = b % 8;
            let lane = 0;
            let dur = 0;
            if (measureBeat === 0) {
                lane = 0;
                dur = 1.0; // Sustained root note
            } else if (measureBeat === 2 || measureBeat === 6) {
                lane = 2;
            } else if (measureBeat === 4) {
                lane = 1;
                dur = 0.8; // Power chord sustain
            } else if (measureBeat === 7) {
                lane = 3;
            } else {
                lane = (b % 4);
            }

            notes.push({
                time: Math.round(time * 1000) / 1000,
                lane: lane,
                duration: dur,
                id: 'n_' + Math.random().toString(36).substr(2, 9)
            });
        }
        return notes;
    }

    // Direct Audio Import: converts any MP3, WAV, OGG, M4A into a fully playable custom song
    async importAudioFileAsSong(file) {
        return new Promise(async (resolve, reject) => {
            try {
                // Clean title and artist from filename
                const rawName = file.name.replace(/\.[^/.]+$/, "");
                let title = rawName;
                let artist = 'Artista Importado';

                if (rawName.includes(' - ')) {
                    const parts = rawName.split(' - ');
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                } else if (rawName.includes('_-_')) {
                    const parts = rawName.split('_-_');
                    artist = parts[0].replace(/_/g, ' ').trim();
                    title = parts.slice(1).join(' ').replace(/_/g, ' ').trim();
                } else {
                    title = rawName.replace(/[_]+/g, ' ').trim();
                }

                // 1. Determine duration quickly using ObjectURL
                let duration = 30;
                try {
                    const blobUrl = URL.createObjectURL(file);
                    duration = await new Promise((res) => {
                        const testAudio = new Audio();
                        testAudio.src = blobUrl;
                        const timer = setTimeout(() => {
                            URL.revokeObjectURL(blobUrl);
                            // Fallback estimate based on file size (~16KB/s for 128kbps audio)
                            const estimated = Math.max(20, Math.min(300, Math.round(file.size / 16000)));
                            res(estimated || 35);
                        }, 2200);

                        testAudio.onloadedmetadata = () => {
                            clearTimeout(timer);
                            URL.revokeObjectURL(blobUrl);
                            if (testAudio.duration && !isNaN(testAudio.duration) && testAudio.duration > 0) {
                                res(Math.round(testAudio.duration));
                            } else {
                                res(35);
                            }
                        };
                        testAudio.onerror = () => {
                            clearTimeout(timer);
                            URL.revokeObjectURL(blobUrl);
                            res(35);
                        };
                    });
                } catch (e) {
                    duration = 35;
                }

                // 2. Read full audio data as Data URL for persistent IndexedDB storage
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    try {
                        const audioData = evt.target.result;
                        const bpm = 128;
                        const notes = this.generateFallbackChart(duration, bpm);

                        const newSong = {
                            id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                            title: title || 'Faixa Importada',
                            artist: artist || 'Artista Desconhecido',
                            description: `Música importada diretamente de arquivo de áudio (${file.name}).`,
                            bpm: bpm,
                            duration: Math.max(15, duration),
                            cover: 'assets/covers/default_cover.jpg',
                            audioData: audioData,
                            notes: notes,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            isDefault: false
                        };

                        const saved = await this.saveSong(newSong);
                        resolve(saved);
                    } catch (err) {
                        reject(new Error("Falha ao salvar áudio no banco de dados: " + err.message));
                    }
                };

                reader.onerror = () => {
                    const errMsg = reader.error ? (reader.error.message || reader.error.name) : "Erro de leitura";
                    reject(new Error(`Falha ao ler dados do áudio (${file.name}): ${errMsg}`));
                };

                reader.readAsDataURL(file);
            } catch (err) {
                reject(err);
            }
        });
    }

    // Import a song file (.gvsong, .json, or audio .mp3/.wav/.ogg)
    async importSongFile(file) {
        if (!file) throw new Error("Nenhum arquivo fornecido para importação.");

        // Check if file is direct audio
        const isAudio = (file.type && file.type.startsWith('audio/')) ||
                        /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm|wma)$/i.test(file.name);

        if (isAudio) {
            return this.importAudioFileAsSong(file);
        }

        // Package Import (.gvsong or .json)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const text = e.target.result;

                    // If user renamed an audio file to .gvsong or .json, detect audio binary headers
                    if (text.startsWith('ID3') || text.startsWith('RIFF') || text.startsWith('OggS') || text.slice(0, 4).includes('\xFF\xFB')) {
                        console.log("Detectado áudio binário em arquivo importado. Redirecionando para importador de áudio...");
                        const audioSong = await this.importAudioFileAsSong(file);
                        resolve(audioSong);
                        return;
                    }

                    let parsed = null;
                    try {
                        parsed = JSON.parse(text);
                    } catch (jsonErr) {
                        // If not valid JSON, check if audio reader can process it
                        try {
                            const audioSong = await this.importAudioFileAsSong(file);
                            resolve(audioSong);
                            return;
                        } catch (audErr) {
                            throw new Error("Arquivo não reconhecido. Certifique-se de escolher um pacote .gvsong ou arquivo de áudio válido (.mp3, .wav, .ogg).");
                        }
                    }

                    let songData = null;
                    if (parsed && parsed.format === 'GuitarVsZombies_SongPackage' && parsed.song) {
                        songData = parsed.song;
                    } else if (parsed && (parsed.title || parsed.notes)) {
                        songData = parsed;
                    } else if (parsed && parsed.data && parsed.data.title) {
                        songData = parsed.data;
                    } else {
                        throw new Error("Formato de arquivo inválido. Deve ser um pacote .gvsong ou .json válido.");
                    }

                    // Sanitize & normalize fields
                    const rawTitle = (songData.title || file.name.replace(/\.[^/.]+$/, "") || 'Música Importada').trim();
                    const rawArtist = (songData.artist || 'Artista Desconhecido').trim();
                    const bpm = Math.max(40, Math.min(280, parseInt(songData.bpm, 10) || 120));
                    const duration = Math.max(15, parseFloat(songData.duration) || 30);
                    const cover = (typeof songData.cover === 'string' && songData.cover.length > 5)
                        ? songData.cover
                        : 'assets/covers/default_cover.jpg';

                    // Sanitize notes array
                    let notes = Array.isArray(songData.notes) ? songData.notes : [];
                    if (notes.length === 0) {
                        notes = this.generateFallbackChart(duration, bpm);
                    } else {
                        notes = notes.map(n => ({
                            time: Math.max(0, Math.round((parseFloat(n.time) || 0) * 1000) / 1000),
                            lane: Math.max(0, Math.min(3, parseInt(n.lane, 10) || 0)),
                            duration: Math.max(0, Math.round((parseFloat(n.duration) || 0) * 1000) / 1000),
                            id: n.id || ('n_' + Math.random().toString(36).substr(2, 9))
                        }));
                        notes.sort((a, b) => a.time - b.time);
                    }

                    // Validate audio data: if empty or dead blob url, synthesize heavy rock audio
                    let audioData = songData.audioData;
                    if (!audioData || typeof audioData !== 'string' || audioData.startsWith('blob:') || audioData.length < 50) {
                        console.log("Pacote importado sem áudio embutido; sintetizando trilha de rock...");
                        audioData = await this.synthesizeRockAudioWav(duration, bpm);
                    }

                    // Create fresh unique song object
                    const sanitizedSong = {
                        id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                        title: rawTitle,
                        artist: rawArtist,
                        description: songData.description || 'Música importada com sucesso no Estúdio de Ritmo.',
                        bpm: bpm,
                        duration: duration,
                        cover: cover,
                        audioData: audioData,
                        notes: notes,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isDefault: false
                    };

                    const saved = await this.saveSong(sanitizedSong);
                    resolve(saved);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => {
                const errMsg = reader.error ? (reader.error.message || reader.error.name) : "Falha na leitura do arquivo";
                reject(new Error(`Erro ao ler arquivo: ${errMsg}`));
            };

            reader.readAsText(file, 'utf-8');
        });
    }
}

window.songDB = new SongDB();
