// PvP System Module (Asynchronous Simulated Online Matchmaking, Realistic Opponent AI, Center Spawning & Cross-Healing)

class PvPSystem {
    constructor() {
        this.state = 'idle'; // 'idle', 'searching', 'matched', 'versus', 'playing', 'ended'
        this.opponent = null;
        this.searchTimer = 0;
        this.searchTargetTime = 3.2;
        this.versusCountdown = 3;
        this.matchInterval = null;
        this.playerTrophies = parseInt(localStorage.getItem('gvs_pvp_trophies') || '500', 10);
        this.playerWins = parseInt(localStorage.getItem('gvs_pvp_wins') || '0', 10);
        this.playerLosses = parseInt(localStorage.getItem('gvs_pvp_losses') || '0', 10);
        this.overhealsPlayer = 0;
        this.overhealsOpponent = 0;
        this.opponentZombiesKilled = 0;
        this.oppLaneFlashes = [0, 0, 0, 0];
        this.oppParticles = [];
        this.oppFloatingRatings = [];
        this.oppStreak = 0;
        this.oppMultiplier = 1;

        // Realistic Player Nicknames Pool (Brazilian & Global rhythm gamers)
        this.nicknamesPool = [
            'Lucas_ShredBR', 'Thiago_Solo99', 'FretMaster_BR', 'Gabriel_Riffs', 'Matheus_Rock',
            'Dinho_Slash', 'Rafael_MetalBR', 'Leo_HyperFret', 'Bia_BassGirl', 'Vinicius_Power',
            'Pedro_AxeLord', 'Caio_Overdrive', 'Andre_DeathRiff', 'Bruna_Rocker', 'Rodrigo_Vortex',
            'SlashJunior_94', 'NeonSolo_X', 'DarkMetalBR', 'ThunderPick_7', 'IronClaw_BR',
            'CyberRocker', 'CrimsonChord', 'DeathFret_66', 'DragonForce_Fan', 'RiffGod_2026',
            'HeavyStrings_X', 'StrumKing_BR', 'StaticShock_BR', 'SonicBlade_99', 'Blackout_Solo',
            'GhostFretter', 'NightmareRocker', 'Hellfire_Fret', 'ToxicStrummer', 'TitanRiff',
            'Axel_Rose_BR', 'Zakk_Wylde_BR', 'GuitarHeroPro', 'SpeedyFingers', 'PowerChordMaster',
            'DistortionKing', 'MetalHead_BR', 'RockStar_Leo', 'FretboardWizard', 'Overdrive_Max',
            'Alexandre_V', 'Felipe_Speed', 'Marcelo_Axe', 'Igor_Cavalera9', 'Renato_RockBR'
        ];
    }

    getTrophies() {
        return this.playerTrophies;
    }

    addTrophies(amount) {
        this.playerTrophies = Math.max(0, this.playerTrophies + amount);
        try { localStorage.setItem('gvs_pvp_trophies', this.playerTrophies.toString()); } catch (e) {}
        return this.playerTrophies;
    }

    getRank(trophies = this.playerTrophies) {
        if (trophies >= 2500) return { name: 'Mestre do Rock', tier: 'master', badge: '👑 Mestre', color: '#ffd700' };
        if (trophies >= 1800) return { name: 'Diamante', tier: 'diamond', badge: '💠 Diamante', color: '#00ffff' };
        if (trophies >= 1200) return { name: 'Platina', tier: 'platinum', badge: '💎 Platina', color: '#d44dff' };
        if (trophies >= 700) return { name: 'Ouro', tier: 'gold', badge: '🥇 Ouro', color: '#ffaa00' };
        if (trophies >= 300) return { name: 'Prata', tier: 'silver', badge: '🥈 Prata', color: '#c0c0c0' };
        return { name: 'Bronze', tier: 'bronze', badge: '🥉 Bronze', color: '#cd7f32' };
    }

