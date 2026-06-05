# VIGILIA

A psychological horror card game inspired by Inscryption. It now runs as a
standalone browser-native game: no Node, no React server, no bundler, no backend,
and no preview runtime.

## Run Locally

### VS Code + Live Server

1. Open this `Jogo` folder in VS Code.
2. Right-click `index.html`.
3. Choose `Open with Live Server`.

The game should load immediately at a local HTTP URL such as
`http://127.0.0.1:5500/`.

### Python HTTP Server

```bash
cd path/to/JOGO
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Entry Point

There is only one HTML entry point:

```text
index.html
```

Open that file with Live Server. The game code remains in `standalone/`, but
that folder no longer has its own duplicate HTML launcher.

Do not open the files with `file://`; native ES modules require an HTTP server.

## Portable Game Files

The playable browser-native game lives here:

```text
index.html
standalone/styles.css
standalone/src/**
```

The legacy `frontend`, `backend`, `memory`, and `tests` folders are not required
to play the game.

## Technical Notes

- All runtime JavaScript uses browser ES modules with relative `.js` imports.
- Gameplay state is saved in `localStorage`.
- Audio is synthesized with the Web Audio API after the first click.
- Visual effects are local CSS/SVG/data-URI assets.
- There are no remote scripts, preview proxies, hidden SDKs, or backend calls in
  the standalone runtime.
