export const STYLES = `
/* --- RESET & VARIABLES --- */
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  
  /* --- PALETTE (Deep Focus - Dark) --- */
  --bg-app: #09090b;      /* Main Background */
  --bg-panel: #18181b;    /* Cards & Modals */
  --bg-input: #27272a;    /* Form Fields */
  --bg-hover: rgba(255, 255, 255, 0.08);
  --bg-active: rgba(255, 255, 255, 0.12);
  
  --border-subtle: #27272a;
  --border-default: #3f3f46;
  --border-focus: #3b82f6;
  
  --accent: #3b82f6;      /* Primary Blue */
  --accent-hover: #2563eb;
  --accent-dim: rgba(59, 130, 246, 0.15);
  --danger: #ef4444;
  
  --txt-primary: #fafafa;
  --txt-secondary: #a1a1aa;
  --txt-muted: #52525b;
  
  --radius: 12px;
  --radius-sm: 6px;
  --radius-md: 8px;
  
  /* --- LAYOUT --- */
  --header-height: 60px;
  --footer-height: 50px;
  --popup-width: 360px;
  --popup-height: 600px;
}

/* Light Theme Override */
:host([data-theme="light"]) {
  /* --- BACKGROUNDS --- */
  --bg-app: #f4f4f5;      /* Zinc-100 (Page/Toast bg) */
  --bg-panel: #ffffff;    /* White (Card/Panel bg) */
  --bg-input: #f4f4f5;    /* Zinc-100 */
  --bg-hover: rgba(0, 0, 0, 0.04);
  --bg-active: rgba(0, 0, 0, 0.08);
  
  /* --- BORDERS --- */
  --border-subtle: #e4e4e7; /* Zinc-200 */
  --border-default: #d4d4d8; /* Zinc-300 */
  --border-focus: #3b82f6;   /* Blue-500 */
  
  /* --- ACCENTS --- */
  --accent: #2563eb;         /* Blue-600 (Darker for visibility on white) */
  --accent-hover: #1d4ed8;   /* Blue-700 */
  --accent-dim: rgba(37, 99, 235, 0.1);
  --danger: #dc2626;         /* Red-600 */
  
  /* --- TYPOGRAPHY --- */
  --txt-primary: #000000;    /* Pure Black */
  --txt-secondary: #333333;  /* Dark Gray */
  --txt-muted: #a1a1aa;      /* Zinc-400 */
}

/* --- GLOBAL SCROLLBAR HIDING --- */
* {
  font-family: inherit;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
*::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* --- FORM ELEMENT BOX-SIZING --- */
input, textarea, select {
  box-sizing: border-box;
}

/* --- GLOBAL ELEMENTS --- */
button {
  cursor: pointer;
}

/* --- MAIN PANEL --- */
.panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: var(--popup-width);
  height: var(--popup-height);
  background-color: var(--bg-panel);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px -5px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 14px;
  
  /* Animation */
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  pointer-events: auto;
  z-index: 2147483647;
  transition: transform 0.2s;
}
.hotzone:hover { transform: scale(1.1); border-color: var(--accent); }

:host([data-hotspot-position="edge"]) .hotzone {
  right: 0;
  top: 50%;
  width: 8px;
  height: var(--popup-height);
  border-radius: 4px 0 0 4px;
  transform: translateY(-50%);
  font-size: 0; /* Hide chat icon in edge mode */
}

:host([data-hotspot-position="edge"]) .panel {
  bottom: auto;
  top: 50%;
  right: 12px;
  transform: translateY(-50%) translateY(10px) scale(0.98);
}

:host([data-hotspot-position="edge"]) .panel.open {
  transform: translateY(-50%) translateY(0) scale(1);
}

/* --- LAYOUT AREAS --- */
.header {
  height: var(--header-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.list::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.footer {
  height: var(--footer-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-panel);
  flex-shrink: 0;
}

/* --- SEARCH BAR --- */
.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  transition: background 0.2s;
}
.search-wrapper:focus-within {
  background: rgba(255,255,255,0.06);
}

.search-icon {
  color: var(--txt-secondary);
  width: 16px; height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 36px;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: var(--txt-primary) !important;
  font-size: 14px !important;
  padding: 0 !important;
  box-shadow: none !important;
}

/* --- EDITOR TEXTAREA --- */
textarea#input-body {
  font-size: 10px !important;
  line-height: 1.4 !important;
}

/* --- LIST ROWS --- */
.row, .folder-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--txt-secondary);
  transition: background 0.1s;
  position: relative;
}

.row:hover, .folder-row:hover {
  background-color: var(--bg-hover);
  color: var(--txt-primary);
}

.row.selected, .folder-row.selected {
  background-color: var(--accent-dim);
  color: var(--txt-primary);
}

.folder-left {
  display: flex; align-items: center; gap: 8px; flex: 1; font-weight: 600; color: var(--txt-primary);
}
.prompt-left {
  display: flex; align-items: center; flex: 1; min-width: 0;
}

.folder-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.folder-row.expanded .chevron { transform: rotate(90deg); }

.shortcut-badge {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--txt-secondary);
  margin-left: 8px;
}

/* --- EDIT BUTTONS (On Hover) --- */
.row-actions {
  display: none;
  margin-left: auto;
  gap: 8px;
}
.row:hover .row-actions, .folder-row:hover .row-actions {
  display: flex;
}
.action-btn {
  padding: 4px;
  border-radius: 4px;
  color: var(--txt-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
}
.action-btn:hover { background: var(--bg-active); color: var(--txt-primary); }

/* --- SETTINGS TOGGLES --- */
.toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 12px;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: rgba(255,255,255,0.1);
  border-radius: 99px;
  transition: background-color 0.2s;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.toggle-checkbox:checked + .toggle-switch {
  background-color: var(--accent);
}

.toggle-checkbox:checked + .toggle-switch .toggle-slider {
  transform: translateX(18px);
}

/* --- BUTTONS --- */
.footer-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.footer-btn:hover { background: var(--bg-hover); color: var(--txt-primary); }
.footer-btn.primary { color: var(--txt-primary); font-weight: 600; }

/* --- STANDARD BUTTONS --- */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--txt-primary);
}

/* --- MODALS & OVERLAYS --- */
.overlay-area {
  position: absolute; 
  inset: 0;
  background: var(--bg-panel);
  z-index: 50;
  display: none;
  flex-direction: column;
  /* FIX: Disable scrolling on the container itself to prevent "wiggle" */
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.overlay-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.overlay-area.open { display: flex; }

/* --- TABS (Editor) --- */
.tab-container {
  display: flex;
  background: var(--bg-input);
  padding: 2px;
  border-radius: 99px;
  width: fit-content;
}

.tab-btn {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  color: var(--txt-muted);
  text-transform: uppercase;
  cursor: pointer;
  background: transparent;
  border: none;
}

.tab-btn.active {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* --- SEGMENTED CONTROL (Settings) --- */
.segmented-control {
  display: flex;
  background: var(--bg-input);
  padding: 2px;
  border-radius: var(--radius-sm);
  gap: 2px;
}

.segment-btn {
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  justify-content: center;
  color: var(--txt-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
}

.segment-btn.active {
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 600;
}

/* Row Layout for Settings */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-row label {
  font-weight: 500;
}

/* --- TAG DROPDOWN --- */
#tags-dropdown {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 220px;
  background: var(--bg-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 100;
  display: none;
  flex-direction: column;
  overflow: hidden;
}
#tags-dropdown.open { display: flex; }

.tags-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-app);
}

#tags-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.tag-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  cursor: pointer;
  transition: background 0.1s;
}
.tag-row:hover { background: var(--bg-hover); }

.tag-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-tick {
  color: var(--accent);
  font-weight: bold;
  font-size: 14px;
}

.delete-icon-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--txt-muted);
  border-radius: 4px;
  cursor: pointer;
}
.delete-icon-btn:hover {
  background: var(--bg-active);
  color: var(--danger);
}
.delete-icon-btn svg { width: 14px; height: 14px; fill: currentColor; }

/* New Tag Form */
.new-tag-form {
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-input);
}

.new-tag-form-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.new-tag-form-row input[type="text"] {
  flex: 1;
  background: var(--bg-panel);
  border: 1px solid var(--border-default);
  color: var(--txt-primary);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.new-tag-form-row input[type="color"] {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.new-tag-form-buttons {
  display: flex;
  justify-content: flex-end;
}

/* --- UTILS --- */
.toast {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-app);
    border: 1px solid var(--border-subtle);
    color: var(--txt-primary);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
}
.toast.show { opacity: 1; }
`;