    generateOpponent(playerHeroData = null, playerStats = {}) {
        const pool = (window.guitaristPool && window.guitaristPool.guitarists) || [];
        const hero = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : { id: 'vulkan_ironhead', name: 'Vulkan Ironhead', sheet: 'heroDracoSheet' };
        const rawNick = this.nicknamesPool[Math.floor(Math.random() * this.nicknamesPool.length)];
        const pLevel = (playerHeroData && playerHeroData.level) || 1;
        const oppLevel = Math.max(1, Math.min(100, pLevel + (Math.floor(Math.random() * 3) - 1)));
        const oppTrophies = Math.max(50, this.playerTrophies + (Math.floor(Math.random() * 60) - 30));
        const oppRank = this.getRank(oppTrophies);
        const damageBase = Math.round(45 * (1 + 0.01 * (oppLevel - 1)));

        return {
            id: `opp_${Date.now()}`,
            name: rawNick,
            guitarist: hero,
            sheetKey: hero.sheet || 'heroSheet',
            level: oppLevel,
            trophies: oppTrophies,
            rank: oppRank,
            hp: 100,
            maxHp: 100,
            score: 0,
            streak: 0,
            maxStreak: 0,
            notesHit: 0,
            totalNotes: 0,
            damage: damageBase,
            accuracy: 0.92 + Math.random() * 0.05,
            ping: Math.floor(Math.random() * 22) + 22,
            flashTime: 0
        };
    }

