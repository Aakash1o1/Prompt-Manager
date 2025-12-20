Objective
We are resetting the styling and HTML structure to match the new "Deep Focus" design.
Styles: Implement the opaque dark theme, remove tag-related styles, and set up the footer layout variables.
Host HTML: Refactor the main container to support the Header/Content/Footer stack.
Files to Modify
src/content/styles.ts
src/content/host.ts
Task 1: Rewrite Styles
File: src/content/styles.ts
Replace everything in this file. We are switching to the new color palette and layout model.
code
TypeScript
export const STYLES = `
/* --- RESET & VARIABLES --- */
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  /* --- PALETTE --- */
  --bg-main: #18181b;     /* Deepest Dark */
  --bg-panel: #1e1e2e;    /* Component Background */
  --bg-input: #27273a;    /* Input Fields */
  --bg-hover: rgba(255, 255, 255, 0.05);
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: #3b82f6;
  
  --accent: #3b82f6;      /* Primary Blue */
  --accent-hover: #2563eb;
  
  --txt-primary: #ffffff;
  --txt-secondary: #a1a1aa;
  
  --radius: 12px;
  --radius-sm: 8px;
  
  /* --- LAYOUT --- */
  --header-height: 64px;
  --footer-height: 56px;
  --popup-width: 340px;
  --popup-height: 600px;
}

/* Light Theme Override (Placeholder for now) */
:host([data-theme="light"]) {
  --bg-main: #ffffff;
  --bg-panel: #f4f4f5;
  --bg-input: #ffffff;
  --bg-hover: #f4f4f5;
  --border-subtle: #e4e4e7;
  --txt-primary: #18181b;
  --txt-secondary: #71717a;
}

/* --- SCROLLBAR --- */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}

/* --- MAIN PANEL --- */
.panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: var(--popup-width);
  height: var(--popup-height);
  max-height: 85vh;
  
  background-color: var(--bg-panel);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px -5px rgba(0,0,0,0.4);
  
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* Animation */
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  font-size: 14px;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  pointer-events: auto;
  z-index: 1000000;
  transition: transform 0.2s, border-color 0.2s;
}
.hotzone:hover { 
    transform: scale(1.05); 
    border-color: var(--accent);
}

:host([data-hotspot-position="edge"]) .hotzone {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 120px;
  border-radius: 4px 0 0 4px;
  background: var(--bg-panel);
}

/* --- LAYOUT CONTAINERS --- */
.header {
  height: var(--header-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent; /* Keeps layout stable */
  flex-shrink: 0;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
}

.footer {
  height: var(--footer-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-panel); /* Opaque */
  flex-shrink: 0;
  font-size: 13px;
  color: var(--txt-secondary);
}

/* --- COMMON ELEMENTS --- */
button { 
    background: transparent; 
    border: none; 
    color: inherit; 
    cursor: pointer; 
    font-family: inherit;
    font-size: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* Footer Buttons */
.footer-btn {
    padding: 6px 10px;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;
}
.footer-btn:hover {
    background: var(--bg-hover);
    color: var(--txt-primary);
}
.footer-btn.primary {
    color: var(--txt-primary);
    font-weight: 600;
}

/* Overlays */
.overlay-area {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-panel);
  z-index: 10;
  display: none;
  flex-direction: column;
}
.overlay-area.open { display: flex; }

/* UTILS */
.toast {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-main);
    border: 1px solid var(--border-subtle);
    color: var(--txt-primary);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
}
.toast.show { opacity: 1; }
`;
Task 2: Update Host Structure
File: src/content/host.ts
We are restructuring the HTML to match the new requirement:
Header: Search only.
Footer: Settings | Copy (Left) and New (Right).
Removed: Tags dropdown logic from HTML.
code
TypeScript
// [UPDATE] src/content/host.ts

export function createOrGetHost() {
  // ... existing check logic ...
  // ... existing host creation logic ...
  // ... Keep Object.assign(host.style, ...) as it was in the fix (100vw/100vh, block, pointerEvents: none)

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
         <div style="display: flex; gap: 4px;">
            <button id="settings-btn" class="footer-btn">
               <span>⚙ Settings</span>
            </button>
            <div style="width: 1px; height: 16px; background: var(--border-subtle); margin: 0 4px;"></div>
            <button id="copy-btn" class="footer-btn">
               <span>↵ Copy</span>
            </button>
         </div>

         <!-- Right Side -->
         <div>
            <button id="new-btn" class="footer-btn primary">
               <span>+ New</span>
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
