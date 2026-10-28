# Guitar vs Zombies
## Documentação do Projeto

### Visão Geral
"Guitar vs Zombies" é um jogo mobile vertical que mistura combate automático (estilo idle/roguelite) com mecânicas de jogo de ritmo (estilo Guitar Hero). 

- **Tela Superior (Combat Zone):** O personagem (guitarrista) luta fixo no lado esquerdo do cenário defendendo a rua contra hordas de zumbis vindas da direita. Os zumbis avançam pela pista e, ao alcançarem o guitarrista, param e atacam continuamente até serem destruídos ou vencerem o combate!
- **Tela Inferior (Rhythm Zone):** Minigame de ritmo no estilo Guitar Hero com 4 pistas neon interativas. O jogador toca manualmente no ritmo das notas para disparar ataques sónicos: cada nota acertada no ritmo equivale a exatamente um disparo sônico no zumbi mais próximo!

### Arquitetura (OOP Modular)
HTML5 Canvas, CSS3, JavaScript (ES6+):
- `SoundEngine` (`js/audio.js`): Sintetizador procedural com Web Audio API para guitarras elétricas distorcidas (power chords), bateria, impactos e explosões.
- `SongDB` (`js/song-db.js`): Banco de dados de músicas customizadas utilizando IndexedDB, com suporte a grandes arquivos de áudio (MP3/WAV/OGG), codificação de áudio PCM WAV sintético, serialização e empacotamento completo em arquivos `.gvsong` / `.json` para importação e exportação.
- `SongEditor` (`js/song-editor.js`): Editor visual de ritmo estilo DAW com canvas multi-pista, régua de tempo em compassos e segundos, scrubber interativo, grade de quantização (1/2, 1/4, 1/8, 1/16, Livre), modo de gravação ao vivo (REC / Tap to Record) com botões e teclado, gerador automático por BPM e pilha de Undo.
- `SongStudio` (`js/song-studio.js`): Controlador do Estúdio de Músicas com abas de Biblioteca, Upload de Áudio & Capa com detecção de duração e tap-tempo para BPM, e importação/exportação com feedback por toasts.
- `EnemyPoolSystem` (`js/enemy-pool.js`): Catálogo mestre de arquétipos de zumbis com retratos de alta definição (`assets/zombies/`), atributos de combate e sorteio randômico ponderado de 5 inimigos por partida ("Nesse mapa vc encontrará esses zumbis:").
- `TalentSystem` (`js/talents.js`): Sistema avançado de árvore de talentos com 15 upgrades em 3 ramificações (Ofensivo, Defensivo, Ritmo/Economia), custos base dobrados e fator multiplicador aumentado por nível para progressão prolongada de longo prazo.
- `SpriteSheet` (`js/spritesheet.js`): Carregador e manipulador modular de spritesheets com remoção de fundo verde (*ChromaKey*) e geração em tempo real de silhuetas brancas em canvas secundários para efeitos de flash de dano com alta performance.
- `CombatFX` (`js/combat-fx.js`): Motor dedicado de efeitos visuais e partículas (explosões sónicas, faíscas metálicas, ondas de choque radiais, textos flutuantes com sombras, poças de ácido tóxico borbulhantes, labaredas/brasas de ambiente, auras elétricas e telas de tremor dinâmico).
- `ZombieEntity` (`js/zombie-entity.js`): Entidade polimórfica que encapsula ciclo de vida, animações, arcos de pulo, deflexão e comportamentos de ataque dedicados para todos os 9 arquétipos de zumbis (Normal, Runner, Leaper, Soldier, Spore, Bloater, Gladiator, Hazmat, Mutant).
- `CombatSystem` (`js/combat.js`): Orquestrador central e coordenador de combate (~730 linhas), gerenciando ondas de inimigos, projéteis sónicos com curvas de dano e acertos aéreos, telemetria de batalha e delegação limpa aos módulos `CombatFX` e `ZombieEntity`.
- `RhythmSystem` (`js/rhythm.js`): Pistas neon interativas com controle manual do jogador, modo de músicas customizadas com sincronização por relógio de áudio (`currentTime`), avaliação de ritmo, tela de resultados com premiações em ouro e multiplicador até x9.
- `Game` (`js/main.js`): Máquina de estados de telas (`menu`, `map-select`, `battle`), HUD minimalista de batalha (Auto, Mute, SS, Engrenagem), orquestrador da preparação de mapa e modais de estatísticas (SS) e pausa/abandono.
- `I18n` (`js/i18n.js`): Suporte a idiomas (Português do Brasil e Inglês).

---

## Changelog

### [v1.5.8] - 2026-10-27 (Acervo de Habilidades Únicas por Guitarrista, Regra do Palco e Fallback de Mana)
**Habilidades Específicas, Restrição de Slots e Sistema de Mana**
- **Acervo de Habilidades Únicas por Guitarrista (`js/skills.js`):**
  - Implementado acervo exclusivo com pelo menos 5 habilidades únicas para cada um dos 6 guitarristas (30 habilidades exclusivas + 1 Ataque Básico universal = 31 habilidades no total):
    - **Johnny Blaze:** `blaze_power_chord` (8 MP, 2.2x), `blaze_garage_shred` (11 MP, 1.4x +35% vel.), `blaze_stage_dive` (13 MP, 1.8x + 80% AoE), `blaze_sound_concussion` (10 MP, 1.25x + 2.0s stun), `blaze_adrenaline_surge` (12 MP, 1.1x + 22 HP cura).
    - **Vulkan Ironhead:** `vulkan_flamethrower` (10 MP, 1.35x + 26 DPS burn), `vulkan_v8_backfire` (12 MP, 2.15x + 35px knockback), `vulkan_napalm_wave` (14 MP, 1.5x + 16 DPS AoE burn), `vulkan_molten_pick` (9 MP, 1.85x perfura armadura), `vulkan_ember_shield` (13 MP, 0.85x + 42 HP escudo).
    - **Dr. Radix:** `radix_caustic_spray` (8 MP, 1.6x + 20 corrosivo), `radix_uranium_ray` (13 MP, 2.35x raio penetrante), `radix_decay_cloud` (11 MP, 1.0x + 50% slow AoE), `radix_mutant_burst` (14 MP, 1.75x + 70% AoE tóxico), `radix_antidote_infusion` (12 MP, 0.85x + 26 HP cura).
    - **Cypher-7:** `cypher_tesla_chain` (10 MP, 1.65x chain a 2 zumbis), `cypher_emp_stun` (12 MP, 1.3x + 2.4s EMP stun), `cypher_neural_overclock` (11 MP, 1.35x + 55% vel.), `cypher_plasma_lance` (14 MP, 2.4x crítico plasma), `cypher_cyber_barrier` (13 MP, 0.9x + 45 HP escudo).
    - **Kragthor Titan:** `kragthor_earthquake` (11 MP, 1.75x + 2.2s stun), `kragthor_magma_hammer` (14 MP, 2.6x + 42px knockback), `kragthor_war_roar` (10 MP, 1.25x + 55% slow AoE), `kragthor_stone_fortress` (15 MP, 0.8x + 60 HP escudo), `kragthor_valhalla_thunder` (16 MP, 2.2x + 90% AoE trovão).
    - **Roxie Anarchy:** `roxie_riot_riff` (9 MP, 1.85x riot strike), `roxie_double_cleave` (13 MP, 2.45x + 24 DPS bleed), `roxie_vampiric_drain` (12 MP, 1.5x + 50% lifesteal), `roxie_anarchy_frenzy` (14 MP, 1.45x + 50% vel. e reembolso +10 MP), `roxie_chaos_cataclysm` (17 MP, 2.8x + 35px knockback e 75% AoE).
    - **Ataque Básico Universal:** `basic_strike` ("Ataque Sônico", 0 MP, 1.0x dano).
- **Regra Obrigatória do Palco (`js/skills.js`, `js/main.js` & `index.html`):**
  - O jogador é estritamente obrigado a manter pelo menos 1 slot equipado com o Ataque Básico (`basic_strike`).
  - O sistema impede a troca do último slot básico por uma habilidade especial, exibindo bloqueio visual no modal e toast com feedback amigável.
- **Sistema de Consumo de Mana & Fallback para Ataque Básico Comum (`js/combat.js`):**
  - Cada habilidade especial gasta a quantidade de Rock Mana especificada ao ser executada.
  - Se uma nota for tocada sem MP suficiente, a nota é convertida automaticamente em um ataque básico comum (1.0x dano, sem penalidade de dano), consome 0 MP e emite o texto `⚡ SEM MP! (BÁSICO)`.
- **Testes Automatizados:** Expandido para 256 testes passando com 100% de sucesso (`test-procedural.js`).
- **Cache-Busting v=29:** Atualizado em `index.html`.

### [v1.5.7] - 2026-10-27 (Menu de Edição Exclusivo, Banners Multikill Radicais, Ritmo de Kills e Screen Shake)
**Design de Interface & Efeitos Visuais de Adrenalina**
- **Remoção de Botões de Edição Durante o Jogo (`index.html` & `js/main.js`):**
  - Removido o botão `#result-edit-btn` ("✏️ EDITAR RITMO") da tela de vitória pós-partida (`#song-results-modal`).
  - O estúdio de músicas e o editor de ritmos agora são acessados estrita e exclusivamente a partir do menu inicial (`#screen-main-menu` -> `#menu-studio-btn`), deixando as telas de gameplay limpas e focadas na progressão do jogo.
