// Internationalization (i18n) Engine - Portuguese (pt-BR) & English (EN)
// Zero God Object: Under 1,000 lines. Supports DOM [data-i18n], placeholders, titles and dynamic t().

class I18n {
    constructor() {
        this.currentLang = this.detectInitialLanguage();
        this.listeners = [];
        this.translations = {
            'pt': {
                // Main Menu
                'menuGoldTitle': 'Ouro Coletado',
                'menuScoreTitle': 'Maior Pontuação',
                'menuKillsTitle': 'Zumbis Destruídos',
                'menuSoundToggleTitle': 'Alternar Som',
                'menuSub': 'HEAVY METAL APOCALYPSE',
                'menuStageTag': '🎸 TURNÊ MUNDIAL DOS CONDENADOS',
                'menuStageDesc': 'Arme sua guitarra distorcida, destrua hordas de zumbis em tempo real e domine o palco com seus riffs mortais!',
                'btnPlay': 'JOGAR / INICIAR BATALHA',
                'btnTalents': 'ÁRVORE DE TALENTOS',
                'btnMissions': 'MISSÕES & CAÇADA DE ZUMBIS',
                'btnStudio': 'ESTÚDIO DE MÚSICA & RITMO',
                'btnSettings': 'CONFIGURAÇÕES',
                'menuFooter': 'Guitar vs Zombies v1.8.1 (Build 53) • AAA Audio & Action Experience',

                // Pre-Battle Preparation
                'mapBack': '⬅️ Voltar',
                'mapTitle': 'PREPARAÇÃO DA BATALHA',
                'mapSub': 'CONFIGURE SEU SHOW E CONHEÇA A HORDA',
                'sectionStage': '🗺️ Fase Atual',
                'btnPrevStage': 'Fase Anterior',
                'btnNextStage': 'Próxima Fase',
                'sectionArena': '🏟️ Arena do Show',
                'badgeRandom': '🎲 Sorteada',
                'sectionHero': '🎸 Guitarrista',
                'btnPrevHero': 'Guitarrista Anterior',
                'btnNextHero': 'Próximo Guitarrista',
                'heroPassiveTag': 'PASSIVA:',
                'btnHeroLevelUp': '⬆️ SUBIR NÍVEL',
                'sectionHorde': '🧟 Horda Inimiga',
                'hordeCountTag': '5 Sorteados',
                'sectionSkills': '⚡ Habilidades por Trilho',
                'skillsHint': 'Toque para Equipar',
                'sectionSong': '🎵 Trilha Sonora',
                'btnPrevSong': 'Música Anterior',
                'btnNextSong': 'Próxima Música',
                'songActivePill': 'EM REPRODUÇÃO',
                'btnStartBattle': '🔥 INICIAR BATALHA AGORA!',

                // Battle HUD & Highway
                'combatZone': 'Zona de Combate',
                'rhythmZone': 'Solo de Guitarra',
                'scoreLabel': 'PONTOS',
                'killsLabel': 'ZUMBIS',
                'rockLabel': 'ROCK',
                'rockManaLabel': '⚡ ROCK MANA',
                'btnSoundTitle': 'Alternar Áudio',
                'btnStatsTitle': 'Estatísticas da Batalha (SS)',
                'btnGearTitle': 'Configurações & Pausa',
                'scorePillTitle': 'Pontuação Atual',
                'comboPillTitle': 'Combo Atual',
                'comboText': 'COMBO',
                'highwayDivider': '🎸 SOLO RHYTHM HIGHWAY - TOQUE NO RITMO! 🎸',
                'btnExitSong': '✕ SAIR',
                'btnExitSongTitle': 'Encerrar Música',

                // Talent Modal
                'talentTitle': '🎸 ÁRVORE DE TALENTOS',
                'talentUpgrades': 'Upgrades:',
                'tabOffense': '🔥 OFENSIVO',
                'tabDefense': '🛡️ DEFENSIVO',
                'tabRhythm': '⚡ RITMO & OURO',
                'effectCurrent': 'Efeito Atual:',
                'effectNext': 'Próximo Nível:',
                'btnUpgrade': 'MELHORAR',
                'noBonus': 'Nenhum bônus',
                'maxLevelReached': 'Nível Máximo Atingido!',
                'requiresPrereq': '🔒 Requer: {name} Nv. {level}',
                'needGold': 'FALTAM {amount} 🪙',
                'locked': 'BLOQUEADO',
                'maxLevel': 'NÍVEL MÁXIMO',

                // Song Studio Modal
                'studioTitle': '🎵 ESTÚDIO DE MÚSICAS & RITMO',
                'studioSubtitle': 'Crie, edite e compartilhe suas próprias faixas no jogo!',
                'tabMySongs': '📂 MINHAS MÚSICAS',
                'tabNewSong': '➕ NOVA MÚSICA',
                'tabImportExport': '📥 IMPORTAR / EXPORTAR',
                'labelAlbumCover': 'Capa do Álbum (Imagem):',
                'btnChooseImage': '📷 Escolher Imagem',
                'labelAudioFile': 'Arquivo de Áudio (.mp3, .wav, .ogg, .m4a):',
                'btnChooseAudio': '📁 Escolher Arquivo de Áudio',
                'noAudioSelected': 'Nenhum áudio selecionado',
                'labelSongTitle': 'Título da Música:',
                'phSongTitle': 'Ex: Through the Fire and Flames',
                'labelSongArtist': 'Autoria / Artista:',
                'phSongArtist': 'Ex: DragonForce',
                'labelBpm': 'BPM (Tempo da Música):',
                'tapTempoTitle': 'Toque no ritmo para calcular BPM',
                'btnTapTempo': '🖐️ TAP TEMPO',
                'labelSongDesc': 'Descrição da Música:',
                'phSongDesc': 'Descreva sua faixa, estilo ou desafio rítmico...',
                'labelInitialPattern': 'Ritmo Inicial:',
                'optEmptyPattern': 'Iniciar com Ritmo Vazio (Mapear no Editor)',
                'optAutogenPattern': 'Gerar Ritmo Base Automaticamente por BPM',
                'btnCreateSong': '🚀 CRIAR MÚSICA & ABRIR EDITOR',
                'importTitle': '📥 Importar Música (.gvsong / .json / Áudio)',
                'importDesc': 'Importe pacotes de músicas (.gvsong / .json) ou arquivos de áudio (.mp3, .wav, .ogg, .m4a) diretamente para o jogo! Você também pode simplesmente arrastar e soltar o arquivo aqui.',
                'btnChoosePackage': '📂 Escolher Pacote .gvsong ou Áudio',
                'exportTitle': '💾 Como Exportar e Compartilhar?',
                'exportStep1': '1. Vá até a aba <b>MINHAS MÚSICAS</b>.',
                'exportStep2': '2. Clique em <b>EXPORTAR</b> no card da sua música.',
                'exportStep3': '3. Um arquivo <code>.gvsong</code> será baixado no seu celular ou PC pronto para enviar aos amigos!',
                'studioPlay': '▶️ JOGAR',
                'studioEdit': '✏️ EDITAR',
                'studioExport': '💾 EXPORTAR',
                'studioSync': '⚡ P/ SERVIDOR',
                'studioLoading': 'Carregando músicas...',
                'studioEmpty': 'Nenhuma música encontrada. Crie uma nova música ou importe uma!',

                // Chart Editor Modal
                'editorSnap': 'Grade:',
                'editorSpeed': 'Velocidade:',
                'editorNormal': '🎵 Normal',
                'editorHold': '〰️ Arrastado',
                'editorHoldDuration': 'Duração:',
                'editorUndo': '↩️ Desfazer',
                'editorAutoBpm': '⚡ Auto-BPM',
                'editorClear': '🗑️ Limpar',
                'editorSave': '💾 SALVAR',
                'editorSavePlay': '🚀 SALVAR & JOGAR',
                'editorScrubberLabel': '⏱️ Navegador de Tempo:',
                'editorInstructions': 'Toque nas pistas para adicionar/remover notas na linha do tempo, ou use <b>REC</b> para gravar no ritmo enquanto a música toca!',
                'laneGreen': 'VERDE [A]',
                'laneRed': 'VERMELHO [S]',
                'laneYellow': 'AMARELO [D]',
                'laneBlue': 'AZUL [F]',

                // Results / Victory Modal
                'victoryTitle': '🏆 VITÓRIA! SHOW CONCLUÍDO!',
                'statAccuracy': 'Precisão',
                'statNotesHit': 'Notas Acertadas',
                'statZombiesKilled': 'Zumbis Derrotados',
                'statMaxStreak': 'Maior Streak',
                'statGoldGained': 'Ouro Ganho',
                'statScoreGained': 'Pontos da Partida',
                'btnPlayAgain': '🔄 JOGAR NOVAMENTE',
                'btnMainMenu': '🏠 MENU PRINCIPAL',

                // Defeat Modal
                'defeatTitle': '☠️ DERROTA! O PALCO FOI INVADIDO!',
                'defeatSub': 'Sua energia esgotou e os zumbis interromperam o show!',
                'statDamageDealt': 'Dano Causado',
                'statGoldCollected': 'Ouro Coletado',
                'statScoreReached': 'Pontuação Alcançada',
                'btnRetry': '🔄 TENTAR NOVAMENTE',

                // Battle Stats Modal (SS)
                'ssTitle': '📊 ESTATÍSTICAS DE BATALHA',
                'ssSub': 'Performance em tempo real do confronto',
                'ssHeroHp': 'HP DO GUITARRISTA',
                'ssMatchTime': 'TEMPO EM COMBATE',
                'ssTotalDamage': 'Dano Total Causado',
                'ssZombiesKilled': 'Zumbis Derrotados',
                'ssMaxStreak': 'Maior Streak',
                'ssCurrentMultiplier': 'Multiplicador Atual',
                'ssCurrentScore': 'Pontuação Atual',
                'ssMatchCoins': 'Ouro nesta Partida',
                'ssAccuracyJudging': 'Precisão & Julgamento de Notas',
                'btnResumeBattle': 'VOLTAR AO JOGO',

                // Gear / Settings Modal
                'gearTitle': '⚙️ OPÇÕES & PAUSA',
                'gearLangLabel': 'Idioma / Language:',
                'gearSoundLabel': 'Som do Jogo:',
                'gearToggleSound': 'Alternar Som',
                'gearDangerWarning': '⚠️ Voltar ao Menu Inicial encerrará o combate atual e os dados desta partida serão descartados!',
                'gearAbandon': '🚨 Voltar ao Menu Inicial (perde progresso atual)',
                'gearResume': '▶️ Continuar Partida',

                // Skill Picker Modal
                'skillEquipTitle': '⚡ Equipar no Trilho {lane}',
                'btnRestoreDefault': '↺ Padrão',
                'skillRuleNotice': '<strong>Regra do Palco:</strong> É obrigatório manter pelo menos 1 trilho com o Ataque Básico equipado!',
                'skillPickPrompt': 'Escolha a habilidade que será ativada ao acertar notas nesta pista:',
                'skillEquippedTag': '✅ Equipada neste trilho',
                'skillBlockedTag': '🔒 Bloqueado: Mantenha ≥ 1 Ataque Básico',

                // Meta Missions Modal
                'missionsTitle': '🎯 MISSÕES & METAS DO PALCO',
                'missionsSub': 'Elimine zumbis e domine guitarristas para desbloquear marcos procedurais (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k)!',
                'tabZombieHordes': '🧟 Hordas Zumbi',
                'tabGuitarists': '🎸 Guitarristas',
                'tabPerformance': '⚡ Ritmo & Batalha',
                'statKillsHordes': '💀 Kills Hordas:',
                'statKillsHeroes': '🎸 Kills Heróis:',
                'statRhythmActions': '⚡ Ações de Ritmo:',
                'statWalletGold': '💰 Carteira:',
                'statInventoryXp': '✨ XP Guardado:',
                'statMissionsGold': '🪙 Ouro Coletado:',
                'statMasters': '👑 Mestres (100k):',
                'btnClaimAll': '✨ REIVINDICAR TODAS',
                'btnClaimCount': '✨ REIVINDICAR ({count})',
                'filterAll': 'Todos',
                'filterReady': 'Prontos ✨',
                'filterActive': 'Em Progresso 🔒',
                'filterCompleted': 'Mestres 👑',
                'phSearchMissions': '🔍 Buscar zumbi por nome ou arquétipo...',
                'noMissionsFound': 'Nenhuma missão encontrada para o filtro selecionado.',
                'milestoneReward': 'RECOMPENSA DO MARCO:',
                'heroMastery': 'MESTRIA DO GUITARRISTA:',
                'perfMilestone': 'MARCO DE PERFORMANCE:',
                'masterHunter': 'MESTRE CAÇADOR',
                'rockLegend': 'LENDA DO ROCK',
                'supremeMastery': 'MESTRIA SUPREMA',
                'completedUnits': '{target} {unit} Concluídas!',
                'claim': 'REIVINDICAR',
                'target': 'Meta:',
                'goldUnit': 'Ouro',

                // Hero & Stage dynamic texts
                'menuXpTitle': 'Inventário de XP',
                'xpInventoryLabel': 'XP no Inventário:',
                'btnInjectXp': '✨ INJETAR XP (+{amount} XP)',
                'btnInjectLevelUp': '✨ INJETAR XP (+1 NÍVEL)',
                'noXpInInventory': '✨ SEM XP NO INVENTÁRIO',
                'heroMaxLevel': '⭐ NÍVEL MÁXIMO (100)',
                'heroLevelUp': '⬆️ SUBIR NÍVEL (🪙 {cost})',
                'heroUnlock': '🪙 DESBLOQUEAR GUITARRISTA (🪙 {cost})',
                'heroLocked': '🔒 GUITARRISTA BLOQUEADO',
                'heroUnlockCost': 'Custo: 🪙 {cost} Ouro',
                'heroLevelBadge': '⭐ NÍVEL {lvl} / 100',
                'heroMaxXp': 'MÁXIMO',
                'bossBadge': '👑 CHEFE (2x OURO/XP)',
                'targetsUnit': 'Alvos',
                'stagePrefix': 'Fase {stage}',
                                'bossShowdown': 'Fase {stage}: 👑 CONFRONTO DE CHEFE: {name}!',

                // Arenas & Maps
                'map_void_name': 'The Void Club', 'map_void_sub': 'Clube Subterrâneo & Escombros Urbanos', 'map_void_desc': 'Fachada do lendário pub underground "The Void", barricadas de concreto e ônibus blindado abandonado.', 'map_void_badge': 'URBANO',
                'map_ruins_name': 'Palco dos Escombros', 'map_ruins_sub': 'Arena Central do Apocalipse', 'map_ruins_desc': 'Palco de metal destruído no coração das ruínas metropolitanas, cercado por amplificadores e fumaça.', 'map_ruins_badge': 'CONCERTO',
                'map_wasteland_name': 'Wasteland do Metal', 'map_wasteland_sub': 'Deserto Anárquico & Posto Tóxico', 'map_wasteland_desc': 'Autoestrada árida estilo Mad Max, posto de gasolina fortificado, cactos e sucatas sob tempestade de areia.', 'map_wasteland_badge': 'DESERTO',
                'map_thermopylae_name': 'Desfiladeiro de Esparta', 'map_thermopylae_sub': 'O Desfiladeiro dos 300 & Paredão de Riffs', 'map_thermopylae_desc': 'O lendário desfiladeiro grego fortificado contra hordas mortas com escudos espartanos, estacas e torres de amplificadores.', 'map_thermopylae_badge': 'ESPARTA',
                'map_coliseum_name': 'Coliseu Imperial', 'map_coliseum_sub': 'A Arena Romana dos Gladiadores', 'map_coliseum_desc': 'As ruínas milenares de Roma transformadas no palco supremo onde gladiadores enfrentavam feras e zumbis ao som de solos impiedosos.', 'map_coliseum_badge': 'COLISEU',
                'map_bikini_bottom_name': 'Fenda Submarina', 'map_bikini_bottom_sub': 'As Profundezas Tóxicas do Siri Cascudo', 'map_bikini_bottom_desc': 'A icônica fenda submarina submersa em lixo tóxico, onde o abacaxi enferrujado e o Siri Cascudo viraram redutos do punk aquático.', 'map_bikini_bottom_badge': 'FENDA',
                'map_valhalla_name': 'Fiorde de Valhalla', 'map_valhalla_sub': 'O Fiorde Congelado de Odin', 'map_valhalla_desc': 'Picos congelados, drakkars ancestrais e muralhas de madeira nórdica onde os guerreiros vikings ecoam riffs ancestrais no gelo.', 'map_valhalla_badge': 'VIKING',
                'map_stadium_name': 'Estádio Devastado', 'map_stadium_sub': 'O Caldeirão Devastado do Rock', 'map_stadium_desc': 'Um antigo estádio esportivo monumental com traves retorcidas e arquibancadas em ruínas onde multidões agora se chocam em mosh pits letais.', 'map_stadium_badge': 'ESTÁDIO',

                // MultiKill subtitles
                'mk1Sub': 'PRIMEIRA VÍTIMA! 🔥',
                'mk2Sub': 'RITMO ACELERANDO! ⚡',
                'mk3Sub': 'TRIPLA CHACINA! 💥',
                'mk4Sub': 'MASSACRE NO PALCO! 🎸',
                'mk5Sub': 'ADRENALINA MÁXIMA! ⚡',
                'mk6Sub': 'DEUS DO ROCK AND ROLL! 🤘',
                'mk7Sub': 'LENDÁRIO & IMBATÍVEL! 👑'
            },
            'en': {
                // Main Menu
                'menuGoldTitle': 'Collected Gold',
                'menuScoreTitle': 'High Score',
                'menuKillsTitle': 'Destroyed Zombies',
                'menuSoundToggleTitle': 'Toggle Sound',
                'menuSub': 'HEAVY METAL APOCALYPSE',
                'menuStageTag': '🎸 WORLD TOUR OF THE DAMNED',
                'menuStageDesc': 'Arm your distorted guitar, destroy zombie hordes in real-time and dominate the stage with deadly riffs!',
                'btnPlay': 'PLAY / START BATTLE',
                'btnTalents': 'TALENT TREE',
                'btnMissions': 'MISSIONS & BOUNTY HUNT',
                'btnStudio': 'MUSIC & RHYTHM STUDIO',
                'btnSettings': 'SETTINGS',
                'menuFooter': 'Guitar vs Zombies v1.8.1 (Build 53) • AAA Audio & Action Experience',

                // Pre-Battle Preparation
                'mapBack': '⬅️ Back',
                'mapTitle': 'BATTLE PREPARATION',
                'mapSub': 'CONFIGURE YOUR SHOW & SCOUT THE HORDE',
                'sectionStage': '🗺️ Current Stage',
                'btnPrevStage': 'Previous Stage',
                'btnNextStage': 'Next Stage',
                'sectionArena': '🏟️ Show Arena',
                'badgeRandom': '🎲 Randomized',
                'sectionHero': '🎸 Guitarist',
                'btnPrevHero': 'Previous Guitarist',
                'btnNextHero': 'Next Guitarist',
                'heroPassiveTag': 'PASSIVE:',
                'btnHeroLevelUp': '⬆️ LEVEL UP',
                'sectionHorde': '🧟 Enemy Horde',
                'hordeCountTag': '5 Selected',
                'sectionSkills': '⚡ Lane Skills',
                'skillsHint': 'Tap to Equip',
                'sectionSong': '🎵 Soundtrack',
                'btnPrevSong': 'Previous Song',
                'btnNextSong': 'Next Song',
                'songActivePill': 'NOW PLAYING',
                'btnStartBattle': '🔥 START BATTLE NOW!',

                // Battle HUD & Highway
                'combatZone': 'Combat Zone',
                'rhythmZone': 'Guitar Solo',
                'scoreLabel': 'SCORE',
                'killsLabel': 'KILLS',
                'rockLabel': 'ROCK',
                'rockManaLabel': '⚡ ROCK MANA',
                'btnSoundTitle': 'Toggle Audio',
                'btnStatsTitle': 'Battle Statistics (SS)',
                'btnGearTitle': 'Settings & Pause',
                'scorePillTitle': 'Current Score',
                'comboPillTitle': 'Current Combo',
                'comboText': 'COMBO',
                'highwayDivider': '🎸 SOLO RHYTHM HIGHWAY - HIT TO THE BEAT! 🎸',
                'btnExitSong': '✕ EXIT',
                'btnExitSongTitle': 'End Song',

                // Talent Modal
                'talentTitle': '🎸 TALENT TREE',
                'talentUpgrades': 'Upgrades:',
                'tabOffense': '🔥 OFFENSE',
                'tabDefense': '🛡️ DEFENSE',
                'tabRhythm': '⚡ RHYTHM & GOLD',
                'effectCurrent': 'Current Effect:',
                'effectNext': 'Next Level:',
                'btnUpgrade': 'UPGRADE',
                'noBonus': 'No bonus',
                'maxLevelReached': 'Max Level Reached!',
                'requiresPrereq': '🔒 Requires: {name} Lv. {level}',
                'needGold': 'NEED {amount} 🪙',
                'locked': 'LOCKED',
                'maxLevel': 'MAX LEVEL',

                // Song Studio Modal
                'studioTitle': '🎵 MUSIC & RHYTHM STUDIO',
                'studioSubtitle': 'Create, edit and share your own songs in the game!',
                'tabMySongs': '📂 MY SONGS',
                'tabNewSong': '➕ NEW SONG',
                'tabImportExport': '📥 IMPORT / EXPORT',
                'labelAlbumCover': 'Album Cover (Image):',
                'btnChooseImage': '📷 Choose Image',
                'labelAudioFile': 'Audio File (.mp3, .wav, .ogg, .m4a):',
                'btnChooseAudio': '📁 Choose Audio File',
                'noAudioSelected': 'No audio selected',
                'labelSongTitle': 'Song Title:',
                'phSongTitle': 'Ex: Through the Fire and Flames',
                'labelSongArtist': 'Artist / Author:',
                'phSongArtist': 'Ex: DragonForce',
                'labelBpm': 'BPM (Song Tempo):',
                'tapTempoTitle': 'Tap to the beat to calculate BPM',
                'btnTapTempo': '🖐️ TAP TEMPO',
                'labelSongDesc': 'Song Description:',
                'phSongDesc': 'Describe your track, style or rhythm challenge...',
                'labelInitialPattern': 'Initial Pattern:',
                'optEmptyPattern': 'Start with Empty Chart (Map in Editor)',
                'optAutogenPattern': 'Auto-generate Base Rhythm by BPM',
                'btnCreateSong': '🚀 CREATE SONG & OPEN EDITOR',
                'importTitle': '📥 Import Song (.gvsong / .json / Audio)',
                'importDesc': 'Import song packages (.gvsong / .json) or audio files directly into the game! You can also drag and drop files here.',
                'btnChoosePackage': '📂 Choose .gvsong Package or Audio',
                'exportTitle': '💾 How to Export & Share?',
                'exportStep1': '1. Go to <b>MY SONGS</b> tab.',
                'exportStep2': '2. Click <b>EXPORT</b> on your song card.',
                'exportStep3': '3. A <code>.gvsong</code> file will download ready to send to friends!',
                'studioPlay': '▶️ PLAY',
                'studioEdit': '✏️ EDIT',
                'studioExport': '💾 EXPORT',
                'studioSync': '⚡ TO SERVER',
                'studioLoading': 'Loading songs...',
                'studioEmpty': 'No songs found. Create a new song or import one!',

                // Chart Editor Modal
                'editorSnap': 'Snap:',
                'editorSpeed': 'Speed:',
                'editorNormal': '🎵 Normal',
                'editorHold': '〰️ Sustain',
                'editorHoldDuration': 'Duration:',
                'editorUndo': '↩️ Undo',
                'editorAutoBpm': '⚡ Auto-BPM',
                'editorClear': '🗑️ Clear',
                'editorSave': '💾 SAVE',
                'editorSavePlay': '🚀 SAVE & PLAY',
                'editorScrubberLabel': '⏱️ Timeline Scrubber:',
                'editorInstructions': 'Tap lanes to add/remove notes on timeline, or use <b>REC</b> to record notes as the music plays!',
                'laneGreen': 'GREEN [A]',
                'laneRed': 'RED [S]',
                'laneYellow': 'YELLOW [D]',
                'laneBlue': 'BLUE [F]',

                // Results / Victory Modal
                'victoryTitle': '🏆 VICTORY! SHOW COMPLETED!',
                'statAccuracy': 'Accuracy',
                'statNotesHit': 'Notes Hit',
                'statZombiesKilled': 'Zombies Defeated',
                'statMaxStreak': 'Highest Streak',
                'statGoldGained': 'Gold Earned',
                'statScoreGained': 'Match Score',
                'btnPlayAgain': '🔄 PLAY AGAIN',
                'btnMainMenu': '🏠 MAIN MENU',

                // Defeat Modal
                'defeatTitle': '☠️ DEFEAT! THE STAGE WAS OVERRUN!',
                'defeatSub': 'Your energy ran out and the zombies stopped the show!',
                'statDamageDealt': 'Damage Dealt',
                'statGoldCollected': 'Gold Collected',
                'statScoreReached': 'Score Reached',
                'btnRetry': '🔄 TRY AGAIN',

                // Battle Stats Modal (SS)
                'ssTitle': '📊 BATTLE STATISTICS',
                'ssSub': 'Real-time match performance',
                'ssHeroHp': 'GUITARIST HP',
                'ssMatchTime': 'COMBAT TIME',
                'ssTotalDamage': 'Total Damage Dealt',
                'ssZombiesKilled': 'Zombies Defeated',
                'ssMaxStreak': 'Highest Streak',
                'ssCurrentMultiplier': 'Current Multiplier',
                'ssCurrentScore': 'Current Score',
                'ssMatchCoins': 'Gold this Match',
                'ssAccuracyJudging': 'Accuracy & Note Judgment',
                'btnResumeBattle': 'RESUME GAME',

                // Gear / Settings Modal
                'gearTitle': '⚙️ OPTIONS & PAUSE',
                'gearLangLabel': 'Language / Idioma:',
                'gearSoundLabel': 'Game Audio:',
                'gearToggleSound': 'Toggle Sound',
                'gearDangerWarning': '⚠️ Returning to Main Menu will end the current battle and match data will be lost!',
                'gearAbandon': '🚨 Return to Main Menu (discard battle)',
                'gearResume': '▶️ Resume Battle',

                // Skill Picker Modal
                'skillEquipTitle': '⚡ Equip in Lane {lane}',
                'btnRestoreDefault': '↺ Default',
                'skillRuleNotice': '<strong>Stage Rule:</strong> You must keep at least 1 lane equipped with Basic Attack!',
                'skillPickPrompt': 'Choose the skill activated by hitting notes in this lane:',
                'skillEquippedTag': '✅ Equipped in this lane',
                'skillBlockedTag': '🔒 Blocked: Keep ≥ 1 Basic Attack',

                // Meta Missions Modal
                'missionsTitle': '🎯 MISSIONS & STAGE GOALS',
                'missionsSub': 'Slay zombies and master guitarists to unlock procedural milestones (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k)!',
                'tabZombieHordes': '🧟 Zombie Hordes',
                'tabGuitarists': '🎸 Guitarists',
                'tabPerformance': '⚡ Rhythm & Battle',
                'statKillsHordes': '💀 Horde Kills:',
                'statKillsHeroes': '🎸 Hero Kills:',
                'statRhythmActions': '⚡ Rhythm Actions:',
                'statWalletGold': '💰 Wallet:',
                'statInventoryXp': '✨ Stored XP:',
                'statMissionsGold': '🪙 Gold Collected:',
                'statMasters': '👑 Masters (100k):',
                'btnClaimAll': '✨ CLAIM ALL',
                'btnClaimCount': '✨ CLAIM ({count})',
                'filterAll': 'All',
                'filterReady': 'Ready ✨',
                'filterActive': 'In Progress 🔒',
                'filterCompleted': 'Masters 👑',
                'phSearchMissions': '🔍 Search by name or archetype...',
                'noMissionsFound': 'No missions found for the selected filter.',
                'milestoneReward': 'MILESTONE REWARD:',
                'heroMastery': 'GUITARIST MASTERY:',
                'perfMilestone': 'PERFORMANCE MILESTONE:',
                'masterHunter': 'MASTER HUNTER',
                'rockLegend': 'ROCK LEGEND',
                'supremeMastery': 'SUPREME MASTERY',
                'completedUnits': '{target} {unit} Completed!',
                'claim': 'CLAIM',
                'target': 'Target:',
                'goldUnit': 'Gold',

                // Hero & Stage dynamic texts
                'menuXpTitle': 'XP Inventory',
                'xpInventoryLabel': 'Inventory XP:',
                'btnInjectXp': '✨ INJECT XP (+{amount} XP)',
                'btnInjectLevelUp': '✨ INJECT XP (+1 LEVEL)',
                'noXpInInventory': '✨ NO XP IN INVENTORY',
                'heroMaxLevel': '⭐ MAX LEVEL (100)',
                'heroLevelUp': '⬆️ LEVEL UP (🪙 {cost})',
                'heroUnlock': '🪙 UNLOCK GUITARIST (🪙 {cost})',
                'heroLocked': '🔒 GUITARIST LOCKED',
                'heroUnlockCost': 'Cost: 🪙 {cost} Gold',
                'heroLevelBadge': '⭐ LEVEL {lvl} / 100',
                'heroMaxXp': 'MAX',
                'bossBadge': '👑 BOSS (2x GOLD/XP)',
                'targetsUnit': 'Targets',
                'stagePrefix': 'Stage {stage}',
                                'bossShowdown': 'Stage {stage}: 👑 BOSS SHOWDOWN: {name}!',

                // Arenas & Maps
                'map_void_name': 'The Void Club', 'map_void_sub': 'Underground Club & Urban Rubble', 'map_void_desc': 'Facade of the legendary underground pub "The Void", concrete barricades and abandoned armored bus.', 'map_void_badge': 'URBAN',
                'map_ruins_name': 'Rubble Stage', 'map_ruins_sub': 'Central Apocalypse Arena', 'map_ruins_desc': 'Destroyed metal stage in the heart of metropolitan ruins, surrounded by amplifiers and heavy smoke.', 'map_ruins_badge': 'CONCERT',
                'map_wasteland_name': 'Metal Wasteland', 'map_wasteland_sub': 'Anarchic Desert & Toxic Outpost', 'map_wasteland_desc': 'Mad Max style arid highway, fortified gas station, mutated cacti and scrap piles in sandstorms.', 'map_wasteland_badge': 'DESERT',
                'map_thermopylae_name': 'Spartan Pass', 'map_thermopylae_sub': 'The Pass of 300 & Wall of Riffs', 'map_thermopylae_desc': 'Legendary Greek canyon pass fortified against undead hordes with bronze shields, Spartan barricades and amp stacks.', 'map_thermopylae_badge': 'SPARTA',
                'map_coliseum_name': 'Imperial Coliseum', 'map_coliseum_sub': 'Roman Gladiators Arena', 'map_coliseum_desc': 'Ancient ruins of Rome turned into the ultimate stage where gladiators and undead face off to blistering solos.', 'map_coliseum_badge': 'COLISEUM',
                'map_bikini_bottom_name': 'Bikini Depths', 'map_bikini_bottom_sub': 'The Toxic Depths of Krusty Krab', 'map_bikini_bottom_desc': 'Iconic underwater trench submerged in toxic fallout, where the rusted pineapple and Krusty Krab harbor oceanic punk.', 'map_bikini_bottom_badge': 'DEPTHS',
                'map_valhalla_name': 'Valhalla Fjord', 'map_valhalla_sub': 'Frozen Fjord of Odin', 'map_valhalla_desc': 'Glacial peaks, ancestral drakkars, and snow-capped Norse palisades where Viking warriors echo thunderous metal riffs.', 'map_valhalla_badge': 'VIKING',
                'map_stadium_name': 'Ruined Stadium', 'map_stadium_sub': 'Devastated Rock Cauldron', 'map_stadium_desc': 'Monumental ruined soccer arena with twisted goalposts and crumbling terraces where mosh pits tear through the pitch.', 'map_stadium_badge': 'STADIUM',

                // MultiKill subtitles
                'mk1Sub': 'FIRST CASUALTY! 🔥',
                'mk2Sub': 'RHYTHM ACCELERATING! ⚡',
                'mk3Sub': 'TRIPLE CARNAGE! 💥',
                'mk4Sub': 'STAGE MASSACRE! 🎸',
                'mk5Sub': 'MAXIMUM ADRENALINE! ⚡',
                'mk6Sub': 'ROCK AND ROLL GOD! 🤘',
                'mk7Sub': 'LEGENDARY & UNBEATABLE! 👑'
            }
        };
    }

