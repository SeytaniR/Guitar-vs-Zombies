// Internationalization (i18n) Engine - Multilingual: PT-BR, EN, ES, FR
// Zero God Object: Under 1,000 lines. Supports DOM [data-i18n], placeholders, titles and dynamic t().

class I18n {
    constructor() {
        this.currentLang = this.detectInitialLanguage();
        this.listeners = [];
        this.translations = {
            'pt': {
                "menuGoldTitle": "Ouro Coletado", "menuScoreTitle": "Maior Pontuação", "menuKillsTitle": "Zumbis Destruídos", "menuSoundToggleTitle": "Alternar Som",
                "menuSub": "HEAVY METAL APOCALYPSE", "menuStageTag": "🎸 TURNÊ MUNDIAL DOS CONDENADOS",
                "menuStageDesc": "Arme sua guitarra distorcida, destrua hordas de zumbis em tempo real e domine o palco com seus riffs mortais!", "btnPlay": "CAMPANHA",
                "dockBattle": "BATALHA", "dockCampaign": "CAMPANHA", "dockShop": "Loja", "dockTalents": "Talentos", "dockPvp": "PvP", "dockMissions": "Missões", "dockStudio": "Estúdio",
                "btnShop": "LOJA DE GUITARRISTAS", "shopTitle": "🛒 LOJA DE GUITARRISTAS", "shopSub": "CONTRATE AS MAIORES LENDAS DO ROCK PARA DETONAR A HORDA!", "shopEquipped": "EQUIPADO",
                "shopEquip": "EQUIPAR", "shopBuy": "COMPRAR", "btnTalents": "ÁRVORE DE TALENTOS", "btnMissions": "MISSÕES & CAÇADA DE ZUMBIS", "btnStudio": "ESTÚDIO DE MÚSICA & RITMO",
                "btnSettings": "CONFIGURAÇÕES", "btnPvP": "⚔️ DUELO ONLINE PVP", "menuFooter": "Guitar vs Zombies v1.9.7 (Build 61) • AAA Audio & Action Experience", "mapBack": "⬅️ Voltar",
                "mapTitle": "PREPARAÇÃO DA BATALHA", "mapSub": "CONFIGURE SEU SHOW E CONHEÇA A HORDA", "sectionStage": "🗺️ Fase Atual", "btnPrevStage": "Fase Anterior",
                "btnNextStage": "Próxima Fase", "sectionArena": "🏟️ Arena do Show", "badgeRandom": "🎲 Sorteada", "sectionHero": "🎸 Guitarrista", "btnPrevHero": "Guitarrista Anterior",
                "btnNextHero": "Próximo Guitarrista", "heroPassiveTag": "PASSIVA:", "btnHeroLevelUp": "⬆️ SUBIR NÍVEL", "sectionHorde": "🧟 Horda Inimiga", "hordeCountTag": "5 Sorteados",
                "sectionSkills": "⚡ Habilidades por Trilho", "skillsHint": "Toque para Equipar", "sectionSong": "🎵 Trilha Sonora", "btnPrevSong": "Música Anterior",
                "btnNextSong": "Próxima Música", "songActivePill": "EM REPRODUÇÃO", "btnStartBattle": "🔥 INICIAR BATALHA AGORA!", "combatZone": "Zona de Combate",
                "rhythmZone": "Solo de Guitarra", "scoreLabel": "PONTOS", "killsLabel": "ZUMBIS", "rockLabel": "ROCK", "rockManaLabel": "⚡ ROCK MANA", "btnSoundTitle": "Alternar Áudio",
                "btnStatsTitle": "Estatísticas da Batalha (SS)", "btnSpecialTitle": "Ativar Especial 2x (Espaço / Toque)", "specialBtnTitle": "ESPECIAL",
                "btnGearTitle": "Configurações & Pausa", "scorePillTitle": "Pontuação Atual", "comboPillTitle": "Combo Atual", "comboText": "COMBO",
                "highwayDivider": "🎸 SOLO RHYTHM HIGHWAY - TOQUE NO RITMO! 🎸", "btnExitSong": "✕ SAIR", "btnExitSongTitle": "Encerrar Música", "talentTitle": "🎸 ÁRVORE DE TALENTOS",
                "talentUpgrades": "Upgrades:", "tabOffense": "🔥 OFENSIVO", "tabDefense": "🛡️ DEFENSIVO", "tabRhythm": "⚡ RITMO & OURO", "effectCurrent": "Efeito Atual:",
                "effectNext": "Próximo Nível:", "btnUpgrade": "MELHORAR", "noBonus": "Nenhum bônus", "maxLevelReached": "Nível Máximo Atingido!",
                "requiresPrereq": "🔒 Requer: {name} Nv. {level}", "needGold": "FALTAM {amount} 🪙", "locked": "BLOQUEADO", "maxLevel": "NÍVEL MÁXIMO",
                "studioTitle": "🎵 ESTÚDIO DE MÚSICAS & RITMO", "studioSubtitle": "Crie, edite e compartilhe suas próprias faixas no jogo!", "tabMySongs": "📂 MINHAS MÚSICAS",
                "tabNewSong": "➕ NOVA MÚSICA", "tabImportExport": "📥 IMPORTAR / EXPORTAR", "labelAlbumCover": "Capa do Álbum (Imagem):", "btnChooseImage": "📷 Escolher Imagem",
                "labelAudioFile": "Arquivo de Áudio (.mp3, .wav, .ogg, .m4a):", "btnChooseAudio": "📁 Escolher Arquivo de Áudio", "noAudioSelected": "Nenhum áudio selecionado",
                "labelSongTitle": "Título da Música:", "phSongTitle": "Ex: Through the Fire and Flames", "labelSongArtist": "Autoria / Artista:", "phSongArtist": "Ex: DragonForce",
                "labelBpm": "BPM (Tempo da Música):", "tapTempoTitle": "Toque no ritmo para calcular BPM", "btnTapTempo": "🖐️ TAP TEMPO", "labelSongDesc": "Descrição da Música:",
                "phSongDesc": "Descreva sua faixa, estilo ou desafio rítmico...", "labelInitialPattern": "Ritmo Inicial:", "optEmptyPattern": "Iniciar com Ritmo Vazio (Mapear no Editor)",
                "optAutogenPattern": "Gerar Ritmo Base Automaticamente por BPM", "btnCreateSong": "🚀 CRIAR MÚSICA & ABRIR EDITOR",
                "importTitle": "📥 Importar Música (.gvsong / .json / Áudio)",
                "importDesc": "Importe pacotes de músicas (.gvsong / .json) ou arquivos de áudio (.mp3, .wav, .ogg, .m4a) diretamente para o jogo! Você também pode simplesmente arrastar e soltar o arquivo aqui.",
                "btnChoosePackage": "📂 Escolher Pacote .gvsong ou Áudio", "exportTitle": "💾 Como Exportar e Compartilhar?", "exportStep1": "1. Vá até a aba <b>MINHAS MÚSICAS</b>.",
                "exportStep2": "2. Clique em <b>EXPORTAR</b> no card da sua música.",
                "exportStep3": "3. Um arquivo <code>.gvsong</code> será baixado no seu celular ou PC pronto para enviar aos amigos!", "studioPlay": "▶️ JOGAR", "studioEdit": "✏️ EDITAR",
                "studioExport": "💾 EXPORTAR", "studioSync": "⚡ P/ SERVIDOR", "studioLoading": "Carregando músicas...",
                "studioEmpty": "Nenhuma música encontrada. Crie uma nova música ou importe uma!", "editorSnap": "Grade:", "editorSpeed": "Velocidade:", "editorNormal": "🎵 Normal",
                "editorHold": "〰️ Arrastado", "editorHoldDuration": "Duração:", "editorUndo": "↩️ Desfazer", "editorAutoBpm": "⚡ Auto-BPM", "editorClear": "🗑️ Limpar",
                "editorSave": "💾 SALVAR", "editorSavePlay": "🚀 SALVAR & JOGAR", "editorScrubberLabel": "⏱️ Navegador de Tempo:",
                "editorInstructions": "Toque nas pistas para adicionar/remover notas na linha do tempo, ou use <b>REC</b> para gravar no ritmo enquanto a música toca!",
                "laneGreen": "VERDE [A]", "laneRed": "VERMELHO [S]", "laneYellow": "AMARELO [D]", "laneBlue": "AZUL [F]", "victoryTitle": "🏆 VITÓRIA! SHOW CONCLUÍDO!",
                "victoryBannerTitle": "👑 SHOW CONCLUÍDO! 🎸", "victoryBannerSub": "⚡ HORDA OBLITERADA • OVAÇÃO DA PLATÉIA! ⚡", "statAccuracy": "Precisão",
                "statNotesHit": "Notas Acertadas", "statZombiesKilled": "Zumbis Derrotados", "statMaxStreak": "Maior Streak", "statGoldGained": "Ouro Ganho",
                "statScoreGained": "Pontos da Partida", "btnPlayAgain": "🔄 JOGAR NOVAMENTE", "btnMainMenu": "🏠 MENU PRINCIPAL", "defeatTitle": "☠️ DERROTA! O PALCO FOI INVADIDO!",
                "defeatBannerTitle": "⚡ AMPLIFICADOR DESTRUÍDO! ⚡", "defeatBannerSub": "☠️ SILÊNCIO NO PALCO • A HORDA AVANÇOU ☠️",
                "defeatSub": "Sua energia esgotou e os zumbis interromperam o show!", "statDamageDealt": "Dano Causado", "statGoldCollected": "Ouro Coletado",
                "statScoreReached": "Pontuação Alcançada", "btnRetry": "🔄 TENTAR NOVAMENTE", "pvpSelectSongTitle": "⚔️ DUELO PVP ONLINE",
                "pvpSelectSongSubtitle": "Escolha a música para disputar o confronto:", "pvpStartSearch": "BUSCAR PARTIDA ⚡", "pvpMatchmakingTitle": "PROCURANDO ADVERSÁRIO...",
                "pvpConnecting": "Conectando ao servidor SA-East (São Paulo)...", "pvpSearching": "Buscando guitarristas no mesmo tier de troféus...",
                "pvpOpponentFound": "🎯 ADVERSÁRIO ENCONTRADO!", "pvpStartingIn": "Duelo iniciando em: ", "pvpCancel": "CANCELAR",
                "pvpConfrontLine": "⚡ LINHA DE CONFRONTO • TIROS LIVRES CURAM ZUMBIS DO OPONENTE ⚡", "pvpWinTitle": "🏆 VITÓRIA NO DUELO PVP!", "pvpDefeatTitle": "☠️ DERROTA NO DUELO PVP!",
                "pvpWinKo": "O adversário foi derrubado pela horda de zumbis!", "pvpLoseKo": "Sua defesa sucumbiu e os zumbis invadiram seu palco!",
                "pvpWinScore": "Vitória por Domínio Rítmico e Maior Pontuação!", "pvpLoseScore": "O adversário alcançou maior pontuação na música!", "pvpTrophies": "Troféus",
                "pvpOverHeals": "Curas Inimigas Geradas", "ssTitle": "📊 ESTATÍSTICAS DE BATALHA", "ssSub": "Performance em tempo real do confronto", "ssHeroHp": "HP DO GUITARRISTA",
                "ssMatchTime": "TEMPO EM COMBATE", "ssTotalDamage": "Dano Total Causado", "ssZombiesKilled": "Zumbis Derrotados", "ssMaxStreak": "Maior Streak",
                "ssCurrentMultiplier": "Multiplicador Atual", "ssCurrentScore": "Pontuação Atual", "ssMatchCoins": "Ouro nesta Partida",
                "ssAccuracyJudging": "Precisão & Julgamento de Notas", "btnResumeBattle": "VOLTAR AO JOGO", "gearTitle": "⚙️ OPÇÕES & PAUSA", "gearLangLabel": "Idioma / Language:",
                "gearSoundLabel": "Som do Jogo:", "gearToggleSound": "Alternar Som",
                "gearDangerWarning": "⚠️ Voltar ao Menu Inicial encerrará o combate atual e os dados desta partida serão descartados!",
                "gearAbandon": "🚨 Voltar ao Menu Inicial (perde progresso atual)", "gearResume": "▶️ Continuar Partida", "skillEquipTitle": "⚡ Equipar no Trilho {lane}",
                "btnRestoreDefault": "↺ Padrão", "skillRuleNotice": "<strong>Regra do Palco:</strong> É obrigatório manter pelo menos 1 trilho com o Ataque Básico equipado!",
                "skillPickPrompt": "Escolha a habilidade que será ativada ao acertar notas nesta pista:", "skillEquippedTag": "✅ Equipada neste trilho",
                "skillBlockedTag": "🔒 Bloqueado: Mantenha ≥ 1 Ataque Básico", "missionsTitle": "🎯 MISSÕES & METAS DO PALCO",
                "missionsSub": "Elimine zumbis e domine guitarristas para desbloquear marcos procedurais (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k)!", "tabZombieHordes": "🧟 Hordas Zumbi",
                "tabGuitarists": "🎸 Guitarristas", "tabPerformance": "⚡ Ritmo & Batalha", "tabPvP": "⚔️ Duelo PvP", "statKillsHordes": "💀 Kills Hordas:",
                "statKillsHeroes": "🎸 Kills Heróis:", "statRhythmActions": "⚡ Ações de Ritmo:", "statWalletGold": "💰 Carteira:", "statInventoryXp": "✨ XP Guardado:",
                "statMissionsGold": "🪙 Ouro Coletado:", "statMasters": "👑 Mestres (100k):", "btnClaimAll": "✨ REIVINDICAR TODAS", "btnClaimCount": "✨ REIVINDICAR ({count})",
                "filterAll": "Todos", "filterReady": "Prontos ✨", "filterActive": "Em Progresso 🔒", "filterCompleted": "Mestres 👑",
                "phSearchMissions": "🔍 Buscar zumbi por nome ou arquétipo...", "noMissionsFound": "Nenhuma missão encontrada para o filtro selecionado.",
                "milestoneReward": "RECOMPENSA DO MARCO:", "heroMastery": "MESTRIA DO GUITARRISTA:", "perfMilestone": "MARCO DE PERFORMANCE:", "masterHunter": "MESTRE CAÇADOR",
                "rockLegend": "LENDA DO ROCK", "supremeMastery": "MESTRIA SUPREMA", "completedUnits": "{target} {unit} Concluídas!", "claim": "REIVINDICAR", "target": "Meta:",
                "goldUnit": "Ouro", "menuXpTitle": "Inventário de XP", "xpInventoryLabel": "XP no Inventário:", "btnInjectXp": "✨ INJETAR XP (+{amount} XP)",
                "btnInjectLevelUp": "✨ INJETAR XP (+1 NÍVEL)", "noXpInInventory": "✨ SEM XP NO INVENTÁRIO", "heroMaxLevel": "⭐ NÍVEL MÁXIMO (100)",
                "heroLevelUp": "⬆️ SUBIR NÍVEL (🪙 {cost})", "heroUnlock": "🪙 DESBLOQUEAR GUITARRISTA (🪙 {cost})", "heroLocked": "🔒 GUITARRISTA BLOQUEADO",
                "heroUnlockCost": "Custo: 🪙 {cost} Ouro", "heroLevelBadge": "⭐ NÍVEL {lvl} / 100", "heroMaxXp": "MÁXIMO", "bossBadge": "👑 CHEFE (2x OURO/XP)", "targetsUnit": "Alvos",
                "stagePrefix": "Fase {stage}", "bossShowdown": "Fase {stage}: 👑 CONFRONTO DE CHEFE: {name}!", "map_void_name": "The Void Club",
                "map_void_sub": "Clube Subterrâneo & Escombros Urbanos",
                "map_void_desc": "Fachada do lendário pub underground \"The Void\", barricadas de concreto e ônibus blindado abandonado.", "map_void_badge": "URBANO",
                "map_ruins_name": "Palco dos Escombros", "map_ruins_sub": "Arena Central do Apocalipse",
                "map_ruins_desc": "Palco de metal destruído no coração das ruínas metropolitanas, cercado por amplificadores e fumaça.", "map_ruins_badge": "CONCERTO",
                "map_wasteland_name": "Wasteland do Metal", "map_wasteland_sub": "Deserto Anárquico & Posto Tóxico",
                "map_wasteland_desc": "Autoestrada árida estilo Mad Max, posto de gasolina fortificado, cactos e sucatas sob tempestade de areia.", "map_wasteland_badge": "DESERTO",
                "map_thermopylae_name": "Desfiladeiro de Esparta", "map_thermopylae_sub": "O Desfiladeiro dos 300 & Paredão de Riffs",
                "map_thermopylae_desc": "O lendário desfiladeiro grego fortificado contra hordas mortas com escudos espartanos, estacas e torres de amplificadores.",
                "map_thermopylae_badge": "ESPARTA", "map_coliseum_name": "Coliseu Imperial", "map_coliseum_sub": "A Arena Romana dos Gladiadores",
                "map_coliseum_desc": "As ruínas milenares de Roma transformadas no palco supremo onde gladiadores enfrentavam feras e zumbis ao som de solos impiedosos.",
                "map_coliseum_badge": "COLISEU", "map_bikini_bottom_name": "Fenda Submarina", "map_bikini_bottom_sub": "As Profundezas Tóxicas do Siri Cascudo",
                "map_bikini_bottom_desc": "A icônica fenda submarina submersa em lixo tóxico, onde o abacaxi enferrujado e o Siri Cascudo viraram redutos do punk aquático.",
                "map_bikini_bottom_badge": "FENDA", "map_valhalla_name": "Fiorde de Valhalla", "map_valhalla_sub": "O Fiorde Congelado de Odin",
                "map_valhalla_desc": "Picos congelados, drakkars ancestrais e muralhas de madeira nórdica onde os guerreiros vikings ecoam riffs ancestrais no gelo.",
                "map_valhalla_badge": "VIKING", "map_stadium_name": "Estádio Devastado", "map_stadium_sub": "O Caldeirão Devastado do Rock",
                "map_stadium_desc": "Um antigo estádio esportivo monumental com traves retorcidas e arquibancadas em ruínas onde multidões agora se chocam em mosh pits letais.",
                "map_stadium_badge": "ESTÁDIO", "mk1Sub": "PRIMEIRA VÍTIMA! 🔥", "mk2Sub": "RITMO ACELERANDO! ⚡", "mk3Sub": "TRIPLA CHACINA! 💥", "mk4Sub": "MASSACRE NO PALCO! 🎸",
                "mk5Sub": "ADRENALINA MÁXIMA! ⚡", "mk6Sub": "DEUS DO ROCK AND ROLL! 🤘", "mk7Sub": "LENDÁRIO & IMBATÍVEL! 👑", "btnClose": "Fechar", "btnPvPRematch": "⚔️ NOVO DUELO",
                "btnPvPClose": "VOLTAR AO MENU", "pvpPreBattleTitle": "⚔️ DUELO PVP ONLINE", "pvpPreBattleSubtitle": "Personalize seu Guitarrista, Habilidades e Música para o confronto:",
                "pvpHeroLabel": "🎸 SEU GUITARRISTA", "pvpSkillsLabel": "⚡ HABILIDADES POR TRILHO", "pvpSkillsHint": "Toque para alterar", "pvpSongLabel": "🎵 MÚSICA DO CONFRONTO",
                "statPvPActions": "Ações PvP", "pvpGoldTag": "OURO", "pvpHeroXpTag": "XP HERÓI", "pvpLocating": "Localizando adversário compatível...", "pvpYou": "Você",
                "levelShort": "Nv.", "pvpChosenSongBadge": "🎵 Música: {song} ({bpm} BPM)", "countdownGetReady": "🎸 PREPARAÇÃO", "countdownSubtitle": "POSICIONE OS DEDOS!",
                "countdownStart5": "PREPARE-SE!", "countdownStart4": "POSICIONE OS DEDOS!", "countdownStart3": "AFINE AS CORDAS!", "countdownStart2": "ATENÇÃO!",
                "countdownStart1": "QUASE LÁ!", "countdownResume5": "RETOMANDO PARTIDA!", "countdownResume3": "OLHO NA PISTA!", "countdownModeResume": "⏸️ RETOMAR",
                "countdownModePrep": "🎸 PREPARAÇÃO", "countdownGo": "VAI COM TUDO!", "specialUsed": "USADO ✖", "specialReady": "PRONTO! ⚡", "specialEnded": "⚡ ESPECIAL ENCERRADO!",
                "bossSpawned": "⚠️ CHEFE TITÃ SURGIU! 👑", "missLabel": "ERROU! 💨", "perfectStreakCrit": "🎯 5x PERFECT! PRÓXIMO CRÍTICO!", "noMpBasic": "⚡ SEM MP! (BÁSICO)",
                "levelUpToast": "⭐ NÍVEL {level}! UP!", "stageCompletedToast": "🏆 FASE {stage} CONCLUÍDA!", "rockNeverDies": "⚡ ROCK NEVER DIES! ⚡", "heroRevived": "⚡ REVIVIDO! ⚡",
                "barrierReady": "🛡️ BARREIRA PRONTA!", "chainDeflected": "🛡️ CORRENTE DEFLETIU!", "helmetBroken": "🛡️ CAPACETE QUEBRADO! STUN!", "burningStatus": "🔥 QUEIMANDO!",
                "immuneStatus": "⚡ IMUNE!", "blockedStatus": "🛡️ BLOQUEADO!", "critReadyTag": " • 💥 CRÍTICO PRONTO!", "insufficientGold": "Ouro insuficiente!",
                "errorInjectXp": "Erro ao injetar XP!",
                "abandonBattleConfirm": "⚠️ Tem certeza que deseja abandonar a batalha e voltar ao menu inicial? O progresso desta partida será perdido.",
                "gearCloseSettings": "✕ FECHAR CONFIGURAÇÕES", "heroRecruitedToast": "🎸 {name} recrutado com sucesso!", "heroUnlockCostPrompt": "🔒 Desbloqueie por 🪙 {cost}",
                "missionsStatKillsLabel": "💀 Kills Hordas:", "bossNameFormat": "👑 [CHEFE] {name} TITÃ",
                "stageRuleAtLeastOneBasic": "⚠️ Regra do Palco: Você precisa manter pelo menos 1 slot equipado com Ataque Básico!", "skillBadgeBasic": "⚡ BÁSICO",
                "skillBadgeDamage": "💥 DANO", "skillBadgeCrit": "🔮 CRÍTICO", "skillBadgeAoe": "💥 ÁREA", "skillBadgeStun": "💫 STUN", "skillBadgeBurn": "🔥 CHAMA",
                "skillBadgeToxic": "☢️ TÓXICO", "skillBadgeLightning": "⚡ RELÂMPAGO", "skillBadgeBuff": "🚀 BUFF", "skillBadgeHeal": "💚 CURA", "skillBadgeShield": "🛡️ ESCUDO",
                "skillBadgeLifesteal": "🩸 VAMPIRISMO", "skillBadgeBleed": "🩸 SANGRAMENTO", "skillBadgePierce": "🎸 PERFURAÇÃO", "skillBadgeCataclysm": "👑 CATACLISMO",
                "skillBadgeSpecial": "⚡ ESPECIAL", "fretBasicBadge": "BÁSICO", "fretNoMpBadge": "⚡ SEM MP", "inspectorLevel": "NÍVEL {level} / {max}",
                "talentDmgBase": "+{amount} Dano Base", "talentCritDmg": "+{amount}% Dano Crítico", "talentChainLightning": "Raios atingem até {amount} zumbis adjacentes",
                "talentNoChain": "Sem raios em cadeia", "talentKnockback": "+{amount}% Força de Empurrão", "talentMaxHp": "+{amount} Vida Máxima", "rarity_common": "COMUM",
                "rarity_rare": "RARO", "rarity_epic": "ÉPICO", "rarity_legendary": "LENDÁRIO", "rarity_mythic": "MÍTICO", "rarity_ancestral": "ANCESTRAL", "rarity_cosmic": "CÓSMICO",
                "rarity_divine": "DIVINO", "hero_johnny_blaze_title": "O Punk Rocker Clássico", "hero_johnny_blaze_inst": "Stratocaster \"Hellfire\"",
                "hero_johnny_blaze_pass_name": "Espírito do Rock",
                "hero_johnny_blaze_pass_desc": "+1.0% de Dano e +0.4% de Dano Crítico por nível (chegando a +99% de dano e +89% de crítico no Nv. 100).",
                "hero_vulkan_ironhead_title": "O Piromaníaco das Wastelands", "hero_vulkan_ironhead_inst": "Scrap-Metal V8 Flamejante",
                "hero_vulkan_ironhead_pass_name": "Pirotecnia Brutal",
                "hero_vulkan_ironhead_pass_desc": "+1.0% de Dano, +0.3% de Mana Regen e chance de queimadura contínua que cresce a cada nível.",
                "hero_dr_radix_title": "O Solista Bioquímico", "hero_dr_radix_inst": "Guitarratox \"Uranium-235\"", "hero_dr_radix_pass_name": "Radiação Acústica",
                "hero_dr_radix_pass_desc": "+1.0% de Dano, +0.35% de Perfuração de Armadura e +0.12% de lentidão contínua da marcha zumbi por nível.",
                "hero_cypher_volt_title": "O Virtuoso Cibernético", "hero_cypher_volt_inst": "Laser-Caster Bionica Neon", "hero_cypher_volt_pass_name": "Overdrive Bionico",
                "hero_cypher_volt_pass_desc": "+1.1% de Dano e +0.6% de Dano Crítico por nível, com arcos elétricos devastadores em notas PERFECT.", "hero_kragthor_titan_title": "O Titã do Heavy Metal",
                "hero_kragthor_titan_inst": "Flying-V \"Magma Fury\"", "hero_kragthor_titan_pass_name": "Fúria dos Titãs",
                "hero_kragthor_titan_pass_desc": "+1.15% de Dano, +0.85% de Dano Crítico por nível e repelência brutal contra zumbis pesados.",
                "hero_roxie_anarchy_title": "A Valquíria do Punk Mítico", "hero_roxie_anarchy_inst": "Guitarra Custom \"Riot Slash\"", "hero_roxie_anarchy_pass_name": "Anarquia Absoluta",
                "hero_roxie_anarchy_pass_desc": "+1.20% de Dano, +0.70% de Dano Crítico, +0.25% de Ouro Extra e +0.50% de Mana Regen por nível!",
                "hero_finn_punk_title": "O Campeão Multiversal do Som", "hero_finn_punk_inst": "Espada-Guitarra Sonora de Ooo", "hero_finn_punk_pass_name": "Hora do Rock Multiversal",
                "hero_finn_punk_pass_desc": "+1.22% de Dano, +0.75% de Dano Crítico e +0.3% de velocidade de projéteis sónicos por nível.",
                "hero_ignis_draco_title": "O Dragão Devorador de Riffs", "hero_ignis_draco_inst": "Guitarra Dracônica \"Inferno\"", "hero_ignis_draco_pass_name": "Sopro Ígneo Acústico",
                "hero_ignis_draco_pass_desc": "+1.26% de Dano, +0.82% de Dano Crítico e +0.35% de chance de queimadura contínua dracônica por nível.",
                "hero_fenrir_howler_title": "A Fera da Lua Cheia do Metal", "hero_fenrir_howler_inst": "Axe-Star \"Lobo da Noite\"",
                "hero_fenrir_howler_pass_name": "Frenesi da Lua de Sangue", "hero_fenrir_howler_pass_desc": "+1.30% de Dano, +0.90% de Dano Crítico e drenagem contínua de essência vital dos zumbis por nível.",
                "hero_spiky_sponge_title": "A Anarquia Amarela das Fossas", "hero_spiky_sponge_inst": "Flying-V a Jato \"Fenda do Biquíni\"",
                "hero_spiky_sponge_pass_name": "Propulsão Hipersônica", "hero_spiky_sponge_pass_desc": "+1.35% de Dano, +0.95% de Dano Crítico, +0.35% de Ouro Extra e +0.60% de Mana Regen por nível!",
                "hero_saul_slash_title": "O Deus Imortal da Cartola & Les Paul", "hero_saul_slash_inst": "Gibson Les Paul Goldtop Sagrada \"1959\"",
                "hero_saul_slash_pass_name": "Apetite Pela Destruição",
                "hero_saul_slash_pass_desc": "+1.45% de Dano, +1.10% de Dano Crítico, +0.45% de Ouro Extra e +0.70% de Mana Regen por nível! O ápice do poder musical.",
                "zombie_punk_walker": "Zumbi Punk Rocker", "zombie_feral_leaper": "Corredor Saltador", "zombie_toxic_mutant": "Mutante Radioativo",
                "zombie_armored_soldier": "Sargento Blindado", "zombie_fungal_spore": "Infectado Esporo", "zombie_bloater_pounder": "Gordo Devorador",
                "zombie_chained_gladiator": "Gladiador do Asfalto", "zombie_toxic_hazmat": "Operário Hazmat", "zombie_clown_jester": "Palhaço Sinistro",
                "zombie_builder_demolisher": "Operário Demolidor", "zombie_mad_scientist": "Cientista Louco", "zombie_inferno_firefighter": "Bombeiro Zumbi",
                "zombie_sheriff_walker": "Xerife Sobrevivente", "zombie_presidential_politician": "Político Presidencial", "zombie_dark_knight_undead": "Cavaleiro das Trevas",
                "zombie_god_of_war_spartan": "Fantasma Espartano", "zombie_badge_normal": "Normal / Punk", "zombie_badge_agile": "Ágil / Salto Aéreo",
                "zombie_badge_tank": "Tank / Devastador", "zombie_badge_armored": "Blindado / Carga", "zombie_badge_spore": "Fungo / Regenerativo",
                "zombie_badge_colossus": "Colosso / Sísmico", "zombie_badge_gladiator": "Gladiador / Deflexão", "zombie_badge_toxic": "Químico / Poça Ácida",
                "zombie_badge_maniac": "Maníaco / Garras", "zombie_badge_demolition": "Demolição / Pesado", "zombie_badge_viral": "Viral / Químico",
                "zombie_badge_firefighter": "Ignífugo / Blindado", "zombie_badge_sheriff": "Xerife / Machadada", "zombie_badge_politician": "Político / Comício",
                "zombie_badge_batman": "Morcego / Capa", "zombie_badge_spartan": "Espartano / Fúria", "statSpeedUnit": "Velocidade: {speed} px/s", "statDmgUnit": "Dano: {dmg}",
                "specialChip": "🔥 Especial: {duration}s (teto {max}s)", "specialActiveChip": "🔥 Especial: {duration}s",
            },
            'en': {
                "menuGoldTitle": "Collected Gold", "menuScoreTitle": "High Score", "menuKillsTitle": "Destroyed Zombies", "menuSoundToggleTitle": "Toggle Sound",
                "menuSub": "HEAVY METAL APOCALYPSE", "menuStageTag": "🎸 WORLD TOUR OF THE DAMNED",
                "menuStageDesc": "Arm your distorted guitar, destroy zombie hordes in real-time and dominate the stage with deadly riffs!", "btnPlay": "CAMPAIGN", "dockBattle": "BATTLE",
                "dockCampaign": "CAMPAIGN", "dockShop": "Shop", "dockTalents": "Talents", "dockPvp": "PvP", "dockMissions": "Missions", "dockStudio": "Studio", "btnShop": "GUITARIST SHOP",
                "shopTitle": "🛒 GUITARIST SHOP", "shopSub": "RECRUIT ROCK LEGENDS TO CRUSH THE ZOMBIE HORDE!", "shopEquipped": "EQUIPPED", "shopEquip": "EQUIP", "shopBuy": "BUY",
                "btnTalents": "TALENT TREE", "btnMissions": "MISSIONS & BOUNTY HUNT", "btnStudio": "MUSIC & RHYTHM STUDIO", "btnSettings": "SETTINGS", "btnPvP": "⚔️ ONLINE PVP DUEL",
                "menuFooter": "Guitar vs Zombies v1.9.7 (Build 61) • AAA Audio & Action Experience", "mapBack": "⬅️ Back", "mapTitle": "BATTLE PREPARATION",
                "mapSub": "CONFIGURE YOUR SHOW & SCOUT THE HORDE", "sectionStage": "🗺️ Current Stage", "btnPrevStage": "Previous Stage", "btnNextStage": "Next Stage",
                "sectionArena": "🏟️ Show Arena", "badgeRandom": "🎲 Randomized", "sectionHero": "🎸 Guitarist", "btnPrevHero": "Previous Guitarist", "btnNextHero": "Next Guitarist",
                "heroPassiveTag": "PASSIVE:", "btnHeroLevelUp": "⬆️ LEVEL UP", "sectionHorde": "🧟 Enemy Horde", "hordeCountTag": "5 Selected", "sectionSkills": "⚡ Lane Skills",
                "skillsHint": "Tap to Equip", "sectionSong": "🎵 Soundtrack", "btnPrevSong": "Previous Song", "btnNextSong": "Next Song", "songActivePill": "NOW PLAYING",
                "btnStartBattle": "🔥 START BATTLE NOW!", "combatZone": "Combat Zone", "rhythmZone": "Guitar Solo", "scoreLabel": "SCORE", "killsLabel": "KILLS", "rockLabel": "ROCK",
                "rockManaLabel": "⚡ ROCK MANA", "btnSoundTitle": "Toggle Audio", "btnStatsTitle": "Battle Statistics (SS)", "btnSpecialTitle": "Activate 2x Special (Space / Tap)",
                "specialBtnTitle": "SPECIAL", "btnGearTitle": "Settings & Pause", "scorePillTitle": "Current Score", "comboPillTitle": "Current Combo", "comboText": "COMBO",
                "highwayDivider": "🎸 SOLO RHYTHM HIGHWAY - HIT TO THE BEAT! 🎸", "btnExitSong": "✕ EXIT", "btnExitSongTitle": "End Song", "talentTitle": "🎸 TALENT TREE",
                "talentUpgrades": "Upgrades:", "tabOffense": "🔥 OFFENSE", "tabDefense": "🛡️ DEFENSE", "tabRhythm": "⚡ RHYTHM & GOLD", "effectCurrent": "Current Effect:",
                "effectNext": "Next Level:", "btnUpgrade": "UPGRADE", "noBonus": "No bonus", "maxLevelReached": "Max Level Reached!", "requiresPrereq": "🔒 Requires: {name} Lv. {level}",
                "needGold": "NEED {amount} 🪙", "locked": "LOCKED", "maxLevel": "MAX LEVEL", "studioTitle": "🎵 MUSIC & RHYTHM STUDIO",
                "studioSubtitle": "Create, edit and share your own songs in the game!", "tabMySongs": "📂 MY SONGS", "tabNewSong": "➕ NEW SONG", "tabImportExport": "📥 IMPORT / EXPORT",
                "labelAlbumCover": "Album Cover (Image):", "btnChooseImage": "📷 Choose Image", "labelAudioFile": "Audio File (.mp3, .wav, .ogg, .m4a):",
                "btnChooseAudio": "📁 Choose Audio File", "noAudioSelected": "No audio selected", "labelSongTitle": "Song Title:", "phSongTitle": "Ex: Through the Fire and Flames",
                "labelSongArtist": "Artist / Author:", "phSongArtist": "Ex: DragonForce", "labelBpm": "BPM (Song Tempo):", "tapTempoTitle": "Tap to the beat to calculate BPM",
                "btnTapTempo": "🖐️ TAP TEMPO", "labelSongDesc": "Song Description:", "phSongDesc": "Describe your track, style or rhythm challenge...",
                "labelInitialPattern": "Initial Pattern:", "optEmptyPattern": "Start with Empty Chart (Map in Editor)", "optAutogenPattern": "Auto-generate Base Rhythm by BPM",
                "btnCreateSong": "🚀 CREATE SONG & OPEN EDITOR", "importTitle": "📥 Import Song (.gvsong / .json / Audio)",
                "importDesc": "Import song packages (.gvsong / .json) or audio files directly into the game! You can also drag and drop files here.",
                "btnChoosePackage": "📂 Choose .gvsong Package or Audio", "exportTitle": "💾 How to Export & Share?", "exportStep1": "1. Go to <b>MY SONGS</b> tab.",
                "exportStep2": "2. Click <b>EXPORT</b> on your song card.", "exportStep3": "3. A <code>.gvsong</code> file will download ready to send to friends!", "studioPlay": "▶️ PLAY",
                "studioEdit": "✏️ EDIT", "studioExport": "💾 EXPORT", "studioSync": "⚡ TO SERVER", "studioLoading": "Loading songs...",
                "studioEmpty": "No songs found. Create a new song or import one!", "editorSnap": "Snap:", "editorSpeed": "Speed:", "editorNormal": "🎵 Normal", "editorHold": "〰️ Sustain",
                "editorHoldDuration": "Duration:", "editorUndo": "↩️ Undo", "editorAutoBpm": "⚡ Auto-BPM", "editorClear": "🗑️ Clear", "editorSave": "💾 SAVE",
                "editorSavePlay": "🚀 SAVE & PLAY", "editorScrubberLabel": "⏱️ Timeline Scrubber:",
                "editorInstructions": "Tap lanes to add/remove notes on timeline, or use <b>REC</b> to record notes as the music plays!", "laneGreen": "GREEN [A]", "laneRed": "RED [S]",
                "laneYellow": "YELLOW [D]", "laneBlue": "BLUE [F]", "victoryTitle": "🏆 VICTORY! SHOW COMPLETED!", "victoryBannerTitle": "👑 SHOW CONCLUDED! 🎸",
                "victoryBannerSub": "⚡ HORDE OBLITERATED • STANDING OVATION! ⚡", "statAccuracy": "Accuracy", "statNotesHit": "Notes Hit", "statZombiesKilled": "Zombies Defeated",
                "statMaxStreak": "Highest Streak", "statGoldGained": "Gold Earned", "statScoreGained": "Match Score", "btnPlayAgain": "🔄 PLAY AGAIN", "btnMainMenu": "🏠 MAIN MENU",
                "defeatTitle": "☠️ DEFEAT! THE STAGE WAS OVERRUN!", "defeatBannerTitle": "⚡ AMPLIFIER DESTROYED! ⚡", "defeatBannerSub": "☠️ SILENCE ON STAGE • THE HORDE OVERRAN ☠️",
                "defeatSub": "Your energy ran out and the zombies stopped the show!", "statDamageDealt": "Damage Dealt", "statGoldCollected": "Gold Collected",
                "statScoreReached": "Score Reached", "btnRetry": "🔄 TRY AGAIN", "pvpSelectSongTitle": "⚔️ ONLINE PVP DUEL", "pvpSelectSongSubtitle": "Choose the song for the duel:",
                "pvpStartSearch": "SEARCH MATCH ⚡", "pvpMatchmakingTitle": "SEARCHING FOR OPPONENT...", "pvpConnecting": "Connecting to SA-East server (São Paulo)...",
                "pvpSearching": "Finding guitarists in the same trophy elo...", "pvpOpponentFound": "🎯 OPPONENT FOUND!", "pvpStartingIn": "Duel starting in: ", "pvpCancel": "CANCEL",
                "pvpConfrontLine": "⚡ CONFRONTATION LINE • CLEAR-LANE SHOTS HEAL OPPONENT ZOMBIES ⚡", "pvpWinTitle": "🏆 PVP DUEL VICTORY!", "pvpDefeatTitle": "☠️ PVP DUEL DEFEAT!",
                "pvpWinKo": "Opponent was overrun by the zombie horde!", "pvpLoseKo": "Your defenses fell and zombies invaded your stage!",
                "pvpWinScore": "Victory by Rhythmic Domination & Highest Score!", "pvpLoseScore": "Opponent achieved higher score on the track!", "pvpTrophies": "Trophies",
                "pvpOverHeals": "Enemy Zombie Heals Created", "ssTitle": "📊 BATTLE STATISTICS", "ssSub": "Real-time match performance", "ssHeroHp": "GUITARIST HP",
                "ssMatchTime": "COMBAT TIME", "ssTotalDamage": "Total Damage Dealt", "ssZombiesKilled": "Zombies Defeated", "ssMaxStreak": "Highest Streak",
                "ssCurrentMultiplier": "Current Multiplier", "ssCurrentScore": "Current Score", "ssMatchCoins": "Gold this Match", "ssAccuracyJudging": "Accuracy & Note Judgment",
                "btnResumeBattle": "RESUME GAME", "gearTitle": "⚙️ OPTIONS & PAUSE", "gearLangLabel": "Language / Idioma:", "gearSoundLabel": "Game Audio:",
                "gearToggleSound": "Toggle Sound", "gearDangerWarning": "⚠️ Returning to Main Menu will end the current battle and match data will be lost!",
                "gearAbandon": "🚨 Return to Main Menu (discard battle)", "gearResume": "▶️ Resume Battle", "skillEquipTitle": "⚡ Equip in Lane {lane}", "btnRestoreDefault": "↺ Default",
                "skillRuleNotice": "<strong>Stage Rule:</strong> You must keep at least 1 lane equipped with Basic Attack!",
                "skillPickPrompt": "Choose the skill activated by hitting notes in this lane:", "skillEquippedTag": "✅ Equipped in this lane",
                "skillBlockedTag": "🔒 Blocked: Keep ≥ 1 Basic Attack", "missionsTitle": "🎯 MISSIONS & STAGE GOALS",
                "missionsSub": "Slay zombies and master guitarists to unlock procedural milestones (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k)!", "tabZombieHordes": "🧟 Zombie Hordes",
                "tabGuitarists": "🎸 Guitarists", "tabPerformance": "⚡ Rhythm & Battle", "tabPvP": "⚔️ PvP Duels", "statKillsHordes": "💀 Horde Kills:", "statKillsHeroes": "🎸 Hero Kills:",
                "statRhythmActions": "⚡ Rhythm Actions:", "statWalletGold": "💰 Wallet:", "statInventoryXp": "✨ Stored XP:", "statMissionsGold": "🪙 Gold Collected:",
                "statMasters": "👑 Masters (100k):", "btnClaimAll": "✨ CLAIM ALL", "btnClaimCount": "✨ CLAIM ({count})", "filterAll": "All", "filterReady": "Ready ✨",
                "filterActive": "In Progress 🔒", "filterCompleted": "Masters 👑", "phSearchMissions": "🔍 Search by name or archetype...",
                "noMissionsFound": "No missions found for the selected filter.", "milestoneReward": "MILESTONE REWARD:", "heroMastery": "GUITARIST MASTERY:",
                "perfMilestone": "PERFORMANCE MILESTONE:", "masterHunter": "MASTER HUNTER", "rockLegend": "ROCK LEGEND", "supremeMastery": "SUPREME MASTERY",
                "completedUnits": "{target} {unit} Completed!", "claim": "CLAIM", "target": "Target:", "goldUnit": "Gold", "menuXpTitle": "XP Inventory",
                "xpInventoryLabel": "Inventory XP:", "btnInjectXp": "✨ INJECT XP (+{amount} XP)", "btnInjectLevelUp": "✨ INJECT XP (+1 LEVEL)", "noXpInInventory": "✨ NO XP IN INVENTORY",
                "heroMaxLevel": "⭐ MAX LEVEL (100)", "heroLevelUp": "⬆️ LEVEL UP (🪙 {cost})", "heroUnlock": "🪙 UNLOCK GUITARIST (🪙 {cost})", "heroLocked": "🔒 GUITARIST LOCKED",
                "heroUnlockCost": "Cost: 🪙 {cost} Gold", "heroLevelBadge": "⭐ LEVEL {lvl} / 100", "heroMaxXp": "MAX", "bossBadge": "👑 BOSS (2x GOLD/XP)", "targetsUnit": "Targets",
                "stagePrefix": "Stage {stage}", "bossShowdown": "Stage {stage}: 👑 BOSS SHOWDOWN: {name}!", "map_void_name": "The Void Club",
                "map_void_sub": "Underground Club & Urban Rubble", "map_void_desc": "Facade of the legendary underground pub \"The Void\", concrete barricades and abandoned armored bus.",
                "map_void_badge": "URBAN", "map_ruins_name": "Rubble Stage", "map_ruins_sub": "Central Apocalypse Arena",
                "map_ruins_desc": "Destroyed metal stage in the heart of metropolitan ruins, surrounded by amplifiers and heavy smoke.", "map_ruins_badge": "CONCERT",
                "map_wasteland_name": "Metal Wasteland", "map_wasteland_sub": "Anarchic Desert & Toxic Outpost",
                "map_wasteland_desc": "Mad Max style arid highway, fortified gas station, mutated cacti and scrap piles in sandstorms.", "map_wasteland_badge": "DESERT",
                "map_thermopylae_name": "Spartan Pass", "map_thermopylae_sub": "The Pass of 300 & Wall of Riffs",
                "map_thermopylae_desc": "Legendary Greek canyon pass fortified against undead hordes with bronze shields, Spartan barricades and amp stacks.",
                "map_thermopylae_badge": "SPARTA", "map_coliseum_name": "Imperial Coliseum", "map_coliseum_sub": "Roman Gladiators Arena",
                "map_coliseum_desc": "Ancient ruins of Rome turned into the ultimate stage where gladiators and undead face off to blistering solos.", "map_coliseum_badge": "COLISEUM",
                "map_bikini_bottom_name": "Bikini Depths", "map_bikini_bottom_sub": "The Toxic Depths of Krusty Krab",
                "map_bikini_bottom_desc": "Iconic underwater trench submerged in toxic fallout, where the rusted pineapple and Krusty Krab harbor oceanic punk.",
                "map_bikini_bottom_badge": "DEPTHS", "map_valhalla_name": "Valhalla Fjord", "map_valhalla_sub": "Frozen Fjord of Odin",
                "map_valhalla_desc": "Glacial peaks, ancestral drakkars, and snow-capped Norse palisades where Viking warriors echo thunderous metal riffs.", "map_valhalla_badge": "VIKING",
                "map_stadium_name": "Ruined Stadium", "map_stadium_sub": "Devastated Rock Cauldron",
                "map_stadium_desc": "Monumental ruined soccer arena with twisted goalposts and crumbling terraces where mosh pits tear through the pitch.", "map_stadium_badge": "STADIUM",
                "mk1Sub": "FIRST CASUALTY! 🔥", "mk2Sub": "RHYTHM ACCELERATING! ⚡", "mk3Sub": "TRIPLE CARNAGE! 💥", "mk4Sub": "STAGE MASSACRE! 🎸", "mk5Sub": "MAXIMUM ADRENALINE! ⚡",
                "mk6Sub": "ROCK AND ROLL GOD! 🤘", "mk7Sub": "LEGENDARY & UNBEATABLE! 👑", "btnClose": "Close", "btnPvPRematch": "⚔️ REMATCH", "btnPvPClose": "BACK TO MENU",
                "pvpPreBattleTitle": "⚔️ ONLINE PVP DUEL", "pvpPreBattleSubtitle": "Customize your Guitarist, Skills, and Song for the clash:", "pvpHeroLabel": "🎸 YOUR GUITARIST",
                "pvpSkillsLabel": "⚡ LANE SKILLS", "pvpSkillsHint": "Tap to change", "pvpSongLabel": "🎵 MATCH SONG", "statPvPActions": "PvP Actions", "pvpGoldTag": "GOLD",
                "pvpHeroXpTag": "HERO XP", "pvpLocating": "Locating compatible opponent...", "pvpYou": "You", "levelShort": "Lv.", "pvpChosenSongBadge": "🎵 Song: {song} ({bpm} BPM)",
                "countdownGetReady": "🎸 GET READY", "countdownSubtitle": "PLACE YOUR FINGERS!", "countdownStart5": "GET READY!", "countdownStart4": "PLACE YOUR FINGERS!",
                "countdownStart3": "TUNE THE STRINGS!", "countdownStart2": "WATCH OUT!", "countdownStart1": "ALMOST THERE!", "countdownResume5": "RESUMING MATCH!",
                "countdownResume3": "EYES ON THE HIGHWAY!", "countdownModeResume": "⏸️ RESUME", "countdownModePrep": "🎸 GET READY", "countdownGo": "LET'S ROCK!", "specialUsed": "USED ✖",
                "specialReady": "READY! ⚡", "specialEnded": "⚡ SPECIAL ENDED!", "bossSpawned": "⚠️ TITAN BOSS SPAWNED! 👑", "missLabel": "MISS! 💨",
                "perfectStreakCrit": "🎯 5x PERFECT! NEXT HIT CRIT!", "noMpBasic": "⚡ NO MP! (BASIC)", "levelUpToast": "⭐ LEVEL {level}! UP!",
                "stageCompletedToast": "🏆 STAGE {stage} COMPLETED!", "rockNeverDies": "⚡ ROCK NEVER DIES! ⚡", "heroRevived": "⚡ REVIVED! ⚡", "barrierReady": "🛡️ BARRIER READY!",
                "chainDeflected": "🛡️ CHAIN DEFLECTED!", "helmetBroken": "🛡️ HELMET BROKEN! STUN!", "burningStatus": "🔥 BURNING!", "immuneStatus": "⚡ IMMUNE!",
                "blockedStatus": "🛡️ BLOCKED!", "critReadyTag": " • 💥 CRIT READY!", "insufficientGold": "Not enough gold!", "errorInjectXp": "Error injecting XP!",
                "abandonBattleConfirm": "⚠️ Are you sure you want to abandon the battle and return to the main menu? Progress will be lost.", "gearCloseSettings": "✕ CLOSE SETTINGS",
                "heroRecruitedToast": "🎸 {name} recruited successfully!", "heroUnlockCostPrompt": "🔒 Unlock for 🪙 {cost}", "missionsStatKillsLabel": "💀 Horde Kills:",
                "bossNameFormat": "👑 [BOSS] {name} TITAN", "stageRuleAtLeastOneBasic": "⚠️ Stage Rule: You must keep at least 1 slot equipped with Basic Strike!",
                "skillBadgeBasic": "⚡ BASIC", "skillBadgeDamage": "💥 DAMAGE", "skillBadgeCrit": "🔮 CRIT", "skillBadgeAoe": "💥 AOE", "skillBadgeStun": "💫 STUN",
                "skillBadgeBurn": "🔥 BURN", "skillBadgeToxic": "☢️ TOXIC", "skillBadgeLightning": "⚡ LIGHTNING", "skillBadgeBuff": "🚀 BUFF", "skillBadgeHeal": "💚 HEAL",
                "skillBadgeShield": "🛡️ SHIELD", "skillBadgeLifesteal": "🩸 LIFESTEAL", "skillBadgeBleed": "🩸 BLEED", "skillBadgePierce": "🎸 PIERCE",
                "skillBadgeCataclysm": "👑 CATACLYSM", "skillBadgeSpecial": "⚡ SPECIAL", "fretBasicBadge": "BASIC", "fretNoMpBadge": "⚡ NO MP", "inspectorLevel": "LEVEL {level} / {max}",
                "talentDmgBase": "+{amount} Base Damage", "talentCritDmg": "+{amount}% Crit Damage", "talentChainLightning": "Lightning arcs hit up to {amount} adjacent zombies",
                "talentNoChain": "No chain lightning", "talentKnockback": "+{amount}% Knockback Force", "talentMaxHp": "+{amount} Max HP", "rarity_common": "COMMON", "rarity_rare": "RARE",
                "rarity_epic": "EPIC", "rarity_legendary": "LEGENDARY", "rarity_mythic": "MYTHIC", "rarity_ancestral": "ANCESTRAL", "rarity_cosmic": "COSMIC", "rarity_divine": "DIVINE",
                "hero_johnny_blaze_title": "The Classic Punk Rocker", "hero_johnny_blaze_inst": "Stratocaster \"Hellfire\"", "hero_johnny_blaze_pass_name": "Rock Spirit",
                "hero_johnny_blaze_pass_desc": "+1.0% Damage and +0.4% Critical Damage per level (up to +99% damage and +89% crit at Lv. 100).",
                "hero_vulkan_ironhead_title": "Wasteland Pyromaniac", "hero_vulkan_ironhead_inst": "Flaming V8 Scrap-Metal", "hero_vulkan_ironhead_pass_name": "Brutal Pyrotechnics",
                "hero_vulkan_ironhead_pass_desc": "+1.0% Damage, +0.3% Mana Regen and continuous burn chance scaling per level.", "hero_dr_radix_title": "Biochemical Soloist",
                "hero_dr_radix_inst": "Guitarratox \"Uranium-235\"", "hero_dr_radix_pass_name": "Acoustic Radiation",
                "hero_dr_radix_pass_desc": "+1.0% Damage, +0.35% Armor Penetration and +0.12% continuous zombie slow per level.", "hero_cypher_volt_title": "Cybernetic Virtuoso",
                "hero_cypher_volt_inst": "Neon Bionic Laser-Caster", "hero_cypher_volt_pass_name": "Bionic Overdrive",
                "hero_cypher_volt_pass_desc": "+1.1% Damage and +0.6% Crit Damage per level, with devastating lightning arcs on PERFECT notes.", "hero_kragthor_titan_title": "Heavy Metal Titan",
                "hero_kragthor_titan_inst": "Flying-V \"Magma Fury\"", "hero_kragthor_titan_pass_name": "Fury of the Titans",
                "hero_kragthor_titan_pass_desc": "+1.15% Damage, +0.85% Crit Damage per level and brutal knockback against heavy zombies.", "hero_roxie_anarchy_title": "Mythic Punk Valkyrie",
                "hero_roxie_anarchy_inst": "Custom \"Riot Slash\" Guitar", "hero_roxie_anarchy_pass_name": "Absolute Anarchy",
                "hero_roxie_anarchy_pass_desc": "+1.20% Damage, +0.70% Crit Damage, +0.25% Extra Gold and +0.50% Mana Regen per level!",
                "hero_finn_punk_title": "Multiversal Sound Champion", "hero_finn_punk_inst": "Sonic Sword-Guitar of Ooo", "hero_finn_punk_pass_name": "Multiverse Rock Time",
                "hero_finn_punk_pass_desc": "+1.22% Damage, +0.75% Crit Damage and +0.3% sonic projectile speed per level.", "hero_ignis_draco_title": "Riff-Devouring Dragon",
                "hero_ignis_draco_inst": "Draconic Guitar \"Inferno\"", "hero_ignis_draco_pass_name": "Acoustic Fiery Breath",
                "hero_ignis_draco_pass_desc": "+1.26% Damage, +0.82% Crit Damage and +0.35% draconic burn chance per level.", "hero_fenrir_howler_title": "Full Moon Metal Beast",
                "hero_fenrir_howler_inst": "Axe-Star \"Night Wolf\"", "hero_fenrir_howler_pass_name": "Blood Moon Frenzy",
                "hero_fenrir_howler_pass_desc": "+1.30% Damage, +0.90% Crit Damage and continuous vital essence drain from zombies per level.", "hero_spiky_sponge_title": "Yellow Anarchy of the Depths",
                "hero_spiky_sponge_inst": "Jet Flying-V \"Bikini Bottom\"", "hero_spiky_sponge_pass_name": "Hypersonic Propulsion",
                "hero_spiky_sponge_pass_desc": "+1.35% Damage, +0.95% Crit Damage, +0.35% Extra Gold and +0.60% Mana Regen per level!", "hero_saul_slash_title": "Immortal God of Top Hat & Les Paul",
                "hero_saul_slash_inst": "Sacred Gibson Les Paul Goldtop \"1959\"", "hero_saul_slash_pass_name": "Appetite For Destruction",
                "hero_saul_slash_pass_desc": "+1.45% Damage, +1.10% Crit Damage, +0.45% Extra Gold and +0.70% Mana Regen per level! The apex of musical power.", "zombie_punk_walker": "Punk Rocker Zombie",
                "zombie_feral_leaper": "Feral Leaper", "zombie_toxic_mutant": "Radioactive Mutant", "zombie_armored_soldier": "Armored Sergeant", "zombie_fungal_spore": "Spore Infected",
                "zombie_bloater_pounder": "Bloated Devourer", "zombie_chained_gladiator": "Asphalt Gladiator", "zombie_toxic_hazmat": "Hazmat Worker",
                "zombie_clown_jester": "Sinister Clown", "zombie_builder_demolisher": "Demolisher Builder", "zombie_mad_scientist": "Mad Scientist",
                "zombie_inferno_firefighter": "Firefighter Zombie", "zombie_sheriff_walker": "Survivor Sheriff", "zombie_presidential_politician": "Presidential Politician",
                "zombie_dark_knight_undead": "Dark Knight Undead", "zombie_god_of_war_spartan": "Spartan Ghost", "zombie_badge_normal": "Normal / Punk",
                "zombie_badge_agile": "Agile / Air Leap", "zombie_badge_tank": "Tank / Devastator", "zombie_badge_armored": "Armored / Charge",
                "zombie_badge_spore": "Fungal / Regenerative", "zombie_badge_colossus": "Colossus / Seismic", "zombie_badge_gladiator": "Gladiator / Deflection",
                "zombie_badge_toxic": "Chemical / Acid Pool", "zombie_badge_maniac": "Maniac / Claws", "zombie_badge_demolition": "Demolition / Heavy",
                "zombie_badge_viral": "Viral / Chemical", "zombie_badge_firefighter": "Fireproof / Armored", "zombie_badge_sheriff": "Sheriff / Axe Chop",
                "zombie_badge_politician": "Politician / Rally", "zombie_badge_batman": "Bat / Cape Dodge", "zombie_badge_spartan": "Spartan / Rage", "statSpeedUnit": "Speed: {speed} px/s",
                "statDmgUnit": "Damage: {dmg}", "specialChip": "🔥 Special: {duration}s (cap {max}s)", "specialActiveChip": "🔥 Special: {duration}s",
            },
            'es': {
                "menuGoldTitle": "Oro Recolectado", "menuScoreTitle": "Mejor Puntuación", "menuKillsTitle": "Zombis Destruidos", "menuSoundToggleTitle": "Alternar Sonido",
                "menuSub": "HEAVY METAL APOCALYPSE", "menuStageTag": "🎸 GIRA MUNDIAL DE LOS CONDENADOS",
                "menuStageDesc": "¡Arma tu guitarra distorsionada, destruye hordas de zombis en tiempo real y domina el escenario con riffs mortales!", "btnPlay": "CAMPAÑA",
                "dockBattle": "BATALLA", "dockCampaign": "CAMPAÑA", "dockShop": "Tienda", "dockTalents": "Talentos", "dockPvp": "PvP", "dockMissions": "Misiones", "dockStudio": "Estudio",
                "btnShop": "TIENDA DE GUITARRISTAS", "shopTitle": "🛒 TIENDA DE GUITARRISTAS", "shopSub": "¡CONTRATA A LAS MAYORES LEYENDAS DEL ROCK PARA ANIQUILAR LA HORDA!",
                "shopEquipped": "EQUIPADO", "shopEquip": "EQUIPAR", "shopBuy": "COMPRAR", "btnTalents": "ÁRBOL DE TALENTOS", "btnMissions": "MISIONES & CACERÍA DE ZOMBIS",
                "btnStudio": "ESTUDIO DE MÚSICA & RITMO", "btnSettings": "CONFIGURACIÓN", "btnPvP": "⚔️ DUELO ONLINE PVP",
                "menuFooter": "Guitar vs Zombies v1.9.7 (Build 61) • Experiencia AAA de Audio y Acción", "mapBack": "⬅️ Volver", "mapTitle": "PREPARACIÓN DE LA BATALLA",
                "mapSub": "CONFIGURA TU CONCIERTO Y CONOCE LA HORDA", "sectionStage": "🗺️ Fase Actual", "btnPrevStage": "Fase Anterior", "btnNextStage": "Próxima Fase",
                "sectionArena": "🏟️ Arena del Concierto", "badgeRandom": "🎲 Al Azar", "sectionHero": "🎸 Guitarrista", "btnPrevHero": "Guitarrista Anterior",
                "btnNextHero": "Próximo Guitarrista", "heroPassiveTag": "PASIVA:", "btnHeroLevelUp": "⬆️ SUBIR NIVEL", "sectionHorde": "🧟 Horda Enemiga",
                "hordeCountTag": "5 Seleccionados", "sectionSkills": "⚡ Habilidades por Pista", "skillsHint": "Toca para Equipar", "sectionSong": "🎵 Banda Sonora",
                "btnPrevSong": "Canción Anterior", "btnNextSong": "Próxima Canción", "songActivePill": "EN REPRODUCCIÓN", "btnStartBattle": "🔥 ¡INICIAR BATALLA AHORA!",
                "combatZone": "Zona de Combate", "rhythmZone": "Solo de Guitarra", "scoreLabel": "PUNTOS", "killsLabel": "ZOMBIS", "rockLabel": "ROCK", "rockManaLabel": "⚡ ROCK MANÁ",
                "btnSoundTitle": "Alternar Audio", "btnStatsTitle": "Estadísticas de la Batalla (SS)", "btnSpecialTitle": "Activar Especial 2x (Espacio / Toque)",
                "specialBtnTitle": "ESPECIAL", "btnGearTitle": "Configuración & Pausa", "scorePillTitle": "Puntuación Actual", "comboPillTitle": "Combo Actual", "comboText": "COMBO",
                "highwayDivider": "🎸 SOLO RHYTHM HIGHWAY - ¡TOCA AL RITMO! 🎸", "btnExitSong": "✕ SALIR", "btnExitSongTitle": "Terminar Canción", "talentTitle": "🎸 ÁRBOL DE TALENTOS",
                "talentUpgrades": "Mejoras:", "tabOffense": "🔥 OFENSIVO", "tabDefense": "🛡️ DEFENSIVO", "tabRhythm": "⚡ RITMO Y ORO", "effectCurrent": "Efecto Actual:",
                "effectNext": "Próximo Nivel:", "btnUpgrade": "MEJORAR", "noBonus": "Sin bonificación", "maxLevelReached": "¡Nivel Máximo Alcanzado!",
                "requiresPrereq": "🔒 Requiere: {name} Nv. {level}", "needGold": "FALTAN {amount} 🪙", "locked": "BLOQUEADO", "maxLevel": "NIVEL MÁXIMO",
                "studioTitle": "🎵 ESTUDIO DE MÚSICA & RITMO", "studioSubtitle": "¡Crea, edita y comparte tus propias pistas en el juego!", "tabMySongs": "📂 MIS CANCIONES",
                "tabNewSong": "➕ NUEVA CANCIÓN", "tabImportExport": "📥 IMPORTAR / EXPORTAR", "labelAlbumCover": "Portada del Álbum (Imagen):", "btnChooseImage": "📷 Elegir Imagen",
                "labelAudioFile": "Archivo de Audio (.mp3, .wav, .ogg, .m4a):", "btnChooseAudio": "📁 Elegir Archivo de Audio", "noAudioSelected": "Ningún audio seleccionado",
                "labelSongTitle": "Título de la Canción:", "phSongTitle": "Ej: Through the Fire and Flames", "labelSongArtist": "Autoría / Artista:", "phSongArtist": "Ej: DragonForce",
                "labelBpm": "BPM (Tempo de la Canción):", "tapTempoTitle": "Toca al ritmo para calcular BPM", "btnTapTempo": "🖐️ TAP TEMPO", "labelSongDesc": "Descripción de la Canción:",
                "phSongDesc": "Describe tu pista, estilo o desafío rítmico...", "labelInitialPattern": "Ritmo Inicial:", "optEmptyPattern": "Iniciar con Ritmo Vacío (Mapear en Editor)",
                "optAutogenPattern": "Generar Ritmo Base Automático por BPM", "btnCreateSong": "🚀 CREAR CANCIÓN & ABRIR EDITOR",
                "importTitle": "📥 Importar Canción (.gvsong / .json / Audio)",
                "importDesc": "¡Importa paquetes de música (.gvsong / .json) o archivos de audio (.mp3, .wav, .ogg, .m4a) directamente al juego! También puedes arrastrar y soltar el archivo aquí.",
                "btnChoosePackage": "📂 Elegir Paquete .gvsong o Audio", "exportTitle": "💾 ¿Cómo Exportar y Compartir?", "exportStep1": "1. Ve a la pestaña <b>MIS CANCIONES</b>.",
                "exportStep2": "2. Haz clic en <b>EXPORTAR</b> en la tarjeta de tu canción.",
                "exportStep3": "3. ¡Se descargará un archivo <code>.gvsong</code> en tu dispositivo listo para compartir!", "studioPlay": "▶️ JUGAR", "studioEdit": "✏️ EDITAR",
                "studioExport": "💾 EXPORTAR", "studioSync": "⚡ AL SERVIDOR", "studioLoading": "Cargando canciones...",
                "studioEmpty": "No se encontraron canciones. ¡Crea una nueva o importa una!", "editorSnap": "Rejilla:", "editorSpeed": "Velocidad:", "editorNormal": "🎵 Normal",
                "editorHold": "〰️ Sostenida", "editorHoldDuration": "Duración:", "editorUndo": "↩️ Deshacer", "editorAutoBpm": "⚡ Auto-BPM", "editorClear": "🗑️ Limpiar",
                "editorSave": "💾 GUARDAR", "editorSavePlay": "🚀 GUARDAR & JUGAR", "editorScrubberLabel": "⏱️ Navegador de Tiempo:",
                "editorInstructions": "Toca las pistas para agregar/quitar notas en la línea de tiempo, ¡o usa <b>REC</b> para grabar al ritmo mientras suena la música!",
                "laneGreen": "VERDE [A]", "laneRed": "ROJO [S]", "laneYellow": "AMARILLO [D]", "laneBlue": "AZUL [F]", "victoryTitle": "🏆 ¡VICTORIA! ¡CONCIERTO CONCLUIDO!",
                "victoryBannerTitle": "👑 ¡CONCIERTO CONCLUIDO! 🎸", "victoryBannerSub": "⚡ ¡HORDA ANIQUILADA • OVACIÓN DEL PÚBLICO! ⚡", "statAccuracy": "Precisión",
                "statNotesHit": "Notas Acertadas", "statZombiesKilled": "Zombis Derrotados", "statMaxStreak": "Mayor Racha", "statGoldGained": "Oro Obtenido",
                "statScoreGained": "Puntos de la Partida", "btnPlayAgain": "🔄 JUGAR DE NUEVO", "btnMainMenu": "🏠 MENÚ PRINCIPAL",
                "defeatTitle": "☠️ ¡DERROTA! ¡EL ESCENARIO FUE INVADIDO!", "defeatBannerTitle": "⚡ ¡AMPLIFICADOR DESTRUIDO! ⚡",
                "defeatBannerSub": "☠️ SILENCIO EN EL ESCENARIO • LA HORDA AVANZÓ ☠️", "defeatSub": "¡Tu energía se agotó y los zombis interrumpieron el concierto!",
                "statDamageDealt": "Daño Infligido", "statGoldCollected": "Oro Recolectado", "statScoreReached": "Puntuación Alcanzada", "btnRetry": "🔄 REINTENTAR",
                "pvpSelectSongTitle": "⚔️ DUELO PVP ONLINE", "pvpSelectSongSubtitle": "Elige la canción para disputar el enfrentamiento:", "pvpStartSearch": "BUSCAR PARTIDA ⚡",
                "pvpMatchmakingTitle": "BUSCANDO OPONENTE...", "pvpConnecting": "Conectando al servidor SA-East (São Paulo)...",
                "pvpSearching": "Buscando guitarristas en el mismo rango de trofeos...", "pvpOpponentFound": "🎯 ¡OPONENTE ENCONTRADO!", "pvpStartingIn": "Duelo iniciando en: ",
                "pvpCancel": "CANCELAR", "pvpConfrontLine": "⚡ LÍNEA DE CONFRONTACIÓN • TIROS LIBRES CURAN ZOMBIS DEL RIVAL ⚡", "pvpWinTitle": "🏆 ¡VICTORIA EN EL DUELO PVP!",
                "pvpDefeatTitle": "☠️ ¡DERROTA EN EL DUELO PVP!", "pvpWinKo": "¡El oponente fue derribado por la horda de zombis!",
                "pvpLoseKo": "¡Tu defensa sucumbió y los zombis invadieron tu escenario!", "pvpWinScore": "¡Victoria por Dominio Rítmico y Mayor Puntuación!",
                "pvpLoseScore": "¡El oponente obtuvo una puntuación más alta!", "pvpTrophies": "Trofeos", "pvpOverHeals": "Curas Enemigas Generadas",
                "ssTitle": "📊 ESTADÍSTICAS DE BATALLA", "ssSub": "Rendimiento en tiempo real del enfrentamiento", "ssHeroHp": "HP DEL GUITARRISTA", "ssMatchTime": "TIEMPO EN COMBATE",
                "ssTotalDamage": "Daño Total Infligido", "ssZombiesKilled": "Zombis Derrotados", "ssMaxStreak": "Mayor Racha", "ssCurrentMultiplier": "Multiplicador Actual",
                "ssCurrentScore": "Puntuación Actual", "ssMatchCoins": "Oro en esta Partida", "ssAccuracyJudging": "Precisión & Juicio de Notas", "btnResumeBattle": "VOLVER AL JUEGO",
                "gearTitle": "⚙️ OPCIONES & PAUSA", "gearLangLabel": "Idioma / Language:", "gearSoundLabel": "Sonido del Juego:", "gearToggleSound": "Alternar Sonido",
                "gearDangerWarning": "⚠️ ¡Volver al Menú Principal terminará el combate actual y los datos de esta partida se descartarán!",
                "gearAbandon": "🚨 Volver al Menú Principal (pierde progreso actual)", "gearResume": "▶️ Continuar Partida", "skillEquipTitle": "⚡ Equipar en Pista {lane}",
                "btnRestoreDefault": "↺ Predeterminado", "skillRuleNotice": "<strong>Regla del Escenario:</strong> ¡Es obligatorio mantener al menos 1 pista con Ataque Básico equipado!",
                "skillPickPrompt": "Elige la habilidad que se activará al acertar notas en esta pista:", "skillEquippedTag": "✅ Equipada en esta pista",
                "skillBlockedTag": "🔒 Bloqueado: Mantén ≥ 1 Ataque Básico", "missionsTitle": "🎯 MISIONES & METAS DEL ESCENARIO",
                "missionsSub": "¡Elimina zombis y domina guitarristas para desbloquear metas procedurales (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k)!", "tabZombieHordes": "🧟 Hordas Zombi",
                "tabGuitarists": "🎸 Guitarristas", "tabPerformance": "⚡ Ritmo & Batalla", "tabPvP": "⚔️ Duelo PvP", "statKillsHordes": "💀 Bajas Hordas:",
                "statKillsHeroes": "🎸 Bajas Héroes:", "statRhythmActions": "⚡ Acciones de Ritmo:", "statWalletGold": "💰 Billetera:", "statInventoryXp": "✨ XP Guardada:",
                "statMissionsGold": "🪙 Oro Recolectado:", "statMasters": "👑 Maestros (100k):", "btnClaimAll": "✨ RECLAMAR TODAS", "btnClaimCount": "✨ RECLAMAR ({count})",
                "filterAll": "Todos", "filterReady": "Listos ✨", "filterActive": "En Progreso 🔒", "filterCompleted": "Maestros 👑",
                "phSearchMissions": "🔍 Buscar zombi por nombre o arquetipo...", "noMissionsFound": "No se encontraron misiones para el filtro seleccionado.",
                "milestoneReward": "RECOMPENSA DEL HITO:", "heroMastery": "MAESTRÍA DEL GUITARRISTA:", "perfMilestone": "HITO DE RENDIMIENTO:", "masterHunter": "MAESTRO CAZADOR",
                "rockLegend": "LEYENDA DEL ROCK", "supremeMastery": "MAESTRÍA SUPREMA", "completedUnits": "¡{target} {unit} Completadas!", "claim": "RECLAMAR", "target": "Meta:",
                "goldUnit": "Oro", "menuXpTitle": "Inventario de XP", "xpInventoryLabel": "XP en el Inventario:", "btnInjectXp": "✨ INYECTAR XP (+{amount} XP)",
                "btnInjectLevelUp": "✨ INYECTAR XP (+1 NIVEL)", "noXpInInventory": "✨ SIN XP EN EL INVENTARIO", "heroMaxLevel": "⭐ NIVEL MÁXIMO (100)",
                "heroLevelUp": "⬆️ SUBIR NIVEL (🪙 {cost})", "heroUnlock": "🪙 DESBLOQUEAR GUITARRISTA (🪙 {cost})", "heroLocked": "🔒 GUITARRISTA BLOQUEADO",
                "heroUnlockCost": "Costo: 🪙 {cost} Oro", "heroLevelBadge": "⭐ NIVEL {lvl} / 100", "heroMaxXp": "MÁXIMO", "bossBadge": "👑 JEFE (2x ORO/XP)", "targetsUnit": "Objetivos",
                "stagePrefix": "Fase {stage}", "bossShowdown": "Fase {stage}: 👑 CONFRONTACIÓN DE JEFE: ¡{name}!", "map_void_name": "The Void Club",
                "map_void_sub": "Club Subterráneo y Escombros Urbanos",
                "map_void_desc": "Fachada del legendario pub underground \"The Void\", barricadas de hormigón y autobús blindado abandonado.", "map_void_badge": "URBANO",
                "map_ruins_name": "Escenario de los Escombros", "map_ruins_sub": "Arena Central del Apocalipsis",
                "map_ruins_desc": "Escenario de metal destruido en el corazón de las ruinas metropolitanas, rodeado de amplificadores y humo.", "map_ruins_badge": "CONCIERTO",
                "map_wasteland_name": "Wasteland del Metal", "map_wasteland_sub": "Desierto Anárquico y Puesto Tóxico",
                "map_wasteland_desc": "Autopista árida estilo Mad Max, gasolinera fortificada, cactus y chatarra bajo tormenta de arena.", "map_wasteland_badge": "DESIERTO",
                "map_thermopylae_name": "Desfiladero de Esparta", "map_thermopylae_sub": "El Desfiladero de los 300 y Muro de Riffs",
                "map_thermopylae_desc": "El legendario desfiladero griego fortificado contra hordas muertas con escudos espartanos y torres de amplificadores.",
                "map_thermopylae_badge": "ESPARTA", "map_coliseum_name": "Coliseo Imperial", "map_coliseum_sub": "La Arena Romana de los Gladiadores",
                "map_coliseum_desc": "Las ruinas milenarias de Roma transformadas en el escenario supremo donde gladiadores enfrentaban zombis al son de solos despiadados.",
                "map_coliseum_badge": "COLISEO", "map_bikini_bottom_name": "Fosa Submarina", "map_bikini_bottom_sub": "Las Profundidades Tóxicas del Crustáceo Cascarudo",
                "map_bikini_bottom_desc": "La icónica fosa submarina sumergida en residuos tóxicos, donde la piña oxidada se convirtió en reducto del punk acuático.",
                "map_bikini_bottom_badge": "FOSA", "map_valhalla_name": "Fiordo del Valhalla", "map_valhalla_sub": "El Fiordo Helado de Odín",
                "map_valhalla_desc": "Picos helados, drakkars ancestrales y murallas nórdicas donde guerreros vikingos hacen retumbar riffs en el hielo.", "map_valhalla_badge": "VIKINGO",
                "map_stadium_name": "Estadio Devastado", "map_stadium_sub": "El Caldero Devastado del Rock",
                "map_stadium_desc": "Un antiguo estadio monumental con gradas en ruinas donde multitudes chocan en mosh pits letales.", "map_stadium_badge": "ESTADIO",
                "mk1Sub": "¡PRIMERA VÍCTIMA! 🔥", "mk2Sub": "¡RITMO ACELERANDO! ⚡", "mk3Sub": "¡TRIPLE MATANZA! 💥", "mk4Sub": "¡MASACRE EN EL ESCENARIO! 🎸",
                "mk5Sub": "¡ADRENALINA MÁXIMA! ⚡", "mk6Sub": "¡DIOS DEL ROCK AND ROLL! 🤘", "mk7Sub": "¡LEGENDARIO E IMBATIBLE! 👑", "btnClose": "Cerrar", "btnPvPRematch": "⚔️ NUEVO DUELO",
                "btnPvPClose": "VOLVER AL MENÚ", "pvpPreBattleTitle": "⚔️ DUELO PVP ONLINE", "pvpPreBattleSubtitle": "Personaliza tu Guitarrista, Habilidades y Canción para el duelo:",
                "pvpHeroLabel": "🎸 TU GUITARRISTA", "pvpSkillsLabel": "⚡ HABILIDADES POR PISTA", "pvpSkillsHint": "Toca para cambiar", "pvpSongLabel": "🎵 CANCIÓN DEL DUELO",
                "statPvPActions": "Acciones PvP", "pvpGoldTag": "ORO", "pvpHeroXpTag": "XP HÉROE", "pvpLocating": "Buscando oponente compatible...", "pvpYou": "Tú", "levelShort": "Nv.",
                "pvpChosenSongBadge": "🎵 Canción: {song} ({bpm} BPM)", "countdownGetReady": "🎸 PREPARACIÓN", "countdownSubtitle": "¡POSICIONA TUS DEDOS!",
                "countdownStart5": "¡PREPÁRATE!", "countdownStart4": "¡POSICIONA TUS DEDOS!", "countdownStart3": "¡AFINA LAS CUERDAS!", "countdownStart2": "¡ATENCIÓN!",
                "countdownStart1": "¡CASI LISTO!", "countdownResume5": "¡REANUDANDO PARTIDA!", "countdownResume3": "¡OJO A LA PISTA!", "countdownModeResume": "⏸️ REANUDAR",
                "countdownModePrep": "🎸 PREPARACIÓN", "countdownGo": "¡DALE CON TODO!", "specialUsed": "USADO ✖", "specialReady": "¡LISTO! ⚡", "specialEnded": "⚡ ¡ESPECIAL TERMINADO!",
                "bossSpawned": "⚠️ ¡JEFE TITÁN APARECIÓ! 👑", "missLabel": "¡FALLO! 💨", "perfectStreakCrit": "🎯 ¡5x PERFECT! ¡PRÓXIMO CRÍTICO!", "noMpBasic": "⚡ ¡SIN MANÁ! (BÁSICO)",
                "levelUpToast": "⭐ ¡NIVEL {level}! ¡UP!", "stageCompletedToast": "🏆 ¡FASE {stage} COMPLETADA!", "rockNeverDies": "⚡ ¡EL ROCK NUNCA MUERE! ⚡",
                "heroRevived": "⚡ ¡REVIVIDO! ⚡", "barrierReady": "🛡️ ¡BARRERA LISTA!", "chainDeflected": "🛡️ ¡CADENA DESVIADA!", "helmetBroken": "🛡️ ¡CASCO ROTO! ¡STUN!",
                "burningStatus": "🔥 ¡QUEMÁNDOSE!", "immuneStatus": "⚡ ¡INMUNE!", "blockedStatus": "🛡️ ¡BLOQUEADO!", "critReadyTag": " • 💥 ¡CRÍTICO LISTO!",
                "insufficientGold": "¡Oro insuficiente!", "errorInjectXp": "¡Error al inyectar XP!",
                "abandonBattleConfirm": "⚠️ ¿Seguro que deseas abandonar la batalla y volver al menú principal? El progreso de esta partida se perderá.",
                "gearCloseSettings": "✕ CERRAR CONFIGURACIÓN", "heroRecruitedToast": "🎸 ¡{name} reclutado con éxito!", "heroUnlockCostPrompt": "🔒 Desbloquea por 🪙 {cost}",
                "missionsStatKillsLabel": "💀 Bajas Hordas:", "bossNameFormat": "👑 [JEFE] {name} TITÁN",
                "stageRuleAtLeastOneBasic": "⚠️ Regra do Palco: ¡Debes mantener al menos 1 ranura equipada con Ataque Básico!", "skillBadgeBasic": "⚡ BÁSICO", "skillBadgeDamage": "💥 DAÑO",
                "skillBadgeCrit": "🔮 CRÍTICO", "skillBadgeAoe": "💥 ÁREA", "skillBadgeStun": "💫 ATURDIMIENTO", "skillBadgeBurn": "🔥 QUEMADURA", "skillBadgeToxic": "☢️ TÓXICO",
                "skillBadgeLightning": "⚡ RAYO", "skillBadgeBuff": "🚀 MEJORA", "skillBadgeHeal": "💚 CURA", "skillBadgeShield": "🛡️ ESCUDO", "skillBadgeLifesteal": "🩸 VAMPIRISMO",
                "skillBadgeBleed": "🩸 SANGRADO", "skillBadgePierce": "🎸 PERFORACIÓN", "skillBadgeCataclysm": "👑 CATACLISMO", "skillBadgeSpecial": "⚡ ESPECIAL",
                "fretBasicBadge": "BÁSICO", "fretNoMpBadge": "⚡ SIN MANÁ", "inspectorLevel": "NIVEL {level} / {max}", "talentDmgBase": "+{amount} Daño Base",
                "talentCritDmg": "+{amount}% Daño Crítico", "talentChainLightning": "Rayos alcanzan hasta {amount} zombis adyacentes", "talentNoChain": "Sin rayos en cadena",
                "talentKnockback": "+{amount}% Fuerza de Empuje", "talentMaxHp": "+{amount} Vida Máxima", "rarity_common": "COMÚN", "rarity_rare": "RARO", "rarity_epic": "ÉPICO",
                "rarity_legendary": "LEGENDARIO", "rarity_mythic": "MÍTICO", "rarity_ancestral": "ANCESTRAL", "rarity_cosmic": "CÓSMICO", "rarity_divine": "DIVINO",
                "hero_johnny_blaze_title": "El Punk Rocker Clásico", "hero_johnny_blaze_inst": "Stratocaster \"Hellfire\"", "hero_johnny_blaze_pass_name": "Espíritu del Rock",
                "hero_johnny_blaze_pass_desc": "+1.0% de Daño y +0.4% de Daño Crítico por nivel (hasta +99% de daño y +89% de crítico en Nv. 100).",
                "hero_vulkan_ironhead_title": "El Pirómano de las Wastelands", "hero_vulkan_ironhead_inst": "Scrap-Metal V8 Llameante",
                "hero_vulkan_ironhead_pass_name": "Pirotecnia Brutal",
                "hero_vulkan_ironhead_pass_desc": "+1.0% de Daño, +0.3% de Regeneración de Maná y probabilidad de quemadura continua que crece con cada nivel.",
                "hero_dr_radix_title": "El Solista Bioquímico", "hero_dr_radix_inst": "Guitarratox \"Uranium-235\"", "hero_dr_radix_pass_name": "Radiación Acústica",
                "hero_dr_radix_pass_desc": "+1.0% de Daño, +0.35% de Perforación de Armadura y +0.12% de ralentización continua por nivel.",
                "hero_cypher_volt_title": "El Virtuoso Cibernético", "hero_cypher_volt_inst": "Laser-Caster Biónica Neón", "hero_cypher_volt_pass_name": "Overdrive Biónico",
                "hero_cypher_volt_pass_desc": "+1.1% de Daño y +0.6% de Daño Crítico por nivel, con arcos eléctricos devastadores en notas PERFECT.", "hero_kragthor_titan_title": "El Titán del Heavy Metal",
                "hero_kragthor_titan_inst": "Flying-V \"Magma Fury\"", "hero_kragthor_titan_pass_name": "Furia de los Titanes",
                "hero_kragthor_titan_pass_desc": "+1.15% de Daño, +0.85% de Daño Crítico por nivel y retroceso brutal contra zombis pesados.",
                "hero_roxie_anarchy_title": "La Valquiria del Punk Mítico", "hero_roxie_anarchy_inst": "Guitarra Custom \"Riot Slash\"", "hero_roxie_anarchy_pass_name": "Anarquía Absoluta",
                "hero_roxie_anarchy_pass_desc": "+1.20% de Daño, +0.70% de Daño Crítico, +0.25% de Oro Extra y +0.50% de Regen de Maná por nivel!",
                "hero_finn_punk_title": "El Campeón Multiversal del Sonido", "hero_finn_punk_inst": "Espada-Guitarra Sonora de Ooo", "hero_finn_punk_pass_name": "Hora del Rock Multiversal",
                "hero_finn_punk_pass_desc": "+1.22% de Daño, +0.75% de Daño Crítico y +0.3% de velocidad de proyectiles sónicos por nivel.",
                "hero_ignis_draco_title": "El Dragón Devorador de Riffs", "hero_ignis_draco_inst": "Guitarra Dracónica \"Inferno\"", "hero_ignis_draco_pass_name": "Aliento Ígneo Acústico",
                "hero_ignis_draco_pass_desc": "+1.26% de Daño, +0.82% de Daño Crítico y +0.35% de probabilidad de quemadura dracónica por nivel.",
                "hero_fenrir_howler_title": "La Bestia de Luna Llena del Metal", "hero_fenrir_howler_inst": "Axe-Star \"Lobo Nocturno\"",
                "hero_fenrir_howler_pass_name": "Frenesí de Luna de Sangre",
                "hero_fenrir_howler_pass_desc": "+1.30% de Daño, +0.90% de Daño Crítico y drenaje continuo de esencia vital zumbi por nivel.",
                "hero_spiky_sponge_title": "La Anarquía Amarilla de las Fosas", "hero_spiky_sponge_inst": "Flying-V a Reacción \"Fondo de Bikini\"",
                "hero_spiky_sponge_pass_name": "Propulsión Hipersónica",
                "hero_spiky_sponge_pass_desc": "+1.35% de Daño, +0.95% de Daño Crítico, +0.35% de Oro Extra y +0.60% de Regen de Maná por nivel!",
                "hero_saul_slash_title": "El Dios Inmortal del Sombrero & Les Paul", "hero_saul_slash_inst": "Gibson Les Paul Goldtop Sagrada \"1959\"",
                "hero_saul_slash_pass_name": "Apetito por la Destrucción",
                "hero_saul_slash_pass_desc": "+1.45% de Daño, +1.10% de Daño Crítico, +0.45% de Oro Extra y +0.70% de Regen de Maná por nivel! El ápice del poder musical.",
                "zombie_punk_walker": "Zombi Punk Rocker", "zombie_feral_leaper": "Corredor Saltador", "zombie_toxic_mutant": "Mutante Radiactivo",
                "zombie_armored_soldier": "Sargento Blindado", "zombie_fungal_spore": "Infectado Espora", "zombie_bloater_pounder": "Gordo Devorador",
                "zombie_chained_gladiator": "Gladiador del Asfalto", "zombie_toxic_hazmat": "Operario Hazmat", "zombie_clown_jester": "Payaso Siniestro",
                "zombie_builder_demolisher": "Operario Demoledor", "zombie_mad_scientist": "Científico Loco", "zombie_inferno_firefighter": "Bombero Zombi",
                "zombie_sheriff_walker": "Sheriff Superviviente", "zombie_presidential_politician": "Político Presidencial", "zombie_dark_knight_undead": "Caballero Oscuro No-Muerto",
                "zombie_god_of_war_spartan": "Fantasma Espartano", "zombie_badge_normal": "Normal / Punk", "zombie_badge_agile": "Ágil / Salto Aéreo",
                "zombie_badge_tank": "Tanque / Devastador", "zombie_badge_armored": "Blindado / Carga", "zombie_badge_spore": "Hongo / Regenerativo",
                "zombie_badge_colossus": "Coloso / Sísmico", "zombie_badge_gladiator": "Gladiador / Desvío", "zombie_badge_toxic": "Químico / Charco Ácido",
                "zombie_badge_maniac": "Maníaco / Garras", "zombie_badge_demolition": "Demolición / Pesado", "zombie_badge_viral": "Viral / Químico",
                "zombie_badge_firefighter": "Ignífugo / Blindado", "zombie_badge_sheriff": "Sheriff / Hachazo", "zombie_badge_politician": "Político / Mitin",
                "zombie_badge_batman": "Murciélago / Capa", "zombie_badge_spartan": "Espartano / Furia", "statSpeedUnit": "Velocidad: {speed} px/s", "statDmgUnit": "Daño: {dmg}",
                "specialChip": "🔥 Especial: {duration}s (límite {max}s)", "specialActiveChip": "🔥 Especial: {duration}s",
            },
            'fr': {
                "menuGoldTitle": "Or Collecté", "menuScoreTitle": "Meilleur Score", "menuKillsTitle": "Zombies Détruits", "menuSoundToggleTitle": "Activer/Couper le Son",
                "menuSub": "HEAVY METAL APOCALYPSE", "menuStageTag": "🎸 TOURNÉE MONDIALE DES DAMNÉS",
                "menuStageDesc": "Armez votre guitare saturée, anéantissez des hordes de zombies en temps réel et dominez la scène avec des riffs mortels !", "btnPlay": "CAMPAGNE",
                "dockBattle": "BATAILLE", "dockCampaign": "CAMPAGNE", "dockShop": "Boutique", "dockTalents": "Talents", "dockPvp": "PvP", "dockMissions": "Missions", "dockStudio": "Studio",
                "btnShop": "BOUTIQUE DES GUITARISTES", "shopTitle": "🛒 BOUTIQUE DES GUITARISTES", "shopSub": "ENGAGEZ LES PLUS GRANDES LÉGENDES DU ROCK POUR ÉCRASER LA HORDE !",
                "shopEquipped": "ÉQUIPÉ", "shopEquip": "ÉQUIPER", "shopBuy": "ACHETER", "btnTalents": "ARBRE DE TALENTS", "btnMissions": "MISSIONS & CHASSE AUX ZOMBIES",
                "btnStudio": "STUDIO DE MUSIQUE & RYTHME", "btnSettings": "PARAMÈTRES", "btnPvP": "⚔️ DUEL EN LIGNE PVP",
                "menuFooter": "Guitar vs Zombies v1.9.7 (Build 61) • Expérience AAA Audio & Action", "mapBack": "⬅️ Retour", "mapTitle": "PRÉPARATION DU COMBAT",
                "mapSub": "CONFIGUREZ VOTRE CONCERT ET DÉCOUVREZ LA HORDE", "sectionStage": "🗺️ Étape Actuelle", "btnPrevStage": "Étape Précédente", "btnNextStage": "Étape Suivante",
                "sectionArena": "🏟️ Arène du Concert", "badgeRandom": "🎲 Aléatoire", "sectionHero": "🎸 Guitariste", "btnPrevHero": "Guitariste Précédent",
                "btnNextHero": "Guitariste Suivant", "heroPassiveTag": "PASSIF :", "btnHeroLevelUp": "⬆️ AMÉLIORER NIVEAU", "sectionHorde": "🧟 Horde Ennemie",
                "hordeCountTag": "5 Sélectionnés", "sectionSkills": "⚡ Compétences par Piste", "skillsHint": "Touchez pour Équiper", "sectionSong": "🎵 Bande-Son",
                "btnPrevSong": "Piste Précédente", "btnNextSong": "Piste Suivante", "songActivePill": "EN COURS", "btnStartBattle": "🔥 LANCER LE COMBAT !", "combatZone": "Zone de Combat",
                "rhythmZone": "Solo de Guitare", "scoreLabel": "POINTS", "killsLabel": "ZOMBIES", "rockLabel": "ROCK", "rockManaLabel": "⚡ MANA ROCK",
                "btnSoundTitle": "Activer/Couper le Son", "btnStatsTitle": "Statistiques du Combat (SS)", "btnSpecialTitle": "Activer Spécial 2x (Espace / Touche)",
                "specialBtnTitle": "SPÉCIAL", "btnGearTitle": "Paramètres & Pause", "scorePillTitle": "Score Actuel", "comboPillTitle": "Combo Actuel", "comboText": "COMBO",
                "highwayDivider": "🎸 SOLO RHYTHM HIGHWAY - JOUEZ EN RYTHME ! 🎸", "btnExitSong": "✕ QUITTER", "btnExitSongTitle": "Quitter le Morceau",
                "talentTitle": "🎸 ARBRE DE TALENTS", "talentUpgrades": "Améliorations :", "tabOffense": "🔥 OFFENSIF", "tabDefense": "🛡️ DÉFENSIF", "tabRhythm": "⚡ RYTHME & OR",
                "effectCurrent": "Effet Actuel :", "effectNext": "Prochain Niveau :", "btnUpgrade": "AMÉLIORER", "noBonus": "Aucun bonus", "maxLevelReached": "Niveau Maximum Atteint !",
                "requiresPrereq": "🔒 Requis : {name} Niv. {level}", "needGold": "MANQUE {amount} 🪙", "locked": "VERROUILLÉ", "maxLevel": "NIVEAU MAX",
                "studioTitle": "🎵 STUDIO DE MUSIQUE & RYTHME", "studioSubtitle": "Créez, éditez et partagez vos morceaux dans le jeu !", "tabMySongs": "📂 MES MORCEAUX",
                "tabNewSong": "➕ NOUVEAU MORCEAU", "tabImportExport": "📥 IMPORTER / EXPORTER", "labelAlbumCover": "Pochette d'Album (Image) :", "btnChooseImage": "📷 Choisir une Image",
                "labelAudioFile": "Fichier Audio (.mp3, .wav, .ogg, .m4a) :", "btnChooseAudio": "📁 Choisir un Fichier Audio", "noAudioSelected": "Aucun audio sélectionné",
                "labelSongTitle": "Titre du Morceau :", "phSongTitle": "Ex: Through the Fire and Flames", "labelSongArtist": "Artiste / Auteur :", "phSongArtist": "Ex: DragonForce",
                "labelBpm": "BPM (Tempo du Morceau) :", "tapTempoTitle": "Tapez en rythme pour calculer le BPM", "btnTapTempo": "🖐️ TAP TEMPO", "labelSongDesc": "Description du Morceau :",
                "phSongDesc": "Décrivez votre morceau, style ou défi rythmique...", "labelInitialPattern": "Rythme Initial :",
                "optEmptyPattern": "Commencer Rythme Vide (Mapper dans l'Éditeur)", "optAutogenPattern": "Générer Rythme Automatique par BPM",
                "btnCreateSong": "🚀 CRÉER MORCEAU & OUVRIR ÉDITEUR", "importTitle": "📥 Importer un Morceau (.gvsong / .json / Audio)",
                "importDesc": "Importez des packs musicaux (.gvsong / .json) ou fichiers audio (.mp3, .wav, .ogg, .m4a) directement dans le jeu ! Vous pouvez aussi glisser-déposer le fichier ici.",
                "btnChoosePackage": "📂 Choisir un Pack .gvsong ou Audio", "exportTitle": "💾 Comment Exporter et Partager ?", "exportStep1": "1. Allez dans l'onglet <b>MES MORCEAUX</b>.",
                "exportStep2": "2. Cliquez sur <b>EXPORTER</b> sur la fiche du morceau.", "exportStep3": "3. Un fichier <code>.gvsong</code> sera téléchargé, prêt à être partagé !",
                "studioPlay": "▶️ JOUER", "studioEdit": "✏️ MODIFIER", "studioExport": "💾 EXPORTER", "studioSync": "⚡ VERS SERVEUR", "studioLoading": "Chargement des morceaux...",
                "studioEmpty": "Aucun morceau trouvé. Créez-en un ou importez-en un !", "editorSnap": "Grille :", "editorSpeed": "Vitesse :", "editorNormal": "🎵 Normale",
                "editorHold": "〰️ Maintenue", "editorHoldDuration": "Durée :", "editorUndo": "↩️ Annuler", "editorAutoBpm": "⚡ Auto-BPM", "editorClear": "🗑️ Effacer",
                "editorSave": "💾 ENREGISTRER", "editorSavePlay": "🚀 ENREGISTRER & JOUER", "editorScrubberLabel": "⏱️ Curseur Temporel :",
                "editorInstructions": "Touchez les pistes pour ajouter/supprimer des notes, ou utilisez <b>REC</b> pour enregistrer en rythme !", "laneGreen": "VERT [A]",
                "laneRed": "ROUGE [S]", "laneYellow": "JAUNE [D]", "laneBlue": "BLEU [F]", "victoryTitle": "🏆 VICTOIRE ! CONCERT ACCOMPLI !",
                "victoryBannerTitle": "👑 CONCERT ACCOMPLI ! 🎸", "victoryBannerSub": "⚡ HORDE PULVÉRISÉE • OVATION DE LA FOULE ! ⚡", "statAccuracy": "Précision",
                "statNotesHit": "Notes Réussies", "statZombiesKilled": "Zombies Vaincus", "statMaxStreak": "Série Maximale", "statGoldGained": "Or Obtenu",
                "statScoreGained": "Score du Match", "btnPlayAgain": "🔄 REJOUER", "btnMainMenu": "🏠 MENU PRINCIPAL", "defeatTitle": "☠️ DÉFAITE ! LA SCÈNE A ÉTÉ ENVAHIE !",
                "defeatBannerTitle": "⚡ AMPLI DÉTRUIT ! ⚡", "defeatBannerSub": "☠️ SILENCE SUR SCÈNE • LA HORDE A TRIOMPHÉ ☠️",
                "defeatSub": "Votre énergie s'est épuisée et les zombies ont stoppé le concert !", "statDamageDealt": "Dégâts Infligés", "statGoldCollected": "Or Collecté",
                "statScoreReached": "Score Atteint", "btnRetry": "🔄 RÉESSAYER", "pvpSelectSongTitle": "⚔️ DUEL PVP EN LIGNE",
                "pvpSelectSongSubtitle": "Choisissez le morceau pour disputer le duel :", "pvpStartSearch": "TROUVER UN MATCH ⚡", "pvpMatchmakingTitle": "RECHERCHE D'ADVERSAIRE...",
                "pvpConnecting": "Connexion au serveur SA-East (São Paulo)...", "pvpSearching": "Recherche de guitaristes au même rang de trophées...",
                "pvpOpponentFound": "🎯 ADVERSAIRE TROUVÉ !", "pvpStartingIn": "Duel commence dans : ", "pvpCancel": "ANNULER",
                "pvpConfrontLine": "⚡ LIGNE DE CONFRONTATION • TIRS LIBRES SOIGNENT LES ZOMBIES ADVERSES ⚡", "pvpWinTitle": "🏆 VICTOIRE EN DUEL PVP !",
                "pvpDefeatTitle": "☠️ DÉFAITE EN DUEL PVP !", "pvpWinKo": "L'adversaire a été submergé par la horde de zombies !",
                "pvpLoseKo": "Votre défense a cédé et les zombies ont envahi la scène !", "pvpWinScore": "Victoire par Maîtrise Rythmique et Meilleur Score !",
                "pvpLoseScore": "L'adversaire a obtenu un score plus élevé !", "pvpTrophies": "Trophées", "pvpOverHeals": "Soins Ennemis Générés", "ssTitle": "📊 STATISTIQUES DE COMBAT",
                "ssSub": "Performance en temps réel de l'affrontement", "ssHeroHp": "PV DU GUITARISTE", "ssMatchTime": "TEMPS DE COMBAT", "ssTotalDamage": "Dégâts Totaux Infligés",
                "ssZombiesKilled": "Zombies Vaincus", "ssMaxStreak": "Série Maximale", "ssCurrentMultiplier": "Multiplicateur Actuel", "ssCurrentScore": "Score Actuel",
                "ssMatchCoins": "Or de cette Partie", "ssAccuracyJudging": "Précision & Jugement des Notes", "btnResumeBattle": "REPRENDRE LE JEU", "gearTitle": "⚙️ OPTIONS & PAUSE",
                "gearLangLabel": "Langue / Language :", "gearSoundLabel": "Son du Jeu :", "gearToggleSound": "Activer/Couper le Son",
                "gearDangerWarning": "⚠️ Retourner au Menu Principal mettra fin au combat et les données de la partie seront perdues !",
                "gearAbandon": "🚨 Retourner au Menu Principal (abandon)", "gearResume": "▶️ Continuer la Partie", "skillEquipTitle": "⚡ Équiper sur la Piste {lane}",
                "btnRestoreDefault": "↺ Par Défaut", "skillRuleNotice": "<strong>Règle de Scène :</strong> Il est obligatoire de garder au moins 1 piste avec l'Attaque de Base !",
                "skillPickPrompt": "Choisissez la compétence activée en réussissant des notes sur cette piste :", "skillEquippedTag": "✅ Équipée sur cette piste",
                "skillBlockedTag": "🔒 Bloqué : Gardez ≥ 1 Attaque de Base", "missionsTitle": "🎯 MISSIONS & OBJECTIFS DE SCÈNE",
                "missionsSub": "Éliminez des zombies et maîtrisez les guitaristes pour débloquer des paliers procéduraux (10 ➔ 100 ➔ 1k ➔ 10k ➔ 100k) !",
                "tabZombieHordes": "🧟 Hordes Zombies", "tabGuitarists": "🎸 Guitaristes", "tabPerformance": "⚡ Rythme & Combat", "tabPvP": "⚔️ Duel PvP",
                "statKillsHordes": "💀 Kills Hordes :", "statKillsHeroes": "🎸 Kills Héros :", "statRhythmActions": "⚡ Actions Rythme :", "statWalletGold": "💰 Portefeuille :",
                "statInventoryXp": "✨ XP Stockée :", "statMissionsGold": "🪙 Or Collecté :", "statMasters": "👑 Maîtres (100k) :", "btnClaimAll": "✨ TOUT RÉCUPÉRER",
                "btnClaimCount": "✨ RÉCUPÉRER ({count})", "filterAll": "Tous", "filterReady": "Prêts ✨", "filterActive": "En Cours 🔒", "filterCompleted": "Maîtres 👑",
                "phSearchMissions": "🔍 Chercher un zombie par nom ou type...", "noMissionsFound": "Aucune mission trouvée pour le filtre sélectionné.",
                "milestoneReward": "RÉCOMPENSE DU PALIER :", "heroMastery": "MAÎTRISE DU GUITARISTE :", "perfMilestone": "PALIER DE PERFORMANCE :", "masterHunter": "MAÎTRE CHASSEUR",
                "rockLegend": "LÉGENDE DU ROCK", "supremeMastery": "MAÎTRISE SUPRÊME", "completedUnits": "{target} {unit} Complétés !", "claim": "RÉCUPÉRER", "target": "Objectif :",
                "goldUnit": "Or", "menuXpTitle": "Inventaire d'XP", "xpInventoryLabel": "XP dans l'Inventaire :", "btnInjectXp": "✨ INJECTER XP (+{amount} XP)",
                "btnInjectLevelUp": "✨ INJECTER XP (+1 NIVEAU)", "noXpInInventory": "✨ AUCUNE XP DANS L'INVENTAIRE", "heroMaxLevel": "⭐ NIVEAU MAXIMUM (100)",
                "heroLevelUp": "⬆️ AMÉLIORER NIVEAU (🪙 {cost})", "heroUnlock": "🪙 DÉBLOQUER GUITARISTE (🪙 {cost})", "heroLocked": "🔒 GUITARISTE VERROUILLÉ",
                "heroUnlockCost": "Coût : 🪙 {cost} Or", "heroLevelBadge": "⭐ NIVEAU {lvl} / 100", "heroMaxXp": "MAX", "bossBadge": "👑 BOSS (2x OR/XP)", "targetsUnit": "Cibles",
                "stagePrefix": "Étape {stage}", "bossShowdown": "Étape {stage} : 👑 COMBAT DE BOSS : {name} !", "map_void_name": "The Void Club",
                "map_void_sub": "Club Souterrain & Décombres Urbains", "map_void_desc": "Façade du pub mythique underground \"The Void\", barricades de béton et bus blindé abandonné.",
                "map_void_badge": "URBAIN", "map_ruins_name": "Scène des Décombres", "map_ruins_sub": "Arène Centrale de l'Apocalypse",
                "map_ruins_desc": "Scène métallique détruite au cœur des ruines urbaines, entourée d'amplis et de fumée.", "map_ruins_badge": "CONCERT",
                "map_wasteland_name": "Wasteland du Metal", "map_wasteland_sub": "Désert Anarchique & Station Toxique",
                "map_wasteland_desc": "Autoroute aride style Mad Max, station fortifiée, cactus et ferraille sous tempête de sable.", "map_wasteland_badge": "DÉSERT",
                "map_thermopylae_name": "Défilé de Sparte", "map_thermopylae_sub": "Le Défilé des 300 & Mur de Riffs",
                "map_thermopylae_desc": "Le légendaire défilé grec fortifié contre les morts avec boucliers spartiates et tours d'amplis.", "map_thermopylae_badge": "SPARTE",
                "map_coliseum_name": "Colisée Impérial", "map_coliseum_sub": "L'Arène Romaine des Gladiateurs",
                "map_coliseum_desc": "Les ruines antiques de Rome transformées en scène suprême où les gladiateurs affrontaient les zombies au son de solos impitoyables.",
                "map_coliseum_badge": "COLISÉE", "map_bikini_bottom_name": "Fosse Sous-Marine", "map_bikini_bottom_sub": "Les Profondeurs Toxiques du Crabe Croustillant",
                "map_bikini_bottom_desc": "L'emblématique fosse sous-marine polluée par des déchets toxiques, repaire du punk aquatique.", "map_bikini_bottom_badge": "FOSSE",
                "map_valhalla_name": "Fjord du Valhalla", "map_valhalla_sub": "Le Fjord Glacé d'Odin",
                "map_valhalla_desc": "Pics glacés, drakkars et remparts nordiques où les guerriers vikings font résonner des riffs ancestraux dans la glace.",
                "map_valhalla_badge": "VIKING", "map_stadium_name": "Stade Dévasté", "map_stadium_sub": "Le Chaudron Dévasté du Rock",
                "map_stadium_desc": "Un ancien stade colossal en ruines où les foules s'affrontent dans des mosh pits mortels.", "map_stadium_badge": "STADE",
                "mk1Sub": "PREMIÈRE VICTIME ! 🔥", "mk2Sub": "RYTHME EN HAUSSE ! ⚡", "mk3Sub": "TRIPLE CARNAGE ! 💥", "mk4Sub": "MASSACRE SUR SCÈNE ! 🎸",
                "mk5Sub": "ADRÉNALINE MAXIMALE ! ⚡", "mk6Sub": "DIEU DU ROCK AND ROLL ! 🤘", "mk7Sub": "LÉGENDAIRE & INVINCIBLE ! 👑", "btnClose": "Fermer",
                "btnPvPRematch": "⚔️ NOUVEAU DUEL", "btnPvPClose": "RETOUR AU MENU", "pvpPreBattleTitle": "⚔️ DUEL PVP EN LIGNE",
                "pvpPreBattleSubtitle": "Personnalisez votre Guitariste, Compétences et Morceau pour l'affrontement :", "pvpHeroLabel": "🎸 VOTRE GUITARISTE",
                "pvpSkillsLabel": "⚡ COMPÉTENCES PAR PISTE", "pvpSkillsHint": "Touchez pour changer", "pvpSongLabel": "🎵 MORCEAU DU DUEL", "statPvPActions": "Actions PvP",
                "pvpGoldTag": "OR", "pvpHeroXpTag": "XP HÉROS", "pvpLocating": "Recherche d'un adversaire compatible...", "pvpYou": "Vous", "levelShort": "Niv.",
                "pvpChosenSongBadge": "🎵 Morceau : {song} ({bpm} BPM)", "countdownGetReady": "🎸 PRÉPARATION", "countdownSubtitle": "POSITIONNEZ VOS DOIGTS !",
                "countdownStart5": "PRÉPAREZ-VOUS !", "countdownStart4": "POSITIONNEZ VOS DOIGTS !", "countdownStart3": "ACCORDEZ LES CORDES !", "countdownStart2": "ATTENTION !",
                "countdownStart1": "PRESQUE PRÊT !", "countdownResume5": "REPRISE DU MATCH !", "countdownResume3": "YEUX SUR LA PISTE !", "countdownModeResume": "⏸️ REPRENDRE",
                "countdownModePrep": "🎸 PRÉPARATION", "countdownGo": "À VOUS DE JOUER !", "specialUsed": "UTILISÉ ✖", "specialReady": "PRÊT ! ⚡", "specialEnded": "⚡ SPÉCIAL TERMINÉ !",
                "bossSpawned": "⚠️ BOSS TITAN APPARU ! 👑", "missLabel": "RATÉ ! 💨", "perfectStreakCrit": "🎯 5x PERFECT ! PROCHAIN CRITIQUE !", "noMpBasic": "⚡ PAS DE MANA ! (BASE)",
                "levelUpToast": "⭐ NIVEAU {level} ! UP !", "stageCompletedToast": "🏆 ÉTAPE {stage} TERMINÉE !", "rockNeverDies": "⚡ ROCK NEVER DIES ! ⚡", "heroRevived": "⚡ RESSUSCITÉ ! ⚡",
                "barrierReady": "🛡️ BOUCLIER PRÊT !", "chainDeflected": "🛡️ CHAÎNE DÉVIÉE !", "helmetBroken": "🛡️ CASQUE BRISÉ ! ÉTOURDI !", "burningStatus": "🔥 EN FEU !",
                "immuneStatus": "⚡ IMMUNISÉ !", "blockedStatus": "🛡️ BLOQUÉ !", "critReadyTag": " • 💥 CRITIQUE PRÊT !", "insufficientGold": "Or insuffisant !",
                "errorInjectXp": "Erreur lors de l'injection d'XP !",
                "abandonBattleConfirm": "⚠️ Êtes-vous sûr de vouloir abandonner le combat et retourner au menu principal ? La progression actuelle sera perdue.",
                "gearCloseSettings": "✕ FERMER PARAMÈTRES", "heroRecruitedToast": "🎸 {name} recruté avec succès !", "heroUnlockCostPrompt": "🔒 Débloquez pour 🪙 {cost}",
                "missionsStatKillsLabel": "💀 Kills Hordes :", "bossNameFormat": "👑 [BOSS] {name} TITAN",
                "stageRuleAtLeastOneBasic": "⚠️ Règle de Scène : Vous devez garder au moins 1 emplacement avec l'Attaque de Base !", "skillBadgeBasic": "⚡ BASE",
                "skillBadgeDamage": "💥 DÉGÂTS", "skillBadgeCrit": "🔮 CRITIQUE", "skillBadgeAoe": "💥 ZONE", "skillBadgeStun": "💫 ÉTOURDISSEMENT", "skillBadgeBurn": "🔥 BRÛLURE",
                "skillBadgeToxic": "☢️ TOXIQUE", "skillBadgeLightning": "⚡ ÉCLAIR", "skillBadgeBuff": "🚀 BUFF", "skillBadgeHeal": "💚 SOIN", "skillBadgeShield": "🛡️ BOUCLIER",
                "skillBadgeLifesteal": "🩸 VOL DE VIE", "skillBadgeBleed": "🩸 SAIGNEMENT", "skillBadgePierce": "🎸 PERCÉE", "skillBadgeCataclysm": "👑 CATACLYSME",
                "skillBadgeSpecial": "⚡ SPÉCIAL", "fretBasicBadge": "BASE", "fretNoMpBadge": "⚡ SANS MANA", "inspectorLevel": "NIVEAU {level} / {max}",
                "talentDmgBase": "+{amount} Dégâts de Base", "talentCritDmg": "+{amount}% Dégâts Critiques", "talentChainLightning": "Éclairs touchent jusqu'à {amount} zombies adjacents",
                "talentNoChain": "Sans éclairs en chaîne", "talentKnockback": "+{amount}% Force de Repoussement", "talentMaxHp": "+{amount} Vie Maximale", "rarity_common": "COMMUN",
                "rarity_rare": "RARE", "rarity_epic": "ÉPIQUE", "rarity_legendary": "LÉGENDAIRE", "rarity_mythic": "MYTHIQUE", "rarity_ancestral": "ANCESTRAL", "rarity_cosmic": "COSMIQUE",
                "rarity_divine": "DIVIN", "hero_johnny_blaze_title": "Le Punk Rocker Classique", "hero_johnny_blaze_inst": "Stratocaster \"Hellfire\"",
                "hero_johnny_blaze_pass_name": "Esprit du Rock",
                "hero_johnny_blaze_pass_desc": "+1.0% de Dégâts et +0.4% de Dégâts Critiques par niveau (jusqu'à +99% dégâts et +89% critique au Niv. 100).",
                "hero_vulkan_ironhead_title": "Le Pyromane des Wastelands", "hero_vulkan_ironhead_inst": "Scrap-Metal V8 Enflammé", "hero_vulkan_ironhead_pass_name": "Pyrotechnie Brutale",
                "hero_vulkan_ironhead_pass_desc": "+1.0% de Dégâts, +0.3% Régénération Mana et chance de brûlure continue augmentant par niveau.",
                "hero_dr_radix_title": "Le Soliste Biochimique", "hero_dr_radix_inst": "Guitarratox \"Uranium-235\"", "hero_dr_radix_pass_name": "Radiation Acoustique",
                "hero_dr_radix_pass_desc": "+1.0% de Dégâts, +0.35% de Pénétration d'Armure et +0.12% de ralentissement continu par niveau.",
                "hero_cypher_volt_title": "Le Virtuose Cybernétique", "hero_cypher_volt_inst": "Laser-Caster Bionique Néon", "hero_cypher_volt_pass_name": "Overdrive Bionique",
                "hero_cypher_volt_pass_desc": "+1.1% de Dégâts et +0.6% de Dégâts Critiques par niveau, avec des arcs électriques sur notes PERFECT.", "hero_kragthor_titan_title": "Le Titan du Heavy Metal",
                "hero_kragthor_titan_inst": "Flying-V \"Magma Fury\"", "hero_kragthor_titan_pass_name": "Fureur des Titans",
                "hero_kragthor_titan_pass_desc": "+1.15% de Dégâts, +0.85% de Dégâts Critiques par niveau et recul brutal contre les zombies lourds.",
                "hero_roxie_anarchy_title": "La Walkyrie du Punk Mythique", "hero_roxie_anarchy_inst": "Guitare Custom \"Riot Slash\"", "hero_roxie_anarchy_pass_name": "Anarchie Absolue",
                "hero_roxie_anarchy_pass_desc": "+1.20% de Dégâts, +0.70% Dégâts Critiques, +0.25% d'Or Bonus et +0.50% Régén Mana par niveau !",
                "hero_finn_punk_title": "Le Champion Multiversel du Son", "hero_finn_punk_inst": "Épée-Guitare Sonore d'Ooo", "hero_finn_punk_pass_name": "L'Heure du Rock Multiversel",
                "hero_finn_punk_pass_desc": "+1.22% de Dégâts, +0.75% Dégâts Critiques et +0.3% de vitesse des projectiles soniques par niveau.",
                "hero_ignis_draco_title": "Le Dragon Dévoreur de Riffs", "hero_ignis_draco_inst": "Guitare Draconique \"Inferno\"", "hero_ignis_draco_pass_name": "Souffle Igné Acoustique",
                "hero_ignis_draco_pass_desc": "+1.26% de Dégâts, +0.82% Dégâts Critiques et +0.35% de chance de brûlure draconique par niveau.",
                "hero_fenrir_howler_title": "La Bête de Pleine Lune du Metal", "hero_fenrir_howler_inst": "Axe-Star \"Loup de la Nuit\"",
                "hero_fenrir_howler_pass_name": "Frénésie de Lune de Sang",
                "hero_fenrir_howler_pass_desc": "+1.30% de Dégâts, +0.90% Dégâts Critiques et drainage continu d'essence vitale par niveau.",
                "hero_spiky_sponge_title": "L'Anarchie Jaune des Abysses", "hero_spiky_sponge_inst": "Flying-V à Réaction \"Bikini Bottom\"",
                "hero_spiky_sponge_pass_name": "Propulsion Hypersonique",
                "hero_spiky_sponge_pass_desc": "+1.35% de Dégâts, +0.95% Dégâts Critiques, +0.35% d'Or Bonus et +0.60% Régén Mana par niveau !",
                "hero_saul_slash_title": "Le Dieu Immortel au Haut-de-Forme & Les Paul", "hero_saul_slash_inst": "Gibson Les Paul Goldtop Sacrée \"1959\"",
                "hero_saul_slash_pass_name": "Appétit pour la Destruction",
                "hero_saul_slash_pass_desc": "+1.45% de Dégâts, +1.10% Dégâts Critiques, +0.45% d'Or Bonus et +0.70% Régén Mana par niveau ! Le summum musical.",
                "zombie_punk_walker": "Zombie Punk Rocker", "zombie_feral_leaper": "Coureur Sauteur", "zombie_toxic_mutant": "Mutant Radioactif", "zombie_armored_soldier": "Sergent Blindé",
                "zombie_fungal_spore": "Infecté par Spores", "zombie_bloater_pounder": "Gros Dévoreur", "zombie_chained_gladiator": "Gladiateur du Bitume",
                "zombie_toxic_hazmat": "Ouvrier Hazmat", "zombie_clown_jester": "Clown Sinistre", "zombie_builder_demolisher": "Ouvrier Démolisseur", "zombie_mad_scientist": "Savant Fou",
                "zombie_inferno_firefighter": "Pompier Zombie", "zombie_sheriff_walker": "Shérif Survivant", "zombie_presidential_politician": "Politicien Présidentiel",
                "zombie_dark_knight_undead": "Chevalier Noir Mort-Vivant", "zombie_god_of_war_spartan": "Fantôme Spartiate", "zombie_badge_normal": "Normal / Punk",
                "zombie_badge_agile": "Agile / Saut Aérien", "zombie_badge_tank": "Tank / Dévastateur", "zombie_badge_armored": "Blindé / Charge",
                "zombie_badge_spore": "Fongique / Régénérant", "zombie_badge_colossus": "Colosse / Sismique", "zombie_badge_gladiator": "Gladiateur / Déviation",
                "zombie_badge_toxic": "Chimique / Flaque d'Acide", "zombie_badge_maniac": "Maniaque / Griffes", "zombie_badge_demolition": "Démolition / Lourd",
                "zombie_badge_viral": "Viral / Chimique", "zombie_badge_firefighter": "Ignifuge / Blindé", "zombie_badge_sheriff": "Shérif / Coup de Hache",
                "zombie_badge_politician": "Politicien / Discours", "zombie_badge_batman": "Chauve-souris / Cape", "zombie_badge_spartan": "Spartiate / Furie",
                "statSpeedUnit": "Vitesse : {speed} px/s", "statDmgUnit": "Dégâts : {dmg}", "specialChip": "🔥 Spécial : {duration}s (max {max}s)",
                "specialActiveChip": "🔥 Spécial : {duration}s",
            }
        };
    }

