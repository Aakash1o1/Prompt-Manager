Step 4: Control Panel & Magic Scripts
Objective: Implement the Settings view (Control Panel) and the "Magic" script dropdown feature.
Complexity: LOW
Files to Modify/Create:
src/content/styles.ts (Add Toggle Switch & Magic Dropdown styles).
New File: src/content/components/ControlPanel.ts (The Settings View).
New File: src/content/lib/magicScripts.ts (The hardcoded scripts).
src/content/components/Sidebar.ts (Wire up Magic Icon).
src/content/components/Workspace.ts (Render Control Panel).
src/content/components/App.ts (Wire settings event).
Tasks:
1. Add Styles (src/content/styles.ts)
Add CSS for the toggle switches and the magic dropdown menu.
code
TypeScript
// src/content/styles.ts -> Append to STYLES string

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

/* --- MAGIC DROPDOWN --- */
.magic-dropdown {
  position: absolute;
  top: 40px; /* Below header */
  right: 12px;
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
  font-size: 13px;
  color: var(--txt-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.magic-item:hover { background: var(--bg-hover); color: var(--txt-primary); }
2. Create Magic Scripts Library (src/content/lib/magicScripts.ts)
Store the scripts here.
code
TypeScript
// src/content/lib/magicScripts.ts
export const MAGIC_SCRIPTS = [
    {
        name: "Improve Prompt",
        icon: "✨",
        text: "Act as a Prompt Engineer. Review the prompt below. Improve its clarity, structure, and effectiveness without changing the core intent. Use clear headings.\n\n[Prompt]: "
    },
    {
        name: "Find Logic Gaps",
        icon: "🔍",
        text: "Analyze the following prompt for logical inconsistencies, missing context, or potential misinterpretations by an LLM. List them as bullet points.\n\n[Prompt]: "
    },
    {
        name: "Convert to JSON",
        icon: "{ }",
        text: "Rewrite the following prompt to strictly request a JSON output format. Define the schema keys clearly.\n\n[Prompt]: "
    }
];
3. Update Sidebar to Handle Magic Menu (src/content/components/Sidebar.ts)
Add the dropdown logic to the Sidebar.
code
TypeScript
// src/content/components/Sidebar.ts
// ... imports
import { MAGIC_SCRIPTS } from '../lib/magicScripts';

export class Sidebar extends Component {
    // ... existing props
    private magicDropdown: HTMLElement | null = null;

    // ... mount()
        // inside renderSkeleton(), add the dropdown HTML AFTER the .sb-header
        // ...
        // <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>
        // </div>
        // <div class="magic-dropdown" id="magic-dropdown"></div> <!-- ADD THIS -->
        // ...

    // Update setupListeners()
    private setupListeners() {
        // ... existing

        // Magic Toggle
        const magicBtn = this.container?.querySelector('#btn-magic');
        this.magicDropdown = this.container?.querySelector('#magic-dropdown');
        
        // Render Magic Items
        if (this.magicDropdown) {
            this.magicDropdown.innerHTML = MAGIC_SCRIPTS.map(script => `
                <div class="magic-item" data-text="${encodeURIComponent(script.text)}">
                    <span>${script.icon}</span> ${script.name}
                </div>
            `).join('');

            // Click handling
            this.magicDropdown.querySelectorAll('.magic-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const text = decodeURIComponent((item as HTMLElement).dataset.text || '');
                    navigator.clipboard.writeText(text);
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Script copied to clipboard' } }));
                    this.magicDropdown?.classList.remove('open');
                });
            });
        }

        magicBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.magicDropdown?.classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.magicDropdown?.classList.contains('open')) {
                this.magicDropdown.classList.remove('open');
            }
        });
    }
}
4. Create ControlPanel Component (src/content/components/ControlPanel.ts)
This renders the Settings form.
code
TypeScript
// src/content/components/ControlPanel.ts
import { Component } from './Component';

export class ControlPanel extends Component {
    private container: HTMLElement | null = null;

    mount(parent: HTMLElement) {
        // We mount into the workspace container provided
        this.container = parent;
        this.render();
    }

