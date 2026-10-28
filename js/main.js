// Main Game Architecture & Screen Flow Controller
class Game {
    constructor() {
        this.currentScreen = 'menu'; // 'menu', 'map-select', 'battle'
        this.combat = new CombatSystem('combat-canvas');
        this.rhythm = new RhythmSystem('rhythm-canvas');

        this.selectedSong = this.getBuiltinDefaultSong();
        this.currentMapZombies = (typeof window !== 'undefined' && window.enemyPool) ? window.enemyPool.rollMapEnemies(5) : [];

        // Connect Rhythm hits directly to Combat combo & status!
        this.rhythm.onHitCallback = (isCrit, lane) => {
            this.combat.combo = this.rhythm.streak;
        };

        this.lastTime = performance.now();
        this.animationId = null;

        this.setupScreenNavigation();
        this.setupBattleControls();
        this.setupAudioGlobalUnlock();
        this.start();
    }

    getBuiltinDefaultSong() {
        const bpm = 136;
        const beatSec = 60 / bpm;
        const pattern = [
            { b: 4, l: 0 }, { b: 5, l: 1 }, { b: 6, l: 0 }, { b: 7, l: 2 }, { b: 8, l: 0 }, { b: 9, l: 1 }, { b: 10, l: 2 }, { b: 11, l: 3 },
            { b: 12, l: 0 }, { b: 12.5, l: 0 }, { b: 13, l: 1 }, { b: 14, l: 2 }, { b: 15, l: 3 }, { b: 16, l: 2 }, { b: 17, l: 1 }, { b: 18, l: 0 },
            { b: 19, l: 1 }, { b: 19.5, l: 2 }, { b: 20, l: 3 }, { b: 21, l: 2 }, { b: 22, l: 1 }, { b: 23, l: 0 }, { b: 24, l: 0 }, { b: 24.5, l: 1 },
            { b: 25, l: 2 }, { b: 25.5, l: 3 }, { b: 26, l: 2 }, { b: 26.5, l: 1 }, { b: 27, l: 0 }, { b: 28, l: 3 }, { b: 29, l: 2 }, { b: 29.5, l: 1 },
            { b: 30, l: 0 }, { b: 31, l: 1 }, { b: 32, l: 2 }, { b: 32.5, l: 3 }, { b: 33, l: 2 }, { b: 33.5, l: 1 }, { b: 34, l: 0 }, { b: 35, l: 1 },
            { b: 36, l: 2 }, { b: 37, l: 3 }, { b: 38, l: 2 }, { b: 39, l: 1 }, { b: 40, l: 0 }, { b: 41, l: 3 }, { b: 41.5, l: 2 }, { b: 42, l: 1 },
            { b: 42.5, l: 0 }, { b: 43, l: 1 }, { b: 44, l: 2 }, { b: 44.5, l: 3 }, { b: 45, l: 2 }, { b: 46, l: 1 }, { b: 47, l: 0 }, { b: 48, l: 3 },
            { b: 49, l: 2 }, { b: 50, l: 1 }, { b: 50.5, l: 2 }, { b: 51, l: 3 }, { b: 52, l: 0 }, { b: 53, l: 1 }, { b: 54, l: 2 }, { b: 55, l: 3 },
            { b: 56, l: 3 }, { b: 57, l: 2 }, { b: 58, l: 0 }
        ];
        const notes = pattern.map(p => ({
            time: Math.round((p.b * beatSec) * 1000) / 1000,
            lane: p.l,
            id: 'n_' + Math.random().toString(36).substr(2, 9)
        }));
        return {
            id: 'default_thunder_strike',
            title: 'Thunder Strike',
            artist: 'Cyber Shock',
            description: 'Solo oficial de alta voltagem pós-apocalíptico! Perfeito para detonar hordas mutantes no asfalto.',
            bpm: bpm,
            duration: 30,
            cover: 'assets/covers/default_cover.jpg',
            audioData: null,
            notes: notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDefault: true
        };
    }

