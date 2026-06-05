// Main menu scene - first thing user sees.
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { unlock, sfxClick, sfxHover, startAmbient } from "../lib/audio";

export function MainMenu() {
  const { save, setSave, setScene, startNewGame, setLanguage, toggleAudio, triggerGlitch } = useGame();
  const lang = save.language;
  const [hovered, setHovered] = useState(null);
  const [psychTitle, setPsychTitle] = useState(false);

  useEffect(() => {
    // Random title glitch every 8-15 seconds
    const i = setInterval(() => {
      setPsychTitle(true);
      setTimeout(() => setPsychTitle(false), 320);
    }, 9000 + Math.random() * 7000);
    return () => clearInterval(i);
  }, []);

  // Rare event: as runsCompleted grows, occasionally show "you returned" subtitle
  const corrupted = save.runsCompleted > 0 || save.deaths > 0;

  const handleStart = () => {
    unlock();
    startAmbient("safe");
    sfxClick();
    startNewGame();
  };

  const handleContinue = () => {
    unlock();
    startAmbient("safe");
    sfxClick();
    setScene("safe");
  };

  return (
    <div className="screen w-full h-full flex flex-col items-center justify-center relative" data-testid="main-menu">
      {/* Title */}
      <div className="text-center mb-12 select-none">
        <h1
          className={`font-display text-6xl sm:text-7xl tracking-[0.4em] ${psychTitle ? "glitch" : ""}`}
          data-text={t(lang, "game_title")}
          style={{ color: "var(--text-primary)", textShadow: "0 0 24px rgba(168,48,37,0.3)" }}
          data-testid="game-title"
        >
          {t(lang, "game_title")}
        </h1>
        <p
          className="font-narrative text-sm mt-4 tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {corrupted ? (lang === "pt" ? "você voltou." : "you returned.") : t(lang, "game_subtitle")}
        </p>
      </div>

      {/* Menu options */}
      <nav className="flex flex-col items-start gap-3 font-narrative text-xl">
        {save.deck && save.runsCompleted + save.deaths > 0 && (
          <button
            className="btn-diegetic btn-bracket"
            onClick={handleContinue}
            onMouseEnter={() => { setHovered("continue"); sfxHover(); }}
            data-testid="menu-continue"
          >
            {t(lang, "continue")}
          </button>
        )}
        <button
          className="btn-diegetic btn-bracket"
          onClick={handleStart}
          onMouseEnter={() => { setHovered("new"); sfxHover(); }}
          data-testid="menu-new-game"
        >
          {t(lang, "new_game")}
        </button>
        <div className="flex items-center gap-3 mt-4">
          <span className="font-ui text-sm" style={{ color: "var(--text-muted)" }}>{t(lang, "language")}:</span>
          <button
            onClick={() => { setLanguage("pt"); sfxClick(); }}
            className="btn-diegetic"
            style={{ color: lang === "pt" ? "var(--accent-glow)" : "var(--text-muted)" }}
            data-testid="lang-pt"
          >PT</button>
          <button
            onClick={() => { setLanguage("en"); sfxClick(); }}
            className="btn-diegetic"
            style={{ color: lang === "en" ? "var(--accent-glow)" : "var(--text-muted)" }}
            data-testid="lang-en"
          >EN</button>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-ui text-sm" style={{ color: "var(--text-muted)" }}>{t(lang, "audio")}:</span>
          <button
            onClick={() => { toggleAudio(); sfxClick(); }}
            className="btn-diegetic"
            style={{ color: save.audioEnabled ? "var(--accent-glow)" : "var(--text-muted)" }}
            data-testid="toggle-audio"
          >
            {save.audioEnabled ? t(lang, "audio_on") : t(lang, "audio_off")}
          </button>
        </div>
      </nav>

      {/* Decorative pixel candle at corners */}
      <div className="absolute bottom-8 left-8 opacity-50 breathe-slow">
        <div className="w-2 h-2" style={{ background: "var(--accent-glow)", boxShadow: "0 0 16px var(--accent-glow)" }} />
      </div>
      <div className="absolute bottom-8 right-8 opacity-50 breathe-slow">
        <div className="w-2 h-2" style={{ background: "var(--accent-glow)", boxShadow: "0 0 16px var(--accent-glow)" }} />
      </div>

      {/* Hidden hover indicator */}
      {hovered && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-ui text-xs opacity-40" data-testid="hover-info">
          {hovered}
        </div>
      )}
    </div>
  );
}
