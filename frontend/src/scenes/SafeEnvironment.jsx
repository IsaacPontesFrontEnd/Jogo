// The Cabin - safe environment. Deck management, NPC dialogue, enter shadow.
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { t } from "../data/translations";
import { CARDS } from "../data/cards";
import { PixelCard } from "../components/PixelCard";
import { makeRun } from "../lib/run";
import { sfxClick, sfxHover, startAmbient } from "../lib/audio";

export function SafeEnvironment() {
  const { save, setSave, setScene, setActiveRun, triggerGlitch } = useGame();
  const lang = save.language;
  const [showDeck, setShowDeck] = useState(false);
  const [showNpc, setShowNpc] = useState(false);
  const [npcLine, setNpcLine] = useState(0);
  const [typed, setTyped] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  // Increment visit counter once on mount
  useEffect(() => {
    setSave((s) => ({ ...s, visitedSafe: (s.visitedSafe || 0) + 1 }));
    startAmbient("safe");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Random subtle psych: every once in a while trigger a tear after a few seconds
  useEffect(() => {
    if (save.visitedSafe > 1 && Math.random() < 0.35) {
      const t1 = setTimeout(() => triggerGlitch(), 3000 + Math.random() * 4000);
      return () => clearTimeout(t1);
    }
  }, [save.visitedSafe, triggerGlitch]);

  // NPC dialogue selection
  const npcLines = (() => {
    if (save.corruption >= 3) return t(lang, "npc_lines_corrupted");
    if (save.visitedSafe > 1) return t(lang, "npc_lines_post");
    return t(lang, "npc_lines_first");
  })();

  // Typewriter
  useEffect(() => {
    if (!showNpc) return;
    setTyped("");
    const text = npcLines[npcLine] || "";
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [showNpc, npcLine, npcLines]);

  const advanceNpc = () => {
    sfxClick();
    if (npcLine + 1 >= npcLines.length) {
      setShowNpc(false);
      setNpcLine(0);
    } else {
      setNpcLine(npcLine + 1);
    }
  };

  const enterShadow = () => {
    sfxClick();
    const run = makeRun(save.deck);
    setActiveRun(run);
    setScene("shadow");
  };

  const handleSave = () => {
    sfxClick();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1800);
  };

  return (
    <div className="screen w-full h-full p-8 flex flex-col" data-testid="safe-environment">
      {/* Header */}
      <header className="mb-4">
        <h2 className="font-display text-3xl tracking-widest" style={{ color: "var(--text-primary)" }} data-testid="safe-title">
          {t(lang, "safe_title")}
        </h2>
        <p className="font-narrative text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t(lang, "safe_subtitle")}
        </p>
      </header>

      {/* Main split: left = options, right = ambiance scene */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
        <aside className="flex flex-col items-start gap-3 font-narrative text-lg" data-testid="safe-options">
          <button className="btn-diegetic btn-bracket" onClick={enterShadow} onMouseEnter={sfxHover} data-testid="btn-enter-shadow">
            {t(lang, "enter_shadow")}
          </button>
          <button className="btn-diegetic btn-bracket" onClick={() => { sfxClick(); setShowDeck(true); }} onMouseEnter={sfxHover} data-testid="btn-manage-deck">
            {t(lang, "manage_deck")}
          </button>
          <button className="btn-diegetic btn-bracket" onClick={() => { sfxClick(); setShowNpc(true); }} onMouseEnter={sfxHover} data-testid="btn-talk-npc">
            {t(lang, "talk_npc")}
          </button>
          <button className="btn-diegetic btn-bracket" onClick={handleSave} onMouseEnter={sfxHover} data-testid="btn-save">
            {t(lang, "save_game")}
          </button>
          {savedMsg && (
            <span className="font-narrative text-sm" style={{ color: "var(--accent-glow)" }} data-testid="saved-msg">
              {t(lang, "saved")}
            </span>
          )}

          <div className="mt-8 font-ui text-sm opacity-70 leading-relaxed">
            <div>{t(lang, "deck_label")}: <span style={{ color: "var(--accent-bone)" }}>{save.deck.length}</span></div>
            <div>{t(lang, "corruption_label")}: <span style={{ color: "var(--accent-glow)" }}>{save.corruption}</span></div>
          </div>
        </aside>

        {/* Cabin scene: CSS art - candle + window + mirror */}
        <div className="relative" data-testid="cabin-scene">
          {/* Wall */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0b0e 0%, #15161a 70%, #08080b 100%)" }} />
          {/* Window */}
          <div className="absolute top-8 left-12 w-40 h-44 border-4" style={{ borderColor: "var(--border-diegetic)", background: "radial-gradient(circle at 30% 30%, #1a1f2d 0%, #050508 80%)" }}>
            <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: "var(--border-diegetic)" }} />
            <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: "var(--border-diegetic)" }} />
            {/* Moon */}
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full breathe-slow" style={{ background: "#d9c9a8", boxShadow: "0 0 24px rgba(217,201,168,0.4)" }} />
          </div>
          {/* Candle on a table */}
          <div className="absolute bottom-16 right-16">
            <div className="w-4 h-4 mx-auto -mb-2 rounded-full breathe" style={{ background: "var(--accent-glow)", boxShadow: "0 0 18px var(--accent-glow), 0 0 36px rgba(168,48,37,0.4)" }} />
            <div className="w-2 h-10 mx-auto" style={{ background: "var(--accent-bone)" }} />
            <div className="w-16 h-1.5 mt-1" style={{ background: "var(--border-diegetic)" }} />
          </div>
          {/* Mirror (appears after multiple visits or always - mysterious) */}
          <div className="absolute bottom-8 left-12 w-20 h-32 border-4 cursor-pointer" style={{ borderColor: "var(--accent-blood)", background: "linear-gradient(180deg, #0c0c0f 0%, #1a0a0a 50%, #0c0c0f 100%)" }} onClick={enterShadow} data-testid="mirror">
            <div className="absolute inset-2 opacity-60 breathe">
              <div className="w-full h-full" style={{ background: "radial-gradient(circle at 50% 30%, rgba(168,48,37,0.18), transparent 60%)" }} />
            </div>
          </div>
          {/* Subtle psych - depending on visits, hidden text */}
          {save.visitedSafe > 2 && (
            <div className="absolute top-2 right-4 font-narrative text-[10px] opacity-30" style={{ color: "var(--accent-blood)" }} data-testid="hidden-text">
              {lang === "pt" ? "ele está aqui." : "it is here."}
            </div>
          )}
        </div>
      </div>

      {/* Deck modal */}
      {showDeck && (
        <div className="fixed inset-0 z-[9050] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }} data-testid="deck-modal">
          <div className="p-6 max-w-3xl w-full" style={{ background: "var(--surface-safe)", border: "2px solid var(--border-diegetic)" }}>
            <h3 className="font-display text-2xl mb-4 tracking-widest">{t(lang, "deck_title")}</h3>
            <div className="flex flex-wrap gap-3 max-h-[420px] overflow-y-auto p-2">
              {save.deck.map((cid, i) => {
                const inst = { ...CARDS[cid], currentAttack: CARDS[cid].attack, currentHealth: CARDS[cid].health };
                return <PixelCard key={i} card={inst} small testId={`deck-card-${i}`} />;
              })}
            </div>
            <div className="mt-6">
              <button className="btn-diegetic btn-bracket" onClick={() => { sfxClick(); setShowDeck(false); }} data-testid="btn-close-deck">
                {t(lang, "deck_close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPC modal */}
      {showNpc && (
        <div className="fixed inset-x-0 bottom-0 z-[9050]" data-testid="npc-modal">
          <div className="mx-auto max-w-3xl p-6 m-4" style={{ background: "var(--surface-safe)", border: "2px solid var(--border-diegetic)" }}>
            <div className="font-narrative text-xs mb-2 tracking-widest" style={{ color: "var(--accent-glow)" }}>
              {t(lang, "npc_name")}
            </div>
            <p className="font-narrative text-lg leading-relaxed min-h-[3.5rem] cursor-blink" data-testid="npc-text">
              {typed}
            </p>
            <div className="mt-4 text-right">
              <button className="btn-diegetic btn-bracket" onClick={advanceNpc} data-testid="btn-npc-next">
                {t(lang, "next")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
