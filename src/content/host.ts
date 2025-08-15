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

  const shadow = host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      :host { --popup-width: 360px; --popup-height: 50vh; --font-family: 'Inter', system-ui; --bg-a: #1f2d4a; --bg-b: #274a8f; --txt: #eaf4ff; --hotspot-color: #cfeeff; --hotspot-width: 28px; }
      :host([data-theme="light"]) { --bg-a: #ffffff; --bg-b: #f3f6fb; --txt: #111827; --hotspot-color: #cfeeff; }
      .hotzone { position: fixed; right: 10px; bottom: 10px; width: 48px; height: 48px; background: var(--hotspot-color); border-radius: 10px; display:flex; align-items:center; justify-content:center; z-index:2147483650; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,0.2); user-select:none; font-size:18px; color:#05314f; }
      :host([data-hotspot-position="edge"]) .hotzone { right:0; width: var(--hotspot-width); height: var(--popup-height); top: calc(50% - (var(--popup-height) / 2)); border-radius:0; display:flex; align-items:center; justify-content:center; writing-mode: vertical-rl; }
      .panel { position: fixed; right: 12px; bottom: 72px; width: var(--popup-width); height: var(--popup-height); z-index:2147483651; border-radius: 10px; box-shadow: 0 14px 44px rgba(0,0,0,0.36); overflow: hidden; display:none; flex-direction:column; font-family: var(--font-family); color: var(--txt); background: linear-gradient(180deg, var(--bg-a), var(--bg-b)); border: 1px solid rgba(255,255,255,0.04); padding:10px; box-sizing:border-box; resize: both; }
      .panel.open { display:flex; }
      .header { display:flex; align-items:center; gap:8px; padding:6px; flex: 0 0 auto; }
      .title { font-weight:700; font-size:14px; color:var(--txt); flex: 0 0 auto; }
      .search { flex:1; min-width:0; }
      .search input { width:100%; padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:var(--txt); }
      .controls { display:flex; gap:6px; flex:0 0 auto; }
      .ctrl-btn { background: transparent; border: 1px solid rgba(255,255,255,0.06); border-radius:8px; padding:6px 8px; color:var(--txt); cursor:pointer; }
      .list { flex:1 1 auto; overflow-y:auto; padding:6px; margin-top:6px; -webkit-overflow-scrolling: touch; }
      .row { display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.02); margin-bottom:8px; min-height:34px; transition: transform 160ms ease, opacity 120ms ease; }
      .row.heading-row { min-height:26px; }
      .dragging { opacity:0.55; transform: scale(0.98); }
      .left { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
      .drag-handle { width:20px; height:20px; display:flex; align-items:center; justify-content:center; border-radius:6px; background: rgba(255,255,255,0.03); cursor:grab; }
      .label { flex:1; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--txt); }
      .icons { display:flex; gap:6px; }
      .icon-btn { background: rgba(255,255,255,0.03); border: none; color: var(--txt); width:32px; height:32px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
      .placeholder { height:12px; margin:6px 0; border-radius:6px; background: rgba(255,255,255,0.06); transition: height 120ms ease; }
      .add-area { margin-top:8px; display:none; flex-direction:column; gap:8px; }
      .add-area.open { display:flex; }
      input[type="text"], textarea { width:100%; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:var(--txt); box-sizing:border-box; }
      textarea { min-height:110px; resize: vertical; }
      .settings-area { margin-top:8px; display:none; flex-direction:column; gap:8px; }
      .settings-area.open { display:flex; }
      .settings-row { display:flex; gap:8px; align-items:center; }
      .settings-row label { width:140px; color:var(--txt); font-size:13px; }
      .toast { position:absolute; left:50%; transform:translateX(-50%); bottom:12px; background: rgba(0,0,0,0.65); color:#fff; padding:8px 12px; border-radius:8px; font-size:13px; opacity:0; transition:opacity .18s; }
      .toast.show { opacity:1; }
      .resize-handle { position: absolute; background: transparent; z-index:2147483652; }
      .panel::-webkit-scrollbar { display: none; }

      /* NEW: selected row highlight */
      .row.selected {
        background: rgba(255,255,255,0.07);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        transform: none;
      }
    </style>

    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">💬</div>

    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">
      <div class="header">
        <div class="search"><input id="search-input" type="text" placeholder="Search prompts or quick code (e.g. ../)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn">Add</button>
          <button id="settings-btn" class="ctrl-btn">Settings</button>
          <button id="close-btn" class="ctrl-btn">✕</button>
        </div>
      </div>

      <div class="list" id="list" role="list"></div>

      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (e.g. ../ or pp)" />
        <textarea id="input-body" placeholder="Full prompt text"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="cancel-btn" class="ctrl-btn">Cancel</button>
          <button id="save-btn" class="ctrl-btn">Save</button>
        </div>
      </div>

      <div class="settings-area" id="settings-area" aria-hidden="true">
        <div class="settings-row"><label>Popup height (vh)</label><input id="s-popup-height" type="number" min="20" max="100" /></div>
        <div class="settings-row"><label>Popup width (px)</label><input id="s-popup-width" type="number" min="200" max="1000" /></div>
        <div class="settings-row"><label>Font family</label><input id="s-font-family" type="text" /></div>
        <div class="settings-row"><label>Theme</label>
          <select id="s-theme"><option value="dark">Dark</option><option value="light">Light</option></select>
        </div>
        <div class="settings-row"><label>Hotspot position</label>
          <select id="s-hotspot-pos"><option value="corner">Corner</option><option value="edge">Right edge</option></select>
        </div>
        <div class="settings-row"><label>Hotspot width (px)</label><input id="s-hotspot-width" type="number" min="12" max="120" /></div>
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
