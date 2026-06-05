import { h } from "../render.js";
import { game, setScene, setRun, commitSave, triggerGlitch } from "../main.js";
import { t } from "../data/translations.js";
import { CARDS } from "../data/cards.js";
import { renderCard } from "../cardRenderer.js";
import {
  createBattle, canAfford, playCard,
  endPlayerTurn, runEnemyTurn, cycleCard, mulligan, finishMulligan,
  MULLIGAN_MAX,
} from "../lib/battle.js";
import { enemyDeckFor, advance } from "../lib/run.js";
import { translateLogEntry, labelForSide } from "../lib/logTranslate.js";
import { sfxClick, sfxCardPlay, sfxHit, sfxVictory, sfxDefeat, startAmbient } from "../lib/audio.js";

// ----------- module-level battle state -----------
let state = null;
let selectedCardUid = null;
let hoveredCardUid = null;
let mulliganSelections = []; // uids
let cyclingMode = false;

function rerender() { setScene("battle"); }

function initIfNeeded() {
  if (state) return;
  startAmbient("shadow");
  const enemyDeck = enemyDeckFor(game.activeNode);
  const b = createBattle(game.activeRun.deck, enemyDeck, game.activeRun.playerMaxHp);
  b.playerHp = game.activeRun.playerHp;
  state = b;
}

function resetBattle() {
  state = null; selectedCardUid = null; hoveredCardUid = null;
  mulliganSelections = []; cyclingMode = false;
}

function scheduleEnemyTurn() {
  if (!state || state.winner || state.turn !== "enemy") return;
  setTimeout(() => {
    if (!state || state.winner) return;
    state = runEnemyTurn(state);
    sfxHit();
    rerender();
    handleWinLoss();
  }, 900);
}

function handleWinLoss() {
  if (!state || !state.winner) return;
  if (state.winner === "player") {
    sfxVictory();
    setTimeout(() => {
      const newRun = advance({ ...game.activeRun, playerHp: state.playerHp });
      resetBattle();
      if (newRun.currentIdx >= newRun.nodes.length) {
        commitSave({
          runsCompleted: (game.save.runsCompleted || 0) + 1,
          deck: newRun.deck,
        });
        setRun(null);
        setScene("safe");
      } else {
        setRun(newRun);
        setScene("shadow");
      }
    }, 1500);
  } else {
    sfxDefeat();
    triggerGlitch();
    setTimeout(() => {
      commitSave({
        deaths: (game.save.deaths || 0) + 1,
        corruption: (game.save.corruption || 0) + 1,
      });
      resetBattle();
      setRun(null);
      setScene("gameover");
    }, 1800);
  }
}

// ----------- Mulligan UI -----------
function renderMulligan(lang) {
  const toggle = (uid) => {
    sfxClick();
    if (mulliganSelections.includes(uid)) mulliganSelections = mulliganSelections.filter((x) => x !== uid);
    else if (mulliganSelections.length < MULLIGAN_MAX) mulliganSelections.push(uid);
    rerender();
  };
  const confirm = () => {
    sfxClick();
    if (mulliganSelections.length > 0) state = mulligan(state, mulliganSelections);
    else state = finishMulligan(state);
    mulliganSelections = [];
    rerender();
  };
  const skip = () => {
    sfxClick();
    state = finishMulligan(state);
    mulliganSelections = [];
    rerender();
  };
  return h("div", { class: "modal-backdrop", "data-testid": "mulligan-modal" },
    h("div", { class: "modal" },
      h("h3", {}, lang === "pt" ? "Mão Inicial" : "Opening Hand"),
      h("p", { class: "mulligan-hint" },
        lang === "pt"
          ? `Selecione até ${MULLIGAN_MAX} cartas para trocar (${mulliganSelections.length}/${MULLIGAN_MAX}).`
          : `Choose up to ${MULLIGAN_MAX} cards to replace (${mulliganSelections.length}/${MULLIGAN_MAX}).`),
      h("div", { class: "mulligan-list" },
        ...state.hand.map((c) =>
          renderCard(c, {
            small: false, lang,
            selected: mulliganSelections.includes(c.uid),
            onClick: () => toggle(c.uid),
            testId: `mulligan-card-${c.uid}`,
          }),
        ),
      ),
      h("div", { style: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" } },
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "mulligan-confirm", onclick: confirm },
          lang === "pt" ? "Confirmar Troca" : "Confirm Swap"),
        h("button", { class: "btn-diegetic", "data-testid": "mulligan-skip", onclick: skip },
          lang === "pt" ? "Manter Mão" : "Keep Hand"),
      ),
    ),
  );
}

