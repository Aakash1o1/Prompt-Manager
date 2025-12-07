export const STYLES = `
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



