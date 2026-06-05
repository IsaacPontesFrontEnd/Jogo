import { h } from "../render.js";
import { game, setScene, setRun } from "../main.js";
import { t } from "../data/translations.js";
import { CARDS } from "../data/cards.js";
import { renderCard } from "../cardRenderer.js";
import { advance } from "../lib/run.js";
import { sfxClick } from "../lib/audio.js";

let upgrading = false;

export function renderRest() {
  if (!game.activeRun) { setScene("safe"); return h("div"); }
  const lang = game.save.language;
  const run = game.activeRun;

  const heal = () => {
    sfxClick();
    setRun(advance({ ...run, playerHp: Math.min(run.playerMaxHp, run.playerHp + 3) }));
    upgrading = false;
    setTimeout(() => setScene("shadow"), 250);
  };
  const beginUpgrade = () => { sfxClick(); upgrading = true; setScene("rest"); };
  const pick = (idx) => {
    sfxClick();
    const newDeck = [...run.deck];
    newDeck.push(newDeck[idx]);
    setRun(advance({ ...run, deck: newDeck }));
    upgrading = false;
    setTimeout(() => setScene("shadow"), 250);
  };
  const leave = () => { sfxClick(); upgrading = false; setRun(advance(run)); setScene("shadow"); };

  if (!upgrading) {
    return h("section", { class: "shadow", "data-testid": "rest-scene", style: { alignItems: "center" } },
      h("h2", { "data-testid": "rest-title", style: { color: "var(--accent-glow)", fontFamily: "IM Fell English SC, serif", fontSize: "2rem", letterSpacing: ".15em" } }, t(lang, "rest_title")),
      h("p", {}, `${t(lang, "health_label")}: `, h("span", { style: { color: "var(--accent-bone)" } }, `${run.playerHp}/${run.playerMaxHp}`)),
      h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: ".75rem", marginTop: "2rem", fontFamily: "Special Elite, monospace", fontSize: "1.1rem" } },
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "rest-heal", onclick: heal }, t(lang, "rest_heal")),
        h("button", { class: "btn-diegetic btn-bracket", "data-testid": "rest-upgrade", onclick: beginUpgrade }, t(lang, "rest_upgrade")),
        h("button", { class: "btn-diegetic", "data-testid": "rest-leave", onclick: leave }, t(lang, "rest_leave")),
      ),
    );
  }

  return h("section", { class: "shadow", "data-testid": "rest-scene", style: { alignItems: "center" } },
    h("h2", { style: { color: "var(--accent-glow)", fontFamily: "IM Fell English SC, serif", fontSize: "2rem", letterSpacing: ".15em" } }, t(lang, "rest_title")),
    h("p", { style: { fontFamily: "Special Elite, monospace", marginTop: "1rem" } },
      lang === "pt" ? "Escolha uma carta para duplicar." : "Choose a card to duplicate."),
    h("div", { style: { display: "flex", flexWrap: "wrap", gap: ".75rem", justifyContent: "center", maxWidth: "1100px", maxHeight: "440px", overflowY: "auto", marginTop: "1rem" } },
      ...run.deck.map((cid, i) => {
        const d = CARDS[cid];
        const inst = { ...d, currentAttack: d.attack, currentHealth: d.health };
        return h("div", { onclick: () => pick(i), "data-testid": `upgrade-pick-${i}` },
          renderCard(inst, { small: true, lang }));
      }),
    ),
  );
}