// ----------- Side panel: Card Info -----------
function renderCardInfo(lang) {
  let card = null;
  if (hoveredCardUid) {
    card = state.hand.find((c) => c.uid === hoveredCardUid)
        || state.playerBoard.find((c) => c && c.uid === hoveredCardUid)
        || state.enemyBoard.find((c) => c && c.uid === hoveredCardUid);
  }
  if (!card && selectedCardUid) {
    card = state.hand.find((c) => c.uid === selectedCardUid);
  }
  const lblSelected = lang === "pt" ? "CARTA SELECIONADA" : "SELECTED CARD";
  const inner = card
    ? h("div", { class: "card-info" },
        h("div", { class: "ci-name" }, card.name?.[lang] || card.name?.pt || card.id),
        h("div", { class: "ci-stats" },
          h("span", { class: "blood" }, `${lang === "pt" ? "Custo" : "Cost"}: ${card.cost} ${t(lang, "blood")}`),
          h("span", { class: "atk" }, `${lang === "pt" ? "Ataque" : "Attack"}: ${card.currentAttack ?? card.attack}`),
          h("span", { class: "hp" }, `${lang === "pt" ? "Vida" : "Health"}: ${card.currentHealth ?? card.health}`),
        ),
        h("div", { class: "ci-desc" }, card.desc?.[lang] || card.desc?.pt || ""),
        card.effects && card.effects.length > 0
          ? h("div", { class: "ci-effect" },
              `${lang === "pt" ? "Efeito" : "Effect"}: ${card.effects.join(", ")}`)
          : null,
      )
    : h("div", { class: "empty" },
        lang === "pt" ? "Passe o mouse sobre uma carta para ver detalhes." : "Hover a card to see details.");

  // last action
  const la = state.lastAction;
  const lastActionEl = h("div", { class: "last-action", "data-testid": "last-action" },
    h("div", { class: "la-side " + (la?.side || "neutral") }, la ? labelForSide(la.side, lang) : ""),
    la
      ? h("div", { class: "la-text" }, "→ " + translateLogEntry(la, lang))
      : h("div", { class: "empty" }, lang === "pt" ? "Nenhuma ação ainda." : "No action yet."),
  );

  // system message placeholder (future psych hooks)
  const sysMsg = h("div", { class: "system-message", "data-testid": "system-message", id: "system-message" });

  return h("aside", { class: "battle-side", "data-testid": "card-info-panel" },
    h("h4", {}, lblSelected),
    inner,
    lastActionEl,
    sysMsg,
  );
}

// ----------- Side panel: Combat Log -----------
function renderCombatLog(lang) {
  return h("aside", { class: "battle-side", "data-testid": "combat-log-panel" },
    h("h4", {}, lang === "pt" ? "REGISTRO DE COMBATE" : "COMBAT LOG"),
    h("div", { class: "combat-log", "data-testid": "combat-log" },
      ...[...state.log].reverse().map((e) =>
        h("div", { class: "entry " + (e.side || "neutral") },
          e.side && e.side !== "neutral" ? h("span", { class: "arrow" }, "▸") : null,
          translateLogEntry(e, lang),
        ),
      ),
    ),
  );
}

