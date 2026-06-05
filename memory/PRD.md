# VIGILIA — Psychological Horror Card Game

## Original problem statement
Browser-based psychological horror card game inspired by Inscryption. Atmosphere, mystery, card game and roguelike elements. HTML/CSS/JS in the browser. Optional Python backend. Vertical slice prioritising quality over quantity.

## User choices
- Local save (localStorage, no backend)
- Pixel art via CSS/SVG (no external images)
- Web Audio API for synthesized audio
- Bilingual PT/EN with in-game toggle
- Roguelike run with 3-5 nodes (battle/event/shop/rest/boss) + Safe Environment

## Implemented (as of Feb 2026)
- Legacy React scaffold at `/app/frontend` (not required to play)
- **Standalone vanilla HTML/CSS/JS build launched by `/app/index.html`** (runs in VSCode Live Server)
- Main Menu (bilingual title + lang/audio toggles)
- Safe Environment "A Cabana" (deck modal, NPC dialogue with typewriter, save indicator, mirror/candle/window scene)
- Shadow World map (5 diamond nodes: battle, event, shop, rest, boss)
- Battle scene with:
  - Capped mana-style blood resource (Turn N grants min(N, 4) blood, auto-refresh)
  - Mulligan (swap up to 2 starting cards before battle)
  - Cycle action (discard 1 / draw 1, once per turn)
  - Large HP bars + heart/skull icons for both sides
  - Card Info side panel (name/cost/atk/hp/description/effects)
  - Last Action panel + full Combat Log with side coloring
  - Big animated Turn Indicator
  - System message area placeholder (for future psych events)
- Event, Shop, Rest, Game Over scenes
- 8 cards (moth, rat, hound, raven, worm, skull, candle, thing) with custom pixel art sprites
- CRT overlay (scanlines + vignette + film grain + flicker) + screen-tear glitch
- Web Audio synth (ambient drone, hover/click/play/hit/sacrifice/glitch SFX)
- PT/EN translations + structured log translator

## Prioritized backlog
- P0: More card variety + special effects (aura, on-death triggers, flying done)
- P0: Boss-specific behavior and unique boss cards
- P1: NPC dialogue branches based on corruption
- P1: More events (5-6 unique scenarios)
- P1: Relic system (passive run-wide effects)
- P2: Cabin meta-progression (subtle changes per run completion)
- P2: Rare "4th-wall" psych events (interface mutations, fake save corruption messages)
- P2: Settings menu (volume slider, particles toggle)
- P3: Difficulty tiers / endless mode after run 1

## Next tasks
- Wire the new UI/UX improvements (mulligan, card info panel, big HP, blood-cap) into the React build (currently in standalone only)
- Add 2-3 more events to the rotation
- Expand boss encounter with a fixed deck and special intro
