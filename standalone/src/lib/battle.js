// Battle engine. Updated:
// - Blood is a fixed battle resource: starts at 10/10 and only decreases when
//   cards are played.
// - Playing a card simply costs `card.cost` blood (no sacrifice flow).
// - Cycle action: once per turn, discard one card and draw one.
// - Mulligan: at battle start, the player may swap up to 2 cards in opening hand.

import { CARDS } from "../data/cards.js";

export const BLOOD_MAX = 10;
export const MULLIGAN_MAX = 2;

let _uid = 1;
const uid = () => `c_${_uid++}`;

const instance = (id) => ({
  uid: uid(),
  id,
  ...CARDS[id],
  currentAttack: CARDS[id].attack,
  currentHealth: CARDS[id].health,
});

function pushLog(state, entry, side = "neutral") {
  const obj = typeof entry === "string" ? { type: "raw", text: entry } : entry;
  state.log = [...state.log, { ...obj, side, ts: Date.now() }].slice(-30);
  state.lastAction = { ...obj, side };
}

export function createBattle(playerDeckIds, enemyDeckIds, playerMaxHp = 10) {
  const shuffled = [...playerDeckIds].sort(() => Math.random() - 0.5);
  const enemyShuffled = [...enemyDeckIds].sort(() => Math.random() - 0.5);
  const startingHand = shuffled.splice(0, 4).map(instance);

  return {
    playerHp: playerMaxHp,
    enemyHp: 6 + enemyDeckIds.length,
    playerMaxHp,
    enemyMaxHp: 6 + enemyDeckIds.length,
    playerBlood: BLOOD_MAX,
    playerBloodMax: BLOOD_MAX,
    playerBoard: [null, null, null, null],
    enemyBoard: [null, null, null, null],
    hand: startingHand,
    deck: shuffled,
    enemyDeck: enemyShuffled,
    turn: "player",
    turnNumber: 1,
    log: [],
    lastAction: null,
    winner: null,
    cycledThisTurn: false,
    mulliganDone: false,
  };
}

// Mulligan: replace up to MULLIGAN_MAX cards from opening hand
export function mulligan(state, cardUids) {
  if (state.mulliganDone) return state;
  const toReplace = cardUids.slice(0, MULLIGAN_MAX);
  let s = { ...state };
  let newDeck = [...s.deck];
  let newHand = s.hand.filter((c) => !toReplace.includes(c.uid));
  // put replaced card ids back at bottom of the deck
  const returnedIds = s.hand.filter((c) => toReplace.includes(c.uid)).map((c) => c.id);
  newDeck = [...newDeck, ...returnedIds];
  // draw same number from top
  for (let i = 0; i < toReplace.length; i++) {
    if (newDeck.length === 0) break;
    const id = newDeck.shift();
    newHand = [...newHand, instance(id)];
  }
  s.hand = newHand;
  s.deck = newDeck;
  s.mulliganDone = true;
  pushLog(s, { type: "mulligan", count: toReplace.length }, "player");
  return s;
}

export function finishMulligan(state) {
  return { ...state, mulliganDone: true };
}

export function drawCard(state) {
  if (state.deck.length === 0 || state.hand.length >= 7) return state;
  const id = state.deck[0];
  return {
    ...state,
    deck: state.deck.slice(1),
    hand: [...state.hand, instance(id)],
  };
}

// Cycle: discard 1 card from hand, draw 1 from deck. Limited to once per turn.
export function cycleCard(state, cardUid) {
  if (state.cycledThisTurn) return state;
  if (state.turn !== "player") return state;
  if (state.deck.length === 0) return state;
  const card = state.hand.find((c) => c.uid === cardUid);
  if (!card) return state;
  let s = { ...state, hand: state.hand.filter((c) => c.uid !== cardUid) };
  s = drawCard(s);
  s.cycledThisTurn = true;
  pushLog(s, { type: "cycle", cardId: card.id }, "player");
  return s;
}

export function canAfford(state, card) {
  return state.playerBlood >= card.cost;
}

// Play a card to a slot. Costs `cost` blood.
export function playCard(state, cardUid, slotIdx) {
  const card = state.hand.find((c) => c.uid === cardUid);
  if (!card) return state;
  if (state.playerBoard[slotIdx]) return state;
  if (state.playerBlood < card.cost) return state;

  const board = [...state.playerBoard];
  board[slotIdx] = card;
  const newState = {
    ...state,
    playerBoard: board,
    hand: state.hand.filter((c) => c.uid !== cardUid),
    playerBlood: state.playerBlood - card.cost,
  };
  pushLog(newState, { type: "summon", cardId: card.id, slotIdx }, "player");
  return newState;
}

export function endPlayerTurn(state) {
  let s = { ...state, turn: "enemy" };

  for (let i = 0; i < 4; i++) {
    const atk = s.playerBoard[i];
    if (!atk) continue;
    const def = s.enemyBoard[i];
    const dmg = atk.currentAttack;
    if (dmg <= 0) continue;
    const isFlying = atk.effects?.includes("flying");
    if (def && !isFlying) {
      def.currentHealth -= dmg;
      pushLog(s, { type: "hit_creature", attackerId: atk.id, targetId: def.id, dmg }, "player");
    } else {
      s.enemyHp -= dmg;
      pushLog(s, { type: "hit_enemy", attackerId: atk.id, dmg }, "player");
    }
  }

  // Remove dead enemy creatures (log destruction)
  s.enemyBoard = s.enemyBoard.map((c) => {
    if (c && c.currentHealth <= 0) {
      pushLog(s, { type: "destroyed", cardId: c.id, side: "enemy" }, "player");
      return null;
    }
    return c;
  });

  if (s.enemyHp <= 0) {
    s.winner = "player";
    return s;
  }

  return s;
}

export function runEnemyTurn(state) {
  let s = { ...state };

  // Place up to 2 cards on empty slots
  let placed = 0;
  const emptySlots = s.enemyBoard.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  while (placed < 2 && s.enemyDeck.length > 0 && emptySlots.length > 0) {
    const id = s.enemyDeck.shift();
    const card = instance(id);
    const slotIdx = emptySlots.shift();
    const board = [...s.enemyBoard];
    board[slotIdx] = card;
    s = { ...s, enemyBoard: board };
    pushLog(s, { type: "enemy_summon", cardId: card.id, slotIdx }, "enemy");
    placed++;
  }

  for (let i = 0; i < 4; i++) {
    const atk = s.enemyBoard[i];
    if (!atk) continue;
    const def = s.playerBoard[i];
    const dmg = atk.currentAttack;
    if (dmg <= 0) continue;
    const isFlying = atk.effects?.includes("flying");
    if (def && !isFlying) {
      def.currentHealth -= dmg;
      pushLog(s, { type: "enemy_hit_creature", attackerId: atk.id, targetId: def.id, dmg }, "enemy");
    } else {
      s.playerHp -= dmg;
      pushLog(s, { type: "enemy_hit_player", attackerId: atk.id, dmg }, "enemy");
    }
  }

  s.playerBoard = s.playerBoard.map((c) => {
    if (c && c.currentHealth <= 0) {
      pushLog(s, { type: "destroyed", cardId: c.id, side: "player" }, "enemy");
      return null;
    }
    return c;
  });

  if (s.playerHp <= 0) {
    s.winner = "enemy";
    return s;
  }

  s.turn = "player";
  s.turnNumber++;
  s.cycledThisTurn = false;
  s = drawCard(s);

  return s;
}


