import { h } from "../render.js";
import { game, setScene, commitSave } from "../main.js";
import { t } from "../data/translations.js";
import { sfxClick, sfxHover, unlock } from "../lib/audio.js";
import { newSave } from "../lib/save.js";

export function renderMenu() {
  const lang = game.save.language;
  const hasContinue = (game.save.runsCompleted || 0) + (game.save.deaths || 0) > 0;
  const corrupted = hasContinue;

  const handleNew = () => {
    unlock(); sfxClick();
    const fresh = newSave();
    game.save = { ...fresh, language: game.save.language, audioEnabled: game.save.audioEnabled };
    commitSave({});
    setScene("safe");
  };
  const handleContinue = () => { unlock(); sfxClick(); setScene("safe"); };
  const setLang = (l) => { sfxClick(); commitSave({ language: l }); };
  const toggleAudio = () => { sfxClick(); commitSave({ audioEnabled: !game.save.audioEnabled }); };

  return h("section", { class: "menu", "data-testid": "main-menu" },
    h("h1", { class: "title", "data-testid": "game-title" }, t(lang, "game_title")),
    h("p", { class: "subtitle" },
      corrupted ? (lang === "pt" ? "você voltou." : "you returned.") : t(lang, "game_subtitle"),
    ),
    h("nav", {},
      hasContinue ? h("button", {
        class: "btn-diegetic btn-bracket",
        "data-testid": "menu-continue",
        onclick: handleContinue,
        onmouseenter: sfxHover,
      }, t(lang, "continue")) : null,
      h("button", {
        class: "btn-diegetic btn-bracket",
        "data-testid": "menu-new-game",
        onclick: handleNew,
        onmouseenter: sfxHover,
      }, t(lang, "new_game")),
      h("div", { style: { display: "flex", gap: ".75rem", alignItems: "center", marginTop: "1rem" } },
        h("span", { class: "font-ui", style: { fontSize: ".85rem", color: "var(--text-muted)" } }, t(lang, "language") + ":"),
        h("button", {
          class: "btn-diegetic", "data-testid": "lang-pt",
          style: { color: lang === "pt" ? "var(--accent-glow)" : "var(--text-muted)" },
          onclick: () => setLang("pt"),
        }, "PT"),
        h("button", {
          class: "btn-diegetic", "data-testid": "lang-en",
          style: { color: lang === "en" ? "var(--accent-glow)" : "var(--text-muted)" },
          onclick: () => setLang("en"),
        }, "EN"),
      ),
      h("div", { style: { display: "flex", gap: ".75rem", alignItems: "center" } },
        h("span", { class: "font-ui", style: { fontSize: ".85rem", color: "var(--text-muted)" } }, t(lang, "audio") + ":"),
        h("button", {
          class: "btn-diegetic", "data-testid": "toggle-audio",
          style: { color: game.save.audioEnabled ? "var(--accent-glow)" : "var(--text-muted)" },
          onclick: toggleAudio,
        }, game.save.audioEnabled ? t(lang, "audio_on") : t(lang, "audio_off")),
      ),
    ),
    h("div", { class: "candle breathe-slow", style: { left: "2rem" } }),
    h("div", { class: "candle breathe-slow", style: { right: "2rem" } }),
  );
}
