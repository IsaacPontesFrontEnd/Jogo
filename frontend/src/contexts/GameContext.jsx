// Central state of the game: save data, active scene, language, audio, run state.
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadSave, persistSave, newSave } from "../lib/save";
import { setEnabled as setAudioEnabled, startAmbient, stopAmbient } from "../lib/audio";

const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);

export function GameProvider({ children }) {
  const [scene, setScene] = useState("menu"); // menu | safe | shadow | battle | event | shop | rest | gameover
  const [save, setSave] = useState(() => loadSave() || newSave());
  const [activeRun, setActiveRun] = useState(null);
  const [activeNode, setActiveNode] = useState(null); // current node being resolved
  const [battleResult, setBattleResult] = useState(null);
  const [glitchPulse, setGlitchPulse] = useState(0); // increment triggers a one-shot screen-tear effect

  // Sync save on change
  useEffect(() => {
    persistSave(save);
  }, [save]);

  // Audio toggle propagation
  useEffect(() => {
    setAudioEnabled(save.audioEnabled);
  }, [save.audioEnabled]);

  // Switch ambient based on scene
  useEffect(() => {
    if (scene === "menu" || scene === "safe") startAmbient("safe");
    else if (scene === "shadow" || scene === "battle" || scene === "event" || scene === "shop" || scene === "rest") startAmbient("shadow");
    else if (scene === "gameover") stopAmbient();
    return () => {
      /* let scene-changes trigger next start */
    };
  }, [scene]);

  const setLanguage = useCallback((lang) => {
    setSave((s) => ({ ...s, language: lang }));
  }, []);

  const toggleAudio = useCallback(() => {
    setSave((s) => ({ ...s, audioEnabled: !s.audioEnabled }));
  }, []);

  const startNewGame = useCallback(() => {
    const fresh = newSave();
    setSave({ ...fresh, language: save.language, audioEnabled: save.audioEnabled });
    setActiveRun(null);
    setScene("safe");
  }, [save.language, save.audioEnabled]);

  const triggerGlitch = useCallback(() => {
    setGlitchPulse((n) => n + 1);
  }, []);

  const value = {
    scene,
    setScene,
    save,
    setSave,
    activeRun,
    setActiveRun,
    activeNode,
    setActiveNode,
    battleResult,
    setBattleResult,
    glitchPulse,
    triggerGlitch,
    setLanguage,
    toggleAudio,
    startNewGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
