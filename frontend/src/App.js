import { useEffect } from "react";
import "@/App.css";
import { GameProvider, useGame } from "./contexts/GameContext";
import { CrtOverlay } from "./components/CrtOverlay";
import { MainMenu } from "./scenes/MainMenu";
import { SafeEnvironment } from "./scenes/SafeEnvironment";
import { ShadowWorld } from "./scenes/ShadowWorld";
import { Battle } from "./scenes/Battle";
import { EventNode } from "./scenes/EventNode";
import { ShopNode } from "./scenes/ShopNode";
import { RestNode } from "./scenes/RestNode";
import { GameOver } from "./scenes/GameOver";

function SceneRouter() {
  const { scene } = useGame();
  switch (scene) {
    case "menu":
      return <MainMenu />;
    case "safe":
      return <SafeEnvironment />;
    case "shadow":
      return <ShadowWorld />;
    case "battle":
      return <Battle />;
    case "event":
      return <EventNode />;
    case "shop":
      return <ShopNode />;
    case "rest":
      return <RestNode />;
    case "gameover":
      return <GameOver />;
    default:
      return <MainMenu />;
  }
}

function ShellWithOverlay() {
  const { scene } = useGame();
  // Apply shadow-realm class on root when in shadow scenes for global theming
  const isShadow = ["shadow", "battle", "event", "shop", "rest"].includes(scene);

  useEffect(() => {
    document.body.classList.toggle("shadow-realm", isShadow);
  }, [isShadow]);

  return (
    <div className={`w-full h-full ${isShadow ? "shadow-realm" : ""}`} data-testid="game-root">
      <SceneRouter />
      <CrtOverlay />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <ShellWithOverlay />
    </GameProvider>
  );
}

export default App;
