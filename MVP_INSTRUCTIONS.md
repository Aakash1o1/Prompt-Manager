
---

## One-line summary

A lightweight Chrome/Brave extension that shows a draggable prompt popup when the user moves the mouse into a bottom-right hot-zone or presses `Alt+P`. The popup lists locally stored prompts (title + body). Clicking a prompt inserts it into the page’s active LLM input (or copies it to clipboard if no editable area is found). Prompts persist in `chrome.storage.local`.

---

## What the MVP **must do** (behavioral spec)

1. Inject an invisible hot-zone (48×48px) at the bottom-right of pages in the whitelisted hosts. Hovering the hot-zone (\~160ms) opens the popup. Leaving hides it after \~350ms unless the pointer is inside the popup.
2. Toggle popup with the keyboard command `Alt+P`.
3. Popup UI:

   * Draggable header (position persists).
   * Scrollable list of prompt titles (most recent first).
   * Each prompt row: title (clickable), **Copy** button, **Edit** button, **Delete** button.
   * Footer with **Add** button to create a prompt.
   * Close button in header.
4. Insertion behavior:

   * Try `document.activeElement` first for insertion (textarea/input/contentEditable).
   * If not found, try per-site selectors (ChatGPT, NotebookLM, Google AI Studio).
   * Fallback: choose largest visible editable element.
   * If insertion fails, copy prompt to clipboard and inform the user.
5. Storage:

   * Use `chrome.storage.local` to persist prompts and popup position.
   * Support Add / Edit / Delete operations immediately persisted.
6. Permissions:

   * Request only required permissions in manifest (see manifest snippet below).
7. No telemetry, no cloud sync, no API keys, no sharing features for MVP.

---

## Visual spec (exact, for MVP)

* Panel width: **300px**.
* Header: `Prompt Drawer` text, drag handle, Close (✕) button.
* List area: max-height 320px, vertical scroll if needed.
* Row layout: left = title (flex), right = buttons: `Copy | Edit | Delete` (small).
* Footer: single **Add** button spanning available width.
* Default popup position: `right: 12px; bottom: 60px`.
* Use a **shadow DOM** to isolate styles from page CSS.
* Popup should overlay page UI (high `z-index`) but be non-modal.

---

## Data model (single-file; stored in `chrome.storage.local`)

```json
{
  "prompts": [
    {
      "id": "string",
      "title": "string",
      "body": "string",
      "createdAt": 1680000000000,
      "updatedAt": 1680000000000
    }
  ],
  "settings": {
    "popupPosition": { "right": 12, "bottom": 60 },
    "hotzoneSize": 48
  }
}
```

---

## File map (minimal)

```
/src
  background.ts        # service worker; listens for Alt+P and forwards TOGGLE_POPUP
  content.ts           # content script: hotzone, popup UI, insertion, storage wrapper
  lib/storage.ts       # (optional) small promise wrapper for chrome.storage.local
manifest.json
package.json
build scripts (esbuild/tsc)
dist/                 # build output (manifest references dist/*.js)
```

---

## Minimal `manifest.json` (MVP)

Use Manifest V3. Include only essential permissions and host patterns.

```json
{
  "manifest_version": 3,
  "name": "Prompt Drawer",
  "version": "0.1.0",
  "description": "Store and paste prompts into LLM sites (MVP).",
  "permissions": ["storage","scripting","activeTab"],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://notebooklm.google/*",
    "https://aistudio.google.com/*"
  ],
  "background": { "service_worker": "dist/background.js" },
  "content_scripts": [
    {
      "matches": [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "https://notebooklm.google/*",
        "https://aistudio.google/*"
      ],
      "js": ["dist/content.js"],
      "run_at": "document_idle"
    }
  ],
  "commands": {
    "open-prompt-drawer": {
      "suggested_key": { "default": "Alt+P" },
      "description": "Open prompt popup"
    }
  },
  "action": { "default_title": "Prompt Drawer" }
}
```

---

## Implementation steps — ordered checklist

Follow these steps in sequence. Mark each step done as you complete it.

### Phase 1 — Project skeleton & build

* [ ] Create repository and add `MVP_INSTRUCTIONS.md` (this file).
* [ ] Initialize `package.json`.
* [ ] Add build tooling (esbuild or tsc). Add build scripts:

  ```json
  "scripts": {
    "build:content": "esbuild src/content.ts --bundle --outfile=dist/content.js --platform=browser",
    "build:background": "esbuild src/background.ts --bundle --outfile=dist/background.js --platform=browser",
    "build": "npm run build:content && npm run build:background"
  }
  ```
* [ ] Add `manifest.json` using the snippet above.

### Phase 2 — Background service worker

* [ ] Implement `src/background.ts`:

  * Listen for `chrome.commands.onCommand` for `open-prompt-drawer`.
  * On command, send `TOGGLE_POPUP` message to the active tab.

