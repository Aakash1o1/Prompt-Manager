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

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      ${STYLES}
    </style>

    <div class="hotzone" id="hotzone" title="Open">💬</div>

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
      <div id="export-area" class="overlay-area"></div>
      <div id="import-area" class="overlay-area"></div>

      <!-- 5. UTILS -->
      <div class="toast" id="toast"></div>
      
      <!-- REMOVED: Tags Dropdown HTML -->
    </div>
  `;

  return { host, shadow };
}