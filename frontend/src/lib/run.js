// Roguelike run generator and progression.
import { ENEMY_DECKS, SHOP_POOL, randomCard } from "../data/cards.js";

const NODE_TYPES = ["battle", "event", "shop", "rest", "battle"];

export function makeRun(playerDeck) {
  // 5 nodes; first is forced battle (easy), last is boss
  const nodes = [];
  nodes.push({ type: "battle", tier: "easy", done: false });
  for (let i = 1; i < 4; i++) {
    const t = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
    nodes.push({ type: t, tier: t === "battle" ? "medium" : null, done: false });
  }
  nodes.push({ type: "boss", tier: "boss", done: false });

  return {
    deck: [...playerDeck],
    currentIdx: 0,
    nodes,
    playerHp: 10,
    playerMaxHp: 10,
    corruption: 0,
    relics: [],
  };
}

export function enemyDeckFor(node) {
  if (node.type === "battle") return ENEMY_DECKS[node.tier] || ENEMY_DECKS.easy;
  if (node.type === "boss") return ENEMY_DECKS.boss;
  return ENEMY_DECKS.easy;
}

export function shopOffer() {
  // 3 cards with prices (1-3 blood)
  const ids = [];
  const pool = [...SHOP_POOL].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3; i++) ids.push(pool[i % pool.length]);
  return ids.map((id) => ({ id, price: 1 + Math.floor(Math.random() * 3) }));
}

export const EVENTS = [
  {
    id: "mirror",
    titleKey: "event_mirror_title",
    textKey: "event_mirror_text",
    options: [
      {
        labelKey: "event_mirror_option_a",
        effect: (run) => ({
          ...run,
          deck: [...run.deck, randomCard("uncommon")],
          corruption: run.corruption + 1,
        }),
      },
      {
        labelKey: "event_mirror_option_b",
        effect: (run) => ({
          ...run,
          playerMaxHp: Math.max(3, run.playerMaxHp - 1),
          playerHp: Math.min(run.playerHp, Math.max(3, run.playerMaxHp - 1)),
        }),
      },
      {
        labelKey: "event_mirror_option_c",
        effect: (run) => run,
      },
    ],
  },
  {
    id: "whisper",
    titleKey: "event_whisper_title",
    textKey: "event_whisper_text",
    options: [
      {
        labelKey: "event_whisper_option_a",
        effect: (run) => ({
          ...run,
          deck: [...run.deck, randomCard("rare")],
          corruption: run.corruption + 2,
        }),
      },
      {
        labelKey: "event_whisper_option_b",
        effect: (run) => run,
      },
    ],
  },
];

export function pickEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

export function advance(run) {
  const nodes = run.nodes.map((n, i) =>
    i === run.currentIdx ? { ...n, done: true } : n,
  );
  return { ...run, nodes, currentIdx: run.currentIdx + 1 };
}

export function isRunComplete(run) {
  return run.currentIdx >= run.nodes.length;
}
