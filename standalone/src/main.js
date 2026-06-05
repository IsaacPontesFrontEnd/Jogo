// Game state + scene routing for the standalone build.
import { loadSave, persistSave, newSave } from "./lib/save.js";
import { setEnabled as setAudioEnabled, startAmbient, stopAmbient, unlock } from "./lib/audio.js";
import { renderMenu } from "./scenes/menu.js";
import { renderSafe } from "./scenes/safe.js";
import { renderShadow } from "./scenes/shadow.js";
import { renderBattle } from "./scenes/battle.js";
import { renderEvent } from "./scenes/event.js";
import { renderShop } from "./scenes/shop.js";
import { renderRest } from "./scenes/rest.js";
import { renderGameOver } from "./scenes/gameover.js";

const app = document.getElementById("app");

export const game = {
  scene: "menu",
  save: loadSave() || newSave(),
  activeRun: null,
  activeNode: null,
};

export function setScene(name) {
  game.scene = name;
  render();
}

export function commitSave(patch) {
  game.save = { ...game.save, ...patch };
  persistSave(game.save);
  render();
}

export function setRun(run) {
  game.activeRun = run;
  render();
}

export function setActiveNode(node) {
  game.activeNode = node;
  render();
}

export function triggerGlitch() {
  const el = document.getElementById("screen-tear");
  if (!el) return;
  el.style.display = "block";
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "screen-tear .4s steps(4) 1";
  setTimeout(() => { el.style.display = "none"; }, 420);
}

function applyShadowClass() {
  const isShadow = ["shadow", "battle", "event", "shop", "rest"].includes(game.scene);
  app.classList.toggle("shadow-realm", isShadow);
  document.body.classList.toggle("shadow-realm", isShadow);
}

function ambientForScene() {
  if (["menu", "safe"].includes(game.scene)) startAmbient("safe");
  else if (["shadow", "battle", "event", "shop", "rest"].includes(game.scene)) startAmbient("shadow");
  else if (game.scene === "gameover") stopAmbient();
}

export function render() {
  applyShadowClass();
  setAudioEnabled(!!game.save.audioEnabled);
  ambientForScene();
  while (app.firstChild) app.removeChild(app.firstChild);
  let node;
  switch (game.scene) {
    case "menu":     node = renderMenu(); break;
    case "safe":     node = renderSafe(); break;
    case "shadow":   node = renderShadow(); break;
    case "battle":   node = renderBattle(); break;
    case "event":    node = renderEvent(); break;
    case "shop":     node = renderShop(); break;
    case "rest":     node = renderRest(); break;
    case "gameover": node = renderGameOver(); break;
    default:         node = renderMenu();
  }
  app.appendChild(node);
}

// Unlock Web Audio on first interaction
document.addEventListener("click", () => unlock(), { once: true });

render();
