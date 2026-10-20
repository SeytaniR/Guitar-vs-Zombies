// Interactive Visual Rhythm Chart Editor (Beatmapper, DAW & Multi-Track Sequencer)
class SongEditor {
    constructor() {
        this.song = null;
        this.audio = new Audio();
        this.isPlaying = false;
        this.isRecording = false;
        this.playbackRate = 1.0;
        this.currentTime = 0;
        this.duration = 30;

        // Visual Timeline settings
        this.canvas = null;
        this.ctx = null;
        this.tracks = 4;
        this.pixelsPerSecond = 140; // Zoom level (px/s)
        this.playheadRatio = 0.22; // 22% from left edge
        this.snapGrid = '1/4'; // 'none', '1/2', '1/4', '1/8', '1/16'

        this.colors = [
            { main: '#00ff66', glow: 'rgba(0, 255, 102, 0.45)', name: 'Verde' },
            { main: '#ff0055', glow: 'rgba(255, 0, 85, 0.45)', name: 'Vermelho' },
            { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.45)', name: 'Amarelo' },
            { main: '#00d4ff', glow: 'rgba(0, 212, 255, 0.45)', name: 'Azul' }
        ];

        this.undoStack = [];
        this.isDraggingTimeline = false;
        this.dragStartX = 0;
        this.dragStartTime = 0;
        this.hasDragged = false;

        // Hold / Sustain Note creation & resizing state
        this.noteMode = 'tap'; // 'tap' or 'hold'
        this.holdDuration = 1.0; // default hold duration in seconds
        this.isResizingNote = false;
        this.resizingTarget = null;
        this.resizeStartX = 0;
        this.resizeStartDuration = 0;
        this.padPressStartTime = [0, 0, 0, 0];
        this.padActiveNote = [null, null, null, null];

        // High-precision 60 FPS animation loop & reliable fallback software clock
        this.animFrameId = null;
        this.lastFrameTime = performance.now();
        this.isInitialized = false;

        this.setupAudioListeners();
    }

    initDOM() {
        if (this.isInitialized) {
            this.resizeCanvas();
            return;
        }
        this.isInitialized = true;

        this.canvas = document.getElementById('editor-timeline-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.setupCanvasInteractions();
        }

        this.setupControlsDOM();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width || 360;
        this.canvas.height = Math.max(220, rect.height || 220);
        this.drawTimeline();
    }

    setupAudioListeners() {
        this.audio.addEventListener('timeupdate', () => {
            if (this.isPlaying && this.audio && !this.audio.paused && this.audio.currentTime > 0) {
                this.currentTime = this.audio.currentTime;
                this.updateTimeDisplay();
                this.updateScrubber();
            }
        });

        this.audio.addEventListener('ended', () => {
            this.pause();
            this.currentTime = this.duration;
            this.updateTimeDisplay();
            this.updateScrubber();
            this.drawTimeline();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
                this.duration = this.audio.duration;
                if (this.song) this.song.duration = this.duration;
            }
            this.updateTimeDisplay();
            this.updateScrubber();
            this.drawTimeline();
        });

