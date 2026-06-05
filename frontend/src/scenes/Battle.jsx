// Battle scene - card duel.
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { CARDS } from "../data/cards";
import { PixelCard } from "../components/PixelCard";
import {
  createBattle,
  canAfford,
  sacrifice,
  playCard,
  endPlayerTurn,
  runEnemyTurn,
  drawCard,
} from "../lib/battle";
import { enemyDeckFor, advance } from "../lib/run";
import {
  sfxClick,
  sfxCardPlay,
  sfxHit,
  sfxSacrifice,
  sfxVictory,
  sfxDefeat,
  startAmbient,
} from "../lib/audio";

export function Battle() {
  const { save, setSave, activeRun, setActiveRun, activeNode, setScene, triggerGlitch } = useGame();
  const lang = save.language;
  const [state, setState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // uid
  const [sacrificing, setSacrificing] = useState(false);
  const [sacrificeQueue, setSacrificeQueue] = useState([]); // slot indices

  useEffect(() => {
    if (!activeRun || !activeNode) {
      setScene("safe");
      return;
    }
    startAmbient("shadow");
    const enemyDeck = enemyDeckFor(activeNode);
    const b = createBattle(activeRun.deck, enemyDeck, activeRun.playerMaxHp);
    b.playerHp = activeRun.playerHp;
    setState(b);
  }, [activeRun, activeNode, setScene]);

  // Enemy turn auto-resolve
  useEffect(() => {
    if (!state || state.winner) return;
    if (state.turn === "enemy") {
      const t1 = setTimeout(() => {
        const next = runEnemyTurn(state);
        sfxHit();
        setState(next);
      }, 900);
      return () => clearTimeout(t1);
    }
  }, [state]);

  // Resolve win/loss
  useEffect(() => {
    if (!state || !state.winner) return;
    if (state.winner === "player") {
      sfxVictory();
      setTimeout(() => {
        const newRun = advance({
          ...activeRun,
          playerHp: state.playerHp,
        });
        setActiveRun(newRun);
        if (newRun.currentIdx >= newRun.nodes.length) {
          // Run complete
          setSave((s) => ({ ...s, runsCompleted: (s.runsCompleted || 0) + 1, deck: newRun.deck }));
          setActiveRun(null);
          setScene("safe");
        } else {
          setScene("shadow");
        }
      }, 1800);
    } else {
      sfxDefeat();
      triggerGlitch();
      setTimeout(() => {
        setSave((s) => ({ ...s, deaths: (s.deaths || 0) + 1, corruption: s.corruption + 1 }));
        setActiveRun(null);
        setScene("gameover");
      }, 2200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.winner]);

  if (!state) return null;

  const handleCardClick = (card) => {
    if (state.turn !== "player" || state.winner) return;
    if (!canAfford(state, card)) return;
    sfxClick();
    if (card.cost > 0) {
      // Begin sacrifice flow
      setSelectedCard(card.uid);
      setSacrificing(true);
      setSacrificeQueue([]);
    } else {
      setSelectedCard(card.uid);
      setSacrificing(false);
    }
  };

  const handleSlotClick = (i) => {
    if (state.turn !== "player" || state.winner) return;
    if (sacrificing) {
      if (state.playerBoard[i] && !sacrificeQueue.includes(i)) {
        const next = [...sacrificeQueue, i];
        setSacrificeQueue(next);
        const card = state.hand.find((c) => c.uid === selectedCard);
        if (card && next.length >= card.cost) {
          // commit sacrifices then play card
          let s = sacrifice(state, next);
          // Determine first empty slot to place into (front row)
          const emptyIdx = s.playerBoard.findIndex((c) => c === null);
          if (emptyIdx >= 0) {
            sfxSacrifice();
            s = playCard(s, selectedCard, emptyIdx);
            sfxCardPlay();
          }
          setState(s);
          setSelectedCard(null);
          setSacrificing(false);
          setSacrificeQueue([]);
        } else {
          sfxSacrifice();
        }
      }
      return;
    }
    // Place free card
    if (selectedCard && !state.playerBoard[i]) {
      const next = playCard(state, selectedCard, i);
      sfxCardPlay();
      setState(next);
      setSelectedCard(null);
    }
  };

  const handleEndTurn = () => {
    if (state.turn !== "player" || state.winner) return;
    sfxClick();
    setSelectedCard(null);
    setSacrificing(false);
    setSacrificeQueue([]);
    const after = endPlayerTurn(state);
    setState(after);
  };

  const handleCancel = () => {
    sfxClick();
    setSelectedCard(null);
    setSacrificing(false);
    setSacrificeQueue([]);
  };

  const selectedCardData = selectedCard ? state.hand.find((c) => c.uid === selectedCard) : null;

  return (
    <div className="screen w-full h-full p-4 flex flex-col shadow-realm" data-testid="battle-scene">
      {/* Top HUD */}
      <div className="flex justify-between items-start mb-2 font-ui text-sm">
        <div data-testid="enemy-hp">
          <span style={{ color: "var(--text-muted)" }}>enemy </span>
          <span style={{ color: "var(--accent-bone)" }}>{state.enemyHp}/{state.enemyMaxHp}</span>
          <span className="ml-3" style={{ color: "var(--text-muted)" }}>deck </span>
          <span style={{ color: "var(--accent-bone)" }}>{state.enemyDeck.length}</span>
        </div>
        <div className="font-narrative" data-testid="turn-indicator" style={{ color: state.turn === "player" ? "var(--accent-glow)" : "var(--text-muted)" }}>
          {state.turn === "player" ? t(lang, "your_turn") : t(lang, "enemy_turn")} · {state.turnNumber}
        </div>
        <div data-testid="player-hp">
          <span style={{ color: "var(--text-muted)" }}>you </span>
          <span style={{ color: "var(--accent-bone)" }}>{state.playerHp}/{state.playerMaxHp}</span>
          <span className="ml-3" style={{ color: "var(--text-muted)" }}>{t(lang, "blood")} </span>
          <span style={{ color: "var(--accent-glow)" }}>{state.playerBlood}</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ perspective: "1200px" }}>
        {/* Enemy row */}
        <div className="flex gap-3" style={{ transform: "rotateX(8deg)" }} data-testid="enemy-board">
          {state.enemyBoard.map((c, i) => (
            <div key={`e-${i}`} className="h-slot flex items-center justify-center">
              {c && <PixelCard card={c} small testId={`enemy-slot-${i}`} />}
            </div>
          ))}
        </div>
        {/* Mid divider */}
        <div className="w-3/4 h-px" style={{ background: "var(--accent-blood)", opacity: 0.5 }} />
        {/* Player row */}
        <div className="flex gap-3" style={{ transform: "rotateX(-8deg)" }} data-testid="player-board">
          {state.playerBoard.map((c, i) => {
            const isSacTarget = sacrificing && c && !sacrificeQueue.includes(i);
            const isFreeTarget = selectedCardData && !sacrificing && !c;
            return (
              <div
                key={`p-${i}`}
                className={`h-slot flex items-center justify-center ${isSacTarget || isFreeTarget ? "valid-target" : ""}`}
                onClick={() => handleSlotClick(i)}
                data-testid={`player-slot-${i}`}
              >
                {c && (
                  <PixelCard
                    card={c}
                    small
                    selected={sacrificeQueue.includes(i)}
                    testId={`player-card-slot-${i}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex justify-between items-end mt-3">
        <div className="flex gap-2 font-ui text-sm">
          <button className="btn-diegetic btn-bracket" onClick={handleEndTurn} data-testid="btn-end-turn" disabled={state.turn !== "player"}>
            {t(lang, "end_turn")}
          </button>
          {(selectedCard || sacrificing) && (
            <button className="btn-diegetic btn-bracket" onClick={handleCancel} data-testid="btn-cancel">
              {t(lang, "cancel")}
            </button>
          )}
        </div>
        <div className="font-narrative text-xs opacity-70 max-w-[40%] text-right" data-testid="battle-log">
          {state.log.slice(-3).map((l, i) => <div key={i}>{l.text}</div>)}
        </div>
      </div>

      {/* Hand */}
      <div className="mt-3 flex gap-2 justify-center flex-wrap" data-testid="player-hand">
        {state.hand.map((c) => {
          const affordable = canAfford(state, c);
          return (
            <PixelCard
              key={c.uid}
              card={c}
              small
              disabled={!affordable || state.turn !== "player" || !!state.winner}
              selected={selectedCard === c.uid}
              onClick={() => handleCardClick(c)}
              testId={`hand-card-${c.uid}`}
            />
          );
        })}
      </div>

      {/* Sacrifice prompt */}
      {sacrificing && selectedCardData && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 z-[9050] font-narrative text-center pointer-events-none" style={{ background: "rgba(5,5,8,0.92)", border: "1px solid var(--accent-blood)" }} data-testid="sacrifice-prompt">
          <div className="text-lg" style={{ color: "var(--accent-glow)" }}>{t(lang, "sacrifice_prompt")}</div>
          <div className="text-sm mt-1">{selectedCardData.name[lang] || selectedCardData.name.pt}</div>
          <div className="text-xs mt-2 opacity-70">{sacrificeQueue.length} / {selectedCardData.cost}</div>
        </div>
      )}
    </div>
  );
}
