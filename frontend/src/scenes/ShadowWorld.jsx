// The Shadow World - roguelike map.
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { sfxClick, sfxHover } from "../lib/audio";

const NODE_ICONS = {
  battle: "⚔",
  event: "?",
  shop: "$",
  rest: "z",
  boss: "✶",
};

const NODE_KEY = {
  battle: "node_battle",
  event: "node_event",
  shop: "node_shop",
  rest: "node_rest",
  boss: "node_boss",
};

export function ShadowWorld() {
  const { save, activeRun, setActiveNode, setScene } = useGame();
  const lang = save.language;

  if (!activeRun) {
    setScene("safe");
    return null;
  }

  const enter = (idx) => {
    if (idx !== activeRun.currentIdx) return;
    sfxClick();
    const node = activeRun.nodes[idx];
    setActiveNode({ ...node, idx });
    if (node.type === "battle" || node.type === "boss") setScene("battle");
    else if (node.type === "event") setScene("event");
    else if (node.type === "shop") setScene("shop");
    else if (node.type === "rest") setScene("rest");
  };

  return (
    <div className="screen w-full h-full p-8 flex flex-col shadow-realm" data-testid="shadow-world">
      <header>
        <h2 className="font-display text-3xl tracking-widest" style={{ color: "var(--accent-glow)" }} data-testid="shadow-title">
          {t(lang, "shadow_title")}
        </h2>
        <p className="font-narrative text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t(lang, "health_label")}: <span style={{ color: "var(--accent-bone)" }}>{activeRun.playerHp}/{activeRun.playerMaxHp}</span>
          {"  "}|{"  "}{t(lang, "corruption_label")}: <span style={{ color: "var(--accent-glow)" }}>{activeRun.corruption}</span>
          {"  "}|{"  "}{t(lang, "deck_label")}: <span style={{ color: "var(--accent-bone)" }}>{activeRun.deck.length}</span>
        </p>
      </header>

      <div className="flex-1 flex items-center justify-center" data-testid="map-container">
        <svg viewBox="0 0 800 200" className="w-full max-w-4xl">
          {/* Path lines */}
          {activeRun.nodes.map((n, i) => {
            if (i === activeRun.nodes.length - 1) return null;
            const x1 = 80 + i * 160;
            const x2 = 80 + (i + 1) * 160;
            return (
              <line
                key={`l-${i}`}
                x1={x1}
                y1={100}
                x2={x2}
                y2={100}
                stroke="var(--border-diegetic)"
                strokeDasharray="4 6"
                strokeWidth="2"
              />
            );
          })}
          {/* Nodes */}
          {activeRun.nodes.map((n, i) => {
            const x = 80 + i * 160;
            const isCurrent = i === activeRun.currentIdx;
            const isDone = n.done;
            const fill = isDone ? "#1a1c28" : isCurrent ? "var(--accent-blood)" : "#0a0b0e";
            const stroke = isCurrent ? "var(--accent-glow)" : "var(--border-diegetic)";
            return (
              <g
                key={i}
                onClick={() => enter(i)}
                onMouseEnter={isCurrent ? sfxHover : undefined}
                style={{ cursor: isCurrent ? "pointer" : "default" }}
                className={isCurrent ? "node-current" : ""}
                data-testid={`map-node-${i}`}
              >
                <rect x={x - 28} y={72} width={56} height={56} fill={fill} stroke={stroke} strokeWidth="2" transform={`rotate(45 ${x} 100)`} />
                <text x={x} y={106} textAnchor="middle" fontSize="22" fill="var(--text-primary)" fontFamily="VT323, monospace">
                  {NODE_ICONS[n.type]}
                </text>
                <text x={x} y={158} textAnchor="middle" fontSize="14" fill="var(--text-muted)" fontFamily="VT323, monospace">
                  {t(lang, NODE_KEY[n.type])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <footer className="font-ui text-xs flex gap-6" style={{ color: "var(--text-muted)" }}>
        <span><span style={{ color: "var(--accent-glow)" }}>◆</span> {t(lang, "map_legend_current")}</span>
        <span><span style={{ color: "var(--border-diegetic)" }}>◆</span> {t(lang, "map_legend_done")}</span>
      </footer>
    </div>
  );
}
