// Shop node scene.
import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { CARDS } from "../data/cards";
import { PixelCard } from "../components/PixelCard";
import { shopOffer, advance } from "../lib/run";
import { sfxClick } from "../lib/audio";

export function ShopNode() {
  const { save, activeRun, setActiveRun, setScene } = useGame();
  const lang = save.language;
  const [offers, setOffers] = useState(() => shopOffer());
  // For simplicity, shop currency is "leftover blood" = a small budget unique to shop, set as: 3
  const [budget, setBudget] = useState(3);

  if (!activeRun) {
    setScene("safe");
    return null;
  }

  const buy = (offer, idx) => {
    if (offer.price > budget) return;
    sfxClick();
    setBudget(budget - offer.price);
    setActiveRun({ ...activeRun, deck: [...activeRun.deck, offer.id] });
    setOffers(offers.map((o, i) => (i === idx ? null : o)));
  };

  const leave = () => {
    sfxClick();
    setActiveRun(advance(activeRun));
    setScene("shadow");
  };

  return (
    <div className="screen w-full h-full p-8 flex flex-col items-center shadow-realm" data-testid="shop-scene">
      <h2 className="font-display text-3xl tracking-widest" style={{ color: "var(--accent-glow)" }} data-testid="shop-title">
        {t(lang, "shop_title")}
      </h2>
      <p className="font-ui text-sm mt-1 opacity-75">{t(lang, "blood")}: <span style={{ color: "var(--accent-glow)" }}>{budget}</span></p>

      <div className="flex gap-8 mt-10" data-testid="shop-offers">
        {offers.map((o, i) => {
          if (!o) return <div key={i} className="w-[110px] h-[160px]" />;
          const def = CARDS[o.id];
          const inst = { ...def, currentAttack: def.attack, currentHealth: def.health };
          const can = o.price <= budget;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <PixelCard card={inst} testId={`shop-offer-${i}`} />
              <div className="font-ui text-sm" style={{ color: "var(--accent-glow)" }}>{o.price} {t(lang, "blood")}</div>
              <button
                className="btn-diegetic btn-bracket text-sm"
                onClick={() => buy(o, i)}
                disabled={!can}
                data-testid={`shop-buy-${i}`}
              >
                {can ? t(lang, "shop_buy") : t(lang, "shop_no_blood")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <button className="btn-diegetic btn-bracket" onClick={leave} data-testid="shop-leave">
          {t(lang, "shop_leave")}
        </button>
      </div>
    </div>
  );
}
