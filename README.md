// README.md
# Prompt Drawer (MVP)

A lightweight Chrome/Brave extension to store and paste prompts into LLM sites. See `MVP_INSTRUCTIONS.md` for full spec.

## Features
- Draggable, persistent popup for prompt management
- Minimal permissions, no telemetry, no cloud sync
- All data stored locally (`chrome.storage.local`)
- Shadow DOM UI, overlays page, non-modal
- Works on ChatGPT, NotebookLM, Google AI Studio

## Build & Run
```bash
npm install
npm run build
```
Load `dist/` and `manifest.json` as an unpacked extension in Chrome/Brave.

## Security & Privacy
- Only essential permissions requested
- No remote scripts, no secrets, no analytics
- See `EXTENSION_GOOD_PRACTICES.md` for all best practices followed
