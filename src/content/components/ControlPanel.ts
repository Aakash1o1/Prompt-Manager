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
            <div class="ws-header" style="flex-direction: row; justify-content: space-between; align-items: center;">
                <h2 style="margin:0; font-size:18px;color:white;">Control Panel</h2>
                <button class="btn-tutorial" id="cp-tutorial-btn">
                    <span>✨</span> Tutorial
                </button>
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
                        <div style="display:flex; gap:4px; align-items:center;">
                            <button class="icon-btn" id="cp-font-dec" style="width:32px; height:32px; font-size:20px; justify-content:center; background:var(--bg-hover);">–</button>
                            <button class="icon-btn" id="cp-font-inc" style="width:32px; height:32px; font-size:20px; justify-content:center; background:var(--bg-hover);">+</button>
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
                            <div class="backup-title" style="color:white;">Export Data</div>
                        </div>
                        <div class="backup-card" id="cp-import">
                            <div class="backup-icon">📥</div>
                            <div class="backup-title" style="color:white;">Import Data</div>
                        </div>
                    </div>
                    <input type="file" id="cp-file-input" accept=".json" style="display:none;" />
                </div>
            </div>
        `;


        this.setupListeners();
    }

    private setupListeners() {
        // Tutorial Button
        this.container?.querySelector('#cp-tutorial-btn')?.addEventListener('click', () => {
             // Tell the background script to open the tutorial tab
             chrome.runtime.sendMessage({ type: 'OPEN_TUTORIAL' });
        });

        // Theme
        this.container?.querySelector('#cp-theme')?.addEventListener('change', (e) => {
            const checkbox = e.target as HTMLInputElement;
            const isDark = checkbox.checked;
            
            if (!isDark) {
                // Prevent switching to light mode
                checkbox.checked = true;
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: 'Light is coming soon' } 
                }));
            } else {
                this.store.updateSettings({ theme: 'dark' });
            }
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

        // Import/Export Triggers
        this.container?.querySelector('#cp-export')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('app-start-export'));
        });

        const fileInput = this.container?.querySelector('#cp-file-input') as HTMLInputElement;
        this.container?.querySelector('#cp-import')?.addEventListener('click', () => {
            fileInput?.click();
        });

        fileInput?.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    this.shadow.dispatchEvent(new CustomEvent('app-start-import', { detail: { data: json } }));
                } catch (err) {
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Invalid JSON file' } }));
                }
            };
            reader.readAsText(file);
            fileInput.value = ''; // Reset
        });
    }
}
