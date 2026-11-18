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
                'btnPlay': 'CAMPANHA',
                'dockBattle': 'BATALHA',
                'dockCampaign': 'CAMPANHA',
                'dockShop': 'Loja',
                'dockTalents': 'Talentos',
                'dockPvp': 'PvP',
                'dockMissions': 'Missões',
                'dockStudio': 'Estúdio',
                'btnShop': 'LOJA DE GUITARRISTAS',
                'shopTitle': '🛒 LOJA DE GUITARRISTAS',
                'shopSub': 'CONTRATE AS MAIORES LENDAS DO ROCK PARA DETONAR A HORDA!',
                'shopEquipped': 'EQUIPADO',
                'shopEquip': 'EQUIPAR',
                'shopBuy': 'COMPRAR',
                'btnTalents': 'ÁRVORE DE TALENTOS',
                'btnMissions': 'MISSÕES & CAÇADA DE ZUMBIS',
                'btnStudio': 'ESTÚDIO DE MÚSICA & RITMO',
                'btnSettings': 'CONFIGURAÇÕES',
                'btnPvP': '⚔️ DUELO ONLINE PVP',
                'menuFooter': 'Guitar vs Zombies v1.9.7 (Build 61) • AAA Audio & Action Experience',

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
                'btnSpecialTitle': 'Ativar Especial 2x (Espaço / Toque)',
                'specialBtnTitle': 'ESPECIAL',
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
                'victoryBannerTitle': '👑 SHOW CONCLUÍDO! 🎸',
                'victoryBannerSub': '⚡ HORDA OBLITERADA • OVAÇÃO DA PLATÉIA! ⚡',
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
                'defeatBannerTitle': '⚡ AMPLIFICADOR DESTRUÍDO! ⚡',
                'defeatBannerSub': '☠️ SILÊNCIO NO PALCO • A HORDA AVANÇOU ☠️',
                'defeatSub': 'Sua energia esgotou e os zumbis interromperam o show!',
                'statDamageDealt': 'Dano Causado',
                'statGoldCollected': 'Ouro Coletado',
                'statScoreReached': 'Pontuação Alcançada',
                'btnRetry': '🔄 TENTAR NOVAMENTE',

                // PvP Duel & Matchmaking
                'pvpSelectSongTitle': '⚔️ DUELO PVP ONLINE',
                'pvpSelectSongSubtitle': 'Escolha a música para disputar o confronto:',
                'pvpStartSearch': 'BUSCAR PARTIDA ⚡',
                'pvpMatchmakingTitle': 'PROCURANDO ADVERSÁRIO...',
                'pvpConnecting': 'Conectando ao servidor SA-East (São Paulo)...',
                'pvpSearching': 'Buscando guitarristas no mesmo tier de troféus...',
                'pvpOpponentFound': '🎯 ADVERSÁRIO ENCONTRADO!',
                'pvpStartingIn': 'Duelo iniciando em: ',
                'pvpCancel': 'CANCELAR',
                'pvpConfrontLine': '⚡ LINHA DE CONFRONTO • TIROS LIVRES CURAM ZUMBIS DO OPONENTE ⚡',
                'pvpWinTitle': '🏆 VITÓRIA NO DUELO PVP!',
                'pvpDefeatTitle': '☠️ DERROTA NO DUELO PVP!',
                'pvpWinKo': 'O adversário foi derrubado pela horda de zumbis!',
                'pvpLoseKo': 'Sua defesa sucumbiu e os zumbis invadiram seu palco!',
                'pvpWinScore': 'Vitória por Domínio Rítmico e Maior Pontuação!',
                'pvpLoseScore': 'O adversário alcançou maior pontuação na música!',
                'pvpTrophies': 'Troféus',
                'pvpOverHeals': 'Curas Inimigas Geradas',

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
                'tabPvP': '⚔️ Duelo PvP',
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
                'mk7Sub': 'LENDÁRIO & IMBATÍVEL! 👑',

                'btnClose': 'Fechar', 'btnPvPRematch': '⚔️ NOVO DUELO', 'btnPvPClose': 'VOLTAR AO MENU',
                'pvpPreBattleTitle': '⚔️ DUELO PVP ONLINE', 'pvpPreBattleSubtitle': 'Personalize seu Guitarrista, Habilidades e Música para o confronto:',
                'pvpHeroLabel': '🎸 SEU GUITARRISTA', 'pvpSkillsLabel': '⚡ HABILIDADES POR TRILHO', 'pvpSkillsHint': 'Toque para alterar', 'pvpSongLabel': '🎵 MÚSICA DO CONFRONTO',
                'statPvPActions': 'Ações PvP', 'pvpGoldTag': 'OURO', 'pvpHeroXpTag': 'XP HERÓI',
                'pvpLocating': 'Localizando adversário compatível...', 'pvpYou': 'Você', 'levelShort': 'Nv.', 'pvpChosenSongBadge': '🎵 Música: {song} ({bpm} BPM)',
                'countdownGetReady': '🎸 PREPARAÇÃO', 'countdownSubtitle': 'POSICIONE OS DEDOS!',
                'countdownStart5': 'PREPARE-SE!', 'countdownStart4': 'POSICIONE OS DEDOS!', 'countdownStart3': 'AFINE AS CORDAS!', 'countdownStart2': 'ATENÇÃO!', 'countdownStart1': 'QUASE LÁ!',
                'countdownResume5': 'RETOMANDO PARTIDA!', 'countdownResume3': 'OLHO NA PISTA!', 'countdownModeResume': '⏸️ RETOMAR', 'countdownModePrep': '🎸 PREPARAÇÃO', 'countdownGo': 'VAI COM TUDO!',
                'specialUsed': 'USADO ✖', 'specialReady': 'PRONTO! ⚡', 'specialEnded': '⚡ ESPECIAL ENCERRADO!',
                'bossSpawned': '⚠️ CHEFE TITÃ SURGIU! 👑', 'missLabel': 'ERROU! 💨', 'perfectStreakCrit': '🎯 5x PERFECT! PRÓXIMO CRÍTICO!', 'noMpBasic': '⚡ SEM MP! (BÁSICO)',
                'levelUpToast': '⭐ NÍVEL {level}! UP!', 'stageCompletedToast': '🏆 FASE {stage} CONCLUÍDA!', 'rockNeverDies': '⚡ ROCK NEVER DIES! ⚡', 'heroRevived': '⚡ REVIVIDO! ⚡',
                'barrierReady': '🛡️ BARREIRA PRONTA!', 'chainDeflected': '🛡️ CORRENTE DEFLETIU!', 'helmetBroken': '🛡️ CAPACETE QUEBRADO! STUN!', 'burningStatus': '🔥 QUEIMANDO!',
                'immuneStatus': '⚡ IMUNE!', 'blockedStatus': '🛡️ BLOQUEADO!', 'critReadyTag': ' • 💥 CRÍTICO PRONTO!',
                'insufficientGold': 'Ouro insuficiente!', 'errorInjectXp': 'Erro ao injetar XP!', 'abandonBattleConfirm': '⚠️ Tem certeza que deseja abandonar a batalha e voltar ao menu inicial? O progresso desta partida será perdido.',
                'gearCloseSettings': '✕ FECHAR CONFIGURAÇÕES', 'heroRecruitedToast': '🎸 {name} recrutado com sucesso!', 'heroUnlockCostPrompt': '🔒 Desbloqueie por 🪙 {cost}',
                'missionsStatKillsLabel': '💀 Kills Hordas:', 'bossNameFormat': '👑 [CHEFE] {name} TITÃ',
                'stageRuleAtLeastOneBasic': '⚠️ Regra do Palco: Você precisa manter pelo menos 1 slot equipado com Ataque Básico!',
                'skillBadgeBasic': '⚡ BÁSICO', 'skillBadgeDamage': '💥 DANO', 'skillBadgeCrit': '🔮 CRÍTICO', 'skillBadgeAoe': '💥 ÁREA', 'skillBadgeStun': '💫 STUN', 'skillBadgeBurn': '🔥 CHAMA', 'skillBadgeToxic': '☢️ TÓXICO', 'skillBadgeLightning': '⚡ RELÂMPAGO', 'skillBadgeBuff': '🚀 BUFF', 'skillBadgeHeal': '💚 CURA', 'skillBadgeShield': '🛡️ ESCUDO', 'skillBadgeLifesteal': '🩸 VAMPIRISMO', 'skillBadgeBleed': '🩸 SANGRAMENTO', 'skillBadgePierce': '🎸 PERFURAÇÃO', 'skillBadgeCataclysm': '👑 CATACLISMO', 'skillBadgeSpecial': '⚡ ESPECIAL', 'fretBasicBadge': 'BÁSICO', 'fretNoMpBadge': '⚡ SEM MP',
                'inspectorLevel': 'NÍVEL {level} / {max}', 'talentDmgBase': '+{amount} Dano Base', 'talentCritDmg': '+{amount}% Dano Crítico', 'talentChainLightning': 'Raios atingem até {amount} zumbis adjacentes', 'talentNoChain': 'Sem raios em cadeia', 'talentKnockback': '+{amount}% Força de Empurrão', 'talentMaxHp': '+{amount} Vida Máxima',
                'rarity_common': 'COMUM', 'rarity_rare': 'RARO', 'rarity_epic': 'ÉPICO', 'rarity_legendary': 'LENDÁRIO', 'rarity_mythic': 'MÍTICO', 'rarity_ancestral': 'ANCESTRAL', 'rarity_cosmic': 'CÓSMICO', 'rarity_divine': 'DIVINO',
                // Hero Titles, Instruments & Passives
                'hero_johnny_blaze_title': 'O Punk Rocker Clássico', 'hero_johnny_blaze_inst': 'Stratocaster "Hellfire"', 'hero_johnny_blaze_pass_name': 'Espírito do Rock', 'hero_johnny_blaze_pass_desc': '+1.0% de Dano e +0.4% de Dano Crítico por nível (chegando a +99% de dano e +89% de crítico no Nv. 100).',
                'hero_vulkan_ironhead_title': 'O Piromaníaco das Wastelands', 'hero_vulkan_ironhead_inst': 'Scrap-Metal V8 Flamejante', 'hero_vulkan_ironhead_pass_name': 'Pirotecnia Brutal', 'hero_vulkan_ironhead_pass_desc': '+1.0% de Dano, +0.3% de Mana Regen e chance de queimadura contínua que cresce a cada nível.',
                'hero_dr_radix_title': 'O Solista Bioquímico', 'hero_dr_radix_inst': 'Guitarratox "Uranium-235"', 'hero_dr_radix_pass_name': 'Radiação Acústica', 'hero_dr_radix_pass_desc': '+1.0% de Dano, +15% de Dano Crítico base e chance de envenenamento radioativo que corrói os zumbis.',
                'hero_cypher_volt_title': 'O Virtuoso Cibernético', 'hero_cypher_volt_inst': 'Laser-Caster Bionica Neon', 'hero_cypher_volt_pass_name': 'Overdrive Bionico', 'hero_cypher_volt_pass_desc': '+1.0% de Dano, velocidade de ataque acelerada e choque elétrico em cadeia.',
                'hero_kragthor_titan_title': 'O Titã do Heavy Metal', 'hero_kragthor_titan_inst': 'Flying-V "Magma Fury"', 'hero_kragthor_titan_pass_name': 'Fúria dos Titãs', 'hero_kragthor_titan_pass_desc': '+1.0% de Dano, grande repulsão sônica nos zumbis e ondas de choque terrestres brutais.',
                'hero_roxie_anarchy_title': 'A Valquíria do Punk Mítico', 'hero_roxie_anarchy_inst': 'Guitarra Custom "Riot Slash"', 'hero_roxie_anarchy_pass_name': 'Anarquia Absoluta', 'hero_roxie_anarchy_pass_desc': '+1.0% de Dano, chance de acerto crítico duplicada e bônus de dano de dispersão ao acertar notas perfeitas.',
                'hero_finn_punk_title': 'O Campeão Multiversal do Som', 'hero_finn_punk_inst': 'Espada-Guitarra Sonora de Ooo', 'hero_finn_punk_pass_name': 'Hora do Rock Multiversal', 'hero_finn_punk_pass_desc': '+1.22% de Dano, +0.75% de Dano Crítico e +0.3% de velocidade de projéteis sónicos por nível.',
                'hero_ignis_draco_title': 'O Dragão Devorador de Riffs', 'hero_ignis_draco_inst': 'Guitarra Dracônica "Inferno"', 'hero_ignis_draco_pass_name': 'Sopro Ígneo Acústico', 'hero_ignis_draco_pass_desc': '+1.26% de Dano, +0.82% de Dano Crítico e +0.35% de chance de queimadura contínua dracônica por nível.',
                'hero_fenrir_howler_title': 'A Fera da Lua Cheia do Metal', 'hero_fenrir_howler_inst': 'Axe-Star "Lobo da Noite"', 'hero_fenrir_howler_pass_name': 'Frenesi da Lua de Sangue', 'hero_fenrir_howler_pass_desc': '+1.30% de Dano, +0.90% de Dano Crítico e vampirismo de vida ao abater zumbis.',
                'hero_spiky_sponge_title': 'A Anarquia Amarela das Fossas', 'hero_spiky_sponge_inst': 'Flying-V a Jato "Fenda do Biquíni"', 'hero_spiky_sponge_pass_name': 'Propulsão Hipersônica', 'hero_spiky_sponge_pass_desc': '+1.35% de Dano, +0.95% de Dano Crítico e rajadas sónicas aquáticas de alto impacto.',
                'hero_saul_slash_title': 'O Deus Imortal da Cartola & Les Paul', 'hero_saul_slash_inst': 'Gibson Les Paul Goldtop Sagrada "1959"', 'hero_saul_slash_pass_name': 'Apetite Pela Destruição', 'hero_saul_slash_pass_desc': '+1.40% de Dano, +1.10% de Dano Crítico, +0.6% de regeneração de mana por nível e especial divino estendido.',
                // Zombie Names & Badges
                'zombie_punk_walker': 'Zumbi Punk Rocker', 'zombie_feral_leaper': 'Corredor Saltador', 'zombie_toxic_mutant': 'Mutante Radioativo', 'zombie_armored_soldier': 'Sargento Blindado',
                'zombie_fungal_spore': 'Infectado Esporo', 'zombie_bloater_pounder': 'Gordo Devorador', 'zombie_chained_gladiator': 'Gladiador do Asfalto', 'zombie_toxic_hazmat': 'Operário Hazmat',
                'zombie_clown_jester': 'Palhaço Sinistro', 'zombie_builder_demolisher': 'Operário Demolidor', 'zombie_mad_scientist': 'Cientista Louco', 'zombie_inferno_firefighter': 'Bombeiro Zumbi',
                'zombie_sheriff_walker': 'Xerife Sobrevivente', 'zombie_presidential_politician': 'Político Presidencial', 'zombie_dark_knight_undead': 'Cavaleiro das Trevas', 'zombie_god_of_war_spartan': 'Fantasma Espartano',
                'zombie_badge_normal': 'Normal / Punk', 'zombie_badge_agile': 'Ágil / Salto Aéreo', 'zombie_badge_tank': 'Tank / Devastador', 'zombie_badge_armored': 'Blindado / Carga',
                'zombie_badge_spore': 'Fungo / Regenerativo', 'zombie_badge_colossus': 'Colosso / Sísmico', 'zombie_badge_gladiator': 'Gladiador / Deflexão', 'zombie_badge_toxic': 'Químico / Poça Ácida',
                'zombie_badge_maniac': 'Maníaco / Garras', 'zombie_badge_demolition': 'Demolição / Pesado', 'zombie_badge_viral': 'Viral / Químico', 'zombie_badge_firefighter': 'Ignífugo / Blindado',
                'zombie_badge_sheriff': 'Xerife / Machadada', 'zombie_badge_politician': 'Político / Comício', 'zombie_badge_batman': 'Morcego / Capa', 'zombie_badge_spartan': 'Espartano / Fúria',
                'statSpeedUnit': 'Velocidade: {speed} px/s', 'statDmgUnit': 'Dano: {dmg}', 'specialChip': '🔥 Especial: {duration}s (teto {max}s)', 'specialActiveChip': '🔥 Especial: {duration}s'
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
                'btnPlay': 'CAMPAIGN',
                'dockBattle': 'BATTLE',
                'dockCampaign': 'CAMPAIGN',
                'dockShop': 'Shop',
                'dockTalents': 'Talents',
                'dockPvp': 'PvP',
                'dockMissions': 'Missions',
                'dockStudio': 'Studio',
                'btnShop': 'GUITARIST SHOP',
                'shopTitle': '🛒 GUITARIST SHOP',
                'shopSub': 'RECRUIT ROCK LEGENDS TO CRUSH THE ZOMBIE HORDE!',
                'shopEquipped': 'EQUIPPED',
                'shopEquip': 'EQUIP',
                'shopBuy': 'BUY',
                'btnTalents': 'TALENT TREE',
                'btnMissions': 'MISSIONS & BOUNTY HUNT',
                'btnStudio': 'MUSIC & RHYTHM STUDIO',
                'btnSettings': 'SETTINGS',
                'btnPvP': '⚔️ ONLINE PVP DUEL',
                'menuFooter': 'Guitar vs Zombies v1.9.7 (Build 61) • AAA Audio & Action Experience',

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
                'btnSpecialTitle': 'Activate 2x Special (Space / Tap)',
                'specialBtnTitle': 'SPECIAL',
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
                'victoryBannerTitle': '👑 SHOW CONCLUDED! 🎸',
                'victoryBannerSub': '⚡ HORDE OBLITERATED • STANDING OVATION! ⚡',
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
                'defeatBannerTitle': '⚡ AMPLIFIER DESTROYED! ⚡',
                'defeatBannerSub': '☠️ SILENCE ON STAGE • THE HORDE OVERRAN ☠️',
                'defeatSub': 'Your energy ran out and the zombies stopped the show!',
                'statDamageDealt': 'Damage Dealt',
                'statGoldCollected': 'Gold Collected',
                'statScoreReached': 'Score Reached',
                'btnRetry': '🔄 TRY AGAIN',

                // PvP Duel & Matchmaking
                'pvpSelectSongTitle': '⚔️ ONLINE PVP DUEL',
                'pvpSelectSongSubtitle': 'Choose the song for the duel:',
                'pvpStartSearch': 'SEARCH MATCH ⚡',
                'pvpMatchmakingTitle': 'SEARCHING FOR OPPONENT...',
                'pvpConnecting': 'Connecting to SA-East server (São Paulo)...',
                'pvpSearching': 'Finding guitarists in the same trophy elo...',
                'pvpOpponentFound': '🎯 OPPONENT FOUND!',
                'pvpStartingIn': 'Duel starting in: ',
                'pvpCancel': 'CANCEL',
                'pvpConfrontLine': '⚡ CONFRONTATION LINE • CLEAR-LANE SHOTS HEAL OPPONENT ZOMBIES ⚡',
                'pvpWinTitle': '🏆 PVP DUEL VICTORY!',
                'pvpDefeatTitle': '☠️ PVP DUEL DEFEAT!',
                'pvpWinKo': 'Opponent was overrun by the zombie horde!',
                'pvpLoseKo': 'Your defenses fell and zombies invaded your stage!',
                'pvpWinScore': 'Victory by Rhythmic Domination & Highest Score!',
                'pvpLoseScore': 'Opponent achieved higher score on the track!',
                'pvpTrophies': 'Trophies',
                'pvpOverHeals': 'Enemy Zombie Heals Created',

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
                'tabPvP': '⚔️ PvP Duels',
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
                'mk7Sub': 'LEGENDARY & UNBEATABLE! 👑',

                'btnClose': 'Close', 'btnPvPRematch': '⚔️ REMATCH', 'btnPvPClose': 'BACK TO MENU',
                'pvpPreBattleTitle': '⚔️ ONLINE PVP DUEL', 'pvpPreBattleSubtitle': 'Customize your Guitarist, Skills, and Song for the clash:',
                'pvpHeroLabel': '🎸 YOUR GUITARIST', 'pvpSkillsLabel': '⚡ LANE SKILLS', 'pvpSkillsHint': 'Tap to change', 'pvpSongLabel': '🎵 MATCH SONG',
                'statPvPActions': 'PvP Actions', 'pvpGoldTag': 'GOLD', 'pvpHeroXpTag': 'HERO XP',
                'pvpLocating': 'Locating compatible opponent...', 'pvpYou': 'You', 'levelShort': 'Lv.', 'pvpChosenSongBadge': '🎵 Song: {song} ({bpm} BPM)',
                'countdownGetReady': '🎸 GET READY', 'countdownSubtitle': 'PLACE YOUR FINGERS!',
                'countdownStart5': 'GET READY!', 'countdownStart4': 'PLACE YOUR FINGERS!', 'countdownStart3': 'TUNE THE STRINGS!', 'countdownStart2': 'WATCH OUT!', 'countdownStart1': 'ALMOST THERE!',
                'countdownResume5': 'RESUMING MATCH!', 'countdownResume3': 'EYES ON THE HIGHWAY!', 'countdownModeResume': '⏸️ RESUME', 'countdownModePrep': '🎸 GET READY', 'countdownGo': 'LET\'S ROCK!',
                'specialUsed': 'USED ✖', 'specialReady': 'READY! ⚡', 'specialEnded': '⚡ SPECIAL ENDED!',
                'bossSpawned': '⚠️ TITAN BOSS SPAWNED! 👑', 'missLabel': 'MISS! 💨', 'perfectStreakCrit': '🎯 5x PERFECT! NEXT HIT CRIT!', 'noMpBasic': '⚡ NO MP! (BASIC)',
                'levelUpToast': '⭐ LEVEL {level}! UP!', 'stageCompletedToast': '🏆 STAGE {stage} COMPLETED!', 'rockNeverDies': '⚡ ROCK NEVER DIES! ⚡', 'heroRevived': '⚡ REVIVED! ⚡',
                'barrierReady': '🛡️ BARRIER READY!', 'chainDeflected': '🛡️ CHAIN DEFLECTED!', 'helmetBroken': '🛡️ HELMET BROKEN! STUN!', 'burningStatus': '🔥 BURNING!',
                'immuneStatus': '⚡ IMMUNE!', 'blockedStatus': '🛡️ BLOCKED!', 'critReadyTag': ' • 💥 CRIT READY!',
                'insufficientGold': 'Not enough gold!', 'errorInjectXp': 'Error injecting XP!', 'abandonBattleConfirm': '⚠️ Are you sure you want to abandon the battle and return to the main menu? Progress will be lost.',
                'gearCloseSettings': '✕ CLOSE SETTINGS', 'heroRecruitedToast': '🎸 {name} recruited successfully!', 'heroUnlockCostPrompt': '🔒 Unlock for 🪙 {cost}',
                'missionsStatKillsLabel': '💀 Horde Kills:', 'bossNameFormat': '👑 [BOSS] {name} TITAN',
                'stageRuleAtLeastOneBasic': '⚠️ Stage Rule: You must keep at least 1 slot equipped with Basic Strike!',
                'skillBadgeBasic': '⚡ BASIC', 'skillBadgeDamage': '💥 DAMAGE', 'skillBadgeCrit': '🔮 CRIT', 'skillBadgeAoe': '💥 AOE', 'skillBadgeStun': '💫 STUN', 'skillBadgeBurn': '🔥 BURN', 'skillBadgeToxic': '☢️ TOXIC', 'skillBadgeLightning': '⚡ LIGHTNING', 'skillBadgeBuff': '🚀 BUFF', 'skillBadgeHeal': '💚 HEAL', 'skillBadgeShield': '🛡️ SHIELD', 'skillBadgeLifesteal': '🩸 LIFESTEAL', 'skillBadgeBleed': '🩸 BLEED', 'skillBadgePierce': '🎸 PIERCE', 'skillBadgeCataclysm': '👑 CATACLYSM', 'skillBadgeSpecial': '⚡ SPECIAL', 'fretBasicBadge': 'BASIC', 'fretNoMpBadge': '⚡ NO MP',
                'inspectorLevel': 'LEVEL {level} / {max}', 'talentDmgBase': '+{amount} Base Damage', 'talentCritDmg': '+{amount}% Crit Damage', 'talentChainLightning': 'Lightning arcs hit up to {amount} adjacent zombies', 'talentNoChain': 'No chain lightning', 'talentKnockback': '+{amount}% Knockback Force', 'talentMaxHp': '+{amount} Max HP',
                'rarity_common': 'COMMON', 'rarity_rare': 'RARE', 'rarity_epic': 'EPIC', 'rarity_legendary': 'LEGENDARY', 'rarity_mythic': 'MYTHIC', 'rarity_ancestral': 'ANCESTRAL', 'rarity_cosmic': 'COSMIC', 'rarity_divine': 'DIVINE',
                // Hero Titles, Instruments & Passives
                'hero_johnny_blaze_title': 'The Classic Punk Rocker', 'hero_johnny_blaze_inst': 'Stratocaster "Hellfire"', 'hero_johnny_blaze_pass_name': 'Rock Spirit', 'hero_johnny_blaze_pass_desc': '+1.0% Damage and +0.4% Critical Damage per level (up to +99% damage and +89% crit at Lv. 100).',
                'hero_vulkan_ironhead_title': 'Wasteland Pyromaniac', 'hero_vulkan_ironhead_inst': 'Flaming V8 Scrap-Metal', 'hero_vulkan_ironhead_pass_name': 'Brutal Pyrotechnics', 'hero_vulkan_ironhead_pass_desc': '+1.0% Damage, +0.3% Mana Regen and continuous burn chance scaling per level.',
                'hero_dr_radix_title': 'Biochemical Soloist', 'hero_dr_radix_inst': 'Guitarratox "Uranium-235"', 'hero_dr_radix_pass_name': 'Acoustic Radiation', 'hero_dr_radix_pass_desc': '+1.0% Damage, +15% base Crit Damage and radioactive poison chance eroding zombies.',
                'hero_cypher_volt_title': 'Cybernetic Virtuoso', 'hero_cypher_volt_inst': 'Neon Bionic Laser-Caster', 'hero_cypher_volt_pass_name': 'Bionic Overdrive', 'hero_cypher_volt_pass_desc': '+1.0% Damage, accelerated attack speed and chain lightning shock.',
                'hero_kragthor_titan_title': 'Heavy Metal Titan', 'hero_kragthor_titan_inst': 'Flying-V "Magma Fury"', 'hero_kragthor_titan_pass_name': 'Fury of the Titans', 'hero_kragthor_titan_pass_desc': '+1.0% Damage, high sonic knockback on zombies and brutal ground shockwaves.',
                'hero_roxie_anarchy_title': 'Mythic Punk Valkyrie', 'hero_roxie_anarchy_inst': 'Custom "Riot Slash" Guitar', 'hero_roxie_anarchy_pass_name': 'Absolute Anarchy', 'hero_roxie_anarchy_pass_desc': '+1.0% Damage, doubled critical strike chance and spread damage bonus on perfect notes.',
                'hero_finn_punk_title': 'Multiversal Sound Champion', 'hero_finn_punk_inst': 'Sonic Sword-Guitar of Ooo', 'hero_finn_punk_pass_name': 'Multiverse Rock Time', 'hero_finn_punk_pass_desc': '+1.22% Damage, +0.75% Crit Damage and +0.3% sonic projectile speed per level.',
                'hero_ignis_draco_title': 'Riff-Devouring Dragon', 'hero_ignis_draco_inst': 'Draconic Guitar "Inferno"', 'hero_ignis_draco_pass_name': 'Acoustic Fiery Breath', 'hero_ignis_draco_pass_desc': '+1.26% Damage, +0.82% Crit Damage and +0.35% draconic burn chance per level.',
                'hero_fenrir_howler_title': 'Full Moon Metal Beast', 'hero_fenrir_howler_inst': 'Axe-Star "Night Wolf"', 'hero_fenrir_howler_pass_name': 'Blood Moon Frenzy', 'hero_fenrir_howler_pass_desc': '+1.30% Damage, +0.90% Crit Damage and life drain upon defeating zombies.',
                'hero_spiky_sponge_title': 'Yellow Anarchy of the Depths', 'hero_spiky_sponge_inst': 'Jet Flying-V "Bikini Bottom"', 'hero_spiky_sponge_pass_name': 'Hypersonic Propulsion', 'hero_spiky_sponge_pass_desc': '+1.35% Damage, +0.95% Crit Damage and high-impact aquatic sonic bursts.',
                'hero_saul_slash_title': 'Immortal God of Top Hat & Les Paul', 'hero_saul_slash_inst': 'Sacred Gibson Les Paul Goldtop "1959"', 'hero_saul_slash_pass_name': 'Appetite For Destruction', 'hero_saul_slash_pass_desc': '+1.40% Damage, +1.10% Crit Damage, +0.6% mana regen per level and extended divine special.',
                // Zombie Names & Badges
                'zombie_punk_walker': 'Punk Rocker Zombie', 'zombie_feral_leaper': 'Feral Leaper', 'zombie_toxic_mutant': 'Radioactive Mutant', 'zombie_armored_soldier': 'Armored Sergeant',
                'zombie_fungal_spore': 'Spore Infected', 'zombie_bloater_pounder': 'Bloated Devourer', 'zombie_chained_gladiator': 'Asphalt Gladiator', 'zombie_toxic_hazmat': 'Hazmat Worker',
                'zombie_clown_jester': 'Sinister Clown', 'zombie_builder_demolisher': 'Demolisher Builder', 'zombie_mad_scientist': 'Mad Scientist', 'zombie_inferno_firefighter': 'Firefighter Zombie',
                'zombie_sheriff_walker': 'Survivor Sheriff', 'zombie_presidential_politician': 'Presidential Politician', 'zombie_dark_knight_undead': 'Dark Knight Undead', 'zombie_god_of_war_spartan': 'Spartan Ghost',
                'zombie_badge_normal': 'Normal / Punk', 'zombie_badge_agile': 'Agile / Air Leap', 'zombie_badge_tank': 'Tank / Devastator', 'zombie_badge_armored': 'Armored / Charge',
                'zombie_badge_spore': 'Fungal / Regenerative', 'zombie_badge_colossus': 'Colossus / Seismic', 'zombie_badge_gladiator': 'Gladiator / Deflection', 'zombie_badge_toxic': 'Chemical / Acid Pool',
                'zombie_badge_maniac': 'Maniac / Claws', 'zombie_badge_demolition': 'Demolition / Heavy', 'zombie_badge_viral': 'Viral / Chemical', 'zombie_badge_firefighter': 'Fireproof / Armored',
                'zombie_badge_sheriff': 'Sheriff / Axe Chop', 'zombie_badge_politician': 'Politician / Rally', 'zombie_badge_batman': 'Bat / Cape Dodge', 'zombie_badge_spartan': 'Spartan / Rage',
                'statSpeedUnit': 'Speed: {speed} px/s', 'statDmgUnit': 'Damage: {dmg}', 'specialChip': '🔥 Special: {duration}s (cap {max}s)', 'specialActiveChip': '🔥 Special: {duration}s'
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
        if (typeof fallback === 'object' && fallback !== null) { params = fallback; fallback = ''; }
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
