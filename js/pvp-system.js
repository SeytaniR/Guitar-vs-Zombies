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

        // Opponent simulated accuracy roll (~92% overall accuracy)
        const roll = Math.random();
        let oppRating = 'perfect';
        if (roll > this.opponent.accuracy) {
            oppRating = 'miss';
        } else if (roll > 0.70) {
            oppRating = 'great';
        } else if (roll > 0.88) {
            oppRating = 'good';
        }

        const oppPos = this.getOpponentPosition(combat);

        if (oppRating === 'miss') {
            this.opponent.streak = 0;
            combat.addFloatingText('MISS (OPP)', oppPos.x - 15, oppPos.y - 45, '#ff4444', false);
            return;
        }

        this.opponent.streak++;
        this.opponent.maxStreak = Math.max(this.opponent.maxStreak, this.opponent.streak);
        this.opponent.notesHit++;

        const mult = oppRating === 'perfect' ? 1.5 : (oppRating === 'great' ? 1.2 : 1.0);
        const dmg = Math.round(this.opponent.damage * mult);
        const scoreGained = Math.round(150 * mult * Math.min(4, 1 + this.opponent.streak * 0.05));
        this.opponent.score += scoreGained;

        // Fire opponent projectile from right side towards center/left
        const startX = oppPos.x - 22;
        const startY = oppPos.y - 18;
        combat.entities.projectiles.push({
            x: startX,
            y: startY,
            vx: -440,
            vy: (Math.random() - 0.5) * 15,
            owner: 'opponent',
            target: null,
            isCrit: oppRating === 'perfect',
            damage: dmg,
            frame: 3 + Math.floor(Math.random() * 4),
            trailTimer: 0,
            active: true,
            projColor: '#ff3344'
        });

        combat.fx.shockwaves.push({ x: startX, y: startY, radius: 4, maxRadius: 22, color: '#ff3344', lineWidth: 2, alpha: 1.0 });
    }

    handleCollision(p, z, combat) {
        if (!combat || !p || !z || !p.active || !z.active) return false;
        const pOwner = p.owner || 'player';

        // 1. Player Projectile Collision Logic
        if (pOwner === 'player') {
            // Count active player-side zombies
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
                    combat.onZombieKilled(z, 120, 'OPP KILL! ⚡', '#ff3344');
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

        // Player Defeat Check
        if (combat.heroHp <= 0) {
            this.endPvPBattle('opponent_ko', combat, window.game ? window.game.rhythm : null);
        }
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

        // Draw Center Confrontation Line
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
