import { h, svgEl } from "../render.js";
import { game, setScene, setActiveNode } from "../main.js";
import { t } from "../data/translations.js";
import { sfxClick, sfxHover } from "../lib/audio.js";

const NODE_ICONS = { battle: "⚔", event: "?", shop: "$", rest: "z", boss: "✶" };
const NODE_KEY  = { battle: "node_battle", event: "node_event", shop: "node_shop", rest: "node_rest", boss: "node_boss" };

export function renderShadow() {
  const lang = game.save.language;
  const run = game.activeRun;
  if (!run) { setScene("safe"); return h("div"); }

  const enter = (idx) => {
    if (idx !== run.currentIdx) return;
    sfxClick();
    const node = run.nodes[idx];
    setActiveNode({ ...node, idx });
    if (node.type === "battle" || node.type === "boss") setScene("battle");
    else if (node.type === "event") setScene("event");
    else if (node.type === "shop")  setScene("shop");
    else if (node.type === "rest")  setScene("rest");
  };

  const svg = svgEl("svg", { viewBox: "0 0 800 200", style: "width: 100%; max-width: 64rem;" });
  // path lines
  run.nodes.forEach((n, i) => {
    if (i === run.nodes.length - 1) return;
    const x1 = 80 + i * 160;
    const x2 = 80 + (i + 1) * 160;
    svg.appendChild(svgEl("line", {
      x1, y1: 100, x2, y2: 100,
      stroke: "var(--border-diegetic)", "stroke-dasharray": "4 6", "stroke-width": "2",
    }));
  });
  // nodes
  run.nodes.forEach((n, i) => {
    const x = 80 + i * 160;
    const isCurrent = i === run.currentIdx;
    const isDone = n.done;
    const fill = isDone ? "#1a1c28" : isCurrent ? "var(--accent-blood)" : "#0a0b0e";
    const stroke = isCurrent ? "var(--accent-glow)" : "var(--border-diegetic)";

    const g = svgEl("g", {
      "data-testid": `map-node-${i}`,
      style: `cursor: ${isCurrent ? "pointer" : "default"};`,
      class: isCurrent ? "node-current" : "",
      onclick: () => enter(i),
      onmouseenter: isCurrent ? sfxHover : null,
    });
    g.appendChild(svgEl("rect", { x: x - 28, y: 72, width: 56, height: 56, fill, stroke, "stroke-width": "2", transform: `rotate(45 ${x} 100)` }));
    const txt1 = svgEl("text", { x, y: 106, "text-anchor": "middle", "font-size": "22", fill: "var(--text-primary)", "font-family": "VT323, monospace" });
    txt1.textContent = NODE_ICONS[n.type];
    g.appendChild(txt1);
    const txt2 = svgEl("text", { x, y: 158, "text-anchor": "middle", "font-size": "14", fill: "var(--text-muted)", "font-family": "VT323, monospace" });
    txt2.textContent = t(lang, NODE_KEY[n.type]);
    g.appendChild(txt2);

    svg.appendChild(g);
  });

  return h("section", { class: "shadow", "data-testid": "shadow-world" },
    h("header", {},
      h("h2", { "data-testid": "shadow-title" }, t(lang, "shadow_title")),
      h("p", {},
        `${t(lang, "health_label")}: `, h("span", { style: { color: "var(--accent-bone)" } }, `${run.playerHp}/${run.playerMaxHp}`),
        "  |  ",
        `${t(lang, "corruption_label")}: `, h("span", { style: { color: "var(--accent-glow)" } }, String(run.corruption)),
        "  |  ",
        `${t(lang, "deck_label")}: `, h("span", { style: { color: "var(--accent-bone)" } }, String(run.deck.length)),
      ),
    ),
    h("div", { class: "map-container", "data-testid": "map-container" }, svg),
    h("footer", { class: "map-legend" },
      h("span", {}, h("span", { style: { color: "var(--accent-glow)" } }, "◆ "), t(lang, "map_legend_current")),
      h("span", {}, h("span", { style: { color: "var(--border-diegetic)" } }, "◆ "), t(lang, "map_legend_done")),
    ),
  );
}
