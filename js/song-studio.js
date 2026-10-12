// Song Studio UI Controller (Library, Upload, Metadata, and Import/Export)
class SongStudio {
    constructor() {
        this.activeTab = 'library'; // 'library', 'new', 'io'
        this.uploadedAudioData = null;
        this.uploadedAudioDuration = 30;
        this.uploadedCoverData = 'assets/covers/default_cover.jpg';
        
        // Tap Tempo helper
        this.tapTimes = [];
        this.detectedBpm = 120;
    }

    init() {
        this.setupDOM();
        this.renderLibrary();
    }

    setupDOM() {
        // Toggle studio modal
        const toggleBtn = document.getElementById('songs-toggle');
        const modal = document.getElementById('song-studio-modal');
        const closeBtn = document.getElementById('studio-close-btn');

        if (toggleBtn && modal) {
            toggleBtn.onclick = () => {
                modal.classList.add('open');
                this.renderLibrary();
            };
        }

        if (closeBtn && modal) {
            closeBtn.onclick = () => {
                modal.classList.remove('open');
            };
        }

        // Tab Navigation
        document.querySelectorAll('.studio-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.studio-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.studio-tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetContent = document.getElementById(`studio-tab-${targetId}`);
                if (targetContent) targetContent.classList.add('active');

                this.activeTab = targetId;
                if (targetId === 'library') this.renderLibrary();
            };
        });

        // Audio File Upload
        const audioInput = document.getElementById('new-song-audio-file');
        const audioStatus = document.getElementById('new-song-audio-status');
        const titleInput = document.getElementById('new-song-title');
        const artistInput = document.getElementById('new-song-artist');

        if (audioInput) {
            audioInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (audioStatus) {
                    audioStatus.innerHTML = `<span style="color:#00d4ff;">⏳ Lendo: <b>${file.name}</b>...</span>`;
                    audioStatus.classList.remove('success');
                }

                // Auto-suggest Title & Artist from filename if inputs are empty
                const rawName = file.name.replace(/\.[^/.]+$/, "");
                if (titleInput && (!titleInput.value || titleInput.value.trim() === '')) {
                    if (rawName.includes(' - ')) {
                        const parts = rawName.split(' - ');
                        if (artistInput && (!artistInput.value || artistInput.value.trim() === '')) {
                            artistInput.value = parts[0].trim();
                        }
                        titleInput.value = parts.slice(1).join(' - ').trim();
                    } else if (rawName.includes('_-_')) {
                        const parts = rawName.split('_-_');
                        if (artistInput && (!artistInput.value || artistInput.value.trim() === '')) {
                            artistInput.value = parts[0].replace(/_/g, ' ').trim();
                        }
                        titleInput.value = parts.slice(1).join(' ').replace(/_/g, ' ').trim();
                    } else {
                        titleInput.value = rawName.replace(/[_]+/g, ' ').trim();
                    }
                }

                // 1. Rapid duration extraction using temporary ObjectURL
                let durationFound = false;
                try {
                    const blobUrl = URL.createObjectURL(file);
                    const tempAudio = new Audio();
                    tempAudio.src = blobUrl;

                    const cleanup = () => {
                        try { URL.revokeObjectURL(blobUrl); } catch (err) {}
                    };

                    const timeoutTimer = setTimeout(() => {
                        if (!durationFound) {
                            cleanup();
                            // Fallback estimate (~16KB/s for 128kbps audio)
                            this.uploadedAudioDuration = Math.max(20, Math.min(300, Math.round(file.size / 16000))) || 35;
                            if (audioStatus) {
                                const m = Math.floor(this.uploadedAudioDuration / 60);
                                const s = this.uploadedAudioDuration % 60;
                                audioStatus.innerHTML = `✅ <b>${file.name}</b> (~${m}:${s < 10 ? '0' : ''}${s})`;
                                audioStatus.classList.add('success');
                            }
                        }
                    }, 2500);

                    tempAudio.onloadedmetadata = () => {
                        durationFound = true;
                        clearTimeout(timeoutTimer);
                        cleanup();
                        if (tempAudio.duration && !isNaN(tempAudio.duration) && tempAudio.duration > 0) {
                            this.uploadedAudioDuration = Math.round(tempAudio.duration);
                        } else {
                            this.uploadedAudioDuration = 35;
                        }
                        if (audioStatus) {
                            const m = Math.floor(this.uploadedAudioDuration / 60);
                            const s = this.uploadedAudioDuration % 60;
                            audioStatus.innerHTML = `✅ <b>${file.name}</b> (${m}:${s < 10 ? '0' : ''}${s})`;
                            audioStatus.classList.add('success');
                        }
                    };

                    tempAudio.onerror = () => {
                        clearTimeout(timeoutTimer);
                        cleanup();
                        this.uploadedAudioDuration = Math.max(20, Math.min(300, Math.round(file.size / 16000))) || 35;
                        if (audioStatus) {
                            audioStatus.innerHTML = `✅ <b>${file.name}</b> (Áudio Pronto)`;
                            audioStatus.classList.add('success');
                        }
                    };
                } catch (err) {
                    this.uploadedAudioDuration = 35;
                }

                // 2. Read file as Data URL for permanent storage
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.uploadedAudioData = evt.target.result;
                    if (audioStatus && !audioStatus.classList.contains('success')) {
                        const m = Math.floor(this.uploadedAudioDuration / 60);
                        const s = this.uploadedAudioDuration % 60;
                        audioStatus.innerHTML = `✅ <b>${file.name}</b> (${m}:${s < 10 ? '0' : ''}${s})`;
                        audioStatus.classList.add('success');
                    }
                };

                reader.onerror = () => {
                    const errMsg = reader.error ? (reader.error.message || reader.error.name) : "Erro ao carregar";
                    if (audioStatus) {
                        audioStatus.innerHTML = `⚠️ <span style="color:#ff4444;">Erro na leitura (${errMsg}). Uma trilha de rock será sintetizada automaticamente.</span>`;
                    }
                    this.uploadedAudioData = null;
                };

                reader.readAsDataURL(file);
            };
        }

        // Cover Image Upload
        const coverInput = document.getElementById('new-song-cover-file');
        const coverPreview = document.getElementById('new-song-cover-preview');
        if (coverInput) {
            coverInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.uploadedCoverData = evt.target.result;
                    if (coverPreview) coverPreview.src = this.uploadedCoverData;
                };
                reader.onerror = () => {
                    console.warn("Cover image read error; keeping default cover");
                };
                reader.readAsDataURL(file);
            };
        }

        // Tap Tempo Button
        const tapBtn = document.getElementById('new-song-tap-tempo');
        const bpmInput = document.getElementById('new-song-bpm');
        if (tapBtn && bpmInput) {
            tapBtn.onclick = () => {
                const now = performance.now();
                this.tapTimes.push(now);
                if (this.tapTimes.length > 5) this.tapTimes.shift();

                if (this.tapTimes.length >= 2) {
                    const diffs = [];
                    for (let i = 1; i < this.tapTimes.length; i++) {
                        diffs.push(this.tapTimes[i] - this.tapTimes[i - 1]);
                    }
                    const avgDiff = diffs.reduce((a, b) => a + b) / diffs.length;
                    const calculatedBpm = Math.round(60000 / avgDiff);
                    if (calculatedBpm >= 40 && calculatedBpm <= 280) {
                        this.detectedBpm = calculatedBpm;
                        bpmInput.value = calculatedBpm;
                        tapBtn.innerText = `BPM: ${calculatedBpm} 🎵`;
                    }
                }
            };
        }

        // Form Submit: Create Song & Open Editor
        const createBtn = document.getElementById('new-song-submit-btn');
        if (createBtn) {
            createBtn.onclick = () => this.handleCreateSong();
        }

        // Import File Input (.gvsong, .json, or audio)
        const importInput = document.getElementById('studio-import-file');
        if (importInput) {
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                this.showToast(`⏳ Importando "${file.name}"...`);

                try {
                    const imported = await window.songDB.importSongFile(file);
                    this.showToast(`✅ Música "${imported.title}" importada com sucesso!`);
                    this.renderLibrary();
                    // Switch to library tab
                    const libTab = document.querySelector('.studio-tab[data-tab="library"]');
                    if (libTab) libTab.click();
                } catch (err) {
                    alert("Erro ao importar arquivo: " + err.message);
                }
                importInput.value = '';
            };
        }

        // Drag & Drop onto Song Studio Modal
        const studioModal = document.getElementById('song-studio-modal');
        if (studioModal) {
            studioModal.addEventListener('dragover', (e) => {
                e.preventDefault();
                studioModal.classList.add('drag-active');
            });
            studioModal.addEventListener('dragleave', (e) => {
                e.preventDefault();
                studioModal.classList.remove('drag-active');
            });
            studioModal.addEventListener('drop', async (e) => {
                e.preventDefault();
                studioModal.classList.remove('drag-active');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFile = e.dataTransfer.files[0];
                    this.showToast(`⏳ Processando arquivo solto "${droppedFile.name}"...`);
                    try {
                        const imported = await window.songDB.importSongFile(droppedFile);
                        this.showToast(`✅ Música "${imported.title}" importada com sucesso!`);
                        this.renderLibrary();
                        const libTab = document.querySelector('.studio-tab[data-tab="library"]');
                        if (libTab) libTab.click();
                    } catch (err) {
                        alert("Erro ao processar arquivo: " + err.message);
                    }
                }
            });
        }
    }

    async handleCreateSong() {
        const titleInput = document.getElementById('new-song-title');
        const artistInput = document.getElementById('new-song-artist');
        const descInput = document.getElementById('new-song-desc');
        const bpmInput = document.getElementById('new-song-bpm');
        const genOption = document.querySelector('input[name="new-song-pattern"]:checked');

        const title = (titleInput && titleInput.value.trim()) || 'Minha Música Rock';
        const artist = (artistInput && artistInput.value.trim()) || 'Artista Desconhecido';
        const description = (descInput && descInput.value.trim()) || 'Faixa personalizada criada no Estúdio de Ritmo.';
        const bpm = (bpmInput && parseInt(bpmInput.value)) || 120;

        if (!this.uploadedAudioData) {
            // Automatically synthesize a 30s heavy rock backing track if none uploaded
            this.showToast("⚡ Sintetizando trilha de rock de alta qualidade...");
            this.uploadedAudioData = await window.songDB.synthesizeRockAudioWav(30, bpm);
            this.uploadedAudioDuration = 30;
        }

        const songDuration = Math.max(15, Number(this.uploadedAudioDuration) || 30);
        const initialNotes = [];

        // If option "autogen" was selected, generate a baseline multi-track chart
        if (genOption && genOption.value === 'autogen') {
            const beatSec = 60 / bpm;
            const totalBeats = Math.floor(songDuration / beatSec);
            for (let b = 2; b < totalBeats; b++) {
                const time = b * beatSec;
                if (time > songDuration - 1) break;

                const measureBeat = b % 8;
                let lane = 0;
                if (measureBeat === 0) lane = 0;
                else if (measureBeat === 2 || measureBeat === 6) lane = 2;
                else if (measureBeat === 4) lane = 1;
                else if (measureBeat === 7) lane = 3;
                else lane = b % 4;

                initialNotes.push({
                    time: Math.round(time * 1000) / 1000,
                    lane: lane,
                    id: 'n_' + Math.random().toString(36).substr(2, 9)
                });
            }
        }

        const newSong = {
            id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            title: title,
            artist: artist,
            description: description,
            bpm: bpm,
            duration: songDuration,
            cover: this.uploadedCoverData || 'assets/covers/default_cover.jpg',
            audioData: this.uploadedAudioData,
            notes: initialNotes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDefault: false
        };

        try {
            await window.songDB.saveSong(newSong);
            this.showToast("🚀 Música criada! Abrindo o editor de ritmo...");

            // Reset form
            if (titleInput) titleInput.value = '';
            if (artistInput) artistInput.value = '';
            if (descInput) descInput.value = '';
            this.uploadedAudioData = null;
            const audioStatus = document.getElementById('new-song-audio-status');
            if (audioStatus) audioStatus.innerText = 'Nenhum áudio selecionado';

            // Close studio and open editor
            const modal = document.getElementById('song-studio-modal');
            if (modal) modal.classList.remove('open');

            if (window.songEditor) {
                window.songEditor.open(newSong);
            }
        } catch (err) {
            alert("Erro ao criar música: " + err.message);
        }
    }

    async renderLibrary() {
        const container = document.getElementById('studio-library-list');
        if (!container || !window.songDB) return;

        container.innerHTML = '<div class="studio-loading">Carregando músicas...</div>';

        try {
            const songs = await window.songDB.getAllSongs();
            container.innerHTML = '';

            if (songs.length === 0) {
                container.innerHTML = '<div class="studio-empty">Nenhuma música encontrada. Crie uma nova música ou importe uma!</div>';
                return;
            }

            songs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

            songs.forEach(song => {
                const card = document.createElement('div');
                card.className = 'song-card';

                const m = Math.floor((song.duration || 0) / 60);
                const s = Math.floor((song.duration || 0) % 60);
                const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;
                const notesCount = (song.notes || []).length;

                card.innerHTML = `
                    <div class="song-card-media">
                        <img src="${song.cover || 'assets/covers/default_cover.jpg'}" alt="${song.title}" class="song-card-cover">
                        <div class="song-card-vinyl"></div>
                    </div>
                    <div class="song-card-details">
                        <div class="song-card-title">${song.title}</div>
                        <div class="song-card-artist">${song.artist}</div>
                        <div class="song-card-desc">${song.description || ''}</div>
                        <div class="song-card-meta">
                            <span class="meta-tag">⏱️ ${durationStr}</span>
                            <span class="meta-tag">🎸 ${notesCount} notas</span>
                            <span class="meta-tag">⚡ ${song.bpm || 120} BPM</span>
                            ${song.isDefault ? '<span class="meta-badge-starter">OFICIAL</span>' : ''}
                        </div>
                    </div>
                    <div class="song-card-actions">
                        <button class="song-btn-play" title="Jogar Música">▶️ JOGAR</button>
                        <button class="song-btn-edit" title="Editar Ritmo">✏️ EDITAR</button>
                        <button class="song-btn-export" title="Exportar (.gvsong)">💾 EXPORTAR</button>
                        ${!song.isDefault ? '<button class="song-btn-delete" title="Excluir">🗑️</button>' : ''}
                    </div>
                `;

                // Bind actions
                const playBtn = card.querySelector('.song-btn-play');
                if (playBtn) {
                    playBtn.onclick = () => {
                        const modal = document.getElementById('song-studio-modal');
                        if (modal) modal.classList.remove('open');
                        if (window.game) {
                            if (window.game.startMatchWithSong) {
                                window.game.startMatchWithSong(song);
                            } else {
                                window.game.selectSong(song);
                                window.game.startMatch();
                            }
                        }
                    };
                }

                const editBtn = card.querySelector('.song-btn-edit');
                if (editBtn) {
                    editBtn.onclick = () => {
                        const modal = document.getElementById('song-studio-modal');
                        if (modal) modal.classList.remove('open');
                        if (window.songEditor) {
                            window.songEditor.open(song);
                        }
                    };
                }

                const exportBtn = card.querySelector('.song-btn-export');
                if (exportBtn) {
                    exportBtn.onclick = async () => {
                        try {
                            const filename = await window.songDB.exportSong(song.id);
                            this.showToast(`💾 Música baixada: ${filename}`);
                        } catch (err) {
                            alert("Erro ao exportar música: " + err.message);
                        }
                    };
                }

                const delBtn = card.querySelector('.song-btn-delete');
                if (delBtn) {
                    delBtn.onclick = async () => {
                        if (confirm(`Deseja excluir permanentemente a música "${song.title}"?`)) {
                            await window.songDB.deleteSong(song.id);
                            this.showToast("Música excluída com sucesso.");
                            this.renderLibrary();
                        }
                    };
                }

                container.appendChild(card);
            });
        } catch (e) {
            container.innerHTML = `<div class="studio-error">Erro ao carregar músicas: ${e.message}</div>`;
        }
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
        }, 2500);
    }
}

window.songStudio = new SongStudio();
