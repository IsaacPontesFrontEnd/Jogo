import { h } from "../render.js";
import { game, setScene, setRun, commitSave, triggerGlitch } from "../main.js";
import { t } from "../data/translations.js";
import { CARDS } from "../data/cards.js";
import { renderCard } from "../cardRenderer.js";
import { makeRun } from "../lib/run.js";
import { sfxClick, sfxHover } from "../lib/audio.js";

let npcLineIndex = 0;
let npcTyped = "";
let npcVisible = false;
let deckVisible = false;
let savedMsgVisible = false;

export function renderSafe() {
  const lang = game.save.language;
  // visit counter (only once on first build)
  if (!renderSafe._visited) {
    renderSafe._visited = true;
    const nextVisited = (game.save.visitedSafe || 0) + 1;
    if (game.save.visitedSafe !== nextVisited) {
      commitSave({ visitedSafe: nextVisited });
      return h("div"); // commitSave already triggered a re-render; abort this one
    }
    if (game.save.visitedSafe > 1 && Math.random() < 0.35) {
      setTimeout(() => triggerGlitch(), 2500 + Math.random() * 4000);
    }
  }

  const npcLines = (() => {
    if (game.save.corruption >= 3) return t(lang, "npc_lines_corrupted");
    if ((game.save.visitedSafe || 0) > 1) return t(lang, "npc_lines_post");
    return t(lang, "npc_lines_first");
  })();

  const enterShadow = () => {
    sfxClick();
    const run = makeRun(game.save.deck);
    setRun(run);
    setScene("shadow");
    renderSafe._visited = false;
  };
  const openDeck = () => { sfxClick(); deckVisible = true; rerender(); };
  const closeDeck = () => { sfxClick(); deckVisible = false; rerender(); };
  const openNpc  = () => { sfxClick(); npcVisible = true; npcLineIndex = 0; startTyping(npcLines[0]); };
  const advanceNpc = () => {
    sfxClick();
    if (npcLineIndex + 1 >= npcLines.length) { npcVisible = false; npcLineIndex = 0; rerender(); }
    else { npcLineIndex++; startTyping(npcLines[npcLineIndex]); }
  };
  const save = () => {
    sfxClick();
    commitSave({}); // already persisted
    savedMsgVisible = true;
    setTimeout(() => { savedMsgVisible = false; rerender(); }, 1800);
    rerender();
  };

  function rerender() {
    setScene("safe");
  }

  function startTyping(text) {
    npcTyped = "";
    rerender();
    let i = 0;
    const iv = setInterval(() => {
      i++;
      npcTyped = text.slice(0, i);
      const el = document.querySelector("[data-testid=npc-text]");
      if (el) el.textContent = npcTyped;
      if (i >= text.length) clearInterval(iv);
    }, 28);
  }

  return h("section", { class: "safe", "data-testid": "safe-environment" },
    h("header", {},
      h("h2", { "data-testid": "safe-title" }, t(lang, "safe_title")),
      h("p", {}, t(lang, "safe_subtitle")),
    ),
    h("div", { class: "safe-body" },
      h("aside", { class: "safe-options", "data-testid": "safe-options" },
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-enter-shadow", onclick: enterShadow, onmouseenter: sfxHover }, t(lang, "enter_shadow")),
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-manage-deck", onclick: openDeck, onmouseenter: sfxHover }, t(lang, "manage_deck")),
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-talk-npc", onclick: openNpc, onmouseenter: sfxHover }, t(lang, "talk_npc")),
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-save", onclick: save, onmouseenter: sfxHover }, t(lang, "save_game")),
        savedMsgVisible ? h("span", { class: "saved", "data-testid": "saved-msg" }, t(lang, "saved")) : null,
        h("div", { class: "safe-stats" },
          h("div", {}, `${t(lang, "deck_label")}: `, h("span", { style: { color: "var(--accent-bone)" } }, String(game.save.deck.length))),
          h("div", {}, `${t(lang, "corruption_label")}: `, h("span", { style: { color: "var(--accent-glow)" } }, String(game.save.corruption || 0))),
        ),
      ),
      h("div", { class: "cabin-scene", "data-testid": "cabin-scene" },
        h("div", { class: "cabin-window" }, h("div", { class: "cabin-moon breathe-slow" })),
        h("div", { class: "cabin-candle" },
          h("div", { class: "flame" }),
          h("div", { class: "wax" }),
          h("div", { class: "holder" }),
        ),
        h("div", { class: "cabin-mirror", "data-testid": "mirror", onclick: enterShadow }),
        (game.save.visitedSafe || 0) > 2
          ? h("div", { style: { position: "absolute", top: "8px", right: "16px", fontFamily: "Special Elite, monospace", fontSize: "10px", opacity: 0.3, color: "var(--accent-blood)" }, "data-testid": "hidden-text" }, lang === "pt" ? "ele está aqui." : "it is here.")
          : null,
      ),
    ),
    deckVisible ? h("div", { class: "modal-backdrop", "data-testid": "deck-modal" },
      h("div", { class: "modal" },
        h("h3", {}, t(lang, "deck_title")),
        h("div", { class: "modal-grid" },
          ...game.save.deck.map((cid, i) => {
            const d = CARDS[cid];
            const inst = { ...d, currentAttack: d.attack, currentHealth: d.health };
            return renderCard(inst, { small: true, lang, testId: `deck-card-${i}` });
          }),
        ),
        h("div", { class: "modal-actions" },
          h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-close-deck", onclick: closeDeck }, t(lang, "deck_close")),
        ),
      ),
    ) : null,
    npcVisible ? h("div", { class: "npc-modal", "data-testid": "npc-modal" },
      h("div", { class: "inner" },
        h("div", { class: "npc-label" }, t(lang, "npc_name")),
        h("p", { class: "npc-text cursor-blink", "data-testid": "npc-text" }, npcTyped),
        h("div", { class: "npc-actions" },
          h("button", { class: "btn-diegetic btn-bracket", "data-testid": "btn-npc-next", onclick: advanceNpc }, t(lang, "next")),
        ),
      ),
    ) : null,
  );
}
