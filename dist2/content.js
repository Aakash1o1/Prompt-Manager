(() => {
  // src/content/host.ts
  function createOrGetHost() {
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
         Theme and spacing vars
      */
      :host {
        all: initial;
        --popup-width: 280px;
        --popup-height: 56vh;
        --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --font-size: 13px;
        --bg-dark: rgba(12,18,24,0.55);
        --bg-dark-b: rgba(24,32,40,0.55);
        --txt: #e6eef8;
        --accent: #8fb7ff;
        --hot: #9cc7ff;
        --gap: 8px;
        /* translucent silver gradient for light theme */
        --silver-bg: linear-gradient(180deg, rgba(243,244,246,0.75), rgba(230,233,236,0.68));
        --silver-txt: #1f2937;
      }

      /* Light (silver) theme - translucent using alpha and blur */
      :host([data-theme="light"]) {
        --bg: var(--silver-bg);
        --bg-b: rgba(240,242,245,0.64);
        --txt: var(--silver-txt);
      }

      /* Dark theme fallback */
      :host(:not([data-theme="light"])) {
        --bg: linear-gradient(180deg, rgba(12,18,24,0.6), rgba(18,24,32,0.6));
        --bg-b: var(--bg-dark-b);
        --txt: #e6eef8;
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
        right: 10px;
        bottom: 12px;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--hot);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        font-size: 16px;
        color: #08324a;
        user-select: none;
      }

      /* Edge-mode: narrow mist bar on the right edge; icon hidden (color made transparent) */
      :host([data-hotspot-position="edge"]) .hotzone {
        right: 0;
        width: 10px;
        height: var(--popup-height);
        top: calc(50% - (var(--popup-height) / 2));
        border-radius: 4px; /* <<< --- FIX: Added 'px' unit here */
        writing-mode: vertical-rl;
        font-size: 13px;
        color: transparent; /* hide inner emoji/text */
        background: linear-gradient(86deg, rgb(0 12 255 / 0%) 0%, rgb(41 169 255 / 88%) 40%, rgb(255 255 255 / 0%) 100%);
        backdrop-filter: blur(6px) saturate(120%); /* mist/blur */
        box-shadow: none;
      }

      /* ----------------------
         Main panel
         - BOTTOM: set to 0 so panel starts at the very bottom
      */
      .panel {
        position: fixed;
        right: 12px;
        bottom: 0px; /* <<--- changed: stick to the very bottom */
        width: var(--popup-width);
        height: var(--popup-height);
        z-index: 1000001;
        border-radius: 12px;
        overflow: hidden;
        display: none;
        flex-direction: column;
        color: var(--txt);

        background: var(--bg);
        border: 1px solid rgba(255,255,255,0.06);
        padding: 10px;
        box-sizing: border-box;
        backdrop-filter: blur(5px) saturate(200%);
      }
      .panel.open { display: flex; }

      /* ----------------------
         Header: contains (search) + small controls
      */
      .header {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 2px;
        flex: 0 0 auto;
      }
      .search { flex: 1; min-width: 0; }
      .search input {
        width: 100%;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,0.06);
        background: rgba(255,255,255,0.02);
        color: var(--txt);
      }
      /* hide search when not on the prompt list page */
      .panel.mode-add .search,
      .panel.mode-settings .search { display: none !important; }

      .controls { display: flex; gap: 6px; align-items: center; }
      .ctrl-btn {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.04);
        border-radius: 8px;
        padding: 6px;
        font-size: var(--font-size);
        color: var(--txt);
        cursor: pointer;
      }

      /* ----------------------
         Prompt list & rows
         - Hover vs Selected colors are explicitly defined for both themes
         - Cursor pointer on hover (drag-handle keeps 'grab')
      */
      .list {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 6px;
        margin-top: 6px;
        -webkit-overflow-scrolling: touch;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px;           /* slightly increased from 2px for pointer area */
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.03));
        margin-bottom: 8px;
        min-height: 36px;
        transition: background 120ms ease, transform 160ms ease, opacity 120ms ease;
        cursor: default; /* default; changed to pointer on hover below */
      }
      .row.heading-row {
        padding: 4px;
        min-height: 32px;
        display:flex;
        align-items:center;
        justify-content:space-between;
      }

      /* Drag handle keeps grab cursor */
      .drag-handle { cursor: grab !important; }

      /* Hover state (different from selected). Theme-aware */
      :host([data-theme="light"]) .row:hover {
        background: rgba(0,0,0,0.04); /* subtle darkening on light theme */
      }
      :host(:not([data-theme="light"])) .row:hover {
        background: rgba(255,255,255,0.03); /* subtle lightening on dark theme */
      }
      /* ensure hover shows pointer (but drag-handle will override) */
      .row:hover { cursor: pointer; }

      /* Selected state (distinct, slightly stronger and with accent) */
      :host([data-theme="light"]) .row.selected {
        background: linear-gradient(180deg, rgba(200,210,220,0.28), rgba(220,230,240,0.30));
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
      }
      :host(:not([data-theme="light"])) .row.selected {
        background: linear-gradient(180deg, rgba(143,183,255,0.10), rgba(143,183,255,0.06));
        box-shadow: inset 0 0 0 1px rgba(143,183,255,0.06);
      }

      /* If selected and hovered, keep selected look but slightly adjust */
      .row.selected:hover {
        filter: brightness(0.98);
        cursor: pointer;
      }

      /* Left group and label */
      .left { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
      .label {
        flex: 1;
        font-weight: 600;
        font-size: calc(var(--font-size) * 1);
        color: var(--txt);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Icons group on the right (edit/delete) */
      .icons { display:flex; gap:6px; flex:0 0 auto; }
      .icon-btn {
        background: rgba(0,0,0,0.02);
        border: none;
        color: var(--txt);
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 6px;
      }
      .icon-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.6; }

      /* remainder unchanged */
      .placeholder { height: 8px; margin: 4px 0; border-radius: 6px; background: rgba(255,255,255,0.02); transition: height 120ms ease; }

      /* add/edit/settings areas */
      /* make .add-area positioned so we can absolutely place the delete icon at top-right */
      .add-area, .settings-area { display: none; flex-direction: column; gap: 8px; }
      .add-area { position: relative; }               /* <-- required for absolute delete icon */
      .add-area.open, .settings-area.open { display: flex; }

      /* Delete icon placed at the top-right of the add-area (edit page).
         It's only created dynamically when editing an existing prompt. */
      .delete-btn {
        position: absolute;
        top: 0px;
        right: 8px;
        width: 36px;
        height: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--txt);
        cursor: pointer;
        z-index: 10;
        transition: box-shadow 140ms ease, background 120ms ease, color 120ms ease;
      }
      .delete-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.6; }

      /* Hover glow (yellow) */
      .delete-btn:hover {
        color: #FFD400; /* yellow icon */
        background: rgba(255, 212, 64, 0.06);
        box-shadow: 0 0 0 6px rgba(255, 212, 64, 0.10), 0 6px 20px rgba(255, 200, 64, 0.12);
      }

      input[type="text"], textarea { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); background: rgba(0,0,0,0.04); color: var(--txt); font-size: var(--font-size); }
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
          <button id="settings-btn" class="ctrl-btn" title="Settings">\u2699</button>
          <button id="close-btn" class="ctrl-btn" title="Close">\u2715</button>
        </div>
      </div>

      <!-- Prompt list (populated by ui.ts) -->
      <div class="list" id="list" role="list"></div>

      <!-- Add / Edit area -->
      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
        <textarea id="input-body" placeholder="Full prompt text" style="height: 177px;"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
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
    shadow.querySelectorAll(".row").forEach((el) => {
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
      const el = shadow.querySelector(`.row[data-id="${id}"]`);
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
    const { host, shadow, PROMPTS_KEY: PROMPTS_KEY2, SETTINGS_KEY: SETTINGS_KEY2 } = opts;
    let prompts = opts.prompts || [];
    let settings = opts.settings;
    let selectedIndex = 0;
    let filteredPrompts = [];
    const hotzone = shadow.getElementById("hotzone");
    const panel = shadow.getElementById("panel");
    const list = shadow.getElementById("list");
    const addArea = shadow.getElementById("add-area");
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
    const sFontSize = shadow.getElementById("s-font-size");
    const sTheme = shadow.getElementById("s-theme");
    const sHotpos = shadow.getElementById("s-hotspot-pos");
    const sSave = shadow.getElementById("s-save") || shadow.getElementById("s-save");
    const sCancel = shadow.getElementById("s-cancel");
    let isAddingOrEditing = false;
    let editingId = null;
    let draggedId = null;
    let placeholder = null;
    const CLOSE_TOLERANCE_PX = 10;
    function uid() {
      return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
    }
    function stripHTMLTags(input) {
      if (!input)
        return "";
      return input.replace(/<\/?[^>]+(>|$)/g, "");
    }
    function applySettingsToHost() {
      host.style.setProperty("--popup-width", `${settings.popupWidthPx}px`);
      host.style.setProperty("--popup-height", `${settings.popupHeightVh}vh`);
      host.setAttribute("data-hotspot-position", settings.hotspotPosition);
      host.setAttribute("data-theme", settings.theme);
      if (!host.style.getPropertyValue("--font-size"))
        host.style.setProperty("--font-size", "13px");
      try {
        shadow.getElementById("panel").style.fontSize = host.style.getPropertyValue("--font-size") || "13px";
      } catch {
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
    function filterPrompts(q) {
      const s = q.trim().toLowerCase();
      if (!s)
        return prompts;
      return prompts.filter(
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
        const left = document.createElement("div");
        left.className = "left";
        const handle = document.createElement("div");
        handle.className = "drag-handle";
        handle.innerHTML = "&#x2261;";
        handle.draggable = true;
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = p.title;
        label.addEventListener("click", async (ev) => {
          ev.stopPropagation();
          try {
            await copyToClipboard(p.text);
            showToast("Copied");
          } catch {
            showToast("Copy failed");
          }
        });
        left.appendChild(handle);
        left.appendChild(label);
        const icons = document.createElement("div");
        icons.className = "icons";
        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          editingId = p.id;
          showAddArea(p.title, p.quick || "", p.text);
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
        row.addEventListener("drop", (ev) => {
          ev.preventDefault();
          removePlaceholder();
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
        movePromptToIndex(srcId, prompts.length - 1, before);
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
        movePromptToIndex(srcId, targetIndex, before);
        removePlaceholder();
      });
      resetSelection();
    }
    function movePromptToIndex(srcId, targetIndex, beforeRects) {
      const srcIndex = prompts.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = prompts.splice(srcIndex, 1);
      prompts.splice(targetIndex, 0, item);
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
    hotzone.addEventListener("mouseenter", () => showPanel());
    addBtn.addEventListener("click", () => {
      editingId = null;
      showAddArea();
      settingsArea.classList.remove("open");
    });
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));
    cancelBtn.addEventListener("click", () => hideAddArea());
    saveBtn.addEventListener("click", async () => {
      const title = stripHTMLTags(inputTitle.value.trim());
      const quick = stripHTMLTags(inputQuick.value.trim());
      const text = stripHTMLTags(inputBody.value.trim());
      if (!title || !text) {
        alert("Both title and prompt are required");
        return;
      }
      if (editingId != null) {
        const idx = prompts.findIndex((x) => x.id === editingId);
        if (idx !== -1)
          prompts[idx] = { ...prompts[idx], title, quick, text };
      } else {
        const newPrompt = { id: uid(), title, quick, text };
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
    settingsBtn.addEventListener("click", () => {
      if (settingsArea.classList.contains("open"))
        hideSettingsArea();
      else
        showSettingsArea();
    });
    sCancel.addEventListener("click", () => hideSettingsArea());
    sSave.addEventListener("click", async () => {
      const newS = {
        popupHeightVh: settings.popupHeightVh,
        popupWidthPx: settings.popupWidthPx,
        theme: sTheme.value || settings.theme,
        hotspotPosition: sHotpos.value || settings.hotspotPosition,
        hotspotWidthPx: settings.hotspotWidthPx
      };
      const fs = Number(sFontSize.value);
      if (fs && !Number.isNaN(fs)) {
        host.style.setProperty("--font-size", `${fs}px`);
      }
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
    function showPanel() {
      panel.classList.add("open");
      resetSelection();
    }
    function hidePanel() {
      if (!isAddingOrEditing)
        panel.classList.remove("open");
    }
    function showAddArea(prefillTitle = "", prefillQuick = "", prefillBody = "") {
      isAddingOrEditing = true;
      inputTitle.value = stripHTMLTags(prefillTitle);
      inputQuick.value = stripHTMLTags(prefillQuick);
      inputBody.value = stripHTMLTags(prefillBody);
      addArea.classList.add("open");
      addArea.setAttribute("aria-hidden", "false");
      list.style.display = "none";
      settingsArea.classList.remove("open");
      panel.classList.add("mode-add");
      panel.classList.remove("mode-settings");
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
      panel.classList.remove("mode-add");
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
    }
    function hideSettingsArea() {
      settingsArea.classList.remove("open");
      settingsArea.setAttribute("aria-hidden", "true");
      list.style.display = "block";
      panel.classList.remove("mode-settings");
    }
    function isPointInsideExtendedRect(x, y, rect, tol) {
      return x >= rect.left - tol && x <= rect.right + tol && y >= rect.top - tol && y <= rect.bottom + tol;
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
    searchInput.addEventListener("input", () => buildList());
    document.addEventListener("keydown", async (ev) => {
      if (!panel.classList.contains("open"))
        return;
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
        if (document.activeElement && document.activeElement.tagName === "TEXTAREA")
          return;
        ev.preventDefault();
        if (filteredPrompts.length === 0 || !filteredPrompts[selectedIndex]) {
          showToast("No prompt selected.");
          return;
        }
        const prompt = filteredPrompts[selectedIndex];
        const ok = await copyToClipboard(prompt.text);
        showToast(ok ? "Copied" : "Copy failed");
      } else if (ev.key === "Escape" && !isAddingOrEditing) {
        panel.classList.remove("open");
      }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local")
        return;
      if (changes[PROMPTS_KEY2]) {
        prompts = changes[PROMPTS_KEY2].newValue ?? [];
        buildList();
      }
      if (changes[SETTINGS_KEY2]) {
        settings = changes[SETTINGS_KEY2].newValue ?? settings;
        applySettingsToHost();
      }
    });
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === "TOGGLE_POPUP") {
        if (!panel.classList.contains("open")) {
          showPanel();
          setTimeout(() => searchInput?.focus(), 60);
        } else {
          hidePanel();
        }
      }
    });
    setupResizeHandles({ panel, shadow, host, getSettings: () => settings, saveSettings: async (s) => {
      settings = s;
      applySettingsToHost();
      await setStorage({ [SETTINGS_KEY2]: settings });
    } });
    document.addEventListener("mousedown", (ev) => {
      if (!panel.classList.contains("open"))
        return;
      const path = ev.composedPath ? ev.composedPath() : ev.path || [];
      if (Array.isArray(path) && (path.includes(panel) || path.includes(host)))
        return;
      const rect = panel.getBoundingClientRect();
      if (isPointInsideExtendedRect(ev.clientX, ev.clientY, rect, CLOSE_TOLERANCE_PX))
        return;
      hideAddArea();
      hideSettingsArea();
      panel.classList.remove("open");
    });
    function getRectsMapLocal() {
      return getRectsMap(shadow);
    }
    function playFLIPLocal(before) {
      playFLIP(shadow, before);
    }
    buildList();
  }

  // src/content/main.ts
  var PROMPTS_KEY = "promptManager.prompts";
  var SETTINGS_KEY = "promptManager.settings";
  var DEFAULT_SETTINGS = {
    popupHeightVh: 56,
    popupWidthPx: 280,
    fontFamily: "Arial, Helvetica, sans-serif",
    theme: "dark",
    hotspotPosition: "corner",
    hotspotWidthPx: 24
  };
  async function loadAndInit() {
    let prompts = [];
    let settings = DEFAULT_SETTINGS;
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
    const { host, shadow } = createOrGetHost();
    await renderUI({ host, shadow, prompts, settings, PROMPTS_KEY, SETTINGS_KEY });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadAndInit().catch(console.error), { once: true });
  } else {
    loadAndInit().catch(console.error);
  }
})();
