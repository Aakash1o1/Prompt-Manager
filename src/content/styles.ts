// src/content/styles.ts
export const STYLES = `
/* --- VARIABLES --- */
:host {
  all: initial;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--txt-primary);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  
  /* --- BACKGROUNDS --- */
  --bg-app: #0f1117;       /* Main container background (Deepest Blue-Grey) */
  --bg-panel: #161b22;     /* Sidebar / Modals (Slightly lighter) */
  --bg-input: #0d1117;     /* Input fields (Darker for depth) */
  --bg-hover: rgba(56, 139, 253, 0.1); /* Subtle Blue tint on hover */
  --bg-active: rgba(56, 139, 253, 0.2); /* Stronger Blue tint when selected */
  
  /* --- BORDERS --- */
  --border-subtle: #21262d; /* Very subtle dividers */
  --border-default: #30363d; /* Standard borders */
  --border-focus: #58a6ff;   /* Bright Blue focus ring */
  
  /* --- ACCENTS --- */
  --accent: #2f81f7;       /* Primary Action Blue (Vibrant but readable) */
  --accent-hover: #58a6ff; /* Lighter Blue for hover states */
  --accent-dim: rgba(47, 129, 247, 0.15); /* Low opacity accent for backgrounds */
  --danger: #da3633;       /* Muted Red for delete actions */
  
  /* --- TYPOGRAPHY --- */
  --txt-primary: #ffffff;  /* Pure White */
  --txt-secondary: #8b949e; /* Cool Grey (Good for labels) */
  --txt-muted: #484f58;    /* Dark Grey (For placeholders/disabled) */
  
  /* --- DIMENSIONS --- */
  --modal-width: 800px;
  --modal-height: 600px;
  --sidebar-width: 260px;
  
  /* --- DYNAMIC SETTINGS --- */
  --font-size: 13px; /* Default, updated by App.ts */
  
  /* --- Z-INDEX --- */
  --z-max: 2147483647;
}

/* --- RESET & BASE --- */
* {
  box-sizing: border-box;
  scrollbar-width: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 600;
  color: inherit;
}
*::-webkit-scrollbar {
  display: none;
}

/* Hide number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/* --- BACKDROP --- */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: var(--z-max);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

/* --- MODAL CONTAINER --- */
.modal {
  width: var(--modal-width);
  height: var(--modal-height);
  background: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 
    0 0 0 1px rgba(0,0,0,0.5),
    0 20px 50px -12px rgba(0,0,0,0.8);
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr; /* Split View */
  overflow: hidden;
  
  /* Animation */
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.backdrop.open .modal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* --- LAYOUT COLUMNS --- */
.sidebar {
  background: var(--bg-panel);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative; /* FIX 1: Establishes coordinate system for dropdown */
}

.workspace {
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* --- SIDEBAR COMPONENTS --- */
.sb-header {
  height: 50px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  gap: 8px;
  flex-shrink: 0;
}

.sb-search-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  color: var(--txt-muted);
}

.sb-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  font-size: var(--font-size); /* FIX 2: Dynamic Font */
  padding: 6px 0 6px 24px;
  outline: none;
}
.sb-search-input::placeholder { color: var(--txt-muted); }

.sb-search-icon {
  position: absolute;
  left: 0;
  pointer-events: none;
}

.sb-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--txt-primary);
  font-size: var(--font-size); /* FIX 2 */
  user-select: none;
  position: relative;
  transition: background 0.1s;
}
.tree-row:hover { background: var(--bg-hover); color: var(--txt-primary); }
.tree-row.active { background: var(--bg-active); color: var(--txt-primary); box-shadow: inset 3px 0 0 var(--accent); }

.row-indent { width: 16px; flex-shrink: 0; }
.row-icon { width: 16px; margin-right: 8px; display: flex; align-items: center; color: var(--txt-muted); }
.tree-row:hover .row-icon { color: var(--txt-secondary); }

.row-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-shortcut {
  font-size: 11px;
  color: var(--txt-muted);
  margin-left: 8px;
  margin-right: 4px;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

/* Kebab & Actions */
.row-actions { display: none; margin-left: auto; gap: 4px; }
.tree-row:hover .row-actions { display: flex; }

.icon-btn {
  padding: 6px;
  border-radius: 6px;
  color: var(--txt-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-btn:hover { 
  background: var(--bg-hover); 
  color: var(--txt-primary);
  transform: translateY(-1px);
}
.icon-btn:active {
  transform: translateY(0);
}

button {
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sb-footer {
  height: 48px;
  border-top: 1px solid var(--border-subtle);
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

/* --- BUTTONS --- */
.btn-new {
  background: linear-gradient(180deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
}
.btn-new:hover { 
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.btn-primary:hover { 
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-secondary:hover { 
  background: var(--bg-active);
  border-color: var(--border-default);
}

.btn-ghost {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-ghost:hover { 
  background: var(--bg-hover);
  color: var(--txt-primary);
}

.btn-small {
  padding: 4px 10px;
  font-size: 11px;
}

/* --- MAGIC DROPDOWN --- */
.magic-dropdown {
  position: absolute;
  top: 46px; /* FIX 3: Align nicely under header */
  right: 8px; /* FIX 3: 8px padding from sidebar edge */
  width: 200px;
  background: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 100;
  display: none;
  flex-direction: column;
  padding: 4px;
}
.magic-dropdown.open { display: flex; }

.magic-item {
  padding: 8px 12px;
  font-size: var(--font-size); /* FIX 2 */
  color: var(--txt-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.magic-item:hover { background: var(--bg-hover); color: var(--txt-primary); }

/* --- WORKSPACE EDITOR --- */
.ws-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.ws-title-input {
  background: transparent;
  border: none;
  font-size: calc(var(--font-size) + 6px); /* FIX 2: Relative scaling */
  font-weight: 700;
  color: var(--txt-primary);
  width: 100%;
  outline: none;
}
.ws-title-input::placeholder { color: var(--txt-muted); opacity: 0.5; }

.ws-meta-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ws-input {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: var(--font-size); /* FIX 2 */
  outline: none;
  transition: border-color 0.2s;
}
.ws-input:focus { border-color: var(--accent); color: var(--txt-primary); }

.ws-select {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: var(--font-size); /* FIX 2 */
  outline: none;
  cursor: pointer;
  max-width: 200px;
}

.ws-editor-body {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  padding: 24px;
  font-family: inherit;
  font-size: var(--font-size); /* FIX 2 */
  line-height: 1.6;
  outline: none;
  resize: none;
}

.ws-footer {
  height: 60px;
  padding: 0 24px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end; 
  gap: 12px;
  flex-shrink: 0;
  background: var(--bg-app);
}

.ws-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--txt-muted);
  gap: 16px;
}

/* --- CONTROL PANEL --- */
.cp-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.cp-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--txt-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.cp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-hover);
}

.cp-label { font-size: 14px; color: var(--txt-primary); }
.cp-desc { font-size: 12px; color: var(--txt-muted); margin-top: 2px; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--bg-hover);
  border-radius: 99px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid var(--border-subtle);
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
input:checked + .toggle-switch { background-color: var(--accent); border-color: var(--accent); }
input:checked + .toggle-switch::after { transform: translateX(20px); }

/* Import/Export Cards */
.backup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.backup-card {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.backup-card:hover { border-color: var(--accent); background: var(--bg-active); }
.backup-icon { font-size: 24px; }
.backup-title { font-weight: 600; font-size: 14px; }

/* --- MOVE MODE --- */
.sidebar.mode-move .sb-header {
  background: var(--bg-active);
  border-bottom-color: var(--accent);
}

.sidebar.mode-move .tree-row[data-type="prompt"] {
  opacity: 0.3;
  pointer-events: none; /* Disable clicking prompts in move mode */
}

.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.1); /* Light blue hover */
  color: var(--accent);
}

.sidebar.mode-move .tree-row.destination {
  background: var(--accent);
  color: white;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white;
}

/* Hide standard controls in move mode */
.sidebar.mode-move .sb-search-wrapper,
.sidebar.mode-move #btn-magic,
.sidebar.mode-move #btn-settings,
.sidebar.mode-move #btn-new-root {
  display: none !important;
}

/* Show move controls (hidden by default) */
.sb-move-title { display: none; font-weight: 600; font-size: 13px; color: var(--txt-primary); }
.sidebar.mode-move .sb-move-title { display: block; }

.sb-move-actions { display: none; gap: 8px; width: 100%; justify-content: flex-end; }
.sidebar.mode-move .sb-move-actions { display: flex; }

.btn-small {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}
.btn-secondary { background: var(--bg-hover); color: var(--txt-primary); }
.btn-secondary:hover { background: var(--border-default); }

/* --- TOAST --- */
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-panel);
    border: 1px solid var(--border-default);
    color: var(--txt-primary);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    width: max-content;
    max-width: 300px;
    text-align: center;
}
.toast.show { opacity: 1; }

/* --- RESIZE HANDLES --- */
.resize-handle {
  position: absolute;
  z-index: 100;
  opacity: 0; /* Invisible but clickable */
}
.resize-handle:hover { background: rgba(59,130,246,0.3); opacity: 1; }

.resize-handle.e, .resize-handle.w { width: 8px; height: 100%; top: 0; cursor: ew-resize; }
.resize-handle.n, .resize-handle.s { height: 8px; width: 100%; left: 0; cursor: ns-resize; }

.resize-handle.e { right: -4px; }
.resize-handle.w { left: -4px; }
.resize-handle.n { top: -4px; }
.resize-handle.s { bottom: -4px; }

.resize-handle.se { width: 16px; height: 16px; bottom: -8px; right: -8px; cursor: nwse-resize; z-index: 101; }
.resize-handle.sw { width: 16px; height: 16px; bottom: -8px; left: -8px; cursor: nesw-resize; z-index: 101; }
.resize-handle.ne { width: 16px; height: 16px; top: -8px; right: -8px; cursor: nesw-resize; z-index: 101; }
.resize-handle.nw { width: 16px; height: 16px; top: -8px; left: -8px; cursor: nwse-resize; z-index: 101; }

/* --- UNCATEGORIZED GROUP --- */
.uncategorized-header {
  padding: 12px 12px 4px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--txt-muted);
  margin-top: 8px;
  border-top: 1px solid var(--bg-hover);
  user-select: none;
}

/* Move Mode: Uncategorized acts as a target */
.sidebar.mode-move .uncategorized-header {
  cursor: pointer;
  border: 1px dashed var(--border-default);
  margin: 8px;
  border-radius: 6px;
  text-align: center;
  padding: 8px;
  background: rgba(59, 130, 246, 0.05);
}
.sidebar.mode-move .uncategorized-header:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}
.sidebar.mode-move .uncategorized-header.selected {
  background: var(--accent);
  color: white;
  border-style: solid;
}

/* --- UPDATED MOVE MODE COLORS --- */
/* 1. All valid folders get Light Blue */
.sidebar.mode-move .tree-row[data-type="folder"] {
  background: rgba(59, 130, 246, 0.1); /* Light Blue */
  color: var(--txt-primary);
  margin-bottom: 1px;
}

/* 2. Hover effect */
.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.2); 
}

/* 3. Selected Target gets Dark Blue */
.sidebar.mode-move .tree-row.destination {
  background: var(--accent) !important;
  color: white !important;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white !important;
}

/* --- IMPORT/EXPORT MODES --- */
.sb-selection-toggles {
  font-size: 11px;
  color: var(--txt-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-select-all-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.sb-select-all-label:hover {
  color: var(--txt-primary);
}

.sb-checkbox {
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--accent);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
.status-dot.green { background: #10b981; }
.status-dot.red { background: var(--danger); box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
.status-dot.amber { background: #f59e0b; }

/* Export mode: selected rows */
.sidebar.mode-export .tree-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

/* Show mode titles/actions in export/import */
.sidebar.mode-export .sb-move-title,
.sidebar.mode-import .sb-move-title { display: block; }
.sidebar.mode-export .sb-move-actions,
.sidebar.mode-import .sb-move-actions { display: flex; }
.sidebar.mode-export .sb-search-wrapper,
.sidebar.mode-export #btn-magic,
.sidebar.mode-export #btn-settings,
.sidebar.mode-export #btn-new-root,
.sidebar.mode-import .sb-search-wrapper,
.sidebar.mode-import #btn-magic,
.sidebar.mode-import #btn-settings,
.sidebar.mode-import #btn-new-root { display: none !important; }

/* --- WORKSPACE CODE BLOCK --- */
.ws-code-block {
  background: var(--bg-hover);
  padding: 16px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--txt-secondary);
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  border: 1px solid var(--border-subtle);
}

/* --- WORKSPACE INPUT VALIDATION --- */
.ws-input.error, .ws-title-input.error {
  border-color: var(--danger) !important;
  background: rgba(239, 68, 68, 0.05);
}
.ws-input.success, .ws-title-input.success {
  border-color: #10b981 !important;
}
.validation-msg {
  font-size: 11px;
  margin-top: 4px;
  margin-left: 2px;
  display: block;
}
.validation-msg.error { color: var(--danger); }
.validation-msg.warning { color: #f59e0b; }

/* Read-only inputs for Preview */
.ws-title-input:read-only,
.ws-input:read-only,
.ws-editor-body:read-only {
  cursor: default;
  opacity: 0.8;
}
.ws-editor-body:read-only { user-select: text; }

/* --- WORKSPACE CONFLICT/SAFE BOXES --- */
.conflict-box {
  border: 1px solid var(--danger);
  background: rgba(239, 68, 68, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.conflict-title {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.safe-box {
  border: 1px solid #10b981;
  background: rgba(16, 185, 129, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.safe-title {
  color: #10b981;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

@keyframes pulse-yellow {
    0% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(242, 204, 96, 0); }
    100% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0); }
}

.tutorial-highlight {
    outline: 2px solid #f2cc60 !important;
    outline-offset: 2px;
    animation: pulse-yellow 2s infinite !important;
    z-index: 999999 !important; /* Ensure it stays above everything */
}

/* Specific fix for inputs where box-shadow might be clipped */
input.tutorial-highlight, textarea.tutorial-highlight, [contenteditable].tutorial-highlight {
    border-color: #f2cc60 !important;
}

/* --- TUTORIAL LAYOUT --- */
.tutorial-grid {
    display: grid;
    grid-template-columns: 200px 300px 1fr;
    height: 100vh;
    width: 100vw;
    background: #0f1117;
    color: white;
}

.panel-nav { background: #101012; border-right: 1px solid #21262d; padding: 20px; }
.panel-instr { background: #161b22; border-right: 1px solid #21262d; padding: 20px; display: flex; flex-direction: column; gap: 15px; color: white; }
.panel-demo { display: flex; flex-direction: column; background: #0f1117; position: relative; }

/* Panel 1: Modules */
.mod-btn {
    width: 100%; text-align: left; padding: 12px; margin-bottom: 8px;
    background: transparent; border: 1px solid #30363d;
    color: #8b949e; border-radius: 8px; cursor: pointer; font-size: 13px;
    font-weight: 600;
}
.mod-btn.active { background: #2f81f7; color: white; border-color: #2f81f7; }

/* Panel 2: Instructions */
.step-item { border-radius: 8px; overflow: hidden; border: 1px solid #30363d; opacity: 0.5; transition: opacity 0.3s; }
.step-item.active { opacity: 1; border-color: #e3b341; }
.step-item.completed { opacity: 0.8; border-color: #238636; }

.step-header { 
    padding: 12px; font-weight: 600; font-size: 13px; display: flex; gap: 10px; align-items: center;
}
.step-item.active .step-header { background: #e3b341; color: #000; }
.step-item.completed .step-header { background: #238636; color: white; }

.step-content { padding: 12px; font-size: 12px; line-height: 1.5; color: #ffffff; background: #0d1117; }

/* Panel 3: Demo Area */
#demo-stage { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end; gap: 15px; overflow-y: auto; }
.chat-bubble { padding: 12px 16px; border-radius: 12px; max-width: 70%; font-size: 14px; line-height: 1.4; }
.chat-bubble.bot { background: #161b22; border: 1px solid #30363d; align-self: flex-start; color: #c9d1d9; }

.demo-input-area { padding: 20px 40px 40px 40px; border-top: 1px solid #21262d; }
#mock-chat-input {
    background: #0d1117; border: 2px solid #30363d; padding: 16px; border-radius: 12px;
    color: white; outline: none; min-height: 20px; font-size: 15px; transition: border-color 0.2s;
}
#mock-chat-input:focus { border-color: #2f81f7; box-shadow: 0 0 0 4px rgba(47, 129, 247, 0.1); }
#mock-chat-input[contenteditable]:empty:before { content: "Type a shortcut here..."; color: #484f58; }

/* Tutorial Page Override: Fix positioning and remove blur */
:host([data-mode="tutorial"]) {
    --modal-width: 650px; /* Reduced from 800px */
    --modal-height: 500px; /* Reduced from 600px */
}

:host([data-mode="tutorial"]) .backdrop {
    justify-content: flex-end !important;
    padding-right: 20px;
    background: transparent !important; /* Fully transparent backdrop */
    backdrop-filter: none !important;
    pointer-events: none !important; 
    visibility: hidden; /* Completely hide from accessibility/interaction */
}

/* When open, backdrop allows clicking to close, but we use 'modal' for interaction */
:host([data-mode="tutorial"]) .backdrop.open {
    pointer-events: auto !important;
    visibility: visible;
}

:host([data-mode="tutorial"]) .modal {
    /* CRITICAL: Modal must not capture events unless its parent is open */
    pointer-events: none; 
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    margin-right: 0;
}

:host([data-mode="tutorial"]) .backdrop.open .modal {
    pointer-events: auto;
}

/* Tutorial Page Navigation Collapse */
.panel-nav.collapsed {
    width: 60px !important;
    padding: 24px 8px !important;
}
.panel-nav.collapsed .mod-btn span { display: none; }
.panel-nav.collapsed h3, .panel-nav.collapsed div { display: none; }
`;
