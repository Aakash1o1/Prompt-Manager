import { Component } from './Component';
import { Settings } from '../store';

/**
 * SettingsModal Component
 * Handles the settings overlay where users can configure font size, theme, and hotspot position.
 */
export class SettingsModal extends Component {
    private area: HTMLElement | null = null;

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#settings-area');
        if (!this.area) return;
        this.renderUI();
        this.setupListeners();
        this.store.subscribe('settings_updated', () => this.loadSettings());
    }

    private renderUI() {
        if (!this.area) return;

        const isDark = this.store.settings.theme === 'dark';
        const isAutoClose = this.store.settings.autoCloseOnHover;

        this.area.innerHTML = `
            <div style="
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 16px; 
                height: 100%; 
                box-sizing: border-box; 
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="flex-shrink: 0;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Settings</h2>
                </div>
                
                <!-- Content (Scrollable) -->
                <div style="
                    flex: 1; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    scrollbar-width: none;
                ">
                    <!-- Font Size (Segmented) -->
                    <div class="settings-row">
                        <label style="color: var(--txt-secondary); font-size: 13px;">Font Size</label>
                        <div class="segmented-control" id="ctrl-font-size">
                            <button class="segment-btn" data-size="10" style="font-size: 12px;">A</button>
                            <button class="segment-btn" data-size="12" style="font-size: 18px;">A</button>
                            <button class="segment-btn active" data-size="14" style="font-size: 24px;">A</button>
                        </div>
                    </div>

                    <!-- Hotspot (Segmented) -->
                    <div class="settings-row">
                        <label style="color: var(--txt-secondary); font-size: 13px;">Hotspot Position</label>
                        <div class="segmented-control" id="ctrl-hotspot-pos">
                            <button class="segment-btn" data-pos="corner" title="Corner">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>
                            </button>
                            <button class="segment-btn active" data-pos="edge" title="Edge">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="18" y="4" width="4" height="16" rx="1"/><path d="M14 12H2m12 0-4-4m4 4-4 4"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- TOGGLE: Dark Theme -->
                    <div class="settings-row">
                        <label style="color: var(--txt-secondary); font-size: 13px;">Dark theme</label>
                        <label class="toggle-label">
                            <input type="checkbox" class="toggle-checkbox" id="s-theme" ${isDark ? 'checked' : ''}>
                            <div class="toggle-switch">
                                <div class="toggle-slider"></div>
                            </div>
                        </label>
                    </div>

                    <!-- TOGGLE: Auto Close -->
                    <div class="settings-row" style="border-bottom: none;">
                        <label style="color: var(--txt-secondary); font-size: 13px;">Auto-close</label>
                        <label class="toggle-label">
                            <input type="checkbox" class="toggle-checkbox" id="s-auto-close" ${isAutoClose ? 'checked' : ''}>
                            <div class="toggle-switch">
                                <div class="toggle-slider"></div>
                            </div>
                        </label>
                    </div>

                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
                        <label style="color: var(--txt-secondary); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 12px;">Data Management</label>
                        <div style="display: flex; gap: 8px;">
                            <button id="btn-export-trigger" class="btn-ghost" style="flex: 1; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/></svg>
                                Export
                            </button>
                            <button id="btn-import-trigger" class="btn-ghost" style="flex: 1; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m7-7-5-5-5 5m5-5v12"/></svg>
                                Import
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="
                    display: flex; 
                    gap: 12px; 
                    align-items: center;
                    justify-content: flex-end;
                    padding-top: 16px; 
                    flex-shrink: 0;
                    border-top: 1px solid var(--border-subtle);
                ">
                    <button id="s-cancel" class="btn-ghost">Cancel</button>
                    <button id="s-save" class="btn-primary">Save</button>
                </div>
            </div>
        `;

        this.setupListeners();
    }

    private setupListeners() {
        this.setupSegmentedControl('ctrl-font-size');
        this.setupSegmentedControl('ctrl-hotspot-pos');

        this.area?.querySelector('#s-save')?.addEventListener('click', () => this.save());
        this.area?.querySelector('#s-cancel')?.addEventListener('click', () => this.close());

        this.area?.querySelector('#btn-export-trigger')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('open-export-overlay'));
        });

        this.area?.querySelector('#btn-import-trigger')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('open-import-overlay'));
        });
    }

    private setupSegmentedControl(id: string) {
        const container = this.area?.querySelector(`#${id}`);
        if (!container) return;
        const buttons = container.querySelectorAll('.segment-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    private loadSettings() {
        const s = this.store.settings;

        this.setSegmentActive('ctrl-font-size', 'data-size', String(s.fontSizePx || 14));
        this.setSegmentActive('ctrl-hotspot-pos', 'data-pos', s.hotspotPosition || 'edge');

        const autoClose = this.area?.querySelector('#s-auto-close') as HTMLInputElement;
        if (autoClose) autoClose.checked = s.autoCloseOnHover;

        const theme = this.area?.querySelector('#s-theme') as HTMLInputElement;
        if (theme) theme.checked = s.theme === 'dark';
    }

    private setSegmentActive(containerId: string, dataAttr: string, value: string) {
        const container = this.area?.querySelector(`#${containerId}`);
        if (!container) return;
        const buttons = container.querySelectorAll('.segment-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute(dataAttr) === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    open() {
        if (!this.area) return;

        this.area.classList.add('open');
        this.area.setAttribute('aria-hidden', 'false');
        this.shadow.getElementById('panel')?.classList.add('mode-settings');

        this.loadSettings();
    }

    close() {
        if (!this.area) return;
        this.area.classList.remove('open');
        this.area.setAttribute('aria-hidden', 'true');
        this.shadow.getElementById('panel')?.classList.remove('mode-settings');
    }

    public isOpen(): boolean {
        return this.area ? this.area.classList.contains('open') : false;
    }

    private async save() {
        const updates: Partial<Settings> = {};

        const fontSizeBtn = this.area?.querySelector('#ctrl-font-size .segment-btn.active');
        if (fontSizeBtn) {
            const val = parseInt(fontSizeBtn.getAttribute('data-size') || '14');
            updates.fontSizePx = val;
        }

        const posBtn = this.area?.querySelector('#ctrl-hotspot-pos .segment-btn.active');
        if (posBtn) {
            updates.hotspotPosition = posBtn.getAttribute('data-pos') as 'corner' | 'edge';
        }

        const autoClose = this.area?.querySelector('#s-auto-close') as HTMLInputElement;
        if (autoClose) updates.autoCloseOnHover = autoClose.checked;

        const theme = this.area?.querySelector('#s-theme') as HTMLInputElement;
        if (theme) updates.theme = theme.checked ? 'dark' : 'light';

        await this.store.updateSettings(updates);
        this.shadow.dispatchEvent(new CustomEvent('apply-settings'));
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Settings saved' } }));
        this.close();
    }
}
