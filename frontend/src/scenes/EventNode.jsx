// Event node scene.
import { useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { pickEvent, advance } from "../lib/run";
import { sfxClick, sfxGlitch } from "../lib/audio";

export function EventNode() {
  const { save, activeRun, setActiveRun, setScene, triggerGlitch } = useGame();
  const lang = save.language;
  const [event] = useState(() => pickEvent());
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    triggerGlitch();
    sfxGlitch();
  }, [triggerGlitch]);

  if (!activeRun) {
    setScene("safe");
    return null;
  }

  const choose = (opt) => {
    sfxClick();
    const newRun = advance(opt.effect(activeRun));
    setActiveRun(newRun);
    setResolved(true);
    setTimeout(() => setScene("shadow"), 700);
  };

  return (
    <div className="screen w-full h-full p-8 flex flex-col items-center justify-center shadow-realm" data-testid="event-scene">
      <div className="max-w-2xl text-center">
        <h2 className="font-display text-3xl tracking-widest mb-6" style={{ color: "var(--accent-glow)" }} data-testid="event-title">
          {t(lang, event.titleKey)}
        </h2>
        <p className="font-narrative text-lg leading-relaxed mb-10" style={{ color: "var(--text-primary)" }} data-testid="event-text">
          {t(lang, event.textKey)}
        </p>
        {!resolved && (
          <div className="flex flex-col gap-3 items-center">
            {event.options.map((opt, i) => (
              <button
                key={i}
                className="btn-diegetic btn-bracket font-narrative text-base"
                onClick={() => choose(opt)}
                data-testid={`event-option-${i}`}
              >
                {t(lang, opt.labelKey)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
