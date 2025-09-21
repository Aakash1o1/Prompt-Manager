// src/content/host.ts
// Creates or returns the shadow host element and the shadow root.
// Keeps markup and styles in one place.

export function createOrGetHost() {
  // at top of src/content/ui.ts (or in createOrGetHost)
  if ((window as any).__promptManagerInitialized) {
    // Optionally update or rebind the shadow UI but DO NOT add global listeners twice.
    return;
  }
  (window as any).__promptManagerInitialized = true;

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
        --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --font-size: 10px;
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
        font-size: 10px;
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
        position: relative; /* anchor for dropdown */
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
      .panel.mode-settings .search {
        visibility: hidden !important;   /* keeps layout but hides visually */
        opacity: 0 !important;           /* ensure it's invisible (defensive) */
        pointer-events: none !important; /* prevent mouse interaction */
      }

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

      /* New Tags button active state */
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
        left: 8px;
        // right: 8px;
        top: calc(0%);
        z-index: 1;
        background: rgb(35 35 35);
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.04);
        box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        max-height: 240px;
        overflow: hidden;
        display: none;
        flex-direction: column;
        padding: 8px;
      }
      .tags-dropdown.open { display: flex; }

      .tags-top { display:flex; gap:8px; align-items:center; padding-bottom: 6px; flex:0 0 auto; }
      .tags-list {
        overflow-y: auto;
        padding-right: 6px;
        margin-top: 4px;
      }
      /* ADD THESE LINES TO STYLE THE TAGS SCROLLBAR */
      .tags-list::-webkit-scrollbar {
        width: 6px; /* Width of the scrollbar */
      }
      .tags-list::-webkit-scrollbar-track {
        background: transparent; /* Makes the track invisible */
      }
      .tags-list::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.15); /* A semi-transparent white/grey */
        border-radius: 10px; /* Rounded corners for the thumb */
        border: 2px solid transparent; /* Creates padding around thumb */
        background-clip: content-box;
      }
      .tags-list::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.3); /* Slightly more visible on hover */
      }

      .tag-row {
        display:flex;
        gap:8px;
        align-items:center;
        padding:6px;
        border-radius:8px;
        cursor: pointer;
      }
      .tag-row:hover { background: rgba(244, 3, 3, 0.02); }
      .tag-swatch {
        width:18px; height:18px; border-radius:4px; border: 1px solid rgba(0,0,0,0.08); flex: 0 0 auto;
      }
      .tag-name { flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-weight:600; }
      .tag-tick { width:22px; text-align:center; flex:0 0 auto; font-size:14px; opacity:0.9; }

      /* chips on prompt rows */
      .tag-chips { display:flex; gap:6px; margin-left:8px; flex-wrap:nowrap; align-items:center; }
      .tag-chip {
        display:inline-flex; align-items:center; justify-content:center; padding:2px 6px; border-radius:999px; font-size:11px; font-weight:600;
        min-width: 24px; max-width: 120px; overflow:hidden; white-space:nowrap; text-overflow: ellipsis;
      }
      .tag-chip.overflow { background: rgba(255,255,255,0.04); color: var(--txt); }

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
        color: #FFD400; /* yellow icon */

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

      /* Hover glow (yellow) */
      .delete-btn:hover {
        transform: translateY(-1px);
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

      :host([data-hotspot-position="edge"]) .panel {
        right: 0;                        /* flush with right edge of the viewport */
        bottom: auto;                    /* unset bottom-based anchoring used in corner mode */
        top: 50%;                        /* put element center-line at 50% of viewport */
        transform: translateY(-50%);     /* shift up by half its own height -> vertically centered */
        border-radius: 12px 0 0 12px;    /* round only the left side for a flush-right look */
        max-height: 98vh;                /* keep inside viewport */
        min-height: 10vh;                /* keep inside viewport */
        max-width: 50vw;                /* keep inside viewport */
        min-width: 15vw;                /* keep inside viewport */

        /* keep overflow behavior the same as before */
        overflow: hidden;
      }
      .list {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 6px;
        margin-top: 6px;
        -webkit-overflow-scrolling: touch;
      }
      /* ADD THESE LINES TO STYLE THE SCROLLBAR */
      .list::-webkit-scrollbar {
        width: 6px; /* Width of the scrollbar */
      }
      .list::-webkit-scrollbar-track {
        background: transparent; /* Makes the track invisible */
      }
      .list::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.15); /* A semi-transparent white/grey */
        border-radius: 10px; /* Rounded corners for the thumb */
        border: 2px solid transparent; /* Creates padding around thumb */
        background-clip: content-box;
      }
      .list::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.3); /* Slightly more visible on hover */
      }
      .row {
        display: flex; /* <-- THIS IS THE KEY RULE FOR HORIZONTAL LAYOUT */
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.03));
        min-height: 36px;
        transition: background 120ms ease, transform 160ms ease, opacity 120ms ease;
        cursor: default; 
      }
      .row.heading-row {
        padding: 4px;
        min-height: 32px;
        display:flex;
        align-items:center;
        justify-content:space-between;
      }
      .drag-handle { cursor: grab !important; }

      /* ... hover and selected styles ... */

      /* Left group and label */
      .left { 
        display:flex; /* <-- THIS IS ALSO KEY */
        align-items:center; 
        gap:8px; 
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
      /* Tag picker styles in add/edit area */
      .add-tags .tag-select {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:4px 8px;
        border-radius:999px;
        font-size:12px;
        font-weight:600;
        cursor:pointer;
        border: 1px solid rgba(255,255,255,0.04);
        min-height:22px;
        max-width:160px;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
      }
      .add-tags .tag-select.selected {
        box-shadow: 0 6px 18px rgba(0,0,0,0.14);
        outline: 2px solid rgba(255,255,255,0.06);
      }
    .tag-row:focus, .tag-row.focused {
      outline: 2px solid rgba(143,183,255,0.18);
      border-radius: 8px;
    }

      :host([data-theme="light"]) {
        --bg: var(--silver-bg);
        --bg-b: rgba(240,242,245,0.64);
        --txt: var(--silver-txt);
        --row-hover-bg: rgba(0, 0, 0, 0.05); /* +++ ADD THIS: Subtle dark tint for light theme */
      }

      /* Dark theme fallback */
      :host(:not([data-theme="light"])) {
        --bg: linear-gradient(180deg, rgba(12,18,24,0.6), rgba(18,24,32,0.6));
        --bg-b: var(--bg-dark-b);
        --txt: #e6eef8;
        --row-hover-bg: rgba(255, 255, 255, 0.06); /* +++ ADD THIS: Subtle white glow for dark theme */
      }

/* This rule makes the text inside the row BOLD only on focus/selection.
   Your full CSS shows the text is within a ".label" element, so we target that. */
.row:focus .label,
.row.selected .label {
  font-weight: bold; /* or 700 */
}
      .row:hover,
    .row:focus,
    .row.selected {
      background-color: var(--row-hover-bg); /* Use the theme-aware variable */
      outline: none; /* Removes the default browser focus ring. */
      transform: translateY(-1px);
      cursor: pointer;
    }

    /* This rule makes the text inside the row BOLD only on focus/selection.
       Your full CSS shows the text is within a ".label" element, so we target that. */
    .row:focus .label,
    .row.selected .label {
      font-weight: bold; /* or 700 */
    }






      transform: translateY(-1px);
    cursor: pointer;


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
          <button id="tags-btn" class="ctrl-btn" title="Tags">T</button>
          <button id="settings-btn" class="ctrl-btn" title="Settings">⚙</button>
          <button id="close-btn" class="ctrl-btn" title="Close">✕</button>
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


        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
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