- **Efeitos Visuais de Multikill com Alta Adrenalina (`CombatFX.addMultiKillBanner` em `js/combat-fx.js`):**
  - Implementado sistema de banners animados de multikill com estética rock/arcade radical e alta octanagem:
    - **1 Kill:** `1 KILL! ⚡` (Ciano elétrico `#00ffff`, tremor 3)
    - **2 Kills (Double Kill):** `DOUBLE KILL! 🔥` (Âmbar brilhante `#ffaa00`, tremor 5)
    - **3 Kills (Triple Kill):** `TRIPLE KILL! ⚡🔥` (Vermelho labareda `#ff3300`, tremor 7)
    - **4 Kills (Multi Kill):** `MULTI KILL! 💥` (Magenta neon `#ff00aa`, tremor 9)
    - **5 Kills (Ultra Kill):** `ULTRA KILL! ⚡💥` (Carmesim violento `#ff0055`, tremor 12)
    - **6 Kills (Fantástico):** `FANTÁSTICO! 🎸🔥` (Roxo mítico `#9900ff`, tremor 14)
    - **7+ Kills (Unbelievable):** `UNBELIEVABLE! 👑⚡` / `UNBELIEVABLE xN! 👑⚡` (Ouro celestial `#ffd700`, tremor 16)
  - Animação de impacto: texto inicia com escala 2.2x e faz transição "slam punch" para 1.0x, seguido de pulso senoidal contínuo e inclinação radical (`transform`).
  - Renderização multicamada: traço preto de 6px para alto contraste arcade, preenchimento neon brilhante com brilho dinâmico (`shadowBlur`) e reflexo specular branco interno.
  - Efeitos complementares: ondas de choque radiais coloridas expansivas e faíscas incandescentes em cada eliminação.
- **Ritmo de Kills Conectado ao Combo ("Ritmo de Kills" em `js/combat.js` & `js/rhythm.js`):**
  - Adicionado contador `comboKills` no combate: sobe a cada zumbi derrotado enquanto o jogador mantiver a sequência de acertos ativa.
  - Vínculo estrito com o combo: caso o combo seja quebrado (seja por toque errado ou por nota perdida), tanto o combo rítmico quanto o ritmo de kills quebram imediatamente e ambos reiniciam do zero.
- **Tremer a Tela em Combos Altos (`rhythm.js` & `combat.js`):**
  - Implementado efeito de impacto na tela (`triggerShake`) disparado nos marcos de combos altos (a cada múltiplo de 5 ou 10 acertos consecutivos a partir de 10), com intensidade crescente proporcional ao combo do jogador.
- **Efeitos de Áudio Procedural para Multikills (`SoundEngine.playMultiKill` em `js/audio.js`):**
  - Adicionado sintetizador de som procedural que gera riffs e acordes de frequência ascendente, com batidas de bumbo em tiers médios e explosões nos tiers mais radicais.
- **Testes Automatizados:** Suíte expandida para 134 testes automatizados cobrindo todos os tiers de multikill, vinculação de comboKills, tremor de tela e remoção de botões (`test-procedural.js`).
- **Cache-Busting v=28:** Atualizadas todas as referências em `index.html` para `?v=28`.

### [v1.5.6] - 2026-10-27 (Rebalanceamento Econômico: Custo de Talentos Dobrado & Nível de Guitarristas Triplicado)
**Economia & Progressão de Longo Prazo**
- **Custo de Upgrade de Talentos Dobrado (`TalentSystem.getCost` em `js/talents.js`):**
  - Fórmula exponencial atualizada para `2 * baseCost * (costMult ^ level)`.
  - Dobra os valores de moedas de ouro necessários para todos os 15 talentos em todas as suas ramificações (Ofensiva, Defensiva e Suporte), proporcionando um ciclo de progressão e valorização do ouro ainda mais duradouro.
- **Custo de Nível dos Guitarristas Triplicado (`GuitaristPoolSystem.getGoldCostForLevelUp` em `js/guitarist-pool.js`):**
  - Fórmula de compra direta de níveis com ouro atualizada para `3 * (32 * 1.054^(level - 1) + level * 7)`.
  - Custo inicial no Nível 1 passa de 39 para 117 moedas de ouro, escalando proporcionalmente até o nível máximo (100).
- **Testes Automatizados:** 105 de 105 testes aprovados (`test-procedural.js`).
- **Cache-Busting v=27:** Atualizadas todas as referências em `index.html` para `?v=27`.

### [v1.5.5] - 2026-10-26 (Correção de Taxa de Erros em Toques no Mobile & Alinhamento de Hit Windows)
**Correções de Precisão e Mecânica de Ritmo**
- **Eliminação de Eventos Duplicados no Celular (`setupInputHandlers` em `js/rhythm.js`):**
  - Identificada e corrigida a causa raiz da falha em que notas acertadas geravam disparo de erro: navegadores mobile emitiam simultaneamente `pointerdown` e `touchstart` no mesmo toque físico.
  - O primeiro evento consumia a nota (`note.hit = true`), e o segundo evento (1ms após) encontrava o trilho vazio, disparando indevidamente a penalidade de toque errado ("ERROU! 💨"), zerando o combo e defletindo o projétil.
  - Implementado bloqueio condicional: caso o navegador processe eventos de ponteiro nativos (`hasPointerEvents`), o listener de `touchstart` é suprimido.
  - Adicionado debounce temporal inteligente de 60ms por trilho (`lastTapTime`), impedindo qualquer reacionamento acidental de hardware ou emulação de clique.
- **Remoção de Disparo Acidental ao Deslizar o Dedo (`onMove` em `js/rhythm.js`):**
  - Removida a chamada de `triggerLaneDown(newLane)` no evento de movimento (`pointermove`/`touchmove`), garantindo que pequenas oscilações de dedo entre trilhos vizinhos não disparem toques errados.
- **Expansão e Calibração das Janelas de Precisão (`triggerLaneDown` em `js/rhythm.js`):**
  - Expandida a janela de acerto (`hitWindow`) de 70px para 95px (~280ms), compensando com perfeição a latência tátil de telas de smartphones.
  - `PERFECT`: calibrado para 24px (~70ms).
  - `GREAT`: calibrado para 54px (~160ms).
  - `GOOD`: corrigido bug crítico onde `this.streak` não incrementava (fazia `Math.max(1, streak)` estagnando a sequência). Agora notas GOOD incrementam o combo normalmente (`this.streak++`).
- **Alinhamento do Despawn de Notas com a Hit Window:**
  - O limiar de nota perdida na esteira foi sincronizado para 0.28s / +95px, eliminando casos onde a nota sumia como MISS enquanto ainda estava dentro da área de alcance visual da palheta.
- **Fila Cronológica Justa de Projéteis no Combate (`registerWrongTap` em `js/combat.js`):**
  - Substituído `unshift` por `push` na fila de modificadores de ataque (`pendingAttackModifiers`), garantindo que toques errados legítimos respeitem a ordem cronológica estrita e nunca suprimam notas acertadas anteriormente.
- **Cache-Busting v=26:** Atualizadas todas as referências em `index.html` para `?v=26`.

### [v1.5.4] - 2026-10-26 (Correção de Fim de Música, Multi-Toque no Editor, Penalidade de Disparo Errado & Escala de Velocidade por Combo)
**Correções Críticas & Novos Recursos**
- **Correção da Conclusão de Música (`StageSystem.completeStage` em `js/stage-system.js` & `js/main.js`):**
  - Resolvido o erro `TypeError: window.stageSystem.completeStage is not a function` que travava o jogo quando a música chegava ao fim.
  - Adicionado o método seguro `completeStage(stage = this.selectedStage)` que destrava a próxima fase e concede as moedas de ouro e XP de herói adequadas.
  - A tela de vitória agora é exibida perfeitamente ao fim de qualquer música sem travar o motor.
- **Correção do Multi-Toque e Notas Seguradas no Editor DAW (`css/style.css` & `js/song-editor.js`):**
  - Adicionadas diretivas `touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;` na barra de pads do editor para eliminar gestos indesejados de zoom/pan em navegadores mobile.
  - Implementado sistema de rastreamento de múltiplos ponteiros (`activePadPointers = new Map()`) com `setPointerCapture(e.pointerId)` nativo.
  - Agora é possível segurar uma tecla/pad enquanto toca em outras notas simultaneamente no celular sem cancelamento de toque.
  - As notas seguradas agora crescem e estendem sua duração em tempo real na tela durante o playback e gravação.
- **Penalidade para Toques Errados (Disparo Desviado com Erro de Alvo):**
  - Tocar em um trilho quando não há nota válida na linha de batida agora aciona `registerWrongTap(lane)`:
    - O combo é imediatamente zerado (`combo = 0`).
    - Exibe o aviso flutuante `"ERROU! 💨"` no guitarrista.
    - O disparo correspondente da guitarra é desviado em ângulo aleatório para longe dos alvos com coloração cinza (`#777777`) e dano 0.
    - Projéteis com `isMiss = true` ignoram colisões com zumbis, atravessando a pista sem causar dano e se dissipando na borda da tela.
- **Aceleração de Ataque Escalonada por Combo (+0,01 SPD por ponto, Máximo +2,00 SPD):**
  - A velocidade de ataque do guitarrista agora recebe um bônus de `+0.01` por cada ponto acumulado no combo, limitado a até `+2.00` de velocidade adicional.
  - O HUD da batalha agora exibe em tempo real o bônus: `${streak} COMBO (+${spdBonus.toFixed(2)} SPD)`.
- **Zero God Object & 100% de Testes Aprovados:**
  - Todos os 16 arquivos JavaScript em `js/` mantêm-se estritamente abaixo do limite de 1.000 linhas.
  - Suíte de 103 testes automatizados passando 100% (`test-procedural.js`).