    detectInitialLanguage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('gvs_language');
                if (saved === 'pt' || saved === 'en' || saved === 'es' || saved === 'fr') return saved;
            }
            if (typeof navigator !== 'undefined' && navigator.language) {
                const browserLang = navigator.language.toLowerCase();
                if (browserLang.startsWith('pt')) return 'pt';
                if (browserLang.startsWith('es')) return 'es';
                if (browserLang.startsWith('fr')) return 'fr';
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

    registerPack(pack) {
        if (!pack || typeof pack !== 'object') return;
        Object.keys(pack).forEach(lang => {
            if (this.translations[lang] && pack[lang]) Object.assign(this.translations[lang], pack[lang]);
        });
    }

    onLanguageChange(fn) {
        if (typeof fn === 'function') this.listeners.push(fn);
    }

    notifyListeners() {
        this.listeners.forEach(fn => {
            try { fn(this.currentLang); } catch(e) { console.warn('i18n listener error:', e); }
        });
        if (typeof window === 'undefined') return;
        const g = window.game;
        if (g) {
            try {
                if (typeof g.updateStageUI === 'function') g.updateStageUI();
                if (typeof g.renderStageDropdown === 'function') g.renderStageDropdown();
                if (typeof g.renderHeroRoster === 'function') g.renderHeroRoster();
                if (typeof g.renderArenaRoster === 'function') g.renderArenaRoster();
                if (typeof g.renderMapZombies === 'function') g.renderMapZombies();
                if (typeof g.renderLaneSkills === 'function') g.renderLaneSkills();
                if (typeof g.renderSongRoster === 'function') g.renderSongRoster();
                if (typeof g.updateMapSongDetailsUI === 'function' && g.selectedSong) g.updateMapSongDetailsUI(g.selectedSong);
                if (typeof g.updateBattleStatsModal === 'function') g.updateBattleStatsModal();
                const gear = document.getElementById('battle-gear-modal');
                if (gear && gear.classList && gear.classList.contains('open') && typeof g.refreshGearModalText === 'function') g.refreshGearModalText();
                if (g.pvpSystem) {
                    if (typeof g.pvpSystem.populateHeroDropdown === 'function') g.pvpSystem.populateHeroDropdown();
                    if (typeof g.pvpSystem.updateHeroCardPreview === 'function') g.pvpSystem.updateHeroCardPreview();
                    if (typeof g.pvpSystem.updateSongCardPreview === 'function' && g.pvpSystem.selectedSong) g.pvpSystem.updateSongCardPreview(g.pvpSystem.selectedSong);
                    if (typeof g.pvpSystem.renderPvPLaneSkills === 'function') g.pvpSystem.renderPvPLaneSkills();
                }
            } catch(e) { console.warn('Game i18n re-render error:', e); }
        }
        try {
            if (window.guitaristPool && typeof window.guitaristPool.renderShop === 'function') window.guitaristPool.renderShop();
            if (window.droneSystem) {
                if (typeof window.droneSystem.renderPreBattleDroneCard === 'function') window.droneSystem.renderPreBattleDroneCard();
                if (typeof window.droneSystem.renderShopDrones === 'function') window.droneSystem.renderShopDrones();
                if (typeof window.droneSystem.populatePvPDroneDropdown === 'function') window.droneSystem.populatePvPDroneDropdown();
                if (typeof window.droneSystem.updatePvPDroneCardPreview === 'function') window.droneSystem.updatePvPDroneCardPreview();
            }
            if (window.metaMissionSystem && typeof window.metaMissionSystem.render === 'function') window.metaMissionSystem.render();
            if (window.talentSystem && typeof window.talentSystem.updateUI === 'function') window.talentSystem.updateUI();
            if (window.songStudio && typeof window.songStudio.renderLibrary === 'function') window.songStudio.renderLibrary();
            if (window.songEditor && window.songEditor.song) {
                if (typeof window.songEditor.updateHeaderInfo === 'function') window.songEditor.updateHeaderInfo();
                if (typeof window.songEditor.updateStatsDisplay === 'function') window.songEditor.updateStatsDisplay();
                if (typeof window.songEditor.drawTimeline === 'function') window.songEditor.drawTimeline();
            }
            if (window.specialSystem && typeof window.specialSystem.updateUI === 'function') window.specialSystem.updateUI();
            if (window.countdownSystem && window.countdownSystem.isActive) window.countdownSystem.updateSecondUI(window.countdownSystem.currentSecond);
        } catch(e) {}
    }

    updateDOM() {
        if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

        // Update html lang attribute
        const htmlEl = document.documentElement;
        if (htmlEl) {
            const langMap = { 'pt': 'pt-BR', 'en': 'en', 'es': 'es', 'fr': 'fr' };
            htmlEl.setAttribute('lang', langMap[this.currentLang] || 'pt-BR');
        }

        // Translate text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.t(key);
            if (val && val !== key) {
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

        // Sync audio toggle text inside Gear Modal
        const soundBtn = document.getElementById('menu-sound-toggle');
        if (soundBtn) {
            const muted = (typeof window !== 'undefined' && window.soundEngine && window.soundEngine.isMuted);
            soundBtn.innerText = muted ? this.t('soundMuted', 'Mutado 🔇') : this.t('soundActive', 'Ativo 🔊');
        }
    }

    updateButtonsUI() {
        if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

        // Active state on all language selector buttons
        document.querySelectorAll('.lang-btn, .gear-lang-group .gear-btn-choice').forEach(btn => {
            const attr = btn.getAttribute('onclick') || '';
            const match = attr.match(/setLanguage\(['"]([^'"]+)['"]\)/);
            if (match) {
                btn.classList.toggle('active', match[1] === this.currentLang);
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
if (typeof require !== 'undefined') {
    ['./i18n-content.js', './i18n-modes.js'].forEach(mod => {
        try { i18n.registerPack(require(mod)); } catch(e) {}
    });
}
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
