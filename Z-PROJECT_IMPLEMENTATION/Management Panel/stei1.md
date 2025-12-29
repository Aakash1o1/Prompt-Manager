Step 1: Architecture & Layout Skeleton
Objective: Replace the side-panel architecture with a centered 800x600 Modal + Backdrop system, apply the new "Zinc" Dark Theme, and implement the Router-ready skeleton.
Complexity: HIGH
Files to Modify:
src/content/styles.ts (Complete Rewrite)
src/content/host.ts (Structural Update)
src/content/components/App.ts (Logic Refactor)
src/content/main.ts (Cleanup)
src/content/ui.ts (Cleanup)
Files to Delete:
src/content/resize.ts (No longer needed)
Tasks:
1. Rewrite Styles (src/content/styles.ts)
We need to define the new Grid layout, the center positioning, and the new color palette. Replace the entire file content with this:
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
}

.workspace {
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* --- UTILS --- */
.hidden { display: none !important; }

/* Toast */
.toast {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-sidebar);
    border: 1px solid var(--border-default);
    color: var(--txt-primary);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 50;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.toast.show { opacity: 1; }
`;
2. Update Host Structure (src/content/host.ts)
We are removing the floating panel/hotzone and replacing it with the Backdrop/Modal structure.
code
TypeScript
// src/content/host.ts
import { STYLES } from './styles';

export function createOrGetHost() {
  if ((window as any).__promptManagerInitialized) {
    return { host: null, shadow: null }; 
  }
  (window as any).__promptManagerInitialized = true;

  const HOST_ID = 'prompt-drawer-host-shadow';
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (host) host.remove();

  host = document.createElement('div');
  host.id = HOST_ID;

  Object.assign(host.style, {
    all: 'initial',
    position: 'fixed',
    zIndex: '2147483647',
    pointerEvents: 'none' // Let clicks pass through when closed
  });

  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>${STYLES}</style>

    <!-- BACKDROP (Covers entire screen) -->
    <div class="backdrop" id="backdrop">
      
      <!-- MAIN MODAL (Centered) -->
      <div class="modal" id="modal">
        
        <!-- LEFT COLUMN -->
        <aside class="sidebar" id="sidebar">
           <!-- Step 2 will fill this -->
           <div style="padding: 20px; color: #52525b; font-size: 12px;">Sidebar Loading...</div>
        </aside>

        <!-- RIGHT COLUMN -->
        <main class="workspace" id="workspace">
           <!-- Step 3 will fill this -->
           <div style="padding: 20px; color: #52525b; font-size: 12px;">Workspace Loading...</div>
        </main>

      </div>
    </div>

    <!-- Utils -->
    <div class="toast" id="toast"></div>
  `;

  return { host, shadow };
}
3. Refactor App Logic (src/content/components/App.ts)
We need to remove the mounting of old components (PromptList, SearchBar, etc.) for now to prevent crashes because their target containers no longer exist. We will focus purely on the toggle logic.
code
TypeScript
// src/content/components/App.ts
import { Component } from './Component';
import { Store } from '../store';
// Note: We are temporarily NOT importing child components until Steps 2-6
import { TextExpander } from './TextExpander'; // Keep this one as it has no UI

export class App extends Component {
    private backdrop: HTMLElement | null = null;
    private modal: HTMLElement | null = null;
    private toastEl: HTMLElement | null = null;
    private toastTimer: number | null = null;

    private host: HTMLElement;

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        this.host = host;
    }

    mount(parent: HTMLElement) { // 'parent' arg is unused now, we look up from shadow
        this.backdrop = this.shadow.getElementById('backdrop');
        this.modal = this.shadow.getElementById('modal');
        this.toastEl = this.shadow.getElementById('toast');

        if (!this.backdrop || !this.modal) {
            console.error('App: Critical DOM elements missing.');
            return;
        }

        // Setup Event Listeners
        this.setupListeners();

        // Note: Child components (Sidebar, Workspace) will be mounted here in future steps.
        console.log('App: Skeleton Mounted.');
    }

    public toggle() {
        if (this.backdrop?.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    }

    // New Open/Close Logic
    public open() {
        this.backdrop?.classList.add('open');
        this.host.style.pointerEvents = 'auto'; // Enable interaction
    }

    public close() {
        this.backdrop?.classList.remove('open');
        this.host.style.pointerEvents = 'none'; // Pass-through interaction
        
        // Future: Reset router state if needed
    }

    public openWithText(text: string) {
        this.open();
        // Future: Dispatch event to Workspace to start 'New Prompt' flow with text
        console.log("TODO: Open with text:", text);
    }

    public destroy() {
        this.host.remove();
        (window as any).__promptManagerInitialized = false;
    }

    private setupListeners() {
        // Close on Backdrop Click
        this.backdrop?.addEventListener('click', (e) => {
            if (e.target === this.backdrop) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && this.backdrop?.classList.contains('open')) {
                ev.preventDefault();
                ev.stopPropagation();
                this.close();
            }
        });

        // Toast Listener
        this.shadow.addEventListener('show-toast', ((e: CustomEvent) => {
            this.showToast(e.detail.message);
        }) as EventListener);
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
4. Cleanup src/content/main.ts and src/content/ui.ts
Remove references to resize and update the mount call.
Update src/content/ui.ts:
code
TypeScript
// src/content/ui.ts
import { Store } from './store';
import { App } from './components/App';

// ... (Keep existing types) ...

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: any[];
  tags: any[];
  folders: any[];
  settings: any;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
  FOLDERS_KEY: string;
}) {
  const { host, shadow, prompts, tags, folders, settings } = opts;

  if (!host || !shadow) return;

  const store = new Store();
  (window as any).debugStore = store; 

  store.prompts = prompts;
  store.tags = tags;
  store.folders = folders || [];
  store.settings = settings;

  // Initialize App
  const app = new App(store, shadow, host);
  app.mount(host); // Pass host, though App looks up internal elements

  // Message Listeners (Keep existing logic)
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'TOGGLE_POPUP') {
      app.toggle();
      sendResponse({ ok: true });
    }
    if (msg.type === 'OPEN_WITH_TEXT') {
      app.openWithText(msg.text || '');
      sendResponse({ ok: true });
    }
    if (msg.type === 'PERMISSION_REMOVED' && msg.pattern) {
      const currentUrl = window.location.href;
      const origin = msg.pattern.replace(/\/\*$/, '');
      if (currentUrl.startsWith(origin)) {
        app.destroy();
      }
    }
    return true;
  });

  console.log('Prompt Manager UI initialized (V2 Architecture)');
}
Update src/content/main.ts:
Remove the import line: import { setupResizeHandles } from './resize'; (It might not be imported there, but check just in case. It was mainly used in App.ts or ui.ts previously).
5. Delete src/content/resize.ts
Delete this file entirely.
