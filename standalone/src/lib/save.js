// localStorage save/load for the game.
const KEY = "vigilia.save.v1";

const defaultSave = () => ({
  hasSave: true,
  language: "pt",
  audioEnabled: true,
  deck: ["moth", "moth", "rat", "rat", "hound", "candle"],
  corruption: 0,
  runsCompleted: 0,
  deaths: 0,
  // psych state for menu/safe-environment mutations
  visitedSafe: 0,
  relics: [],
  // ephemeral run-state (persisted so user can continue)
  activeRun: null,
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch (e) {
    return null;
  }
}

export function persistSave(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* quota exceeded - ignore */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* noop */
  }
}

export function newSave() {
  const s = defaultSave();
  persistSave(s);
  return s;
}
