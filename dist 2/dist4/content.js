"use strict";
(() => {
  // src/content/styles.ts
  var STYLES = `
/* --- RESET & VARIABLES --- */
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  
  /* --- PALETTE (Deep Focus - Dark) --- */
  --bg-app: #09090b;      /* Main Background */
  --bg-panel: #18181b;    /* Cards & Modals */
  --bg-input: #27272a;    /* Form Fields */
  --bg-hover: rgba(255, 255, 255, 0.08);
  --bg-active: rgba(255, 255, 255, 0.12);
  
  --border-subtle: #27272a;
  --border-default: #3f3f46;
  --border-focus: #3b82f6;
  
  --accent: #3b82f6;      /* Primary Blue */
  --accent-hover: #2563eb;
  --accent-dim: rgba(59, 130, 246, 0.15);
  --danger: #ef4444;
  
  --txt-primary: #fafafa;
  --txt-secondary: #a1a1aa;
  --txt-muted: #52525b;
  
  --radius: 12px;
  --radius-sm: 6px;
  --radius-md: 8px;
  
  /* --- LAYOUT --- */
  --header-height: 60px;
  --footer-height: 50px;
  --popup-width: 360px;
  --popup-height: 600px;
}

/* Light Theme Override */
:host([data-theme="light"]) {
  /* --- BACKGROUNDS --- */
  --bg-app: #f4f4f5;      /* Zinc-100 (Page/Toast bg) */
  --bg-panel: #ffffff;    /* White (Card/Panel bg) */
  --bg-input: #f4f4f5;    /* Zinc-100 */
  --bg-hover: rgba(0, 0, 0, 0.04);
  --bg-active: rgba(0, 0, 0, 0.08);
  
  /* --- BORDERS --- */
  --border-subtle: #e4e4e7; /* Zinc-200 */
  --border-default: #d4d4d8; /* Zinc-300 */
  --border-focus: #3b82f6;   /* Blue-500 */
  
  /* --- ACCENTS --- */
  --accent: #2563eb;         /* Blue-600 (Darker for visibility on white) */
  --accent-hover: #1d4ed8;   /* Blue-700 */
  --accent-dim: rgba(37, 99, 235, 0.1);
  --danger: #dc2626;         /* Red-600 */
  
  /* --- TYPOGRAPHY --- */
  --txt-primary: #000000;    /* Pure Black */
  --txt-secondary: #333333;  /* Dark Gray */
  --txt-muted: #a1a1aa;      /* Zinc-400 */
}

/* --- GLOBAL SCROLLBAR HIDING --- */
* {
  font-family: inherit;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
*::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* --- FORM ELEMENT BOX-SIZING --- */
input, textarea, select {
  box-sizing: border-box;
}

/* --- GLOBAL ELEMENTS --- */
button {
  cursor: pointer;
}

/* --- MAIN PANEL --- */
.panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: var(--popup-width);
  height: var(--popup-height);
  background-color: var(--bg-panel);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px -5px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 14px;
  
  /* Animation */
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.panel.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* --- HOTSPOT --- */
.hotzone {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  color: var(--txt-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  pointer-events: auto;
  z-index: 2147483647;
  transition: transform 0.2s;
}
.hotzone:hover { transform: scale(1.1); border-color: var(--accent); }

:host([data-hotspot-position="edge"]) .hotzone {
  right: 0;
  top: 50%;
  width: 8px;
  height: var(--popup-height);
  border-radius: 4px 0 0 4px;
  transform: translateY(-50%);
  font-size: 0; /* Hide chat icon in edge mode */
}

:host([data-hotspot-position="edge"]) .panel {
  bottom: auto;
  top: 50%;
  right: 12px;
  transform: translateY(-50%) translateY(10px) scale(0.98);
}

:host([data-hotspot-position="edge"]) .panel.open {
  transform: translateY(-50%) translateY(0) scale(1);
}

/* --- LAYOUT AREAS --- */
.header {
  height: var(--header-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.list::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.footer {
  height: var(--footer-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-panel);
  flex-shrink: 0;
}

/* --- SEARCH BAR --- */
.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  transition: background 0.2s;
}
.search-wrapper:focus-within {
  background: rgba(255,255,255,0.06);
}

.search-icon {
  color: var(--txt-secondary);
  width: 16px; height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 36px;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: var(--txt-primary) !important;
  font-size: 14px !important;
  padding: 0 !important;
  box-shadow: none !important;
}

/* --- EDITOR TEXTAREA --- */
textarea#input-body {
  font-size: 10px !important;
  line-height: 1.4 !important;
}

/* --- LIST ROWS --- */
.row, .folder-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--txt-secondary);
  transition: background 0.1s;
  position: relative;
}

.row:hover, .folder-row:hover {
  background-color: var(--bg-hover);
  color: var(--txt-primary);
}

.row.selected, .folder-row.selected {
  background-color: var(--accent-dim);
  color: var(--txt-primary);
}

.folder-left {
  display: flex; align-items: center; gap: 8px; flex: 1; font-weight: 600; color: var(--txt-primary);
}
.prompt-left {
  display: flex; align-items: center; flex: 1; min-width: 0;
}

.folder-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.folder-row.expanded .chevron { transform: rotate(90deg); }

.shortcut-badge {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--txt-secondary);
  margin-left: 8px;
}

/* --- EDIT BUTTONS (On Hover) --- */
.row-actions {
  display: none;
  margin-left: auto;
  gap: 8px;
}
.row:hover .row-actions, .folder-row:hover .row-actions {
  display: flex;
}
.action-btn {
  padding: 4px;
  border-radius: 4px;
  color: var(--txt-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
}
.action-btn:hover { background: var(--bg-active); color: var(--txt-primary); }

/* --- SETTINGS TOGGLES --- */
.toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 12px;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: rgba(255,255,255,0.1);
  border-radius: 99px;
  transition: background-color 0.2s;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.toggle-checkbox:checked + .toggle-switch {
  background-color: var(--accent);
}

.toggle-checkbox:checked + .toggle-switch .toggle-slider {
  transform: translateX(18px);
}

/* --- BUTTONS --- */
.footer-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.footer-btn:hover { background: var(--bg-hover); color: var(--txt-primary); }
.footer-btn.primary { color: var(--txt-primary); font-weight: 600; }

/* --- STANDARD BUTTONS --- */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--txt-primary);
}

/* --- MODALS & OVERLAYS --- */
.overlay-area {
  position: absolute; 
  inset: 0;
  background: var(--bg-panel);
  z-index: 50;
  display: none;
  flex-direction: column;
  /* FIX: Disable scrolling on the container itself to prevent "wiggle" */
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.overlay-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.overlay-area.open { display: flex; }

/* --- TABS (Editor) --- */
.tab-container {
  display: flex;
  background: var(--bg-input);
  padding: 2px;
  border-radius: 99px;
  width: fit-content;
}

.tab-btn {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  color: var(--txt-muted);
  text-transform: uppercase;
  cursor: pointer;
  background: transparent;
  border: none;
}

.tab-btn.active {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* --- SEGMENTED CONTROL (Settings) --- */
.segmented-control {
  display: flex;
  background: var(--bg-input);
  padding: 2px;
  border-radius: var(--radius-sm);
  gap: 2px;
}

.segment-btn {
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  justify-content: center;
  color: var(--txt-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
}

.segment-btn.active {
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 600;
}

/* Row Layout for Settings */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-row label {
  font-weight: 500;
}

/* --- TAG DROPDOWN --- */
#tags-dropdown {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 220px;
  background: var(--bg-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 100;
  display: none;
  flex-direction: column;
  overflow: hidden;
}
#tags-dropdown.open { display: flex; }

.tags-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-app);
}

#tags-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.tag-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  cursor: pointer;
  transition: background 0.1s;
}
.tag-row:hover { background: var(--bg-hover); }

.tag-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-tick {
  color: var(--accent);
  font-weight: bold;
  font-size: 14px;
}

.delete-icon-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--txt-muted);
  border-radius: 4px;
  cursor: pointer;
}
.delete-icon-btn:hover {
  background: var(--bg-active);
  color: var(--danger);
}
.delete-icon-btn svg { width: 14px; height: 14px; fill: currentColor; }

/* New Tag Form */
.new-tag-form {
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-input);
}

.new-tag-form-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.new-tag-form-row input[type="text"] {
  flex: 1;
  background: var(--bg-panel);
  border: 1px solid var(--border-default);
  color: var(--txt-primary);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.new-tag-form-row input[type="color"] {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.new-tag-form-buttons {
  display: flex;
  justify-content: flex-end;
}

/* --- UTILS --- */
.toast {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-app);
    border: 1px solid var(--border-subtle);
    color: var(--txt-primary);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
}
.toast.show { opacity: 1; }
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

    <div class="hotzone" id="hotzone" title="Open">\u{1F4AC}</div>

    <div class="panel" id="panel">
      
      <!-- 1. HEADER (Search) -->
      <div class="header" id="header">
        <!-- SearchBar will inject the input here -->
        <div id="search-container" style="width: 100%;"></div>
      </div>

      <!-- 2. LIST -->
      <div class="list" id="list">
        <!-- Prompts render here -->
      </div>

      <!-- 3. FOOTER -->
      <div class="footer" id="footer">
         <!-- Left Side -->
         <div>
            <button id="settings-btn" class="footer-btn">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
               <span style="margin-left:6px">Settings</span>
            </button>
         </div>

         <!-- Right Side -->
         <div>
            <button id="new-btn" class="footer-btn primary">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               <span style="margin-left:6px">New</span>
            </button>
         </div>
      </div>

      <!-- 4. OVERLAYS -->
      <div id="add-area" class="overlay-area"></div>
      <div id="settings-area" class="overlay-area"></div>

      <!-- 5. UTILS -->
      <div class="toast" id="toast"></div>
      
      <!-- REMOVED: Tags Dropdown HTML -->
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
  var DEFAULT_FOLDERS = [
    { name: "Organize prompts in folders" }
  ];
  var DEFAULT_PROMPTS = [
    {
      title: 'Type "expand" in your text bar',
      quick: "expand",
      text: "1. Paste any prompt just by its shortcut\n2. To give access to any site, just press Alt + P there\n3. Organize prompts in folders",
      folderName: "Organize prompts in folders"
    }
  ];

  // src/content/store.ts
  var PROMPTS_KEY = "promptManager.prompts";
  var FOLDERS_KEY = "promptManager.folders";
  var SETTINGS_KEY = "promptManager.settings";
  var TAGS_KEY = "promptManager.tags";
  var DEFAULT_SETTINGS = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24,
    autoCloseOnHover: true
  };
  function uid() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  var Store = class {
    constructor() {
      // State
      this.prompts = [];
      this.tags = [];
      this.folders = [];
      // NEW: Initialize empty folder array
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
        if (changes[FOLDERS_KEY]) {
          this.folders = changes[FOLDERS_KEY].newValue || [];
          this.notify("folders_updated");
        }
      });
    }
    async load() {
      try {
        const p = await getStorage(PROMPTS_KEY);
        this.prompts = Array.isArray(p) ? p : [];
        let needsSave = false;
        this.prompts.forEach((prompt) => {
          if (prompt.parentId === void 0) {
            prompt.parentId = null;
            needsSave = true;
          }
        });
        if (needsSave) {
          await this.savePrompts();
        }
        const f = await getStorage(FOLDERS_KEY);
        this.folders = Array.isArray(f) ? f : [];
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
        this.notify("folders_updated");
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
      this.prompts.forEach((p) => p.parentId = null);
      await Promise.all([
        this.savePrompts(),
        this.saveTags(),
        this.saveSettings(),
        this.saveFolders()
        // NEW: Save empty folder list
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
    // --- Folder Persistence ---
    async saveFolders() {
      try {
        await setStorage({ [FOLDERS_KEY]: this.folders });
        this.notify("folders_updated");
      } catch (e) {
        console.warn("Store: Failed saving folders", e);
      }
    }
    // --- Validation Helpers ---
    /**
     * Identifies what type of item causes a uniqueness conflict
     */
    getConflictType(value, excludeId) {
      const normalized = value.trim().toLowerCase();
      if (!normalized)
        return null;
      if (this.prompts.some((p) => p.id !== excludeId && p.title.trim().toLowerCase() === normalized)) {
        return "prompt";
      }
      if (this.folders.some((f) => f.id !== excludeId && f.name.trim().toLowerCase() === normalized)) {
        return "folder";
      }
      if (this.prompts.some((p) => p.id !== excludeId && p.quick && p.quick.trim().toLowerCase() === normalized)) {
        return "shortcut";
      }
      return null;
    }
    throwConflictError(type) {
      if (type === "prompt")
        throw new Error("A prompt with this name already exists");
      if (type === "folder")
        throw new Error("A folder with this name already exists");
      if (type === "shortcut")
        throw new Error("A shortcut with this name already exists");
    }
    // --- Folder Operations ---
    async addFolder(name, parentId = null) {
      const conflict = this.getConflictType(name);
      if (conflict)
        this.throwConflictError(conflict);
      const newFolder = {
        id: uid(),
        // Uses existing uid() helper
        name,
        parentId,
        order: this.folders.length,
        isExpanded: true
      };
      this.folders.push(newFolder);
      await this.saveFolders();
    }
    async updateFolder(id, updates) {
      const idx = this.folders.findIndex((f) => f.id === id);
      if (idx === -1)
        return;
      if (updates.name !== void 0) {
        const conflict = this.getConflictType(updates.name, id);
        if (conflict)
          this.throwConflictError(conflict);
      }
      this.folders[idx] = { ...this.folders[idx], ...updates };
      await this.saveFolders();
    }
    /**
     * Deletes a folder.
     * LOGIC: Prompts and Subfolders inside it are NOT deleted.
     * They are moved to the parent of the deleted folder.
     */
    async deleteFolder(folderId) {
      const folderToDelete = this.folders.find((f) => f.id === folderId);
      if (!folderToDelete)
        return;
      const newParentId = folderToDelete.parentId;
      this.folders.forEach((f) => {
        if (f.parentId === folderId) {
          f.parentId = newParentId;
        }
      });
      this.prompts.forEach((p) => {
        if (p.parentId === folderId) {
          p.parentId = newParentId;
        }
      });
      this.folders = this.folders.filter((f) => f.id !== folderId);
      await Promise.all([this.saveFolders(), this.savePrompts()]);
    }
    // --- Prompt Management ---
    async addPrompt(title, text, quick, tagIds, parentId = null) {
      const nameConflict = this.getConflictType(title);
      if (nameConflict)
        this.throwConflictError(nameConflict);
      if (quick) {
        const shortcutConflict = this.getConflictType(quick);
        if (shortcutConflict)
          this.throwConflictError(shortcutConflict);
      }
      if (quick && title.trim().toLowerCase() === quick.trim().toLowerCase()) {
        throw new Error("Prompt name and shortcut must be different");
      }
      const newPrompt = {
        id: uid(),
        title,
        text,
        quick,
        tags: tagIds,
        parentId
        // Set parent
      };
      this.prompts.push(newPrompt);
      await this.savePrompts();
    }
    async updatePrompt(id, updates) {
      const idx = this.prompts.findIndex((p) => p.id === id);
      if (idx === -1)
        return;
      if (updates.title !== void 0) {
        const conflict = this.getConflictType(updates.title, id);
        if (conflict)
          this.throwConflictError(conflict);
      }
      if (updates.quick !== void 0) {
        const conflict = this.getConflictType(updates.quick, id);
        if (conflict)
          this.throwConflictError(conflict);
      }
      const finalTitle = updates.title !== void 0 ? updates.title : this.prompts[idx].title;
      const finalQuick = updates.quick !== void 0 ? updates.quick : this.prompts[idx].quick;
      if (finalQuick && finalTitle.trim().toLowerCase() === finalQuick.trim().toLowerCase()) {
        throw new Error("Prompt name and shortcut must be different");
      }
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
    // --- UI Helper Methods ---
    toggleFolderExpansion(folderId) {
      const folder = this.folders.find((f) => f.id === folderId);
      if (folder) {
        folder.isExpanded = !folder.isExpanded;
        this.notify("folders_updated");
      }
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
      this.container = null;
      this.input = null;
    }
    mount(parent) {
      this.container = parent.querySelector("#search-container");
      if (!this.container)
        return;
      this.container.innerHTML = "";
      const wrapper = this.el("div", "search-wrapper");
      const icon = this.el("div", "search-icon");
      icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
      this.input = this.el("input", "search-input");
      this.input.type = "text";
      this.input.placeholder = "Type to search...";
      this.input.id = "search-input";
      this.input.setAttribute("autocomplete", "off");
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
        }
      });
      this.input.value = this.store.filterText;
      wrapper.appendChild(icon);
      wrapper.appendChild(this.input);
      this.container.appendChild(wrapper);
      this.store.subscribe("filter_updated", () => {
        if (this.input && this.input.value !== this.store.filterText) {
          this.input.value = this.store.filterText;
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
        input.setAttribute("autocomplete", "off");
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
      input.setAttribute("autocomplete", "off");
      setTimeout(() => input.focus(), 50);
      const colorInput = this.el("input");
      colorInput.type = "color";
      colorInput.value = "#FF6B6B";
      row.appendChild(input);
      row.appendChild(colorInput);
      form.appendChild(row);
      const btns = this.el("div", "new-tag-form-buttons");
      const addBtn = this.el("button", "btn-primary", "Add");
      addBtn.style.padding = "4px 12px";
      addBtn.style.fontSize = "12px";
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

  // src/content/utils/searchTree.ts
  function getVisibleIds(prompts, folders, filterText) {
    const visibleIds = /* @__PURE__ */ new Set();
    const query = filterText.toLowerCase().trim();
    if (!query)
      return visibleIds;
    const folderMap = /* @__PURE__ */ new Map();
    folders.forEach((f) => folderMap.set(f.id, f));
    const addWithAncestors = (parentId) => {
      let currentId = parentId;
      while (currentId) {
        if (visibleIds.has(currentId))
          break;
        visibleIds.add(currentId);
        const parent = folderMap.get(currentId);
        currentId = parent ? parent.parentId || null : null;
      }
    };
    prompts.forEach((p) => {
      if (p.title.toLowerCase().includes(query) || p.quick && p.quick.toLowerCase().includes(query) || p.text && p.text.toLowerCase().includes(query)) {
        visibleIds.add(p.id);
        addWithAncestors(p.parentId);
      }
    });
    return visibleIds;
  }

  // node_modules/sortablejs/modular/sortable.esm.js
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) {
        symbols = symbols.filter(function(sym) {
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
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function(obj2) {
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
    _extends = Object.assign || function(target) {
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
    return function() {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function() {
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
    Array.from(container.children).forEach(function(child) {
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
        children.forEach(function(child) {
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
        animationStates.forEach(function(state) {
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
            target.animationResetTimer = setTimeout(function() {
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
          animationCallbackId = setTimeout(function() {
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
          target.animated = setTimeout(function() {
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
      plugins.forEach(function(p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function() {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + "Global";
      plugins.forEach(function(plugin) {
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
      plugins.forEach(function(plugin) {
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
      plugins.forEach(function(plugin) {
        if (typeof plugin.eventProperties !== "function")
          return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function(plugin) {
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
  var supportCssPointerEvents = function() {
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
    sortables.some(function(sortable) {
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
      return function(to, from, dragEl2, evt) {
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
    document.addEventListener("click", function(evt) {
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
        filter = filter.split(",").some(function(criteria) {
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
        options.ignore.split(",").forEach(function(criteria) {
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
          _nextTick(function() {
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
      _this.cloneId = _nextTick(function() {
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
          _this.animateAll(function() {
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
      savedInputChecked.forEach(function(el) {
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
      this.toArray().forEach(function(id, i) {
        var el = rootEl2.children[i];
        if (closest(el, this.options.draggable, rootEl2, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function(id) {
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
      Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
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
    on(document, "touchmove", function(evt) {
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
  Sortable.get = function(element) {
    return element[expando];
  };
  Sortable.mount = function() {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array)
      plugins2 = plugins2[0];
    plugins2.forEach(function(plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils)
        Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  Sortable.create = function(el, options) {
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
            pointerElemChangedInterval = setInterval(function() {
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
    autoScrolls.forEach(function(autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
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
          autoScrolls[layersOut].pid = setInterval(function() {
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
      this.store.subscribe("folders_updated", () => this.render());
      this.initSortable();
      this.render();
    }
    render() {
      if (!this.list)
        return;
      const scrollTop = this.list.scrollTop;
      const filterText = this.store.filterText.trim();
      const isFiltering = filterText !== "";
      this.list.innerHTML = "";
      let visibleSet = null;
      if (isFiltering) {
        visibleSet = getVisibleIds(this.store.prompts, this.store.folders, filterText);
        if (visibleSet.size === 0) {
          const e = this.el("div", "empty", "No matches found.");
          this.list.appendChild(e);
          return;
        }
      }
      this.renderTree(null, 0, visibleSet);
      this.list.scrollTop = scrollTop;
    }
    // 2. Add the Recursive Tree Renderer
    renderTree(parentId, depth, visibleSet) {
      const folders = this.store.folders.filter((f) => f.parentId == parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
      const prompts = this.store.prompts.filter((p) => p.parentId == parentId);
      folders.forEach((folder) => {
        if (visibleSet && !visibleSet.has(folder.id))
          return;
        const isExpanded = visibleSet ? true : folder.isExpanded;
        const row = this.createFolderRow(folder, depth, isExpanded);
        this.list.appendChild(row);
        if (isExpanded) {
          this.renderTree(folder.id, depth + 1, visibleSet);
        }
      });
      prompts.forEach((p) => {
        if (visibleSet && !visibleSet.has(p.id))
          return;
        const row = this.createPromptRow(p);
        this.applyIndentation(row, depth);
        this.list.appendChild(row);
      });
      if (depth === 0 && !visibleSet && folders.length === 0 && prompts.length === 0) {
        const e = this.el("div", "empty", "No prompts yet.");
        this.list.appendChild(e);
      }
    }
    // 3. Helper to apply indentation
    applyIndentation(element, depth) {
      if (depth > 0) {
        element.style.paddingLeft = `${10 + depth * 24}px`;
      }
    }
    // 2. Update createFolderRow
    createFolderRow(folder, depth, isExpanded = false) {
      const row = this.el("div", "folder-row");
      row.dataset.folderId = folder.id;
      if (depth > 0)
        row.style.paddingLeft = `${16 + depth * 16}px`;
      if (isExpanded)
        row.classList.add("expanded");
      const left = this.el("div", "folder-left");
      const chevron = this.el("div", "folder-icon chevron");
      chevron.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      const name = this.el("span", "", folder.name);
      left.appendChild(chevron);
      left.appendChild(name);
      row.appendChild(left);
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.store.filterText.trim() === "") {
          this.store.toggleFolderExpansion(folder.id);
        }
      });
      const actions = this.el("div", "row-actions");
      const addBtn = this.el("button", "action-btn");
      addBtn.title = "Add Sub-item";
      addBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.shadow.dispatchEvent(new CustomEvent("add-to-folder", { detail: { folderId: folder.id } }));
      });
      const editBtn = this.el("button", "action-btn");
      editBtn.title = "Edit Folder";
      editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.shadow.dispatchEvent(new CustomEvent("edit-folder", { detail: { folderId: folder.id } }));
      });
      actions.appendChild(addBtn);
      actions.appendChild(editBtn);
      row.appendChild(actions);
      return row;
    }
    // src/content/components/PromptList.ts
    // 3. Helper for Flat View (Search) - REMOVED
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
    createPromptRow(p, showContext = false) {
      const row = this.el("div", "row");
      row.dataset.id = p.id;
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        this.shadow.dispatchEvent(new CustomEvent("edit-prompt", { detail: { promptId: p.id } }));
      });
      const left = this.el("div", "prompt-left");
      const label = this.el("div", "prompt-title", p.title);
      left.appendChild(label);
      if (showContext && p.parentId) {
        const folder = this.store.folders.find((f) => f.id === p.parentId);
        if (folder) {
          const fBadge = this.el("span", "prompt-folder-badge");
          fBadge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> ${folder.name}`;
          left.appendChild(fBadge);
        }
      }
      row.appendChild(left);
      if (p.quick) {
        const badge = this.el("div", "shortcut-badge", p.quick);
        row.appendChild(badge);
      }
      const actions = this.el("div", "row-actions");
      const copyBtn = this.el("button", "action-btn");
      copyBtn.title = "Copy Prompt";
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copyBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(p.text);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copied" } }));
        } catch {
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copy failed" } }));
        }
      });
      actions.appendChild(copyBtn);
      row.appendChild(actions);
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
      this.currentTab = "prompt";
      this.editingId = null;
      this.editingFolderId = null;
      this.draftTagIds = [];
      this.onTagsChanged = null;
      // State buffer to preserve inputs when switching tabs
      this.formData = {
        title: "",
        quick: "",
        text: "",
        folderId: ""
      };
    }
    mount(parent) {
      this.area = parent.querySelector("#add-area");
      if (!this.area)
        return;
      this.renderForm();
      this.setupFormListeners();
    }
    renderForm() {
      if (!this.area)
        return;
      this.area.innerHTML = `
            <div style="
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 16px; 
                height: 100%; 
                width: 100%; 
                box-sizing: border-box; 
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                    <div style="display:flex; align-items:center; gap: 12px;">
                        <span id="editor-title-label" style="font-weight:700; font-size:11px; color:var(--txt-secondary); text-transform:uppercase; letter-spacing: 0.05em;">Create New</span>
                        <div class="tab-container">
                            <button id="tab-prompt" class="tab-btn active">Prompt</button>
                            <button id="tab-folder" class="tab-btn">Folder</button>
                        </div>
                    </div>
                    <select id="input-folder" style="background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:4px 8px; border-radius:6px; font-size:12px; max-width: 120px;"></select>
                </div>

                <!-- Content (Scrollable) -->
                <div id="form-content" style="
                    flex: 1; 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                    padding-bottom: 10px;
                    scrollbar-width: none;
                ">
                    <!-- Dynamic form fields injected here -->
                </div>

                <div style="
                    display:flex; 
                    gap:12px; 
                    align-items: center;
                    justify-content: flex-end;
                    margin-top:auto; 
                    padding-top: 16px; 
                    flex-shrink: 0;
                    border-top: 1px solid var(--border-subtle);
                ">
                    <button id="delete-btn" class="btn-ghost" style="color:var(--danger); display:none; margin-right: auto; padding: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                    </button>
                    <button id="cancel-btn" class="btn-ghost">Cancel</button>
                    <button id="save-btn" class="btn-primary">Save Changes</button>
                </div>
            </div>
        `;
    }
    setupFormListeners() {
      const pTab = this.area?.querySelector("#tab-prompt");
      const fTab = this.area?.querySelector("#tab-folder");
      pTab?.addEventListener("click", () => this.switchTab("prompt"));
      fTab?.addEventListener("click", () => this.switchTab("folder"));
      this.area?.querySelector("#save-btn")?.addEventListener("click", () => this.save());
      this.area?.querySelector("#cancel-btn")?.addEventListener("click", () => this.close());
      this.area?.querySelector("#delete-btn")?.addEventListener("click", () => this.handleDelete());
    }
    switchTab(tab, saveState = true) {
      if (saveState) {
        this.saveCurrentState();
      }
      this.currentTab = tab;
      this.area?.querySelector("#tab-prompt")?.classList.toggle("active", tab === "prompt");
      this.area?.querySelector("#tab-folder")?.classList.toggle("active", tab === "folder");
      this.renderFields();
      this.restoreState();
    }
    saveCurrentState() {
      if (!this.area)
        return;
      const titleInput = this.area.querySelector("#input-title");
      const quickInput = this.area.querySelector("#input-quick");
      const bodyInput = this.area.querySelector("#input-body");
      const folderInput = this.area.querySelector("#input-folder");
      if (titleInput)
        this.formData.title = titleInput.value;
      if (quickInput)
        this.formData.quick = quickInput.value;
      if (bodyInput)
        this.formData.text = bodyInput.value;
      if (folderInput)
        this.formData.folderId = folderInput.value || null;
    }
    restoreState() {
      if (!this.area)
        return;
      const titleInput = this.area.querySelector("#input-title");
      const quickInput = this.area.querySelector("#input-quick");
      const bodyInput = this.area.querySelector("#input-body");
      const folderInput = this.area.querySelector("#input-folder");
      if (titleInput)
        titleInput.value = this.formData.title;
      if (quickInput)
        quickInput.value = this.formData.quick;
      if (bodyInput)
        bodyInput.value = this.formData.text;
      if (folderInput) {
        folderInput.value = this.formData.folderId || "";
      }
    }
    renderFields() {
      const container = this.area?.querySelector("#form-content");
      if (!container)
        return;
      if (this.currentTab === "prompt") {
        container.innerHTML = `
                <div style="display: flex; gap: 16px; align-items: flex-end; margin-bottom: 16px;">
                    <div style="flex: 7; min-width: 0;">
                        <input id="input-title" class="search-input" type="text" placeholder="Prompt Title" autocomplete="off" style="width: 100%; font-size:18px; font-weight:700; background:transparent !important; border:none !important; padding: 0 !important; height: auto; outline: none;">
                    </div>
                    <div style="flex: 3; min-width: 0;">
                        <input id="input-quick" type="text" placeholder="Shortcut (.code)" autocomplete="off" style="width:100%; background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:8px; border-radius:6px; font-size: 13px;">
                    </div>
                </div>
                <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Content</label>
                <textarea id="input-body" placeholder="Type your prompt here..." autocomplete="off" style="width:100%; min-height:200px; background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:12px; border-radius:6px; resize:vertical; white-space: pre-wrap; font-family: inherit;"></textarea>
            `;
        const quickInput = container.querySelector("#input-quick");
        if (quickInput) {
          quickInput.addEventListener("keydown", (e) => {
            if (e.key === " " || e.code === "Space") {
              e.preventDefault();
            }
          });
          quickInput.addEventListener("input", () => {
            if (quickInput.value.includes(" ")) {
              quickInput.value = quickInput.value.replace(/\s/g, "");
            }
          });
        }
      } else {
        container.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <input id="input-title" class="search-input" type="text" placeholder="Folder Title (e.g. Work Prompts)" autocomplete="off" style="width: 100%; font-size:18px; font-weight:700; background:transparent !important; border:none !important; padding: 0 !important; height: auto; outline: none;">
                </div>
            `;
      }
      const select = this.area?.querySelector("#input-folder");
      this.renderFolderOptions(select?.value || null);
    }
    renderFolderOptions(selectedId) {
      const select = this.area?.querySelector("#input-folder");
      if (!select)
        return;
      select.innerHTML = "";
      const rootOpt = document.createElement("option");
      rootOpt.value = "";
      rootOpt.textContent = "\u{1F4C1} (Root)";
      select.appendChild(rootOpt);
      const excludedIds = /* @__PURE__ */ new Set();
      if (this.editingFolderId) {
        excludedIds.add(this.editingFolderId);
        const addDescendants = (id) => {
          this.store.folders.filter((f) => f.parentId === id).forEach((f) => {
            excludedIds.add(f.id);
            addDescendants(f.id);
          });
        };
        addDescendants(this.editingFolderId);
      }
      const renderLevel = (parentId, depth) => {
        const children = this.store.folders.filter((f) => f.parentId == parentId).filter((f) => !excludedIds.has(f.id)).sort((a, b) => (a.order || 0) - (b.order || 0));
        children.forEach((folder) => {
          const opt = document.createElement("option");
          opt.value = folder.id;
          const prefix = depth > 0 ? "\xA0\xA0".repeat(depth) : "";
          opt.textContent = `${prefix}\u{1F4C1} ${folder.name}`;
          select.appendChild(opt);
          renderLevel(folder.id, depth + 1);
        });
      };
      renderLevel(null, 0);
      select.value = selectedId || "";
    }
    open(promptId, folderId, parentId, prefillText) {
      if (!this.area)
        return;
      this.area.classList.add("open");
      this.area.setAttribute("aria-hidden", "false");
      this.shadow.getElementById("panel")?.classList.add("mode-add");
      const isEditing = !!promptId || !!folderId;
      const tabContainer = this.area.querySelector(".tab-container");
      const titleLabel = this.area.querySelector("#editor-title-label");
      const deleteBtn = this.area.querySelector("#delete-btn");
      if (tabContainer)
        tabContainer.style.display = isEditing ? "none" : "";
      if (titleLabel)
        titleLabel.style.display = isEditing ? "none" : "";
      if (deleteBtn)
        deleteBtn.style.display = isEditing ? "block" : "none";
      if (promptId) {
        this.editingId = promptId;
        this.editingFolderId = null;
        const p = this.store.prompts.find((x) => x.id === promptId);
        if (p) {
          this.formData = {
            title: p.title,
            quick: p.quick || "",
            text: p.text,
            folderId: p.parentId || null
          };
          this.draftTagIds = [...p.tags || []];
        }
        this.switchTab("prompt", false);
      } else if (folderId) {
        this.editingId = null;
        this.editingFolderId = folderId;
        const f = this.store.folders.find((x) => x.id === folderId);
        if (f) {
          this.formData = {
            title: f.name,
            quick: "",
            text: "",
            folderId: f.parentId || null
          };
        }
        this.switchTab("folder", false);
      } else {
        this.editingId = null;
        this.editingFolderId = null;
        this.draftTagIds = [];
        this.formData = {
          title: "",
          quick: "",
          text: prefillText || "",
          // Use prefillText if provided
          folderId: parentId || null
        };
        this.switchTab("prompt", false);
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
      this.shadow.dispatchEvent(new CustomEvent("editor-closed"));
    }
    toggleTag(tagId) {
      if (this.draftTagIds.includes(tagId)) {
        this.draftTagIds = this.draftTagIds.filter((id) => id !== tagId);
      } else {
        this.draftTagIds.push(tagId);
      }
      if (this.onTagsChanged)
        this.onTagsChanged();
    }
    isOpen() {
      return this.area ? this.area.classList.contains("open") : false;
    }
    async handleDelete() {
      if (this.currentTab === "prompt" && this.editingId) {
        if (confirm("Are you sure you want to delete this prompt?")) {
          await this.store.deletePrompt(this.editingId);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Prompt deleted" } }));
          this.close();
        }
      } else if (this.currentTab === "folder" && this.editingFolderId) {
        if (confirm("Are you sure you want to delete this folder? (Items inside will be moved to parent)")) {
          await this.store.deleteFolder(this.editingFolderId);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Folder deleted" } }));
          this.close();
        }
      }
    }
    async save() {
      const titleInput = this.area?.querySelector("#input-title");
      const folderInput = this.area?.querySelector("#input-folder");
      const title = titleInput?.value.trim();
      const folderId = folderInput?.value || null;
      if (!title) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Title is required" } }));
        return;
      }
      try {
        if (this.currentTab === "prompt") {
          const bodyInput = this.area?.querySelector("#input-body");
          const quickInput = this.area?.querySelector("#input-quick");
          const text = bodyInput?.value;
          const quick = quickInput?.value.trim() || "";
          if (!text) {
            this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Content is required" } }));
            return;
          }
          if (this.editingId) {
            await this.store.updatePrompt(this.editingId, { title, text, quick, tags: this.draftTagIds, parentId: folderId });
          } else {
            await this.store.addPrompt(title, text, quick, this.draftTagIds, folderId);
          }
        } else {
          if (this.editingFolderId) {
            await this.store.updateFolder(this.editingFolderId, { name: title, parentId: folderId });
          } else {
            await this.store.addFolder(title, folderId);
          }
        }
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Saved" } }));
        this.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save";
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message } }));
      }
    }
  };

  // src/content/components/SettingsModal.ts
  var SettingsModal = class extends Component {
    constructor() {
      super(...arguments);
      this.area = null;
    }
    mount(parent) {
      this.area = parent.querySelector("#settings-area");
      if (!this.area)
        return;
      this.renderUI();
      this.setupListeners();
      this.store.subscribe("settings_updated", () => this.loadSettings());
    }
    renderUI() {
      if (!this.area)
        return;
      const isDark = this.store.settings.theme === "dark";
      const isAutoClose = this.store.settings.autoCloseOnHover;
      this.area.innerHTML = `
            <div style="
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 16px; 
                height: 100%; 
                box-sizing: border-box; 
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="flex-shrink: 0;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Settings</h2>
                </div>
                
                <!-- Content (Scrollable) -->
                <div style="
                    flex: 1; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    scrollbar-width: none;
                ">
                    <!-- Font Size (Segmented) -->
                    <div class="settings-row">
                        <label>Font Size</label>
                        <div class="segmented-control" id="ctrl-font-size">
                            <button class="segment-btn" data-size="10" style="font-size: 12px;">A</button>
                            <button class="segment-btn" data-size="12" style="font-size: 18px;">A</button>
                            <button class="segment-btn active" data-size="14" style="font-size: 24px;">A</button>
                        </div>
                    </div>

                    <!-- Hotspot (Segmented) -->
                    <div class="settings-row">
                        <label>Hotspot Position</label>
                        <div class="segmented-control" id="ctrl-hotspot-pos">
                            <button class="segment-btn" data-pos="corner" title="Corner">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>
                            </button>
                            <button class="segment-btn active" data-pos="edge" title="Edge">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="18" y="4" width="4" height="16" rx="1"/><path d="M14 12H2m12 0-4-4m4 4-4 4"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- TOGGLE: Dark Theme -->
                    <div class="settings-row">
                        <label>Dark theme</label>
                        <label class="toggle-label">
                            <input type="checkbox" class="toggle-checkbox" id="s-theme" ${isDark ? "checked" : ""}>
                            <div class="toggle-switch">
                                <div class="toggle-slider"></div>
                            </div>
                        </label>
                    </div>

                    <!-- TOGGLE: Auto Close -->
                    <div class="settings-row" style="border-bottom: none;">
                        <label>Auto-close</label>
                        <label class="toggle-label">
                            <input type="checkbox" class="toggle-checkbox" id="s-auto-close" ${isAutoClose ? "checked" : ""}>
                            <div class="toggle-switch">
                                <div class="toggle-slider"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Footer -->
                <div style="
                    display: flex; 
                    gap: 12px; 
                    align-items: center;
                    justify-content: flex-end;
                    padding-top: 16px; 
                    flex-shrink: 0;
                    border-top: 1px solid var(--border-subtle);
                ">
                    <button id="s-cancel" class="btn-ghost">Cancel</button>
                    <button id="s-save" class="btn-primary">Save</button>
                </div>
            </div>
        `;
      this.setupListeners();
    }
    setupListeners() {
      this.setupSegmentedControl("ctrl-font-size");
      this.setupSegmentedControl("ctrl-hotspot-pos");
      this.area?.querySelector("#s-save")?.addEventListener("click", () => this.save());
      this.area?.querySelector("#s-cancel")?.addEventListener("click", () => this.close());
    }
    setupSegmentedControl(id) {
      const container = this.area?.querySelector(`#${id}`);
      if (!container)
        return;
      const buttons = container.querySelectorAll(".segment-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }
    loadSettings() {
      const s = this.store.settings;
      this.setSegmentActive("ctrl-font-size", "data-size", String(s.fontSizePx || 14));
      this.setSegmentActive("ctrl-hotspot-pos", "data-pos", s.hotspotPosition || "edge");
      const autoClose = this.area?.querySelector("#s-auto-close");
      if (autoClose)
        autoClose.checked = s.autoCloseOnHover;
      const theme = this.area?.querySelector("#s-theme");
      if (theme)
        theme.checked = s.theme === "dark";
    }
    setSegmentActive(containerId, dataAttr, value) {
      const container = this.area?.querySelector(`#${containerId}`);
      if (!container)
        return;
      const buttons = container.querySelectorAll(".segment-btn");
      buttons.forEach((btn) => {
        if (btn.getAttribute(dataAttr) === value) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
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
    isOpen() {
      return this.area ? this.area.classList.contains("open") : false;
    }
    async save() {
      const updates = {};
      const fontSizeBtn = this.area?.querySelector("#ctrl-font-size .segment-btn.active");
      if (fontSizeBtn) {
        const val = parseInt(fontSizeBtn.getAttribute("data-size") || "14");
        updates.fontSizePx = val;
      }
      const posBtn = this.area?.querySelector("#ctrl-hotspot-pos .segment-btn.active");
      if (posBtn) {
        updates.hotspotPosition = posBtn.getAttribute("data-pos");
      }
      const autoClose = this.area?.querySelector("#s-auto-close");
      if (autoClose)
        updates.autoCloseOnHover = autoClose.checked;
      const theme = this.area?.querySelector("#s-theme");
      if (theme)
        updates.theme = theme.checked ? "dark" : "light";
      await this.store.updateSettings(updates);
      this.shadow.dispatchEvent(new CustomEvent("apply-settings"));
      this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Settings saved" } }));
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
      console.log("App: Mounting...");
      this.panel = this.shadow.getElementById("panel");
      this.hotzone = this.shadow.getElementById("hotzone");
      this.toastEl = this.shadow.getElementById("toast");
      if (!this.panel || !this.hotzone) {
        console.error("App: Panel or Hotzone not found in Shadow DOM");
        return;
      }
      try {
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
        console.log("App: Mounted successfully, listeners attached.");
      } catch (error) {
        console.error("App: Error mounting components", error);
      }
    }
    // --- Public Toggle Method for Alt+P ---
    toggle() {
      if (this.panel?.classList.contains("open")) {
        this.closePanel();
      } else {
        this.openPanel(true);
      }
    }
    // --- Public method to open with prefilled text ---
    openWithText(text) {
      if (!this.panel?.classList.contains("open")) {
        this.openPanel(true);
      }
      this.promptEditor.open(void 0, void 0, void 0, text);
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
      this.shadow.addEventListener("edit-folder", (e) => {
        this.openEditor(void 0, e.detail.folderId);
      });
      this.shadow.addEventListener("add-to-folder", (e) => {
        this.openEditor(void 0, void 0, e.detail.folderId);
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
      const settingsBtn = this.shadow.getElementById("settings-btn");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", () => this.settingsModal.open());
      }
      const newBtn = this.shadow.getElementById("new-btn");
      if (newBtn) {
        newBtn.addEventListener("click", () => this.openEditor());
      }
      const copyBtn = this.shadow.getElementById("copy-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("nav-copy"));
        });
      }
    }
    // --- HELPER METHOD ---
    openEditor(promptId, folderId, parentId) {
      this.promptEditor.open(promptId, folderId, parentId);
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
      this.hotzone.addEventListener("mouseenter", () => this.openPanel(false));
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
      if (!this.store.settings.autoCloseOnHover) {
        this.clearAutoCloseTimer();
        return;
      }
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
    openPanel(shouldFocus = false) {
      if (this.panel) {
        this.panel.classList.add("open");
        if (shouldFocus) {
          setTimeout(() => {
            const search = this.shadow.getElementById("search-input");
            if (search)
              search.focus();
          }, 50);
        }
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
    const { host, shadow, prompts, tags, folders, settings } = opts;
    if (!host || !shadow)
      return;
    const store = new Store();
    window.debugStore = store;
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders || [];
    store.settings = settings;
    const app = new App(store, shadow, host);
    app.mount(shadow);
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === "TOGGLE_POPUP") {
        app.toggle();
        sendResponse({ ok: true });
      }
      if (msg.type === "OPEN_WITH_TEXT") {
        app.openWithText(msg.text || "");
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
        const shortcut = word;
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
            const lines = replacement.split(/\r?\n/);
            const fragment = document.createDocumentFragment();
            let lastNode = null;
            lines.forEach((line, index2) => {
              if (index2 > 0) {
                const br = document.createElement("br");
                fragment.appendChild(br);
                lastNode = br;
              }
              if (line) {
                const textNode = document.createTextNode(line);
                fragment.appendChild(textNode);
                lastNode = textNode;
              }
            });
            if (lastNode) {
              range.insertNode(fragment);
              range.setStartAfter(lastNode);
              range.setEndAfter(lastNode);
            } else {
              range.collapse(true);
            }
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
  var FOLDERS_KEY2 = "promptManager.folders";
  var DEFAULT_SETTINGS2 = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24,
    autoCloseOnHover: false
  };
  function uid2() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  async function loadAndInit() {
    let prompts = [];
    let settings = DEFAULT_SETTINGS2;
    let tags = [];
    let folders = [];
    let isFirstInstall = false;
    try {
      const p = await getStorage(PROMPTS_KEY2);
      prompts = Array.isArray(p) ? p : [];
      let needsMigrationSave = false;
      prompts.forEach((prompt) => {
        if (prompt.parentId === void 0) {
          prompt.parentId = null;
          needsMigrationSave = true;
        }
      });
      if (needsMigrationSave) {
        await setStorage({ [PROMPTS_KEY2]: prompts });
        console.log("Legacy prompts migrated to include parentId: null");
      }
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
    try {
      const f = await getStorage(FOLDERS_KEY2);
      folders = Array.isArray(f) ? f : [];
    } catch (e) {
      folders = [];
    }
    if (prompts.length === 0 && tags.length === 0 && folders.length === 0) {
      isFirstInstall = true;
      tags = DEFAULT_TAGS.map((dt, index2) => ({
        id: uid2(),
        name: dt.name,
        color: dt.color,
        order: index2
      }));
      folders = DEFAULT_FOLDERS.map((df, index2) => ({
        id: uid2(),
        name: df.name,
        parentId: null,
        order: index2,
        isExpanded: true
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
        let parentId = null;
        if (dp.folderName) {
          const folder = folders.find((f) => f.name === dp.folderName);
          if (folder)
            parentId = folder.id;
        }
        return {
          id: uid2(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags,
          parentId
        };
      });
      try {
        await Promise.all([
          setStorage({ [PROMPTS_KEY2]: prompts }),
          setStorage({ [TAGS_KEY2]: tags }),
          setStorage({ [SETTINGS_KEY2]: settings }),
          setStorage({ [FOLDERS_KEY2]: folders })
        ]);
      } catch (e) {
        console.warn("Failed to save default prompts/tags/folders:", e);
      }
    }
    const { host, shadow } = createOrGetHost();
    if (!host || !shadow)
      return;
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.settings = settings;
    store.folders = folders;
    const expander = new TextExpander(store);
    expander.mount();
    await renderUI({
      host,
      shadow,
      prompts,
      tags,
      settings,
      folders,
      PROMPTS_KEY: PROMPTS_KEY2,
      SETTINGS_KEY: SETTINGS_KEY2,
      TAGS_KEY: TAGS_KEY2,
      FOLDERS_KEY: FOLDERS_KEY2
    });
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
