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
        this.renderNode(null, 0, container as HTMLElement);
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
            
            // 1. Downward Selection: If folder, select all children
            if (isFolder) {
                this.selectChildren(id);
            }
            
            // 2. Upward Selection: Always select ancestors
            this.selectAncestors(id);
            
        } else {
            this.selectedIds.delete(id);
            
            // 3. Downward Deselection: If folder, must deselect all children
            if (isFolder) {
                this.unselectChildren(id);
            }
        }
        this.renderTree();
    }

    /**
     * Recursively selects all prompts and folders inside a parent folder.
     */
    private selectChildren(folderId: string) {
        this.store.prompts.forEach(p => {
            if (p.parentId === folderId) {
                this.selectedIds.add(p.id);
            }
        });
        this.store.folders.forEach(f => {
            if (f.parentId === folderId) {
                this.selectedIds.add(f.id);
                this.selectChildren(f.id); // Recursive call
            }
        });
    }

    /**
     * Recursively selects parents. 
     * CRITICAL: This does NOT call selectChildren, satisfying the edge case.
     */
    private selectAncestors(itemId: string) {
        // Check if the item is a prompt
        const prompt = this.store.prompts.find(p => p.id === itemId);
        // Check if the item is a folder
        const folder = this.store.folders.find(f => f.id === itemId);
        
        const parentId = prompt ? prompt.parentId : (folder ? folder.parentId : null);

        if (parentId) {
            this.selectedIds.add(parentId);
            this.selectAncestors(parentId); // Recursive call up the tree
        }
    }

    /**
     * Recursively removes all prompts and folders inside a parent folder from selection.
     */
    private unselectChildren(folderId: string) {
        this.store.prompts.forEach(p => {
            if (p.parentId === folderId) {
                this.selectedIds.delete(p.id);
            }
        });
        this.store.folders.forEach(f => {
            if (f.parentId === folderId) {
                this.selectedIds.delete(f.id);
                this.unselectChildren(f.id); // Recursive call
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
