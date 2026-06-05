// Card catalog. Each card is defined here once and instances are spawned from
// these templates. Sprites are rendered procedurally from `sprite` data
// (8x10 pixel grid encoded as color indices).
//
// Color palette indices used in sprite arrays:
//   0 = transparent
//   1 = bone (#d9c9a8)
//   2 = blood (#8a251c)
//   3 = ash (#3a3a40)
//   4 = moss (#3a4a3c)
//   5 = midnight (#1a1c28)
//   6 = white (#e8e3d9)

export const PALETTE = {
  0: "transparent",
  1: "#d9c9a8",
  2: "#8a251c",
  3: "#3a3a40",
  4: "#3a4a3c",
  5: "#1a1c28",
  6: "#e8e3d9",
};

// Sprites are 8 columns x 10 rows
const S = {
  moth: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 3, 1, 6, 6, 1, 3, 0],
    [3, 1, 1, 6, 6, 1, 1, 3],
    [3, 1, 5, 6, 6, 5, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 3],
    [0, 3, 1, 1, 1, 1, 3, 0],
    [0, 0, 3, 1, 1, 3, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  rat: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 3, 0, 0, 0, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 0],
    [3, 6, 3, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 3, 0, 0],
    [0, 0, 3, 0, 0, 3, 0, 0],
    [0, 3, 0, 0, 0, 0, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  raven: [
    [0, 0, 5, 5, 0, 0, 0, 0],
    [0, 5, 5, 5, 5, 0, 0, 0],
    [5, 5, 6, 5, 5, 2, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 0],
    [0, 5, 5, 5, 5, 5, 5, 5],
    [0, 5, 5, 5, 5, 5, 5, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  hound: [
    [0, 0, 3, 0, 0, 0, 3, 3],
    [0, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 2, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 6, 3, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [0, 3, 0, 3, 0, 3, 0, 0],
    [0, 3, 0, 3, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  skull: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 5, 1, 1, 5, 1, 1],
    [1, 1, 5, 1, 1, 5, 1, 1],
    [1, 1, 1, 5, 5, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 3, 1, 1, 3, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  candle: [
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 2, 2, 6, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  worm: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4, 4, 4, 0, 0, 0, 0],
    [4, 4, 6, 4, 4, 4, 0, 0],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [0, 4, 4, 4, 4, 4, 4, 4],
    [0, 0, 0, 4, 4, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  thing: [
    [3, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 0, 6, 0, 6, 3, 3],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 0, 3, 2, 2, 3, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 3, 1, 1, 3, 0, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [3, 3, 0, 3, 3, 0, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

// Card definitions.
// cost = blood (sacrifices) required.
// effects = optional special behaviors (handled in battle engine).
export const CARDS = {
  moth: {
    id: "moth",
    name: { pt: "Mariposa", en: "Moth" },
    desc: { pt: "Frágil. Sussurra à noite.", en: "Fragile. Whispers at night." },
    attack: 1,
    health: 1,
    cost: 0,
    sprite: S.moth,
    rarity: "common",
  },
  rat: {
    id: "rat",
    name: { pt: "Rato", en: "Rat" },
    desc: { pt: "Sente o cheiro do medo.", en: "Smells fear." },
    attack: 1,
    health: 2,
    cost: 0,
    sprite: S.rat,
    rarity: "common",
  },
  hound: {
    id: "hound",
    name: { pt: "Cão Cinzento", en: "Grey Hound" },
    desc: { pt: "Lembra de você.", en: "It remembers you." },
    attack: 2,
    health: 3,
    cost: 1,
    sprite: S.hound,
    rarity: "common",
  },
  raven: {
    id: "raven",
    name: { pt: "Corvo", en: "Raven" },
    desc: {
      pt: "Voador. Atravessa sem ser tocado.",
      en: "Flying. Slips through untouched.",
    },
    attack: 2,
    health: 1,
    cost: 1,
    sprite: S.raven,
    rarity: "uncommon",
    effects: ["flying"],
  },
  worm: {
    id: "worm",
    name: { pt: "Verme Glandular", en: "Glandular Worm" },
    desc: { pt: "Cresce no escuro.", en: "Grows in the dark." },
    attack: 0,
    health: 4,
    cost: 1,
    sprite: S.worm,
    rarity: "uncommon",
  },
  skull: {
    id: "skull",
    name: { pt: "Caveira Cantante", en: "Singing Skull" },
    desc: { pt: "Sabe seu nome.", en: "It knows your name." },
    attack: 3,
    health: 3,
    cost: 2,
    sprite: S.skull,
    rarity: "rare",
  },
  candle: {
    id: "candle",
    name: { pt: "Vela Negra", en: "Black Candle" },
    desc: { pt: "Queima ao contrário.", en: "Burns backwards." },
    attack: 0,
    health: 2,
    cost: 0,
    sprite: S.candle,
    rarity: "common",
    effects: ["aura+1atk"],
  },
  thing: {
    id: "thing",
    name: { pt: "A Coisa", en: "The Thing" },
    desc: {
      pt: "Não devia existir aqui.",
      en: "It shouldn't exist here.",
    },
    attack: 4,
    health: 5,
    cost: 3,
    sprite: S.thing,
    rarity: "rare",
  },
};

// Starting deck for a fresh run
export const STARTING_DECK = ["moth", "moth", "rat", "rat", "hound", "candle"];

// Enemy decks indexed by difficulty tier
export const ENEMY_DECKS = {
  easy: ["moth", "rat", "rat", "moth"],
  medium: ["rat", "hound", "raven", "moth", "worm"],
  hard: ["hound", "skull", "raven", "worm", "rat"],
  boss: ["skull", "thing", "hound", "raven", "worm"],
};

// Shop pool
export const SHOP_POOL = ["raven", "worm", "skull", "candle", "hound"];

// Helper: pick a random card id by rarity
export function randomCard(rarity = "common") {
  const pool = Object.values(CARDS).filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)].id;
}