### [v1.5.3] - 2026-10-25 (Controle Completo de Pausa em Batalha, Tratamento das Telas de Vitória e Derrota)
**Ajustes de Batalha & Telas de Fim de Jogo**
- **Congelamento Completo ao Pausar Durante a Batalha (`battle-gear-modal` & `battle-stats-modal`):**
  - Ao abrir o modal de configurações (engrenagem) ou a ficha de telemetria de batalha (SS), o jogo agora pausa completamente tanto o combate quanto o minigame de ritmo:
    - `CombatSystem`: congela o avanço de tempo (`combat.time`), movimentação de zumbis, física de projéteis e temporizadores de spawn/buffs (`isPaused = true`).
    - `RhythmSystem`: congela a esteira de descida das notas (`rhythm.time`), o relógio de software/áudio, desativa a resposta a toques/teclas (`pointerdown`, `touchstart`, `keydown`) e pausa a reprodução da música customizada (`pauseAudio()`).
    - `Game`: o loop principal (`requestAnimationFrame`) ignora a chamada de `update(deltaTime)` enquanto `isBattlePaused` for verdadeiro, mantendo a renderização estática do frame de combate congelado atrás do modal translúcido.
  - Ao fechar as configurações ou estatísticas, a batalha é retomada suavemente (`resumeBattle()`), reiniciando a música (`resumeAudio()`) e resetando `this.lastTime = performance.now()` para eliminar qualquer salto de delta-time.
- **Tratamento da Tela de Vitória (`#song-results-modal`):**
  - Disparada automaticamente quando a música ativa termina (fim do áudio ou duração atingida) ou quando a meta de baixas da fase é conquistada.
  - Pausa imediatamente a batalha e o áudio, calculando e exibindo:
    - Precisão percentual (`Precisão: X%`).
    - Notas acertadas vs. total (`Notas Acertadas: X / Y`).
    - Zumbis eliminados na partida (`Zumbis Derrotados: X 💀`).
    - Maior sequência de acertos (`Maior Streak: X 🔥`).
    - Recompensas de ouro e pontuação total obtida.
  - Ações interativas completas:
    - `🔄 JOGAR NOVAMENTE`: fecha o modal e reinicia a batalha e música selecionada imediatamente.
    - `✏️ EDITAR RITMO`: redireciona para o Estúdio/Editor de Músicas.
    - `🏠 MENU PRINCIPAL`: encerra a batalha com segurança e retorna ao menu inicial.
- **Tratamento da Tela de Derrota (`#battle-defeat-modal`):**
  - Disparada instantaneamente quando o HP do guitarrista atinge 0 em combate (`handleHeroDefeat()`).
  - Pausa imediatamente a partida e o áudio, aciona tremor dramático de tela, texto sônico de derrota e exibe modal estilizado em tons carmesim com:
    - Total de zumbis derrotados antes da queda.
    - Dano total causado pelo guitarrista.
    - Precisão das notas tocadas.
    - Ouro coletado até o momento.
    - Pontuação final alcançada.
  - Ações interativas dedicadas:
    - `🔄 TENTAR NOVAMENTE`: reinicia a partida do zero com vida cheia e mesma música/fase.
    - `🌳 TALENTOS`: volta ao menu principal e abre diretamente a árvore de talentos para que o jogador use o ouro coletado em melhorias de poder e defesa.
    - `🏠 MENU PRINCIPAL`: retorna ao menu principal.
- **Proteção Contra Despausa Indevida (Resumption Guards):**
  - Caso o jogador abra as opções ou estatísticas durante uma tela de vitória ou derrota, fechar esses modais não retoma a batalha, respeitando as flags `isGameOver` e `isVictory`.
- **Conformidade Rigorosa com a Regra Zero God Object:**
  - Todos os 16 arquivos JavaScript permanecem estritamente abaixo do limite de 1.000 linhas (`combat.js: 982`, `rhythm.js: 963`, `main.js: 938`).
  - 100% dos testes da suíte automatizada (`test-procedural.js`) passando (88/88).

### [v1.5.0] - 2026-10-13 (Overhaul Procedural: Níveis 1-100 de Guitarristas e Zumbis, Fases Infinitas, Rock Mana, Habilidades por Trilho e Sistema de Velocidade de Ataque)
**Novas Mecânicas & Sistemas Procedurais**
- **Sistema Procedural de Níveis para Guitarristas (Nv. 1 a 100) (`js/guitarist-pool.js`):**
  - Cada guitarrista agora evolui proceduralmente do nível 1 ao 100.
  - Curva de dano suave e balanceada: +1% de dano base por nível, garantindo que no nível 100 o guitarrista desfira o dobro de dano (2.0x / +99% bônus).
  - Guitarristas de raridades superiores recebem escalonamentos de atributos especializados e justos:
    - *Comum (Johnny Blaze)*: +1.0% Dano, +0.40% Dano Crítico por nível.
    - *Raro (Vulkan Ironhead)*: +1.0% Dano, +0.30% Dano Crítico, +0.20% Velocidade de Projétil e chance de queimadura por nível.
    - *Raro (Dr. Radix)*: +1.0% Dano, +0.35% Dano Crítico, +0.35% Perfuração de Armadura e +0.12% Lentidão contínua de marcha zumbi.
    - *Épico (Cypher-7 Volt)*: +1.1% Dano, +0.60% Dano Crítico e arcos elétricos em cadeia (*Chain Lightning*) atingindo múltiplos alvos.
    - *Lendário (Kragthor, o Bárbaro)*: +1.15% Dano, +0.85% Dano Crítico e +0.40% Repulsão sísmica pesada (*Knockback*).
    - *Mítico (Roxie Anarchy)*: +1.20% Dano, +0.70% Dano Crítico, +0.25% Bônus de Ouro e +0.50% de Regeneração de Rock Mana por nível.
  - Progressão por XP em batalha (`addHeroXp`) e botão de Level-Up por Ouro (`levelUpWithGold`) na tela de pré-batalha, integrado ao `TalentSystem`.
- **Sistema Procedural de Níveis para Zumbis (`js/zombie-entity.js`):**
  - Os zumbis escalonam nível de acordo com a fase selecionada: vida máxima (`hpMult = (1 + 0.09*(lvl-1))^1.04`), dano de ataque corpo a corpo (`dmgMult = 1 + 0.075*(lvl-1)`) e ouro dropado (`getGoldDrop`).
  - Badge visual `[Nv. X]` exibida dinamicamente acima da barra de vida dos zumbis.
  - Estados alterados completos implementados: Atordoamento/Freeze (`applyStun`), Lentidão (`applySlow`) e Queimadura contínua DoT (`applyBurn`).
- **Sistema Infinito de Fases Procedurais (`js/stage-system.js`):**
  - Criação do módulo dedicado `StageSystem` gerenciando progressão infinita de fases.
  - Geração procedural de nomes de ruas, setores e ciclos apocalípticos (ex.: Rua das Garagens, Setor Alfa MK-2, etc.).
  - Metas dinâmicas de abate (`getTargetKills`) e recompensas procedurais de ouro e XP ao concluir a fase (`getStageRewards`).
  - Seletor de fases interativo com botões anteriores/próximos na tela de pré-batalha.
- **Substituição da Barra de Especial por Rock Mana (`js/skills.js` & `js/combat.js`):**
  - Remoção da antiga barra de Overdrive e introdução do sistema de **Rock Mana** (capacidade 30/100 inicial).
  - Regeneração passiva contínua escalonada por atributos do guitarrista e ganho dinâmico de mana em notas acertadas e sustain ticks.
- **Sistema de 4 Habilidades Equipáveis por Trilho de Ritmo (`js/skills.js`):**
  - Grade visual de 4 slots na tela de pré-batalha permitindo vincular 1 habilidade para cada uma das 4 pistas neon.
  - 8 habilidades únicas balanceadas:
    1. *Ataque Sônico* (Custo 0, Dano 1.0x - padrão).
    2. *Power Chord Pesado* (Custo 8, Dano 2.2x + repulsão física forte).
    3. *Melodia Regenerativa* (Custo 12, Dano 0.75x + restaura +20 HP ao herói).
    4. *Choque Atordoante* (Custo 10, Dano 1.2x + paralisa o zumbi por 2.0s).
    5. *Fuzz Dissuasivo* (Custo 9, Dano 0.9x + reduz velocidade de todos os zumbis em 50% por 3.5s).
    6. *Riff Pirotécnico* (Custo 10, Dano 1.3x + incendeia com 22 DPS por 3.5s).
    7. *Escudo Harmônico* (Custo 14, Dano 0.8x + barreira sônica que absorve até 35 de dano por 4.0s).
    8. *Frenesi Overdrive* (Custo 15, Dano 1.1x + aumenta velocidade de ataque em 65% por 4.5s).
  - **Mecânica de Mana Insuficiente (Starvation Fallback):** Caso o jogador acerte uma nota que ative uma habilidade mas não tenha mana suficiente, a habilidade é automaticamente substituída por um ataque básico enfraquecido (50% do dano base) com aviso flutuante `"⚡ SEM MANA! (50%)"`.
- **Sistema de Velocidade de Ataque (Attack Speed) e Modificadores de Ritmo:**
  - Desacoplamento da antiga regra de 1 nota = 1 ataque: o guitarrista possui intervalo de ataque automático baseado em sua velocidade de ataque (`attackSpeed`).
  - A precisão das notas tocadas no minigame de ritmo alimenta a fila de modificadores que afetam os disparos:
    - `MISS`: Penalidade de 50% de redução no dano do ataque seguinte (dano * 0.5).
    - `GOOD`: Disparo normal (dano * 1.0).
    - `GREAT`: Disparo amplificado (dano * 1.2).
    - `PERFECT`: Ativação imediata de Ataque Crítico!
  - Dano Crítico baseado em atributos percentuais do personagem: `danoNormal * (1 + bonusCriticoPercentual / 100)`.
- **Eliminação Completa do Modo Automático (Auto-Play):**
  - Removido qualquer botão ou atalho de jogo automático (`autoPlay`), garantindo jogabilidade puramente manual e baseada em habilidade.
- **Design Modular e Responsividade Mobile:**
  - 16 arquivos JavaScript independentes, todos rigorosamente abaixo de 1.000 linhas (zero God Objects).
  - Interface com grid flexível e cards fluidos que se ajustam responsivamente a telas verticais mobile de qualquer resolução.

