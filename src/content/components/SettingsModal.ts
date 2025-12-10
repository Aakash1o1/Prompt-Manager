import { Component } from './Component';
import { Settings } from '../store';

/**
 * SettingsModal Component
 * Handles the settings overlay where users can configure font size, theme, and hotspot position.
 */
export class SettingsModal extends Component {
    private area: HTMLElement | null = null;
    private fontSizeInput: HTMLInputElement | null = null;
    private themeToggle: HTMLInputElement | null = null;
    private autoCloseToggle: HTMLInputElement | null = null;
    private hotspotPosSelect: HTMLSelectElement | null = null;
    private saveBtn: HTMLButtonElement | null = null;
    private cancelBtn: HTMLButtonElement | null = null;
    public isOpen(): boolean {
        return this.area ? this.area.classList.contains('open') : false;
    }



    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#settings-area');
        this.fontSizeInput = parent.querySelector('#s-font-size');
        this.themeToggle = parent.querySelector('#s-theme');
        this.autoCloseToggle = parent.querySelector('#s-auto-close');
        this.hotspotPosSelect = parent.querySelector('#s-hotspot-pos');
        this.saveBtn = parent.querySelector('#s-save');
        this.cancelBtn = parent.querySelector('#s-cancel');

        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.save());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }

        // Subscribe to settings updates to refresh UI
        this.store.subscribe('settings_updated', () => this.loadSettings());
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

    private loadSettings() {
        if (this.fontSizeInput) this.fontSizeInput.value = String(this.store.settings.fontSizePx);
        if (this.themeToggle) this.themeToggle.checked = this.store.settings.theme === 'dark';
        if (this.autoCloseToggle) this.autoCloseToggle.checked = this.store.settings.autoCloseOnHover;
        if (this.hotspotPosSelect) this.hotspotPosSelect.value = this.store.settings.hotspotPosition;
    }

    private async save() {
        const updates: Partial<Settings> = {};

        if (this.fontSizeInput) {
            const fontSize = parseInt(this.fontSizeInput.value);
            if (!isNaN(fontSize)) updates.fontSizePx = fontSize;
        }

        if (this.themeToggle) {
            updates.theme = this.themeToggle.checked ? 'dark' : 'light';
        }

        if (this.autoCloseToggle) {
            updates.autoCloseOnHover = this.autoCloseToggle.checked;
        }

        if (this.hotspotPosSelect) {
            updates.hotspotPosition = this.hotspotPosSelect.value as 'corner' | 'edge';
        }

        await this.store.updateSettings(updates);

        // Apply settings to host (this would normally be done by a parent component or App)
        this.shadow.dispatchEvent(new CustomEvent('apply-settings'));

        this.close();
    }
}