    startMatchmaking(onMatchFound, onCancel) {
        this.state = 'searching';
        this.searchTimer = 0;
        this.searchTargetTime = (Math.random() * 1.8 + 2.4); // 2.4s to 4.2s realistic queue
        this.versusCountdown = 3;
        this.opponent = null;
        this.overhealsPlayer = 0;
        this.overhealsOpponent = 0;
        this.opponentZombiesKilled = 0;
        this.oppLaneFlashes = [0, 0, 0, 0];
        this.oppParticles = [];
        this.oppFloatingRatings = [];
        this.oppStreak = 0;
        this.oppMultiplier = 1;

        const modal = document.getElementById('pvp-matchmaking-modal');
        if (modal) modal.classList.add('open');

        const queueView = document.getElementById('pvp-queue-searching-view');
        const versusView = document.getElementById('pvp-versus-found-view');
        if (queueView) queueView.style.display = 'flex';
        if (versusView) versusView.style.display = 'none';

        const timerEl = document.getElementById('pvp-timer-display');
        const statusEl = document.getElementById('pvp-status-text');
        const pingEl = document.getElementById('pvp-ping-display');

        const tr = (k, f) => (typeof i18n !== 'undefined' ? i18n.t(k, f) : f);
        const steps = [
            tr('pvpConnecting', 'Conectando ao servidor SA-East (São Paulo)...'),
            tr('pvpSearching', 'Buscando guitarristas no mesmo tier de troféus...'),
            'Calculando latência e matchmaking balanceado...'
        ];

        let stepIndex = 0;
        if (this.matchInterval) clearInterval(this.matchInterval);

        this.matchInterval = setInterval(() => {
            this.searchTimer += 0.2;
            const sec = Math.floor(this.searchTimer);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            if (timerEl) timerEl.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;

            if (this.searchTimer > 0.8 && stepIndex === 0) { stepIndex = 1; if (statusEl) statusEl.innerText = steps[1]; }
            if (this.searchTimer > 1.8 && stepIndex === 1) { stepIndex = 2; if (statusEl) statusEl.innerText = steps[2]; }

            // Match Found!
            if (this.searchTimer >= this.searchTargetTime) {
                clearInterval(this.matchInterval);
                this.matchInterval = null;
                this.state = 'matched';

                const pPool = window.guitaristPool;
                const pActive = pPool ? pPool.getSelectedGuitarist() : null;
                this.opponent = this.generateOpponent(pActive);

                if (window.soundEngine && typeof window.soundEngine.playPowerChord === 'function') {
                    window.soundEngine.playPowerChord(0);
                }

                // Show Versus Face-off
                if (queueView) queueView.style.display = 'none';
                if (versusView) versusView.style.display = 'flex';

                this.populateVersusView(pActive, this.opponent);

                // 3... 2... 1... Launch Battle
                let count = 3;
                const countEl = document.getElementById('pvp-countdown-val');
                const countInterval = setInterval(() => {
                    count--;
                    if (countEl) countEl.innerText = count > 0 ? count : 'GO! ⚡';
                    if (count <= 0) {
                        clearInterval(countInterval);
                        if (modal) modal.classList.remove('open');
                        this.state = 'playing';
                        if (typeof onMatchFound === 'function') onMatchFound(this.opponent);
                    }
                }, 900);
            }
        }, 200);

        const cancelBtn = document.getElementById('pvp-cancel-queue-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.cancelMatchmaking();
                if (typeof onCancel === 'function') onCancel();
            };
        }
    }

    cancelMatchmaking() {
        if (this.matchInterval) clearInterval(this.matchInterval);
        this.matchInterval = null;
        this.state = 'idle';
        const modal = document.getElementById('pvp-matchmaking-modal');
        if (modal) modal.classList.remove('open');
    }

    populateVersusView(playerHero, opponent) {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        const setImg = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };

        // Player Side
        setVal('pvp-player-name', (playerHero && playerHero.name) || 'Você');
        setVal('pvp-player-level', `Nv. ${(playerHero && playerHero.level) || 1}`);
        setVal('pvp-player-rank', this.getRank().badge);
        setImg('pvp-player-avatar', (playerHero && playerHero.avatar) || 'assets/covers/default_cover.jpg');

        // Opponent Side
        setVal('pvp-opp-versus-name', opponent.name);
        setVal('pvp-opp-versus-hero', opponent.guitarist.name);
        setVal('pvp-opp-versus-level', `Nv. ${opponent.level}`);
        setVal('pvp-opp-versus-rank', opponent.rank.badge);
        setImg('pvp-opp-versus-avatar', opponent.guitarist.avatar || 'assets/covers/default_cover.jpg');
    }

    getOpponentPosition(combat) {
        const cw = Math.max(200, (combat && combat.canvas && combat.canvas.width) || 800);
        const heroPos = (combat && combat.getHeroPosition) ? combat.getHeroPosition() : { x: cw * 0.16, y: 200 };
        return { x: Math.round(cw * 0.84), y: heroPos.y };
    }

    spawnZombiePair(combat, forceDef = null) {
        if (!combat || !combat.canvas) return;
        const cw = combat.canvas.width;
        const metrics = combat.getRoadMetrics ? combat.getRoadMetrics() : { laneY: combat.canvas.height * 0.78 };
        const stage = window.stageSystem ? window.stageSystem.selectedStage : 1;
        const range = window.stageSystem ? window.stageSystem.getZombieLevelRange(stage) : { min: 1, max: 2 };
        const zLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

        let enemyDef = forceDef;
        if (!enemyDef) {
            const pool = (combat.activeEnemyTypes && combat.activeEnemyTypes.length > 0)
                ? combat.activeEnemyTypes
                : (window.enemyPool ? window.enemyPool.getEnemiesForCurrentMatch() : []);
            enemyDef = pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : { type: 'normal', scale: 0.50, speed: 38, hp: 104, attackDamage: 7, name: 'Zumbi Punk' };
        }

        const ZombieClass = window.ZombieEntity || ZombieEntity;

        // Zombie 1: Player Side (starts left of center, moves left towards player)
        const defPlayer = { ...enemyDef, side: 'player' };
        const zPlayer = new ZombieClass(defPlayer, metrics.laneY, cw, zLevel, cw * 0.5 - 22);
        zPlayer.side = 'player';
        combat.entities.zombies.push(zPlayer);

        // Zombie 2: Opponent Side (starts right of center, moves right towards opponent)
        const defOpponent = { ...enemyDef, side: 'opponent' };
        const zOpponent = new ZombieClass(defOpponent, metrics.laneY, cw, zLevel, cw * 0.5 + 22);
        zOpponent.side = 'opponent';
        combat.entities.zombies.push(zOpponent);
    }

    onSongNotePassed(note, rating, songTime, combat) {
        if (!this.opponent || this.state !== 'playing' || !combat) return;
        this.opponent.totalNotes++;

        const track = (note && note.track !== undefined) ? note.track : 0;
        const roll = Math.random();
        let oppRating = 'perfect';
        if (roll > this.opponent.accuracy) oppRating = 'miss';
        else if (roll > 0.70) oppRating = 'great';
        else if (roll > 0.88) oppRating = 'good';

        const oppPos = this.getOpponentPosition(combat);

        if (oppRating === 'miss') {
            this.opponent.streak = 0;
            this.oppStreak = 0;
            this.oppMultiplier = 1;
            this.addOpponentRating('MISS', track, '#ff4444');
            combat.addFloatingText('MISS (OPP)', oppPos.x - 15, oppPos.y - 45, '#ff4444', false);
            return;
        }

        this.opponent.streak++;
        this.oppStreak = this.opponent.streak;
        this.opponent.maxStreak = Math.max(this.opponent.maxStreak, this.opponent.streak);
        this.opponent.notesHit++;
        this.oppMultiplier = Math.min(4, 1 + Math.floor(this.oppStreak / 6));

        const mult = oppRating === 'perfect' ? 1.5 : (oppRating === 'great' ? 1.2 : 1.0);
        const dmg = Math.round(this.opponent.damage * mult);
        const scoreGained = Math.round(150 * mult * this.oppMultiplier);
        this.opponent.score += scoreGained;

        const ratingText = oppRating === 'perfect' ? 'PERFECT!' : (oppRating === 'great' ? 'GREAT!' : 'GOOD');
        const ratingCol = oppRating === 'perfect' ? '#ffcc00' : (oppRating === 'great' ? '#00ff66' : '#00d4ff');
        this.oppLaneFlashes[track] = 1.0;
        this.addOpponentRating(ratingText, track, ratingCol);
        this.addOpponentHitSparks(track, ratingCol);

        // Find target for opponent projectile
        let target = null, maxDist = -Infinity;
        for (const z of combat.entities.zombies) {
            if (z.active && z.side === 'opponent' && z.x >= combat.canvas.width * 0.48 && z.x > maxDist) {
                maxDist = z.x; target = z;
            }
        }
        if (!target) {
            let maxPX = -Infinity;
            for (const z of combat.entities.zombies) {
                if (z.active && z.side === 'player' && z.x > maxPX) { maxPX = z.x; target = z; }
            }
        }

        // Fire opponent projectile from right side towards center/left
        const startX = oppPos.x - 22, startY = oppPos.y - 18;
        let angle = Math.PI;
        if (target) angle = Math.atan2((target.y - 15) - startY, target.x - startX);

        combat.entities.projectiles.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * 440, vy: Math.sin(angle) * 440,
            owner: 'opponent', target: target,
            isCrit: oppRating === 'perfect', damage: dmg,
            frame: 3 + Math.floor(Math.random() * 4),
            trailTimer: 0, active: true, projColor: '#ff3344'
        });

        combat.fx.shockwaves.push({ x: startX, y: startY, radius: 4, maxRadius: 22, color: '#ff3344', lineWidth: 2, alpha: 1.0 });
    }

    handleCollision(p, z, combat) {
        if (!combat || !p || !z || !p.active || !z.active) return false;
        const pOwner = p.owner || 'player';

        // 1. Player Projectile Collision Logic
        if (pOwner === 'player') {
            const hasPlayerZombies = combat.entities.zombies.some(other => other.active && other.side === 'player' && other.x <= combat.canvas.width * 0.52);

            // If player projectile reaches opponent zombie when player side is clear -> OVER-SHOOT HEALS OPPONENT ZOMBIE!
            if (!hasPlayerZombies && z.side === 'opponent') {
                const healAmt = Math.max(6, Math.round(p.damage * 0.30));
                z.hp = Math.min(z.maxHp * 1.5, z.hp + healAmt);
                z.flashTime = 0.22;
                p.active = false;
                this.overhealsPlayer++;

                combat.addFloatingText(`+${healAmt} HP 💚 (BUFF!)`, z.x, z.y - 40, '#00ff66', true);
                combat.fx.spawnBurst(z.x, z.y - 15, '#00ff66', 10, 60, 2.5, 0.4);
                combat.fx.shockwaves.push({ x: z.x, y: z.y - 15, radius: 4, maxRadius: 35, color: '#00ff66', lineWidth: 2.5, alpha: 1.0 });
                return true;
            }

            // Normal hit on player-side zombie
            if (z.side === 'player') return false; // Handled by combat's standard damage logic
            return true; // Ignore opponent zombie if player still has player-side zombies
        }

        // 2. Opponent Projectile Collision Logic
        if (pOwner === 'opponent') {
            const hasOpponentZombies = combat.entities.zombies.some(other => other.active && other.side === 'opponent' && other.x >= combat.canvas.width * 0.48);

            // Opponent projectile crosses to player side -> HEALS PLAYER ZOMBIE!
            if (!hasOpponentZombies && z.side === 'player') {
                const healAmt = Math.max(6, Math.round(p.damage * 0.30));
                z.hp = Math.min(z.maxHp * 1.5, z.hp + healAmt);
                z.flashTime = 0.22;
                p.active = false;
                this.overhealsOpponent++;

                combat.addFloatingText(`+${healAmt} HP 💚 (OPP BUFF!)`, z.x, z.y - 40, '#00ff66', true);
                combat.fx.spawnBurst(z.x, z.y - 15, '#00ff66', 10, 60, 2.5, 0.4);
                combat.fx.shockwaves.push({ x: z.x, y: z.y - 15, radius: 4, maxRadius: 35, color: '#00ff66', lineWidth: 2.5, alpha: 1.0 });
                return true;
            }

            // Hits opponent-side zombie -> Deals damage to opponent zombie
            if (z.side === 'opponent') {
                z.hp -= p.damage;
                z.flashTime = 0.14;
                p.active = false;
                combat.addFloatingText(`${p.damage}`, z.x, z.y - 32, p.projColor || '#ff3344', p.isCrit);
                combat.fx.spawnBurst(p.x, p.y, '#ff3344', 6, 50, 2, 0.25);

                if (z.hp <= 0 && z.active) {
                    z.active = false;
                    this.opponentZombiesKilled++;
                    this.opponent.score += 150;
                    combat.addFloatingText('OPP KILL! 💀', z.x, z.y - 30, '#ff3344', true);
                    combat.fx.spawnBurst(z.x, z.y, '#ff3344', 12, 70, 3, 0.4);
                    combat.fx.shockwaves.push({ x: z.x, y: z.y, radius: 4, maxRadius: 35, color: '#ff3344', lineWidth: 2, alpha: 1.0 });
                }
                return true;
            }
            return true;
        }
        return false;
    }

    damageOpponent(amount, isHeavy = false, label = '', color = '#ff3344', combat = null) {
        if (!this.opponent || this.opponent.hp <= 0) return;
        this.opponent.hp = Math.max(0, this.opponent.hp - amount);
        this.opponent.flashTime = 0.25;

        if (combat) {
            const oppPos = this.getOpponentPosition(combat);
            combat.addFloatingText(label || `-${amount} HP`, oppPos.x - 10, oppPos.y - 42, color, isHeavy);
            combat.triggerShake(isHeavy ? 6 : 3);
        }

        // KO Victory Check
        if (this.opponent.hp <= 0 && this.state === 'playing') {
            this.endPvPBattle('player_ko', combat, window.game ? window.game.rhythm : null);
        }
    }

    update(dt, combat) {
        if (this.state !== 'playing' || !this.opponent) return;
        if (this.opponent.flashTime > 0) this.opponent.flashTime -= dt;

        for (let i = 0; i < 4; i++) {
            if (this.oppLaneFlashes[i] > 0) this.oppLaneFlashes[i] = Math.max(0, this.oppLaneFlashes[i] - 5 * dt);
        }

        this.oppParticles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= 2.2 * dt; });
        this.oppParticles = this.oppParticles.filter(p => p.life > 0);

        this.oppFloatingRatings.forEach(r => { r.y += r.vy * dt; r.alpha -= 2.2 * dt; });
        this.oppFloatingRatings = this.oppFloatingRatings.filter(r => r.alpha > 0);

        // Player Defeat Check
        if (combat.heroHp <= 0) {
            this.endPvPBattle('opponent_ko', combat, window.game ? window.game.rhythm : null);
        }
    }

    addOpponentRating(text, track, color = '#00ff66') {
        const cw = (window.game && window.game.rhythm && window.game.rhythm.canvas) ? window.game.rhythm.canvas.width : 400;
        const startX = cw * 0.5, trackW = (cw * 0.5) / 4;
        const hitZoneY = (window.game && window.game.rhythm) ? window.game.rhythm.getHitZoneY() : 200;
        const x = startX + track * trackW + trackW / 2;
        this.oppFloatingRatings.push({ text, x, y: hitZoneY - 24, color, alpha: 1.0, vy: -60, scale: 1.1 });
    }

    addOpponentHitSparks(track, color) {
        const cw = (window.game && window.game.rhythm && window.game.rhythm.canvas) ? window.game.rhythm.canvas.width : 400;
        const startX = cw * 0.5, trackW = (cw * 0.5) / 4;
        const hitZoneY = (window.game && window.game.rhythm) ? window.game.rhythm.getHitZoneY() : 200;
        const x = startX + track * trackW + trackW / 2;
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2, spd = 40 + Math.random() * 80;
            this.oppParticles.push({ x, y: hitZoneY, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, size: 2.5 + Math.random() * 2, color, life: 0.35 });
        }
    }

    drawOpponentHighway(ctx, cw, ch, hitZoneY, curTime, notes, noteSpeed = 340) {
        if (!this.opponent) return;
        const startX = cw * 0.5, hwW = cw * 0.5, trackW = hwW / 4;

        // 1. Opponent Highway Background
        ctx.fillStyle = '#100a14'; ctx.fillRect(startX, 0, hwW, ch);

        const oppColors = [
            { main: '#ff2a5f', glow: 'rgba(255, 42, 95, 0.45)', core: '#ffe6ed' },
            { main: '#ff7700', glow: 'rgba(255, 119, 0, 0.45)', core: '#fff0e6' },
            { main: '#ff00bb', glow: 'rgba(255, 0, 187, 0.45)', core: '#ffe6f9' },
            { main: '#00e5ff', glow: 'rgba(0, 229, 255, 0.45)', core: '#e6faff' }
        ];

        // 2. Fret Strings & Flashes
        for (let i = 0; i < 4; i++) {
            const tx = startX + i * trackW;
            if (this.oppLaneFlashes[i] > 0) {
                ctx.fillStyle = oppColors[i].glow;
                ctx.globalAlpha = this.oppLaneFlashes[i] * 0.7;
                ctx.fillRect(tx, 0, trackW, ch);
                ctx.globalAlpha = 1.0;
            }
            ctx.strokeStyle = 'rgba(255, 100, 140, 0.15)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(tx + trackW / 2, 0); ctx.lineTo(tx + trackW / 2, ch); ctx.stroke();
            ctx.strokeStyle = '#251220'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, ch); ctx.stroke();
        }

        // 3. Opponent Hit Zone Bar
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 51, 68, 0.35)'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(startX, hitZoneY); ctx.lineTo(cw, hitZoneY); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(startX, hitZoneY); ctx.lineTo(cw, hitZoneY); ctx.stroke();
        ctx.restore();

        // 4. Opponent Target Pads
        for (let i = 0; i < 4; i++) {
            const bx = startX + i * trackW + trackW / 2, col = oppColors[i], isPressed = this.oppLaneFlashes[i] > 0.2;
            ctx.save(); ctx.translate(bx, hitZoneY);
            if (isPressed) ctx.scale(1.18, 1.18);
            ctx.strokeStyle = col.main + (isPressed ? '66' : '33'); ctx.lineWidth = isPressed ? 7 : 5;
            ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = col.main; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = isPressed ? col.main : 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // 5. Opponent Notes & Sustains
        if (notes && notes.length > 0) {
            notes.forEach(note => {
                const drawY = hitZoneY - (note.time - curTime) * noteSpeed;
                if (drawY < -50 || drawY > ch + 50) return;
                const nx = startX + note.track * trackW + trackW / 2, col = oppColors[note.track] || oppColors[0];
                if (note.duration && note.duration >= 0.2) {
                    const tailY = hitZoneY - ((note.time + note.duration) - curTime) * noteSpeed;
                    const rTop = Math.min(tailY, drawY), rBot = Math.max(tailY, drawY);
                    if (rBot - rTop > 2) {
                        ctx.save(); ctx.fillStyle = col.main; ctx.globalAlpha = 0.75;
                        ctx.fillRect(nx - 7, rTop, 14, rBot - rTop);
                        ctx.strokeStyle = col.core; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(nx, rTop + 4); ctx.lineTo(nx, rBot - 4); ctx.stroke();
                        ctx.restore();
                    }
                }
                ctx.save(); ctx.translate(nx, drawY);
                ctx.strokeStyle = col.main + '66'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(0, -18); ctx.bezierCurveTo(20, -18, 18, 12, 0, 20); ctx.bezierCurveTo(-18, 12, -20, -18, 0, -18); ctx.stroke();
                ctx.fillStyle = col.main; ctx.fill();
                ctx.fillStyle = col.core; ctx.beginPath(); ctx.arc(0, -2, 6.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });
        }

        // 6. Opponent Hit Sparks
        ctx.save();
        for (let i = 0; i < this.oppParticles.length; i++) {
            const p = this.oppParticles[i];
            ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.life / 0.35);
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.restore();

        // 7. Opponent Floating Ratings
        this.oppFloatingRatings.forEach(r => {
            ctx.save(); ctx.globalAlpha = Math.max(0, r.alpha);
            ctx.font = `bold ${Math.round(18 * r.scale)}px 'Impact', sans-serif`;
            ctx.textAlign = 'center'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 4;
            ctx.strokeText(r.text, r.x, r.y); ctx.fillStyle = r.color; ctx.fillText(r.text, r.x, r.y);
            ctx.restore();
        });

        // 8. Opponent Highway HUD
        ctx.save();
        ctx.font = "bold 13px 'Segoe UI', sans-serif";
        ctx.fillStyle = this.oppMultiplier > 1 ? '#ff5577' : '#888888';
        ctx.textAlign = 'left';
        ctx.fillText(`🎮 ${this.opponent.name} • x${this.oppMultiplier}`, startX + 12, 22);
        if (this.oppStreak > 4) {
            ctx.font = "bold 12px 'Segoe UI', sans-serif";
            ctx.fillStyle = '#ff3344';
            ctx.fillText(`STREAK: ${this.oppStreak} 🔥`, startX + 12, 40);
        }
        ctx.restore();

        // 9. Center Neon Divider Line & VS Badge
        ctx.save();
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(startX, 0); ctx.lineTo(startX, ch); ctx.stroke();
        ctx.shadowBlur = 0;

        const badgeY = 22;
        ctx.fillStyle = '#080612'; ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(startX, badgeY, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = "900 11px 'Impact', sans-serif"; ctx.fillStyle = '#ffd700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('VS', startX, badgeY);
        ctx.restore();
    }

    draw(ctx, combat) {
        if (!this.opponent || !combat) return;
        const oppPos = this.getOpponentPosition(combat);
        const sheet = (combat.assets && combat.assets[this.opponent.sheetKey]) || combat.assets.heroSheet;
        const totalFrames = sheet ? (sheet.totalFrames || 12) : 12;
        const heroFrame = (combat.time / 100) % totalFrames;

        // Draw Opponent Shadow & Amp (behind opponent)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(oppPos.x, oppPos.y + 2, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Opponent Amp
        const ampX = oppPos.x + 18, ampY = oppPos.y - 26, ampW = 16, ampH = 26;
        ctx.fillStyle = '#1a0508'; ctx.fillRect(ampX, ampY, ampW, ampH);
        ctx.strokeStyle = '#ff3344'; ctx.lineWidth = 1.2; ctx.strokeRect(ampX, ampY, ampW, ampH);

        // Draw Opponent Sprite facing LEFT (flip = true)
        if (sheet && typeof sheet.drawFrame === 'function') {
            sheet.drawFrame(ctx, heroFrame, oppPos.x, oppPos.y - 12, 0.52, true, this.opponent.flashTime > 0);
        }

        // Opponent Nameplate
        ctx.save();
        ctx.font = "bold 9px 'Segoe UI', sans-serif";
        ctx.textAlign = 'center';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(this.opponent.name, oppPos.x - 4, oppPos.y - 42);
        ctx.fillStyle = '#ff5566';
        ctx.fillText(this.opponent.name, oppPos.x - 4, oppPos.y - 42);
        ctx.restore();

        // Draw Center Confrontation Line in Arena
        const cw = combat.canvas.width, ch = combat.canvas.height;
        const metrics = combat.getRoadMetrics ? combat.getRoadMetrics() : { laneY: ch * 0.78 };
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cw * 0.5, metrics.laneY - 70);
        ctx.lineTo(cw * 0.5, metrics.laneY + 25);
        ctx.stroke();
        ctx.restore();

        // Update In-Battle Opponent HUD
        this.updateBattleHUD();
    }

    updateBattleHUD() {
        if (!this.opponent) return;
        const hpBar = document.getElementById('pvp-opp-hp-bar');
        const scoreEl = document.getElementById('pvp-opp-score-val');
        const nameEl = document.getElementById('pvp-opp-hud-name');
        const avatarEl = document.getElementById('pvp-opp-hud-avatar');

        if (hpBar) {
            const pct = Math.max(0, Math.min(100, Math.round((this.opponent.hp / this.opponent.maxHp) * 100)));
            hpBar.style.width = `${pct}%`;
        }
        if (scoreEl) scoreEl.innerText = this.opponent.score.toLocaleString();
        if (nameEl) nameEl.innerText = this.opponent.name;
        if (avatarEl && this.opponent.guitarist) avatarEl.src = this.opponent.guitarist.avatar || 'assets/covers/default_cover.jpg';
    }

    endPvPBattle(reason = 'song_complete', combat = null, rhythm = null) {
        if (this.state === 'ended') return;
        this.state = 'ended';

        const playerScore = (combat && combat.score) || 0;
        const oppScore = (this.opponent && this.opponent.score) || 0;

        let isPlayerWinner = false;
        let outcomeKey = 'pvpWinScore';

        if (reason === 'player_ko') {
            isPlayerWinner = true;
            outcomeKey = 'pvpWinKo';
        } else if (reason === 'opponent_ko') {
            isPlayerWinner = false;
            outcomeKey = 'pvpLoseKo';
        } else {
            // Evaluated by score
            isPlayerWinner = playerScore >= oppScore;
            outcomeKey = isPlayerWinner ? 'pvpWinScore' : 'pvpLoseScore';
        }

        // Fair economy rewards:
        const goldReward = isPlayerWinner ? 45 : 15;
        const xpReward = isPlayerWinner ? 50 : 20;
        const trophyChange = isPlayerWinner ? 25 : -10;

        this.addTrophies(trophyChange);
        if (isPlayerWinner) {
            this.playerWins++;
            try { localStorage.setItem('gvs_pvp_wins', this.playerWins.toString()); } catch (e) {}
        } else {
            this.playerLosses++;
            try { localStorage.setItem('gvs_pvp_losses', this.playerLosses.toString()); } catch (e) {}
        }

        if (window.talentSystem) window.talentSystem.addGold(goldReward);
        const pActive = window.guitaristPool ? window.guitaristPool.getSelectedGuitarist() : null;
        if (pActive && window.guitaristPool) window.guitaristPool.addHeroXp(pActive.id, xpReward);

        this.showPvPResultsModal(isPlayerWinner, outcomeKey, goldReward, xpReward, trophyChange, combat, rhythm);
    }

    showPvPResultsModal(isWin, outcomeKey, gold, xp, trophyDelta, combat, rhythm) {
        const modal = document.getElementById('pvp-results-modal');
        if (!modal) return;

        const tr = (k, f) => (typeof i18n !== 'undefined' ? i18n.t(k, f) : f);
        const dialog = document.getElementById('pvp-results-dialog');
        const header = document.getElementById('pvp-res-header');
        const titleEl = document.getElementById('pvp-res-title');
        const subEl = document.getElementById('pvp-res-sub');

        if (dialog) dialog.className = `pvp-results-dialog ${isWin ? 'win' : 'defeat'}`;
        if (header) header.className = `pvp-res-header ${isWin ? 'win' : 'lose'}`;
        if (titleEl) titleEl.innerText = isWin ? tr('pvpWinTitle', '🏆 VITÓRIA NO DUELO PVP!') : tr('pvpDefeatTitle', '☠️ DERROTA NO DUELO PVP!');
        if (subEl) subEl.innerText = tr(outcomeKey, 'Fim do Duelo!');

        const pScore = (combat ? combat.score : 0).toLocaleString();
        const oScore = (this.opponent ? this.opponent.score : 0).toLocaleString();
        const pKills = (combat && combat.battleStats ? combat.battleStats.zombiesKilled : 0);
        const oKills = this.opponentZombiesKilled || 0;
        const rStats = (rhythm && rhythm.songStats) || {};
        const pAcc = `${Math.round(((rStats.hitNotes || 1) / Math.max(1, rStats.totalNotes || 1)) * 100)}%`;
        const oAcc = `${Math.round((this.opponent ? this.opponent.accuracy : 0.92) * 100)}%`;

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setVal('pvp-res-p-score', pScore); setVal('pvp-res-o-score', oScore);
        setVal('pvp-res-p-kills', `${pKills} 💀`); setVal('pvp-res-o-kills', `${oKills} 💀`);
        setVal('pvp-res-p-acc', pAcc); setVal('pvp-res-o-acc', oAcc);
        setVal('pvp-res-p-heals', `+${this.overhealsPlayer} 💚`); setVal('pvp-res-o-heals', `+${this.overhealsOpponent} 💚`);

        setVal('pvp-rew-gold', `+${gold} 🪙`);
        setVal('pvp-rew-xp', `+${xp} XP`);
        setVal('pvp-rew-trophies', `${trophyDelta >= 0 ? '+' : ''}${trophyDelta} 🏆`);

        if (window.soundEngine) {
            if (isWin && typeof window.soundEngine.playPowerChord === 'function') window.soundEngine.playPowerChord(0);
            else if (!isWin && typeof window.soundEngine.playMiss === 'function') window.soundEngine.playMiss();
        }

        modal.classList.add('open');
    }
}

window.PvPSystem = PvPSystem;
