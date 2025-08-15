// file: /home/auriga/Desktop/Projects/prompt manager/src/content/host.ts
// Creates or returns the shadow host element and the shadow root.
// Keeps markup and styles in one place.

export function createOrGetHost() {
  const HOST_ID = 'prompt-drawer-host-shadow';
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (host && host.shadowRoot) return { host, shadow: host.shadowRoot as ShadowRoot };
  if (host) host.remove();

  host = document.createElement('div');
  host.id = HOST_ID;
  Object.assign(host.style, { all: 'initial' });
  document.documentElement.appendChild(host);

  // NOTE: closed shadow keeps UI encapsulated. Change to 'open' during debugging if you want to inspect.
  const shadow = host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      /* ----------------------
         Theme and spacing vars
      */
      :host {
        all: initial;
        --popup-width: 280px;
        --popup-height: 56vh;
        --font-family: Arial, Helvetica, sans-serif;
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
        width: var(--hotspot-width);
        height: var(--popup-height);
        top: calc(50% - (var(--popup-height) / 2));
        border-radius: 0;
        writing-mode: vertical-rl;
        font-size: 13px;
        color: transparent; /* hide inner emoji/text */
        background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.00) 100%);
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
        backdrop-filter: blur(10px) saturate(110%);
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
      .add-area, .settings-area { display: none; flex-direction: column; gap: 8px; }
      .add-area.open, .settings-area.open { display: flex; }
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
    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">💬</div>

    <!-- MAIN PANEL -->
    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">

      <!-- Header: search + small control buttons -->
      <div class="header">
        <div class="search"><input id="search-input" type="text" placeholder="Search (title, quick, body)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn" title="Add">＋</button>
          <button id="settings-btn" class="ctrl-btn" title="Settings">⚙</button>
          <button id="close-btn" class="ctrl-btn" title="Close">✕</button>
        </div>
      </div>

      <!-- Prompt list (populated by ui.ts) -->
      <div class="list" id="list" role="list"></div>

      <!-- Add / Edit area -->
      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
        <textarea id="input-body" placeholder="Full prompt text"></textarea>
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
