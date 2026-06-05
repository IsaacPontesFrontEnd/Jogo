// Global CRT/vignette/grain overlay. Renders ABOVE the game content.
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";

export function CrtOverlay() {
  const { glitchPulse } = useGame();
  const [tear, setTear] = useState(false);

  useEffect(() => {
    if (glitchPulse === 0) return;
    setTear(true);
    const t = setTimeout(() => setTear(false), 400);
    return () => clearTimeout(t);
  }, [glitchPulse]);

  return (
    <>
      <div className="film-grain" data-testid="film-grain" />
      <div className="crt-scanlines" data-testid="crt-scanlines" />
      <div className="crt-vignette" data-testid="crt-vignette" />
      <div className="crt-flicker" />
      {tear && (
        <div
          className="screen-tear fixed inset-0 pointer-events-none z-[9100]"
          style={{
            background:
              "linear-gradient(90deg, rgba(168,48,37,0.18), rgba(0,255,247,0.12), rgba(168,48,37,0.18))",
            mixBlendMode: "screen",
          }}
          data-testid="screen-tear-overlay"
        />
      )}
    </>
  );
}
