import { Component } from './Component';
import { BackupData, ValidatedPrompt, ValidatedFolder } from '../store';

export class ImportOverlay extends Component {
    private area: HTMLElement | null = null;
    private fileInput: HTMLInputElement | null = null;

    private validatedPrompts: ValidatedPrompt[] = [];
    private validatedFolders: ValidatedFolder[] = [];
    private selectedIds: Set<string> = new Set();

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#import-area');
        if (!this.area) return;
        this.renderInitial();
    }

    private renderInitial() {
        if (!this.area) return;
        this.area.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; height: 100%; width: 100%; box-sizing: border-box;">
                <h2 style="margin:0; font-size:18px;">Import Prompts</h2>
                <p style="font-size:13px; color:var(--txt-secondary);">Select a .json backup file to begin.</p>
                
                <div id="drop-zone" style="flex:1; border:2px dashed var(--border-subtle); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; cursor:pointer; transition: background 0.2s;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m7-7-5-5-5 5m5-5v12"/></svg>
                    <span style="font-size:14px; font-weight:500;">Click or drag file here</span>
                    <input type="file" id="import-file-input" accept=".json" style="display:none;">
                </div>

                <div style="display:flex; justify-content:flex-end; padding-top:16px;">
                    <button id="import-cancel" class="btn-ghost">Cancel</button>
                </div>
            </div>
        `;

        this.fileInput = this.area.querySelector('#import-file-input');
        const dropZone = this.area.querySelector('#drop-zone');

        dropZone?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFile(e));
        this.area.querySelector('#import-cancel')?.addEventListener('click', () => this.close());
    }

    open() {
        this.area?.classList.add('open');
        this.renderInitial(); // Reset to file picker
    }

    close() {
        this.area?.classList.remove('open');
    }

    private handleFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as BackupData;
                if (!json.prompts || !json.folders) throw new Error('Invalid format');
                
                const validated = this.store.validateImportData(json);
                this.validatedPrompts = validated.prompts;
                this.validatedFolders = validated.folders;
                
                // Default select all
                this.selectedIds = new Set([
                    ...this.validatedPrompts.map(p => p.id),
                    ...this.validatedFolders.map(f => f.id)
                ]);

                this.renderPreview();
            } catch (err) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Error reading backup file' } }));
            }
        };
        reader.readAsText(file);
    }

    private renderPreview() {
        if (!this.area) return;

        const hasClashes = this.checkGlobalClashes();

        this.area.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 12px; height: 100%; width: 100%; box-sizing: border-box; overflow: hidden;">
                <div style="flex-shrink:0;">
                    <h2 style="margin:0; font-size:18px;">Review Import</h2>
                    <p style="font-size:12px; color:var(--txt-secondary); margin: 4px 0 12px 0;">Resolve red highlights before importing.</p>
                </div>

                <div id="import-tree-container" style="flex:1; overflow-y:auto; scrollbar-width:none; border:1px solid var(--border-subtle); border-radius:8px; background: rgba(0,0,0,0.05);">
                    <!-- Tree Rows -->
                </div>

                <div style="display:flex; gap:12px; justify-content:flex-end; border-top:1px solid var(--border-subtle); padding-top:16px; flex-shrink:0;">
                    <button id="import-back" class="btn-ghost">Back</button>
                    <button id="import-confirm" class="btn-primary" ${hasClashes ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        Import Selected
                    </button>
                </div>
            </div>
        `;

        this.renderTree();

        this.area.querySelector('#import-back')?.addEventListener('click', () => this.renderInitial());
        this.area.querySelector('#import-confirm')?.addEventListener('click', async () => {
            if (this.checkGlobalClashes()) return;

            const btn = this.area?.querySelector('#import-confirm') as HTMLButtonElement;
            btn.disabled = true;
            btn.textContent = 'Importing...';

            // Filter only what is selected
            const promptsToImport = this.validatedPrompts.filter(p => this.selectedIds.has(p.id));
            const foldersToImport = this.validatedFolders.filter(f => this.selectedIds.has(f.id));

            try {
                await this.store.finalizeImport(promptsToImport, foldersToImport);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Import successful!' } }));
                this.close();
            } catch (err) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Import failed' } }));
                btn.disabled = false;
                btn.textContent = 'Import Selected';
            }
        });
    }

    private renderTree() {
        const container = this.area?.querySelector('#import-tree-container');
        if (!container) return;
        container.innerHTML = '';
        this.renderNode(null, 0, container as HTMLElement);
    }

    private renderNode(parentId: string | null, depth: number, container: HTMLElement) {
        const folders = this.validatedFolders.filter(f => f.parentId == parentId);
        const prompts = this.validatedPrompts.filter(p => p.parentId == parentId);

        folders.forEach(f => {
            container.appendChild(this.createFolderRow(f, depth));
            this.renderNode(f.id, depth + 1, container);
        });

        prompts.forEach(p => {
            container.appendChild(this.createPromptRow(p, depth));
        });
    }

    private createFolderRow(f: ValidatedFolder, depth: number) {
        const row = document.createElement('div');
        row.style.padding = `8px 12px 8px ${depth * 20 + 12}px`;
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.borderBottom = '1px solid var(--border-subtle)';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = this.selectedIds.has(f.id);
        cb.onchange = () => this.handleSelection(f.id, true, cb.checked);

        const label = document.createElement('span');
        label.textContent = '📁 ' + f.name;
        label.style.fontSize = '13px';
        label.style.fontWeight = 'bold';

        row.append(cb, label);
        return row;
    }

    private createPromptRow(p: ValidatedPrompt, depth: number) {
        const row = document.createElement('div');
        row.style.padding = `10px 12px 10px ${depth * 20 + 12}px`;
        row.style.borderBottom = '1px solid var(--border-subtle)';
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.gap = '6px';
        if (!this.selectedIds.has(p.id)) row.style.opacity = '0.5';

        const top = document.createElement('div');
        top.style.display = 'flex';
        top.style.alignItems = 'center';
        top.style.gap = '8px';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = this.selectedIds.has(p.id);
        cb.onchange = () => this.handleSelection(p.id, false, cb.checked);

        // Title Input
        const titleInp = document.createElement('input');
        titleInp.id = `title-${p.id}`; // Add unique ID
        titleInp.value = p.title;
        titleInp.style.flex = '1';
        titleInp.style.fontSize = '13px';
        titleInp.style.padding = '4px';
        titleInp.style.border = p.conflicts.title ? '1px solid #ef4444' : '1px solid transparent';
        titleInp.style.background = p.conflicts.title ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)';
        titleInp.oninput = () => this.updatePromptField(p.id, 'title', titleInp.value);

        // Shortcut Input
        const quickInp = document.createElement('input');
        quickInp.id = `quick-${p.id}`; // Add unique ID
        quickInp.value = p.quick || '';
        quickInp.placeholder = 'No shortcut';
        quickInp.style.width = '80px';
        quickInp.style.fontSize = '11px';
        quickInp.style.padding = '4px';
        quickInp.style.border = p.conflicts.shortcut ? '1px solid #ef4444' : '1px solid transparent';
        quickInp.style.background = p.conflicts.shortcut ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)';
        quickInp.oninput = () => this.updatePromptField(p.id, 'quick', quickInp.value);

        top.append(cb, titleInp, quickInp);
        row.append(top);

        // Body Warning (Amber)
        if (p.conflicts.body && this.selectedIds.has(p.id)) {
            const warn = document.createElement('div');
            // Display the matching title in the warning
            warn.textContent = `⚠ Content matches existing: "${p.conflicts.body}"`;
            warn.style.fontSize = '10px';
            warn.style.color = '#f59e0b';
            warn.style.marginLeft = '24px';
            warn.style.fontWeight = '500';
            row.append(warn);
        }

        return row;
    }

    private updatePromptField(id: string, field: 'title' | 'quick', value: string) {
        const p = this.validatedPrompts.find(x => x.id === id);
        if (!p) return;
        (p as any)[field] = value;
        
        // Capture focus state
        const activeEl = this.shadow.activeElement as HTMLInputElement;
        const activeId = activeEl?.id;
        const cursorStart = activeEl?.selectionStart;
        const cursorEnd = activeEl?.selectionEnd;

        // Re-validate this specific prompt
        const titleMatch = this.store.prompts.some(local => local.title.trim().toLowerCase() === p.title.trim().toLowerCase());
        const shortcutMatch = p.quick 
            ? this.store.prompts.some(local => local.quick?.trim().toLowerCase() === p.quick?.trim().toLowerCase()) 
            : false;
        
        // Re-check body match title (incase local prompts changed)
        const matchingBodyPrompt = this.store.prompts.find(local => local.text.trim() === p.text.trim());
        
        p.conflicts.title = titleMatch;
        p.conflicts.shortcut = shortcutMatch;
        p.conflicts.body = matchingBodyPrompt ? matchingBodyPrompt.title : null; // Update the title reference

        this.renderPreview();

        // Restore focus and cursor
        if (activeId) {
            const newEl = this.shadow.getElementById(activeId) as HTMLInputElement;
            if (newEl) {
                newEl.focus();
                if (cursorStart !== null && cursorEnd !== null) {
                    newEl.setSelectionRange(cursorStart, cursorEnd);
                }
            }
        }
    }

    private checkGlobalClashes(): boolean {
        return this.validatedPrompts.some(p => 
            this.selectedIds.has(p.id) && (p.conflicts.title || p.conflicts.shortcut)
        );
    }

    private handleSelection(id: string, isFolder: boolean, isChecked: boolean) {
        if (isChecked) {
            this.selectedIds.add(id);
            if (isFolder) this.selectChildren(id);
            this.selectAncestors(id);
        } else {
            this.selectedIds.delete(id);
            if (isFolder) this.unselectChildren(id);
        }
        this.renderPreview();
    }

    private selectChildren(folderId: string) {
        this.validatedPrompts.filter(p => p.parentId === folderId).forEach(p => this.selectedIds.add(p.id));
        this.validatedFolders.filter(f => f.parentId === folderId).forEach(f => {
            this.selectedIds.add(f.id);
            this.selectChildren(f.id);
        });
    }

    private selectAncestors(itemId: string) {
        const p = this.validatedPrompts.find(x => x.id === itemId);
        const f = this.validatedFolders.find(x => x.id === itemId);
        const parentId = p ? p.parentId : (f ? f.parentId : null);
        if (parentId) {
            this.selectedIds.add(parentId);
            this.selectAncestors(parentId);
        }
    }

    private unselectChildren(folderId: string) {
        this.validatedPrompts.filter(p => p.parentId === folderId).forEach(p => this.selectedIds.delete(p.id));
        this.validatedFolders.filter(f => f.parentId === folderId).forEach(f => {
            this.selectedIds.delete(f.id);
            this.unselectChildren(f.id);
        });
    }
}