### [v1.4.3] - 2026-10-12 (Eliminação do God Object: Desacoplamento do Motor de Combate em Módulos Especializados)
**Refatoração & Arquitetura**
- **Eliminação Completa do "God Object" `CombatSystem`:**
  - O antigo `CombatSystem` continha quase 2.000 linhas em um único arquivo monopólio (`combat.js`), centralizando simultaneamente manipulação direta de pixels ChromaKey, física de partículas, lógica de IA de múltiplos zumbis, rendering complexo e loop de batalha.
  - A arquitetura foi refatorada e desacoplada em 4 classes independentes, cada uma com Responsabilidade Única (SRP):
    1. **`SpriteSheet` (`js/spritesheet.js` - ~100 linhas):**
       - Isolamento completo do pipeline de imagem: carga de imagem, detecção de dimensões de quadro, canvas transparentes com corte de ChromaKey verde e criação de silhuetas brancas puras (*white silhouettes*) cacheadas para flashes de impacto sem recalcular a cada frame.
    2. **`CombatFX` (`js/combat-fx.js` - ~420 linhas):**
       - Motor visual dedicado para todas as partículas, ondas de choque circulares com espessura variável, textos flutuantes com amortecimento de velocidade, poças de ácido de Hazmat com tempo de vida e borbulhas ácidas, fagulhas/brasas de ambiente, auras elétricas do herói Cypher Volt, barreiras de choque do amplificador e controle de tremor de tela (*screen shake*).
    3. **`ZombieEntity` (`js/zombie-entity.js` - ~440 linhas):**
       - Classe de entidade polimórfica que gerencia a máquina de estados individual de cada zumbi: deslocamento por velocidade base, arcos balísticos de salto de Leaper, verificação de alcance de corpo a corpo contra o guitarrista, intervalos de ataque, deflexão de corrente pelo Gladiador, regeneração/cura pela Spore e rendering de barra de vida individual com cores por raridade/vida.
    4. **`CombatSystem` (`js/combat.js` - reduzido de ~1.920 para ~730 linhas):**
       - Coordenador limpo focado exclusivamente em: dimensionamento de pista/estrada, orquestração de waves, física e colisão de projéteis sónicos com acertos aéreos (*Air Shot Crit*), cálculo de recompensas de talentos e telemetria de estatísticas de batalha.
- **Manutenção Rigorosa de Retrocompatibilidade:**
  - `CombatSystem` expõe getters e proxies para `addFloatingText()`, `createExplosion()`, `triggerShake()`, `shakePower`, e referências transparentes para `combat.entities.particles` e `combat.entities.shockwaves`.
  - Nenhuma chamada externa em `main.js`, `rhythm.js` ou na interface foi quebrada.
- **Validação de Sintaxe & Teste de Simulação:**
  - Validação estática com `node -c` em todos os 14 scripts do projeto (código de saída 0).
  - Executada suíte de testes de simulação automatizada de 50 quadros cobrindo todos os 9 arquétipos de zumbis simultaneamente.
  - Atualização dos scripts em `index.html` com versionamento de cache `?v=21`.

### [v1.4.2] - 2026-10-12 (Revisão Completa: Importação Robusta de Áudio e Músicas Editadas, Drag & Drop e Prevenção de Erros de Leitura)
**Corrigido & Aprimorado**
- **Eliminação de Erros de Leitura de Arquivo ("Failed Reading" / `[object ProgressEvent]`):**
  - Identificada e corrigida a causa raiz em `js/song-db.js`: `reader.onerror` passava o evento cru `ProgressEvent`, resultando na mensagem enigmática *"Erro ao ler arquivo: [object ProgressEvent]"*.
  - Agora o leitor inspeciona `reader.error.message` e `reader.error.name`, fornecendo mensagens claras e amigáveis em português.
  - Adicionada detecção resiliente de cabeçalhos de arquivos binários (ID3, RIFF, OggS) em pacotes de texto: se o usuário tentar importar um arquivo de áudio puro renomeado ou na aba de pacotes, o sistema redireciona automaticamente para o importador de áudio sem travar ou emitir erro de JSON.
