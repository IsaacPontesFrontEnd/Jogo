// Pure Web Audio API synthesis - no external files.
// Provides ambient drones, click feedback, glitch zaps and combat thuds.
let ctx = null;
let masterGain = null;
let ambientNodes = [];
let enabled = true;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(ctx.destination);
  return ctx;
}

export function setEnabled(v) {
  enabled = v;
  if (masterGain) masterGain.gain.value = v ? 0.3 : 0;
}

export function unlock() {
  // Browsers require user gesture - call this from a click handler.
  const c = ensureCtx();
  if (c && c.state === "suspended") c.resume();
}

function gain(value, dest = masterGain) {
  const g = ctx.createGain();
  g.gain.value = value;
  g.connect(dest);
  return g;
}

// ------------ AMBIENT DRONE ------------
export function startAmbient(mood = "safe") {
  stopAmbient();
  if (!ensureCtx() || !enabled) return;

  const now = ctx.currentTime;
  const baseFreq = mood === "shadow" ? 48 : 64;

  // Low drone
  const o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.value = baseFreq;
  const g1 = gain(0.18);
  o1.connect(g1);
  o1.start(now);

  // Slight detune oscillator
  const o2 = ctx.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.value = baseFreq * 1.005;
  const g2 = gain(0.04);
  o2.connect(g2);
  o2.start(now);

  // LFO modulating amplitude of o1
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.08;
  lfo.connect(lfoG);
  lfoG.connect(g1.gain);
  lfo.start(now);

  // Highpass + filter for "abafado"
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = mood === "shadow" ? 320 : 480;
  g1.disconnect();
  g2.disconnect();
  g1.connect(filt);
  g2.connect(filt);
  filt.connect(masterGain);

  ambientNodes = [o1, o2, lfo];
}

export function stopAmbient() {
  ambientNodes.forEach((n) => {
    try {
      n.stop();
      n.disconnect();
    } catch (e) {
      /* noop */
    }
  });
  ambientNodes = [];
}

// ------------ ONE-SHOTS ------------
function envOsc(freq, type, durMs, vol = 0.25, freqEnd = null) {
  if (!ensureCtx() || !enabled) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, now);
  if (freqEnd != null) {
    o.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + durMs / 1000);
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(vol, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, now + durMs / 1000);
  o.connect(g);
  g.connect(masterGain);
  o.start(now);
  o.stop(now + durMs / 1000 + 0.05);
}

export function sfxClick() {
  envOsc(220, "square", 80, 0.12, 110);
}

export function sfxHover() {
  envOsc(440, "triangle", 40, 0.05);
}

export function sfxCardPlay() {
  envOsc(180, "triangle", 200, 0.25, 90);
  setTimeout(() => envOsc(90, "sine", 250, 0.18), 60);
}

export function sfxHit() {
  envOsc(70, "sawtooth", 200, 0.3, 35);
}

export function sfxSacrifice() {
  envOsc(120, "sawtooth", 350, 0.3, 30);
  setTimeout(() => envOsc(40, "sine", 500, 0.2), 80);
}

export function sfxGlitch() {
  if (!ensureCtx() || !enabled) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(800 + Math.random() * 1200, now);
  o.frequency.linearRampToValueAtTime(100, now + 0.15);
  const g = gain(0.12);
  o.connect(g);
  o.start(now);
  o.stop(now + 0.15);
}

export function sfxVictory() {
  envOsc(220, "triangle", 600, 0.18, 440);
}

export function sfxDefeat() {
  envOsc(220, "sawtooth", 900, 0.22, 55);
}
