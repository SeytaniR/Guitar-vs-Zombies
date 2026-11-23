// Main Game Architecture & Screen Flow Controller
class Game {
    constructor() {
        this.currentScreen = 'menu'; // 'menu', 'map-select', 'battle'
        this.combat = new CombatSystem('combat-canvas');
        this.rhythm = new RhythmSystem('rhythm-canvas');
        this.pvpSystem = (typeof PvPSystem !== 'undefined') ? new PvPSystem() : null;
        if (this.combat && this.pvpSystem) this.combat.pvpSystem = this.pvpSystem;

        this.selectedSong = this.getBuiltinDefaultSong();
        this.currentMapZombies = (typeof window !== 'undefined' && window.enemyPool) ? window.enemyPool.rollMapEnemies(5) : [];

        // Connect Rhythm hits directly to Combat combo & status!
        this.rhythm.onHitCallback = (isCrit, lane) => {
            this.combat.combo = this.rhythm.streak;
        };

        this.lastTime = performance.now();
        this.lastRenderTime = 0;
        this.animationId = null;

        this.setupScreenNavigation();
        this.setupBattleControls();
        this.setupAudioGlobalUnlock();
        const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
        const initScreen = (urlParams && urlParams.get('screen')) ? urlParams.get('screen') : 'menu';
        this.switchScreen(initScreen);
        this.start();
    }

    tr(k, f, p) { return (typeof i18n !== 'undefined') ? i18n.t(k, f, p) : f; }

    getBuiltinDefaultSong() {
        const bpm = 136;
        const beatSec = 60 / bpm;
        const pattern = [
            { b: 0, l: 0 }, { b: 1, l: 1 }, { b: 2, l: 2 }, { b: 3, l: 1 }, { b: 4, l: 0 }, { b: 5, l: 1 }, { b: 6, l: 0 }, { b: 7, l: 2 }, { b: 8, l: 0 }, { b: 9, l: 1 }, { b: 10, l: 2 }, { b: 11, l: 3 }, { b: 12, l: 0 }, { b: 12.5, l: 0 }, { b: 13, l: 1 }, { b: 14, l: 2 }, { b: 15, l: 3 }, { b: 16, l: 2 }, { b: 17, l: 1 }, { b: 18, l: 0 },
            { b: 19, l: 1 }, { b: 19.5, l: 2 }, { b: 20, l: 3 }, { b: 21, l: 2 }, { b: 22, l: 1 }, { b: 23, l: 0 }, { b: 24, l: 0 }, { b: 24.5, l: 1 }, { b: 25, l: 2 }, { b: 25.5, l: 3 }, { b: 26, l: 2 }, { b: 26.5, l: 1 }, { b: 27, l: 0 }, { b: 28, l: 3 }, { b: 29, l: 2 }, { b: 29.5, l: 1 },
            { b: 30, l: 0 }, { b: 31, l: 1 }, { b: 32, l: 2 }, { b: 32.5, l: 3 }, { b: 33, l: 2 }, { b: 33.5, l: 1 }, { b: 34, l: 0 }, { b: 35, l: 1 }, { b: 36, l: 2 }, { b: 37, l: 3 }, { b: 38, l: 2 }, { b: 39, l: 1 }, { b: 40, l: 0 }, { b: 41, l: 3 }, { b: 41.5, l: 2 }, { b: 42, l: 1 },
            { b: 42.5, l: 0 }, { b: 43, l: 1 }, { b: 44, l: 2 }, { b: 44.5, l: 3 }, { b: 45, l: 2 }, { b: 46, l: 1 }, { b: 47, l: 0 }, { b: 48, l: 3 }, { b: 49, l: 2 }, { b: 50, l: 1 }, { b: 50.5, l: 2 }, { b: 51, l: 3 }, { b: 52, l: 0 }, { b: 53, l: 1 }, { b: 54, l: 2 }, { b: 55, l: 3 }, { b: 56, l: 3 }, { b: 57, l: 2 }, { b: 58, l: 0 }
        ];
        const notes = pattern.map(p => ({
            time: Math.round((p.b * beatSec) * 1000) / 1000, lane: p.l, id: 'n_' + Math.random().toString(36).substr(2, 9)
        }));
        return {
            id: 'default_thunder_strike', title: 'Thunder Strike', artist: 'Cyber Shock',
            description: 'Solo oficial de alta voltagem pós-apocalíptico! Perfeito para detonar hordas mutantes no asfalto.',
            bpm: bpm, duration: 30, cover: 'assets/covers/default_cover.jpg', audioData: null,
            notes: notes, createdAt: Date.now(), updatedAt: Date.now(), isDefault: true
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

        if (screenName !== 'battle') {
            const b = document.getElementById('screen-battle'); if (b) b.classList.remove('pvp-active');
            if (this.combat) this.combat.isPvPMode = false;
            if (window.countdownSystem) window.countdownSystem.cancel();
        }
        if (screenName === 'menu') {
            this.isBattlePaused = false;
            this.combat.matchActive = false;
            this.combat.isGameOver = false;
            this.rhythm.stopCustomSong();
            this.updateMenuHUD();
            ['battle-gear-modal', 'battle-stats-modal', 'song-results-modal', 'battle-defeat-modal', 'skill-picker-modal'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('open');
            });
        } else if (screenName === 'map-select') {
            this.prepareMapScreen();
        } else if (screenName === 'battle') {
            // Force immediate synchronous resize of canvases to match newly visible parent DOM
            this.combat.resize();
            this.rhythm.resize();
            setTimeout(() => { this.combat.resize(); this.rhythm.resize(); }, 50);
        }
    }