    detectInitialLanguage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('gvs_language');
                if (saved === 'pt' || saved === 'en') return saved;
            }
            if (typeof navigator !== 'undefined' && navigator.language) {
                const browserLang = navigator.language.toLowerCase();
                if (browserLang.startsWith('pt')) return 'pt';
                if (browserLang.startsWith('en')) return 'en';
            }
        } catch(e) {}
        return 'pt';
    }

    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('gvs_language', lang);
            }
        } catch(e) {}

        this.updateDOM();
        this.updateButtonsUI();
        this.notifyListeners();
    }

    onLanguageChange(fn) {
        if (typeof fn === 'function') {
            this.listeners.push(fn);
        }
    }

    notifyListeners() {
        this.listeners.forEach(fn => {
            try { fn(this.currentLang); } catch(e) { console.warn('i18n listener error:', e); }
        });

        // Trigger dynamic game view re-renders if available
        if (typeof window !== 'undefined' && window.game) {
            try {
                if (typeof window.game.updateStageUI === 'function') window.game.updateStageUI();
                if (typeof window.game.renderHeroRoster === 'function') window.game.renderHeroRoster();
                if (typeof window.game.renderArenaRoster === 'function') window.game.renderArenaRoster();
                if (typeof window.game.renderMapZombies === 'function') window.game.renderMapZombies();
                if (typeof window.game.renderLaneSkills === 'function') window.game.renderLaneSkills();
                if (typeof window.game.renderSongRoster === 'function') window.game.renderSongRoster();
            } catch(e) { console.warn('Game i18n re-render error:', e); }
        }
        if (typeof window !== 'undefined' && window.metaMissionSystem && typeof window.metaMissionSystem.render === 'function') {
            try { window.metaMissionSystem.render(); } catch(e) {}
        }
        if (typeof window !== 'undefined' && window.talentSystem && typeof window.talentSystem.updateUI === 'function') {
            try { window.talentSystem.updateUI(); } catch(e) {}
        }
    }

    updateDOM() {
        if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

        // Update html lang attribute
        const htmlEl = document.documentElement;
        if (htmlEl) htmlEl.setAttribute('lang', this.currentLang === 'pt' ? 'pt-BR' : 'en');

        // Translate text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.t(key);
            if (val && val !== key) {
                // Keep icon spans or child badges if needed, or replace innerText / innerHTML
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = val;
                } else {
                    el.innerText = val;
                }
            }
        });

        // Translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = this.t(key);
            if (val && val !== key) {
                el.setAttribute('placeholder', val);
            }
        });

        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = this.t(key);
            if (val && val !== key) {
                el.setAttribute('title', val);
            }
        });
    }

    updateButtonsUI() {
        if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

        // Top bar buttons (.lang-btn)
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const isPt = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'pt'");
            const isEn = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'en'");
            const shouldBeActive = (this.currentLang === 'pt' && isPt) || (this.currentLang === 'en' && isEn);
            if (shouldBeActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Pause gear modal buttons (.gear-lang-group .gear-btn-choice)
        document.querySelectorAll('.gear-lang-group .gear-btn-choice').forEach(btn => {
            const isPt = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'pt'");
            const isEn = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'en'");
            const shouldBeActive = (this.currentLang === 'pt' && isPt) || (this.currentLang === 'en' && isEn);
            if (shouldBeActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    t(key, fallback = '', params = {}) {
        const dict = this.translations[this.currentLang] || this.translations['pt'];
        let text = dict[key] || (this.translations['pt'] && this.translations['pt'][key]) || fallback || key;

        if (params && typeof params === 'object') {
            for (const p in params) {
                text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
            }
        }
        return text;
    }
}

const i18n = new I18n();
if (typeof window !== 'undefined') {
    window.i18n = i18n;
    if (typeof window.addEventListener === 'function') {
        window.addEventListener('DOMContentLoaded', () => {
            i18n.updateDOM();
            i18n.updateButtonsUI();
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}
