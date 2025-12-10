(() => {
  // src/content/host.ts
  function createOrGetHost() {
    if (window.__promptManagerInitialized) {
      return;
    }
    window.__promptManagerInitialized = true;
    const HOST_ID = "prompt-drawer-host-shadow";
    let host = document.getElementById(HOST_ID);
    if (host && host.shadowRoot)
      return { host, shadow: host.shadowRoot };
    if (host)
      host.remove();
    host = document.createElement("div");
    host.id = HOST_ID;
    Object.assign(host.style, { all: "initial" });
    document.documentElement.appendChild(host);
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
    <style>
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
        border-radius: var(--border-radius-tiny);
        writing-mode: vertical-rl;
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
      /* hide search when not on the prompt list page */
      .panel.mode-add .search,
      .panel.mode-settings .search {
        visibility: hidden !important;   /* keeps layout but hides visually */
        opacity: 0 !important;           /* ensure it's invisible (defensive) */
        pointer-events: none !important; /* prevent mouse interaction */
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
      .add-area, .settings-area { display: none; flex-direction: column; gap: 8px; }
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

    </style>

    <!-- HOTSPOT (corner or edge) -->
    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">\u{1F4AC}</div>

    <!-- MAIN PANEL -->
    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">

      <!-- Header: search + small control buttons -->
      <div class="header">
        <div class="search"><input id="search-input" type="text" placeholder="Search (title, quick, body)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn" title="Add">\uFF0B</button>
          <button id="tags-btn" class="ctrl-btn" title="Tags">T</button>
          <button id="settings-btn" class="ctrl-btn" title="Settings">\u2699</button>
          <button id="close-btn" class="ctrl-btn" title="Close"></button>
        </div>

        <!-- Tags dropdown (absolute; won't shift header) -->
        <div class="tags-dropdown" id="tags-dropdown" aria-hidden="true">
          <div class="tags-top">
            <button id="tags-clear" class="ctrl-btn">Remove filter</button>
            <button id="tags-edit" class="ctrl-btn">Edit</button>
            <button id="tags-new" class="ctrl-btn">New</button>
          </div>
          <div class="tags-list" id="tags-list" role="list"></div>
        </div>
      </div>

      <!-- Prompt list (populated by ui.ts) -->
      <div class="list" id="list" role="list"></div>

      <!-- Add / Edit area -->
      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
        <textarea id="input-body" placeholder="Full prompt text" style="height: 177px;"></textarea>
        

        <div style="display:flex;gap:var(--gap);justify-content:flex-end;margin-top:var(--gap)">
          <button id="cancel-btn" class="ctrl-btn">Cancel</button>
          <button id="save-btn" class="ctrl-btn">Save</button>
        </div>
      </div>

      <!-- Settings area (reduced) -->
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

      <!-- Toast area -->
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

  // src/content/drag.ts
  function getRectsMap(shadow) {
    const map = /* @__PURE__ */ new Map();
    shadow.querySelectorAll(".row, .tag-row").forEach((el) => {
      const id = el.dataset.id;
      if (id)
        map.set(id, el.getBoundingClientRect());
    });
    return map;
  }
  function playFLIP(shadow, before) {
    const after = getRectsMap(shadow);
    after.forEach((newRect, id) => {
      const oldRect = before.get(id);
      const el = shadow.querySelector(`.row[data-id="${id}"], .tag-row[data-id="${id}"]`);
      if (!oldRect || !el)
        return;
      const dy = oldRect.top - newRect.top;
      if (dy === 0)
        return;
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      el.offsetHeight;
      requestAnimationFrame(() => {
        el.style.transition = "transform 180ms ease";
        el.style.transform = "";
        const clean = () => {
          el.style.transition = "";
          el.style.transform = "";
          el.removeEventListener("transitionend", clean);
        };
        el.addEventListener("transitionend", clean);
      });
    });
  }

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
          ev.target.setPointerCapture?.(ev.pointerId);
          startResize(ev.clientX, ev.clientY, (el.className || "").replace("resize-handle", "").trim());
        });
      });
      setTimeout(setPositions, 0);
    }
    function startResize(mouseX, mouseY, cls) {
      isResizing = true;
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

  // src/content/ui.ts
  async function renderUI(opts) {
    const { host, shadow, PROMPTS_KEY: PROMPTS_KEY2, SETTINGS_KEY: SETTINGS_KEY2, TAGS_KEY: TAGS_KEY2 } = opts;
    let prompts = opts.prompts || [];
    let tags = opts.tags || [];
    let settings = opts.settings;
    let selectedIndex = 0;
    let filteredPrompts = [];
    prompts = prompts.map((p) => ({ ...p, tags: p.tags ? Array.from(p.tags) : [] }));
    const hotzone = shadow.getElementById("hotzone");
    const panel = shadow.getElementById("panel");
    const list = shadow.getElementById("list");
    const addArea = shadow.getElementById("add-area");
    const addTagsContainer = shadow.getElementById("add-tags");
    const settingsArea = shadow.getElementById("settings-area");
    const inputTitle = shadow.getElementById("input-title");
    const inputQuick = shadow.getElementById("input-quick");
    const inputBody = shadow.getElementById("input-body");
    const addBtn = shadow.getElementById("add-btn");
    const saveBtn = shadow.getElementById("save-btn");
    const cancelBtn = shadow.getElementById("cancel-btn");
    const closeBtn = shadow.getElementById("close-btn");
    const settingsBtn = shadow.getElementById("settings-btn");
    const toastEl = shadow.getElementById("toast");
    const searchInput = shadow.getElementById("search-input");
    const tagsBtn = shadow.getElementById("tags-btn");
    const tagsDropdown = shadow.getElementById("tags-dropdown");
    const tagsClearBtn = shadow.getElementById("tags-clear");
    const tagsEditBtn = shadow.getElementById("tags-edit");
    const tagsNewBtn = shadow.getElementById("tags-new");
    const tagsList = shadow.getElementById("tags-list");
    tagsDropdown.addEventListener("mousedown", (ev) => {
      const path = ev.composedPath ? ev.composedPath() : [ev.target];
      if (colorPaletteEl && pathTouches(path, [colorPaletteEl])) {
        return;
      }
      if (colorPaletteEl) {
        closeColorPalette();
      }
      ev.stopPropagation();
    });
    const sFontSize = shadow.getElementById("s-font-size");
    const sTheme = shadow.getElementById("s-theme");
    const sHotpos = shadow.getElementById("s-hotspot-pos");
    const sSave = shadow.getElementById("s-save") || shadow.getElementById("s-save");
    const sCancel = shadow.getElementById("s-cancel");
    const sharedColorPicker = document.createElement("input");
    sharedColorPicker.type = "color";
    sharedColorPicker.style.position = "fixed";
    sharedColorPicker.style.left = "-9999px";
    sharedColorPicker.style.width = "1px";
    sharedColorPicker.style.height = "1px";
    sharedColorPicker.setAttribute("aria-hidden", "true");
    try {
      (document.body || document.documentElement).appendChild(sharedColorPicker);
    } catch (e) {
      try {
        shadow.appendChild(sharedColorPicker);
      } catch (err) {
      }
    }
    const inputElements = [inputTitle, inputQuick, inputBody, searchInput, sFontSize, sTheme, sHotpos];
    const stopBubbleHandler = (ev) => {
      if (!panel.classList.contains("open"))
        return;
      ev.stopPropagation();
    };
    panel.addEventListener("keydown", stopBubbleHandler, false);
    panel.addEventListener("keypress", stopBubbleHandler, false);
    panel.addEventListener("keyup", stopBubbleHandler, false);
    let isAddingOrEditing = false;
    let editingId = null;
    let draggedId = null;
    let placeholder = null;
    const CLOSE_TOLERANCE_PX = 10;
    function pathTouches(path, els) {
      if (!Array.isArray(path))
        return false;
      for (const node of path) {
        for (const el of els) {
          if (!el)
            continue;
          if (node === el)
            return true;
          try {
            if (el instanceof Node && node instanceof Node && el.contains(node))
              return true;
          } catch (e) {
          }
          if (node?.host && node.host === el)
            return true;
        }
      }
      return false;
    }
    let panelBackdrop = null;
    function createPanelBackdrop() {
      if (panelBackdrop)
        return panelBackdrop;
      const b = document.createElement("div");
      b.className = "panel-backdrop";
      Object.assign(b.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "9980",
        // intentionally lower than palette (palette uses 9999)
        background: "transparent",
        pointerEvents: "auto"
      });
      panelBackdrop = b;
      return b;
    }
    function attachPanelBackdrop() {
      const b = createPanelBackdrop();
      if (!document.body.contains(b))
        document.body.appendChild(b);
    }
    function removePanelBackdrop() {
      if (!panelBackdrop)
        return;
      try {
        panelBackdrop.remove();
      } catch (e) {
      }
      panelBackdrop = null;
    }
    let draftPromptTagIds = [];
    function uid2() {
      return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
    }
    function stripHTMLTags(input) {
      if (!input)
        return "";
      return input.replace(/<\/?[^>]+(>|$)/g, "");
    }
    function parseColorToRgb(input) {
      if (!input)
        return null;
      const s = (input || "").trim();
      if (s[0] === "#") {
        let hex = s.slice(1);
        if (hex.length === 3)
          hex = hex.split("").map((ch) => ch + ch).join("");
        if (hex.length !== 6)
          return null;
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b))
          return null;
        return { r, g, b };
      }
      const rgbMatch = s.match(/rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)/i);
      if (rgbMatch) {
        return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
      }
      try {
        const el = document.createElement("div");
        el.style.color = s;
        document.body.appendChild(el);
        const cs = getComputedStyle(el).color;
        el.remove();
        const m = cs.match(/rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)/i);
        if (m)
          return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
      } catch (e) {
      }
      return null;
    }
    function getContrastTextColor(bgColor) {
      const rgb = parseColorToRgb(bgColor);
      if (!rgb)
        return "#000";
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) + 0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) + 0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));
      return lum > 0.5 ? "#000" : "#fff";
    }
    function tintBackground(bgColor, alpha = 0.08) {
      const rgb = parseColorToRgb(bgColor);
      if (!rgb)
        return "";
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
    const COLOR_PALETTE = [
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
    let colorPaletteEl = null;
    let colorPaletteOpenForTagId = null;
    function createColorPaletteElement() {
      if (colorPaletteEl)
        return colorPaletteEl;
      const pal = document.createElement("div");
      pal.className = "tag-color-palette";
      pal.setAttribute("role", "dialog");
      pal.style.position = "absolute";
      pal.style.zIndex = "9999";
      pal.style.padding = "8px";
      pal.style.display = "grid";
      pal.style.gridTemplateColumns = "repeat(8, 20px)";
      pal.style.gridGap = "8px";
      pal.style.background = "var(--panel-bg, #111)";
      pal.style.border = "1px solid rgba(255,255,255,0.06)";
      pal.style.borderRadius = "6px";
      pal.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
      pal.style.maxWidth = "calc(100% - 16px)";
      pal.style.padding = "10px";
      for (const c of COLOR_PALETTE) {
        const sw = document.createElement("button");
        sw.type = "button";
        sw.className = "palette-swatch";
        sw.dataset.color = c;
        sw.style.width = "20px";
        sw.style.height = "20px";
        sw.style.borderRadius = "4px";
        sw.style.border = "1px solid rgba(0,0,0,0.18)";
        sw.style.background = c;
        sw.style.cursor = "pointer";
        sw.style.padding = "0";
        sw.title = c;
        sw.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          const color = ev.currentTarget.dataset.color;
          if (!color)
            return;
          if (colorPaletteOpenForTagId) {
            recolorTag(colorPaletteOpenForTagId, color).catch(() => {
            });
          }
          try {
            colorPaletteEl.focus?.();
          } catch (e) {
          }
        });
        sw.addEventListener("mousedown", (ev) => ev.stopPropagation());
        pal.appendChild(sw);
      }
      pal.addEventListener("mousedown", (ev) => ev.stopPropagation());
      pal.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          ev.stopPropagation();
          closeColorPalette();
        }
      });
      colorPaletteEl = pal;
      return pal;
    }
    function openColorPaletteFor(tagId, anchorEl) {
      const pal = createColorPaletteElement();
      colorPaletteOpenForTagId = tagId;
      if (!tagsDropdown)
        return;
      tagsDropdown.appendChild(pal);
      const anchorRect = anchorEl.getBoundingClientRect();
      const containerRect = tagsDropdown.getBoundingClientRect();
      const left = Math.max(8, anchorRect.right - containerRect.left - pal.offsetWidth);
      const top = Math.max(8, anchorRect.top - containerRect.top - pal.offsetHeight / 2 + anchorRect.height / 2);
      pal.style.left = `${left}px`;
      pal.style.top = `${top}px`;
      pal.tabIndex = -1;
      pal.focus?.();
    }
    function closeColorPalette() {
      if (!colorPaletteEl)
        return;
      try {
        if (colorPaletteEl.parentElement)
          colorPaletteEl.parentElement.removeChild(colorPaletteEl);
      } catch {
      }
      colorPaletteOpenForTagId = null;
    }
    let autoCloseTimer = null;
    const AUTO_CLOSE_BUFFER = 20;
    const AUTO_CLOSE_DELAY = 300;
    function handleAutoClose(ev) {
      if (!panel.classList.contains("open")) {
        return;
      }
      const rect = panel.getBoundingClientRect();
      const isInBufferedZone = ev.clientX >= rect.left - AUTO_CLOSE_BUFFER && ev.clientX <= rect.right + AUTO_CLOSE_BUFFER && ev.clientY >= rect.top - AUTO_CLOSE_BUFFER && ev.clientY <= rect.bottom + AUTO_CLOSE_BUFFER;
      if (isInBufferedZone) {
        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer);
          autoCloseTimer = null;
        }
      } else {
        if (!autoCloseTimer) {
          autoCloseTimer = window.setTimeout(() => {
            panel.classList.remove("open");
            removePanelBackdrop();
            if (tagsDropdown.classList.contains("open"))
              closeTagsDropdown();
            if (colorPaletteEl)
              closeColorPalette();
            hideAddArea();
            hideSettingsArea();
            autoCloseTimer = null;
          }, AUTO_CLOSE_DELAY);
        }
      }
    }
    document.addEventListener("mousemove", handleAutoClose, false);
    document.addEventListener("mousedown", (ev) => {
      const isPanelOpen = panel.classList.contains("open");
      if (!isPanelOpen)
        return;
      const path = ev.composedPath ? ev.composedPath() : [ev.target];
      if (pathTouches(path, [panel, host])) {
        if (tagsDropdown.classList.contains("open")) {
          closeTagsDropdown();
        }
        return;
      }
      hideAddArea();
      hideSettingsArea();
      if (tagsDropdown.classList.contains("open"))
        closeTagsDropdown();
      if (colorPaletteEl)
        closeColorPalette();
      panel.classList.remove("open");
      removePanelBackdrop();
    }, false);
    function applySettingsToHost() {
      host.style.setProperty("--popup-width", `${settings.popupWidthPx || 320}px`);
      host.style.setProperty("--popup-height", settings.popupHeightVh ? `${settings.popupHeightVh}vh` : "365px");
      host.style.setProperty("--font-size", `${settings.fontSizePx || 13}px`);
      host.style.setProperty("--hotspot-width", `${settings.hotspotWidthPx}px`);
      host.setAttribute("data-hotspot-position", settings.hotspotPosition || "edge");
      host.setAttribute("data-theme", settings.theme || "dark");
      if (!host.style.getPropertyValue("--font-size"))
        host.style.setProperty("--font-size", "10px");
      try {
        shadow.getElementById("panel").style.fontSize = host.style.getPropertyValue("--font-size") || "10px";
      } catch {
      }
    }
    function getTagsDropdownContext() {
      if (addArea.classList.contains("open"))
        return "edit";
      return "list";
    }
    function ensureTagsClosedOnModeChange() {
      if (tagsEditMode) {
        tagsEditMode = false;
        try {
          tagsEditBtn.textContent = "Edit";
        } catch {
        }
      }
      if (tagsDropdown && tagsDropdown.classList.contains("open")) {
        closeTagsDropdown();
      }
    }
    applySettingsToHost();
    function showToast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      setTimeout(() => toastEl.classList.remove("show"), 1400);
    }
    function ensurePlaceholder() {
      if (placeholder)
        return placeholder;
      placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      return placeholder;
    }
    function removePlaceholder() {
      if (!placeholder)
        return;
      if (placeholder.parentElement)
        placeholder.parentElement.removeChild(placeholder);
      placeholder = null;
    }
    let selectedTagIds = [];
    const SELECTED_TAGS_SESSION_KEY = "promptManager.selectedTags";
    const MAX_CHIPS_TO_SHOW = 3;
    try {
      const raw = sessionStorage.getItem(SELECTED_TAGS_SESSION_KEY);
      selectedTagIds = raw ? JSON.parse(raw) : [];
    } catch (e) {
      selectedTagIds = [];
    }
    async function saveTags() {
      try {
        await setStorage({ [TAGS_KEY2]: tags });
      } catch (e) {
        console.warn("Failed saving tags", e);
      }
    }
    async function savePrompts() {
      try {
        await setStorage({ [PROMPTS_KEY2]: prompts });
      } catch (e) {
        console.warn("Failed saving prompts", e);
      }
    }
    async function renameTag(id, newName) {
      const nm = newName;
      if (!nm)
        return false;
      if (tagNameExists(nm, id)) {
        showToast("Tag name already exists");
        return false;
      }
      const idx = tags.findIndex((t) => t.id === id);
      if (idx === -1)
        return false;
      tags[idx] = { ...tags[idx], name: nm };
      await saveTags();
      renderAddTags();
      renderTagsList();
      buildList();
      return true;
    }
    async function recolorTag(id, color) {
      const idx = tags.findIndex((t) => t.id === id);
      if (idx === -1)
        return false;
      tags[idx] = { ...tags[idx], color };
      await saveTags();
      renderAddTags();
      renderTagsList();
      buildList();
      return true;
    }
    async function deleteTag(id) {
      const idx = tags.findIndex((t) => t.id === id);
      if (idx === -1)
        return false;
      const name = tags[idx].name;
      if (!confirm(`Delete tag "${name}"? This will remove it from all prompts.`))
        return false;
      tags.splice(idx, 1);
      for (const p of prompts) {
        if (Array.isArray(p.tags) && p.tags.includes(id)) {
          p.tags = p.tags.filter((x) => x !== id);
        }
      }
      await Promise.all([saveTags(), savePrompts()]);
      selectedTagIds = selectedTagIds.filter((x) => x !== id);
      draftPromptTagIds = (draftPromptTagIds || []).filter((x) => x !== id);
      renderAddTags();
      renderTagsList();
      buildList();
      showToast("Tag deleted");
      return true;
    }
    function persistSelectedTags() {
      try {
        sessionStorage.setItem(SELECTED_TAGS_SESSION_KEY, JSON.stringify(selectedTagIds));
      } catch (e) {
      }
      if (selectedTagIds.length > 0)
        tagsBtn.classList.add("active");
      else
        tagsBtn.classList.remove("active");
    }
    function isTagSelected(id) {
      return selectedTagIds.includes(id);
    }
    function toggleTagSelection(id) {
      if (isTagSelected(id))
        selectedTagIds = selectedTagIds.filter((x) => x !== id);
      else
        selectedTagIds.push(id);
      persistSelectedTags();
      buildList();
      renderTagsList();
    }
    function clearTagSelection() {
      selectedTagIds = [];
      persistSelectedTags();
      buildList();
      renderTagsList();
    }
    function tagNameExists(name, excludeId) {
      const lower = (name || "").trim().toLowerCase();
      if (!lower)
        return false;
      return tags.some((t) => t.id !== excludeId && (t.name || "").trim().toLowerCase() === lower);
    }
    function filterPrompts(q) {
      const s = q.trim().toLowerCase();
      let base = prompts;
      if (selectedTagIds && selectedTagIds.length > 0) {
        base = prompts.filter((p) => (p.tags || []).some((tid) => selectedTagIds.includes(tid)));
      }
      if (!s)
        return base;
      return base.filter(
        (p) => p.title && p.title.toLowerCase().includes(s) || p.quick && p.quick.toLowerCase().includes(s)
      );
    }
    function resetSelection() {
      selectedIndex = 0;
      highlightSelection();
    }
    function highlightSelection() {
      list.querySelectorAll(".row").forEach((el) => el.classList.remove("selected"));
      if (filteredPrompts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredPrompts.length) {
        const selId = filteredPrompts[selectedIndex].id;
        const selEl = list.querySelector(`.row[data-id="${selId}"]`);
        if (selEl) {
          selEl.classList.add("selected");
          try {
            selEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } catch {
            selEl.scrollIntoView(false);
          }
        }
      }
    }
    async function copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          const prevActive = document.activeElement;
          ta.focus();
          ta.select();
          const ok = document.execCommand("copy");
          ta.remove();
          prevActive?.focus();
          return Boolean(ok);
        } catch (e) {
          return false;
        }
      }
    }
    function buildList() {
      const q = (searchInput?.value || "").trim();
      filteredPrompts = filterPrompts(q);
      list.innerHTML = "";
      if (!filteredPrompts.length) {
        const e = document.createElement("div");
        e.className = "empty";
        e.textContent = "No prompts (or none match your search).";
        list.appendChild(e);
        return;
      }
      for (const p of filteredPrompts) {
        const row = document.createElement("div");
        row.className = "row";
        if (!p.quick)
          row.classList.add("heading-row");
        row.dataset.id = p.id;
        row.addEventListener("click", async () => {
          try {
            await copyToClipboard(p.text);
            showToast("Copied");
          } catch {
            showToast("Copy failed");
          }
        });
        const left = document.createElement("div");
        left.className = "left";
        const handle = document.createElement("div");
        handle.className = "drag-handle";
        handle.innerHTML = "&#x2261;";
        handle.draggable = true;
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = p.title;
        left.appendChild(handle);
        left.appendChild(label);
        if (selectedTagIds.length > 0 && (p.tags || []).length > 0) {
          const chips = document.createElement("div");
          chips.className = "tag-chips";
          const pTags = (p.tags || []).map((id) => tags.find((t) => t.id === id)).filter(Boolean);
          const visible = pTags.slice(0, MAX_CHIPS_TO_SHOW);
          for (const t of visible) {
            const chip = document.createElement("span");
            chip.className = "tag-chip";
            chip.textContent = t.name;
            chip.title = t.name;
            const bg = t.color || "rgba(255,255,255,0.06)";
            chip.style.background = bg;
            chip.style.color = getContrastTextColor(bg);
            chip.style.border = "1px solid rgba(0,0,0,0.06)";
            chips.appendChild(chip);
          }
          if (pTags.length > MAX_CHIPS_TO_SHOW) {
            const more = document.createElement("span");
            more.className = "tag-chip overflow";
            more.textContent = `+${pTags.length - MAX_CHIPS_TO_SHOW}`;
            chips.appendChild(more);
          }
          left.appendChild(chips);
        }
        const icons = document.createElement("div");
        icons.className = "icons";
        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          editingId = p.id;
          showAddArea(p.title, p.quick || "", p.text);
          draftPromptTagIds = Array.from(p.tags || []);
        });
        icons.appendChild(editBtn);
        row.appendChild(left);
        row.appendChild(icons);
        list.appendChild(row);
        handle.addEventListener("dragstart", (ev) => {
          draggedId = p.id;
          row.classList.add("dragging");
          try {
            ev.dataTransfer?.setData("text/plain", p.id);
          } catch {
          }
        });
        handle.addEventListener("dragend", () => {
          draggedId = null;
          shadow.querySelectorAll(".row.dragging").forEach((el) => el.classList.remove("dragging"));
          removePlaceholder();
        });
        row.addEventListener("dragover", (ev) => {
          ev.preventDefault();
        });
      }
      const endSpacer = document.createElement("div");
      endSpacer.style.minHeight = "12px";
      endSpacer.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        const ph = ensurePlaceholder();
        if (list.lastElementChild !== ph)
          list.appendChild(ph);
      });
      endSpacer.addEventListener("drop", (ev) => {
        ev.preventDefault();
        const srcId = draggedId ?? ev.dataTransfer?.getData("text/plain") ?? null;
        if (!srcId)
          return;
        const before = getRectsMap(shadow);
        movePromptToIndex(srcId, prompts.length, before);
        removePlaceholder();
      });
      list.appendChild(endSpacer);
      list.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        const ph = ensurePlaceholder();
        const rows = Array.from(list.querySelectorAll(".row"));
        let inserted = false;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const rect = r.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          if (ev.clientY < mid) {
            if (r.parentElement && r.parentElement.querySelector(".placeholder") !== r)
              list.insertBefore(ph, r);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          const end = list.lastElementChild;
          if (end && end !== ph)
            list.insertBefore(ph, end);
        }
      });
      list.addEventListener("drop", (ev) => {
        ev.preventDefault();
        const srcId = draggedId ?? ev.dataTransfer?.getData("text/plain") ?? null;
        if (!srcId) {
          removePlaceholder();
          return;
        }
        const ph = list.querySelector(".placeholder");
        if (!ph) {
          removePlaceholder();
          return;
        }
        const children = Array.from(list.children);
        const idx = children.indexOf(ph);
        let targetIndex = 0;
        for (let i = 0; i < idx; i++) {
          if (children[i].classList.contains("row"))
            targetIndex++;
        }
        const before = getRectsMap(shadow);
        if (targetIndex >= filteredPrompts.length) {
          movePromptToIndex(srcId, prompts.length, before);
        } else {
          const targetFilteredPrompt = filteredPrompts[targetIndex];
          const idxInPrompts = prompts.findIndex((x) => x.id === targetFilteredPrompt.id);
          movePromptToIndex(srcId, idxInPrompts === -1 ? prompts.length : idxInPrompts, before);
        }
        removePlaceholder();
      });
      highlightSelection();
    }
    function movePromptToIndex(srcId, targetIndex, beforeRects) {
      const srcIndex = prompts.findIndex((x) => x.id === srcId);
      if (srcIndex === -1 || srcIndex === targetIndex)
        return;
      const [item] = prompts.splice(srcIndex, 1);
      let adjustedTargetIndex = targetIndex;
      if (srcIndex < targetIndex) {
        adjustedTargetIndex--;
      }
      const clamped = Math.max(0, Math.min(adjustedTargetIndex, prompts.length));
      prompts.splice(clamped, 0, item);
      setStorage({ [PROMPTS_KEY2]: prompts }).then(() => {
        buildAndAnimate(beforeRects);
        showToast("Order saved");
      });
    }
    function buildAndAnimate(before) {
      buildList();
      if (before)
        playFLIP(shadow, before);
    }
    buildList();
    hotzone.addEventListener("mouseenter", () => {
      attachPanelBackdrop();
      showPanel();
      setTimeout(() => {
        try {
          if (!addArea.classList.contains("open") && !settingsArea.classList.contains("open")) {
            searchInput?.focus();
            if (typeof searchInput.setSelectionRange === "function") {
              const len = (searchInput.value || "").length;
              searchInput.setSelectionRange(len, len);
            }
          }
        } catch (e) {
        }
      }, 60);
    });
    function renderTagsList() {
      const displayCtx = getTagsDropdownContext();
      let editMode = false;
      if (displayCtx === "list") {
        editMode = tagsEditMode;
        tagsClearBtn.style.display = "";
        tagsEditBtn.style.display = "";
        tagsNewBtn.style.display = "";
      } else {
        editMode = false;
        tagsClearBtn.style.display = "none";
        tagsEditBtn.style.display = "none";
        tagsNewBtn.style.display = "none";
      }
      tagsList.innerHTML = "";
      const sortedTags = tags.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
      if (!sortedTags.length) {
        tagsList.innerHTML = '<div class="small" style="padding:6px 4px">No tags yet. Click New to create one.</div>';
        return;
      }
      for (let i = 0; i < sortedTags.length; i++) {
        const t = sortedTags[i];
        const row = document.createElement("div");
        row.className = "tag-row";
        row.dataset.id = t.id;
        row.tabIndex = 0;
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "8px";
        row.style.padding = "6px";
        row.style.borderRadius = "6px";
        row.style.cursor = "pointer";
        row.style.userSelect = "none";
        const sw = document.createElement("div");
        sw.className = "tag-swatch";
        sw.style.width = "18px";
        sw.style.height = "18px";
        sw.style.borderRadius = "4px";
        sw.style.background = t.color || "#cccccc";
        sw.title = editMode ? "Click to change color" : "Color";
        if (editMode) {
          sw.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            closeColorPalette();
            openColorPaletteFor(t.id, row);
          });
        } else {
          sw.addEventListener("click", (ev) => ev.stopPropagation());
        }
        if (editMode) {
          const handle = document.createElement("div");
          handle.textContent = "\u2261";
          handle.title = "Drag to reorder";
          handle.style.cursor = "grab";
          handle.draggable = true;
          handle.addEventListener("dragstart", (ev) => {
            ev.stopPropagation();
            ev.dataTransfer?.setData?.("text/plain", t.id);
            row.classList.add("dragging");
          });
          handle.addEventListener("dragend", (ev) => {
            ev.stopPropagation();
            row.classList.remove("dragging");
          });
          row.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
          });
          row.addEventListener("drop", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const srcId = ev.dataTransfer?.getData("text/plain") ?? null;
            if (!srcId || srcId === t.id)
              return;
            const beforeRects = getRectsMap(shadow);
            const targetIndex = sortedTags.findIndex((x) => x.id === t.id);
            moveTagToIndex(srcId, targetIndex, beforeRects);
          });
          row.appendChild(handle);
        }
        const nameWrap = document.createElement("div");
        nameWrap.style.flex = "1";
        nameWrap.style.minWidth = "0";
        if (editMode) {
          const input = document.createElement("input");
          input.type = "text";
          input.value = t.name;
          input.maxLength = 80;
          input.style.width = "100%";
          input.style.fontSize = "13px";
          input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              input.blur();
            }
            ev.stopPropagation();
          });
          input.addEventListener("blur", async () => {
            if (input.value.trim() !== t.name) {
              await renameTag(t.id, input.value);
            }
          });
          input.addEventListener("click", (ev) => ev.stopPropagation());
          nameWrap.appendChild(input);
        } else {
          const name = document.createElement("div");
          name.className = "tag-name";
          name.textContent = t.name.length > 30 ? t.name.slice(0, 27) + "\u2026" : t.name;
          name.style.whiteSpace = "nowrap";
          name.style.overflow = "hidden";
          name.style.textOverflow = "ellipsis";
          try {
            name.style.color = t.color || "";
            const bg = tintBackground(t.color || "#000", 0.06);
            if (bg)
              row.style.background = bg;
          } catch (e) {
          }
          nameWrap.appendChild(name);
        }
        const tick = document.createElement("div");
        tick.className = "tag-tick";
        const isSelectedInList = (selectedTagIds || []).includes(t.id);
        const isSelectedInDraft = (draftPromptTagIds || []).includes(t.id);
        tick.innerHTML = displayCtx === "list" ? isSelectedInList ? "\u2713" : "" : isSelectedInDraft ? "\u2713" : "";
        if (editMode) {
          row.appendChild(sw);
        }
        row.appendChild(nameWrap);
        if (!editMode) {
          row.appendChild(tick);
        }
        if (editMode) {
          const del = document.createElement("button");
          del.type = "button";
          del.className = "delete-icon-btn";
          del.title = "Delete tag";
          del.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>';
          del.addEventListener("mousedown", async (ev) => {
            ev.stopPropagation();
            await deleteTag(t.id);
          });
          row.appendChild(del);
        } else {
          row.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            if (getTagsDropdownContext() === "list") {
              if (!tagsEditMode)
                toggleTagSelection(t.id);
            } else {
              const idx = (draftPromptTagIds || []).indexOf(t.id);
              if (idx === -1)
                draftPromptTagIds.push(t.id);
              else
                draftPromptTagIds.splice(idx, 1);
              renderAddTags();
              renderTagsList();
            }
          });
        }
        row.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            ev.stopPropagation();
            if (editMode) {
              const input = row.querySelector('input[type="text"]');
              if (input)
                input.blur();
            } else {
              row.click();
            }
          }
        });
        tagsList.appendChild(row);
      }
    }
    function renderAddTags() {
      if (!addTagsContainer)
        return;
      addTagsContainer.innerHTML = "";
      if (!tags || tags.length === 0) {
        addTagsContainer.innerHTML = '<div style="opacity:0.7;font-size:12px">No tags yet</div>';
        return;
      }
      for (const t of tags) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tag-select";
        btn.title = t.name;
        btn.textContent = t.name;
        const bg = t.color || "#cccccc";
        btn.style.background = bg;
        btn.style.color = getContrastTextColor(bg);
        btn.style.border = "1px solid rgba(0,0,0,0.06)";
        btn.style.padding = "6px 8px";
        btn.style.borderRadius = "999px";
        btn.style.whiteSpace = "nowrap";
        btn.style.overflow = "hidden";
        btn.style.textOverflow = "ellipsis";
        btn.dataset.id = t.id;
        const wasSelected = (draftPromptTagIds || []).includes(t.id);
        if (wasSelected)
          btn.classList.add("selected");
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const id = t.id;
          if (!id)
            return;
          const idx = (draftPromptTagIds || []).indexOf(id);
          if (idx === -1) {
            draftPromptTagIds.push(id);
            btn.classList.add("selected");
          } else {
            draftPromptTagIds.splice(idx, 1);
            btn.classList.remove("selected");
          }
        });
        addTagsContainer.appendChild(btn);
      }
    }
    function moveTagToIndex(srcId, targetIndex, beforeRects) {
      const srcIndex = tags.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = tags.splice(srcIndex, 1);
      const clamped = Math.max(0, Math.min(targetIndex, tags.length));
      tags.splice(clamped, 0, item);
      tags = tags.map((t, i) => ({ ...t, order: i }));
      saveTags().then(() => {
        buildList();
        renderTagsList();
        if (beforeRects)
          playFLIP(shadow, beforeRects);
        showToast("Tags order saved");
      });
    }
    function openTagsDropdown() {
      const ctx = getTagsDropdownContext();
      if (ctx === "edit") {
        tagsEditMode = false;
        tagsEditBtn.textContent = "Edit";
      }
      tagsDropdown.classList.add("open");
      tagsDropdown.setAttribute("aria-hidden", "false");
      tagsDropdownOpen = true;
      if (ctx === "edit") {
        tagsClearBtn.style.display = "none";
        tagsEditBtn.style.display = "none";
        tagsNewBtn.style.display = "none";
      } else {
        tagsClearBtn.style.display = "";
        tagsEditBtn.style.display = "";
        tagsNewBtn.style.display = "";
      }
      renderTagsList();
      if (ctx === "list") {
        tagsBtn.classList.toggle("active", selectedTagIds.length > 0);
      } else {
        tagsBtn.classList.toggle("active", (draftPromptTagIds || []).length > 0);
      }
    }
    function closeTagsDropdown() {
      tagsDropdown.classList.remove("open");
      tagsDropdown.setAttribute("aria-hidden", "true");
      tagsDropdownOpen = false;
      const ctx = getTagsDropdownContext();
      if (ctx === "list") {
        tagsBtn.classList.toggle("active", selectedTagIds.length > 0);
      } else {
        tagsBtn.classList.toggle("active", (draftPromptTagIds || []).length > 0);
      }
    }
    let tagsDropdownOpen = false;
    let tagsEditMode = false;
    tagsBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (!tagsDropdownOpen)
        openTagsDropdown();
      else
        closeTagsDropdown();
    });
    tagsClearBtn.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      clearTagSelection();
    });
    tagsEditBtn.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      tagsEditMode = !tagsEditMode;
      tagsEditBtn.textContent = tagsEditMode ? "Finish" : "Edit";
      renderTagsList();
    });
    tagsNewBtn.addEventListener("mousedown", (ev) => {
      ev.stopPropagation();
      if (tagsList.querySelector(".new-tag-form")) {
        return;
      }
      const form = document.createElement("div");
      form.className = "new-tag-form";
      const inputRow = document.createElement("div");
      inputRow.className = "new-tag-form-row";
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = "Tag name";
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = "#8fb7ff";
      inputRow.appendChild(nameInput);
      inputRow.appendChild(colorInput);
      const buttonsRow = document.createElement("div");
      buttonsRow.className = "new-tag-form-buttons";
      const save = document.createElement("button");
      save.className = "ctrl-btn";
      save.textContent = "Save";
      const cancel = document.createElement("button");
      cancel.className = "ctrl-btn";
      cancel.textContent = "Cancel";
      buttonsRow.appendChild(cancel);
      buttonsRow.appendChild(save);
      form.appendChild(inputRow);
      form.appendChild(buttonsRow);
      tagsList.insertBefore(form, tagsList.firstChild);
      nameInput.focus();
      save.addEventListener("click", async (e) => {
        const nm = nameInput.value;
        const color = colorInput.value || "#8fb7ff";
        if (!nm) {
          showToast("Name required");
          return;
        }
        if (tagNameExists(nm)) {
          showToast("Tag name already exists");
          return;
        }
        const newTag = { id: uid2(), name: nm, color, order: tags.length };
        tags.push(newTag);
        await saveTags();
        if (isAddingOrEditing) {
          if (editingId) {
            const idx = prompts.findIndex((x) => x.id === editingId);
            if (idx !== -1) {
              prompts[idx].tags = Array.from(/* @__PURE__ */ new Set([...prompts[idx].tags || [], newTag.id]));
              await savePrompts();
            }
          } else {
            draftPromptTagIds = Array.from(/* @__PURE__ */ new Set([...draftPromptTagIds || [], newTag.id]));
          }
        }
        renderAddTags();
        renderTagsList();
        buildList();
        showToast("Tag created");
        form.remove();
      });
      cancel.addEventListener("click", () => {
        form.remove();
      });
    });
    searchInput.addEventListener("input", () => buildList());
    searchInput.addEventListener("keydown", async (ev) => {
      if (!panel.classList.contains("open"))
        return;
      if (isAddingOrEditing || settingsArea.classList.contains("open") || tagsDropdownOpen)
        return;
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        ev.stopPropagation();
        if (!filteredPrompts || filteredPrompts.length === 0)
          return;
        if (ev.key === "ArrowDown")
          selectedIndex = (selectedIndex + 1) % filteredPrompts.length;
        else
          selectedIndex = (selectedIndex - 1 + filteredPrompts.length) % filteredPrompts.length;
        highlightSelection();
        return;
      }
      if (ev.key === "Enter") {
        ev.preventDefault();
        ev.stopPropagation();
        if (!filteredPrompts || !filteredPrompts[selectedIndex]) {
          showToast("No prompt selected.");
          return;
        }
        const prompt = filteredPrompts[selectedIndex];
        const ok = await copyToClipboard(prompt.text);
        showToast(ok ? "Copied" : "Copy failed");
        try {
          searchInput.focus();
        } catch {
        }
        return;
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        panel.classList.remove("open");
      }
    });
    document.addEventListener("keydown", (ev) => {
      if (!tagsDropdownOpen)
        return;
      const rows = Array.from(tagsList.querySelectorAll(".tag-row"));
      if (!rows.length)
        return;
      let idx = rows.findIndex((r) => r.classList.contains("focused"));
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        if (idx < rows.length - 1) {
          if (idx >= 0)
            rows[idx].classList.remove("focused");
          idx = idx + 1;
          rows[idx].classList.add("focused");
          rows[idx].focus?.();
        }
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        if (idx > 0) {
          rows[idx].classList.remove("focused");
          idx = idx - 1;
          rows[idx].classList.add("focused");
          rows[idx].focus?.();
        }
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        if (idx === -1)
          return;
        const id = rows[idx].dataset.id;
        if (!id)
          return;
        if (!tagsEditMode) {
          toggleTagSelection(id);
        } else {
          const input = rows[idx].querySelector('input[type="text"]');
          if (input)
            input.blur();
        }
      } else if (ev.key === "Escape") {
        closeTagsDropdown();
      }
    });
    document.addEventListener("keydown", async (ev) => {
      if (!panel.classList.contains("open"))
        return;
      if (isAddingOrEditing || settingsArea.classList.contains("open") || tagsDropdownOpen) {
        return;
      }
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        if (filteredPrompts.length > 0) {
          selectedIndex = (selectedIndex + 1) % filteredPrompts.length;
          highlightSelection();
        }
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        if (filteredPrompts.length > 0) {
          selectedIndex = (selectedIndex - 1 + filteredPrompts.length) % filteredPrompts.length;
          highlightSelection();
        }
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        if (filteredPrompts.length === 0 || !filteredPrompts[selectedIndex]) {
          showToast("No prompt selected.");
          return;
        }
        const prompt = filteredPrompts[selectedIndex];
        const ok = await copyToClipboard(prompt.text);
        showToast(ok ? "Copied" : "Copy failed");
      } else if (ev.key === "Escape") {
        panel.classList.remove("open");
      }
    });
    function showPanel() {
      attachPanelBackdrop();
      panel.classList.add("open");
      resetSelection();
      ensureTagsClosedOnModeChange();
    }
    function hidePanel() {
      removePanelBackdrop();
      if (!isAddingOrEditing && !tagsDropdownOpen)
        panel.classList.remove("open");
      ensureTagsClosedOnModeChange();
    }
    function showAddArea(prefillTitle = "", prefillQuick = "", prefillBody = "") {
      isAddingOrEditing = true;
      ensureTagsClosedOnModeChange();
      inputTitle.value = prefillTitle;
      inputQuick.value = prefillQuick;
      inputBody.value = prefillBody;
      addArea.classList.add("open");
      addArea.setAttribute("aria-hidden", "false");
      list.style.display = "none";
      settingsArea.classList.remove("open");
      panel.classList.add("mode-add");
      panel.classList.remove("mode-settings");
      tagsBtn.textContent = "+ Tags";
      const existingDel = addArea.querySelector(".delete-btn");
      if (existingDel)
        existingDel.remove();
      if (editingId != null) {
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "delete-btn";
        delBtn.title = "Delete prompt";
        delBtn.setAttribute("aria-label", "Delete prompt");
        delBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" fill="none"/></svg>';
        delBtn.addEventListener("click", async (ev) => {
          ev.stopPropagation();
          if (!editingId)
            return;
          if (!confirm("Delete this prompt?"))
            return;
          const idToDelete = editingId;
          prompts = prompts.filter((x) => x.id !== idToDelete);
          try {
            await setStorage({ [PROMPTS_KEY2]: prompts });
            showToast("Deleted");
          } catch (e) {
            showToast("Delete failed");
          }
          editingId = null;
          hideAddArea();
          buildList();
        });
        addArea.appendChild(delBtn);
      }
      if (editingId) {
        const p = prompts.find((x) => x.id === editingId);
        draftPromptTagIds = p ? Array.from(p.tags || []) : [];
      } else {
      }
      renderAddTags();
    }
    function hideAddArea() {
      isAddingOrEditing = false;
      editingId = null;
      const existingDel = addArea.querySelector(".delete-btn");
      if (existingDel)
        existingDel.remove();
      addArea.classList.remove("open");
      addArea.setAttribute("aria-hidden", "true");
      list.style.display = "block";
      inputTitle.value = "";
      inputBody.value = "";
      inputQuick.value = "";
      draftPromptTagIds = [];
      panel.classList.remove("mode-add");
      tagsBtn.textContent = "T";
    }
    function showSettingsArea() {
      settingsArea.classList.add("open");
      settingsArea.setAttribute("aria-hidden", "false");
      sFontSize.value = String(parseInt(window.getComputedStyle(host).getPropertyValue("--font-size") || "13") || 13);
      sTheme.value = settings.theme;
      sHotpos.value = settings.hotspotPosition;
      list.style.display = "none";
      addArea.classList.remove("open");
      panel.classList.add("mode-settings");
      panel.classList.remove("mode-add");
      ensureTagsClosedOnModeChange();
    }
    function hideSettingsArea() {
      settingsArea.classList.remove("open");
      settingsArea.setAttribute("aria-hidden", "true");
      list.style.display = "block";
      panel.classList.remove("mode-settings");
    }
    [addArea, settingsArea, panel].forEach((el) => {
      el?.addEventListener("click", (ev) => ev.stopPropagation());
      el?.addEventListener("pointerdown", (ev) => ev.stopPropagation());
    });
    panel.addEventListener("mouseup", async () => {
      const w = panel.offsetWidth;
      const hPx = panel.offsetHeight;
      const vh = Math.round(hPx / window.innerHeight * 100);
      settings.popupWidthPx = w;
      settings.popupHeightVh = vh;
      applySettingsToHost();
      try {
        await setStorage({ [SETTINGS_KEY2]: settings });
      } catch {
      }
    });
    saveBtn.addEventListener("click", async () => {
      const title = inputTitle.value.trim();
      const quick = inputQuick.value.trim();
      const text = inputBody.value.trim();
      if (!title || !text) {
        alert("Both title and prompt are required");
        return;
      }
      if (editingId != null) {
        const idx = prompts.findIndex((x) => x.id === editingId);
        if (idx !== -1) {
          prompts[idx] = { ...prompts[idx], title, quick, text, tags: Array.from(new Set(draftPromptTagIds || [])) };
        }
      } else {
        const newPrompt = { id: uid2(), title, quick, text, tags: Array.from(new Set(draftPromptTagIds || [])) };
        prompts.unshift(newPrompt);
      }
      try {
        await setStorage({ [PROMPTS_KEY2]: prompts });
        buildList();
        hideAddArea();
        showToast("Saved");
      } catch {
        showToast("Save failed");
      }
    });
    addBtn.addEventListener("click", () => {
      editingId = null;
      draftPromptTagIds = [];
      showAddArea();
      settingsArea.classList.remove("open");
    });
    cancelBtn.addEventListener("click", () => hideAddArea());
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));
    settingsBtn.addEventListener("click", () => {
      if (settingsArea.classList.contains("open"))
        hideSettingsArea();
      else
        showSettingsArea();
    });
    sCancel.addEventListener("click", () => hideSettingsArea());
    sSave.addEventListener("click", async () => {
      const fs = parseInt(sFontSize.value, 10);
      const newS = {
        popupHeightVh: settings.popupHeightVh,
        popupWidthPx: settings.popupWidthPx,
        fontSizePx: fs && !Number.isNaN(fs) ? fs : 13,
        // Use new value or default to 13
        theme: sTheme.value || settings.theme,
        hotspotPosition: sHotpos.value || settings.hotspotPosition,
        hotspotWidthPx: settings.hotspotWidthPx
      };
      settings = newS;
      applySettingsToHost();
      try {
        await setStorage({ [SETTINGS_KEY2]: settings });
        hideSettingsArea();
        showToast("Settings saved");
      } catch {
        showToast("Save failed");
      }
    });
    function isPointInsideExtendedRect(x, y, rect, tol) {
      return x >= rect.left - tol && x <= rect.right + tol && y >= rect.top - tol && y <= rect.bottom + tol;
    }
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local")
        return;
      if (changes[PROMPTS_KEY2]) {
        prompts = changes[PROMPTS_KEY2].newValue ?? prompts;
        prompts = prompts.map((p) => ({ ...p, tags: p.tags ? Array.from(p.tags) : [] }));
        buildList();
      }
      if (changes[SETTINGS_KEY2]) {
        settings = changes[SETTINGS_KEY2].newValue ?? settings;
        applySettingsToHost();
      }
      if (changes[TAGS_KEY2]) {
        tags = changes[TAGS_KEY2].newValue ?? tags;
        renderAddTags();
        renderTagsList();
        buildList();
      }
    });
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.type === "PERMISSION_REMOVED" && msg?.pattern) {
        try {
          const originPrefix = String(msg.pattern).replace(/\*.*$/, "");
          if (window.location.href.startsWith(originPrefix)) {
            try {
              const HOST_ID = "prompt-drawer-host-shadow";
              const hostEl = document.getElementById(HOST_ID);
              if (hostEl)
                hostEl.remove();
            } catch (e) {
            }
            try {
              if (panelBackdrop && panelBackdrop.parentElement)
                panelBackdrop.remove();
            } catch (e) {
            }
            try {
              window.__promptManagerInitialized = false;
            } catch (e) {
            }
          }
        } catch (e) {
        }
        return;
      }
      if (msg?.type === "TOGGLE_POPUP") {
        if (!panel.classList.contains("open")) {
          attachPanelBackdrop();
          showPanel();
          setTimeout(() => searchInput?.focus(), 60);
        } else {
          hidePanel();
        }
        sendResponse({ ok: true });
      }
    });
    setupResizeHandles({ panel, shadow, host, getSettings: () => settings, saveSettings: async (s) => {
      settings = s;
      applySettingsToHost();
      await setStorage({ [SETTINGS_KEY2]: settings });
    } });
    function getRectsMapLocal() {
      return getRectsMap(shadow);
    }
    function playFLIPLocal(before) {
      playFLIP(shadow, before);
    }
    renderTagsList();
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
    },
    {
      title: "Summarize Content",
      quick: "summary",
      text: "Please provide a concise summary of the following content, highlighting the key points:",
      tags: ["Analysis"]
    },
    {
      title: "Creative Brainstorm",
      quick: "brainstorm",
      text: "Help me brainstorm creative ideas for the following topic. Provide diverse, innovative suggestions:",
      tags: ["Creative"]
    },
    {
      title: "Debug Code",
      quick: "debug",
      text: "Help me debug this code. Identify potential issues and suggest fixes:",
      tags: ["Code"]
    },
    {
      title: "Professional Email",
      quick: "email",
      text: "Help me write a professional email for the following situation:",
      tags: ["Writing"]
    }
  ];

  // src/content/main.ts
  var PROMPTS_KEY = "promptManager.prompts";
  var SETTINGS_KEY = "promptManager.settings";
  var TAGS_KEY = "promptManager.tags";
  var DEFAULT_SETTINGS = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    // +++ ADD THIS LINE (13px is a more readable default)
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24
  };
  function uid() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  async function loadAndInit() {
    let prompts = [];
    let settings = DEFAULT_SETTINGS;
    let tags = [];
    let isFirstInstall = false;
    try {
      const p = await getStorage(PROMPTS_KEY);
      prompts = Array.isArray(p) ? p : [];
    } catch (e) {
      prompts = [];
    }
    try {
      const s = await getStorage(SETTINGS_KEY);
      settings = s ? s : DEFAULT_SETTINGS;
    } catch (e) {
      settings = DEFAULT_SETTINGS;
    }
    try {
      const t = await getStorage(TAGS_KEY);
      tags = Array.isArray(t) ? t : [];
    } catch (e) {
      tags = [];
    }
    if (prompts.length === 0 && tags.length === 0) {
      isFirstInstall = true;
      tags = DEFAULT_TAGS.map((dt, index) => ({
        id: uid(),
        name: dt.name,
        color: dt.color,
        order: index
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
          id: uid(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags
        };
      });
      try {
        await Promise.all([
          setStorage({ [PROMPTS_KEY]: prompts }),
          setStorage({ [TAGS_KEY]: tags }),
          setStorage({ [SETTINGS_KEY]: settings })
        ]);
      } catch (e) {
        console.warn("Failed to save default prompts/tags:", e);
      }
    }
    const { host, shadow } = createOrGetHost();
    await renderUI({ host, shadow, prompts, tags, settings, PROMPTS_KEY, SETTINGS_KEY, TAGS_KEY });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadAndInit().catch(console.error), { once: true });
  } else {
    loadAndInit().catch(console.error);
  }
})();
