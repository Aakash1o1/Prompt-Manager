// src/content/host.ts
import { STYLES } from './styles';

export function createOrGetHost() {
  if ((window as any).__promptManagerInitialized) {
    return { host: null, shadow: null }; // Already initialized
  }
  (window as any).__promptManagerInitialized = true;

  const HOST_ID = 'prompt-drawer-host-shadow';
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (host) host.remove(); // Clean up existing if any

  host = document.createElement('div');
  host.id = HOST_ID;
  
  // Critical: Set these styles on the Host element so it sits on top 
  // without affecting the page layout flow.
  Object.assign(host.style, { 
    all: 'initial',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    zIndex: '2147483647', // Max z-index
    pointerEvents: 'none' // Let clicks pass through the container (children will re-enable)
  });
  
  // Append to documentElement (<html>) to avoid Body scroll issues
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' }); // Was 'closed'

  // FIXED: Removed the backslash before {STYLES}
  shadow.innerHTML = `
    <style>
      ${STYLES}
    </style>

    <!-- HOTSPOT -->
    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">💬</div>

    <!-- MAIN PANEL -->
    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">
      <!-- Header -->
      <div class="header">
        <div class="search"><input id="search-input" type="text" placeholder="Search (title, quick, body)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn" title="Add">＋</button>
          <button id="tags-btn" class="ctrl-btn" title="Tags">T</button>
          <button id="settings-btn" class="ctrl-btn" title="Settings">⚙</button>
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