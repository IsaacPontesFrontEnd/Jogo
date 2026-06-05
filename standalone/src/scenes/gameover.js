import { h } from "../render.js";
import { game, setScene } from "../main.js";
import { t } from "../data/translations.js";
import { sfxClick } from "../lib/audio.js";

export function renderGameOver() {
  const lang = game.save.language;
  const msgs = t(lang, "psych_messages");
  const psych = Array.isArray(msgs) ? msgs[Math.floor(Math.random() * msgs.length)] : "";
  return h("section", { class: "gameover", "data-testid": "gameover-scene" },
    h("h1", { class: "title glitch", "data-text": t(lang, "defeat"), "data-testid": "gameover-title" }, t(lang, "defeat")),
    h("p", { class: "psych", "data-testid": "gameover-psych" }, psych),
    h("button", {
      class: "btn-diegetic btn-bracket",
      "data-testid": "btn-return-safe",
      style: { marginTop: "2.5rem", fontFamily: "Special Elite, monospace", fontSize: "1.05rem" },
      onclick: () => { sfxClick(); setScene("safe"); },
    }, t(lang, "return_safe")),
  );
}
