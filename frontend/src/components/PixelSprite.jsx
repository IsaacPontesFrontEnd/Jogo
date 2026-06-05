// Renders a sprite (2D color-index array) as crisp pixel art using SVG <rect>s.
import { PALETTE } from "../data/cards";

export function PixelSprite({ sprite, size = 80, palette = PALETTE }) {
  if (!sprite || !sprite.length) return null;
  const rows = sprite.length;
  const cols = sprite[0].length;
  const px = size / cols;
  const py = size / rows;

  const rects = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = sprite[y][x];
      const color = palette[v];
      if (!color || color === "transparent") continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x * px}
          y={y * py}
          width={px + 0.5}
          height={py + 0.5}
          fill={color}
          shapeRendering="crispEdges"
        />,
      );
    }
  }

  return (
    <svg
      width={size}
      height={size * (rows / cols)}
      viewBox={`0 0 ${size} ${size * (rows / cols)}`}
      style={{ imageRendering: "pixelated" }}
      className="pixel"
    >
      {rects}
    </svg>
  );
}
