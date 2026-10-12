# 🎸 Guitar vs Zombies 🧟

> Um jogo web/mobile vertical que une **combate automático contra hordas de zumbis** com um minigame rítmico manual inspirado no estilo **Guitar Hero**.

---

## 🎮 Visão Geral

- **Top Screen (Combat Zone):** O guitarrista defende seu posto contra hordas de zumbis sedentos por sangue. Os zumbis avançam pela pista e atacam continuamente ao alcançá-lo.
- **Bottom Screen (Rhythm Zone):** Minigame de ritmo de 4 pistas neon. Toque nas notas e segure notas estendidas (*sustain/hold*) no ritmo para amplificar o dano, curar o herói e disparar acordes sônicos devastadores!
- **Pré-Batalha & Catálogo de Inimigos:** Antes de cada partida, 5 tipos de zumbis são sorteados a partir de uma pool dinâmica de 8 arquétipos mutantes com mecânicas e visuais próprios.
- **Roster de Guitarristas:** Escolha entre 6 personagens jogáveis com raridades exclusivas (*Comum*, *Raro*, *Épico*, *Lendário*, *Mítico*), auras e habilidades passivas únicas.
- **Estúdio de Criação de Ritmos (DAW Beatmapper):** Crie suas próprias faixas, importe arquivos de áudio (.mp3, .wav, .ogg, .m4a), grave no teclado ou tela com REC em tempo real e exporte/importe pacotes completos `.gvsong`!
- **Árvore de Talentos (Talent Tree):** 15 upgrades em 3 ramificações (*Ofensivo*, *Defensivo*, *Ritmo & Ouro*) com escalonamento de custo balanceado.

---

## 🛠️ Tecnologias

- **Frontend:** Vanilla HTML5 Canvas, CSS3 Moderno com temas Neon/Cyberpunk.
- **Audio Engine:** Sintetizador procedural com Web Audio API (`SoundEngine`) gerando timbres de distorção de guitarras elétricas, bateria e acordes.
- **Database & Storage:** IndexedDB (`SongDB`) para persistência de músicas customizadas, partituras e pacotes.
- **Mobile First:** Desenvolvido para proporção móvel vertical (9:16 / 360x740+), com suporte unificado a touch, mouse e teclado (A, S, D, F / 1, 2, 3, 4).

---

## 🚀 Como Executar

Por ser um projeto web em HTML5 e JavaScript Vanilla, você pode rodar localmente com qualquer servidor estático HTTP:

### Usando Node.js:
```bash
npx http-server -p 8080 -c-1
```

Em seguida, acesse no navegador:
`http://localhost:8080/`

---

## 📄 Licença

Desenvolvido para entretenimento e comunidade rockeira! 🤘
