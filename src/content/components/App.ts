import { Component } from './Component';
import { Store } from '../store';
import { SearchBar } from './SearchBar';
import { TagDropdown } from './TagDropdown';
import { PromptList } from './PromptList';
import { PromptEditor } from './PromptEditor';
import { SettingsModal } from './SettingsModal';
import { setupResizeHandles } from '../resize';

export class App extends Component {
    private searchBar: SearchBar;
    private tagDropdown: TagDropdown;
    private promptList: PromptList;
    private promptEditor: PromptEditor;
    private settingsModal: SettingsModal;

    private host: HTMLElement;
    private panel: HTMLElement | null = null;
    private hotzone: HTMLElement | null = null;

    // Backdrop for click-outside handling
    private backdrop: HTMLElement | null = null;

    // --- AUTO-CLOSE PROPERTIES ---
    private autoCloseTimer: number | null = null;
    private readonly AUTO_CLOSE_BUFFER = 20; // px
    private readonly AUTO_CLOSE_DELAY = 300; // ms
    // -----------------------------

    // --- TOAST PROPERTIES ---
    private toastEl: HTMLElement | null = null;
    private toastTimer: number | null = null;
    // ------------------------

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        this.host = host;

        this.searchBar = new SearchBar(store, shadow);
        this.tagDropdown = new TagDropdown(store, shadow);
        this.promptList = new PromptList(store, shadow);
        this.promptEditor = new PromptEditor(store, shadow);
        this.settingsModal = new SettingsModal(store, shadow);
    }

    mount(parent: HTMLElement) { // ShadowRoot is passed as parent usually
        console.log('App: Mounting...'); // Debug 1

        this.panel = this.shadow.getElementById('panel');
        this.hotzone = this.shadow.getElementById('hotzone');
        this.toastEl = this.shadow.getElementById('toast'); // <--- CAPTURE TOAST ELEMENT

        if (!this.panel || !this.hotzone) {
            console.error('App: Panel or Hotzone not found in Shadow DOM'); // Debug 2
            return;
        }

        try {

            // Mount children
            this.searchBar.mount(this.panel);
            this.tagDropdown.mount(this.panel);
            this.promptList.mount(this.panel);
            this.promptEditor.mount(this.panel);
            this.settingsModal.mount(this.panel);

            // Setup resize handles
            setupResizeHandles({
                panel: this.panel,
                shadow: this.shadow,
                host: this.host,
                getSettings: () => this.store.settings,
                saveSettings: (s) => this.store.updateSettings(s)
            });

            this.setupEventListeners();
            this.setupPanelBehavior();
            this.applySettings();

            this.store.subscribe('settings_updated', () => this.applySettings());
            console.log('App: Mounted successfully, listeners attached.'); // Debug 3

        } catch (error) {
            console.error('App: Error mounting components', error);
        }
    }

    // --- Public Toggle Method for Alt+P ---
    public toggle() {
        if (this.panel?.classList.contains('open')) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    // --- Public destroy method for Permission Removal ---
    public destroy() {
        this.host.remove();
        if (this.backdrop) this.backdrop.remove();
        (window as any).__promptManagerInitialized = false;
    }

    private setupEventListeners() {
        // --- Use helper method for opening editor ---
        this.shadow.addEventListener('open-add-mode', () => this.openEditor());

        // --- Use helper method for editing ---
        this.shadow.addEventListener('edit-prompt', ((e: CustomEvent) => {
            this.openEditor(e.detail.promptId);
        }) as EventListener);

        // --- EXISTING LISTENERS ---
        this.shadow.addEventListener('toggle-tags-dropdown', () => this.tagDropdown.toggle());
        this.shadow.addEventListener('open-settings', () => this.settingsModal.open());
        this.shadow.addEventListener('close-panel', () => this.closePanel());
        this.shadow.addEventListener('apply-settings', () => this.applySettings());

        // --- NAVIGATION WIRING ---
        this.shadow.addEventListener('nav-next', () => this.promptList.selectNext());
        this.shadow.addEventListener('nav-prev', () => this.promptList.selectPrev());
        this.shadow.addEventListener('nav-copy', () => this.promptList.copySelected());

        // Reset selection when search changes
        this.shadow.addEventListener('nav-reset', () => {
            // We rely on PromptList.render() logic to reset the index
        });

        // --- Listen for editor closing to reset dropdown ---
        this.shadow.addEventListener('editor-closed', () => {
            // Reset Dropdown to default "Filter Mode"
            this.tagDropdown.onTagSelect = null;
            this.tagDropdown.activeTagIds = [];

            // Refresh to show global filters
            this.tagDropdown.refresh();
        });

        // --- GLOBAL TOAST LISTENER ---
        this.shadow.addEventListener('show-toast', ((e: CustomEvent) => {
            this.showToast(e.detail.message);
        }) as EventListener);
        // -----------------------------
    }

    // --- HELPER METHOD ---
    private openEditor(promptId?: string) {
        this.promptEditor.open(promptId);

        // 1. Tell Dropdown to use Editor's tags for visuals
        this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;

        // 2. Override Dropdown click behavior
        this.tagDropdown.onTagSelect = (tagId) => {
            // Update the Editor's data
            this.promptEditor.toggleTag(tagId);

            // Update the Dropdown's visuals (Checkmarks)
            this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;
        };

        // 3. Ensure if editor changes tags internally, dropdown updates
        this.promptEditor.onTagsChanged = () => {
            this.tagDropdown.activeTagIds = this.promptEditor.draftTagIds;
            this.tagDropdown.refresh(); // Ensure this calls refresh()
        };

        // 4. Refresh immediately so checkmarks appear NOW
        this.tagDropdown.refresh();
    }

    // --- TOAST HELPER ---
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
    // --------------------

    private setupPanelBehavior() {
        if (!this.hotzone || !this.panel) return;

        this.hotzone.addEventListener('mouseenter', () => this.openPanel());

        // --- UPDATED KEYDOWN LISTENER (Hierarchy Logic) ---
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                // Only act if our panel is actually open
                if (!this.panel?.classList.contains('open')) return;

                // Priority 1: Close Tags Dropdown (if open)
                const tagsDropdown = this.shadow.getElementById('tags-dropdown');
                if (tagsDropdown?.classList.contains('open')) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.tagDropdown.close();
                    return;
                }

                // Priority 2: Close Editor (if open)
                const editorArea = this.shadow.getElementById('add-area');
                if (editorArea?.classList.contains('open')) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.promptEditor.close();
                    return;
                }

                // Priority 3: Close Settings (if open)
                // Assuming settings modal uses the ID 'settings-modal' or similar structure
                const settingsModal = this.shadow.getElementById('settings-modal');
                if (settingsModal?.classList.contains('open')) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.settingsModal.close();
                    return;
                }

                // Priority 4: Close Main Panel
                ev.preventDefault();
                ev.stopPropagation();
                this.closePanel();
            }
        });
        // --------------------------------------------------

        // src/content/components/App.ts

        document.addEventListener('mousedown', (ev) => {
            if (!this.panel?.classList.contains('open')) return;

            const path = (ev as any).composedPath ? (ev as any).composedPath() : [ev.target];

            // Now that mode is 'open', path includes this.panel and internal elements correctly
            const isInsidePanel = path.includes(this.panel);
            const isInsideHotspot = path.includes(this.hotzone);

            // Check if click is inside dropdown
            const isInsideDropdown = path.some((el: any) => {
                return el instanceof Element && (el.id === 'tags-dropdown' || el.id === 'tags-btn');
            });

            if (!isInsidePanel && !isInsideHotspot) {
                this.closePanel();
                return;
            }

            if (isInsidePanel && !isInsideDropdown && this.tagDropdown.isOpen()) {
                this.tagDropdown.close();
            }
        });

        // --- MOUSE MOVE LISTENER (AUTO CLOSE) ---
        document.addEventListener('mousemove', (ev) => this.handleAutoClose(ev));
        // ----------------------------------------
    }

    // --- HANDLE AUTO CLOSE ---
    private handleAutoClose(ev: MouseEvent) {
        if (!this.panel?.classList.contains('open')) return;

        // Check if auto-close is enabled in settings
        if (!this.store.settings.autoCloseOnHover) {
            this.clearAutoCloseTimer();
            return;
        }

        // Don't auto-close if we are editing or settings are open
        if (this.panel.classList.contains('mode-add') || this.panel.classList.contains('mode-settings') || this.panel.classList.contains('is-resizing')) {
            this.clearAutoCloseTimer();
            return;
        }

        const rect = this.panel.getBoundingClientRect();

        // Check if mouse is within the panel OR the buffer zone around it
        const isInBufferedZone = (
            ev.clientX >= rect.left - this.AUTO_CLOSE_BUFFER &&
            ev.clientX <= rect.right + this.AUTO_CLOSE_BUFFER &&
            ev.clientY >= rect.top - this.AUTO_CLOSE_BUFFER &&
            ev.clientY <= rect.bottom + this.AUTO_CLOSE_BUFFER
        );

        if (isInBufferedZone) {
            // Mouse is inside or near -> Keep open
            this.clearAutoCloseTimer();
        } else {
            // Mouse is outside -> Start timer to close
            if (!this.autoCloseTimer) {
                this.autoCloseTimer = window.setTimeout(() => {
                    this.closePanel();
                    this.autoCloseTimer = null;
                }, this.AUTO_CLOSE_DELAY);
            }
        }
    }

    private clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
    // -------------------------

    private openPanel() {
        if (this.panel) {
            this.panel.classList.add('open');
            // Focus search
            setTimeout(() => {
                const search = this.shadow.getElementById('search-input');
                if (search) (search as HTMLElement).focus();
            }, 50);
        }
    }

    private closePanel() {
        // --- Ensure timer is cleared immediately ---
        this.clearAutoCloseTimer();
        // -------------------------------------------

        if (this.panel) {
            this.panel.classList.remove('open');
            this.tagDropdown.close();
            this.promptEditor.close();
            this.settingsModal.close();
        }
    }

    private applySettings() {
        const s = this.store.settings;
        this.host.style.setProperty('--popup-width', `${s.popupWidthPx || 340}px`);
        this.host.style.setProperty('--popup-height', s.popupHeightVh ? `${s.popupHeightVh}vh` : '56vh');
        this.host.style.setProperty('--font-size', `${s.fontSizePx || 13}px`);
        this.host.style.setProperty('--hotspot-width', `${s.hotspotWidthPx || 24}px`);
        this.host.setAttribute('data-hotspot-position', s.hotspotPosition || 'edge');
        this.host.setAttribute('data-theme', s.theme || 'dark');

        // Fix for panel font size inheriting
        if (this.panel) {
            this.panel.style.fontSize = `${s.fontSizePx || 13}px`;
        }
    }
}