- **Importação Direta de Arquivos de Áudio (`importAudioFileAsSong` em `js/song-db.js`):**
  - Agora o sistema aceita arquivos de áudio brutos (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`, `.opus`, `.webm`) tanto na aba "Nova Música" quanto diretamente na aba "Importar Música"!
  - Extração inteligente de título e artista a partir do nome do arquivo (ex.: `Artista - Titulo.mp3` vira artista "Artista" e título "Titulo").
  - Medição ultra-rápida de duração via `URL.createObjectURL(file)` e elemento `Audio` com temporizador de segurança (timeout de 2.2s com fallback por estimativa de bitrate), evitando congelamentos na interface.
  - Geração automática de gráfico rítmico autêntico de 4 pistas em 128 BPM com notas normais e sustentadas (*hold/sustain*).
  - Salvamento completo e persistente no IndexedDB com conversão para Data URL.
- **Upload de Áudio Seguro no Estúdio (`SongStudio` em `js/song-studio.js`):**
  - Tratamento de `reader.onerror` e `tempAudio.onerror`, garantindo que o status nunca fique preso indefinidamente em *"Processando..."*.
  - Sugestão automática de Título e Artista nos campos do formulário ao selecionar um arquivo de áudio se os campos estiverem vazios.
  - Suporte completo a **Arrastar e Soltar (Drag & Drop)** no modal do estúdio de músicas: solte qualquer arquivo `.gvsong`, `.json` ou áudio para importação instantânea.
- **Execução Confiável no Editor e na Esteira de Batalha (`SongEditor` & `RhythmSystem`):**
  - Adicionado listener de erro em `SongEditor.audio`: caso o áudio falhe ao decodificar no navegador, o editor prossegue suavemente com o metrônomo e relógio de software em 60 FPS, sem travar o canvas.
  - Corrigido o fluxo de botões `▶️ JOGAR` no Estúdio e `🚀 SALVAR & JOGAR` no Editor: adicionado `window.game.startMatchWithSong(song)`, que agora fecha os modais, troca para a tela de batalha (`battle`), redimensiona os canvases e inicia a partida com a música correta.
  - Proteção e fallback em `RhythmSystem.playCustomSong`: verificação de validade de string de áudio e proteção contra bloqueios de autoplay mobile com retomada automática no primeiro toque.
- **Validação de Sintaxe & Cache-Busting v=20:**
  - Corrigida redeclaração duplicada da variável `bpm` em `SongDB.createDefaultRockSong` que causava `SyntaxError` em tempo de execução.
  - Todos os arquivos JavaScript validados com `node -c` (código de saída 0).
  - Atualizados script tags em `index.html` para `?v=20`.

### [v1.4.1] - 2026-10-12 (Ajuste Crítico: Seleção Robusta de Guitarrista e Músicas com Botões Dedicados e Navegação Cíclica)
**Corrigido & Aprimorado**
- **Correção da Seleção de Guitarristas (`js/guitarist-pool.js` & `js/main.js`):**
  - Resolvido bug crítico de `TypeError: window.guitaristPool.getSelectedGuitarist is not a function`: adicionado método `getSelectedGuitarist()` como alias universal de `getActiveGuitarist()`.
  - Normalizadas propriedades de compatibilidade cruzada nos 6 heróis (`passive: { name, desc }`, `passiveName`, `passiveDesc`, `rarityClass`, `badgeClass`, `accentColor`, `themeColor`).
  - Transformados todos os cards do grid `#map-heroes-roster-grid` em elementos `<button type="button">` nativos, com `pointer-events: none` em elementos filhos (imagens e rótulos) para garantir que qualquer clique ou toque na tela mobile registre instantaneamente.
  - Adicionado selo de confirmação visual animado (`✓`) no herói ativo e feedback sonoro de acorde elétrico (`playGuitarChord`) ao selecionar.
  - Adicionados botões de navegação cíclica rápida (`◀️` e `▶️`) no topo do card de guitarristas para alternar os heróis de forma sequencial.
- **Lista Interativa de Músicas com Botões de Escolha (`#map-songs-roster-list` em `index.html`, `css/style.css` & `js/main.js`):**
  - Substituída a dependência exclusiva de dropdown `<select>` por uma lista visual de faixas com botões interativos dedicados (`▶️ ESCOLHER` e `✅ SELECIONADA`).
  - Cada card de música exibe capa, título, artista, BPM e total de notas mapeadas. Tocar no card ou no botão seleciona a música imediatamente com feedback sonoro.
  - Adicionados botões de navegação cíclica de faixas (`◀️` e `▶️`) no cabeçalho da trilha sonora.
  - O showcase da música ativa (`#map-active-song-preview-card`) atualiza capa, título, autor e tags em tempo real.
  - O `SongDB` foi atualizado para semear 3 músicas oficiais de rock procedural (*Thunder Strike* 136 BPM, *Hellfire Riff* 148 BPM e *Anarchy Riot* 160 BPM), além de qualquer música personalizada criada no estúdio.
- **Cache-Busting v=19:** Atualizados scripts e folha de estilos para `?v=19`.
**Adicionado & Integrado**
- **Pool de Guitarristas (`GuitaristPoolSystem` em `js/guitarist-pool.js`):**
  - Implementado sistema modular de catálogo de heróis jogáveis com 6 guitarristas únicos (5 heróis novos criados a partir dos spritesheets enviados pelo jogador + o herói clássico Johnny Blaze).
  - Persistência da seleção do jogador via LocalStorage (`gvs_selected_guitarist`).
  - Atributos exclusivos para cada herói: Nome, Título, Raridade, Instrumento Oficial, Passiva Especial, Paleta de Cores e Cor do Projétil Sônico:
    1. **Johnny "Riff" Blaze** (*Comum*): Stratocaster "Hellfire" | Passiva: *Espírito do Rock* (+15% Dano Base, +10% velocidade de projéteis).
    2. **Vulkan Ironhead** (*Raro*): Scrap-Metal V8 | Passiva: *Pirotecnia Brutal* (35% de chance de infligir queimadura contínua -14 HP/s por 3s).
    3. **Dr. Radix** (*Raro*): Guitarratox Uranium-235 | Passiva: *Radiação Acústica* (Ignora 50% da blindagem balística e desacelera a horda em 15%).
    4. **Cypher Volt** (*Épico*): Laser-Caster Biônica | Passiva: *Overdrive Biônico* (Acertos críticos e PERFECT disparam relâmpagos em cadeia em até 2 alvos adicionais).
    5. **Kragthor Titan** (*Lendário*): Flying-V Magma Fury | Passiva: *Fúria dos Titãs* (+35% Dano Crítico e +60% de empurrão / knockback na horda).
    6. **Roxie Anarchy** (*Mítico*): Machado Duplo Riot Axe | Passiva: *Anarquia Absoluta* (+25% de moedas de ouro por abate e geração acelerada de Overdrive Rock).
- **Processamento de Spritesheets & Retratos em Alta Resolução (`assets/heroes/`):**
  - Spritesheets originais convertidos e integrados em `assets/hero_vulkan.jpg`, `assets/hero_hazmat.jpg`, `assets/hero_cyborg.jpg`, `assets/hero_gladiator.jpg` (grid 4x4 dinâmico com 16 frames) e `assets/hero_anarchy.jpg`.
  - Retratos em alta resolução gerados diretamente dos spritesheets oficiais com remoção de tela verde (chroma key), iluminação de aura temática e molduras estilizadas por raridade (*Comum*, *Raro*, *Épico*, *Lendário*, *Mítico*).
- **Interface de Seleção na Pré-Batalha (`#screen-map-select` em `index.html` & `css/style.css`):**
  - Adicionado card interativo `#map-selected-hero-showcase` destacando o guitarrista ativo com miniatura ampliada, insígnia de raridade, instrumento, passiva e borda neon pulsante com a cor característica.
  - Carrossel/grid `#map-heroes-roster-grid` com todos os 6 heróis disponíveis para troca instantânea com 1 toque.
- **Integração no Motor de Batalha (`CombatSystem` em `js/combat.js`):**
  - Carregamento de todos os 5 novos spritesheets (`heroVulkanSheet`, `heroHazmatSheet`, `heroCyborgSheet`, `heroGladiatorSheet`, `heroAnarchySheet`).
  - Renderização dinâmica do herói selecionado na pista de combate com animação de strumming, nametag superior e detecção automática do número total de frames da folha de sprites.
  - Efeitos em tempo real das passivas: queimadura com dano contínuo e partículas de fogo, lentidão e perfuração de armadura, relâmpagos em cadeia garantidos, repulsão massiva e bônus de ouro.
  - Exibição do guitarrista selecionado, miniatura e insígnia de raridade no modal de Estatísticas de Batalha (SS).
- **Cache-Busting v=18:** Atualizadas todas as chamadas de scripts e estilos para `?v=18`.

### [v1.3.0] - 2026-10-12 (Toque Arrastado / Sustain Notes, Editor DAW de Duração & HUD de Pontuação e Combo em Tempo Real)
**Adicionado & Aprimorado**
- **Toque Arrastado (Sustain / Hold Notes) na Esteira de Ritmo (`js/rhythm.js`):**
  - Notas com duração (`duration >= 0.2s`) agora exibem uma fita de sustentação neon fluida estendendo-se pela pista até a cauda com gradiente animado, laser central elétrico, pulsos de energia e gema finalizadora de parada.
  - **Mecânica "Toca e Segura":** Ao atingir a linha de batida, manter o dedo ou tecla pressionada fixa a cabeça da palheta na zona de impacto, emitindo faíscas elétricas contínuas, disparando raios de dano sônico constante (`launchSustainTick`) nos zumbis a cada 0.085s com áudio sintetizado de vibrato em alta frequência (`playSustainTick`).
  - **Sistema de Pontuação Justo e Balanceado:**
    - *Acerto Inicial da Cabeça:* Pontuação integral por precisão (`PERFECT!` 100pts / `GREAT!` 60pts / `GOOD!` 30pts) multiplicada pelo combo. Feedback visual: `"PERFECT! 〰️ SEGURE!"`.
    - *Sustain Ticks Contínuos:* +20 pontos por tick a cada 0.085s multiplicado pelo combo, concedendo dano contínuo contra zumbis da horda.
    - *Bônus de Conclusão Completa:* +150 pontos multiplicados pelo combo e +10 de Overdrive Rock ao segurar até o fim da nota (`"SUSTAIN FULL! ⭐"`).
    - *Soltura Antecipada:* Se mantido por pelo menos 75% da nota, concede bônus parcial (`"SUSTAIN OK! ⭐"`). Se solto antes de 75%, a sustentação é interrompida com aviso `"SOLTO CEDO! 💨"`.
  - Suporte completo e unificado a Pointer Events, Multi-Touch e Teclado (A, S, D, F / 1, 2, 3, 4), além de suporte total ao modo Auto-Play.
- **Editor DAW de Ritmo com Suporte a Toque Arrastado (`js/song-editor.js`):**
  - **Modos de Inserção de Notas:** Alternância entre `🎵 Normal` (Tap) e `〰️ Arrastado` (Hold) com seletor de duração padrão (`0.5s`, `1.0s`, `1.5s`, `2.0s`, `3.0s`).
  - **Redimensionamento Interativo por Arraste:** As notas sustentadas exibem alças de ajuste `[>]` na extremidade direita. O criador pode clicar e arrastar a borda da nota diretamente no canvas da timeline para estender ou diminuir a duração livremente.
  - **Gravação ao Vivo (REC) com Pads:** Manter um pad ou tecla pressionada durante a gravação grava automaticamente a nota com a duração exata do tempo em que foi segurada.
  - **Visualização das Notas Sustentadas no DAW:** Barras horizontais alongadas com gradiente neon, padrão zebrado diagonal e rótulo com a duração em segundos (`1.0s`, `1.5s`, etc.).
  - **Gerador Automático por BPM Aprimorado:** Gera notas de sustentação em tempos fortes (downbeats e riffs principais) para criar ritmos com dinâmica e profundidade sonora.
- **HUD de Batalha com Pontuação e Combo em Tempo Real (`index.html`, `css/style.css`, `js/main.js`):**
  - Adicionado painel `#battle-hud-sub` abaixo dos botões de controle na tela de combate:
    - *Score Pill:* Exibe a pontuação acumulada da partida em tempo real (`🪙 PONTUAÇÃO: X`).
    - *Combo Pill:* Exibe a contagem de acertos seguidos e o multiplicador atual (`COMBO: X 🔥 [xY]`).
    - Animação de pulso e brilho dourado dinâmico quando a sequência atinge 5 (`active`) e chamas ardentes a partir de 15 (`on-fire`).
- **Cache-Busting v=17:** Atualizado para `?v=17` em todos os recursos para atualização instantânea sem cache antigo.

### [v1.2.1] - 2026-10-12 (Purificação da Pool: Apenas os 8 Zumbis Autênticos com Retratos Reais Extraídos dos Spritesheets)
**Ajustado & Padronizado**
- **Remoção das 3 Variantes Criadas por IA:**
  - Removidos completamente os arquétipos `heavy_tank` (Heavy Metal Tank), `headbanger_rusher` (Headbanger Thrash) e `screamer_banshee` (Banshee do Palco) da `masterPool` em `js/enemy-pool.js` e do `js/combat.js`.
  - Excluídos os arquivos de retrato gerados por IA correspondentes (`heavy_tank.jpg`, `headbanger_rusher.jpg`, `screamer_banshee.jpg`).
- **Retratos 100% Reais dos Spritesheets (`assets/zombies/`):**
  - Todos os 8 zumbis agora possuem retratos extraídos diretamente de um frame do seu sprite sheet oficial enviado pelo usuário (`zombie2.jpg`, `zombie_mutant.jpg`, `zombie_leaper.jpg`, `zombie_soldier.jpg`, `zombie_spore.jpg`, `zombie_bloater.jpg`, `zombie_gladiator.jpg`, `zombie_hazmat.jpg`).
  - Cada retrato foi processado com remoção de tela verde (chroma key), gradiente radial metálico e borda temática da classe do zumbi.
- **Pool de Sorteio de Mapas com os 8 Zumbis Genuínos:**
  - A pool de inimigos agora sorteia 5 zumbis aleatórios entre os 8 modelos reais a cada partida ou reroll.
- **Cache-Busting v=16:** Atualizado para `?v=16` em todos os scripts e folhas de estilo.

### [v1.2.0] - 2026-10-12 (Expansão da Pool de Inimigos: 5 Novos Zumbis com Mecânicas Únicas & Spritesheets)
**Adicionado & Integrado**
- **5 Novos Arquétipos de Zumbis na Pool Mestre (`js/enemy-pool.js`):** A pool de inimigos agora conta com 11 arquétipos únicos. Cada partida continua sorteando 5 tipos dinamicamente na tela de preparação do mapa:
  1. **Zumbi Soldado Blindado (`soldier` / "Zumbi Soldado Blindado"):**
     - *Visual & Spritesheet:* `assets/zombie_soldier.jpg` (1024x571, 4 colunas x 3 linhas), retrato em `assets/zombies/armored_soldier.jpg`.
     - *Mecânica Única (Armadura Balística Kevlar & Carga Tática):* Possui blindagem que reduz 45% de todo dano de projéteis normais até que receba um Acerto Crítico (Power Chord), momento em que o capacete é quebrado com efeito sonoro e faíscas metálicas! Ao cair abaixo de 50% de HP, entra em modo frenético de Carga Tática aumentando sua velocidade para 65px/s com animação de corrida agressiva.
  2. **Zumbi Esporo Fúngico (`spore` / "Zumbi Esporo Fúngico"):**
     - *Visual & Spritesheet:* `assets/zombie_spore.jpg` (1024x571, 4 colunas x 3 linhas), retrato em `assets/zombies/fungal_spore.jpg`.
     - *Mecânica Única (Aura Regenerativa Fúngica & Explosão de Esporos):* Libera esporos no ar a cada 1.3s, regenerando +12 HP de zumbis aliados próximos. Ao morrer, detona uma explosão de esporos venenosos que causa dano em área e envenena o jogador se estiver próximo.
  3. **Zumbi Esmagador Pesado (`bloater` / "Zumbi Esmagador Pesado"):**
     - *Visual & Spritesheet:* `assets/zombie_bloater.jpg` (1024x571, 4 colunas x 3 linhas), retrato em `assets/zombies/bloater_pounder.jpg`.
     - *Mecânica Única (Sismo Brutal & Anulação de Projéteis):* Tanque colossal com 80% de resistência a knockback (massa extrema). A cada 5 segundos realiza um impacto sísmico no solo (`triggerBloaterGroundPound`), gerando uma onda de choque que anula e destrói notas sónicas do jogador em pleno vôo, além de causar dano sísmico à distância.
  4. **Zumbi Gladiador de Correntes (`gladiator` / "Zumbi Gladiador de Correntes"):**
     - *Visual & Spritesheet:* `assets/zombie_gladiator.jpg` (1024x571, 4 colunas x 3 linhas), retrato em `assets/zombies/chained_gladiator.jpg`.
     - *Mecânica Única (Deflexão de Correntes Pesadas & Soco de Aço):* Carrega correntes grossas de ferro nos punhos com 35% de chance de defletir projéteis não-críticos com faíscas metálicas. Ao alcançar o herói, desfere golpes pesados contínuos com recuo na tela.
  5. **Zumbi Hazmat Tóxico (`hazmat` / "Zumbi Hazmat Tóxico"):**
     - *Visual & Spritesheet:* `assets/zombie_hazmat.jpg` (1024x571, 4 colunas x 3 linhas), retrato em `assets/zombies/toxic_hazmat.jpg`.
     - *Mecânica Única (Poças de Ácido Radioativo & Derretimento Nuclear):* Deixa um rastro de poças de ácido radioativo na pista de asfalto (`acidPuddles`). Projéteis do jogador que atravessam as poças perdem dano e têm sua velocidade reduzida. Ao morrer, sofre um colapso tóxico (`triggerHazmatMeltdown`), causando dano cáustico em zumbis adjacentes e deixando uma poça ácida de longa duração.
- **Motor de Combate AAA Atualizado (`js/combat.js`):**
  - Instanciação completa dos 5 novos spritesheets (`soldierSheet`, `sporeSheet`, `bloaterSheet`, `gladiatorSheet`, `hazmatSheet`) com suporte a Chroma Key verde e renderização espelhada voltada para o guitarrista.
  - Renderização das poças de ácido (`acidPuddles`) no asfalto com borda fosforescente e partículas de bolhas ascendentes.
  - Cores temáticas exclusivas para barras de vida e plaquetas de identificação no combate para cada uma das classes de zumbis.
  - Recompensas em ouro balanceadas conforme a ameaça de cada inimigo.
- **Cache-Busting v=15:** Atualizado para `?v=15` em todos os scripts e folhas de estilo.

### [v1.1.2] - 2026-10-12 (Hotfix: Correção dos Botões de Iniciar Jogo e Talentos)
**Corrigido & Estabilizado**
- **Botão "JOGAR / INICIAR BATALHA" (`#menu-btn-play`):**
  - **Causa Raiz:** O seletor `#screen-map-select` continha a regra `display: none;` no CSS (`style.css`), que devido à alta especificidade de seletores de ID sobre classes (`.game-screen.active`), impedia que a tela de preparação do mapa e seleção de zumbis se tornasse visível ao ser ativada.
  - **Correção:** Removida a propriedade conflitante em `#screen-map-select`, configurada a regra `.game-screen.active { display: flex !important; }` e implementada alternância inline direta de visibilidade (`screens[key].style.display = isActive ? 'flex' : 'none'`) no `switchScreen()`, garantindo que a tela sempre abra instantaneamente ao clicar em "JOGAR".
- **Botão "ÁRVORE DE TALENTOS" (`#menu-btn-talents`):**
  - **Causa Raiz:** A classe `TalentSystem` em `js/talents.js` não possuía a implementação dos métodos `open()` e `close()`, causando `TypeError: window.talentSystem.open is not a function` ao clicar no botão da tela inicial.
  - **Correção:** Implementados os métodos públicos `open()` e `close()` em `TalentSystem` para abrir o modal `#talent-modal`, disparar a renderização da árvore e sincronizar os talentos e saldo de ouro. Adicionado fallback direto no botão caso o modal precise ser aberto imediatamente.

### [v1.1.1] - 2026-10-12 (Hotfix: Correção de Inicialização de Partida & Configurações)
**Corrigido & Estabilizado**
- **Crash ao Iniciar Partida (`IndexSizeError`):**
  - Identificada e corrigida a causa raiz do travamento ao iniciar uma partida a partir da tela inicial. Quando `#screen-battle` estava oculto (`display: none`), os elementos canvas tinham dimensões zero (`0x0`), o que causava `IndexSizeError` imediato no loop de renderização do Canvas 2D (`createRadialGradient` na vinheta e `drawImage` no background).
  - Implementado redimensionamento síncrono imediato de ambos os canvases (`CombatSystem.resize()` e `RhythmSystem.resize()`) no momento exato em que a tela de batalha é ativada no DOM.
  - Adicionadas proteções defensivas completas em `CombatSystem.draw()`, `CombatSystem.drawBackground()`, `CombatSystem.drawVignette()` e `RhythmSystem.draw()` garantindo que o canvas nunca desenhe caso as dimensões sejam inferiores ou iguais a 10px, com fallback de auto-recuperação (`window.innerWidth` e `window.innerHeight`).
  - Adicionado `getBuiltinDefaultSong()` síncrono no `Game`, garantindo que uma música válida esteja sempre pronta e selecionada na memória, prevenindo falhas de inicialização assíncrona do banco de dados IndexedDB.
- **Botão de Configurações no Menu Inicial:**
  - Corrigido o modal de configurações (`#battle-gear-modal`). Quando aberto a partir do menu inicial (`isFromMainMenu = true`), o título agora exibe `"⚙️ CONFIGURAÇÕES"`, o botão de rodapé exibe `"✕ FECHAR CONFIGURAÇÕES"` e a área de perigo de abandono de batalha é ocultada. Quando aberto durante uma partida em andamento, o botão exibe `"▶️ CONTINUAR PARTIDA"` e a opção de abandono de partida permanece acessível.

### [v1.1.0] - 2026-10-12 (Menu Inicial, Pool de Inimigos, Tela de Preparação & HUD de Batalha Minimalista)
**Adicionado & Aprimorado**
- **Menu Inicial (`#screen-main-menu`):**
  - Tela inicial dedicada com tema de palco de show de heavy metal apocalíptico.
  - HUD do jogador com saldo de ouro (`🪙`), recorde / maior pontuação (`🏆`) e total de zumbis eliminados (`💀`).
  - Acesso rápido a áudio (`🔊`/`🔇`) e alternador de idiomas (PT/EN).
  - Botões temáticos com efeitos de brilho e animações de pulso:
    - `⚡ JOGAR / INICIAR BATALHA`
    - `🌳 ÁRVORE DE TALENTOS`
    - `🎵 ESTÚDIO DE MÚSICA & RITMO`
    - `⚙️ CONFIGURAÇÕES`
- **Tela de Preparação do Show & Mapa (`#screen-map-select`):**
  - Exibição destacada: **"Nesse mapa você encontrará esses zumbis:"**.
  - **Enemy Pool System (`js/enemy-pool.js`):** Sorteio de 5 tipos de zumbis a cada nova partida a partir da pool mestre de 6 arquétipos com retratos artísticos 1:1 em `assets/zombies/`:
    - *Zumbi Punk Rocker* (`punk_walker.jpg`) - Andarilho padrão com moicano.
    - *Corredor Feral Saltador* (`feral_leaper.jpg`) - Galopador ágil que salta no ar.
    - *Mutante Radioativo* (`toxic_mutant.jpg`) - Detonação sônica tóxica ao cair.
    - *Zumbi Tanque Brutamontes* (`heavy_tank.jpg`) - Tanque colossal com blindagem pesada.
    - *Headbanger Rusher* (`headbanger_rusher.jpg`) - Corredor frenético veloz.
    - *Screamer Banshee* (`screamer_banshee.jpg`) - Emissora de gritos supersônicos.
  - Botão de `🎲 Sortear Novos Inimigos` para re-sortear a horda antes de entrar na partida.
  - Seletor de músicas integrando faixas oficiais e músicas autorais criadas ou importadas no Estúdio, com prévia de capa, BPM e total de notas mapeadas.
  - Botão de ação direta `🔥 INICIAR BATALHA AGORA!`.
- **Tela de Batalha Minimalista & Limpa (`#screen-battle`):**
  - O topo da tela agora contém estritamente os controles essenciais solicitados:
    - `⚡ AUTO: ON/OFF`: Alternância rápida para modo automático ou manual.
    - `🔊 / 🔇`: Alternância de áudio instantânea.
    - `📊 SS`: Botão de acesso ao Modal de Estatísticas de Batalha em tempo real.
    - `⚙️`: Engrenagem de Opções & Pausa contendo o botão de **"Voltar ao Menu Inicial (perde progresso atual)"** com alerta de confirmação.
- **Modal de Estatísticas de Batalha (SS - Sheet Stats):**
  - Dano Total Causado em tempo real (`#ss-total-damage`).
  - HP do Guitarrista e Tempo em Combate.
  - Zumbis Derrotados (`#ss-zombies-killed`).
  - Maior Streak de Notas (`#ss-max-streak`).
  - Multiplicador de Combo Atual (`#ss-current-multiplier`).
  - Pontuação da Partida (`#ss-current-score`).
  - Ouro Coletado nesta Partida (`#ss-match-coins`).
  - Taxa de Precisão detalhada com contadores de Perfect, Great e Miss.
- **Progressão Lenta da Árvore de Talentos:**
  - Custos base (`baseCost`) de todos os 15 talentos dobrados (ex: 80 🪙 para 160 🪙, até 1100 🪙 nos talentos avançados).
  - Fator de custo exponencial (`costMult`) aumentado significativamente (1.52x a 1.85x por nível) para desacelerar o avanço e estender o gameplay a longo prazo.
- **Cache-Busting v=12:**
  - Atualizadas todas as chamadas no HTML para `?v=12` e scripts alinhados para carregamento no mobile (`http://192.168.1.7:8080/?v=12`).

### [v1.0.0] - 2026-10-12 (Estúdio de Músicas, Editor de Ritmo & Importação/Exportação)
**Adicionado & Integrado**
- **Estúdio de Músicas Completo (`#song-studio-modal`):**
  - Botão no HUD `🎵 MÚSICAS` com animação gradiente neon.
  - **Aba Biblioteca (Minhas Músicas):** Cards interativos para cada música com arte da capa em disco de vinil, título, artista, descrição, duração, quantidade de notas mapeadas, BPM e selo oficial. Ações: `▶️ JOGAR`, `✏️ EDITAR`, `💾 EXPORTAR`, `🗑️ EXCLUIR`.
  - **Aba Nova Música (Upload & Metadados):**
    - Upload de arquivo de áudio real (`.mp3`, `.wav`, `.ogg`, `.m4a`) com medição automática de duração.
    - Upload de imagem de capa personalizada com visualizador prévio (com fallback para arte gerada em alta definição).
    - Campos de Título, Artista / Autoria e Descrição.
    - Detector de BPM interativo com botão `🖐️ TAP TEMPO` para encontrar o ritmo exato da música.
    - Opção de iniciar com ritmo vazio ou gerar um ritmo base de rock automaticamente por BPM.
    - Síntese de áudio procedural integrada caso o jogador queira criar uma música de rock sem precisar fazer upload de arquivo.
  - **Aba Importar / Exportar:**
    - Importador de pacotes `.gvsong` ou `.json` com validação de dados e gravação instantânea no IndexedDB.
    - Instruções passo a passo de como compartilhar músicas com outros jogadores.
- **Editor Visual de Ritmo / Beat Mapper (`#chart-editor-modal`):**
  - **Linha do Tempo Multi-Pista em Canvas:**
    - 4 pistas coloridas (Verde, Vermelha, Amarela, Azul).
    - Régua de tempo com numeração de compassos (`C.1`, `C.2`...) e segundos.
    - Cursor agulha (Playhead) sincronizado em tempo real com o áudio.
    - Adicionar/remover notas com clique/toque na pista (com prévia sonora do acorde de guitarra).
    - Navegação livre arrastando horizontalmente pela linha do tempo (scrubbing).
  - **Gravação em Tempo Real (Modo REC):**
    - Botão `⏺️ GRAVAR (REC)` piscante.
    - Enquanto a música toca, o jogador pode bater o ritmo nos 4 botões na tela (ou teclas A, S, D, F / 1, 2, 3, 4) para gravar as notas exatamente na hora da batida!
  - **Ferramentas de Precisão:**
    - Grade de Quantização (Snap Grid): Livre, 1/2 tempo, 1/4 tempo, 1/8 tempo e 1/16 tempo.
    - Controle de Velocidade de Reprodução: 0.5x, 0.75x e 1.0x para mapear solos ultra velozes com precisão cirúrgica.
    - Zoom dinâmico da linha do tempo (`+` e `-`).
    - Desfazer (`Undo` / `Ctrl+Z`) com pilha de até 25 ações.
    - Gerador de batida base automática por BPM e botão de limpar todas as notas.
    - Botões `💾 SALVAR` e `🚀 SALVAR & JOGAR`.
- **Reprodução de Músicas no Jogo (`RhythmSystem`):**
  - Sincronização matemática exata entre o áudio da música (`currentTime`) e as notas descendo na highway.
  - Banner informativo com miniatura da capa, título, artista, barra de progresso da música e botão `✕ SAIR` para voltar ao modo arcade.
  - **Tela de Resultados da Música (`#song-results-modal`):**
    - Apresenta taxa de precisão (%), acertos/total, maior streak de combo e pontuação.
    - Concede recompensas em moedas de ouro que alimentam a Árvore de Talentos!
    - Botões de "Jogar Novamente", "Editar Ritmo" e "Modo Arcade".

### [v0.9.0] - 2026-10-12 (Sistema Avançado de Árvore de Talentos & Economia Lenta)
**Adicionado & Integrado**
- **Árvore de Talentos Completa com 15 Upgrades:**
  - **Ramificação Ofensiva (Riffs & Dano):**
    - *Power Chord:* +5 de dano base por nível (até 20 níveis).
    - *Solo Feroz:* +12% de dano crítico por nível (até 15 níveis).
    - *Fuzz Elétrico:* Críticos disparam arcos de raios em cadeia atingindo zumbis adjacentes (até 10 níveis).
    - *Impacto Sonoro:* +15% de força de repulsão / knockback (até 12 níveis).
    - *Air Sniper:* +25% de dano amplificado em zumbis saltadores interceptados no ar (até 10 níveis).
  - **Ramificação Defensiva (Palco & Resistência):**
    - *Resistência Punk:* +15 de vida máxima para o guitarrista por nível (até 20 níveis).
    - *Amplificador Blindado:* Reduz todo dano recebido em -1 HP por nível (até 15 níveis).
    - *Barreira Sônica:* Gera escudo protetor eletromagnético periódico que anula 1 ataque de zumbi completamente (até 10 níveis).
    - *Cura Rítmica:* Restaura HP a cada 10 notas seguidas no ritmo (até 12 níveis).
    - *Rock Never Dies:* Concede até 5 segundos de imunidade e repulsão total após reviver (até 5 níveis).
  - **Ramificação de Ritmo & Turnê (Economia & Ritmo):**
    - *Palheta Dourada:* Concede moedas de ouro extras por cada zumbi eliminado (até 20 níveis).
    - *Sincronia Fina:* Expande em +4% por nível a janela de tolerância para acertar notas com PERFECT! (até 15 níveis).
    - *Overdrive Acelerado:* +10% de ganho de energia de Rock ao acertar notas (até 10 níveis).
    - *Streak Lucrativo:* Concede bônus massivo em moedas a cada 15 notas em sequência (até 10 níveis).
    - *Maestria do Solo:* Permite que o multiplicador de combo da highway alcance até x9 (até 5 níveis).
- **Curva de Progressão Lenta:**
  - Fórmula exponencial por nível: `Math.floor(baseCost * Math.pow(costMult, level))`.
  - Mais de 188 níveis totais de melhoria para longa durabilidade de gameplay.
- **Assets de Ícones de Alta Qualidade:**
  - 6 ícones temáticos 2D gerados por IA (`guitar_power.jpg`, `amp_shield.jpg`, `lightning_note.jpg`, `gold_pick.jpg`, `skull_crit.jpg`, `heart_regen.jpg`).
- **Interface Mobile Completa (Modal & Inspector):**
  - Botão de acesso rápido no HUD com animação pulsante (`🌳 TALENTOS`).
  - Contador de Ouro em tempo real no topo da tela.
  - Abas para alternar entre as 3 ramificações.
  - Painel inspetor com ícone renderizado, descrição detalhada, requisitos bloqueados, barra de progresso de nível, prévia de benefícios atual/próximo e botão de compra com validação de saldo.
  - Efeitos visuais no canvas: arco da barreira sônica girando em torno do herói e aura dourada durante a imunidade do Rock Never Dies.

### [v1.0.1] - 2026-10-12 (Hotfix: Chart Editor 60 FPS Engine, Software Clock & Highway Synchronization)
**Corrigido & Aprimorado**
- **Bug 1 Resolvido (Esteira do Editor Parada & Notas Acumuladas no Início):**
  - Implementado loop contínuo de renderização com `requestAnimationFrame` a 60 FPS dentro de `SongEditor`.
  - Adicionado relógio híbrido de software (`performance.now()`): a esteira agora avança suavemente em tempo real mesmo se o navegador mobile bloquear ou suspender temporariamente o áudio antes da interação.
  - Corrigido acúmulo de listeners no DOM ao abrir o modal repetidas vezes (`isInitialized`).
  - Adicionados botões de passo rítmico (`⏮️ -1 Beat` e `⏭️ +1 Beat`) e barra deslizante de scrubber de tempo dedicada (`#editor-time-scrubber`) para navegação tátil ágil no celular.
- **Bug 2 Resolvido (Música Salva sem Notas na Esteira ao Jogar):**
  - Implementada sincronização com relógio de software em `RhythmSystem.update(deltaTime)`. Mesmo em navegadores mobile que suspendem o áudio inicial, a esteira calcula a descida das notas a 340 px/s com precisão milimétrica.
  - Desbloqueio e auto-resume do áudio da música ao primeiro toque do jogador nas pistas.
  - Gerador dinâmico de notas de contingência (`generateFallbackNotes`): caso uma música salva tenha 0 notas, o sistema mapeia automaticamente notas no BPM da música, impedindo highway vazia.
  - Otimização do loop de desenho: notas inativas ou fora da tela não consomem renderização.
- **Bug 3 Resolvido (Geração Automática de Notas que não Funcionava):**
  - Removido `window.confirm()` bloqueante em `autoGenerateBasicChart()` (que falhava silenciosamente em WebViews mobile).
  - Geração imediata com feedback em toast (`⚡ Ritmo de X notas gerado`).
  - Proteção contra `duration` inválida/NaN em `SongStudio.handleCreateSong()`, garantindo pelo menos 15-30s e gerando notas completas pelas 4 pistas ao selecionar "Gerar Ritmo Base Automaticamente por BPM".
- **Cache-Busting v=11:** Atualizadas todas as referências de scripts e CSS para garantir recarregamento imediato no mobile (`http://192.168.1.7:8080/?v=11`).

### [v1.5.2] - 2026-10-23 (Visibilidade Total dos Zumbis: Zero Ghost Kills, Spawn On-Screen & Clamping)
- **Eliminação Total de Abates Fantasma Fora da Tela (Zero Ghost Kills):**
  - **Mira e Auto-Ataque Restritos ao Canvas (`js/combat.js`):** `performHeroAutoAttack()`, `launchSustainTick()` e `triggerChainLightning()` agora filtram candidatos estritamente com `z.x <= this.canvas.width - 5`, garantindo que notas e projéteis sônicos nunca mirem ou causem dano a zumbis que ainda não entraram no campo de visão da tela.
  - **Dissipação de Projéteis na Borda:** Projéteis que atingem o limite direito da tela (`p.x >= this.canvas.width - 4`) faíscam e se dissipam com `spawnBurst` na borda em vez de viajar indefinidamente no vazio off-screen.
  - **Filtro de Colisão On-Screen:** A detecção de colisão de projéteis exige `z.x <= this.canvas.width - 4`, impedindo qualquer impacto prévio fora do enquadramento.
- **Onda de Vanguarda Imediata no Início da Partida (`resetBattle()`):**
  - Ao iniciar ou reiniciar o combate, 2 zumbis de vanguarda são instantaneamente posicionados na faixa visível da estrada (`0.78 * cw` e `0.92 * cw`), dando alvos imediatos ao jogador a partir do primeiro compasso da música.
- **Respawn Rápido para Jogadores Habilidosos:**
  - Quando o jogador joga perfeitamente e limpa todos os zumbis da pista (`entities.zombies.length === 0`), o temporizador de onda adianta automaticamente para que o próximo inimigo apareça em menos de 0.4s, eliminando períodos mortos de pista vazia.
- **Ajuste de Spawn e Clamping de Knockback:**
  - O ponto de spawn padrão de `ZombieEntity` (`js/zombie-entity.js`) foi aproximado da borda imediata (`canvasWidth + 8px`), e o método construtor agora suporta `initialX` explícito.
  - O recuo sísmico (knockback) é limitado com `Math.min(this.canvas.width - 15, z.x + knockDist)`, impedindo que golpes críticos empurrem zumbis de volta para fora da tela.
  - Placas de nome, barras de vida e textos flutuantes de ouro/XP/kill têm suas coordenadas x travadas dentro da área útil da tela (`Math.min(canvas.width - 45, Math.max(30, z.x))`).
- **Conformidade com a Regra Zero God Object (< 1.000 Linhas por Arquivo):**
  - Todos os 16 arquivos JavaScript continuam estritamente abaixo do limite de 1.000 linhas (`combat.js`: 985, `rhythm.js`: 991, `song-editor.js`: 995, etc.).
- **Testes Automatizados:**
  - Suíte `test-procedural.js` expandida com a Seção 7 (80 testes automatizados, 100% aprovados).

### [v1.5.1] - 2026-10-13 (Revisão Geral de Código, Correção de Bugs e Modularização Estrita)
- **Correção Crítica de Combate & Velocidade de Ataque (`js/main.js`):**
  - Removido `this.combat.launchAttack(isCrit, lane)` do callback `onHitCallback`.
  - As notas acertadas agora alimentam estritamente o sistema procedural de modificadores de precisão (Miss = -50%, Good = 1.0x, Great = 1.2x, Perfect = Crítico) e Rock Mana, respeitando rigorosamente a cadência contínua do atributo de Velocidade de Ataque do herói.
- **Correção de Áudio (`js/audio.js`):**
  - Implementado o método `playPowerChord(chordIndex)` no sintetizador web audio `SoundEngine`, prevenindo `TypeError` ao subir de nível ou ao ativar acordes.
- **Correção de Habilidade (`js/skills.js`):**
  - Corrigido `healing_melody` para consultar o talento de cura existente `'rhythmic_heal'` em vez do obsoleto `'regen_pick'`.
- **Navegação & Modais (`js/talents.js` e `js/song-studio.js`):**
  - Vinculados os botões `menu-btn-talents` e `menu-btn-studio` aos seus respectivos modais.
  - Sincronizados displays de ouro dinâmicos para `menu-gold-count` e `modal-gold-count`.
  - Adicionado método `updateMenuCurrencies()` como alias robusto para `updateMenuHUD()`.
- **Estatísticas de Vida Útil Persistentes:**
  - `gvs_total_kills` agora é incrementado e salvo no `localStorage` a cada abate de zumbi.
  - `gvs_highscore` agora é persistido ao superar o recorde anterior (ao matar zumbis, concluir fases e no game over).
- **Controle Touch Arrastado na Esteira de Ritmo (`js/rhythm.js`):**
  - Adicionados manipuladores de `pointermove` e `touchmove` com transição suave entre pistas e debounce de captura de ponteiro, permitindo tocar e arrastar o dedo dinamicamente pelas 4 faixas.
- **Sincronização de Encerramento de Partida (`js/rhythm.js`):**
  - `combat.matchActive` agora é desativado ao término da música para evitar que zumbis ataquem em segundo plano atrás do modal de resultados.
  - O botão de jogar novamente reseta o estado da batalha e respawna os inimigos correspondentes.
- **Arquitetura Zero God Objects (< 1.000 linhas por arquivo):**
  - Todos os 16 arquivos JavaScript do projeto estão rigorosamente abaixo de 1.000 linhas (`combat.js`: 990, `rhythm.js`: 991, `song-editor.js`: 995, etc.).
  - Efeitos gráficos auxiliares (`drawAmpAndShadow`, `drawGameOverOverlay`, `spawnBurst`) delegados modularmente para `CombatFX` (`combat-fx.js`).
- **Cobertura de Testes Automatizados:**
  - Testes ampliados em `test-procedural.js` com 70 asserções automatizadas passando com 100% de sucesso.

### [v1.5.0] - 2026-10-13 (Fatores Procedurais & Pool de 6 Guitarristas)
- **Níveis Procedurais para Guitarristas (1 a 100):** Escalonamento suave de dano (+1% por nível), vida e bônus de raridade.
- **Pool Completa de 6 Guitarristas:** Johnny Blade, Vulkan Heavy, Dr. Radix, Cypher Volt, Kragthor Titan e Riot Pixie.
- **Nível Procedural Infinito para Fases & Zumbis:** HP, dano, velocidade e recompensas de ouro/XP escalando progressivamente.
- **Sistema de Rock Mana & 4 Trilhos de Habilidades:** 8 habilidades ativas/passivas equipáveis por pista.
- **Remoção de Auto-Play:** Foco 100% em gameplay manual responsivo mobile.

### [v1.0.0] - 2026-10-12 (Estúdio de Músicas & Editor de Ritmo Interativo)
- Sistema completo de upload de áudios (.mp3, .wav, .ogg), capas (.jpg, .png), títulos, BPM e descrição.
- Banco de dados local com IndexedDB (`GVS_MusicStudio_DB`).
- Editor de Ritmo visual estilo DAW (Beatmapper multi-pistas) com gravação em tempo real e atalhos de teclado.
- Importação e exportação de pacotes completos `.gvsong`.

### [v0.8.0] - 2026-10-12 (Zumbi Corredor Saltador & Mecânica de Air Shot)
**Adicionado & Corrigido**
- **Novo Inimigo: Zumbi Corredor Saltador (`zombie_leaper.jpg`):**
  - **Galope Feral:** Corre em quatro apoios em altíssima velocidade (Frames 0, 1, 2, 3).
  - **Mecânica de Salto Acrobático:** Ao chegar a cerca de 140px do herói, agacha-se para pegar impulso (Frame 5), decola (Frame 6), mergulha em arco parabólico no ar a mais de 55px de altura sobre outros zumbis (Frame 7) e pousa violentamente na frente do guitarrista (Frame 10).
  - **Ataques de Garras Velozes:** Ao chegar no herói, desfere golpes rápidos com efeito de motion blur nas garras (Frames 8 e 9) a cada 0.55s.
- **Mecânica "Air Shot" (Tiro Aéreo Crítico):** Se o jogador acertar uma nota musical e atingir o saltador enquanto ele está voando no ar, o salto é cancelado imediatamente, o zumbi é arremessado de volta para o asfalto com knockback massivo e sofre dano crítico aumentado com o texto especial `🎯 AIR SHOT! CRIT!`.
- **Sombra Dinâmica de Altura:** A sombra projetada do zumbi permanece na rua mesmo quando ele está no ar, encolhendo e clareando conforme ele sobe no arco de pulo.

### [v0.7.0] - 2026-10-11
- Combate contínuo corpo a corpo (zumbis atacam até o fim sem morrer ao encostar) e Zumbi Mutante Radioativo com explosão em área.

### [v0.6.0] - 2026-10-11
- Projétil compacto de notas (escala 0.18) e regra estrita de combate: 1 nota acertada no ritmo = 1 disparo sônico.

### [v0.5.0] - 2026-10-11
- Câmera recuada (zoom out), enquadramento dos personagens na faixa de asfalto do cenário e correção definitiva do bug do quadrado branco com silhuetas pré-renderizadas.

### [v0.4.0] - 2026-10-11
- Herói fixo na esquerda e zumbis vindo da direita com Chroma Key e sistema de partículas.

### [v0.3.0] - 2026-10-09
- Integração das sprite sheets fornecidas pelo usuário.

### [v0.1.0] - 2026-10-08
- Estrutura inicial do projeto com layout mobile 50/50 e i18n.