// ----------- Main render -----------
export function renderBattle() {
  if (!game.activeRun || !game.activeNode) { setScene("safe"); return h("div"); }
  initIfNeeded();
  const lang = game.save.language;

  // Mulligan first
  if (!state.mulliganDone) {
    return h("section", { class: "battle", "data-testid": "battle-scene" },
      h("div", { class: "battle-top" },
        h("div", { class: "hp-block enemy" }, h("span", { class: "icon" }, "☠"), h("div", {},
          h("span", { class: "label" }, lang === "pt" ? "INIMIGO" : "ENEMY"),
          h("span", { class: "value" }, String(state.enemyHp)), h("span", { class: "max" }, " / " + state.enemyMaxHp)
        )),
        h("div", { class: "turn-indicator player" }, h("div", { class: "label" }, lang === "pt" ? "MULLIGAN" : "MULLIGAN")),
        h("div", { class: "hp-block player" }, h("div", {},
          h("span", { class: "label" }, lang === "pt" ? "VOCÊ" : "YOU"),
          h("span", { class: "value" }, String(state.playerHp)), h("span", { class: "max" }, " / " + state.playerMaxHp),
        ), h("span", { class: "icon" }, "❤")),
      ),
      renderMulligan(lang),
    );
  }

  // Card selection / play
  const onCardClick = (card) => {
    if (state.turn !== "player" || state.winner) return;
    sfxClick();
    if (cyclingMode) {
      const next = cycleCard(state, card.uid);
      if (next !== state) {
        state = next;
        cyclingMode = false;
        selectedCardUid = null;
        rerender();
      }
      return;
    }
    if (!canAfford(state, card)) return;
    selectedCardUid = selectedCardUid === card.uid ? null : card.uid;
    rerender();
  };

  const onSlotClick = (idx) => {
    if (state.turn !== "player" || state.winner) return;
    if (!selectedCardUid) return;
    if (state.playerBoard[idx]) return;
    const next = playCard(state, selectedCardUid, idx);
    if (next !== state) {
      state = next;
      sfxCardPlay();
      selectedCardUid = null;
      rerender();
    }
  };

  const onEndTurn = () => {
    if (state.turn !== "player" || state.winner) return;
    sfxClick();
    selectedCardUid = null;
    cyclingMode = false;
    state = endPlayerTurn(state);
    rerender();
    if (state.winner) return handleWinLoss();
    scheduleEnemyTurn();
  };

  const onCycle = () => {
    if (state.cycledThisTurn || state.turn !== "player") return;
    sfxClick();
    cyclingMode = !cyclingMode;
    selectedCardUid = null;
    rerender();
  };

  const pctP = Math.max(0, Math.min(100, (state.playerHp / state.playerMaxHp) * 100));
  const pctE = Math.max(0, Math.min(100, (state.enemyHp / state.enemyMaxHp) * 100));

  const turnLabel = state.turn === "player"
    ? (lang === "pt" ? "SEU TURNO" : "YOUR TURN")
    : (lang === "pt" ? "TURNO DO INIMIGO" : "ENEMY TURN");

  const enemyBoard = h("div", { class: "board-row enemy", "data-testid": "enemy-board" },
    ...state.enemyBoard.map((c, i) =>
      h("div", { class: "h-slot small" },
        c ? renderCard(c, {
          small: true, lang,
          onHover: () => { hoveredCardUid = c.uid; rerender(); },
          onLeave: () => { if (hoveredCardUid === c.uid) { hoveredCardUid = null; rerender(); } },
          testId: `enemy-slot-${i}`,
        }) : null,
      ),
    ),
  );

  const playerBoard = h("div", { class: "board-row player", "data-testid": "player-board" },
    ...state.playerBoard.map((c, i) => {
      const isTarget = selectedCardUid && !c;
      return h("div", {
        class: "h-slot small " + (isTarget ? "valid-target" : ""),
        "data-testid": `player-slot-${i}`,
        onclick: () => onSlotClick(i),
      },
        c ? renderCard(c, {
          small: true, lang,
          onHover: () => { hoveredCardUid = c.uid; rerender(); },
          onLeave: () => { if (hoveredCardUid === c.uid) { hoveredCardUid = null; rerender(); } },
          testId: `player-card-slot-${i}`,
        }) : null,
      );
    }),
  );

  const hand = h("div", { class: "battle-hand", "data-testid": "player-hand" },
    ...state.hand.map((c) => {
      const affordable = canAfford(state, c) || cyclingMode;
      return renderCard(c, {
        small: true, lang,
        disabled: (!affordable && !cyclingMode) || state.turn !== "player" || !!state.winner,
        selected: selectedCardUid === c.uid,
        onClick: () => onCardClick(c),
        onHover: () => { hoveredCardUid = c.uid; rerender(); },
        onLeave: () => { if (hoveredCardUid === c.uid) { hoveredCardUid = null; rerender(); } },
        testId: `hand-card-${c.uid}`,
      });
    }),
  );

  const actions = h("div", { class: "battle-actions" },
    h("div", { class: "blood-pool", "data-testid": "blood-pool" },
      h("span", { class: "drop" }, "🩸"),
      h("span", { class: "val" }, String(state.playerBlood)),
      h("span", { class: "max" }, " / " + state.playerBloodMax),
    ),
    h("button", {
      class: "btn-diegetic btn-bracket",
      "data-testid": "btn-end-turn",
      onclick: onEndTurn,
      disabled: state.turn !== "player",
    }, t(lang, "end_turn")),
    h("button", {
      class: "btn-diegetic " + (cyclingMode ? "btn-bracket" : ""),
      "data-testid": "btn-cycle",
      onclick: onCycle,
      disabled: state.cycledThisTurn || state.turn !== "player" || state.deck.length === 0,
    }, cyclingMode
        ? (lang === "pt" ? "ESCOLHA UMA CARTA" : "PICK A CARD")
        : (lang === "pt" ? "DESCARTAR (1/TURNO)" : "DISCARD (1/TURN)")),
    state.cycledThisTurn
      ? h("span", { class: "font-ui", style: { fontSize: ".8rem", color: "var(--text-muted)", alignSelf: "center" } },
          lang === "pt" ? "(já usado)" : "(used)")
      : null,
  );

  return h("section", { class: "battle", "data-testid": "battle-scene" },
    // Top HUD
    h("div", { class: "battle-top" },
      h("div", { class: "hp-block enemy", "data-testid": "enemy-hp" },
        h("span", { class: "icon" }, "☠"),
        h("div", {},
          h("span", { class: "label" }, lang === "pt" ? "INIMIGO" : "ENEMY"),
          h("div", { style: { display: "flex", alignItems: "baseline", gap: "4px" } },
            h("span", { class: "value" }, String(state.enemyHp)),
            h("span", { class: "max" }, " / " + state.enemyMaxHp),
          ),
          h("div", { class: "hp-bar enemy" }, h("div", { class: "fill", style: { width: pctE + "%" } })),
        ),
      ),
      h("div", { class: "turn-indicator " + state.turn, "data-testid": "turn-indicator" },
        h("div", { class: "label" }, turnLabel),
        h("div", { class: "turn-num" }, (lang === "pt" ? "turno " : "turn ") + state.turnNumber),
      ),
      h("div", { class: "hp-block player", "data-testid": "player-hp" },
        h("div", { style: { textAlign: "right" } },
          h("span", { class: "label" }, lang === "pt" ? "VOCÊ" : "YOU"),
          h("div", { style: { display: "flex", alignItems: "baseline", gap: "4px", justifyContent: "flex-end" } },
            h("span", { class: "value" }, String(state.playerHp)),
            h("span", { class: "max" }, " / " + state.playerMaxHp),
          ),
          h("div", { class: "hp-bar player" }, h("div", { class: "fill", style: { width: pctP + "%" } })),
        ),
        h("span", { class: "icon" }, "❤"),
      ),
    ),
    // Left side: card info
    renderCardInfo(lang),
    // Middle: board
    h("div", { class: "battle-board" },
      enemyBoard,
      h("div", { class: "board-divider" }),
      playerBoard,
    ),
    // Right side: combat log
    renderCombatLog(lang),
    // Bottom: actions + hand
    h("div", { class: "battle-hand-area" },
      actions,
      hand,
    ),
  );
}

// reset battle state when navigating away
export function resetBattleState() { resetBattle(); }
