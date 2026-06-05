// Log entry translator. Converts structured battle log entries into i18n strings.
import { CARDS } from "../data/cards.js";

const cardName = (id, lang) =>
  CARDS[id]?.name?.[lang] || CARDS[id]?.name?.pt || id;

const STR = {
  pt: {
    you: "VOCÊ",
    enemy: "INIMIGO",
    label_action_player: "AÇÃO DO JOGADOR",
    label_action_enemy: "ATAQUE DO INIMIGO",
    summon: (n) => `Invocou ${n}.`,
    enemy_summon: (n) => `Inimigo invocou ${n}.`,
    hit_creature: (a, t, d) => `${a} atingiu ${t} causando ${d} de dano.`,
    hit_enemy: (a, d) => `${a} feriu o inimigo em ${d}.`,
    enemy_hit_creature: (a, t, d) => `${a} inimigo atingiu seu ${t} causando ${d} de dano.`,
    enemy_hit_player: (a, d) => `${a} inimigo feriu você em ${d}.`,
    destroyed: (n) => `${n} foi destruído.`,
    sacrifice: (n) => `Sacrificou ${n}.`,
    cycle: (n) => `Descartou ${n} e comprou uma nova carta.`,
    mulligan: (c) => `Trocou ${c} carta(s) iniciais.`,
  },
  en: {
    you: "YOU",
    enemy: "ENEMY",
    label_action_player: "PLAYER ACTION",
    label_action_enemy: "ENEMY ATTACK",
    summon: (n) => `Summoned ${n}.`,
    enemy_summon: (n) => `Enemy summoned ${n}.`,
    hit_creature: (a, t, d) => `${a} struck ${t} for ${d} damage.`,
    hit_enemy: (a, d) => `${a} wounded the enemy for ${d}.`,
    enemy_hit_creature: (a, t, d) => `Enemy ${a} struck your ${t} for ${d} damage.`,
    enemy_hit_player: (a, d) => `Enemy ${a} wounded you for ${d}.`,
    destroyed: (n) => `${n} was destroyed.`,
    sacrifice: (n) => `Sacrificed ${n}.`,
    cycle: (n) => `Discarded ${n} and drew a new card.`,
    mulligan: (c) => `Replaced ${c} starting card(s).`,
  },
};

export function translateLogEntry(entry, lang) {
  const s = STR[lang] || STR.pt;
  if (!entry) return "";
  switch (entry.type) {
    case "summon":
      return s.summon(cardName(entry.cardId, lang));
    case "enemy_summon":
      return s.enemy_summon(cardName(entry.cardId, lang));
    case "hit_creature":
      return s.hit_creature(cardName(entry.attackerId, lang), cardName(entry.targetId, lang), entry.dmg);
    case "hit_enemy":
      return s.hit_enemy(cardName(entry.attackerId, lang), entry.dmg);
    case "enemy_hit_creature":
      return s.enemy_hit_creature(cardName(entry.attackerId, lang), cardName(entry.targetId, lang), entry.dmg);
    case "enemy_hit_player":
      return s.enemy_hit_player(cardName(entry.attackerId, lang), entry.dmg);
    case "destroyed":
      return s.destroyed(cardName(entry.cardId, lang));
    case "sacrifice":
      return s.sacrifice(cardName(entry.cardId, lang));
    case "cycle":
      return s.cycle(cardName(entry.cardId, lang));
    case "mulligan":
      return s.mulligan(entry.count);
    case "raw":
      return entry.text;
    default:
      return entry.text || "";
  }
}

export function labelForSide(side, lang) {
  const s = STR[lang] || STR.pt;
  if (side === "player") return s.label_action_player;
  if (side === "enemy") return s.label_action_enemy;
  return "";
}
