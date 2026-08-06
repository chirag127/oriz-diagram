# oriz-diagram

Diagram-as-code studio — a live **Mermaid** editor in your browser.
**Live: https://diagram.oriz.in**

Type a diagram in text, watch it render instantly, export **SVG** or **PNG**. Ships templates for flowchart, sequence, ER, gantt, and class diagrams. Optional AI turns plain English into Mermaid and fixes broken syntax.

> **100% client-side. No upload. No signup.** Rendering, validation, and export all run in your browser. Your diagram source never leaves your machine.

## Features

- **Live Mermaid editor** — split code / preview, renders as you type (debounced), zoom controls.
- **Templates** — flowchart · sequence · ER · gantt · class, one click each.
- **Export** — SVG (vector) and PNG (2× raster from the SVG via canvas).
- **Drag-drop** — drop a `.mmd` / `.txt` file onto the preview to load it.
- **AI (optional)** — describe a process in English → Mermaid code; or "fix syntax" on a parse error. Powered by [`@chirag127/oz-ai`](https://github.com/chirag127/design-system) (g4f multi-provider failover, no key). If AI is down, the editor still works.
- **Persistence** — your last diagram is remembered in `localStorage`.
- **Instant first paint** — the heavy Mermaid renderer is lazy-loaded on first render only.

## Stack

Astro (static) · React 19 islands · Tailwind v4 · `mermaid` · shared `@chirag127/oz-*` packages (AI, file, tokens, chrome).

## Develop

```bash
npm install --legacy-peer-deps
npm run dev      # local dev
npm run build    # static build -> dist/
npm test         # vitest (pure logic)
npm run deploy   # build + wrangler pages deploy
```

Windows: use **npm** (not pnpm — pnpm skips `@esbuild/win32-x64` and crashes the build).

## Privacy

No backend, no API keys, no analytics on your diagrams. Everything is computed locally. AI calls (only when you click an AI button) go to g4f providers via the shared client; your other diagrams never touch a network.

## License

MIT © 2026 Chirag Singhal
