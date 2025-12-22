"use strict";
(() => {
  // src/content/styles.ts
  var STYLES = `
/* ----------------------
   Centralized Theme and Style Variables
*/
:host {
  all: initial;
  /* Layout Variables */
  --popup-width: 280px;
  --popup-height: 56vh;
  --hotspot-size: 36px;
  --hotspot-edge-width: 10px;
  --border-radius: 12px;
  --border-radius-small: 8px;
  --border-radius-tiny: 4px;
  --gap: 8px;
  --gap-small: 6px;
  --gap-tiny: 4px;
  
  /* Typography Variables */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-size: 10px;
  --font-size-small: 11px;
  --font-size-large: 13px;
  --font-weight-normal: 400;
  --font-weight-bold: 600;
  
  /* Spacing Variables */
  --padding: 10px;
  --padding-small: 6px;
  --padding-tiny: 4px;
  --padding-input: 8px;
  
  /* Color Variables - Dark Theme (Default) */
  --bg: linear-gradient(180deg, rgba(12,18,24,0.6), rgba(18,24,32,0.6));
  --bg-b: rgba(24,32,40,0.55);
  --bg-dropdown: rgb(35, 35, 35);
  --bg-input: rgba(0,0,0,0.04);
  --bg-button: transparent;
  --bg-hover: rgba(255, 255, 255, 0.06);
  --txt: #e6eef8;
  --txt-placeholder: rgba(230, 238, 248, 0.5);
  --border: rgba(255,255,255,0.06);
  --border-input: rgba(255,255,255,0.03);
  --accent: #8fb7ff;
  --hot: #9cc7ff;
  --bg-input-solid: rgba(20, 28, 36, 1); /* Dark, 80% opaque */

  
  /* Light Theme Colors */
  --silver-bg: linear-gradient(180deg, rgba(243,244,246,0.75), rgba(230,233,236,0.68));
  --silver-bg-b: rgba(240,242,245,0.64);
  --silver-bg-dropdown: rgba(248,250,252,0.95);
  --silver-bg-input: rgba(255,255,255,0.8);
  --silver-bg-button: rgba(255,255,255,0.1);
  --silver-bg-hover: rgba(0, 0, 0, 0.05);
  --silver-txt: #1f2937;
  --silver-txt-placeholder: rgba(31, 41, 55, 0.6);
  --silver-border: rgba(0,0,0,0.1);
  --silver-border-input: rgba(0,0,0,0.08);
  --silver-bg-input-solid: rgba(255, 255, 255, 0.9); /* White, 90% opaque */

}
.controls { display: flex; gap: 6px; align-items: center; }
.ctrl-btn {
  /* ... existing styles for .ctrl-btn ... */
  transition: flex-grow 200ms ease-in-out, background-color 150ms ease;
}

/* When in add/edit mode... */
.panel.mode-add .controls {
  flex-grow: 1;
}

.panel.mode-add .controls #add-btn,
.panel.mode-add .controls #settings-btn {
  display: none;
}

.panel.mode-add .controls #tags-btn {
  flex-grow: 1;
}


/* Light Theme Override */
:host([data-theme="light"]) {
  --bg: var(--silver-bg);
  --bg-b: var(--silver-bg-b);
  --bg-dropdown: var(--silver-bg-dropdown);
  --bg-input: var(--silver-bg-input);
  --bg-button: var(--silver-bg-button);
  --bg-hover: var(--silver-bg-hover);
  --txt: var(--silver-txt);
  --txt-placeholder: var(--silver-txt-placeholder);
  --border: var(--silver-border);
  --border-input: var(--silver-border-input);
  
  /* +++ CHANGE 1: Apply the solid background for the light theme +++ */
  --bg-input-solid: var(--silver-bg-input-solid);
}

/* Enforce font variables throughout shadow root */
:host, :host * {
  font-family: var(--font-family) !important;
  font-size: var(--font-size) !important;
  box-sizing: border-box;
}
input, textarea, button, select { font-family: var(--font-family) !important; font-size: var(--font-size) !important; }

/* ----------------------
   Hotspot (corner or edge)
*/
.hotzone {
  position: fixed;
  right: var(--padding);
  bottom: var(--border-radius);
  width: var(--hotspot-size);
  height: var(--hotspot-size);
  border-radius: var(--padding);
  background: var(--hot);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000000;
  pointer-events: auto;

  cursor: pointer;
  box-shadow: 0 var(--padding-small) 20px rgba(0,0,0,0.35);
  font-size: 16px;
  color: #08324a;
  user-select: none;
}

/* Edge-mode: narrow mist bar on the right edge; icon hidden (color made transparent) */
:host([data-hotspot-position="edge"]) .hotzone {
  right: 0;
  width: var(--hotspot-edge-width);
  height: var(--popup-height);
  top: calc(50% - (var(--popup-height) / 2));
  pointer-events: auto; 
  border-radius: var(--border-radius-tiny);
  writing-mode: vertical-rl;
  pointer-events: auto; /* <-- ENSURE THIS IS HERE TOO */

  font-size: var(--font-size);
  color: transparent; /* hide inner emoji/text */
  background: linear-gradient(86deg, rgb(0 12 255 / 0%) 0%, rgb(41 169 255 / 88%) 40%, rgb(255 255 255 / 0%) 100%);
  backdrop-filter: blur(var(--padding-small)) saturate(120%); /* mist/blur */
  box-shadow: none;
}

/* ----------------------
   Main panel
*/
.panel {
  position: fixed;
  right: var(--border-radius);
  bottom: 0px;
  width: var(--popup-width);
  height: var(--popup-height);
  z-index: 1000001;
  border-radius: var(--border-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--txt);
  background: var(--bg);
  border: 1px solid var(--border);
  padding: var(--padding);
  box-sizing: border-box;
  backdrop-filter: blur(5px) saturate(200%);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  pointer-events: none;
}
.panel.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* ----------------------
   Header: contains (search) + small controls
*/
.header {
  display: flex;
  gap: var(--gap);
  align-items: center;
  padding: var(--padding-small) 2px;
  flex: 0 0 auto;
  position: relative; /* anchor for dropdown */
}
.search { flex: 1; min-width: 0; }
.search input {
  width: 100%;
  padding: var(--padding-small) var(--padding);
  border-radius: var(--border-radius-small);
  border: 1px solid var(--border-input);
  /* +++ CHANGE 2: Use the solid background variable +++ */
  background: var(--bg-input-solid);
  color: var(--txt);
}
.search input::placeholder {
  color: var(--txt-placeholder);
  opacity: 1;
}
/* Hide Search and List when in Add/Edit or Settings mode */
.panel.mode-add .search,
.panel.mode-settings .search,
.panel.mode-add .list,      /* <--- ADDED THIS */
.panel.mode-settings .list  /* <--- ADDED THIS */
{
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  display: none !important; /* Force layout removal */
}


.controls { display: flex; gap: var(--gap-small); align-items: center; }
.ctrl-btn {
  background: var(--bg-button);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-small);
  padding: var(--padding-small);
  font-size: var(--font-size);
  color: var(--txt);
  cursor: pointer;
}

.ctrl-btn.active {
  background: linear-gradient(180deg, rgba(143,183,255,0.14), rgba(143,183,255,0.06));
  box-shadow: 0 4px 14px rgba(143,183,255,0.06);
  color: var(--txt);
}

/* ----------------------
   Tags dropdown (absolute, does not shift header)
*/
.tags-dropdown {
  position: absolute;
  left: var(--gap);
  top: calc(0%);
  z-index: 1;
  background: var(--bg-dropdown);
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 var(--padding) 30px rgba(0,0,0,0.28);
  max-height: 240px;
  overflow: hidden;
  display: none;
  flex-direction: column;
  padding: var(--gap);
  backdrop-filter: blur(var(--padding-small)) saturate(120%);
  min-width: 200px;
}
.tags-dropdown.open { display: flex; }

.tags-top { display:flex; gap:var(--gap); align-items:center; padding-bottom: var(--padding-small); flex:0 0 auto; }
.tags-list {
  overflow-y: auto;
  padding-right: var(--padding-small);
  margin-top: var(--gap-tiny);
}

/* New tag form styling */
.new-tag-form {
  display: flex;
  flex-direction: column;
  gap: var(--gap-small);
  padding: var(--padding-small);
  border-radius: var(--border-radius-small);
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  margin-bottom: var(--gap-small);
}
.new-tag-form-row {
  display: flex;
  gap: var(--gap-small);
  align-items: center;
}
.new-tag-form input[type="text"] {
  flex: 1;
  padding: var(--padding-tiny);
  font-size: var(--font-size);
  background: var(--bg-input-solid);
}
.new-tag-form input[type="color"] {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--border-radius-tiny);
  cursor: pointer;
}
.new-tag-form-buttons {
  display: flex;
  gap: var(--gap-small);
  justify-content: flex-end;
}
.tags-list::-webkit-scrollbar { width: 6px; }
.tags-list::-webkit-scrollbar-track { background: transparent; }
.tags-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.tags-list::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.3); }

.tag-row {
  display:flex;
  gap:var(--gap);
  align-items:center;
  padding:var(--padding-small);
  border-radius:var(--border-radius-small);
  cursor: pointer;
}
.tag-row:hover { background: rgba(244, 3, 3, 0.02); }
.tag-swatch { 
  width:18px; 
  height:18px; 
  border-radius:var(--border-radius-tiny); 
  border: 1px solid var(--border-input); 
  flex: 0 0 auto; 
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.tag-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.tag-name { flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-weight:var(--font-weight-bold); }
.tag-tick { width:22px; text-align:center; flex:0 0 auto; font-size:14px; opacity:0.9; }

.tag-chips { display:flex; gap:var(--gap-small); margin-left:var(--gap); flex-wrap:nowrap; align-items:center; }
.tag-chip {
  display:inline-flex; align-items:center; justify-content:center; padding:2px 6px; border-radius:999px; font-size:11px; font-weight:600;
  min-width: 24px; max-width: 120px; overflow:hidden; white-space:nowrap; text-overflow: ellipsis;
}
.tag-chip.overflow { background: rgba(255,255,255,0.04); color: var(--txt); }

.placeholder { height: 8px; margin: 4px 0; border-radius: 6px; background: rgba(255,255,255,0.02); transition: height 120ms ease; }

/* add/edit/settings areas */
/* Ensure Add/Settings areas take full space */
.add-area, .settings-area {
  display: none; 
  flex-direction: column; 
  gap: 8px; 
  flex: 1; /* Take remaining height */
  min-height: 0; /* Enable scrolling inside if needed */
}
.add-area { position: relative; }
.add-area.open, .settings-area.open { display: flex; }

.delete-btn {
  position: absolute;
  top: 14px;
  right: 8px;
  width: 36px;
  height: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  border: none;
  background: transparent;
  color: var(--txt);
  cursor: pointer;
  z-index: 10;
  transition: box-shadow 140ms ease, background 120ms ease, color 120ms ease;
}
.delete-btn svg { 
  color: #FFD400;
  width: 16px; 
  height: 16px; 
  stroke: #FFD400; 
  fill: none; 
  stroke-width: 1.6; 
  background: rgba(255, 212, 64, 0.06);
  box-shadow: 0 0 0 6px rgba(255, 212, 64, 0.10), 0 6px 20px rgba(255, 200, 64, 0.12);
  border-radius:2px;
}
.delete-btn:hover {
  transform: translateY(-1px);
}

input[type="text"], textarea { 
  width: 100%; 
  padding: var(--padding-input); 
  border-radius: var(--border-radius-small); 
  border: 1px solid var(--border-input); 
  /* +++ CHANGE 3: Use the solid background variable +++ */
  background: var(--bg-input-solid);
  color: var(--txt); 
  font-size: var(--font-size); 
}
input[type="text"]::placeholder, textarea::placeholder {
  color: var(--txt-placeholder);
  opacity: 1;
}
textarea { min-height: 96px; resize: vertical; }
.settings-row { display:flex; gap:8px; align-items:center; justify-content:space-between; }
.settings-row label { width:60%; color:var(--txt); font-size: calc(var(--font-size) * 1); }

.toast {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  opacity: 0;
  transition: opacity .18s;
}
.toast.show { opacity: 1; }

:host([data-hotspot-position="edge"]) .panel {
  right: 0;
  bottom: auto;
  top: 50%;
  transform: translateY(-50%);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  max-height: 98vh;
  min-height: 10vh;
  max-width: 50vw;
  min-width: 15vw;
  overflow: hidden;
}
.list {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--padding-small);
  margin-top: var(--padding-small);
  -webkit-overflow-scrolling: touch;
}
.list::-webkit-scrollbar { width: 6px; }
.list::-webkit-scrollbar-track { background: transparent; }
.list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.list::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.3); }

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  border-radius: var(--padding);
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.03));
  min-height: var(--hotspot-size);
  transition: background 120ms ease, transform 160ms ease, opacity 120ms ease;
  cursor: default; 
}
.row.heading-row {
  padding: var(--gap-tiny);
  min-height: 32px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.drag-handle { cursor: grab !important; }

.left { 
  display:flex;
  align-items:center; 
  gap:var(--gap); 
  flex:1; 
  min-width:0; 
}
.label {
  flex: 1;
  font-weight: 100;
  font-size: calc(var(--font-size) * 1);
  color: var(--txt);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icons { display:flex; gap:var(--gap-small); flex:0 0 auto; }
.icon-btn {
  background: rgba(0,0,0,0.02);
  border: none;
  color: var(--txt);
  width: 30px;
  height: 30px;
  border-radius: var(--border-radius-small);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: var(--padding-small);
}
.icon-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.6; }

/* Trash icon button for delete */
.delete-icon-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-tiny);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 2px;
  transition: background-color 150ms ease;
}
.delete-icon-btn:hover {
  background: rgba(255, 107, 107, 0.1);
}
.delete-icon-btn svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.add-tags .tag-select {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:var(--gap-tiny) var(--gap);
  border-radius:999px;
  font-size:var(--font-size-small);
  font-weight:var(--font-weight-bold);
  cursor:pointer;
  border: 1px solid var(--border);
  min-height:22px;
  max-width:160px;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
  background: var(--bg-button);
  color: var(--txt);
}
.add-tags .tag-select.selected {
  box-shadow: 0 var(--padding-small) 18px rgba(0,0,0,0.14);
  outline: 2px solid var(--border);
}
.tag-row:focus, .tag-row.focused {
  outline: 2px solid rgba(143,183,255,0.18);
  border-radius: 8px;
}

.row:hover,
.row:focus,
.row.selected {
  background-color: var(--bg-hover);
  outline: none;
  transform: translateY(-1px);
  cursor: pointer;
}

.row:focus .label,
.row.selected .label {
  font-weight: bold;
}

.placeholder { 
    height: 36px; /* Match row height */
    margin: 4px 0; 
    border-radius: 6px; 
    background: rgba(143, 183, 255, 0.15); /* Make it visible blue-ish */
    border: 1px dashed rgba(143, 183, 255, 0.4);
    transition: none; /* Disable transition for snappy feel */
}

.row.dragging {
  opacity: 0.7 !important; /* Make it invisible (but keeps layout space if needed, or use display:none) */
  /* If using display:none, the drag operation might end immediately in some browsers. 
     Opacity 0 or 0.1 is safer. */
  pointer-events: none;
}
.row.chosen {
  background: rgba(143, 183, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: grabbing !important;
}

/* Style for the placeholder where the item will be dropped */
.row.ghost {
  opacity: 0.4;
  background: rgba(143, 183, 255, 0.2);
  border: 1px dashed rgba(143, 183, 255, 0.5);
}



`;

  // src/content/host.ts
  function createOrGetHost() {
    if (window.__promptManagerInitialized) {
      return { host: null, shadow: null };
    }
    window.__promptManagerInitialized = true;
    const HOST_ID = "prompt-drawer-host-shadow";
    let host = document.getElementById(HOST_ID);
    if (host)
      host.remove();
    host = document.createElement("div");
    host.id = HOST_ID;
    Object.assign(host.style, {
      all: "initial",
      position: "fixed",
      top: "0",
      left: "0",
      width: "0",
      height: "0",
      zIndex: "2147483647",
      // Max z-index
      pointerEvents: "none"
      // Let clicks pass through the container (children will re-enable)
    });
    document.documentElement.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
      ${STYLES}
    </style>

    <!-- HOTSPOT -->
    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">\u{1F4AC}</div>

    <!-- MAIN PANEL -->
    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">
      <!-- Header -->
      <div class="header">
        <div class="search"><input id="search-input" type="text" placeholder="Search (title, quick, body)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn" title="Add">\uFF0B</button>
          <button id="tags-btn" class="ctrl-btn" title="Tags">T</button>
          <button id="settings-btn" class="ctrl-btn" title="Settings">\u2699</button>
          <button id="close-btn" class="ctrl-btn" title="Close"></button>
        </div>

        <!-- Tags dropdown -->
        <div class="tags-dropdown" id="tags-dropdown" aria-hidden="true">
          <div class="tags-top">
            <button id="tags-clear" class="ctrl-btn">Remove filter</button>
            <button id="tags-edit" class="ctrl-btn">Edit</button>
            <button id="tags-new" class="ctrl-btn">New</button>
          </div>
          <div class="tags-list" id="tags-list" role="list"></div>
        </div>
      </div>

      <!-- Lists and Areas -->
      <div class="list" id="list" role="list"></div>

      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
        <textarea id="input-body" placeholder="Full prompt text" style="height: 177px;"></textarea>
        <div style="display:flex;gap:var(--gap);justify-content:flex-end;margin-top:var(--gap)">
          <button id="cancel-btn" class="ctrl-btn">Cancel</button>
          <button id="save-btn" class="ctrl-btn">Save</button>
        </div>
      </div>

      <div class="settings-area" id="settings-area" aria-hidden="true">
        <div class="settings-row">
          <label>Font size (px)</label>
          <input id="s-font-size" type="number" min="10" max="22" />
        </div>
        <div class="settings-row">
          <label>Hotspot position</label>
          <select id="s-hotspot-pos"><option value="corner">Corner</option><option value="edge">Right edge</option></select>
        </div>
        <div class="settings-row">
          <label>Theme</label>
          <select id="s-theme"><option value="dark">Dark</option><option value="light">Light (silver)</option></select>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="s-cancel" class="ctrl-btn">Cancel</button>
          <button id="s-save" class="ctrl-btn">Save</button>
        </div>
      </div>

      <div class="toast" id="toast" aria-hidden="true"></div>
    </div>
  `;
    return { host, shadow };
  }

  // src/lib/storage.ts
  async function getStorage(key) {
    return new Promise((res, rej) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            rej(chrome.runtime.lastError);
          } else {
            res(result[key]);
          }
        });
      } catch (e) {
        rej(e);
      }
    });
  }
  async function setStorage(obj) {
    return new Promise((res, rej) => {
      try {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime.lastError) {
            rej(chrome.runtime.lastError);
          } else {
            res();
          }
        });
      } catch (e) {
        rej(e);
      }
    });
  }

  // src/lib/defaultPrompts.ts
  var DEFAULT_TAGS = [
    { name: "Writing", color: "#FF6B6B" },
    { name: "Code", color: "#6B9CFF" },
    { name: "Analysis", color: "#9AE66E" },
    { name: "Creative", color: "#D39BFF" }
  ];
  var DEFAULT_PROMPTS = [
    {
      title: "Explain Code",
      quick: "explain",
      text: "Please explain this code in simple terms, including what it does, how it works, and any important concepts:",
      tags: ["Code"]
    },
    {
      title: "Improve Writing",
      quick: "improve",
      text: "Please improve the following text for clarity, grammar, and readability while maintaining the original meaning:",
      tags: ["Writing"]
    }
  ];

  // src/content/store.ts
  var PROMPTS_KEY = "promptManager.prompts";
  var SETTINGS_KEY = "promptManager.settings";
  var TAGS_KEY = "promptManager.tags";
  var DEFAULT_SETTINGS = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24
  };
  function uid() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  var Store = class {
    constructor() {
      // State
      this.prompts = [];
      this.tags = [];
      this.settings = DEFAULT_SETTINGS;
      // UI State (transient)
      this.filterText = "";
      this.selectedTagIds = [];
      // Event System
      this.listeners = {};
      this.setupStorageListener();
    }
    reorderPromptsSilently(oldIndex2, newIndex2) {
      if (oldIndex2 === newIndex2)
        return;
      const [item] = this.prompts.splice(oldIndex2, 1);
      this.prompts.splice(newIndex2, 0, item);
      setStorage({ [PROMPTS_KEY]: this.prompts });
    }
    setupStorageListener() {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local")
          return;
        if (changes[PROMPTS_KEY]) {
          this.prompts = changes[PROMPTS_KEY].newValue || [];
          this.notify("prompts_updated");
        }
        if (changes[TAGS_KEY]) {
          this.tags = changes[TAGS_KEY].newValue || [];
          this.notify("tags_updated");
        }
        if (changes[SETTINGS_KEY]) {
          this.settings = changes[SETTINGS_KEY].newValue || DEFAULT_SETTINGS;
          this.notify("settings_updated");
        }
      });
    }
    async load() {
      try {
        const p = await getStorage(PROMPTS_KEY);
        this.prompts = Array.isArray(p) ? p : [];
        const s = await getStorage(SETTINGS_KEY);
        this.settings = s ? s : DEFAULT_SETTINGS;
        const t = await getStorage(TAGS_KEY);
        this.tags = Array.isArray(t) ? t : [];
        if (this.prompts.length === 0 && this.tags.length === 0) {
          await this.initializeDefaults();
        }
        this.notify("loaded");
        this.notify("prompts_updated");
        this.notify("tags_updated");
        this.notify("settings_updated");
      } catch (e) {
        console.error("Store: Failed to load data", e);
      }
    }
    async initializeDefaults() {
      console.log("Store: Initializing default data...");
      this.tags = DEFAULT_TAGS.map((dt, index2) => ({
        id: uid(),
        name: dt.name,
        color: dt.color,
        order: index2
      }));
      this.prompts = DEFAULT_PROMPTS.map((dp) => {
        const promptTags = [];
        if (dp.tags) {
          for (const tagName of dp.tags) {
            const tag = this.tags.find((t) => t.name === tagName);
            if (tag)
              promptTags.push(tag.id);
          }
        }
        return {
          id: uid(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags
        };
      });
      await Promise.all([
        this.savePrompts(),
        this.saveTags(),
        this.saveSettings()
      ]);
    }
    // --- Persistence Methods ---
    async savePrompts() {
      try {
        await setStorage({ [PROMPTS_KEY]: this.prompts });
        this.notify("prompts_updated");
      } catch (e) {
        console.warn("Store: Failed saving prompts", e);
      }
    }
    async saveTags() {
      try {
        await setStorage({ [TAGS_KEY]: this.tags });
        this.notify("tags_updated");
      } catch (e) {
        console.warn("Store: Failed saving tags", e);
      }
    }
    async saveSettings() {
      try {
        await setStorage({ [SETTINGS_KEY]: this.settings });
        this.notify("settings_updated");
      } catch (e) {
        console.warn("Store: Failed saving settings", e);
      }
    }
    // --- Prompt Management ---
    async addPrompt(title, text, quick, tagIds) {
      const newPrompt = {
        id: uid(),
        title,
        text,
        quick,
        tags: tagIds
      };
      this.prompts.push(newPrompt);
      await this.savePrompts();
    }
    async updatePrompt(id, updates) {
      const idx = this.prompts.findIndex((p) => p.id === id);
      if (idx === -1)
        return;
      this.prompts[idx] = { ...this.prompts[idx], ...updates };
      await this.savePrompts();
    }
    async deletePrompt(id) {
      this.prompts = this.prompts.filter((p) => p.id !== id);
      await this.savePrompts();
    }
    async reorderPrompts(srcId, targetId) {
      const srcIndex = this.prompts.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = this.prompts.splice(srcIndex, 1);
      if (targetId === null) {
        this.prompts.push(item);
      } else {
        const targetIndex = this.prompts.findIndex((x) => x.id === targetId);
        if (targetIndex !== -1) {
          this.prompts.splice(targetIndex, 0, item);
        } else {
          this.prompts.push(item);
        }
      }
      await this.savePrompts();
    }
    // --- Tag Management ---
    async addTag(name, color) {
      const newTag = {
        id: uid(),
        name,
        color,
        order: this.tags.length
      };
      this.tags.push(newTag);
      await this.saveTags();
    }
    // --- NEW: Add Tag with explicit ID (for UI selection) ---
    async addTagWithId(id, name, color) {
      const newTag = {
        id,
        // Use passed ID
        name,
        color,
        order: this.tags.length
      };
      this.tags.push(newTag);
      await this.saveTags();
    }
    // -------------------------------------------------------
    async updateTag(id, updates) {
      const idx = this.tags.findIndex((t) => t.id === id);
      if (idx === -1)
        return;
      this.tags[idx] = { ...this.tags[idx], ...updates };
      await this.saveTags();
    }
    async deleteTag(id) {
      this.tags = this.tags.filter((t) => t.id !== id);
      this.prompts.forEach((p) => {
        if (p.tags && p.tags.includes(id)) {
          p.tags = p.tags.filter((tid) => tid !== id);
        }
      });
      this.selectedTagIds = this.selectedTagIds.filter((tid) => tid !== id);
      await Promise.all([this.saveTags(), this.savePrompts()]);
      this.notify("filter_updated");
    }
    // --- Tag Reordering Logic ---
    async reorderTags(srcId, targetIndex) {
      const srcIndex = this.tags.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = this.tags.splice(srcIndex, 1);
      const clamped = Math.max(0, Math.min(targetIndex, this.tags.length));
      this.tags.splice(clamped, 0, item);
      this.tags = this.tags.map((t, i) => ({ ...t, order: i }));
      await this.saveTags();
    }
    // --------------------------------
    // --- Settings Management ---
    async updateSettings(updates) {
      this.settings = { ...this.settings, ...updates };
      await this.saveSettings();
    }
    // --- Filtering & Selection ---
    setFilter(text) {
      this.filterText = text;
      this.notify("filter_updated");
    }
    toggleTagSelection(tagId) {
      if (this.selectedTagIds.includes(tagId)) {
        this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
      } else {
        this.selectedTagIds.push(tagId);
      }
      this.notify("filter_updated");
    }
    clearTagSelection() {
      this.selectedTagIds = [];
      this.notify("filter_updated");
    }
    getFilteredPrompts() {
      const q = (this.filterText || "").trim().toLowerCase();
      let base = this.prompts;
      if (this.selectedTagIds.length > 0) {
        base = base.filter((p) => (p.tags || []).some((tid) => this.selectedTagIds.includes(tid)));
      }
      if (!q)
        return base;
      return base.filter(
        (p) => p.title && p.title.toLowerCase().includes(q) || p.quick && p.quick.toLowerCase().includes(q)
      );
    }
    // --- Event System ---
    subscribe(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return () => {
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      };
    }
    notify(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach((cb) => cb(data));
      }
    }
  };

  // src/content/components/Component.ts
  var Component = class {
    constructor(store, shadow) {
      this.element = null;
      this.store = store;
      this.shadow = shadow;
    }
    el(tag, className, text) {
      const e = document.createElement(tag);
      if (className)
        e.className = className;
      if (text)
        e.textContent = text;
      return e;
    }
  };

  // src/content/components/SearchBar.ts
  var SearchBar = class extends Component {
    constructor() {
      super(...arguments);
      this.input = null;
      this.addBtn = null;
      this.tagsBtn = null;
      this.settingsBtn = null;
      this.closeBtn = null;
    }
    mount(parent) {
      this.input = parent.querySelector("#search-input");
      this.addBtn = parent.querySelector("#add-btn");
      this.tagsBtn = parent.querySelector("#tags-btn");
      this.settingsBtn = parent.querySelector("#settings-btn");
      this.closeBtn = parent.querySelector("#close-btn");
      if (this.input) {
        this.input.addEventListener("input", () => {
          this.store.setFilter(this.input.value);
          this.shadow.dispatchEvent(new CustomEvent("nav-reset"));
        });
        this.input.addEventListener("keydown", (ev) => {
          if (ev.key === "ArrowDown") {
            ev.preventDefault();
            this.shadow.dispatchEvent(new CustomEvent("nav-next"));
          } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            this.shadow.dispatchEvent(new CustomEvent("nav-prev"));
          } else if (ev.key === "Enter") {
            ev.preventDefault();
            this.shadow.dispatchEvent(new CustomEvent("nav-copy"));
          } else if (ev.key === "Escape") {
          }
        });
        this.input.value = this.store.filterText;
      }
      if (this.addBtn) {
        this.addBtn.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("open-add-mode"));
        });
      }
      if (this.tagsBtn) {
        this.tagsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.shadow.dispatchEvent(new CustomEvent("toggle-tags-dropdown"));
        });
      }
      if (this.settingsBtn) {
        this.settingsBtn.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("open-settings"));
        });
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("close-panel"));
        });
      }
      this.store.subscribe("filter_updated", () => {
        if (this.input && this.input.value !== this.store.filterText) {
          this.input.value = this.store.filterText;
        }
        if (this.tagsBtn) {
          if (this.store.selectedTagIds.length > 0)
            this.tagsBtn.classList.add("active");
          else
            this.tagsBtn.classList.remove("active");
        }
      });
    }
  };

  // src/content/components/ColorPalette.ts
  var COLORS = [
    "#FF6B6B",
    "#FF8A65",
    "#FFD166",
    "#F9F871",
    "#9AE66E",
    "#6EE7B7",
    "#6ECFF6",
    "#6B9CFF",
    "#8F8CFF",
    "#D39BFF",
    "#FF9AD1",
    "#FFB3E6",
    "#D0D0D0",
    "#A0A0A0",
    "#7F5539",
    "#2B2B2B"
  ];
  var ColorPalette = class {
    constructor(store, shadow, onSelect, onClose) {
      this.paletteEl = null;
      this.backdrop = null;
      this.onSelect = onSelect;
      this.onClose = onClose;
    }
    el(tag, className, text) {
      const e = document.createElement(tag);
      if (className)
        e.className = className;
      if (text)
        e.textContent = text;
      return e;
    }
    showAt(parent, x, y) {
      this.backdrop = this.el("div");
      Object.assign(this.backdrop.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "9998",
        cursor: "default"
      });
      this.backdrop.addEventListener("click", (e) => {
        e.stopPropagation();
        this.destroy();
      });
      parent.appendChild(this.backdrop);
      this.paletteEl = this.el("div");
      Object.assign(this.paletteEl.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        zIndex: "9999",
        background: "#232323",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "8px",
        display: "grid",
        gridTemplateColumns: "repeat(8, 20px)",
        gap: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      });
      COLORS.forEach((color) => {
        const btn = this.el("div");
        Object.assign(btn.style, {
          width: "20px",
          height: "20px",
          borderRadius: "4px",
          background: color,
          cursor: "pointer",
          border: "1px solid rgba(0,0,0,0.2)"
        });
        btn.title = color;
        btn.addEventListener("mouseenter", () => btn.style.transform = "scale(1.1)");
        btn.addEventListener("mouseleave", () => btn.style.transform = "scale(1)");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onSelect(color);
          this.destroy();
        });
        this.paletteEl.appendChild(btn);
      });
      parent.appendChild(this.paletteEl);
    }
    destroy() {
      if (this.paletteEl)
        this.paletteEl.remove();
      if (this.backdrop)
        this.backdrop.remove();
      this.onClose();
    }
  };

  // src/content/components/TagDropdown.ts
  var TagDropdown = class extends Component {
    constructor() {
      super(...arguments);
      this.dropdown = null;
      this.list = null;
      this.clearBtn = null;
      this.editBtn = null;
      this.newBtn = null;
      this.activePalette = null;
      // --- PROPERTIES ---
      this.onTagSelect = null;
      // Custom click handler
      this.activeTagIds = [];
      this.isEditMode = false;
      this.isNewMode = false;
    }
    // IDs to show as checked
    // ------------------
    // Public check for App.ts hierarchy handling
    isOpen() {
      return this.dropdown ? this.dropdown.classList.contains("open") : false;
    }
    refresh() {
      this.renderList();
    }
    mount(parent) {
      this.dropdown = parent.querySelector("#tags-dropdown");
      this.list = parent.querySelector("#tags-list");
      this.clearBtn = parent.querySelector("#tags-clear");
      this.editBtn = parent.querySelector("#tags-edit");
      this.newBtn = parent.querySelector("#tags-new");
      if (!this.dropdown || !this.list)
        return;
      this.renderList();
      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", () => {
          this.store.clearTagSelection();
        });
      }
      if (this.editBtn) {
        this.editBtn.addEventListener("click", () => {
          this.isEditMode = !this.isEditMode;
          this.editBtn.textContent = this.isEditMode ? "Done" : "Edit";
          this.renderList();
        });
      }
      if (this.newBtn) {
        this.newBtn.addEventListener("click", () => {
          this.isNewMode = !this.isNewMode;
          this.newBtn.textContent = this.isNewMode ? "Cancel" : "New";
          this.renderList();
        });
      }
      this.store.subscribe("tags_updated", () => this.renderList());
      this.store.subscribe("filter_updated", () => this.renderList());
    }
    toggle() {
      if (this.dropdown) {
        this.dropdown.classList.toggle("open");
      }
    }
    close() {
      if (this.dropdown) {
        this.dropdown.classList.remove("open");
      }
    }
    renderList() {
      if (!this.list)
        return;
      this.list.innerHTML = "";
      if (this.isNewMode) {
        this.renderNewTagForm();
      }
      const idsToCheck = this.onTagSelect ? this.activeTagIds : this.store.selectedTagIds;
      const sortedTags = [...this.store.tags].sort((a, b) => (a.order || 0) - (b.order || 0));
      sortedTags.forEach((tag) => {
        const isChecked = idsToCheck.includes(tag.id);
        const row = this.createTagRow(tag, isChecked);
        this.list.appendChild(row);
      });
    }
    createTagRow(tag, isChecked) {
      const row = this.el("div", "tag-row");
      row.dataset.id = tag.id;
      if (this.isEditMode) {
        const handle = this.el("div");
        handle.textContent = "\u2261";
        Object.assign(handle.style, {
          cursor: "grab",
          marginRight: "8px",
          color: "var(--muted, #888)",
          userSelect: "none",
          fontSize: "18px",
          lineHeight: "1"
        });
        handle.draggable = true;
        handle.addEventListener("dragstart", (ev) => {
          ev.stopPropagation();
          if (ev.dataTransfer) {
            ev.dataTransfer.setData("text/plain", tag.id);
            ev.dataTransfer.effectAllowed = "move";
          }
          row.style.opacity = "0.5";
        });
        handle.addEventListener("dragend", (ev) => {
          ev.stopPropagation();
          row.style.opacity = "1";
        });
        row.appendChild(handle);
        row.addEventListener("dragover", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
        });
        row.addEventListener("drop", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const srcId = ev.dataTransfer?.getData("text/plain");
          if (srcId && srcId !== tag.id) {
            const targetIndex = this.store.tags.findIndex((t) => t.id === tag.id);
            this.store.reorderTags(srcId, targetIndex);
          }
        });
      }
      const swatch = this.el("div", "tag-swatch");
      swatch.style.background = tag.color;
      swatch.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!this.isEditMode)
          return;
        if (this.activePalette)
          this.activePalette.destroy();
        const rect = swatch.getBoundingClientRect();
        const containerRect = this.dropdown.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top + 24;
        this.activePalette = new ColorPalette(
          this.store,
          this.shadow,
          (newColor) => {
            this.store.updateTag(tag.id, { color: newColor });
          },
          () => {
            this.activePalette = null;
          }
        );
        this.activePalette.showAt(this.dropdown, x, y);
      });
      row.appendChild(swatch);
      if (this.isEditMode) {
        const input = this.el("input");
        input.type = "text";
        input.value = tag.name;
        Object.assign(input.style, {
          flex: "1",
          minWidth: "0",
          border: "1px solid var(--border-input, #ccc)",
          background: "var(--bg-input-solid, #fff)",
          color: "var(--txt, #000)",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "inherit"
        });
        input.addEventListener("click", (e) => e.stopPropagation());
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            input.blur();
          }
        });
        input.addEventListener("blur", () => {
          const newName = input.value.trim();
          if (newName && newName !== tag.name) {
            this.store.updateTag(tag.id, { name: newName });
          }
        });
        row.appendChild(input);
      } else {
        const name = this.el("div", "tag-name", tag.name);
        row.appendChild(name);
      }
      if (this.isEditMode) {
        const delBtn = this.el("div", "delete-icon-btn");
        delBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>';
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Delete tag "${tag.name}"?`)) {
            this.store.deleteTag(tag.id);
          }
        });
        row.appendChild(delBtn);
      } else {
        if (isChecked) {
          const tick = this.el("div", "tag-tick", "\u2713");
          row.appendChild(tick);
        }
      }
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!this.isEditMode) {
          if (this.onTagSelect) {
            this.onTagSelect(tag.id);
            this.renderList();
          } else {
            this.store.toggleTagSelection(tag.id);
          }
        }
      });
      return row;
    }
    // --- UPDATED: Render Form with Auto-Focus and ID generation ---
    renderNewTagForm() {
      const form = this.el("div", "new-tag-form");
      const row = this.el("div", "new-tag-form-row");
      const input = this.el("input");
      input.type = "text";
      input.placeholder = "Tag name";
      setTimeout(() => input.focus(), 50);
      const colorInput = this.el("input");
      colorInput.type = "color";
      colorInput.value = "#FF6B6B";
      row.appendChild(input);
      row.appendChild(colorInput);
      form.appendChild(row);
      const btns = this.el("div", "new-tag-form-buttons");
      const addBtn = this.el("button", "ctrl-btn", "Add");
      addBtn.addEventListener("click", async () => {
        const name = input.value.trim();
        if (name) {
          const newId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
          await this.store.addTagWithId(newId, name, colorInput.value);
          if (this.onTagSelect) {
            this.onTagSelect(newId);
          }
          this.isNewMode = false;
          if (this.newBtn)
            this.newBtn.textContent = "New";
          this.renderList();
        }
      });
      btns.appendChild(addBtn);
      form.appendChild(btns);
      this.list.appendChild(form);
    }
  };

  // node_modules/sortablejs/modular/sortable.esm.js
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function (obj2) {
        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null)
      return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key))
          continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  var version = "1.15.6";
  function userAgent(pattern) {
    if (typeof window !== "undefined" && window.navigator) {
      return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el, selector) {
    if (!selector)
      return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
        if (el === ctx)
          break;
      } while (el = getParentOrHost(el));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, "");
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop;
        }
        style[prop] = val + (typeof val === "string" ? "" : "px");
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = "";
    if (typeof el === "string") {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window)
      return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      container = container || el.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(css(container, "border-top-width"));
            left -= containerRect.left + parseInt(css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el !== window) {
      var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top,
      left,
      bottom,
      right,
      width,
      height
    };
  }
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide], visible = void 0;
      if (parentSide === "top" || parentSide === "left") {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible)
        return parent;
      if (parent === getWindowScrollingElement())
        break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el, childNum, options, includeDragEl) {
    var currentChild = 0, i = 0, children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el, selector) {
    var index2 = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i))
        continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key])
          return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    if (!el || !el.getBoundingClientRect)
      return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem.getBoundingClientRect || elem === document.body)
            return getWindowScrollingElement();
          if (gotSelf || includeSelf)
            return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl2) {
    var rect = {};
    Array.from(container.children).forEach(function (child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2)
        return;
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
  function AnimationStateManager() {
    var animationStates = [], animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation)
          return;
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, "display") === "none" || child === Sortable.ghost)
            return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === "function")
            callback();
          return;
        }
        var animating = false, animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
              (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === "function")
            callback();
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === "function")
              callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, "transition", "");
          css(target, "transform", "");
          var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
          this.forRepaintDummy = repaint(target);
          css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
          css(target, "transform", "translate3d(0,0,0)");
          typeof target.animated === "number" && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, "transition", "");
            css(target, "transform", "");
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }
  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      for (var option2 in defaults) {
        if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
          plugin[option2] = defaults[option2];
        }
      }
      plugins.forEach(function (p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function () {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + "Global";
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName])
          return;
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
            sortable
          }, evt));
        }
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread2({
            sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
      plugins.forEach(function (plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault)
          return;
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;
        _extends(defaults2, initialized.defaults);
      });
      for (var option2 in sortable.options) {
        if (!sortable.options.hasOwnProperty(option2))
          continue;
        var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
        if (typeof modified !== "undefined") {
          sortable.options[option2] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin) {
        if (typeof plugin.eventProperties !== "function")
          return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName])
          return;
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl2 && rootEl2[expando];
    if (!sortable)
      return;
    var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  var _excluded = ["evt"];
  var pluginEvent2 = function pluginEvent3(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
      dragEl,
      parentEl,
      ghostEl,
      rootEl,
      nextEl,
      lastDownEl,
      cloneEl,
      cloneHidden,
      dragStarted: moved,
      putSortable,
      activeSortable: Sortable.active,
      originalEvent,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable,
          name,
          originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable,
      cloneEl,
      targetEl: dragEl,
      rootEl,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex
    }, info));
  }
  var dragEl;
  var parentEl;
  var ghostEl;
  var rootEl;
  var nextEl;
  var lastDownEl;
  var cloneEl;
  var cloneHidden;
  var oldIndex;
  var newIndex;
  var oldDraggableIndex;
  var newDraggableIndex;
  var activeGroup;
  var putSortable;
  var awaitingDragStarted = false;
  var ignoreNextClick = false;
  var sortables = [];
  var tapEvt;
  var touchEvt;
  var lastDx;
  var lastDy;
  var tapDistanceLeft;
  var tapDistanceTop;
  var moved;
  var lastTarget;
  var lastDirection;
  var pastFirstInvertThresh = false;
  var isCircumstantialInvert = false;
  var targetMoveDistance;
  var ghostRelativeParent;
  var ghostRelativeParentInitialScroll = [];
  var _silent = false;
  var savedInputChecked = [];
  var documentExists = typeof document !== "undefined";
  var PositionGhostAbsolutely = IOS;
  var CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
  var supportCssPointerEvents = function () {
    if (!documentExists)
      return;
    if (IE11OrLess) {
      return false;
    }
    var el = document.createElement("x");
    el.style.cssText = "pointer-events:auto";
    return el.style.pointerEvents === "auto";
  }();
  var _detectDirection = function _detectDirection2(el, options) {
    var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === "flex") {
      return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
    }
    if (elCSS.display === "grid") {
      return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
    }
    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
      var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
      return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
    }
    return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
  };
  var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  };
  var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
    var ret;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold || lastChild(sortable))
        return;
      var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  };
  var _prepareGroup = function _prepareGroup2(options) {
    function toFn(value, pull) {
      return function (to, from, dragEl2, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === "clone") {
          return value;
        } else if (typeof value === "function") {
          return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != "object") {
      originalGroup = {
        name: originalGroup
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };
  var _hideGhostForTarget = function _hideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "none");
    }
  };
  var _unhideGhostForTarget = function _unhideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "");
    }
  };
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener("click", function (evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    this.el = el;
    this.options = options = _extends({}, options);
    el[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData("Text", dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on(el, "pointerdown", this._onTapStart);
    } else {
      on(el, "mousedown", this._onTapStart);
      on(el, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el, "dragover", this);
      on(el, "dragenter", this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */
  {
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart(evt) {
      if (!evt.cancelable)
        return;
      var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
      _saveInputCheckedState(el);
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return;
      }
      if (originalTarget.isContentEditable) {
        return;
      }
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
        return;
      }
      target = closest(target, options.draggable, el, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        return;
      }
      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable);
      if (typeof filter === "function") {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: "filter",
            targetEl: target,
            toEl: el,
            fromEl: el
          });
          pluginEvent2("filter", _this, {
            evt
          });
          preventOnFilter && evt.preventDefault();
          return;
        }
      } else if (filter) {
        filter = filter.split(",").some(function (criteria) {
          criteria = closest(originalTarget, criteria.trim(), el, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: "filter",
              targetEl: target,
              fromEl: el,
              toEl: el
            });
            pluginEvent2("filter", _this, {
              evt
            });
            return true;
          }
        });
        if (filter) {
          preventOnFilter && evt.preventDefault();
          return;
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el, false)) {
        return;
      }
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(evt, touch, target) {
      var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
      if (target && !dragEl && target.parentNode === el) {
        var dragRect = getRect(target);
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style["will-change"] = "all";
        dragStartFn = function dragStartFn2() {
          pluginEvent2("delayEnded", _this, {
            evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }
          _this._triggerDragStart(evt, touch);
          _dispatchEvent({
            sortable: _this,
            name: "choose",
            originalEvent: evt
          });
          toggleClass(dragEl, options.chosenClass, true);
        };
        options.ignore.split(",").forEach(function (criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
        if (options.supportPointer) {
          on(ownerDocument, "pointerup", _this._onDrop);
          !this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
        } else {
          on(ownerDocument, "mouseup", _this._onDrop);
          on(ownerDocument, "touchend", _this._onDrop);
          on(ownerDocument, "touchcancel", _this._onDrop);
        }
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent2("delayStart", this, {
          evt
        });
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          if (options.supportPointer) {
            on(ownerDocument, "pointerup", _this._disableDelayedDrag);
            on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
          } else {
            on(ownerDocument, "mouseup", _this._disableDelayedDrag);
            on(ownerDocument, "touchend", _this._disableDelayedDrag);
            on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
          }
          on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
          on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._disableDelayedDrag);
      off(ownerDocument, "touchend", this._disableDelayedDrag);
      off(ownerDocument, "touchcancel", this._disableDelayedDrag);
      off(ownerDocument, "pointerup", this._disableDelayedDrag);
      off(ownerDocument, "pointercancel", this._disableDelayedDrag);
      off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart(evt, touch) {
      touch = touch || evt.pointerType == "touch" && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._onTouchMove);
        } else if (touch) {
          on(document, "touchmove", this._onTouchMove);
        } else {
          on(document, "mousemove", this._onTouchMove);
        }
      } else {
        on(dragEl, "dragend", this);
        on(rootEl, "dragstart", this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {
      }
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent2("dragStarted", this, {
          evt
        });
        if (this.nativeDraggable) {
          on(document, "dragover", _checkOutsideTargetEl);
        }
        var options = this.options;
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();
        _dispatchEvent({
          sortable: this,
          name: "start",
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent)
            break;
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent;
          } while (parent = getParentOrHost(parent));
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove(evt) {
      if (tapEvt) {
        var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, "webkitTransform", cssMatrix);
          css(ghostEl, "mozTransform", cssMatrix);
          css(ghostEl, "msTransform", cssMatrix);
          css(ghostEl, "transform", cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
        if (PositionGhostAbsolutely) {
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document)
              ghostRelativeParent = getWindowScrollingElement();
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, "transition", "");
        css(ghostEl, "transform", "");
        css(ghostEl, "box-sizing", "border-box");
        css(ghostEl, "margin", 0);
        css(ghostEl, "top", rect.top);
        css(ghostEl, "left", rect.left);
        css(ghostEl, "width", rect.width);
        css(ghostEl, "height", rect.height);
        css(ghostEl, "opacity", "0.8");
        css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
        css(ghostEl, "zIndex", "100000");
        css(ghostEl, "pointerEvents", "none");
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);
        css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
      }
    },
    _onDragStart: function _onDragStart(evt, fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent2("dragStart", this, {
        evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent2("setupClone", this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.removeAttribute("id");
        cloneEl.draggable = false;
        cloneEl.style["will-change"] = "";
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }
      _this.cloneId = _nextTick(function () {
        pluginEvent2("clone", _this);
        if (Sortable.eventCanceled)
          return;
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: "clone"
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        off(document, "mouseup", _this._onDrop);
        off(document, "touchend", _this._onDrop);
        off(document, "touchcancel", _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = "move";
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, "drop", _this);
        css(dragEl, "transform", "translateZ(0)");
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, "selectstart", _this);
      moved = true;
      window.getSelection().removeAllRanges();
      if (Safari) {
        css(document.body, "user-select", "none");
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver(evt) {
      var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
      if (_silent)
        return;
      function dragOverEvent(name, extra) {
        pluginEvent2(name, _this, _objectSpread2({
          evt,
          isOwner,
          axis: vertical ? "vertical" : "horizontal",
          revert,
          dragRect,
          targetRect,
          canSort,
          fromSortable,
          target,
          completed,
          onMove: function onMove(target2, after2) {
            return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
          },
          changed
        }, extra));
      }
      function capture() {
        dragOverEvent("dragOverAnimationCapture");
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }
      function completed(insertion) {
        dragOverEvent("dragOverCompleted", {
          insertion
        });
        if (insertion) {
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function () {
            dragOverEvent("dragOverAnimationComplete");
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }
        if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
          lastTarget = null;
        }
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }
      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: "change",
          toEl: el,
          newIndex,
          newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el, true);
      dragOverEvent("dragOver");
      if (Sortable.eventCanceled)
        return completedFired;
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === "vertical";
        dragRect = getRect(dragEl);
        dragOverEvent("dragOverValid");
        if (Sortable.eventCanceled)
          return completedFired;
        if (revert) {
          parentEl = rootEl;
          capture();
          this._hideClone();
          dragOverEvent("revert");
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          if (elLastChild === dragEl) {
            return completed(false);
          }
          if (elLastChild && el === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              el.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el.appendChild(dragEl);
            }
            parentEl = el;
            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          var firstChild = getChild(el, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el.insertBefore(dragEl, firstChild);
            parentEl = el;
            changed();
            return completed(true);
          }
        } else if (target.parentNode === el) {
          targetRect = getRect(target);
          var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            var dragIndex = index(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
          }
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling, after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode;
            if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, "mousemove", this._onTouchMove);
      off(document, "touchmove", this._onTouchMove);
      off(document, "pointermove", this._onTouchMove);
      off(document, "dragover", nearestEmptyInsertDetectEvent);
      off(document, "mousemove", nearestEmptyInsertDetectEvent);
      off(document, "touchmove", nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._onDrop);
      off(ownerDocument, "touchend", this._onDrop);
      off(ownerDocument, "pointerup", this._onDrop);
      off(ownerDocument, "pointercancel", this._onDrop);
      off(ownerDocument, "touchcancel", this._onDrop);
      off(document, "selectstart", this);
    },
    _onDrop: function _onDrop(evt) {
      var el = this.el, options = this.options;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent2("drop", this, {
        evt
      });
      parentEl = dragEl && dragEl.parentNode;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);
      if (this.nativeDraggable) {
        off(document, "drop", this);
        off(el, "dragstart", this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, "user-select", "");
      }
      css(dragEl, "transform", "");
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, "dragend", this);
          }
          _disableDraggable(dragEl);
          dragEl.style["will-change"] = "";
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);
          _dispatchEvent({
            sortable: this,
            name: "unchoose",
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              _dispatchEvent({
                rootEl: parentEl,
                name: "add",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "remove",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                rootEl: parentEl,
                name: "sort",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  sortable: this,
                  name: "update",
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "sort",
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: "end",
              toEl: parentEl,
              originalEvent: evt
            });
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent2("nulling", this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      savedInputChecked.forEach(function (el) {
        el.checked = true;
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent(evt) {
      switch (evt.type) {
        case "drop":
        case "dragend":
          this._onDrop(evt);
          break;
        case "dragenter":
        case "dragover":
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case "selectstart":
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
      for (; i < n; i++) {
        el = children[i];
        if (closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {}, rootEl2 = this.el;
      this.toArray().forEach(function (id, i) {
        var el = rootEl2.children[i];
        if (closest(el, this.options.draggable, rootEl2, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function (id) {
        if (items[id]) {
          rootEl2.removeChild(items[id]);
          rootEl2.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el, selector) {
      return closest(el, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== "undefined") {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === "group") {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent2("destroy", this);
      var el = this.el;
      el[expando] = null;
      off(el, "mousedown", this._onTapStart);
      off(el, "touchstart", this._onTapStart);
      off(el, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        off(el, "dragover", this);
        off(el, "dragenter", this);
      }
      Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function (el2) {
        el2.removeAttribute("draggable");
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent2("hideClone", this);
        if (Sortable.eventCanceled)
          return;
        css(cloneEl, "display", "none");
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable2) {
      if (putSortable2.lastPutMode !== "clone") {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent2("showClone", this);
        if (Sortable.eventCanceled)
          return;
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, "display", "");
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move";
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  if (documentExists) {
    on(document, "touchmove", function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }
  Sortable.utils = {
    on,
    off,
    css,
    find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend,
    throttle,
    closest,
    toggleClass,
    clone,
    index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild,
    expando
  };
  Sortable.get = function (element) {
    return element[expando];
  };
  Sortable.mount = function () {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array)
      plugins2 = plugins2[0];
    plugins2.forEach(function (plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils)
        Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };
  Sortable.version = version;
  var autoScrolls = [];
  var scrollEl;
  var scrollRootEl;
  var scrolling = false;
  var lastAutoScrollX;
  var lastAutoScrollY;
  var touchEvt$1;
  var pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, "dragover", this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, "touchmove", this._handleFallbackAutoScroll);
          } else {
            on(document, "mousemove", this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, "dragover", this._handleAutoScroll);
        } else {
          off(document, "pointermove", this._handleFallbackAutoScroll);
          off(document, "touchmove", this._handleFallbackAutoScroll);
          off(document, "mousemove", this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function () {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: "scroll",
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function (autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function (evt, options, rootEl2, isFallback) {
    if (!options.scroll)
      return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
    var scrollThisInstance = false, scrollCustomFn;
    if (scrollRootEl !== rootEl2) {
      scrollRootEl = rootEl2;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl2, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
      if (el === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          autoScrolls[layersOut].pid = setInterval(function () {
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1);
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === "function") {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance;
  }, 30);
  var drop = function drop2(_ref) {
    var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent)
      return;
    var toSortable = putSortable2 || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent("spill");
      this.onSpill({
        dragEl: dragEl2,
        putSortable: putSortable2
      });
    }
  };
  function Revert() {
  }
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex2 = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex2;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable2) {
        putSortable2.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl2, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl2);
      }
      this.sortable.animateAll();
      if (putSortable2) {
        putSortable2.animateAll();
      }
    },
    drop
  };
  _extends(Revert, {
    pluginName: "revertOnSpill"
  });
  function Remove() {
  }
  Remove.prototype = {
    onSpill: function onSpill2(_ref4) {
      var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
      var parentSortable = putSortable2 || this.sortable;
      parentSortable.captureAnimationState();
      dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
      parentSortable.animateAll();
    },
    drop
  };
  _extends(Remove, {
    pluginName: "removeOnSpill"
  });
  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);
  var sortable_esm_default = Sortable;

  // src/content/components/PromptList.ts
  var PromptList = class extends Component {
    constructor() {
      super(...arguments);
      this.list = null;
      this.MAX_CHIPS_TO_SHOW = 3;
      // --- PROPERTIES ---
      this.selectedIndex = 0;
      this.filteredPrompts = [];
      // To track what is currently visible
      this.sortable = null;
    }
    // ------------------
    mount(parent) {
      this.list = parent.querySelector("#list");
      if (!this.list) {
        console.error("PromptList: #list element not found in parent");
        return;
      }
      this.store.subscribe("prompts_updated", () => this.render());
      this.store.subscribe("filter_updated", () => this.render());
      this.store.subscribe("tags_updated", () => this.render());
      this.initSortable();
      this.render();
    }
    render() {
      if (!this.list)
        return;
      const scrollTop = this.list.scrollTop;
      const newFiltered = this.store.getFilteredPrompts();
      if (newFiltered.length !== this.filteredPrompts.length || newFiltered.length > 0 && this.filteredPrompts.length > 0 && newFiltered[0].id !== this.filteredPrompts[0].id) {
        this.selectedIndex = 0;
      }
      this.filteredPrompts = newFiltered;
      if (this.selectedIndex >= this.filteredPrompts.length) {
        this.selectedIndex = 0;
      }
      this.list.innerHTML = "";
      if (this.filteredPrompts.length === 0) {
        const e = this.el("div", "empty", "No prompts (or none match your search).");
        this.list.appendChild(e);
        return;
      }
      this.filteredPrompts.forEach((p, index2) => {
        const row = this.createPromptRow(p);
        if (index2 === this.selectedIndex) {
          row.classList.add("selected");
        }
        this.list.appendChild(row);
      });
      this.list.scrollTop = scrollTop;
    }
    // src/content/components/PromptList.ts
    // src/content/components/PromptList.ts
    // src/content/components/PromptList.ts
    // --- Only handles the bottom spacer ---
    // --- PUBLIC METHODS ---
    selectNext() {
      if (this.filteredPrompts.length === 0)
        return;
      this.selectedIndex = (this.selectedIndex + 1) % this.filteredPrompts.length;
      this.updateSelectionVisuals();
    }
    selectPrev() {
      if (this.filteredPrompts.length === 0)
        return;
      this.selectedIndex = (this.selectedIndex - 1 + this.filteredPrompts.length) % this.filteredPrompts.length;
      this.updateSelectionVisuals();
    }
    async copySelected() {
      if (this.filteredPrompts.length === 0)
        return;
      const p = this.filteredPrompts[this.selectedIndex];
      if (p) {
        try {
          await navigator.clipboard.writeText(p.text);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copied" } }));
        } catch {
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copy failed" } }));
        }
      }
    }
    updateSelectionVisuals() {
      const rows = this.list?.children;
      if (!rows)
        return;
      let rowIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        const el = rows[i];
        if (!el.classList.contains("row"))
          continue;
        if (rowIndex === this.selectedIndex) {
          el.classList.add("selected");
          el.scrollIntoView({ block: "nearest" });
        } else {
          el.classList.remove("selected");
        }
        rowIndex++;
      }
    }
    createPromptRow(p) {
      const row = this.el("div", "row");
      if (!p.quick)
        row.classList.add("heading-row");
      row.dataset.id = p.id;
      row.addEventListener("click", async () => {
        const idx = this.filteredPrompts.findIndex((x) => x.id === p.id);
        if (idx !== -1) {
          this.selectedIndex = idx;
          this.updateSelectionVisuals();
        }
        try {
          await navigator.clipboard.writeText(p.text);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copied" } }));
        } catch {
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copy failed" } }));
        }
      });
      const left = this.el("div", "left");
      const isFiltered = this.store.filterText.trim() !== "" || this.store.selectedTagIds.length > 0;
      if (!isFiltered) {
        const handle = this.el("div", "drag-handle");
        handle.innerHTML = "&#x2261;";
        handle.addEventListener("click", (ev) => {
          ev.stopPropagation();
        });
        left.appendChild(handle);
      }
      const label = this.el("div", "label", p.title);
      left.appendChild(label);
      const isTagFilterActive = this.store.selectedTagIds.length > 0;
      if (isTagFilterActive && p.tags && p.tags.length > 0) {
        const chips = this.createTagChips(p.tags);
        left.appendChild(chips);
      }
      const icons = this.el("div", "icons");
      const editBtn = this.el("button", "icon-btn");
      editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const event = new CustomEvent("edit-prompt", { detail: { promptId: p.id } });
        this.shadow.dispatchEvent(event);
      });
      icons.appendChild(editBtn);
      row.appendChild(left);
      row.appendChild(icons);
      row.addEventListener("dragover", (ev) => ev.preventDefault());
      return row;
    }
    createTagChips(tagIds) {
      const chips = this.el("div", "tag-chips");
      const pTags = tagIds.map((id) => this.store.tags.find((t) => t.id === id)).filter(Boolean);
      const visible = pTags.slice(0, this.MAX_CHIPS_TO_SHOW);
      visible.forEach((t) => {
        const chip = this.el("span", "tag-chip", t.name);
        chip.title = t.name;
        const bg = t.color || "#333333";
        chip.style.background = bg;
        chip.style.color = this.getContrastTextColor(bg);
        chip.style.border = "1px solid rgba(0,0,0,0.1)";
        chip.style.fontWeight = "600";
        chips.appendChild(chip);
      });
      if (pTags.length > this.MAX_CHIPS_TO_SHOW) {
        const more = this.el("span", "tag-chip overflow", `+${pTags.length - this.MAX_CHIPS_TO_SHOW}`);
        chips.appendChild(more);
      }
      return chips;
    }
    getContrastTextColor(hexColor) {
      if (!hexColor || !hexColor.startsWith("#"))
        return "#ffffff";
      const r = parseInt(hexColor.substring(1, 3), 16);
      const g = parseInt(hexColor.substring(3, 5), 16);
      const b = parseInt(hexColor.substring(5, 7), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b))
        return "#ffffff";
      const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
      return yiq >= 128 ? "#000000" : "#ffffff";
    }
    initSortable() {
      if (!this.list)
        return;
      this.sortable = new sortable_esm_default(this.list, {
        animation: 150,
        ghostClass: "ghost",
        // Class for the drop placeholder
        chosenClass: "chosen",
        // Class for the item being dragged
        handle: ".drag-handle",
        // Restrict drag start to this handle
        fallbackTolerance: 5,
        // Fired when the user finishes dragging
        onEnd: (evt) => {
          const { oldIndex: oldIndex2, newIndex: newIndex2 } = evt;
          if (oldIndex2 === void 0 || newIndex2 === void 0 || oldIndex2 === newIndex2) {
            return;
          }
          this.store.reorderPromptsSilently(oldIndex2, newIndex2);
        }
      });
    }
  };

  // src/content/components/PromptEditor.ts
  var PromptEditor = class extends Component {
    constructor() {
      super(...arguments);
      this.area = null;
      this.inputTitle = null;
      this.inputQuick = null;
      this.inputBody = null;
      this.saveBtn = null;
      this.cancelBtn = null;
      // --- NEW PROPERTY ---
      this.deleteBtn = null;
      // --------------------
      this.editingId = null;
      // Public property so App can read it
      this.draftTagIds = [];
      // Callback for when tags change internally
      this.onTagsChanged = null;
    }
    isOpen() {
      return this.area ? this.area.classList.contains("open") : false;
    }
    mount(parent) {
      this.area = parent.querySelector("#add-area");
      this.inputTitle = parent.querySelector("#input-title");
      this.inputQuick = parent.querySelector("#input-quick");
      this.inputBody = parent.querySelector("#input-body");
      this.saveBtn = parent.querySelector("#save-btn");
      this.cancelBtn = parent.querySelector("#cancel-btn");
      if (this.saveBtn) {
        this.saveBtn.addEventListener("click", () => this.save());
      }
      if (this.cancelBtn) {
        this.cancelBtn.addEventListener("click", () => this.close());
      }
    }
    // Helper method for App.ts to call
    toggleTag(tagId) {
      if (this.draftTagIds.includes(tagId)) {
        this.draftTagIds = this.draftTagIds.filter((id) => id !== tagId);
      } else {
        this.draftTagIds.push(tagId);
      }
      if (this.onTagsChanged)
        this.onTagsChanged();
    }
    open(promptId) {
      if (!this.area)
        return;
      this.area.classList.add("open");
      this.area.setAttribute("aria-hidden", "false");
      this.shadow.getElementById("panel")?.classList.add("mode-add");
      if (promptId) {
        this.editingId = promptId;
        const p = this.store.prompts.find((x) => x.id === promptId);
        if (p) {
          if (this.inputTitle)
            this.inputTitle.value = p.title;
          if (this.inputQuick)
            this.inputQuick.value = p.quick || "";
          if (this.inputBody)
            this.inputBody.value = p.text;
          this.draftTagIds = [...p.tags || []];
        }
        this.renderDeleteButton();
      } else {
        this.editingId = null;
        this.resetInputs();
        this.draftTagIds = [];
        this.removeDeleteButton();
      }
      if (this.onTagsChanged)
        this.onTagsChanged();
    }
    close() {
      if (!this.area)
        return;
      this.area.classList.remove("open");
      this.area.setAttribute("aria-hidden", "true");
      this.shadow.getElementById("panel")?.classList.remove("mode-add");
      this.resetInputs();
      this.removeDeleteButton();
      this.shadow.dispatchEvent(new CustomEvent("editor-closed"));
    }
    // --- NEW HELPER METHODS ---
    renderDeleteButton() {
      if (this.deleteBtn)
        return;
      if (!this.area)
        return;
      this.deleteBtn = this.el("button", "delete-btn");
      this.deleteBtn.title = "Delete prompt";
      this.deleteBtn.setAttribute("aria-label", "Delete prompt");
      this.deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" fill="none"/></svg>';
      this.deleteBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        if (!this.editingId)
          return;
        if (confirm("Delete this prompt?")) {
          await this.store.deletePrompt(this.editingId);
          this.close();
        }
      });
      this.area.appendChild(this.deleteBtn);
    }
    removeDeleteButton() {
      if (this.deleteBtn) {
        this.deleteBtn.remove();
        this.deleteBtn = null;
      }
    }
    // --------------------------------
    resetInputs() {
      if (this.inputTitle)
        this.inputTitle.value = "";
      if (this.inputQuick)
        this.inputQuick.value = "";
      if (this.inputBody)
        this.inputBody.value = "";
    }
    async save() {
      const title = this.inputTitle?.value.trim();
      const text = this.inputBody?.value;
      const quick = this.inputQuick?.value.trim() || "";
      if (!title || !text) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "Title and Body are required" }
        }));
        return;
      }
      if (this.editingId) {
        await this.store.updatePrompt(this.editingId, { title, text, quick, tags: this.draftTagIds });
      } else {
        await this.store.addPrompt(title, text, quick, this.draftTagIds);
      }
      this.shadow.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Saved" }
      }));
      this.close();
    }
  };

  // src/content/components/SettingsModal.ts
  var SettingsModal = class extends Component {
    constructor() {
      super(...arguments);
      this.area = null;
      this.fontSizeInput = null;
      this.themeSelect = null;
      this.hotspotPosSelect = null;
      this.saveBtn = null;
      this.cancelBtn = null;
    }
    isOpen() {
      return this.area ? this.area.classList.contains("open") : false;
    }
    mount(parent) {
      this.area = parent.querySelector("#settings-area");
      this.fontSizeInput = parent.querySelector("#s-font-size");
      this.themeSelect = parent.querySelector("#s-theme");
      this.hotspotPosSelect = parent.querySelector("#s-hotspot-pos");
      this.saveBtn = parent.querySelector("#s-save");
      this.cancelBtn = parent.querySelector("#s-cancel");
      if (this.saveBtn) {
        this.saveBtn.addEventListener("click", () => this.save());
      }
      if (this.cancelBtn) {
        this.cancelBtn.addEventListener("click", () => this.close());
      }
      this.store.subscribe("settings_updated", () => this.loadSettings());
    }
    open() {
      if (!this.area)
        return;
      this.area.classList.add("open");
      this.area.setAttribute("aria-hidden", "false");
      this.shadow.getElementById("panel")?.classList.add("mode-settings");
      this.loadSettings();
    }
    close() {
      if (!this.area)
        return;
      this.area.classList.remove("open");
      this.area.setAttribute("aria-hidden", "true");
      this.shadow.getElementById("panel")?.classList.remove("mode-settings");
    }
    loadSettings() {
      if (this.fontSizeInput)
        this.fontSizeInput.value = String(this.store.settings.fontSizePx);
      if (this.themeSelect)
        this.themeSelect.value = this.store.settings.theme;
      if (this.hotspotPosSelect)
        this.hotspotPosSelect.value = this.store.settings.hotspotPosition;
    }
    async save() {
      const updates = {};
      if (this.fontSizeInput) {
        const fontSize = parseInt(this.fontSizeInput.value);
        if (!isNaN(fontSize))
          updates.fontSizePx = fontSize;
      }
      if (this.themeSelect) {
        updates.theme = this.themeSelect.value;
      }
      if (this.hotspotPosSelect) {
        updates.hotspotPosition = this.hotspotPosSelect.value;
      }
      await this.store.updateSettings(updates);
      this.shadow.dispatchEvent(new CustomEvent("apply-settings"));
      this.close();
    }
  };

  // src/content/resize.ts
  function setupResizeHandles(opts) {
    const { panel, shadow, host, getSettings, saveSettings } = opts;
    let isResizing = false;
    let resizeDir = null;
    let resizeStart = { x: 0, y: 0, w: 0, h: 0 };
    function getCursorForDir(d) {
      switch (d) {
        case "left":
        case "right":
          return "ew-resize";
        case "top":
        case "bottom":
          return "ns-resize";
        case "top-left":
        case "bottom-right":
          return "nwse-resize";
        case "top-right":
        case "bottom-left":
          return "nesw-resize";
        default:
          return "move";
      }
    }
    function ensureResizeHandles() {
      const dirs = ["left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"];
      for (const d of dirs) {
        let el = shadow.querySelector(`.resize-${d}`);
        if (!el) {
          el = document.createElement("div");
          el.className = `resize-handle resize-${d}`;
          Object.assign(el.style, {
            position: "absolute",
            zIndex: "2147483652",
            background: "transparent",
            width: "12px",
            height: "12px",
            cursor: getCursorForDir(d)
          });
          panel.appendChild(el);
        }
      }
      const setPositions = () => {
        const size = 12;
        const half = size / 2;
        const mapping = {
          "resize-left": { left: `-${half}px`, top: "0", height: "100%", width: `${size}px` },
          "resize-right": { right: `-${half}px`, top: "0", height: "100%", width: `${size}px` },
          "resize-top": { top: `-${half}px`, left: "0", width: "100%", height: `${size}px` },
          "resize-bottom": { bottom: `-${half}px`, left: "0", width: "100%", height: `${size}px` },
          "resize-top-left": { left: `-${half}px`, top: `-${half}px`, width: `${size}px`, height: `${size}px` },
          "resize-top-right": { right: `-${half}px`, top: `-${half}px`, width: `${size}px`, height: `${size}px` },
          "resize-bottom-left": { left: `-${half}px`, bottom: `-${half}px`, width: `${size}px`, height: `${size}px` },
          "resize-bottom-right": { right: `-${half}px`, bottom: `-${half}px`, width: `${size}px`, height: `${size}px` }
        };
        Object.entries(mapping).forEach(([cls, styleObj]) => {
          const el = panel.querySelector(`.${cls}`);
          if (!el)
            return;
          Object.assign(el.style, styleObj);
        });
      };
      panel.querySelectorAll(".resize-handle").forEach((el) => {
        el.addEventListener("pointerdown", (ev) => {
          ev.stopPropagation();
          el.setPointerCapture(ev.pointerId);
          ev.target.setPointerCapture?.(ev.pointerId);
          startResize(ev.clientX, ev.clientY, (el.className || "").replace("resize-handle", "").trim());
          el.addEventListener("pointerup", (ev2) => {
            el.releasePointerCapture(ev2.pointerId);
          });
        });
      });
      setTimeout(setPositions, 0);
    }
    function startResize(mouseX, mouseY, cls) {
      isResizing = true;
      panel.classList.add("is-resizing");
      resizeDir = cls.replace("resize-", "");
      const rect = panel.getBoundingClientRect();
      resizeStart = { x: mouseX, y: mouseY, w: rect.width, h: rect.height };
      document.documentElement.style.userSelect = "none";
    }
    document.addEventListener("pointermove", (ev) => {
      if (!isResizing || !resizeDir)
        return;
      ev.preventDefault();
      const dx = ev.clientX - resizeStart.x;
      const dy = ev.clientY - resizeStart.y;
      let newW = resizeStart.w;
      let newH = resizeStart.h;
      if (resizeDir.includes("right"))
        newW = Math.max(200, resizeStart.w + dx);
      if (resizeDir.includes("left"))
        newW = Math.max(200, resizeStart.w - dx);
      if (resizeDir.includes("bottom"))
        newH = Math.max(120, resizeStart.h + dy);
      if (resizeDir.includes("top"))
        newH = Math.max(120, resizeStart.h - dy);
      panel.style.width = `${newW}px`;
      panel.style.height = `${newH}px`;
    });
    document.addEventListener("pointerup", async () => {
      if (!isResizing)
        return;
      isResizing = false;
      panel.classList.remove("is-resizing");
      resizeDir = null;
      document.documentElement.style.userSelect = "";
      try {
        const s = getSettings();
        const vh = Math.round(panel.offsetHeight / window.innerHeight * 100);
        s.popupWidthPx = panel.offsetWidth;
        s.popupHeightVh = vh;
        await saveSettings(s);
      } catch (e) {
      }
    });
    ensureResizeHandles();
  }

  // src/content/components/App.ts
  var App = class extends Component {
    // ------------------------
    constructor(store, shadow, host) {
      super(store, shadow);
      this.panel = null;
      this.hotzone = null;
      // Backdrop for click-outside handling
      this.backdrop = null;
      // --- AUTO-CLOSE PROPERTIES ---
      this.autoCloseTimer = null;
      this.AUTO_CLOSE_BUFFER = 20;
      // px
      this.AUTO_CLOSE_DELAY = 300;
      // ms
      // -----------------------------
      // --- TOAST PROPERTIES ---
      this.toastEl = null;
      this.toastTimer = null;
      this.host = host;
      this.searchBar = new SearchBar(store, shadow);
      this.tagDropdown = new TagDropdown(store, shadow);
      this.promptList = new PromptList(store, shadow);
      this.promptEditor = new PromptEditor(store, shadow);
      this.settingsModal = new SettingsModal(store, shadow);
    }
    mount(parent) {
      this.panel = this.shadow.getElementById("panel");
      this.hotzone = this.shadow.getElementById("hotzone");
      this.toastEl = this.shadow.getElementById("toast");
      if (!this.panel || !this.hotzone)
        return;
      this.searchBar.mount(this.panel);
      this.tagDropdown.mount(this.panel);
      this.promptList.mount(this.panel);
      this.promptEditor.mount(this.panel);
      this.settingsModal.mount(this.panel);
      setupResizeHandles({
        panel: this.panel,
        shadow: this.shadow,
        host: this.host,
        getSettings: () => this.store.settings,
        saveSettings: (s) => this.store.updateSettings(s)
      });
      this.setupEventListeners();
      this.setupPanelBehavior();
      this.applySettings();
      this.store.subscribe("settings_updated", () => this.applySettings());
    }
    // --- Public Toggle Method for Alt+P ---
    toggle() {
      if (this.panel?.classList.contains("open")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }
    // --- Public destroy method for Permission Removal ---
    destroy() {
      this.host.remove();
      if (this.backdrop)
        this.backdrop.remove();
      window.__promptManagerInitialized = false;
    }
    setupEventListeners() {
      this.shadow.addEventListener("open-add-mode", () => this.openEditor());
      this.shadow.addEventListener("edit-prompt", (e) => {
        this.openEditor(e.detail.promptId);
      });
      this.shadow.addEventListener("toggle-tags-dropdown", () => this.tagDropdown.toggle());
      this.shadow.addEventListener("open-settings", () => this.settingsModal.open());
      this.shadow.addEventListener("close-panel", () => this.closePanel());
      this.shadow.addEventListener("apply-settings", () => this.applySettings());
      this.shadow.addEventListener("nav-next", () => this.promptList.selectNext());
      this.shadow.addEventListener("nav-prev", () => this.promptList.selectPrev());
      this.shadow.addEventListener("nav-copy", () => this.promptList.copySelected());
      this.shadow.addEventListener("nav-reset", () => {
      });
      this.shadow.addEventListener("editor-closed", () => {
        this.tagDropdown.onTagSelect = null;
        this.tagDropdown.activeTagIds = [];
        this.tagDropdown.refresh();
      });
      this.shadow.addEventListener("show-toast", (e) => {
        this.showToast(e.detail.message);
      });
    }
    // --- HELPER METHOD ---
    openEditor(promptId) {
      this.promptEditor.open(promptId);
      this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;
      this.tagDropdown.onTagSelect = (tagId) => {
        this.promptEditor.toggleTag(tagId);
        this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;
      };
      this.promptEditor.onTagsChanged = () => {
        this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;
        this.tagDropdown.refresh();
      };
      this.tagDropdown.refresh();
    }
    // --- TOAST HELPER ---
    showToast(msg) {
      if (!this.toastEl)
        return;
      this.toastEl.textContent = msg;
      this.toastEl.classList.add("show");
      if (this.toastTimer)
        clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        if (this.toastEl)
          this.toastEl.classList.remove("show");
        this.toastTimer = null;
      }, 1400);
    }
    // --------------------
    setupPanelBehavior() {
      if (!this.hotzone || !this.panel)
        return;
      this.hotzone.addEventListener("mouseenter", () => this.openPanel());
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          if (!this.panel?.classList.contains("open"))
            return;
          const tagsDropdown = this.shadow.getElementById("tags-dropdown");
          if (tagsDropdown?.classList.contains("open")) {
            ev.preventDefault();
            ev.stopPropagation();
            this.tagDropdown.close();
            return;
          }
          const editorArea = this.shadow.getElementById("add-area");
          if (editorArea?.classList.contains("open")) {
            ev.preventDefault();
            ev.stopPropagation();
            this.promptEditor.close();
            return;
          }
          const settingsModal = this.shadow.getElementById("settings-modal");
          if (settingsModal?.classList.contains("open")) {
            ev.preventDefault();
            ev.stopPropagation();
            this.settingsModal.close();
            return;
          }
          ev.preventDefault();
          ev.stopPropagation();
          this.closePanel();
        }
      });
      document.addEventListener("mousedown", (ev) => {
        if (!this.panel?.classList.contains("open"))
          return;
        const path = ev.composedPath ? ev.composedPath() : [ev.target];
        const isInsidePanel = path.includes(this.panel);
        const isInsideHotspot = path.includes(this.hotzone);
        const isInsideDropdown = path.some((el) => {
          return el instanceof Element && (el.id === "tags-dropdown" || el.id === "tags-btn");
        });
        if (!isInsidePanel && !isInsideHotspot) {
          this.closePanel();
          return;
        }
        if (isInsidePanel && !isInsideDropdown && this.tagDropdown.isOpen()) {
          this.tagDropdown.close();
        }
      });
      document.addEventListener("mousemove", (ev) => this.handleAutoClose(ev));
    }
    // --- HANDLE AUTO CLOSE ---
    handleAutoClose(ev) {
      if (!this.panel?.classList.contains("open"))
        return;
      if (this.panel.classList.contains("mode-add") || this.panel.classList.contains("mode-settings") || this.panel.classList.contains("is-resizing")) {
        this.clearAutoCloseTimer();
        return;
      }
      const rect = this.panel.getBoundingClientRect();
      const isInBufferedZone = ev.clientX >= rect.left - this.AUTO_CLOSE_BUFFER && ev.clientX <= rect.right + this.AUTO_CLOSE_BUFFER && ev.clientY >= rect.top - this.AUTO_CLOSE_BUFFER && ev.clientY <= rect.bottom + this.AUTO_CLOSE_BUFFER;
      if (isInBufferedZone) {
        this.clearAutoCloseTimer();
      } else {
        if (!this.autoCloseTimer) {
          this.autoCloseTimer = window.setTimeout(() => {
            this.closePanel();
            this.autoCloseTimer = null;
          }, this.AUTO_CLOSE_DELAY);
        }
      }
    }
    clearAutoCloseTimer() {
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
    }
    // -------------------------
    openPanel() {
      if (this.panel) {
        this.panel.classList.add("open");
        setTimeout(() => {
          const search = this.shadow.getElementById("search-input");
          if (search)
            search.focus();
        }, 50);
      }
    }
    closePanel() {
      this.clearAutoCloseTimer();
      if (this.panel) {
        this.panel.classList.remove("open");
        this.tagDropdown.close();
        this.promptEditor.close();
        this.settingsModal.close();
      }
    }
    applySettings() {
      const s = this.store.settings;
      this.host.style.setProperty("--popup-width", `${s.popupWidthPx || 340}px`);
      this.host.style.setProperty("--popup-height", s.popupHeightVh ? `${s.popupHeightVh}vh` : "56vh");
      this.host.style.setProperty("--font-size", `${s.fontSizePx || 13}px`);
      this.host.style.setProperty("--hotspot-width", `${s.hotspotWidthPx || 24}px`);
      this.host.setAttribute("data-hotspot-position", s.hotspotPosition || "edge");
      this.host.setAttribute("data-theme", s.theme || "dark");
      if (this.panel) {
        this.panel.style.fontSize = `${s.fontSizePx || 13}px`;
      }
    }
  };

  // src/content/ui.ts
  async function renderUI(opts) {
    const { host, shadow, prompts, tags, settings } = opts;
    if (!host || !shadow)
      return;
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.settings = settings;
    const app = new App(store, shadow, host);
    app.mount(shadow);
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === "TOGGLE_POPUP") {
        app.toggle();
        sendResponse({ ok: true });
      }
      if (msg.type === "PERMISSION_REMOVED" && msg.pattern) {
        const currentUrl = window.location.href;
        const origin = msg.pattern.replace(/\/\*$/, "");
        if (currentUrl.startsWith(origin)) {
          app.destroy();
        }
      }
      return true;
    });
    console.log("Prompt Manager UI initialized");
  }

  // src/content/components/TextExpander.ts
  var TextExpander = class {
    constructor(store) {
      this.listening = false;
      this.handleKeyDown = (ev) => {
        try {
          if (!chrome.runtime.id)
            throw new Error();
        } catch (e) {
          this.destroy();
          return;
        }
        if (ev.key !== " " && ev.code !== "Space")
          return;
        const activeEl = document.activeElement;
        if (!activeEl)
          return;
        const isInput = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";
        const isContentEditable = activeEl.isContentEditable;
        if (!isInput && !isContentEditable)
          return;
        const word = this.getWordBeforeCaret(activeEl);
        if (!word)
          return;
        if (!word.startsWith("."))
          return;
        const shortcut = word.slice(1);
        const match = this.store.prompts.find((p) => p.quick === shortcut);
        if (match) {
          console.log(`TextExpander: Expanding ".${shortcut}"`);
          ev.preventDefault();
          ev.stopImmediatePropagation();
          this.replaceText(activeEl, word, match.text);
        }
      };
      this.store = store;
    }
    mount() {
      if (this.listening)
        return;
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.listening = true;
      console.log("TextExpander: Mounted.");
    }
    destroy() {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      this.listening = false;
    }
    /**
     * Replaces 'target' (the shortcut) with 'replacement' (the prompt)
     * inside the element, handling both Input and ContentEditable.
     */
    replaceText(el, target, replacement) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const input = el;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const replaceStart = start - target.length;
        if (replaceStart >= 0) {
          input.setRangeText(replacement, replaceStart, start, "end");
          this.triggerEvents(input);
        }
      } else {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0)
          return;
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          const text = node.textContent;
          const offset = range.startOffset;
          const replaceStart = offset - target.length;
          if (replaceStart >= 0) {
            range.setStart(node, replaceStart);
            range.setEnd(node, offset);
            range.deleteContents();
            const newNode = document.createTextNode(replacement);
            range.insertNode(newNode);
            range.setStartAfter(newNode);
            range.setEndAfter(newNode);
            sel.removeAllRanges();
            sel.addRange(range);
            this.triggerEvents(el);
          }
        }
      }
    }
    /**
     * Fires input/change events to notify JS frameworks of the change.
     */
    triggerEvents(el) {
      const eventTypes = ["input", "change"];
      for (const type of eventTypes) {
        const ev = new Event(type, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
      }
    }
    getWordBeforeCaret(el) {
      try {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          const input = el;
          const cursorPos = input.selectionStart || 0;
          const textBefore = input.value.slice(0, cursorPos);
          const match = textBefore.match(/(\S+)$/);
          return match ? match[1] : null;
        } else {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0)
            return null;
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          const offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const textBefore = node.textContent.slice(0, offset);
            const match = textBefore.match(/(\S+)$/);
            return match ? match[1] : null;
          }
        }
      } catch (e) {
        return null;
      }
      return null;
    }
  };

  // src/content/main.ts
  var PROMPTS_KEY2 = "promptManager.prompts";
  var SETTINGS_KEY2 = "promptManager.settings";
  var TAGS_KEY2 = "promptManager.tags";
  var DEFAULT_SETTINGS2 = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24
  };
  function uid2() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  async function loadAndInit() {
    let prompts = [];
    let settings = DEFAULT_SETTINGS2;
    let tags = [];
    let isFirstInstall = false;
    try {
      const p = await getStorage(PROMPTS_KEY2);
      prompts = Array.isArray(p) ? p : [];
    } catch (e) {
      prompts = [];
    }
    try {
      const s = await getStorage(SETTINGS_KEY2);
      settings = s ? s : DEFAULT_SETTINGS2;
    } catch (e) {
      settings = DEFAULT_SETTINGS2;
    }
    try {
      const t = await getStorage(TAGS_KEY2);
      tags = Array.isArray(t) ? t : [];
    } catch (e) {
      tags = [];
    }
    if (prompts.length === 0 && tags.length === 0) {
      isFirstInstall = true;
      tags = DEFAULT_TAGS.map((dt, index2) => ({
        id: uid2(),
        name: dt.name,
        color: dt.color,
        order: index2
      }));
      prompts = DEFAULT_PROMPTS.map((dp) => {
        const promptTags = [];
        if (dp.tags) {
          for (const tagName of dp.tags) {
            const tag = tags.find((t) => t.name === tagName);
            if (tag)
              promptTags.push(tag.id);
          }
        }
        return {
          id: uid2(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags
        };
      });
      try {
        await Promise.all([
          setStorage({ [PROMPTS_KEY2]: prompts }),
          setStorage({ [TAGS_KEY2]: tags }),
          setStorage({ [SETTINGS_KEY2]: settings })
        ]);
      } catch (e) {
        console.warn("Failed to save default prompts/tags:", e);
      }
    }
    const { host, shadow } = createOrGetHost();
    if (!host || !shadow)
      return;
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.settings = settings;
    await renderUI({ host, shadow, prompts, tags, settings, PROMPTS_KEY: PROMPTS_KEY2, SETTINGS_KEY: SETTINGS_KEY2, TAGS_KEY: TAGS_KEY2 });
    const expander = new TextExpander(store);
    expander.mount();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadAndInit().catch(console.error), { once: true });
  } else {
    loadAndInit().catch(console.error);
  }
})();
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.6
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
