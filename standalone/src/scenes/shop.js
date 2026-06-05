import { h } from "../render.js";
import { game, setScene, setRun } from "../main.js";
import { t } from "../data/translations.js";
import { CARDS } from "../data/cards.js";
import { renderCard } from "../cardRenderer.js";
import { shopOffer, advance } from "../lib/run.js";
import { sfxClick } from "../lib/audio.js";

let offers = null;
let budget = 3;

export function renderShop() {
  if (!game.activeRun) { setScene("safe"); return h("div"); }
  const lang = game.save.language;
  if (!offers) { offers = shopOffer(); budget = 3; }

  const buy = (offer, idx) => {
    if (offer.price > budget) return;
    sfxClick();
    budget -= offer.price;
    setRun({ ...game.activeRun, deck: [...game.activeRun.deck, offer.id] });
    offers = offers.map((o, i) => (i === idx ? null : o));
    setScene("shop");
  };
  const leave = () => {
    sfxClick();
    const newRun = advance(game.activeRun);
    offers = null;
    setRun(newRun);
    setScene("shadow");
  };

  return h("section", { class: "shadow", "data-testid": "shop-scene", style: { alignItems: "center" } },
    h("h2", { "data-testid": "shop-title", style: { color: "var(--accent-glow)", fontFamily: "IM Fell English SC, serif", fontSize: "2rem", letterSpacing: ".15em" } }, t(lang, "shop_title")),
    h("p", {}, `${t(lang, "blood")}: `, h("span", { style: { color: "var(--accent-glow)" } }, String(budget))),
    h("div", { style: { display: "flex", gap: "2rem", marginTop: "2.5rem" }, "data-testid": "shop-offers" },
      ...offers.map((o, i) => {
        if (!o) return h("div", { style: { width: "132px", height: "192px" } });
        const d = CARDS[o.id];
        const inst = { ...d, currentAttack: d.attack, currentHealth: d.health };
        const can = o.price <= budget;
        return h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" } },
          renderCard(inst, { lang, testId: `shop-offer-${i}` }),
          h("div", { style: { color: "var(--accent-glow)", fontFamily: "VT323, monospace" } }, `${o.price} ${t(lang, "blood")}`),
          h("button", {
            class: "btn-diegetic btn-bracket",
            "data-testid": `shop-buy-${i}`,
            onclick: () => buy(o, i),
            disabled: !can,
          }, can ? t(lang, "shop_buy") : t(lang, "shop_no_blood")),
        );
      }),
    ),
    h("div", { style: { marginTop: "3rem" } },
      h("button", { class: "btn-diegetic btn-bracket", "data-testid": "shop-leave", onclick: leave }, t(lang, "shop_leave")),
    ),
  );
}