    private render() {
        if (!this.container) return;
        const s = this.store.settings;

        this.container.innerHTML = `
            <div class="ws-header">
                <h2 style="margin:0; font-size:18px;">Control Panel</h2>
            </div>
            
            <div class="cp-container">
                <!-- SECTION 1: APPEARANCE -->
                <div>
                    <div class="cp-section-title">Appearance</div>
                    
                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Dark Mode</div>
                            <div class="cp-desc">Adjust interface contrast</div>
                        </div>
                        <label>
                            <input type="checkbox" id="cp-theme" style="display:none;" ${s.theme === 'dark' ? 'checked' : ''}>
                            <div class="toggle-switch"></div>
                        </label>
                    </div>

                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Font Size</div>
                            <div class="cp-desc">Base text scaling (${s.fontSizePx}px)</div>
                        </div>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <button class="icon-btn" id="cp-font-dec">-</button>
                            <span style="width:30px; text-align:center; font-size:13px;">${s.fontSizePx}</span>
                            <button class="icon-btn" id="cp-font-inc">+</button>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: BEHAVIOR -->
                <div>
                    <div class="cp-section-title">Behavior</div>
                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Quick Menu Limit</div>
                            <div class="cp-desc">Max items in ../ shortcut</div>
                        </div>
                        <input type="number" id="cp-limit" value="${s.quickMenuLimit}" min="1" max="6" class="ws-input" style="width:60px;">
                    </div>
                </div>

                <!-- SECTION 3: BACKUP -->
                <div>
                    <div class="cp-section-title">Backup Library</div>
                    <div class="backup-grid">
                        <div class="backup-card" id="cp-export">
                            <div class="backup-icon">📤</div>
                            <div class="backup-title">Export Data</div>
                        </div>
                        <div class="backup-card" id="cp-import">
                            <div class="backup-icon">📥</div>
                            <div class="backup-title">Import Data</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupListeners();
    }

    private setupListeners() {
        // Theme
        this.container?.querySelector('#cp-theme')?.addEventListener('change', (e) => {
            const isDark = (e.target as HTMLInputElement).checked;
            this.store.updateSettings({ theme: isDark ? 'dark' : 'light' });
            // Note: You might need to implement theme application in App.ts or Host.ts if using CSS vars
        });

        // Font Size
        this.container?.querySelector('#cp-font-inc')?.addEventListener('click', () => {
            const current = this.store.settings.fontSizePx;
            this.store.updateSettings({ fontSizePx: current + 1 });
            this.render(); // Re-render to update number
        });
        this.container?.querySelector('#cp-font-dec')?.addEventListener('click', () => {
            const current = this.store.settings.fontSizePx;
            this.store.updateSettings({ fontSizePx: Math.max(10, current - 1) });
            this.render();
        });

        // Quick Limit
        this.container?.querySelector('#cp-limit')?.addEventListener('change', (e) => {
            const val = parseInt((e.target as HTMLInputElement).value);
            this.store.updateSettings({ quickMenuLimit: Math.min(6, Math.max(1, val)) });
        });

        // Import/Export Triggers (Events for now)
        this.container?.querySelector('#cp-export')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-mode-export'));
        });
        this.container?.querySelector('#cp-import')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-mode-import'));
        });
    }
}
5. Update Workspace to Handle Control Panel (src/content/components/Workspace.ts)
Add the mode and render logic.
code
TypeScript
// src/content/components/Workspace.ts
import { ControlPanel } from './ControlPanel'; // Import

export class Workspace extends Component {
    // ...
    private controlPanel: ControlPanel;

    constructor(store: Store, shadow: ShadowRoot) {
        super(store, shadow);
        this.controlPanel = new ControlPanel(store, shadow);
    }

    // New Method
    public openSettings() {
        if (this.checkUnsavedChanges()) return;
        this.currentMode = 'settings';
        this.originalPromptId = null;
        this.isDirty = false;
        
        if (this.container) {
            this.controlPanel.mount(this.container);
        }
    }

    // ... existing openEditor(), etc.
}
6. Wire App Logic (src/content/components/App.ts)
Connect the Settings event.
code
TypeScript
// src/content/components/App.ts -> setupListeners

// Update the existing listener:
this.shadow.addEventListener('workspace-settings', () => {
    this.workspace.openSettings();
});

// Add placeholders for Export/Import
this.shadow.addEventListener('workspace-mode-export', () => {
    console.log("TODO: Switch to Export Mode (Step 6)");
    this.showToast("Export Mode coming in Step 6");
});
this.shadow.addEventListener('workspace-mode-import', () => {
    console.log("TODO: Switch to Import Mode (Step 6)");
    this.showToast("Import Mode coming in Step 6");
});
