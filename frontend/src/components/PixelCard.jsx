// Card visual component. Receives a card instance (with name/desc maps).
import { PixelSprite } from "./PixelSprite";
import { useGame } from "../contexts/GameContext";

export function PixelCard({ card, onClick, selected = false, disabled = false, dim = false, testId, small = false }) {
  const { save } = useGame();
  const lang = save?.language ?? "pt";
  if (!card) return null;

  const w = small ? 78 : 110;
  const h = small ? 116 : 160;

  return (
    <div
      className={`h-card relative ${selected ? "selected" : ""} ${disabled ? "disabled" : ""} ${dim ? "opacity-70" : ""}`}
      style={{ width: w, height: h }}
      onClick={disabled ? undefined : onClick}
      data-testid={testId || `card-${card.id}`}
    >
      {/* Cost - top-left */}
      <div
        className="absolute top-1 left-1 font-ui text-base flex items-center gap-1"
        style={{ color: "var(--accent-glow)" }}
      >
        <span className="text-xs">●</span>
        <span>{card.cost}</span>
      </div>

      {/* Name - top center */}
      <div
        className="absolute top-1 right-1 font-narrative text-[10px] text-right max-w-[70px] leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {card.name?.[lang] ?? card.name?.pt ?? card.id}
      </div>

      {/* Sprite center */}
      <div className="absolute inset-0 flex items-center justify-center pt-6">
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid var(--border-diegetic)",
            padding: 2,
          }}
        >
          <PixelSprite sprite={card.sprite} size={small ? 48 : 64} />
        </div>
      </div>

      {/* Stats - bottom corners */}
      <div
        className="absolute bottom-1 left-1 font-ui text-lg"
        style={{ color: "var(--accent-glow)" }}
      >
        {card.currentAttack ?? card.attack}
      </div>
      <div
        className="absolute bottom-1 right-1 font-ui text-lg"
        style={{ color: "var(--accent-bone)" }}
      >
        {card.currentHealth ?? card.health}
      </div>

      {/* Diegetic notches */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1" style={{ background: "var(--border-diegetic)" }} />
    </div>
  );
}