    // ==========================================
    // SCREEN STATE MACHINE
    // ==========================================
    switchScreen(screenName) {
        this.currentScreen = screenName;

        const screens = {
            'menu': document.getElementById('screen-main-menu'),
            'map-select': document.getElementById('screen-map-select'),
            'battle': document.getElementById('screen-battle')
        };

        Object.keys(screens).forEach(key => {
            if (screens[key]) {
                const isActive = (key === screenName);
                screens[key].classList.toggle('active', isActive);
                screens[key].style.display = isActive ? 'flex' : 'none';
            }
        });

        if (screenName === 'menu') {
            this.isBattlePaused = false;
            this.combat.matchActive = false;
            this.combat.isGameOver = false;
            this.rhythm.stopCustomSong();
            this.updateMenuHUD();
            ['battle-gear-modal', 'battle-stats-modal', 'song-results-modal', 'battle-defeat-modal'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('open');
            });
        } else if (screenName === 'map-select') {
            this.prepareMapScreen();
        } else if (screenName === 'battle') {
            // Force immediate synchronous resize of canvases to match newly visible parent DOM
            this.combat.resize();
            this.rhythm.resize();
            setTimeout(() => {
                this.combat.resize();
                this.rhythm.resize();
            }, 50);
        }
    }

    // ==========================================
    // SCREEN NAVIGATION & BUTTONS
    // ==========================================
    setupScreenNavigation() {
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
        bind('menu-btn-play', (e) => { if (e) e.preventDefault(); this.switchScreen('map-select'); });
        bind('menu-btn-talents', (e) => {
            if (e) e.preventDefault();
            if (window.talentSystem && typeof window.talentSystem.open === 'function') window.talentSystem.open();
            else { const m = document.getElementById('talent-modal'); if (m) m.classList.add('open'); }
        });
        bind('menu-btn-studio', () => {
            const m = document.getElementById('song-studio-modal');
            if (m) { m.classList.add('open'); if (window.songStudio) window.songStudio.renderLibrary(); }
        });
        bind('menu-btn-settings', () => this.openGearModal(true));
        bind('menu-sound-toggle', () => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute();
                const icon = isMuted ? '🔇' : '🔊';
                const b1 = document.getElementById('menu-sound-toggle'); if (b1) b1.innerText = icon;
                const b2 = document.getElementById('battle-sound-toggle'); if (b2) b2.innerText = icon;
            }
        });
        bind('map-back-btn', () => this.switchScreen('menu'));
        bind('map-reroll-btn', () => {
            if (window.enemyPool) { this.currentMapZombies = window.enemyPool.rollMapEnemies(5); this.renderMapZombies(); }
        });
        bind('map-start-battle-btn', () => this.startMatch());
        bind('map-hero-prev-btn', () => this.cycleGuitarist(-1));
        bind('map-hero-next-btn', () => this.cycleGuitarist(1));
        bind('map-song-prev-btn', () => this.cycleSong(-1));
        bind('map-song-next-btn', () => this.cycleSong(1));
        bind('map-stage-prev-btn', () => this.cycleStage(-1));
        bind('map-stage-next-btn', () => this.cycleStage(1));
        bind('skill-picker-close-btn', () => {
            const m = document.getElementById('skill-picker-modal'); if (m) m.classList.remove('open');
        });
        const mapSongSelect = document.getElementById('map-song-select');
        if (mapSongSelect) mapSongSelect.onchange = (e) => this.loadSelectedSongDetails(e.target.value);
    }

    // ==========================================
    // MAP & PRE-BATTLE PREPARATION
    // ==========================================
    async prepareMapScreen() {
        // 0. Update Stage Progression UI
        this.updateStageUI();

        // 1. Render Guitarist Hero Roster & Showcase
        this.renderHeroRoster();

        // 2. Roll 5 zombies from Enemy Pool
        if (window.enemyPool) {
            this.currentMapZombies = window.enemyPool.rollMapEnemies(5);
            this.renderMapZombies();
        }

        // 2.5. Render 4-Lane Equipped Skills
        this.renderLaneSkills();

        // 3. Populate available songs from IndexedDB
        await this.populateSongDropdown();
    }

    cycleStage(direction = 1) {
        if (!window.stageSystem) return;
        const current = window.stageSystem.selectedStage;
        const highest = window.stageSystem.highestUnlockedStage;
        const next = Math.max(1, Math.min(highest, current + direction));
        window.stageSystem.setSelectedStage(next);
        if (window.soundEngine) window.soundEngine.playSustainTick(0);
        this.updateStageUI();
    }

    updateStageUI() {
        if (!window.stageSystem) return;
        const stage = window.stageSystem.selectedStage;
        const stageTitle = document.getElementById('map-stage-title-text');
        const stageInfo = document.getElementById('map-stage-info-text');

        if (stageTitle) {
            stageTitle.innerText = window.stageSystem.getStageName(stage);
        }
        if (stageInfo) {
            const range = window.stageSystem.getZombieLevelRange(stage);
            const kills = window.stageSystem.getTargetKills(stage);
            const rewards = window.stageSystem.getStageRewards(stage);
            stageInfo.innerText = `Dificuldade: Zumbis Nv. ${range.min}-${range.max} | Alvo: ${kills} Baixas | Recompensas: 🪙 ${rewards.coins} | ⭐ ${rewards.xp} XP`;
        }
    }

    renderHeroRoster() {
        if (!window.guitaristPool) return;

        const currentHero = (window.guitaristPool.getSelectedGuitarist && window.guitaristPool.getSelectedGuitarist()) 
            || (window.guitaristPool.getActiveGuitarist && window.guitaristPool.getActiveGuitarist());
        if (!currentHero) return;

        const allHeroes = window.guitaristPool.getAllGuitarists();

        // 1. Update Hero Showcase Card
        const showcaseImg = document.getElementById('showcase-hero-img');
        const rarityBadge = document.getElementById('showcase-hero-rarity-badge');
        const nameEl = document.getElementById('showcase-hero-name');
        const titleEl = document.getElementById('showcase-hero-title');
        const instrumentEl = document.getElementById('showcase-hero-instrument-text');
        const passiveNameEl = document.getElementById('showcase-hero-passive-name');
        const passiveDescEl = document.getElementById('showcase-hero-passive-desc');
        const showcaseBox = document.getElementById('map-selected-hero-showcase');

        if (showcaseImg) showcaseImg.src = currentHero.icon;
        if (rarityBadge) {
            rarityBadge.innerText = (currentHero.rarity || 'COMUM').toUpperCase();
            rarityBadge.className = `hero-rarity-badge ${currentHero.rarityClass || currentHero.badgeClass || 'badge-common'}`;
        }
        if (nameEl) nameEl.innerText = currentHero.name;
        if (titleEl) titleEl.innerText = currentHero.title;
        if (instrumentEl) instrumentEl.innerText = currentHero.instrument;
        if (passiveNameEl) passiveNameEl.innerText = (currentHero.passive && currentHero.passive.name) || currentHero.passiveName || 'Passiva';
        if (passiveDescEl) passiveDescEl.innerText = (currentHero.passive && currentHero.passive.desc) || currentHero.passiveDesc || '';
        if (showcaseBox) {
            const color = currentHero.accentColor || currentHero.themeColor || '#ffaa00';
            showcaseBox.style.borderColor = color;
            showcaseBox.style.boxShadow = `0 4px 20px ${color}44`;
        }

        // Hero Level Progression Box
        const lvlData = window.guitaristPool.getHeroLevelData(currentHero.id);
        const reqXp = window.guitaristPool.getXpRequiredForNextLevel(lvlData.level);
        const goldCost = window.guitaristPool.getGoldCostForLevelUp(lvlData.level);

        const lvlBadge = document.getElementById('showcase-hero-level-badge');
        const xpText = document.getElementById('showcase-hero-xp-text');
        const xpFill = document.getElementById('showcase-hero-xp-fill');
        const lvlUpBtn = document.getElementById('hero-level-up-btn');

        if (lvlBadge) lvlBadge.innerText = `⭐ NÍVEL ${lvlData.level} / 100`;
        if (xpText) xpText.innerText = lvlData.level >= 100 ? 'MÁXIMO' : `XP: ${lvlData.xp} / ${reqXp}`;
        if (xpFill) {
            const pct = lvlData.level >= 100 ? 100 : Math.min(100, Math.round((lvlData.xp / reqXp) * 100));
            xpFill.style.width = `${pct}%`;
        }
        if (lvlUpBtn) {
            if (lvlData.level >= 100) {
                lvlUpBtn.innerText = '⭐ NÍVEL MÁXIMO (100)';
                lvlUpBtn.disabled = true;
            } else {
                lvlUpBtn.disabled = false;
                lvlUpBtn.innerText = `⬆️ SUBIR NÍVEL (🪙 ${goldCost})`;
                lvlUpBtn.onclick = () => {
                    const res = window.guitaristPool.levelUpWithGold(currentHero.id);
                    if (res.success) {
                        if (window.soundEngine) window.soundEngine.playPowerChord();
                        this.renderHeroRoster();
                        this.updateMenuCurrencies();
                    } else {
                        alert(res.reason || 'Ouro insuficiente!');
                    }
                };
            }
        }

        // 2. Populate 6 Guitarists Grid with Real Clickable Buttons
        const grid = document.getElementById('map-heroes-roster-grid');
        if (!grid) return;

        grid.innerHTML = '';
        allHeroes.forEach(hero => {
            const isSelected = (hero.id === currentHero.id);
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `hero-roster-card ${isSelected ? 'active' : ''}`;
            card.title = `${hero.name} (${hero.rarity}) - ${(hero.passive && hero.passive.name) || hero.passiveName || ''}`;

            const color = hero.accentColor || hero.themeColor || '#ffaa00';
            const badgeClass = hero.rarityClass || hero.badgeClass || 'badge-common';

            card.innerHTML = `
                <div class="hero-roster-art" style="border-color: ${color}; pointer-events: none;">
                    <img src="${hero.icon}" alt="${hero.name}" class="hero-roster-img" style="pointer-events: none;">
                </div>
                <div class="hero-roster-name" style="pointer-events: none;">${hero.name.split(' ')[0]}</div>
                <span class="hero-roster-mini-badge ${badgeClass}" style="pointer-events: none;">${hero.rarity}</span>
                ${isSelected ? '<span class="hero-card-check">✓</span>' : ''}
            `;

            const chooseHero = (e) => {
                if (e) e.preventDefault();
                window.guitaristPool.setSelectedGuitarist(hero.id);
                if (window.soundEngine) {
                    window.soundEngine.playGuitarChord(2);
                }
                this.renderHeroRoster();
                this.renderLaneSkills();
            };

            card.onclick = chooseHero;
            grid.appendChild(card);
        });
    }

    cycleGuitarist(direction = 1) {
        if (!window.guitaristPool) return;
        const all = window.guitaristPool.getAllGuitarists();
        if (!all || all.length === 0) return;
        const current = window.guitaristPool.getSelectedGuitarist() || window.guitaristPool.getActiveGuitarist();
        const currIdx = all.findIndex(g => g.id === current.id);
        const nextIdx = (currIdx + direction + all.length) % all.length;
        window.guitaristPool.setSelectedGuitarist(all[nextIdx].id);
        if (window.soundEngine) window.soundEngine.playGuitarChord(2);
        this.renderHeroRoster();
        this.renderLaneSkills();
    }

    renderMapZombies() {
        const grid = document.getElementById('map-zombies-grid');
        if (!grid) return;

        grid.innerHTML = '';
        this.currentMapZombies.forEach(z => {
            const card = document.createElement('div');
            card.className = 'zombie-preview-card';

            card.innerHTML = `
                <div class="zombie-card-art">
                    <img src="${z.icon}" alt="${z.name}" class="zombie-card-img">
                    <span class="zombie-card-badge ${z.badgeClass || ''}">${z.badge}</span>
                </div>
                <div class="zombie-card-info">
                    <h4 class="zombie-card-name">${z.name}</h4>
                    <p class="zombie-card-desc">${z.desc}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderLaneSkills() {
        if (!window.skillSystem) return;
        const grid = document.getElementById('map-lane-skills-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const laneColors = ['#00ff66', '#ff0055', '#ffcc00', '#00d4ff'];
        const hero = window.guitaristPool ? window.guitaristPool.getActiveGuitarist() : null;
        const hid = hero ? hero.id : null;

        for (let l = 0; l < 4; l++) {
            const skill = window.skillSystem.getEquippedSkill(l, hid);
            const badge = window.skillSystem.getSkillTypeBadge ? window.skillSystem.getSkillTypeBadge(skill) : { label: 'SKILL', color: '#00d4ff', bg: 'rgba(0,0,0,0.3)' };
            const dmgText = skill.damageMult ? `${Math.round(skill.damageMult * 100)}%` : '100%';
            const slot = document.createElement('div');
            slot.className = `lane-skill-slot lane-${l}`;
            slot.innerHTML = `
                <span class="lane-tag-num" style="color: ${laneColors[l]};">Trilho ${l + 1}</span>
                <span class="lane-skill-icon">${skill.icon}</span>
                <span class="lane-skill-title">${skill.name}</span>
                <span class="lane-skill-type-pill" style="color: ${badge.color}; background: ${badge.bg};">${badge.label} (${dmgText})</span>
                <span class="lane-skill-cost">${skill.manaCost > 0 ? `⚡ ${skill.manaCost} MP` : 'BÁSICO (0 MP)'}</span>
            `;

            slot.onclick = () => this.openSkillPickerModal(l);
            grid.appendChild(slot);
        }
    }

    openSkillPickerModal(laneIndex) {
        if (!window.skillSystem) return;
        this.pickingSkillLaneIndex = laneIndex;
        const modal = document.getElementById('skill-picker-modal');
        const titleEl = document.getElementById('skill-picker-title');
        const listEl = document.getElementById('skill-picker-list');
        const resetBtn = document.getElementById('skill-restore-default-btn');
        if (!modal || !listEl) return;

        const laneNames = ['Trilho 1 (Verde)', 'Trilho 2 (Vermelho)', 'Trilho 3 (Amarelo)', 'Trilho 4 (Azul)'];
        const hero = window.guitaristPool ? window.guitaristPool.getActiveGuitarist() : null;
        const hid = hero ? hero.id : null;
        const heroName = hero ? hero.name : 'Guitarrista';
        if (titleEl) titleEl.innerText = `⚡ ${laneNames[laneIndex] || `Trilho ${laneIndex + 1}`} • ${heroName}`;

        if (resetBtn) {
            resetBtn.onclick = () => {
                window.skillSystem.resetHeroLoadout(hid);
                this.showToast('Loadout padrão restaurado!');
                if (window.soundEngine) window.soundEngine.playPowerChord();
                this.openSkillPickerModal(laneIndex);
                this.renderLaneSkills();
            };
        }

        const currentSkill = window.skillSystem.getEquippedSkill(laneIndex, hid);
        const heroSkills = window.skillSystem.getSkillsForHero(hid);

        listEl.innerHTML = '';
        heroSkills.forEach(s => {
            const isEquipped = (s.id === currentSkill.id);
            const check = window.skillSystem.canEquipSkill(laneIndex, s.id, hid);
            const isBlocked = !check.allowed;
            const badge = window.skillSystem.getSkillTypeBadge ? window.skillSystem.getSkillTypeBadge(s) : { label: 'SKILL', color: '#00d4ff', bg: 'rgba(0,0,0,0.3)' };
            const dmgText = s.damageMult ? `${Math.round(s.damageMult * 100)}% Dano` : '100% Dano';

            const card = document.createElement('div');
            card.className = `skill-card-choice ${isEquipped ? 'active' : ''} ${isBlocked ? 'blocked' : ''}`;
            card.innerHTML = `
                <div class="skill-choice-icon">${s.icon}</div>
                <div class="skill-choice-info">
                    <div class="skill-choice-header">
                        <span class="skill-choice-name">${s.name}</span>
                        <span class="skill-type-pill" style="color: ${badge.color}; background: ${badge.bg};">${badge.label}</span>
                    </div>
                    <div class="skill-choice-stats">
                        <span class="skill-dmg-tag">💥 ${dmgText}</span>
                        <span class="skill-cost-tag" style="color: ${s.manaCost > 0 ? '#00d4ff' : '#00ff66'};">⚡ ${s.manaCost > 0 ? `${s.manaCost} Rock Mana` : '0 MP (Básico)'}</span>
                    </div>
                    <div class="skill-choice-desc">${s.desc}</div>
                    ${isEquipped ? '<span class="skill-status-tag equipped">✅ Equipada neste trilho</span>' : ''}
                    ${isBlocked ? '<span class="skill-status-tag blocked">🔒 Bloqueado: Mantenha ≥ 1 Ataque Básico</span>' : ''}
                </div>
            `;

            card.onclick = () => {
                if (!check.allowed) {
                    this.showToast(check.reason);
                    if (window.soundEngine && typeof window.soundEngine.playMiss === 'function') {
                        window.soundEngine.playMiss();
                    }
                    return;
                }
                window.skillSystem.equipSkill(laneIndex, s.id, hid);
                if (window.soundEngine) window.soundEngine.playPowerChord();
                modal.classList.remove('open');
                this.renderLaneSkills();
            };

            listEl.appendChild(card);
        });

        modal.classList.add('open');
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
        }, 2600);
    }

    async populateSongDropdown() {
        const select = document.getElementById('map-song-select');

        if (!this.selectedSong) {
            this.selectedSong = this.getBuiltinDefaultSong();
        }

        let songs = [this.selectedSong];

        if (window.songDB) {
            try {
                await window.songDB.init();
                const dbSongs = await window.songDB.getAllSongs();
                if (dbSongs && dbSongs.length > 0) {
                    songs = dbSongs;
                }
            } catch (e) {
                console.warn("Could not load songs from SongDB", e);
            }
        }

        this.availableSongs = songs;

        // Keep current selected song if in list, else default to first
        if (!this.selectedSong || !songs.some(s => s.id === this.selectedSong.id)) {
            this.selectedSong = songs[0];
        }

        if (select) {
            select.innerHTML = '';
            songs.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.innerText = `${s.title} - ${s.artist} (${s.bpm || 120} BPM)`;
                if (s.id === this.selectedSong.id) opt.selected = true;
                select.appendChild(opt);
            });
        }

        this.updateMapSongDetailsUI(this.selectedSong);
        this.renderSongRoster();
    }

    renderSongRoster() {
        const list = document.getElementById('map-songs-roster-list');
        if (!list) return;

        const songs = this.availableSongs || (this.selectedSong ? [this.selectedSong] : []);
        list.innerHTML = '';

        songs.forEach(s => {
            const isSelected = this.selectedSong && (this.selectedSong.id === s.id);
            const card = document.createElement('div');
            card.className = `map-song-card ${isSelected ? 'active' : ''}`;

            card.innerHTML = `
                <div class="map-song-card-main">
                    <img src="${s.cover || 'assets/covers/default_cover.jpg'}" alt="${s.title}" class="map-song-card-thumb">
                    <div class="map-song-card-text">
                        <span class="map-song-card-title">${s.title}</span>
                        <span class="map-song-card-meta">${s.artist || 'Cyber Shock'} • ${s.bpm || 120} BPM • ${(s.notes || []).length} notas</span>
                    </div>
                </div>
                <button type="button" class="song-card-action-btn ${isSelected ? 'active' : ''}">
                    ${isSelected ? '✅ SELECIONADA' : '▶️ ESCOLHER'}
                </button>
            `;

            const chooseHandler = (e) => {
                if (e) e.stopPropagation();
                this.selectSong(s);
            };

            card.onclick = chooseHandler;
            const btn = card.querySelector('.song-card-action-btn');
            if (btn) btn.onclick = chooseHandler;

            list.appendChild(card);
        });
    }

    selectSong(song) {
        if (!song) return;
        this.selectedSong = song;
        this.updateMapSongDetailsUI(song);
        if (window.soundEngine) {
            window.soundEngine.playGuitarChord(0);
        }

        // Sync dropdown
        const select = document.getElementById('map-song-select');
        if (select && select.value !== song.id) {
            select.value = song.id;
        }

        // Re-render song roster to update the active button state
        this.renderSongRoster();
    }

    cycleSong(direction = 1) {
        if (!this.availableSongs || this.availableSongs.length === 0) return;
        const currIdx = this.availableSongs.findIndex(s => s.id === (this.selectedSong ? this.selectedSong.id : ''));
        const nextIdx = (currIdx + direction + this.availableSongs.length) % this.availableSongs.length;
        this.selectSong(this.availableSongs[nextIdx]);
    }

    async loadSelectedSongDetails(songId) {
        if (!window.songDB) return;
        try {
            const song = await window.songDB.getSong(songId);
            if (!song) return;
            this.selectSong(song);
        } catch (e) {
            console.warn("Song details error", e);
        }
    }

    updateMapSongDetailsUI(song) {
        if (!song) return;
        const coverImg = document.getElementById('map-selected-song-cover');
        const titleEl = document.getElementById('map-selected-song-title');
        const bpmTag = document.getElementById('selected-song-bpm-tag');
        const artistEl = document.getElementById('map-song-artist');
        const notesEl = document.getElementById('map-song-notes-count');

        if (coverImg) coverImg.src = song.cover || 'assets/covers/default_cover.jpg';
        if (titleEl) titleEl.innerText = song.title || 'Música';
        if (bpmTag) bpmTag.innerText = `${song.bpm || 120} BPM`;
        if (artistEl) artistEl.innerText = `Autoria: ${song.artist || 'Desconhecido'}`;
        if (notesEl) notesEl.innerText = `${(song.notes || []).length} notas mapeadas`;
    }

    startMatchWithSong(song) {
        if (song) {
            this.selectSong(song);
        }
        this.startMatch();
    }

    startMatch() {
        if (!this.selectedSong) {
            this.selectedSong = this.getBuiltinDefaultSong();
        }

        this.isBattlePaused = false;
        if (this.combat) { this.combat.isPaused = false; this.combat.isGameOver = false; this.combat.isVictory = false; }
        if (this.rhythm) this.rhythm.isPaused = false;
        ['battle-gear-modal', 'battle-stats-modal', 'song-results-modal', 'battle-defeat-modal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('open');
        });

        // Switch to Battle Screen FIRST to ensure containers have active layout
        this.switchScreen('battle');

        // Immediately resize canvases to match parent container dimensions
        this.combat.resize();
        this.rhythm.resize();

        // Ensure 5 zombies are selected
        if (!this.currentMapZombies || this.currentMapZombies.length === 0) {
            if (window.enemyPool) {
                this.currentMapZombies = window.enemyPool.rollMapEnemies(5);
            }
        }

        // Initialize combat with the 5 selected zombies
        this.combat.resetBattle(this.currentMapZombies);

        // Initialize rhythm highway with the selected song
        this.rhythm.playCustomSong(this.selectedSong);
    }

    // ==========================================
    // BATTLE CONTROLS & HUD
    // ==========================================
    setupBattleControls() {
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
        bind('battle-sound-toggle', () => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute();
                const icon = isMuted ? '🔇' : '🔊';
                const b1 = document.getElementById('battle-sound-toggle'); if (b1) b1.innerText = icon;
                const b2 = document.getElementById('menu-sound-toggle'); if (b2) b2.innerText = icon;
            }
        });
        bind('battle-stats-toggle', () => this.openStatsModal());
        bind('stats-modal-close-btn', () => this.closeStatsModal());
        bind('stats-resume-btn', () => this.closeStatsModal());
        bind('battle-gear-toggle', () => this.openGearModal(false));
        bind('gear-modal-close-btn', () => this.closeGearModal());
        bind('gear-footer-action-btn', () => this.closeGearModal());
        bind('gear-abandon-battle-btn', () => {
            if (confirm("⚠️ Tem certeza que deseja abandonar a batalha e voltar ao menu inicial? O progresso desta partida será perdido.")) {
                const modal = document.getElementById('battle-gear-modal');
                if (modal) modal.classList.remove('open');
                this.switchScreen('menu');
            }
        });
        bind('result-replay-btn', () => {
            const m = document.getElementById('song-results-modal');
            if (m) m.classList.remove('open');
            this.startMatch();
        });
        bind('result-close-btn', () => {
            const m = document.getElementById('song-results-modal');
            if (m) m.classList.remove('open');
            this.switchScreen('menu');
        });
        bind('defeat-retry-btn', () => {
            const m = document.getElementById('battle-defeat-modal');
            if (m) m.classList.remove('open');
            this.startMatch();
        });
        bind('defeat-talents-btn', () => {
            const m = document.getElementById('battle-defeat-modal');
            if (m) m.classList.remove('open');
            this.switchScreen('menu');
            if (window.talentSystem && typeof window.talentSystem.open === 'function') window.talentSystem.open();
        });
        bind('defeat-close-btn', () => {
            const m = document.getElementById('battle-defeat-modal');
            if (m) m.classList.remove('open');
            this.switchScreen('menu');
        });
    }

    pauseBattle() {
        this.isBattlePaused = true;
        if (this.combat) this.combat.isPaused = true;
        if (this.rhythm) {
            this.rhythm.isPaused = true;
            this.rhythm.pauseAudio();
        }
    }

    resumeBattle() {
        this.isBattlePaused = false;
        if (this.combat) this.combat.isPaused = false;
        if (this.rhythm) {
            this.rhythm.isPaused = false;
            this.rhythm.resumeAudio();
        }
        this.lastTime = performance.now();
    }

    openGearModal(isFromMainMenu = false) {
        this.isGearFromMenu = isFromMainMenu;
        const modal = document.getElementById('battle-gear-modal');
        if (!modal) return;
        const title = document.getElementById('gear-modal-title');
        const dangerZone = document.getElementById('gear-danger-zone-wrap');
        const footerBtn = document.getElementById('gear-footer-action-btn');

        if (isFromMainMenu) {
            if (title) title.innerText = '⚙️ CONFIGURAÇÕES';
            if (dangerZone) dangerZone.style.display = 'none';
            if (footerBtn) footerBtn.innerText = '✕ FECHAR CONFIGURAÇÕES';
        } else {
            if (title) title.innerText = '⚙️ OPÇÕES & PAUSA';
            if (dangerZone) dangerZone.style.display = 'block';
            if (footerBtn) footerBtn.innerText = '▶️ CONTINUAR PARTIDA';
            this.pauseBattle();
        }
        modal.classList.add('open');
    }

    closeGearModal() {
        const modal = document.getElementById('battle-gear-modal');
        if (modal) modal.classList.remove('open');
        if (!this.isGearFromMenu && this.currentScreen === 'battle') {
            if (!this.combat.isGameOver && !this.combat.isVictory) {
                this.resumeBattle();
            }
        }
    }

    openStatsModal() {
        const modal = document.getElementById('battle-stats-modal');
        if (!modal) return;
        this.updateBattleStatsModal();
        if (this.currentScreen === 'battle') {
            this.pauseBattle();
        }
        modal.classList.add('open');
    }

    closeStatsModal() {
        const modal = document.getElementById('battle-stats-modal');
        if (modal) modal.classList.remove('open');
        if (this.currentScreen === 'battle') {
            if (!this.combat.isGameOver && !this.combat.isVictory) {
                this.resumeBattle();
            }
        }
    }

    updateBattleStatsModal() {
        const modal = document.getElementById('battle-stats-modal');
        if (!modal) return;

        const s = this.combat.battleStats;
        const r = this.rhythm.songStats || {};

        if (window.guitaristPool) {
            const h = window.guitaristPool.getSelectedGuitarist();
            const thumbEl = document.getElementById('ss-hero-thumb');
            const nameTxt = document.getElementById('ss-hero-name');
            const rarityTxt = document.getElementById('ss-hero-rarity');
            if (thumbEl && h) thumbEl.src = h.icon;
            if (nameTxt && h) nameTxt.innerText = h.name;
            if (rarityTxt && h) {
                rarityTxt.innerText = h.rarity.toUpperCase();
                rarityTxt.className = `hero-rarity-badge ${h.rarityClass} ss-hero-rarity-badge`;
            }
        }

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        const elapsedSec = Math.floor((performance.now() - (s.matchStartTime || performance.now())) / 1000);
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        const totalNotes = r.totalNotes || 1;
        const hitNotes = r.hitNotes || 0;
        const accPct = Math.round((hitNotes / totalNotes) * 100);

        setVal('ss-total-damage', Math.round(s.damageDealt).toLocaleString());
        setVal('ss-hero-hp', `${Math.round(this.combat.heroHp)} / ${this.combat.heroMaxHp}`);
        setVal('ss-zombies-killed', s.zombiesKilled);
        setVal('ss-max-streak', `${r.maxStreak || this.rhythm.streak || 0} 🔥`);
        setVal('ss-current-multiplier', `x${this.rhythm.multiplier}`);
        setVal('ss-current-score', this.combat.score.toLocaleString());
        setVal('ss-match-coins', `+${s.coinsEarned} 🪙`);
        setVal('ss-accuracy-rate', `${accPct}% (${r.perfects || 0}P / ${r.greats || 0}G / ${r.misses || 0}M)`);
        setVal('ss-time-elapsed', `${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }

    showVictoryModal(song, stats = {}) {
        this.pauseBattle();
        if (this.combat) this.combat.isVictory = true;
        const modal = document.getElementById('song-results-modal');
        if (!modal) return;

        const coverEl = document.getElementById('result-song-cover');
        const titleEl = document.getElementById('result-song-title');
        const artistEl = document.getElementById('result-song-artist');
        if (coverEl) coverEl.src = (song && song.cover) || 'assets/covers/default_cover.jpg';
        if (titleEl) titleEl.innerText = (song && song.title) || 'Show Concluído';
        if (artistEl) artistEl.innerText = (song && song.artist) || 'Solo de Guitarra';

        const totalNotes = stats.totalNotes || (song && song.notes ? song.notes.length : 1);
        const hitNotes = stats.hitNotes || (totalNotes - (stats.misses || 0));
        const accPct = Math.round((hitNotes / Math.max(1, totalNotes)) * 100);

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setVal('result-accuracy', `${accPct}%`);
        setVal('result-hits', `${hitNotes} / ${totalNotes}`);
        setVal('result-zombies-killed', `${(this.combat && this.combat.battleStats ? this.combat.battleStats.zombiesKilled : 0)} 💀`);
        setVal('result-max-streak', `${stats.maxStreak || (this.rhythm ? this.rhythm.maxStreak : 0)} 🔥`);
        setVal('result-gold-reward', `+${(this.combat && this.combat.battleStats ? this.combat.battleStats.coinsEarned : 0)} 🪙`);
        setVal('result-score-gained', `+${(this.combat ? this.combat.score : 0).toLocaleString()}`);

        try {
            if (window.stageSystem && typeof window.stageSystem.completeStage === 'function') {
                window.stageSystem.completeStage(window.stageSystem.selectedStage);
            }
        } catch(err) { console.warn("Stage completion error:", err); }

        if (window.soundEngine && typeof window.soundEngine.playPowerChord === 'function') window.soundEngine.playPowerChord();
        modal.classList.add('open');
    }

    showDefeatModal() {
        this.pauseBattle();
        const modal = document.getElementById('battle-defeat-modal');
        if (!modal) return;

        const s = (this.combat && this.combat.battleStats) || { zombiesKilled: 0, damageDealt: 0, coinsEarned: 0 };
        const r = (this.rhythm && this.rhythm.songStats) || {};
        const totalNotes = r.totalNotes || 1;
        const hitNotes = r.hitNotes || 0;
        const accPct = Math.round((hitNotes / Math.max(1, totalNotes)) * 100);

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setVal('defeat-zombies-killed', `${s.zombiesKilled} 💀`);
        setVal('defeat-total-damage', Math.round(s.damageDealt).toLocaleString());
        setVal('defeat-accuracy', `${accPct}%`);
        setVal('defeat-gold-reward', `+${s.coinsEarned} 🪙`);
        setVal('defeat-score-gained', (this.combat ? this.combat.score : 0).toLocaleString());

        if (window.soundEngine && typeof window.soundEngine.playMiss === 'function') window.soundEngine.playMiss();
        modal.classList.add('open');
    }

    setupAudioGlobalUnlock() {
        const unlockAudio = () => {
            if (window.soundEngine) window.soundEngine.resume();
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);
    }

    start() {
        const loop = (currentTime) => {
            const deltaTime = Math.min(currentTime - this.lastTime, 100);
            this.lastTime = currentTime;

            if (this.currentScreen === 'battle') {
                if (!this.isBattlePaused) {
                    this.update(deltaTime);
                }
                this.draw();
                this.updateBattleHUD();
            }

            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    update(deltaTime) {
        this.combat.update(deltaTime);
        this.rhythm.update(deltaTime);
    }

    draw() {
        this.combat.draw();
        this.rhythm.draw();
    }

    updateBattleHUD() {
        // Hero HP in Battle
        const hpBar = document.getElementById('hero-hp-bar');
        const hpText = document.getElementById('battle-hero-hp-text');
        if (hpBar) {
            const pct = Math.max(0, Math.min(100, (this.combat.heroHp / this.combat.heroMaxHp) * 100));
            hpBar.style.width = `${pct}%`;
            if (pct < 30) {
                hpBar.style.backgroundColor = '#ff2222';
            } else if (pct < 60) {
                hpBar.style.backgroundColor = '#ffaa00';
            } else {
                hpBar.style.backgroundColor = '#00ff66';
            }
        }
        if (hpText) {
            hpText.innerText = `${Math.round(this.combat.heroHp)} / ${this.combat.heroMaxHp}`;
        }

        // Rock Mana Meter
        const rockBar = document.getElementById('rock-meter-bar');
        const manaText = document.getElementById('battle-hero-mana-text');
        if (rockBar) {
            rockBar.style.width = `${this.combat.rockPower}%`;
        }
        if (manaText) {
            manaText.innerText = `${Math.floor(this.combat.rockMana)} / ${this.combat.maxRockMana}`;
        }

        // Real-Time Battle Score, Combo and Multiplier
        const scoreEl = document.getElementById('battle-score-val');
        const comboEl = document.getElementById('battle-combo-val');
        const multEl = document.getElementById('battle-mult-val');
        const comboPill = document.getElementById('battle-combo-pill');

        if (scoreEl) {
            scoreEl.innerText = (this.combat.score || 0).toLocaleString();
        }

        if (comboEl) {
            const streak = this.rhythm.streak || 0;
            const spdBonus = Math.min(2.0, streak * 0.01);
            comboEl.innerText = `${streak} COMBO (+${spdBonus.toFixed(2)} SPD)`;
        }

        if (multEl) {
            multEl.innerText = `x${this.rhythm.multiplier || 1}`;
        }

        if (comboPill) {
            const streak = this.rhythm.streak || 0;
            comboPill.classList.toggle('active', streak >= 5);
            comboPill.classList.toggle('on-fire', streak >= 15);
        }
    }

    updateMenuHUD() {
        const goldCount = document.getElementById('menu-gold-count');
        const highscoreVal = document.getElementById('menu-highscore-val');
        const killsVal = document.getElementById('menu-total-kills');

        if (goldCount && window.talentSystem) {
            goldCount.innerText = window.talentSystem.gold;
        }
        if (highscoreVal) {
            const hs = parseInt(localStorage.getItem('gvs_highscore') || '0');
            highscoreVal.innerText = hs.toLocaleString();
        }
        if (killsVal) {
            const tk = parseInt(localStorage.getItem('gvs_total_kills') || '0');
            killsVal.innerText = tk.toLocaleString();
        }
    }

    updateMenuCurrencies() {
        this.updateMenuHUD();
    }
}

// Iniciar quando o DOM carregar
window.addEventListener('load', () => {
    if (typeof EnemyPoolSystem !== 'undefined' && !window.enemyPool) {
        window.enemyPool = new EnemyPoolSystem();
    }
    if (typeof TalentSystem !== 'undefined') {
        window.talentSystem = new TalentSystem();
    }
    if (typeof SongStudio !== 'undefined' && window.songStudio) {
        window.songStudio.init();
    }

    window.game = new Game();

    if (window.talentSystem) {
        window.talentSystem.syncWithCombat();
    }
});