### Phase 3 — Content script (core)

* [ ] Implement `src/content.ts`:

  * Inject invisible hot-zone (`id="prompt-hotzone"`) bottom-right; attach `mouseenter`/`mouseleave` timers to show/hide popup.
  * Create popup host element and attach **shadow root** for UI.
  * Build UI structure (header, list, footer) in the shadow DOM.
  * Implement Add/Edit/Delete flows (MVP: `prompt()` is acceptable for input).
  * Implement Copy button using `navigator.clipboard.writeText()` with `execCommand` fallback.
  * Implement drag-to-move for the popup header; persist `popupPosition` to `chrome.storage.local`.
  * Ensure popup opens even when no input is focused.

### Phase 4 — Insertion logic

* [ ] Implement `insertTextAtElement(el, text)`:

  * For `textarea`/`input`: use `selectionStart`/`selectionEnd`, set value, set caret, dispatch `input` and `change`.
  * For `contentEditable`: use `document.getSelection()` and `Range` to insert a text node and collapse selection after insertion; dispatch `input`.
* [ ] Implement `findInputOnPage()`:

  * If `document.activeElement` is editable, return it.
  * Else check per-site selectors (see SITE\_SELECTORS mapping in your content script).
  * Else fallback to the largest visible editable element on the page.
* [ ] Wire clicking a prompt title to attempt insertion. If insertion returns false, copy to clipboard and notify the user.

### Phase 5 — Storage & persistence

* [ ] Implement `getStorage` / `setStorage` (promise wrappers around `chrome.storage.local.get/set`).
* [ ] Load prompts on init; if none exist, initialize with one small example prompt.
* [ ] Persist Add/Edit/Delete and popup position changes immediately.

### Phase 6 — Messaging & keyboard command

* [ ] Add message listener in `content.ts` to handle `TOGGLE_POPUP` sent from background (toggle show/hide).

### Phase 7 — Build & manual testing

* [ ] Run `npm run build`.
* [ ] Load unpacked extension in Chrome/Brave (`chrome://extensions` → Load unpacked → project root).
* [ ] Test scenarios thoroughly (see Testing Checklist below).

---

## Testing checklist (manual)

Test on each target host (ChatGPT, NotebookLM, Google AI Studio) and in Brave.

* [ ] Hot-zone visible only as interactive area (invisible to user) and opens popup on hover.
* [ ] Popup opens with `Alt+P`.
* [ ] Add flow creates a prompt and shows in list.
* [ ] Edit flow updates title/body and persists.
* [ ] Delete flow removes prompt and persists.
* [ ] Clicking title inserts prompt into a focused textarea/input/contentEditable (cursor preserved).
* [ ] Clicking title when no editable area is found copies prompt to clipboard and notifies user.
* [ ] Copy button reliably writes prompt body to clipboard (fallback tested).
* [ ] Popup is draggable; new position persists after page reload.
* [ ] Popup overlays site UI and does not break normal page interactions.
* [ ] Extension requests only the manifest permissions listed.

---

## Acceptance criteria (MVP complete)

* Hot-zone opens popup on hover.
* Popup lists prompts with Add/Edit/Delete.
* Clicking a prompt inserts text into the LLM input when possible (preserving cursor); otherwise copies to clipboard.
* Prompts persist across reloads (`chrome.storage.local`).
* Popup is draggable and position persists.
* `Alt+P` toggles popup.
* Extension requests only necessary permissions and works in Chrome and Brave.

---

## Minimal developer notes & constraints (MVP scope)

* **Do not** implement placeholders/variables, cloud sync, team sharing, or prompt versioning — those are out of scope.
* **Do not** add telemetry or analytics in MVP.
* Keep styles and UI code simple — functional not fancy.
* Use **vanilla TypeScript** (no React) for the MVP.
* Use **shadow DOM** for UI to avoid CSS collisions.
* Do not store or ask for API keys or secrets.
* Keep host permissions limited to the four whitelisted hosts for MVP.

---

## Quick build commands

Use esbuild (recommended) or your preferred bundler:

```bash
# install esbuild if needed:
npm install --save-dev esbuild

# build once
npm run build

# or run individual
npx esbuild src/content.ts --bundle --outfile=dist/content.js --platform=browser
npx esbuild src/background.ts --bundle --outfile=dist/background.js --platform=browser
```

Load the extension unpacked from the project root in Chrome/Brave.

---

## Minimal initial sample prompt (create on first run)

If no prompts exist at first run, add this example so UI isn't empty:

* Title: `Explain code`
* Body:

  ````
  Explain the following code in simple terms:

  ```js
  // paste code here
  ````

  ```
  ```

---

If you need a ready-to-paste `src/content.ts` and `src/background.ts` (vanilla TypeScript) that implement everything in this file, say **“Provide starter files”** and I will generate them exactly to match this MVP spec.
