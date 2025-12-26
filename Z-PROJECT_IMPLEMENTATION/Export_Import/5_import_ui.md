Step 04: Import Preview & Conflict Resolution UI
Objective: Build the hierarchical preview list where users can select items, see specific conflict indicators, and edit text inline to resolve clashes.
Files to Modify:
src/content/components/ImportOverlay.ts
Tasks:
1. Add State and Styles to ImportOverlay
Update the ImportOverlay class to track the validated data and define the UI logic for indicators.
code
TypeScript
// src/content/components/ImportOverlay.ts -> Add these properties to the class
private validatedPrompts: ValidatedPrompt[] = [];
private validatedFolders: ValidatedFolder[] = [];
private selectedIds: Set<string> = new Set();
2. Implement the Preview Renderer
Update the handleFile logic to transition to a new renderPreview method instead of just logging to console.
code
TypeScript
// src/content/components/ImportOverlay.ts -> Update handleFile and add renderPreview

private handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string) as BackupData;
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
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Invalid file' } }));
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
    this.area.querySelector('#import-confirm')?.addEventListener('click', () => {
        if (!hasClashes) this.shadow.dispatchEvent(new CustomEvent('start-final-import', { 
            detail: { prompts: this.validatedPrompts, folders: this.validatedFolders, selectedIds: this.selectedIds } 
        }));
    });
}
3. Recursive Tree with Inline Editing
Add these methods to ImportOverlay.ts to render rows with inputs and conflict indicators.
code
TypeScript
// src/content/components/ImportOverlay.ts

private renderTree() {
    const container = this.area?.querySelector('#import-tree-container');
    if (!container) return;
    container.innerHTML = '';
    this.renderNode(null, 0, container);
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
    titleInp.value = p.title;
    titleInp.style.flex = '1';
    titleInp.style.fontSize = '13px';
    titleInp.style.padding = '4px';
    titleInp.style.border = p.conflicts.title ? '1px solid #ef4444' : '1px solid transparent';
    titleInp.style.background = p.conflicts.title ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)';
    titleInp.oninput = () => this.updatePromptField(p.id, 'title', titleInp.value);

    // Shortcut Input
    const quickInp = document.createElement('input');
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
        warn.textContent = '⚠ Content matches an existing prompt';
        warn.style.fontSize = '10px';
        warn.style.color = '#f59e0b';
        warn.style.marginLeft = '24px';
        row.append(warn);
    }

    return row;
}

private updatePromptField(id: string, field: 'title' | 'quick', value: string) {
    const p = this.validatedPrompts.find(x => x.id === id);
    if (!p) return;
    (p as any)[field] = value;
    
    // Re-validate this specific prompt
    const titleMatch = this.store.prompts.some(local => local.title.trim().toLowerCase() === p.title.trim().toLowerCase());
    const shortcutMatch = p.quick 
        ? this.store.prompts.some(local => local.quick?.trim().toLowerCase() === p.quick?.trim().toLowerCase()) 
        : false;
    
    p.conflicts.title = titleMatch;
    p.conflicts.shortcut = shortcutMatch;

    this.renderPreview();
}

private checkGlobalClashes(): boolean {
    return this.validatedPrompts.some(p => 
        this.selectedIds.has(p.id) && (p.conflicts.title || p.conflicts.shortcut)
    );
}

// Reuse selection logic from ExportOverlay
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