        this.audio.addEventListener('error', (e) => {
            console.warn("SongEditor: áudio nativo indisponível ou formato não suportado. Usando metrônomo por software.", e);
        });
    }

    loadSong(song) {
        this.song = JSON.parse(JSON.stringify(song)); // Deep clone
        if (!this.song.notes) this.song.notes = [];
        this.duration = Math.max(15, Number(this.song.duration) || 30);
        this.currentTime = 0;
        this.undoStack = [];

        // Load Audio Track Safely
        if (this.song.audioData && typeof this.song.audioData === 'string' && this.song.audioData.length > 50 && !this.song.audioData.startsWith('blob:')) {
            try {
                this.audio.src = this.song.audioData;
                this.audio.playbackRate = this.playbackRate;
                this.audio.load();
            } catch (err) {
                console.warn("SongEditor: Erro ao definir src de áudio", err);
            }
        } else {
            this.audio.removeAttribute('src');
        }

        this.updateHeaderInfo();
        this.updateTimeDisplay();
        this.updateScrubber();
        this.updateStatsDisplay();
        this.resizeCanvas();
        this.drawTimeline();
    }

    startAnimationLoop() {
        this.stopAnimationLoop();
        this.lastFrameTime = performance.now();

        const loop = (timestamp) => {
            const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
            this.lastFrameTime = timestamp;

            if (this.isPlaying) {
                // If native audio is actively playing, sync to its high-resolution clock
                const audioPlaying = this.audio && !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
                if (audioPlaying) {
                    this.currentTime = this.audio.currentTime;
                } else {
                    // Precision software fallback: guarantees timeline conveyor rolls at 60 FPS on any mobile browser
                    this.currentTime += dt * this.playbackRate;
                }

                if (this.currentTime >= this.duration) {
                    this.currentTime = this.duration;
                    this.pause();
                }

                this.updateTimeDisplay();
                this.updateScrubber();
                this.drawTimeline();
            }

            const modal = document.getElementById('chart-editor-modal');
            if (modal && modal.classList.contains('open')) {
                this.animFrameId = requestAnimationFrame(loop);
            }
        };

        this.animFrameId = requestAnimationFrame(loop);
    }

    stopAnimationLoop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    setupControlsDOM() {
        const bindClick = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };

        bindClick('editor-play-btn', () => this.togglePlay());
        bindClick('editor-rec-btn', () => this.toggleRecord());
        bindClick('editor-rew-btn', () => this.seekBy(-3));
        bindClick('editor-fwd-btn', () => this.seekBy(3));
        bindClick('editor-step-prev', () => this.stepByBeats(-1));
        bindClick('editor-step-next', () => this.stepByBeats(1));
        bindClick('editor-zoom-in', () => { this.pixelsPerSecond = Math.min(360, this.pixelsPerSecond + 30); this.drawTimeline(); });
        bindClick('editor-zoom-out', () => { this.pixelsPerSecond = Math.max(60, this.pixelsPerSecond - 30); this.drawTimeline(); });

        const snapSelect = document.getElementById('editor-snap-select');
        if (snapSelect) snapSelect.onchange = (e) => { this.snapGrid = e.target.value; };

        const speedSelect = document.getElementById('editor-speed-select');
        if (speedSelect) speedSelect.onchange = (e) => {
            this.playbackRate = parseFloat(e.target.value) || 1.0;
            this.audio.playbackRate = this.playbackRate;
        };

        bindClick('editor-undo-btn', () => this.undo());
        bindClick('editor-autogen-btn', () => this.autoGenerateBasicChart());
        bindClick('editor-clear-btn', () => this.clearAllNotes());
        bindClick('editor-save-btn', () => this.saveSongToDB());
        bindClick('editor-save-play-btn', () => this.saveAndPlay());
        bindClick('editor-close-btn', () => this.close());

        // Time Scrubber Slider
        const scrubber = document.getElementById('editor-time-scrubber');
        if (scrubber) {
            scrubber.oninput = (e) => {
                const targetTime = parseFloat(e.target.value) || 0;
                this.seekTo(targetTime);
            };
        }

        // Note Mode Selector (Tap vs Hold)
        const modeTapBtn = document.getElementById('editor-mode-tap');
        const modeHoldBtn = document.getElementById('editor-mode-hold');
        const holdLenWrap = document.getElementById('editor-hold-len-wrap');
        const holdLenSelect = document.getElementById('editor-hold-len-select');

        if (modeTapBtn && modeHoldBtn) {
            modeTapBtn.onclick = () => {
                this.noteMode = 'tap';
                modeTapBtn.classList.add('active');
                modeHoldBtn.classList.remove('active');
                if (holdLenWrap) holdLenWrap.style.display = 'none';
            };
            modeHoldBtn.onclick = () => {
                this.noteMode = 'hold';
                modeHoldBtn.classList.add('active');
                modeTapBtn.classList.remove('active');
                if (holdLenWrap) holdLenWrap.style.display = 'inline-flex';
            };
        }

        if (holdLenSelect) {
            holdLenSelect.onchange = (e) => {
                this.holdDuration = parseFloat(e.target.value) || 1.0;
            };
        }

        // Mobile / On-screen Tap-to-Record Buttons (4 Fret Pads with Hold Support)
        for (let i = 0; i < 4; i++) {
            const pad = document.getElementById(`editor-pad-${i}`);
            if (pad) {
                const onDown = (e) => { e.preventDefault(); this.onPadDown(i); };
                const onUp = (e) => { e.preventDefault(); this.onPadUp(i); };
                pad.addEventListener('pointerdown', onDown);
                ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => pad.addEventListener(ev, onUp));
            }
        }

        // Keyboard Support for Editor (Space = Play/Pause, 1,2,3,4 or A,S,D,F = Pads, Ctrl+Z = Undo)
        const keyLaneMap = {
            'a': 0, 'A': 0, '1': 0,
            's': 1, 'S': 1, '2': 1,
            'd': 2, 'D': 2, '3': 2,
            'f': 3, 'F': 3, '4': 3
        };

        window.addEventListener('keydown', (e) => {
            const modal = document.getElementById('chart-editor-modal');
            if (!modal || !modal.classList.contains('open')) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            } else if (keyLaneMap[e.key] !== undefined && !e.repeat) {
                this.onPadDown(keyLaneMap[e.key]);
            } else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
                this.undo();
            }
        });

        window.addEventListener('keyup', (e) => {
            const modal = document.getElementById('chart-editor-modal');
            if (!modal || !modal.classList.contains('open')) return;
            if (keyLaneMap[e.key] !== undefined) {
                this.onPadUp(keyLaneMap[e.key]);
            }
        });
    }

    findNoteAtPosition(x, y) {
        if (!this.song || !this.song.notes || !this.canvas) return null;
        const headerHeight = 28;
        if (y < headerHeight) return null;
        const trackAreaHeight = this.canvas.height - headerHeight;
        const trackHeight = trackAreaHeight / this.tracks;
        const lane = Math.min(this.tracks - 1, Math.max(0, Math.floor((y - headerHeight) / trackHeight)));
        const playheadX = this.canvas.width * this.playheadRatio;

        for (const n of this.song.notes) {
            if (n.lane !== lane) continue;
            const noteX = playheadX + (n.time - this.currentTime) * this.pixelsPerSecond;
            const dur = Math.max(0, Number(n.duration) || 0);
            const isHold = dur >= 0.2;
            const noteW = isHold ? Math.max(24, dur * this.pixelsPerSecond) : 16;

            // Check resize handle at right edge (12px tolerance)
            const rightEdge = isHold ? (noteX + noteW) : (noteX + 8);
            if (Math.abs(x - rightEdge) <= 12) {
                return { note: n, isHandle: true };
            }

            // Check note body click
            const startX = isHold ? noteX : (noteX - 8);
            const endX = isHold ? (noteX + noteW) : (noteX + 8);
            if (x >= startX - 5 && x <= endX + 5) {
                return { note: n, isHandle: false };
            }
        }
        return null;
    }

    setupCanvasInteractions() {
        if (!this.canvas) return;

        // Pointer Down: resize note, scrub, or click to toggle note
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;

            // Check if clicking resize handle on a note
            const hit = this.findNoteAtPosition(clientX, clientY);
            if (hit && hit.isHandle) {
                this.isResizingNote = true;
                this.resizingTarget = hit.note;
                this.resizeStartX = clientX;
                this.resizeStartDuration = Math.max(0, Number(hit.note.duration) || 0);
                this.pushUndo();
                return;
            }

            this.isDraggingTimeline = true;
            this.dragStartX = clientX;
            this.dragStartTime = this.currentTime;
            this.hasDragged = false;
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;

            if (this.isResizingNote && this.resizingTarget) {
                const deltaX = clientX - this.resizeStartX;
                const deltaSec = deltaX / this.pixelsPerSecond;
                const newDur = Math.max(0, Math.round((this.resizeStartDuration + deltaSec) * 20) / 20);
                this.resizingTarget.duration = newDur;
                this.drawTimeline();
                return;
            }

            if (this.isDraggingTimeline) {
                const deltaX = clientX - this.dragStartX;
                if (Math.abs(deltaX) > 4) {
                    this.hasDragged = true;
                    const deltaTime = deltaX / this.pixelsPerSecond;
                    this.seekTo(Math.max(0, Math.min(this.duration, this.dragStartTime - deltaTime)));
                }
            } else {
                // Update cursor
                const hover = this.findNoteAtPosition(clientX, clientY);
                if (hover && hover.isHandle) {
                    this.canvas.style.cursor = 'ew-resize';
                } else if (hover) {
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'crosshair';
                }
            }
        });

        window.addEventListener('pointerup', (e) => {
            if (this.isResizingNote) {
                this.isResizingNote = false;
                if (this.resizingTarget && this.resizingTarget.duration < 0.2 && this.resizeStartDuration === 0) {
                    this.resizingTarget.duration = 0;
                }
                this.resizingTarget = null;
                this.updateStatsDisplay();
                this.drawTimeline();
                return;
            }

            if (!this.isDraggingTimeline) return;
            this.isDraggingTimeline = false;

            // If not dragged, it was a click on a track to toggle/place note!
            if (!this.hasDragged && this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.handleTimelineClick(x, y);
            }
        });

        // Wheel horizontal scrubbing
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = (e.deltaX || e.deltaY) / this.pixelsPerSecond;
            this.seekTo(this.currentTime + delta * 0.4);
        }, { passive: false });
    }

    handleTimelineClick(x, y) {
        if (!this.song) return;

        const headerHeight = 28;
        if (y < headerHeight) {
            // Clicked time ruler -> seek directly to this point
            const playheadX = this.canvas.width * this.playheadRatio;
            const clickTime = this.currentTime + (x - playheadX) / this.pixelsPerSecond;
            this.seekTo(Math.max(0, Math.min(this.duration, clickTime)));
            return;
        }

        const trackAreaHeight = this.canvas.height - headerHeight;
        const trackHeight = trackAreaHeight / this.tracks;
        const lane = Math.min(this.tracks - 1, Math.max(0, Math.floor((y - headerHeight) / trackHeight)));

        const playheadX = this.canvas.width * this.playheadRatio;
        let rawTime = this.currentTime + (x - playheadX) / this.pixelsPerSecond;
        if (rawTime < 0 || rawTime > this.duration) return;

        // Check if user clicked an existing note body -> Delete it
        const hit = this.findNoteAtPosition(x, y);
        if (hit && hit.note) {
            this.pushUndo();
            const idx = this.song.notes.indexOf(hit.note);
            if (idx !== -1) {
                this.song.notes.splice(idx, 1);
            }
            this.updateStatsDisplay();
            this.drawTimeline();
            return;
        }

        // Apply grid quantization for new note
        let noteTime = this.quantizeTime(rawTime);

        // Check if there's already a note close to this quantized timestamp (threshold ~0.12s)
        const threshold = 16 / this.pixelsPerSecond;
        const existingIdx = this.song.notes.findIndex(n => n.lane === lane && Math.abs(n.time - noteTime) < threshold);

        this.pushUndo();

        if (existingIdx !== -1) {
            // Delete existing note
            this.song.notes.splice(existingIdx, 1);
        } else {
            // Add new note (honoring Tap vs Hold mode)
            const dur = (this.noteMode === 'hold') ? this.holdDuration : 0;
            this.song.notes.push({
                time: Math.round(noteTime * 1000) / 1000,
                lane: lane,
                duration: dur,
                id: 'n_' + Math.random().toString(36).substr(2, 9)
            });

            // Play preview sound
            if (window.soundEngine) {
                window.soundEngine.playGuitarChord(lane);
            }
        }

        // Sort notes chronologically
        this.song.notes.sort((a, b) => a.time - b.time);
        this.updateStatsDisplay();
        this.drawTimeline();
    }

    quantizeTime(t) {
        if (this.snapGrid === 'none') return t;

        const bpm = (this.song && this.song.bpm) || 120;
        const beatSec = 60 / bpm;

        let division = 1; // 1 beat
        if (this.snapGrid === '1/2') division = 0.5;
        else if (this.snapGrid === '1/4') division = 0.25;
        else if (this.snapGrid === '1/8') division = 0.125;
        else if (this.snapGrid === '1/16') division = 0.0625;

        const snapStep = beatSec * division;
        return Math.round(t / snapStep) * snapStep;
    }

    onPadTrigger(lane) {
        this.onPadDown(lane);
        setTimeout(() => this.onPadUp(lane), 100);
    }

    onPadDown(lane) {
        if (!this.song) return;

        // Visual flash on pad
        const pad = document.getElementById(`editor-pad-${lane}`);
        if (pad) {
            pad.classList.add('hit');
        }

        if (window.soundEngine) {
            window.soundEngine.playGuitarChord(lane);
        }

        this.padPressStartTime[lane] = this.currentTime;
        let noteTime = this.quantizeTime(this.currentTime);
        const dur = (this.noteMode === 'hold') ? this.holdDuration : 0;

        // Check if note exists in lane at this exact moment
        const exists = this.song.notes.some(n => n.lane === lane && Math.abs(n.time - noteTime) < 0.08);
        if (!exists) {
            this.pushUndo();
            const newNote = {
                time: Math.round(noteTime * 1000) / 1000,
                lane: lane,
                duration: dur,
                id: 'n_' + Math.random().toString(36).substr(2, 9)
            };
            this.song.notes.push(newNote);
            this.padActiveNote[lane] = newNote;
            this.song.notes.sort((a, b) => a.time - b.time);
            this.updateStatsDisplay();
            this.drawTimeline();
        }
    }

    onPadUp(lane) {
        const pad = document.getElementById(`editor-pad-${lane}`);
        if (pad) {
            pad.classList.remove('hit');
        }

        const activeNote = this.padActiveNote[lane];
        if (activeNote) {
            const heldDuration = Math.max(0, this.currentTime - this.padPressStartTime[lane]);
            if (heldDuration >= 0.25) {
                activeNote.duration = Math.round(heldDuration * 10) / 10;
            }
            this.padActiveNote[lane] = null;
            this.updateStatsDisplay();
            this.drawTimeline();
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.lastFrameTime = performance.now();

        if (this.currentTime >= this.duration - 0.2) {
            this.currentTime = 0;
        }

        if (this.audio && this.audio.src) {
            this.audio.playbackRate = this.playbackRate;
            this.audio.currentTime = this.currentTime;
            const p = this.audio.play();
            if (p !== undefined) {
                p.catch(e => {
                    console.warn("Audio autoplay blocked by mobile policy; continuing with precision software clock", e);
                });
            }
        }

        const btn = document.getElementById('editor-play-btn');
        if (btn) btn.innerText = '⏸️ PAUSAR';
    }

    pause() {
        this.isPlaying = false;
        if (this.audio) {
            try { this.audio.pause(); } catch (e) {}
        }

        const btn = document.getElementById('editor-play-btn');
        if (btn) btn.innerText = '▶️ TOCAR';

        if (this.isRecording) {
            this.toggleRecord(); // Auto-stop record on pause
        }

        this.updateTimeDisplay();
        this.updateScrubber();
        this.drawTimeline();
    }

    toggleRecord() {
        this.isRecording = !this.isRecording;
        const btn = document.getElementById('editor-rec-btn');
        if (btn) {
            btn.classList.toggle('recording', this.isRecording);
            btn.innerText = this.isRecording ? '⏹️ PARAR REC' : '⏺️ GRAVAR (REC)';
        }

        if (this.isRecording && !this.isPlaying) {
            this.play();
        }
    }

    seekTo(time) {
        this.currentTime = Math.max(0, Math.min(this.duration, time));
        if (this.audio && this.audio.src) {
            try { this.audio.currentTime = this.currentTime; } catch (e) {}
        }
        this.updateTimeDisplay();
        this.updateScrubber();
        this.drawTimeline();
    }

    seekBy(seconds) {
        this.seekTo(this.currentTime + seconds);
    }

    stepByBeats(beats) {
        const bpm = (this.song && this.song.bpm) || 120;
        const beatSec = 60 / bpm;
        this.seekTo(this.currentTime + beats * beatSec);
    }

    pushUndo() {
        if (!this.song) return;
        this.undoStack.push(JSON.stringify(this.song.notes));
        if (this.undoStack.length > 30) this.undoStack.shift();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const previous = this.undoStack.pop();
        this.song.notes = JSON.parse(previous);
        this.updateStatsDisplay();
        this.drawTimeline();
        this.showToast("↩️ Ação desfeita!");
    }

    autoGenerateBasicChart() {
        this.pushUndo();
        const duration = Math.max(15, this.duration || (this.song && this.song.duration) || 30);
        const bpm = Math.max(60, (this.song && this.song.bpm) || 120);
        const beatSec = 60 / bpm;
        const totalBeats = Math.floor(duration / beatSec);

        // Reset notes and generate an authentic, multi-lane rock solo rhythm chart
        this.song.notes = [];

        for (let b = 2; b < totalBeats; b++) {
            const time = b * beatSec;
            if (time > duration - 1) break;

            const mb = b % 8;
            const lane = (mb === 0) ? 0 : (mb === 2 || mb === 6) ? 2 : (mb === 4) ? 1 : (mb === 7) ? 3 : (b % 4);
            const dur = (mb === 0) ? 1.0 : (mb === 4) ? 0.8 : 0;
            this.song.notes.push({
                time: Math.round(time * 1000) / 1000,
                lane, duration: dur,
                id: 'n_' + Math.random().toString(36).substr(2, 9)
            });
        }

        this.song.notes.sort((a, b) => a.time - b.time);
        this.updateStatsDisplay();
        this.drawTimeline();
        this.showToast(`⚡ Ritmo de ${this.song.notes.length} notas gerado com sucesso!`);
    }

    clearAllNotes() {
        this.pushUndo();
        this.song.notes = [];
        this.updateStatsDisplay();
        this.drawTimeline();
        this.showToast("🗑️ Todas as notas foram removidas. (Clique em Desfazer para restaurar)");
    }

    async saveSongToDB() {
        if (!this.song || !window.songDB) return false;
        try {
            this.song.duration = Math.max(15, this.duration || this.song.duration || 30);
            this.song.updatedAt = Date.now();
            await window.songDB.saveSong(this.song);
            this.showToast("💾 Ritmo salvo com sucesso!");
            if (window.songStudio) {
                window.songStudio.renderLibrary();
            }
            return true;
        } catch (e) {
            alert("Erro ao salvar música: " + e.message);
            return false;
        }
    }

    async saveAndPlay() {
        const saved = await this.saveSongToDB();
        if (!saved) return;
        const songToPlay = JSON.parse(JSON.stringify(this.song));
        this.close();
        if (window.game) {
            if (window.game.startMatchWithSong) {
                window.game.startMatchWithSong(songToPlay);
            } else {
                window.game.selectSong(songToPlay);
                window.game.startMatch();
            }
        }
    }

    drawTimeline() {
        if (!this.canvas || !this.ctx) return;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, cw, ch);

        const headerHeight = 28;
        const trackAreaHeight = ch - headerHeight;
        const trackHeight = trackAreaHeight / this.tracks;
        const playheadX = cw * this.playheadRatio;

        // 1. Draw Track Backgrounds
        for (let i = 0; i < this.tracks; i++) {
            const y = headerHeight + i * trackHeight;
            ctx.fillStyle = i % 2 === 0 ? '#11111d' : '#151525';
            ctx.fillRect(0, y, cw, trackHeight);

            // Subtle colored line on left
            ctx.fillStyle = this.colors[i].main;
            ctx.fillRect(0, y, 4, trackHeight);

            // Dividing horizontal line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y + trackHeight);
            ctx.lineTo(cw, y + trackHeight);
            ctx.stroke();

            // Track Label
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = this.colors[i].main;
            ctx.fillText(`Pista ${i + 1}`, 10, y + 16);
        }

        // 2. Draw Time Grid (Beats & Seconds)
        const bpm = (this.song && this.song.bpm) ? this.song.bpm : 120;
        const beatSec = 60 / bpm;

        const visibleStartTime = this.currentTime - (playheadX / this.pixelsPerSecond);
        const visibleEndTime = this.currentTime + ((cw - playheadX) / this.pixelsPerSecond);

        const startBeat = Math.max(0, Math.floor(visibleStartTime / beatSec));
        const endBeat = Math.ceil(visibleEndTime / beatSec);

        ctx.save();
        for (let b = startBeat; b <= endBeat; b++) {
            const beatTime = b * beatSec;
            const x = playheadX + (beatTime - this.currentTime) * this.pixelsPerSecond;
            if (x < 0 || x > cw) continue;

            const isMeasure = b % 4 === 0;

            // Vertical Grid Line
            ctx.strokeStyle = isMeasure ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.07)';
            ctx.lineWidth = isMeasure ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(x, headerHeight);
            ctx.lineTo(x, ch);
            ctx.stroke();

            // Measure / Beat number on ruler
            if (isMeasure) {
                ctx.fillStyle = '#ffcc00';
                ctx.font = 'bold 9px sans-serif';
                ctx.fillText(`C.${b / 4 + 1}`, x + 3, headerHeight - 12);
            }
        }
        ctx.restore();

        // 3. Draw Time Ruler at Top
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(0, 0, cw, headerHeight);
        ctx.strokeStyle = '#22223a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(cw, headerHeight);
        ctx.stroke();

        // Second markers
        const startSec = Math.max(0, Math.floor(visibleStartTime));
        const endSec = Math.ceil(visibleEndTime);
        for (let s = startSec; s <= endSec; s++) {
            const x = playheadX + (s - this.currentTime) * this.pixelsPerSecond;
            if (x >= 0 && x <= cw) {
                ctx.fillStyle = '#8899aa';
                ctx.font = '9px sans-serif';
                const mins = Math.floor(s / 60);
                const secs = s % 60;
                ctx.fillText(`${mins}:${secs < 10 ? '0' : ''}${secs}s`, x + 2, headerHeight - 3);

                ctx.strokeStyle = '#556677';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, headerHeight - 6);
                ctx.lineTo(x, headerHeight);
                ctx.stroke();
            }
        }

        // 4. Draw Charted Notes (Normal & Sustained Hold Notes)
        if (this.song && this.song.notes) {
            this.song.notes.forEach(note => {
                const noteX = playheadX + (note.time - this.currentTime) * this.pixelsPerSecond;
                const dur = Math.max(0, Number(note.duration) || 0);
                const isHold = dur >= 0.2;
                const noteW = isHold ? Math.max(24, dur * this.pixelsPerSecond) : 16;

                if (noteX + noteW < -30 || noteX > cw + 30) return;

                const laneY = headerHeight + note.lane * trackHeight;
                const noteH = trackHeight * 0.72;
                const noteTop = laneY + (trackHeight - noteH) / 2;

                const colorInfo = this.colors[note.lane] || this.colors[0];

                ctx.save();
                // Glow
                ctx.shadowColor = colorInfo.main;
                ctx.shadowBlur = 10;

                if (isHold) {
                    // 1. Draw elongated hold bar
                    const barGrad = ctx.createLinearGradient(noteX, 0, noteX + noteW, 0);
                    barGrad.addColorStop(0, colorInfo.main);
                    barGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
                    ctx.fillStyle = barGrad;
                    ctx.beginPath();
                    ctx.roundRect(noteX, noteTop, noteW, noteH, 5);
                    ctx.fill();

                    // Striped diagonal pattern along sustain trail
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.lineWidth = 2;
                    for (let sx = noteX + 12; sx < noteX + noteW - 6; sx += 14) {
                        ctx.beginPath();
                        ctx.moveTo(sx, noteTop + 2);
                        ctx.lineTo(sx + 8, noteTop + noteH - 2);
                        ctx.stroke();
                    }

                    // Note head diamond / rounded mark at start
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(noteX + 2, noteTop + 4, 12, noteH - 8, 3);
                    ctx.fill();

                    // Right resize handle [>]
                    ctx.fillStyle = '#111122';
                    ctx.beginPath();
                    ctx.roundRect(noteX + noteW - 10, noteTop + 2, 9, noteH - 4, 3);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 8px sans-serif';
                    ctx.fillText('>', noteX + noteW - 7, noteTop + noteH / 2 + 3);

                    // Duration text badge if space allows
                    if (noteW >= 42) {
                        ctx.font = 'bold 10px monospace';
                        ctx.fillStyle = '#ffffff';
                        ctx.shadowColor = '#000000';
                        ctx.shadowBlur = 4;
                        ctx.fillText(`${dur}s`, noteX + 18, noteTop + noteH / 2 + 3.5);
                    }
                } else {
                    // Standard Tap Note
                    ctx.fillStyle = colorInfo.main;
                    ctx.beginPath();
                    ctx.roundRect(noteX - noteW / 2, noteTop, noteW, noteH, 4);
                    ctx.fill();

                    // Core highlight
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(noteX - noteW / 4, noteTop + 4, noteW / 2, noteH - 8, 2);
                    ctx.fill();
                }

                ctx.restore();
            });
        }

        // 5. Draw Playhead Line
        ctx.save();
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, ch);
        ctx.stroke();

        // Playhead triangle pointer on ruler
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(playheadX - 6, 0);
        ctx.lineTo(playheadX + 6, 0);
        ctx.lineTo(playheadX, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    updateHeaderInfo() {
        const titleEl = document.getElementById('editor-song-title');
        const artistEl = document.getElementById('editor-song-artist');
        if (titleEl && this.song) titleEl.innerText = this.song.title || 'Sem Título';
        if (artistEl && this.song) artistEl.innerText = this.song.artist || 'Artista';
    }

    updateTimeDisplay() {
        const timeEl = document.getElementById('editor-time-display');
        if (timeEl) {
            const formatTime = (t) => {
                const m = Math.floor(t / 60);
                const s = Math.floor(t % 60);
                const ms = Math.floor((t % 1) * 10);
                return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
            };
            timeEl.innerText = `${formatTime(this.currentTime)} / ${formatTime(this.duration)}`;
        }
    }

    updateScrubber() {
        const scrubber = document.getElementById('editor-time-scrubber');
        if (scrubber) {
            scrubber.max = Math.max(15, this.duration || 30);
            scrubber.value = this.currentTime;
        }
    }

    updateStatsDisplay() {
        const statsEl = document.getElementById('editor-notes-count');
        if (statsEl && this.song) {
            statsEl.innerText = `${(this.song.notes || []).length} notas mapeadas`;
        }
    }

    open(song) {
        const modal = document.getElementById('chart-editor-modal');
        if (modal) {
            modal.classList.add('open');
            this.initDOM();
            this.loadSong(song);
            this.startAnimationLoop();
        }
    }

    close() {
        this.pause();
        this.stopAnimationLoop();
        const modal = document.getElementById('chart-editor-modal');
        if (modal) modal.classList.remove('open');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'studio-toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    }
}

window.songEditor = new SongEditor();