    // ==========================================
    // SCREEN NAVIGATION & BUTTONS
    // ==========================================
    setupScreenNavigation() {
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
        bind('menu-btn-play', (e) => { if (e) e.preventDefault(); this.switchScreen('map-select'); });
        bind('menu-btn-pvp', (e) => { if (e) e.preventDefault(); this.openPvPModal(); });
        bind('menu-btn-shop', (e) => { if (e) e.preventDefault(); this.openShopModal(); });
        bind('shop-close-btn', () => this.closeShopModal());
        bind('pve-stage-toggle-btn', () => this.toggleDrawer('map-stage-dropdown-drawer', 'pve-stage-toggle-btn'));
        bind('pve-hero-toggle-btn', () => this.toggleDrawer('map-hero-dropdown-drawer', 'pve-hero-toggle-btn'));
        bind('pve-song-toggle-btn', () => this.toggleDrawer('map-song-dropdown-drawer', 'pve-song-toggle-btn'));
        bind('menu-btn-talents', (e) => { if (e) e.preventDefault(); if (window.talentSystem && typeof window.talentSystem.open === 'function') window.talentSystem.open(); else { const m = document.getElementById('talent-modal'); if (m) m.classList.add('open'); } });
        bind('menu-btn-missions', (e) => { if (e) e.preventDefault(); if (window.metaMissionSystem) window.metaMissionSystem.open(); });
        bind('menu-btn-studio', () => { const m = document.getElementById('song-studio-modal'); if (m) { m.classList.add('open'); if (window.songStudio) window.songStudio.renderLibrary(); } });
        bind('menu-btn-settings', () => this.openGearModal(true));
        bind('menu-sound-toggle', () => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute();
                const b1 = document.getElementById('menu-sound-toggle'); if (b1) b1.innerText = this.tr(isMuted ? 'soundMuted' : 'soundActive', isMuted ? 'Mutado 🔇' : 'Ativo 🔊');
                const b2 = document.getElementById('battle-sound-toggle'); if (b2) b2.innerText = isMuted ? '🔇' : '🔊';
            }
        });
        bind('map-back-btn', () => this.switchScreen('menu'));
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

    openShopModal() {
        const m = document.getElementById('shop-modal');
        if (m) {
            m.classList.add('open');
            this.updateShopCurrencies();
            if (window.guitaristPool && typeof window.guitaristPool.renderShop === 'function') window.guitaristPool.renderShop();
        }
    }
    closeShopModal() { const m = document.getElementById('shop-modal'); if (m) m.classList.remove('open'); this.updateMenuCurrencies(); }
    updateShopCurrencies() {
        const g = (window.talentSystem && window.talentSystem.gold !== undefined) ? window.talentSystem.gold : 0;
        const x = (window.guitaristPool && typeof window.guitaristPool.getPlayerXp === 'function') ? window.guitaristPool.getPlayerXp() : 0;
        const gEl = document.getElementById('shop-gold-count'), xEl = document.getElementById('shop-xp-count');
        if (gEl) gEl.innerText = g.toLocaleString();
        if (xEl) xEl.innerText = x.toLocaleString();
    }
    toggleDrawer(drawerId, toggleBtnId) {
        const drawer = document.getElementById(drawerId), btn = toggleBtnId ? document.getElementById(toggleBtnId) : null;
        if (!drawer) return;
        const isOpen = drawer.classList.contains('open');
        ['map-stage-dropdown-drawer', 'map-hero-dropdown-drawer', 'map-song-dropdown-drawer'].forEach(id => {
            const d = document.getElementById(id); if (d && id !== drawerId) d.classList.remove('open');
        });
        ['pve-stage-toggle-btn', 'pve-hero-toggle-btn', 'pve-song-toggle-btn'].forEach(id => {
            const b = document.getElementById(id); if (b && id !== toggleBtnId) b.classList.remove('open');
        });
        if (isOpen) {
            drawer.classList.remove('open'); if (btn) btn.classList.remove('open');
        } else {
            drawer.classList.add('open'); if (btn) btn.classList.add('open');
            if (window.soundEngine) window.soundEngine.playSustainTick(0);
        }
    }
    renderStageDropdown() {
        const drawer = document.getElementById('map-stage-dropdown-drawer');
        if (!drawer || !window.stageSystem) return;
        const current = window.stageSystem.selectedStage, highest = window.stageSystem.highestUnlockedStage || 1;
        drawer.innerHTML = '';
        const curLbl = this.tr('btnCurrentStage', '✅ ATUAL'), chooseLbl = this.tr('btnChoose', '▶️ ESCOLHER'), lvlPfx = this.tr('levelShort', 'Nv.');
        for (let s = 1; s <= highest; s++) {
            const isSelected = (s === current), isBoss = window.stageSystem.isBossStage && window.stageSystem.isBossStage(s);
            const range = window.stageSystem.getZombieLevelRange(s), kills = window.stageSystem.getTargetKills(s), rewards = window.stageSystem.getStageRewards(s);
            const name = window.stageSystem.getStageName(s);
            const item = document.createElement('div');
            item.className = `pve-stage-dropdown-item ${isSelected ? 'active' : ''}`;
            item.innerHTML = `
                <div class="stage-item-info">
                    <span class="stage-item-title">${name} ${isBoss ? '👑' : ''}</span>
                    <div class="stage-info-chips"><span class="stage-chip chip-diff">💀 ${lvlPfx} ${range.min}-${range.max}</span><span class="stage-chip chip-target">🎯 ${kills}</span><span class="stage-chip chip-gold">🪙 +${rewards.coins}</span></div>
                </div>
                <button type="button" class="stage-item-btn ${isSelected ? 'active' : ''}">${isSelected ? curLbl : chooseLbl}</button>
            `;
            item.onclick = (e) => {
                if (e) e.stopPropagation();
                window.stageSystem.setSelectedStage(s);
                if (window.soundEngine) window.soundEngine.playGuitarChord(1);
                this.updateStageUI(); this.renderArenaRoster(); this.renderStageDropdown();
                if (window.enemyPool) { this.currentMapZombies = window.enemyPool.rollMapEnemies(5); this.renderMapZombies(); }
                drawer.classList.remove('open');
                const b = document.getElementById('pve-stage-toggle-btn'); if (b) b.classList.remove('open');
            };
            drawer.appendChild(item);
        }
    }

    // ==========================================
    // MAP & PRE-BATTLE PREPARATION
    // ==========================================
    async prepareMapScreen() {
        this.updateStageUI();
        this.renderArenaRoster();
        this.renderStageDropdown();
        this.renderHeroRoster();
        if (window.enemyPool) {
            this.currentMapZombies = window.enemyPool.rollMapEnemies(5);
            this.renderMapZombies();
        }
        this.renderLaneSkills();
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
        this.renderArenaRoster();
        this.renderStageDropdown();
    }

    renderArenaRoster() {
        if (!window.stageSystem) return;
        const currentMap = window.stageSystem.getSelectedMap();
        if (!currentMap) return;
        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
        const imgEl = document.getElementById('showcase-arena-img'), badgeEl = document.getElementById('showcase-arena-badge');
        if (imgEl) imgEl.src = currentMap.thumb;
        const bTxt = tr(currentMap.id + '_badge', currentMap.badge);
        if (badgeEl) { badgeEl.innerText = bTxt; badgeEl.className = `arena-theme-badge ${currentMap.badgeClass || ''}`; }
        setTxt('showcase-arena-name', `${tr(currentMap.id + '_name', currentMap.name)} • 🎲 ${tr('badgeRandom', 'ALEATÓRIO')}`);
        setTxt('showcase-arena-sub', tr(currentMap.id + '_sub', currentMap.subtitle));
        setTxt('showcase-arena-desc', tr(currentMap.id + '_desc', currentMap.description));
    }

    updateStageUI() {
        if (!window.stageSystem) return;
        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        const stage = window.stageSystem.selectedStage;
        const stageTitle = document.getElementById('map-stage-title-text'), stageInfo = document.getElementById('map-stage-info-text');
        if (stageTitle) stageTitle.innerText = window.stageSystem.getStageName(stage);
        if (stageInfo) {
            const isBoss = window.stageSystem.isBossStage && window.stageSystem.isBossStage(stage);
            const range = window.stageSystem.getZombieLevelRange(stage), kills = window.stageSystem.getTargetKills(stage), rewards = window.stageSystem.getStageRewards(stage);
            const bossChip = isBoss ? `<span class="stage-chip chip-boss">${tr('bossBadge', '👑 CHEFE (2x OURO/XP)')}</span>` : '';
            stageInfo.innerHTML = `${bossChip}<span class="stage-chip chip-diff">💀 ${tr('levelShort', 'Nv.')} ${range.min}-${range.max}</span><span class="stage-chip chip-target">🎯 ${kills} ${tr('targetsUnit', 'Alvos')}</span><span class="stage-chip chip-gold">🪙 +${rewards.coins}</span><span class="stage-chip chip-xp">⭐ +${rewards.xp} XP</span>`;
        }
    }

    renderHeroRoster() {
        if (!window.guitaristPool) return;
        const tr = (k, f, p) => (typeof i18n !== 'undefined' ? i18n.t(k, f, p) : f);
        const pool = window.guitaristPool;
        const selectedHero = (pool.getSelectedGuitarist && pool.getSelectedGuitarist()) 
            || (pool.getActiveGuitarist && pool.getActiveGuitarist());
        const displayId = this.previewHeroId || (selectedHero ? selectedHero.id : 'johnny_blaze');
        const currentHero = pool.guitarists.find(g => g.id === displayId) || selectedHero;
        if (!currentHero) return;

        const isUnlocked = pool.isHeroUnlocked(currentHero.id);
        const allHeroes = pool.getAllGuitarists();

        const el = (id) => document.getElementById(id);
        const sImg = el('showcase-hero-img'), rBadge = el('showcase-hero-rarity-badge'), nEl = el('showcase-hero-name'), tEl = el('showcase-hero-title');
        const iEl = el('showcase-hero-instrument-text'), pnEl = el('showcase-hero-passive-name'), pdEl = el('showcase-hero-passive-desc'), sBox = el('map-selected-hero-showcase');
        const hRarity = tr('rarity_' + (currentHero.rarityKey || 'common'), currentHero.rarity || 'COMUM');
        if (sImg) sImg.src = currentHero.icon;
        if (rBadge) { rBadge.innerText = (isUnlocked ? hRarity : `🔒 ${hRarity}`).toUpperCase(); rBadge.className = `hero-rarity-badge ${currentHero.rarityClass || currentHero.badgeClass || 'badge-common'} ${isUnlocked ? '' : 'badge-locked'}`; }
        if (nEl) nEl.innerText = isUnlocked ? currentHero.name : `🔒 ${currentHero.name}`;
        if (tEl) tEl.innerText = tr('hero_' + currentHero.id + '_title', currentHero.title);
        const hStats = pool.getHeroStats(currentHero.id);
        const hInst = tr('hero_' + currentHero.id + '_inst', currentHero.instrument);
        const encoreBonus = (window.talentSystem && typeof window.talentSystem.getStat === 'function') ? (window.talentSystem.getStat('special_encore') || 0) : 0;
        const effDur = Math.round(((hStats.specialDuration || 6) + encoreBonus) * 10) / 10;
        const spChip = tr('specialActiveChip', `🔥 Especial: ${effDur}s`, { duration: effDur });
        const unlockPrompt = tr('heroUnlockCostPrompt', `🔒 Desbloqueie por 🪙 ${(currentHero.unlockCost || 5000).toLocaleString()}`, { cost: (currentHero.unlockCost || 5000).toLocaleString() });
        if (iEl) iEl.innerText = isUnlocked ? `${hInst} • ⚡ 1.0/s • ${spChip}` : unlockPrompt;
        if (pnEl) pnEl.innerText = tr('hero_' + currentHero.id + '_pass_name', (currentHero.passive && currentHero.passive.name) || currentHero.passiveName || tr('passiveFallback', 'Passiva'));
        if (pdEl) pdEl.innerText = tr('hero_' + currentHero.id + '_pass_desc', (currentHero.passive && currentHero.passive.desc) || currentHero.passiveDesc || '');
        if (sBox) {
            const color = isUnlocked ? (currentHero.accentColor || currentHero.themeColor || '#ffaa00') : '#666677';
            sBox.style.borderColor = color; sBox.style.boxShadow = `0 4px 20px ${color}44`;
        }

        // Hero Level Progression / Unlock Box
        const lvlData = pool.getHeroLevelData(currentHero.id);
        const reqXp = pool.getXpRequiredForNextLevel(lvlData.level);
        const goldCost = pool.getGoldCostForLevelUp(lvlData.level);
        const lBadge = el('showcase-hero-level-badge'), xText = el('showcase-hero-xp-text'), xFill = el('showcase-hero-xp-fill');
        const lUpBtn = el('hero-level-up-btn'), invXpEl = el('showcase-hero-inv-xp'), injectBtn = el('hero-inject-xp-btn');
        const playerXp = pool.getPlayerXp();
        if (invXpEl) invXpEl.innerText = playerXp.toLocaleString();

        if (isUnlocked) {
            if (lBadge) lBadge.innerText = tr('heroLevelBadge', `⭐ NÍVEL ${lvlData.level} / 100`, { lvl: lvlData.level });
            if (xText) xText.innerText = lvlData.level >= 100 ? tr('heroMaxXp', 'MÁXIMO') : `XP: ${lvlData.xp} / ${reqXp}`;
            if (xFill) xFill.style.width = `${lvlData.level >= 100 ? 100 : Math.min(100, Math.round((lvlData.xp / reqXp) * 100))}%`;
            if (lUpBtn) {
                lUpBtn.disabled = (lvlData.level >= 100);
                lUpBtn.className = 'hero-level-up-action';
                lUpBtn.innerText = lvlData.level >= 100 ? tr('heroMaxLevel', '⭐ NÍVEL MÁXIMO (100)') : tr('heroLevelUp', `⬆️ SUBIR NÍVEL (🪙 ${goldCost})`, { cost: goldCost });
                lUpBtn.onclick = () => {
                    if (lvlData.level >= 100) return;
                    const res = pool.levelUpWithGold(currentHero.id);
                    if (res.success) {
                        if (window.soundEngine) window.soundEngine.playPowerChord();
                        this.renderHeroRoster(); this.updateMenuCurrencies();
                    } else alert(res.reason || tr('insufficientGold', 'Ouro insuficiente!'));
                };
            }
            if (injectBtn) {
                injectBtn.style.display = (lvlData.level >= 100) ? 'none' : 'inline-flex';
                const neededForLevel = Math.max(1, reqXp - lvlData.xp);
                if (playerXp <= 0) {
                    injectBtn.disabled = true;
                    injectBtn.innerText = tr('noXpInInventory', '✨ SEM XP NO INVENTÁRIO');
                } else {
                    injectBtn.disabled = false;
                    const toInject = Math.min(neededForLevel, playerXp);
                    injectBtn.innerText = (playerXp >= neededForLevel)
                        ? tr('btnInjectLevelUp', '✨ INJETAR XP (+1 NÍVEL)')
                        : tr('btnInjectXp', `✨ INJETAR XP (+${toInject.toLocaleString()} XP)`, { amount: toInject.toLocaleString() });
                    injectBtn.onclick = () => {
                        const res = pool.injectXpIntoHero(currentHero.id);
                        if (res.success) {
                            if (window.soundEngine) window.soundEngine.playPowerChord();
                            this.renderHeroRoster(); this.updateMenuCurrencies();
                        } else alert(res.reason || tr('errorInjectXp', 'Erro ao injetar XP!'));
                    };
                }
            }
        } else {
            const uCost = pool.getHeroUnlockCost(currentHero.id);
            if (lBadge) lBadge.innerText = tr('heroLocked', '🔒 GUITARRISTA BLOQUEADO');
            if (xText) xText.innerText = tr('heroUnlockCost', `Custo: 🪙 ${uCost} Ouro`, { cost: uCost });
            if (xFill) xFill.style.width = '0%';
            if (injectBtn) injectBtn.style.display = 'none';
            if (lUpBtn) {
                lUpBtn.disabled = false;
                lUpBtn.className = 'hero-level-up-action hero-unlock-cta';
                lUpBtn.innerText = tr('heroUnlock', `🪙 DESBLOQUEAR GUITARRISTA (🪙 ${uCost})`, { cost: uCost });
                lUpBtn.onclick = () => {
                    const res = pool.unlockHeroWithGold(currentHero.id);
                    if (res.success) {
                        if (window.soundEngine) window.soundEngine.playPowerChord();
                        this.previewHeroId = null;
                        this.renderHeroRoster(); this.renderLaneSkills(); this.updateMenuCurrencies();
                    } else alert(res.reason || tr('insufficientGold', 'Ouro insuficiente!'));
                };
            }
        }

        // 2. Populate 6 Guitarists Grid
        const grid = document.getElementById('map-heroes-roster-grid');
        if (!grid) return;
        grid.innerHTML = '';
        allHeroes.forEach(hero => {
            const isUnl = pool.isHeroUnlocked(hero.id);
            const isSelected = (hero.id === currentHero.id);
            const rTxt = tr('rarity_' + (hero.rarityKey || 'common'), hero.rarity || 'COMUM');
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `hero-roster-card ${isSelected ? 'active' : ''} ${isUnl ? '' : 'locked'}`;
            card.title = isUnl ? `${hero.name} (${rTxt})` : `🔒 ${hero.name} (🪙 ${hero.unlockCost})`;

            const color = isUnl ? (hero.accentColor || hero.themeColor || '#ffaa00') : '#555566';
            const badgeClass = isUnl ? (hero.rarityClass || hero.badgeClass || 'badge-common') : 'badge-locked';

            card.innerHTML = `
                <div class="hero-roster-art" style="border-color: ${color}; pointer-events: none;">
                    <img src="${hero.icon}" alt="${hero.name}" class="hero-roster-img" style="pointer-events: none; ${isUnl ? '' : 'filter: grayscale(0.85);'}">
                </div>
                <div class="hero-roster-name" style="pointer-events: none;">${hero.name.split(' ')[0]}</div>
                <span class="hero-roster-mini-badge ${badgeClass}" style="pointer-events: none;">${isUnl ? rTxt : `🔒 ${hero.unlockCost}`}</span>
                ${(isSelected && isUnl) ? '<span class="hero-card-check">✓</span>' : ''}
            `;

            card.onclick = (e) => {
                if (e) e.preventDefault();
                if (isUnl) {
                    pool.setSelectedGuitarist(hero.id);
                    this.previewHeroId = null;
                    if (window.soundEngine) window.soundEngine.playGuitarChord(2);
                    const d = document.getElementById('map-hero-dropdown-drawer'); if (d) d.classList.remove('open');
                    const b = document.getElementById('pve-hero-toggle-btn'); if (b) b.classList.remove('open');
                } else {
                    this.previewHeroId = hero.id;
                }
                this.renderHeroRoster();
                this.renderLaneSkills();
            };
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
        const hpU = this.tr('unitHp', 'HP'), spdU = this.tr('unitSpeed', 'Vel'), dmgU = this.tr('unitDmg', 'Dano');
        this.currentMapZombies.forEach(z => {
            const zName = this.tr('zombie_' + z.id, z.name), zShort = this.tr('zombie_short_' + z.id, z.badge), zFull = this.tr('zombie_full_' + z.id, z.fullBadge || z.badge);
            const card = document.createElement('div');
            card.className = 'zombie-preview-card';
            card.title = `${zName} (${zFull}) — ❤️ ${z.hp} ${hpU} • ⚡ ${z.speed} ${spdU} • 💥 ${z.attackDamage} ${dmgU}`;
            card.innerHTML = `
                <div class="zombie-card-art">
                    <img src="${z.icon}" alt="${zName}" class="zombie-card-img">
                    <span class="zombie-card-badge ${z.badgeClass || ''}">${zShort}</span>
                </div>
                <div class="zombie-card-info">
                    <div class="zombie-card-top-row">
                        <h4 class="zombie-card-name">${zName}</h4>
                        <span class="zombie-card-type-tag ${z.badgeClass || ''}">${zFull}</span>
                    </div>
                    <div class="zombie-card-stats-row">
                        <span class="zombie-stat-chip" title="${hpU}">❤️${z.hp}</span>
                        <span class="zombie-stat-chip" title="${spdU}">⚡${z.speed}</span>
                        <span class="zombie-stat-chip" title="${dmgU}">💥${z.attackDamage}</span>
                    </div>
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

        const basicTxt = this.tr('laneBasicMana', 'BÁSICO (0 MP)');
        for (let l = 0; l < 4; l++) {
            const skill = window.skillSystem.getEquippedSkill(l, hid);
            const badge = window.skillSystem.getSkillTypeBadge ? window.skillSystem.getSkillTypeBadge(skill) : { label: 'SKILL', color: '#00d4ff', bg: 'rgba(0,0,0,0.3)' };
            const dmgText = skill.damageMult ? `${Math.round(skill.damageMult * 100)}%` : '100%';
            const slot = document.createElement('div');
            slot.className = `lane-skill-slot lane-${l}`;
            slot.innerHTML = `
                <span class="lane-tag-num" style="color: ${laneColors[l]};">${this.tr('laneShortTag', 'Trilho {num}', { num: l + 1 })}</span>
                <span class="lane-skill-icon">${skill.icon}</span>
                <span class="lane-skill-title">${this.tr('skill_' + skill.id + '_name', skill.name)}</span>
                <span class="lane-skill-type-pill" style="color: ${badge.color}; background: ${badge.bg};">${badge.label} (${dmgText})</span>
                <span class="lane-skill-cost">${skill.manaCost > 0 ? `⚡ ${skill.manaCost} MP` : basicTxt}</span>
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

        const laneFull = this.tr(`laneFull_${laneIndex}`, this.tr('laneShortTag', `Trilho ${laneIndex + 1}`, { num: laneIndex + 1 }));
        const hero = window.guitaristPool ? window.guitaristPool.getActiveGuitarist() : null;
        const hid = hero ? hero.id : null;
        const heroName = hero ? hero.name : this.tr('heroFallback', 'Guitarrista');
        if (titleEl) titleEl.innerText = `⚡ ${laneFull} • ${heroName}`;

        if (resetBtn) {
            resetBtn.onclick = () => {
                window.skillSystem.resetHeroLoadout(hid);
                this.showToast(this.tr('toastLoadoutRestored', 'Loadout padrão restaurado!'));
                if (window.soundEngine) window.soundEngine.playPowerChord();
                this.openSkillPickerModal(laneIndex);
                this.renderLaneSkills();
                if (this.pvpSystem && typeof this.pvpSystem.renderPvPLaneSkills === 'function') this.pvpSystem.renderPvPLaneSkills();
            };
        }

        const currentSkill = window.skillSystem.getEquippedSkill(laneIndex, hid);
        const heroSkills = window.skillSystem.getSkillsForHero(hid);
        const eqTag = this.tr('skillEquippedTag', '✅ Equipada neste trilho'), blkTag = this.tr('skillBlockedTag', '🔒 Bloqueado: Mantenha ≥ 1 Ataque Básico');

        listEl.innerHTML = '';
        heroSkills.forEach(s => {
            const isEquipped = (s.id === currentSkill.id);
            const check = window.skillSystem.canEquipSkill(laneIndex, s.id, hid);
            const isBlocked = !check.allowed;
            const badge = window.skillSystem.getSkillTypeBadge ? window.skillSystem.getSkillTypeBadge(s) : { label: 'SKILL', color: '#00d4ff', bg: 'rgba(0,0,0,0.3)' };
            const dmgText = this.tr('skillDmgPct', '{pct}% Dano', { pct: Math.round((s.damageMult || 1) * 100) });
            const costTxt = s.manaCost > 0 ? this.tr('skillRockManaUnit', '{mp} Rock Mana', { mp: s.manaCost }) : this.tr('skillFreeBasic', '0 MP (Básico)');

            const card = document.createElement('div');
            card.className = `skill-card-choice ${isEquipped ? 'active' : ''} ${isBlocked ? 'blocked' : ''}`;
            card.innerHTML = `
                <div class="skill-choice-icon">${s.icon}</div>
                <div class="skill-choice-info">
                    <div class="skill-choice-header">
                        <span class="skill-choice-name">${this.tr('skill_' + s.id + '_name', s.name)}</span>
                        <span class="skill-type-pill" style="color: ${badge.color}; background: ${badge.bg};">${badge.label}</span>
                    </div>
                    <div class="skill-choice-stats">
                        <span class="skill-dmg-tag">💥 ${dmgText}</span>
                        <span class="skill-cost-tag" style="color: ${s.manaCost > 0 ? '#00d4ff' : '#00ff66'};">⚡ ${costTxt}</span>
                    </div>
                    <div class="skill-choice-desc">${this.tr('skill_' + s.id + '_desc', s.desc)}</div>
                    ${isEquipped ? `<span class="skill-status-tag equipped">${eqTag}</span>` : ''}
                    ${isBlocked ? `<span class="skill-status-tag blocked">${blkTag}</span>` : ''}
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
                if (this.pvpSystem && typeof this.pvpSystem.renderPvPLaneSkills === 'function') this.pvpSystem.renderPvPLaneSkills();
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
        if (!this.selectedSong) this.selectedSong = this.getBuiltinDefaultSong();
        let songs = [this.selectedSong];
        if (window.songDB) {
            try {
                await window.songDB.init();
                const dbSongs = await window.songDB.getAllSongs();
                if (dbSongs && dbSongs.length > 0) songs = dbSongs;
            } catch (e) { console.warn("Could not load songs from SongDB", e); }
        }
        this.availableSongs = songs;
        if (!this.selectedSong || !songs.some(s => s.id === this.selectedSong.id)) this.selectedSong = songs[0];
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
        const selBtn = this.tr('btnSelectedSong', '✅ SELECIONADA'), chBtn = this.tr('btnChoose', '▶️ ESCOLHER'), defArt = this.tr('songUnknownArtist', 'Desconhecido');
        list.innerHTML = '';
        songs.forEach(s => {
            const isSelected = this.selectedSong && (this.selectedSong.id === s.id);
            const notesTxt = this.tr('songNotesShort', '{count} notas', { count: (s.notes || []).length });
            const card = document.createElement('div');
            card.className = `map-song-card ${isSelected ? 'active' : ''}`;
            card.innerHTML = `
                <div class="map-song-card-main">
                    <img src="${s.cover || 'assets/covers/default_cover.jpg'}" alt="${s.title}" class="map-song-card-thumb">
                    <div class="map-song-card-text">
                        <span class="map-song-card-title">${s.title}</span>
                        <span class="map-song-card-meta">${s.artist || defArt} • ${s.bpm || 120} BPM • ${notesTxt}</span>
                    </div>
                </div>
                <button type="button" class="song-card-action-btn ${isSelected ? 'active' : ''}">${isSelected ? selBtn : chBtn}</button>
            `;
            const chooseHandler = (e) => { if (e) e.stopPropagation(); this.selectSong(s); };
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
        if (window.soundEngine) window.soundEngine.playGuitarChord(0);
        const select = document.getElementById('map-song-select');
        if (select && select.value !== song.id) select.value = song.id;
        const d = document.getElementById('map-song-dropdown-drawer'); if (d) d.classList.remove('open');
        const b = document.getElementById('pve-song-toggle-btn'); if (b) b.classList.remove('open');
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
        const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
        const coverImg = document.getElementById('map-selected-song-cover');
        if (coverImg) coverImg.src = song.cover || 'assets/covers/default_cover.jpg';
        setTxt('map-selected-song-title', song.title || this.tr('songDefaultTitle', 'Música'));
        setTxt('selected-song-bpm-tag', `${song.bpm || 120} BPM`);
        setTxt('map-song-artist', this.tr('songArtistLine', 'Autoria: {artist}', { artist: song.artist || this.tr('songUnknownArtist', 'Desconhecido') }));
        setTxt('map-song-notes-count', this.tr('songNotesMapped', '{count} notas mapeadas', { count: (song.notes || []).length }));
    }

    startMatchWithSong(song) {
        if (song) {
            this.selectSong(song);
        }
        this.startMatch();
    }

    async openPvPModal() {
        if (!this.pvpSystem) this.pvpSystem = (typeof PvPSystem !== 'undefined') ? new PvPSystem() : null;
        if (this.combat && this.pvpSystem) this.combat.pvpSystem = this.pvpSystem;
        if (this.pvpSystem) {
            let songs = [];
            if (window.songDB && typeof window.songDB.getAllSongs === 'function') {
                try { songs = await window.songDB.getAllSongs(); } catch (e) {}
            }
            if (!songs || songs.length === 0) songs = [this.selectedSong || this.getBuiltinDefaultSong()];
            this.pvpSystem.openMatchmakingModal(songs, this.selectedSong, (chosenSong) => {
                this.selectedSong = chosenSong;
                this.pvpSystem.startMatchmaking((opp) => this.startPvPBattle(opp, chosenSong));
            });
        }
    }

    startPvPBattle(opponent, chosenSong = null) {
        if (!opponent) return;
        this.combat.isPvPMode = true;
        this.combat.pvpSystem = this.pvpSystem;
        const song = chosenSong || this.selectedSong || this.getBuiltinDefaultSong();
        this.selectedSong = song;
        const enemies = (window.enemyPool && typeof window.enemyPool.rollMapEnemies === 'function') ? window.enemyPool.rollMapEnemies(4) : [];
        this.switchScreen('battle');
        const bScreen = document.getElementById('screen-battle');
        if (bScreen) bScreen.classList.add('pvp-active');
        this.combat.resetBattle(enemies, true);
        if (this.rhythm) this.rhythm.playCustomSong(song);
        if (window.countdownSystem) window.countdownSystem.startMatchCountdown();
    }

    startMatch() {
        if (!this.selectedSong) this.selectedSong = this.getBuiltinDefaultSong();
        this.isBattlePaused = false;
        if (this.combat) { this.combat.isPaused = false; this.combat.isGameOver = false; this.combat.isVictory = false; }
        if (this.rhythm) this.rhythm.isPaused = false;
        ['battle-gear-modal', 'battle-stats-modal', 'song-results-modal', 'battle-defeat-modal'].forEach(id => {
            const el = document.getElementById(id); if (el) el.classList.remove('open');
        });
        this.switchScreen('battle');
        this.combat.resize();
        this.rhythm.resize();
        if (!this.currentMapZombies || this.currentMapZombies.length === 0) {
            if (window.enemyPool) this.currentMapZombies = window.enemyPool.rollMapEnemies(5);
        }
        this.combat.resetBattle(this.currentMapZombies);
        this.rhythm.playCustomSong(this.selectedSong);
        if (window.countdownSystem) window.countdownSystem.startMatchCountdown();
    }

    // ==========================================
    // BATTLE CONTROLS & HUD
    // ==========================================
    setupBattleControls() {
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
        const closeM = id => { const m = document.getElementById(id); if (m) m.classList.remove('open'); };
        bind('battle-sound-toggle', () => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute(), icon = isMuted ? '🔇' : '🔊';
                ['battle-sound-toggle', 'menu-sound-toggle'].forEach(id => { const b = document.getElementById(id); if (b) b.innerText = icon; });
            }
        });
        bind('battle-stats-toggle', () => this.openStatsModal());
        bind('battle-special-btn', () => { if (window.specialSystem) window.specialSystem.activateSpecial(); }); if (window.specialSystem) window.specialSystem.init();
        bind('stats-modal-close-btn', () => this.closeStatsModal());
        bind('stats-resume-btn', () => this.closeStatsModal());
        bind('battle-gear-toggle', () => this.openGearModal(false));
        bind('gear-modal-close-btn', () => this.closeGearModal());
        bind('gear-footer-action-btn', () => this.closeGearModal());
        bind('gear-abandon-battle-btn', () => {
            const tr = (k, f) => (typeof i18n !== 'undefined' ? i18n.t(k, f) : f);
            if (confirm(tr('abandonBattleConfirm', "⚠️ Tem certeza que deseja abandonar a batalha e voltar ao menu inicial? O progresso desta partida será perdido."))) {
                if (window.countdownSystem) window.countdownSystem.cancel();
                closeM('battle-gear-modal'); this.switchScreen('menu');
            }
        });
        bind('result-replay-btn', () => { closeM('song-results-modal'); this.startMatch(); });
        bind('result-close-btn', () => { closeM('song-results-modal'); this.switchScreen('menu'); });
        bind('defeat-retry-btn', () => { closeM('battle-defeat-modal'); this.startMatch(); });
        bind('defeat-talents-btn', () => { closeM('battle-defeat-modal'); this.switchScreen('menu'); if (window.talentSystem && typeof window.talentSystem.open === 'function') window.talentSystem.open(); });
        bind('defeat-close-btn', () => { closeM('battle-defeat-modal'); this.switchScreen('menu'); });
        bind('pvp-res-close-btn', () => { closeM('pvp-results-modal'); if (this.rhythm) this.rhythm.stopCustomSong(); this.switchScreen('menu'); });
        bind('pvp-res-rematch-btn', () => { closeM('pvp-results-modal'); if (this.rhythm) this.rhythm.stopCustomSong(); this.openPvPModal(); });
    }

    pauseBattle() {
        this.isBattlePaused = true;
        if (this.combat) this.combat.isPaused = true;
        if (this.rhythm) { this.rhythm.isPaused = true; this.rhythm.pauseAudio(); }
    }

    resumeBattle() {
        this.isBattlePaused = false;
        if (this.combat) this.combat.isPaused = false;
        if (this.rhythm) { this.rhythm.isPaused = false; this.rhythm.resumeAudio(); }
        this.lastTime = performance.now(); this.lastRenderTime = performance.now();
    }

    refreshGearModalText() {
        const title = document.getElementById('gear-modal-title'), dangerZone = document.getElementById('gear-danger-zone-wrap'), footerBtn = document.getElementById('gear-footer-action-btn');
        if (this.isGearFromMenu) {
            if (title) title.innerText = this.tr('btnSettings', '⚙️ CONFIGURAÇÕES');
            if (dangerZone) dangerZone.style.display = 'none';
            if (footerBtn) footerBtn.innerText = this.tr('gearCloseSettings', '✕ FECHAR CONFIGURAÇÕES');
        } else {
            if (title) title.innerText = this.tr('gearTitle', '⚙️ OPÇÕES & PAUSA');
            if (dangerZone) dangerZone.style.display = 'block';
            if (footerBtn) footerBtn.innerText = this.tr('gearResume', '▶️ CONTINUAR PARTIDA');
        }
    }

    openGearModal(isFromMainMenu = false) {
        this.isGearFromMenu = isFromMainMenu;
        const modal = document.getElementById('battle-gear-modal');
        if (!modal) return;
        this.refreshGearModalText();
        if (!isFromMainMenu) this.pauseBattle();
        modal.classList.add('open');
    }

    closeGearModal() {
        const m = document.getElementById('battle-gear-modal'); if (m) m.classList.remove('open');
        if (!this.isGearFromMenu && this.currentScreen === 'battle' && !this.combat.isGameOver && !this.combat.isVictory) {
            if (window.countdownSystem) window.countdownSystem.startResumeCountdown(); else this.resumeBattle();
        }
    }

    openStatsModal() {
        const m = document.getElementById('battle-stats-modal'); if (!m) return;
        this.updateBattleStatsModal(); if (this.currentScreen === 'battle') this.pauseBattle();
        m.classList.add('open');
    }

    closeStatsModal() {
        const m = document.getElementById('battle-stats-modal'); if (m) m.classList.remove('open');
        if (this.currentScreen === 'battle' && !this.combat.isGameOver && !this.combat.isVictory) {
            if (window.countdownSystem) window.countdownSystem.startResumeCountdown(); else this.resumeBattle();
        }
    }

    updateBattleStatsModal() {
        const modal = document.getElementById('battle-stats-modal');
        if (!modal) return;
        const s = this.combat.battleStats, r = this.rhythm.songStats || {};
        if (window.guitaristPool) {
            const h = window.guitaristPool.getSelectedGuitarist();
            const thumbEl = document.getElementById('ss-hero-thumb'), nameTxt = document.getElementById('ss-hero-name'), rarityTxt = document.getElementById('ss-hero-rarity');
            if (thumbEl && h) thumbEl.src = h.icon;
            if (nameTxt && h) nameTxt.innerText = h.name;
            if (rarityTxt && h) { rarityTxt.innerText = this.tr('rarity_' + (h.rarityKey || 'common'), h.rarity).toUpperCase(); rarityTxt.className = `hero-rarity-badge ${h.rarityClass} ss-hero-rarity-badge`; }
        }
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        const elapsedSec = Math.floor((performance.now() - (s.matchStartTime || performance.now())) / 1000);
        const mins = Math.floor(elapsedSec / 60), secs = elapsedSec % 60;
        const totalNotes = r.totalNotes || 1, hitNotes = r.hitNotes || 0, accPct = Math.round((hitNotes / totalNotes) * 100);
        setVal('ss-total-damage', Math.round(s.damageDealt).toLocaleString());
        setVal('ss-hero-hp', `${Math.round(this.combat.heroHp)} / ${this.combat.heroMaxHp}`);
        setVal('ss-zombies-killed', s.zombiesKilled); setVal('ss-max-streak', `${r.maxStreak || this.rhythm.streak || 0} 🔥`);
        setVal('ss-current-multiplier', `x${this.rhythm.multiplier}`); setVal('ss-current-score', this.combat.score.toLocaleString());
        setVal('ss-match-coins', `+${s.coinsEarned} 🪙`);
        setVal('ss-accuracy-rate', `${accPct}% (${r.perfects || 0}P / ${r.greats || 0}G / ${r.misses || 0}M)`);
        setVal('ss-time-elapsed', `${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }

    triggerVictoryFinale(song, stats = {}) {
        if (this.combat && typeof this.combat.triggerVictoryFinale === 'function') this.combat.triggerVictoryFinale(song, stats);
        else this.showVictoryModal(song, stats);
    }

    showVictoryModal(song, stats = {}) {
        this.pauseBattle();
        if (this.rhythm) this.rhythm.stopCustomSong();
        if (this.combat) { this.combat.isVictory = true; this.combat.matchActive = false; this.combat.isPaused = true; }
        if (window.soundEngine && typeof window.soundEngine.stopSong === 'function') window.soundEngine.stopSong();
        const modal = document.getElementById('song-results-modal');
        if (!modal) return;
        const coverEl = document.getElementById('result-song-cover'), titleEl = document.getElementById('result-song-title'), artistEl = document.getElementById('result-song-artist');
        if (coverEl) coverEl.src = (song && song.cover) || 'assets/covers/default_cover.jpg';
        if (titleEl) titleEl.innerText = (song && song.title) || this.tr('victoryFallbackTitle', 'Show Concluído');
        if (artistEl) artistEl.innerText = (song && song.artist) || this.tr('victoryFallbackArtist', 'Solo de Guitarra');
        const totalNotes = stats.totalNotes || (song && song.notes ? song.notes.length : 1), hitNotes = stats.hitNotes || (totalNotes - (stats.misses || 0)), accPct = Math.round((hitNotes / Math.max(1, totalNotes)) * 100);
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setVal('result-accuracy', `${accPct}%`); setVal('result-hits', `${hitNotes} / ${totalNotes}`);
        setVal('result-zombies-killed', `${(this.combat && this.combat.battleStats ? this.combat.battleStats.zombiesKilled : 0)} 💀`);
        setVal('result-max-streak', `${stats.maxStreak || (this.rhythm ? this.rhythm.maxStreak : 0)} 🔥`);
        setVal('result-gold-reward', `+${(this.combat && this.combat.battleStats ? this.combat.battleStats.coinsEarned : 0)} 🪙`);
        setVal('result-score-gained', `+${(this.combat ? this.combat.score : 0).toLocaleString()}`);
        if (window.metaMissionSystem && typeof window.metaMissionSystem.recordSongCompletion === 'function') window.metaMissionSystem.recordSongCompletion(accPct, stats);
        try { if (window.stageSystem && typeof window.stageSystem.completeStage === 'function') window.stageSystem.completeStage(window.stageSystem.selectedStage); } catch(err) { console.warn("Stage completion error:", err); }
        if (window.soundEngine && typeof window.soundEngine.playPowerChord === 'function') window.soundEngine.playPowerChord();
        modal.classList.add('open');
    }

    showDefeatModal() {
        this.pauseBattle();
        if (this.rhythm) this.rhythm.stopCustomSong();
        if (this.combat) { this.combat.matchActive = false; this.combat.isPaused = true; }
        if (window.soundEngine && typeof window.soundEngine.stopSong === 'function') window.soundEngine.stopSong();
        const modal = document.getElementById('battle-defeat-modal');
        if (!modal) return;
        const s = (this.combat && this.combat.battleStats) || { zombiesKilled: 0, damageDealt: 0, coinsEarned: 0 };
        const r = (this.rhythm && this.rhythm.songStats) || {}, totalNotes = r.totalNotes || 1, hitNotes = r.hitNotes || 0, accPct = Math.round((hitNotes / Math.max(1, totalNotes)) * 100);
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setVal('defeat-zombies-killed', `${s.zombiesKilled} 💀`); setVal('defeat-total-damage', Math.round(s.damageDealt).toLocaleString());
        setVal('defeat-accuracy', `${accPct}%`); setVal('defeat-gold-reward', `+${s.coinsEarned} 🪙`);
        setVal('defeat-score-gained', (this.combat ? this.combat.score : 0).toLocaleString());
        if (window.soundEngine && typeof window.soundEngine.playMiss === 'function') window.soundEngine.playMiss();
        modal.classList.add('open');
    }

    setupAudioGlobalUnlock() {
        const unlock = () => { if (window.soundEngine) window.soundEngine.resume(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('touchstart', unlock); };
        window.addEventListener('pointerdown', unlock); window.addEventListener('touchstart', unlock);
    }

    start() {
        this.lastTime = performance.now();
        this.lastRenderTime = 0;

        const loop = (currentTime) => {
            const now = currentTime || performance.now();

            // 60 FPS Pacing Lock for High-Refresh Displays (e.g. Redmi Note 14 Pro 120Hz/90Hz)
            // Absorbs display refresh jitter while locking high-refresh screens at solid 60 FPS without frame drops
            if (this.lastRenderTime && (now - this.lastRenderTime < 10.5)) {
                this.animationId = requestAnimationFrame(loop);
                return;
            }

            const deltaTime = Math.min(50, Math.max(1, now - (this.lastTime || now)));
            this.lastTime = now;
            this.lastRenderTime = now;

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
        if (window.countdownSystem && window.countdownSystem.isActive) window.countdownSystem.update(deltaTime / 1000);
        this.combat.update(deltaTime);
        this.rhythm.update(deltaTime);
    }

    draw() {
        this.combat.draw();
        this.rhythm.draw();
    }

    updateBattleHUD() {
        if (!this.hudCache) {
            this.hudCache = {
                hpBar: document.getElementById('hero-hp-bar'),
                hpText: document.getElementById('battle-hero-hp-text'),
                rockBar: document.getElementById('rock-meter-bar'),
                manaText: document.getElementById('battle-hero-mana-text'),
                scoreEl: document.getElementById('battle-score-val'),
                comboEl: document.getElementById('battle-combo-val'),
                multEl: document.getElementById('battle-mult-val'),
                lastHpPct: -1, lastHpText: '', lastRockW: '', lastManaText: '',
                lastScore: '', lastCombo: '', lastMult: ''
            };
        }
        const h = this.hudCache;
        if (h.hpBar) {
            const pct = Math.max(0, Math.min(100, Math.round((this.combat.heroHp / this.combat.heroMaxHp) * 100)));
            if (pct !== h.lastHpPct) { h.lastHpPct = pct; h.hpBar.style.width = `${pct}%`; h.hpBar.style.backgroundColor = pct < 30 ? '#ff2222' : (pct < 60 ? '#ffaa00' : '#00ff66'); }
        }
        if (h.hpText) { const t = `${Math.round(this.combat.heroHp)} / ${this.combat.heroMaxHp}`; if (t !== h.lastHpText) { h.lastHpText = t; h.hpText.innerText = t; } }
        if (h.rockBar) { const w = `${Math.round(this.combat.rockPower)}%`; if (w !== h.lastRockW) { h.lastRockW = w; h.rockBar.style.width = w; } }
        if (h.manaText) { const t = `${Math.floor(this.combat.rockMana)} / ${this.combat.maxRockMana}`; if (t !== h.lastManaText) { h.lastManaText = t; h.manaText.innerText = t; } }
        if (h.scoreEl) { const t = (this.combat.score || 0).toLocaleString(); if (t !== h.lastScore) { h.lastScore = t; h.scoreEl.innerText = t; } }
        if (h.comboEl) {
            const streak = this.rhythm.streak || 0, pStreak = (this.combat && this.combat.perfectStreak) || 0;
            const critReady = (this.combat && this.combat.guaranteedCritReady);
            const critTag = critReady ? this.tr('critReadyTag', ' • 💥 CRÍTICO PRONTO!') : (pStreak > 0 ? ` • 🎯 ${pStreak}/5 PERF` : '');
            const t = this.tr('comboHudFormat', `${streak} COMBO (+${Math.min(2.0, streak * 0.01).toFixed(2)} VEL)${critTag}`, { streak, spd: Math.min(2.0, streak * 0.01).toFixed(2), crit: critTag });
            if (t !== h.lastCombo) { h.lastCombo = t; h.comboEl.innerText = t; }
        }
        if (h.multEl) { const t = `x${this.rhythm.multiplier || 1}`; if (t !== h.lastMult) { h.lastMult = t; h.multEl.innerText = t; } }
        if (!h.comboPill) h.comboPill = document.getElementById('battle-combo-pill');
        if (h.comboPill) { const streak = this.rhythm.streak || 0; h.comboPill.classList.toggle('active', streak >= 5); h.comboPill.classList.toggle('on-fire', streak >= 15); }
    }

    updateMenuHUD() {
        const goldCount = document.getElementById('menu-gold-count'), xpCount = document.getElementById('menu-xp-count');
        const highscoreVal = document.getElementById('menu-highscore-val'), killsVal = document.getElementById('menu-total-kills');
        if (goldCount && window.talentSystem) goldCount.innerText = (window.talentSystem.gold || 0).toLocaleString();
        if (xpCount && window.guitaristPool) xpCount.innerText = window.guitaristPool.getPlayerXp().toLocaleString();
        if (highscoreVal) highscoreVal.innerText = parseInt(localStorage.getItem('gvs_highscore') || '0').toLocaleString();
        if (killsVal) killsVal.innerText = parseInt(localStorage.getItem('gvs_total_kills') || '0').toLocaleString();
        if (window.metaMissionSystem) window.metaMissionSystem.updateBadgeCounter();
    }

    updateMenuCurrencies() { this.updateMenuHUD(); }
}

// Iniciar quando o DOM carregar
window.addEventListener('load', () => {
    if (typeof EnemyPoolSystem !== 'undefined' && !window.enemyPool) window.enemyPool = new EnemyPoolSystem();
    if (typeof TalentSystem !== 'undefined') window.talentSystem = new TalentSystem();
    if (typeof SongStudio !== 'undefined' && window.songStudio) window.songStudio.init();
    if (typeof MetaMissionSystem !== 'undefined' && !window.metaMissionSystem) window.metaMissionSystem = new MetaMissionSystem();
    window.game = new Game();
    if (window.talentSystem) window.talentSystem.syncWithCombat();
});
