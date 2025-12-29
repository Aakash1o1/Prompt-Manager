// src/content/components/App.ts
import { Component } from './Component';
import { Store } from '../store';
// Note: We are temporarily NOT importing child components until Steps 2-6
import { TextExpander } from './TextExpander'; // Keep this one as it has no UI
import { Sidebar } from './Sidebar'; // Import Sidebar
import { Workspace } from './Workspace'; // Import Workspace

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
        this.applySettings(); // APPLY ON LOAD

        // MOUNT COMPONENTS
        this.sidebar.mount(this.modal);
        this.workspace.mount(this.modal);

        // Note: Child components (Sidebar, Workspace) will be mounted here in future steps.
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
        this.workspace.openEditor(null, null, text);
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

        // Route Sidebar Events to Workspace
        this.shadow.addEventListener('workspace-open-prompt', ((e: CustomEvent) => {
            this.workspace.openEditor(e.detail.promptId);
        }) as EventListener);

        this.shadow.addEventListener('workspace-open-folder-editor', ((e: CustomEvent) => {
            this.workspace.openFolderEditor(e.detail.folderId, e.detail.parentId);
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

        this.shadow.addEventListener('app-apply-magic', ((e: CustomEvent) => {
            const script = e.detail.script;
            const draft = this.workspace.getDraftText();
            let finalOutput = script;

            if (draft && draft.trim()) {
                if (script.includes('[Prompt]:')) {
                    finalOutput = script + draft;
                } else {
                    finalOutput = script + "\n\n" + draft;
                }
            }

            navigator.clipboard.writeText(finalOutput);
            this.showToast(draft ? 'Applied to draft & copied' : 'Script copied');
        }) as EventListener);

        // --- IMPORT/EXPORT ORCHESTRATION ---

        // Cancel any mode
        this.shadow.addEventListener('app-mode-cancel', () => {
            this.sidebar.setNormalMode();
            this.workspace.mount(this.modal as HTMLElement);
        });

        // Export flow
        this.shadow.addEventListener('app-start-export', () => {
            this.sidebar.startExportMode();
            this.workspace.mount(this.modal as HTMLElement); // Clears to empty
        });

        this.shadow.addEventListener('workspace-preview-export', ((e: CustomEvent) => {
            this.workspace.previewExport(e.detail.promptId);
        }) as EventListener);

        this.shadow.addEventListener('app-exec-export', () => {
            const pIds = Array.from(this.sidebar.exportSelectedIds).filter(id => this.store.prompts.some(p => p.id === id));
            const fIds = Array.from(this.sidebar.exportSelectedIds).filter(id => this.store.folders.some(f => f.id === id));
            
            if (pIds.length === 0 && fIds.length === 0) {
                this.showToast("Nothing selected");
                return;
            }
            
            const data = this.store.prepareExportData(pIds, fIds);
            this.store.triggerDownload(data);
            this.showToast(`Exported ${pIds.length} prompts`);
            this.sidebar.setNormalMode();
            this.workspace.mount(this.modal as HTMLElement);
        });

        // Import flow
        this.shadow.addEventListener('app-start-import', ((e: CustomEvent) => {
            const rawData = e.detail.data;
            try {
                const validated = this.store.validateImportData(rawData);
                this.sidebar.startImportMode(validated);
                this.workspace.mount(this.modal as HTMLElement);
            } catch (err: any) {
                this.showToast(err.message);
            }
        }) as EventListener);

        this.shadow.addEventListener('workspace-resolve-import', ((e: CustomEvent) => {
            const p = this.sidebar.getImportPrompt(e.detail.promptId);
            if (p) {
                this.workspace.resolveImport(p, () => {
                    this.sidebar.refreshImportTree();
                });
            }
        }) as EventListener);

        this.shadow.addEventListener('app-exec-import', async () => {
            const data = this.sidebar.getImportData();
            const selectedIds = this.sidebar.importSelectedIds;
            
            if (!data) return;

            const promptsToImport = data.prompts.filter(p => selectedIds.has(p.id));
            const foldersToImport = data.folders.filter(f => selectedIds.has(f.id));

            if (promptsToImport.length === 0 && foldersToImport.length === 0) {
                this.showToast("Nothing selected");
                return;
            }

            const hasRed = promptsToImport.some(p => p.conflicts.title || p.conflicts.shortcut);
            if (hasRed) {
                this.showToast("Resolve red conflicts in selected items");
                return;
            }

            await this.store.finalizeImport(promptsToImport, foldersToImport);
            this.showToast("Import Successful");
            this.sidebar.setNormalMode();
            this.workspace.mount(this.modal as HTMLElement);
        });
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
