// Rest node scene.
import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { CARDS } from "../data/cards";
import { PixelCard } from "../components/PixelCard";
import { advance } from "../lib/run";
import { sfxClick } from "../lib/audio";

export function RestNode() {
  const { save, activeRun, setActiveRun, setScene } = useGame();
  const lang = save.language;
  const [done, setDone] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  if (!activeRun) {
    setScene("safe");
    return null;
  }

  const heal = () => {
    sfxClick();
    setActiveRun(advance({ ...activeRun, playerHp: Math.min(activeRun.playerMaxHp, activeRun.playerHp + 3) }));
    setDone(true);
    setTimeout(() => setScene("shadow"), 500);
  };

  const beginUpgrade = () => {
    sfxClick();
    setUpgrading(true);
  };

  const pickUpgrade = (idx) => {
    sfxClick();
    const newDeck = [...activeRun.deck];
    const base = CARDS[newDeck[idx]];
    // "Upgrade" = duplicate the card (simple permanent effect)
    newDeck.push(base.id);
    setActiveRun(advance({ ...activeRun, deck: newDeck }));
    setDone(true);
    setTimeout(() => setScene("shadow"), 500);
  };

  const leave = () => {
    sfxClick();
    setActiveRun(advance(activeRun));
    setScene("shadow");
  };

  return (
    <div className="screen w-full h-full p-8 flex flex-col items-center shadow-realm" data-testid="rest-scene">
      <h2 className="font-display text-3xl tracking-widest" style={{ color: "var(--accent-glow)" }} data-testid="rest-title">
        {t(lang, "rest_title")}
      </h2>
      <p className="font-ui text-sm mt-1 opacity-75">{t(lang, "health_label")}: <span style={{ color: "var(--accent-bone)" }}>{activeRun.playerHp}/{activeRun.playerMaxHp}</span></p>

      {!upgrading && !done && (
        <div className="flex flex-col gap-3 mt-12 font-narrative text-lg items-center">
          <button className="btn-diegetic btn-bracket" onClick={heal} data-testid="rest-heal">
            {t(lang, "rest_heal")}
          </button>
          <button className="btn-diegetic btn-bracket" onClick={beginUpgrade} data-testid="rest-upgrade">
            {t(lang, "rest_upgrade")}
          </button>
          <button className="btn-diegetic" onClick={leave} data-testid="rest-leave">
            {t(lang, "rest_leave")}
          </button>
        </div>
      )}

      {upgrading && (
        <div className="mt-10 max-w-4xl">
          <p className="font-narrative text-sm mb-4 text-center opacity-80">
            {lang === "pt" ? "Escolha uma carta para duplicar." : "Choose a card to duplicate."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center max-h-[360px] overflow-y-auto">
            {activeRun.deck.map((cid, i) => {
              const def = CARDS[cid];
              const inst = { ...def, currentAttack: def.attack, currentHealth: def.health };
              return (
                <div key={i} onClick={() => pickUpgrade(i)} data-testid={`upgrade-pick-${i}`}>
                  <PixelCard card={inst} small />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
