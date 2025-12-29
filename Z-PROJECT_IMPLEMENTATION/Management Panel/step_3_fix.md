Step 4_Fix: Styling & Settings Application
Objective:
Fix Sidebar positioning context so the dropdown stays inside the sidebar.
Refactor CSS to use var(--font-size) instead of hardcoded pixels.
Update App.ts to listen to settings changes and apply the font size dynamically.
Files to Modify:
src/content/styles.ts (Add position: relative, use CSS vars)
src/content/components/App.ts (Apply settings to DOM)
Tasks:
1. Update Styles (src/content/styles.ts)
Replace the entire file content with this updated version.
Changes: Added position: relative to .sidebar. Added --font-size variable. Applied variable to tree rows, inputs, and editor. Adjusted Dropdown top.
code
TypeScript
// src/content/styles.ts
export const STYLES = `
/* --- VARIABLES --- */
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  
  /* --- PALETTE (Zinc Dark Mode) --- */
  --bg-app: #09090b;       /* Zinc-950: Main Modal Background */
  --bg-sidebar: #18181b;   /* Zinc-900: Sidebar Background */
  --bg-hover: #27272a;     /* Zinc-800: Hover States */
  --bg-active: #27272a;    /* Zinc-800: Active Selection */
  
  --border-subtle: #27272a; /* Zinc-800 */
  --border-default: #3f3f46; /* Zinc-700 */
  
  --accent: #3b82f6;       /* Blue-500 */
  --danger: #ef4444;       /* Red-500 */
  
  --txt-primary: #fafafa;  /* Zinc-50 */
  --txt-secondary: #a1a1aa; /* Zinc-400 */
  --txt-muted: #52525b;    /* Zinc-600 */
  
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
}
*::-webkit-scrollbar {
  display: none;
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
  background: var(--bg-sidebar);
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
  color: var(--txt-secondary);
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

/* Kebab & Actions */
.row-actions { display: none; margin-left: auto; gap: 4px; }
.tree-row:hover .row-actions { display: flex; }

.icon-btn {
  padding: 4px;
  border-radius: 4px;
  color: var(--txt-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--txt-primary); }

.sb-footer {
  height: 48px;
  border-top: 1px solid var(--border-subtle);
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.btn-new {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-new:hover { filter: brightness(1.1); }

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
  font-family: 'JetBrains Mono', Consolas, monospace;
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
  color: var(--txt-muted);
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

/* --- TOAST --- */
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-sidebar);
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
`;
2. Update App.ts (src/content/components/App.ts)
Implement applySettings to push the font size to the DOM.
code
TypeScript
// src/content/components/App.ts
import { Component } from './Component';
import { Store } from '../store';
import { TextExpander } from './TextExpander'; 
import { Sidebar } from './Sidebar'; 
import { Workspace } from './Workspace'; 

export class App extends Component {
    private backdrop: HTMLElement | null = null;
    private modal: HTMLElement | null = null;
    private toastEl: HTMLElement | null = null;
    private toastTimer: number | null = null;

    private host: HTMLElement;
    private sidebar: Sidebar;
    private workspace: Workspace;

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        this.host = host;
        this.sidebar = new Sidebar(store, shadow);
        this.workspace = new Workspace(store, shadow);
    }

    mount(parent: HTMLElement) { 
        this.backdrop = this.shadow.getElementById('backdrop');
        this.modal = this.shadow.getElementById('modal');
        this.toastEl = this.shadow.getElementById('toast');

        if (!this.backdrop || !this.modal) return;

        this.setupListeners();
        this.applySettings(); // APPLY ON LOAD

        this.sidebar.mount(this.modal);
        this.workspace.mount(this.modal); 

        console.log('App: Components Mounted.');
    }

    // NEW: Apply Store Settings to CSS Variables
    private applySettings() {
        const s = this.store.settings;
        // Apply Font Size
        this.host.style.setProperty('--font-size', `${s.fontSizePx || 13}px`);
        
        // Future: Apply Theme here if using attribute-based theme switching
        // this.host.setAttribute('data-theme', s.theme || 'dark');
    }

    private setupListeners() {
        this.backdrop?.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && this.backdrop?.classList.contains('open')) {
                ev.preventDefault();
                this.close();
            }
        });
        this.shadow.addEventListener('show-toast', ((e: CustomEvent) => {
            this.showToast(e.detail.message);
        }) as EventListener);

        this.shadow.addEventListener('workspace-open-prompt', ((e: CustomEvent) => {
            this.workspace.openEditor(e.detail.promptId);
        }) as EventListener);

        this.shadow.addEventListener('workspace-new-prompt', ((e: CustomEvent) => {
            this.workspace.openEditor(null, e.detail.parentId);
        }) as EventListener);

        this.shadow.addEventListener('workspace-settings', () => {
            this.workspace.openSettings();
        });

        // NEW: Subscribe to settings changes
        this.store.subscribe('settings_updated', () => {
            this.applySettings();
        });

        // Export/Import Placeholders
        this.shadow.addEventListener('workspace-mode-export', () => {
            console.log("TODO: Switch to Export Mode (Step 6)");
            this.showToast("Export Mode coming in Step 6");
        });
        this.shadow.addEventListener('workspace-mode-import', () => {
            console.log("TODO: Switch to Import Mode (Step 6)");
            this.showToast("Import Mode coming in Step 6");
        });
    }

    // ... (rest of class: toggle, open, close, showToast, destroy) ...
    public toggle() {
        if (this.backdrop?.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    }

    public open() {
        this.backdrop?.classList.add('open');
        this.host.style.pointerEvents = 'auto';
    }

    public close() {
        this.backdrop?.classList.remove('open');
        this.host.style.pointerEvents = 'none';
    }

    public openWithText(text: string) {
        this.open();
        console.log("TODO: Open with text:", text);
    }

    public destroy() {
        this.host.remove();
        (window as any).__promptManagerInitialized = false;
    }

    private showToast(msg: string) {
        if (!this.toastEl) return;
        this.toastEl.textContent = msg;
        this.toastEl.classList.add('show');
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = window.setTimeout(() => {
            if (this.toastEl) this.toastEl.classList.remove('show');
            this.toastTimer = null;
        }, 1400);
    }
}
