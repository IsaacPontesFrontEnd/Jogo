// Pixel sprite + Card renderers for the standalone vanilla version.
import { h, svgEl } from "./render.js";
import { PALETTE, CARDS } from "./data/cards.js";

export function pixelSprite(sprite, size = 64) {
  if (!sprite || !sprite.length) return h("div");
  const rows = sprite.length;
  const cols = sprite[0].length;
  const px = size / cols;
  const py = size / rows;
  const svg = svgEl("svg", {
    width: size,
    height: size * (rows / cols),
    viewBox: `0 0 ${size} ${size * (rows / cols)}`,
    style: "image-rendering: pixelated",
  });
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = sprite[y][x];
      const color = PALETTE[v];
      if (!color || color === "transparent") continue;
      svg.appendChild(
        svgEl("rect", {
          x: x * px,
          y: y * py,
          width: px + 0.5,
          height: py + 0.5,
          fill: color,
          "shape-rendering": "crispEdges",
        }),
      );
    }
  }
  return svg;
}

// card: instance with currentAttack/currentHealth.
// opts: { onClick, onHover, onLeave, selected, disabled, small, lang, testId }
export function renderCard(card, opts = {}) {
  const { onClick, onHover, onLeave, selected, disabled, small, lang = "pt", testId } = opts;
  if (!card) return h("div");
  const def = CARDS[card.id] || card;
  const name = def.name?.[lang] ?? def.name?.pt ?? def.id;
  const klass = `h-card ${small ? "small" : ""} ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`;
  const el = h(
    "div",
    {
      class: klass.trim(),
      "data-testid": testId || `card-${card.id}`,
      onclick: disabled ? null : onClick,
      onmouseenter: onHover,
      onmouseleave: onLeave,
    },
    h("div", { class: "cost" }, h("span", { style: { fontSize: "10px" } }, "●"), String(def.cost)),
    h("div", { class: "name" }, name),
    h(
      "div",
      { class: "sprite" },
      h("div", { class: "sprite-box" }, pixelSprite(def.sprite, small ? 48 : 64)),
    ),
    h("div", { class: "atk" }, String(card.currentAttack ?? def.attack)),
    h("div", { class: "hp" }, String(card.currentHealth ?? def.health)),
  );
  return el;
}
