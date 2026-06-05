// Game over scene - after defeat.
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { sfxClick } from "../lib/audio";

export function GameOver() {
  const { save, setScene } = useGame();
  const lang = save.language;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t1);
  }, []);

  // Random psych message
  const msg = t(lang, "psych_messages");
  const psych = Array.isArray(msg) ? msg[Math.floor(Math.random() * msg.length)] : "";

  return (
    <div className="screen w-full h-full flex flex-col items-center justify-center" style={{ background: "var(--surface-shadow)" }} data-testid="gameover-scene">
      <h1
        className="font-display text-6xl tracking-[0.4em] glitch"
        data-text={t(lang, "defeat")}
        style={{ color: "var(--accent-blood)" }}
        data-testid="gameover-title"
      >
        {t(lang, "defeat")}
      </h1>
      {show && (
        <>
          <p className="font-narrative text-sm mt-6 opacity-60" style={{ color: "var(--text-muted)" }} data-testid="gameover-psych">
            {psych}
          </p>
          <button
            className="btn-diegetic btn-bracket mt-12 font-narrative text-lg"
            onClick={() => { sfxClick(); setScene("safe"); }}
            data-testid="btn-return-safe"
          >
            {t(lang, "return_safe")}
          </button>
        </>
      )}
    </div>
  );
}
