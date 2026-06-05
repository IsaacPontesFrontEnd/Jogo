import { h } from "../render.js";
import { game, setScene, setRun, triggerGlitch } from "../main.js";
import { t } from "../data/translations.js";
import { pickEvent, advance } from "../lib/run.js";
import { sfxClick, sfxGlitch } from "../lib/audio.js";

let currentEvent = null;

export function renderEvent() {
  if (!game.activeRun) { setScene("safe"); return h("div"); }
  const lang = game.save.language;
  if (!currentEvent) {
    currentEvent = pickEvent();
    triggerGlitch(); sfxGlitch();
  }
  const choose = (opt) => {
    sfxClick();
    const newRun = advance(opt.effect(game.activeRun));
    currentEvent = null;
    setRun(newRun);
    setTimeout(() => setScene("shadow"), 350);
  };
  return h("section", {
    class: "shadow", "data-testid": "event-scene",
    style: { alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" },
  },
    h("div", { style: { maxWidth: "640px", textAlign: "center", padding: "2rem" } },
      h("h2", { "data-testid": "event-title", style: { color: "var(--accent-glow)", fontFamily: "IM Fell English SC, serif", fontSize: "2rem", letterSpacing: ".15em", marginBottom: "1.5rem" } }, t(lang, currentEvent.titleKey)),
      h("p", { "data-testid": "event-text", style: { fontFamily: "Special Elite, monospace", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "2rem" } }, t(lang, currentEvent.textKey)),
      h("div", { style: { display: "flex", flexDirection: "column", gap: ".75rem", alignItems: "center" } },
        ...currentEvent.options.map((opt, i) =>
          h("button", { class: "btn-diegetic btn-bracket", "data-testid": `event-option-${i}`, onclick: () => choose(opt) }, t(lang, opt.labelKey)),
        ),
      ),
    ),
  );
}
