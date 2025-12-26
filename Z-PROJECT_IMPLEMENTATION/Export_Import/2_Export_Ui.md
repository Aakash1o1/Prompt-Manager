Step 02: Export Selection UI
Objective: Create an overlay with a hierarchical list and checkboxes that allows users to pick specific items to export, featuring a recursive selection logic.
Files to Modify:
src/content/host.ts
src/content/components/App.ts
src/content/components/SettingsModal.ts
New File: src/content/components/ExportOverlay.ts
Tasks:
1. Add the Overlay Container
In src/content/host.ts, add the export-area div inside the panel div (where other overlays are located).
code
TypeScript
// src/content/host.ts -> Inside the <div class="panel"> section
/* ... other overlays ... */
<div id="add-area" class="overlay-area"></div>
<div id="settings-area" class="overlay-area"></div>
<div id="export-area" class="overlay-area"></div> // ADD THIS LINE
2. Create the ExportOverlay Component
Create a new file src/content/components/ExportOverlay.ts. This component will handle the recursive selection logic.
code
TypeScript
// src/content/components/ExportOverlay.ts
import { Component } from './Component';

export class ExportOverlay extends Component {
    private area: HTMLElement | null = null;
    private selectedIds: Set<string> = new Set();

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#export-area');
        if (!this.area) return;
        this.renderBase();
    }

    private renderBase() {
        if (!this.area) return;
        this.area.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; height: 100%; width: 100%; box-sizing: border-box; overflow: hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:18px;">Export Prompts</h2>
                    <button id="export-toggle-all" class="btn-ghost" style="font-size:12px;">Deselect All</button>
                </div>
                
                <div id="export-tree-container" style="flex:1; overflow-y:auto; scrollbar-width:none; border:1px solid var(--border-subtle); border-radius:8px; padding:8px;">
                    <!-- Tree rendered here -->
                </div>

                <div style="display:flex; gap:12px; justify-content:flex-end; border-top:1px solid var(--border-subtle); padding-top:16px;">
                    <button id="export-cancel" class="btn-ghost">Cancel</button>
                    <button id="export-confirm" class="btn-primary">Export Selected</button>
                </div>
            </div>
        `;

        this.area.querySelector('#export-cancel')?.addEventListener('click', () => this.close());
        this.area.querySelector('#export-confirm')?.addEventListener('click', () => this.handleExport());
        this.area.querySelector('#export-toggle-all')?.addEventListener('click', () => this.toggleAll());
    }

    open() {
        // Pre-select everything by default
        this.selectedIds = new Set([
            ...this.store.prompts.map(p => p.id),
            ...this.store.folders.map(f => f.id)
        ]);
        
        this.area?.classList.add('open');
        this.renderTree();
    }

    close() {
        this.area?.classList.remove('open');
    }

    private toggleAll() {
        const btn = this.area?.querySelector('#export-toggle-all');
        if (this.selectedIds.size > 0) {
            this.selectedIds.clear();
            if (btn) btn.textContent = 'Select All';
        } else {
            this.store.prompts.forEach(p => this.selectedIds.add(p.id));
            this.store.folders.forEach(f => this.selectedIds.add(f.id));
            if (btn) btn.textContent = 'Deselect All';
        }
        this.renderTree();
    }

    private renderTree() {
        const container = this.area?.querySelector('#export-tree-container');
        if (!container) return;
        container.innerHTML = '';
        this.renderNode(null, 0, container);
    }

    private renderNode(parentId: string | null, depth: number, container: HTMLElement) {
        const folders = this.store.folders.filter(f => f.parentId == parentId);
        const prompts = this.store.prompts.filter(p => p.parentId == parentId);

        folders.forEach(f => {
            const row = this.createRow(f.name, f.id, true, depth);
            container.appendChild(row);
            this.renderNode(f.id, depth + 1, container);
        });

        prompts.forEach(p => {
            const row = this.createRow(p.title, p.id, false, depth);
            container.appendChild(row);
        });
    }

    private createRow(name: string, id: string, isFolder: boolean, depth: number) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.padding = `6px 8px 6px ${depth * 20 + 8}px`;
        row.style.gap = '8px';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = this.selectedIds.has(id);
        cb.addEventListener('change', () => this.handleSelection(id, isFolder, cb.checked));

        const label = document.createElement('span');
        label.textContent = (isFolder ? '📁 ' : '📄 ') + name;
        label.style.fontSize = '13px';
        label.style.cursor = 'pointer';
        label.addEventListener('click', () => cb.click());

        row.appendChild(cb);
        row.appendChild(label);
        return row;
    }

    private handleSelection(id: string, isFolder: boolean, isChecked: boolean) {
        if (isChecked) {
            this.selectedIds.add(id);
        } else {
            this.selectedIds.delete(id);
            // If folder is unselected, recursively unselect all children
            if (isFolder) {
                this.unselectChildren(id);
            }
        }
        this.renderTree();
    }

    private unselectChildren(folderId: string) {
        this.store.prompts.forEach(p => {
            if (p.parentId === folderId) this.selectedIds.delete(p.id);
        });
        this.store.folders.forEach(f => {
            if (f.parentId === folderId) {
                this.selectedIds.delete(f.id);
                this.unselectChildren(f.id); // Recurse
            }
        });
    }

    private handleExport() {
        const pIds = this.store.prompts.filter(p => this.selectedIds.has(p.id)).map(p => p.id);
        const fIds = this.store.folders.filter(f => this.selectedIds.has(f.id)).map(f => f.id);

        if (pIds.length === 0 && fIds.length === 0) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Nothing selected' } }));
            return;
        }

        const data = this.store.prepareExportData(pIds, fIds);
        this.store.triggerDownload(data);
        this.close();
    }
}
3. Mount the Overlay in App.ts
Update src/content/components/App.ts to include the new component.
code
TypeScript
// src/content/components/App.ts

/* ... imports ... */
import { ExportOverlay } from './ExportOverlay';

export class App extends Component {
    /* ... existing properties ... */
    private exportOverlay: ExportOverlay;

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        /* ... existing inits ... */
        this.exportOverlay = new ExportOverlay(store, shadow);
    }

    mount(parent: HTMLElement) {
        /* ... existing mount logic ... */
        this.exportOverlay.mount(this.panel!); // Add this line

        this.setupEventListeners();
    }

    private setupEventListeners() {
        /* ... existing listeners ... */
        
        // Add this specific listener
        this.shadow.addEventListener('open-export-overlay', () => {
            this.settingsModal.close(); // Close settings first
            this.exportOverlay.open();
        });
    }
}
4. Update the Settings Trigger
In src/content/components/SettingsModal.ts, change the event listener from Step 1 to open the overlay instead of downloading immediately.
code
TypeScript
// Inside src/content/components/SettingsModal.ts -> setupListeners()

// REPLACE the existing #btn-export-trigger listener with this:
this.area?.querySelector('#btn-export-trigger')?.addEventListener('click', () => {
    this.shadow.dispatchEvent(new CustomEvent('open-export-overlay'));
});
