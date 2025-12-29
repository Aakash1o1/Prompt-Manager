
Sidebar (Sidebar.ts):

Fix Folder collapsing in Normal Mode.

Fix Selection Logic (Unchecking a child unchecks the parent).

Add Checkboxes to Import Mode.

Filter Import Logic to only process selected items.

Workspace (Workspace.ts):

Redesign previewExport to look exactly like the Editor (Read-only).

Redesign resolveImport to look like the Editor (Editable, Red/Green borders, inline errors).

Styles (styles.ts):

Fix the unreadable title color.

Add styles for the new validation states.

1. Update Styles (src/content/styles.ts)

Update your CSS to fix readability and handle the new "Editor-like" states for import/export.

code
TypeScript
download
content_copy
expand_less
// src/content/styles.ts

// ... (Existing styles) ...

/* FIX: Ensure titles in all modes are readable */
.sb-move-title {
  display: none;
  font-weight: 700;
  font-size: 13px;
  color: var(--txt-primary); /* Was txt-muted or undefined previously */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ... (Existing Move Mode styles) ... */

/* --- UPDATED WORKSPACE VALIDATION --- */
/* For Import Resolution */
.ws-input.error {
  border-color: var(--danger) !important;
  background: rgba(239, 68, 68, 0.05);
}
.ws-input.success {
  border-color: var(--green, #10b981) !important;
}

.validation-msg {
  font-size: 11px;
  margin-top: 4px;
  margin-left: 2px;
  display: block;
}
.validation-msg.error { color: var(--danger); }
.validation-msg.warning { color: #f59e0b; }

/* Read-only inputs for Preview */
.ws-title-input:read-only,
.ws-input:read-only,
.ws-editor-body:read-only {
  cursor: default;
  opacity: 0.8;
}
.ws-editor-body:read-only {
    user-select: text; /* Allow copying */
}
2. Update Sidebar Logic (src/content/components/Sidebar.ts)

I have rewritten toggleExportSelection to handle the parent unchecking, added checkboxes to renderImportNode, and fixed the folder toggle logic.

code
TypeScript
download
content_copy
expand_less
// src/content/components/Sidebar.ts
import { Component } from './Component';
import { Prompt, Folder, ValidatedPrompt, ValidatedFolder } from '../store';
import { ICONS } from '../icons';
import { getVisibleIds } from '../utils/searchTree';

export class Sidebar extends Component {
    private container: HTMLElement | null = null;
    private listContainer: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    private magicDropdown: HTMLElement | null = null;
    
    private mode: 'normal' | 'move' | 'export' | 'import' = 'normal';
    
    private activeId: string | null = null;
    private movingPromptId: string | null = null;
    private targetFolderId: string | null = null;

    public exportSelectedIds: Set<string> = new Set();
    // NEW: Selection for Import
    public importSelectedIds: Set<string> = new Set();

    private importData: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#sidebar');
        if (!this.container) return;
        this.renderSkeleton();
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        this.setupListeners();
        
        this.store.subscribe('prompts_updated', () => { if(this.mode === 'normal') this.renderTree(); });
        this.store.subscribe('folders_updated', () => { if(this.mode === 'normal') this.renderTree(); });
        
        this.renderTree();
    }

    // --- MODE SWITCHING ---
    public setNormalMode() {
        this.mode = 'normal';
        this.container?.classList.remove('mode-move', 'mode-export', 'mode-import');
        this.renderSkeleton();
        this.setupListeners();
        this.renderTree();
    }

    public startMoveMode(promptId: string) {
        this.mode = 'move';
        this.movingPromptId = promptId;
        const p = this.store.prompts.find(x => x.id === promptId);
        this.targetFolderId = p ? (p.parentId || null) : null;
        this.container?.classList.add('mode-move');
        this.renderSkeleton();
        this.setupListeners();
        this.renderTree();
    }

    public startExportMode() {
        this.mode = 'export';
        this.exportSelectedIds = new Set([
            ...this.store.prompts.map(p => p.id),
            ...this.store.folders.map(f => f.id)
        ]);
        this.container?.classList.add('mode-export');
        this.renderSkeleton();
        this.setupListeners();
        this.renderTree();
    }

    public startImportMode(data: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] }) {
        this.mode = 'import';
        this.importData = data;
        // Default: Select All
        this.importSelectedIds = new Set([
            ...data.prompts.map(p => p.id),
            ...data.folders.map(f => f.id)
        ]);
        this.container?.classList.add('mode-import');
        this.renderSkeleton();
        this.setupListeners();
        this.renderTree();
    }

    public refreshImportTree() {
        if (this.mode === 'import') this.renderTree();
    }

    public getImportPrompt(id: string): ValidatedPrompt | undefined {
        return this.importData?.prompts.find(p => p.id === id);
    }

    public getImportData() {
        return this.importData;
    }

    // --- RENDERING ---
    private renderSkeleton() {
        if (!this.container) return;
        
        let headerHTML = '';
        let footerHTML = '';

        if (this.mode === 'normal') {
            headerHTML = `
                <div class="sb-search-wrapper">
                    <span class="sb-search-icon">${ICONS.search}</span>
                    <input type="text" class="sb-search-input" placeholder="Search prompts..." spellcheck="false">
                </div>
                <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>`;
            footerHTML = `
                <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>`;
        } else if (this.mode === 'move') {
            headerHTML = `<div class="sb-move-title">Select Destination</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Move Here</button>
                </div>`;
        } else if (this.mode === 'export') {
            headerHTML = `<div class="sb-move-title">Select Items to Export</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Export</button>
                </div>`;
        } else if (this.mode === 'import') {
            headerHTML = `<div class="sb-move-title">Select Items to Import</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Finalize Import</button>
                </div>`;
        }

        this.container.innerHTML = `
            <div class="sb-header">${headerHTML}</div>
            <div class="magic-dropdown" id="magic-dropdown"></div>
            <div class="sb-list"></div>
            <div class="sb-footer">${footerHTML}</div>
        `;
        
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        this.magicDropdown = this.container.querySelector('#magic-dropdown') as HTMLElement | null;
    }

    private setupListeners() {
        // ... (Keep existing Listeners for Magic/Settings/Cancel) ...
        this.container?.querySelector('#btn-cancel')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel'));
        });
        
        // Confirm Button Logic
        this.container?.querySelector('#btn-confirm')?.addEventListener('click', async () => {
            if (this.mode === 'move' && this.movingPromptId) {
                await this.store.updatePrompt(this.movingPromptId, { parentId: this.targetFolderId });
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Moved' } }));
                this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel'));
            } else if (this.mode === 'export') {
                this.shadow.dispatchEvent(new CustomEvent('app-exec-export'));
            } else if (this.mode === 'import') {
                // Check if any SELECTED item has a conflict
                const data = this.getImportData();
                if (!data) return;
                
                const hasRed = data.prompts.some(p => 
                    this.importSelectedIds.has(p.id) && (p.conflicts.title || p.conflicts.shortcut)
                );

                if (hasRed) {
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Resolve red conflicts first' } }));
                    return; // Block
                }

                this.shadow.dispatchEvent(new CustomEvent('app-exec-import'));
            }
        });

        // ... (Rest of listeners: Search, Magic, New Prompt etc.) ...
        if (this.mode === 'normal') {
            this.searchInput?.addEventListener('input', () => {
                this.store.setFilter(this.searchInput!.value);
                this.renderTree();
            });
            this.container?.querySelector('#btn-new-root')?.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('workspace-new-prompt', { detail: { parentId: null } }));
            });
            this.container?.querySelector('#btn-settings')?.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('workspace-settings'));
            });
            
            // Magic logic (simplified for brevity, ensure you keep full implementation)
            const magicBtn = this.container?.querySelector('#btn-magic');
            if(magicBtn) {
                 magicBtn.addEventListener('click', (e) => { e.stopPropagation(); this.magicDropdown?.classList.toggle('open'); });
            }
        }
    }

    private renderTree() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        if (this.mode === 'import' && this.importData) {
            this.renderImportNode(null, 0);
            return;
        }

        const filter = this.store.filterText.trim().toLowerCase();
        if (filter && this.mode === 'normal') {
            const visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
            if (visibleIds.size === 0) {
                this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
            } else {
                this.renderSearchNodes(null, 0, visibleIds);
            }
            return;
        }

        this.renderFoldersRecursively(null, 0);

        const rootPrompts = this.store.prompts.filter(p => p.parentId === null);
        if (rootPrompts.length > 0 || this.mode === 'move') {
            const header = document.createElement('div');
            header.className = 'uncategorized-header';
            header.textContent = 'Uncategorized';
            if (this.mode === 'move' && this.targetFolderId === null) header.classList.add('selected');
            if (this.mode === 'move') {
                header.onclick = () => { this.targetFolderId = null; this.renderTree(); };
            }
            this.listContainer.appendChild(header);

            rootPrompts.forEach(p => {
                const row = this.createRow({
                    id: p.id, name: p.title, icon: ICONS.prompt, type: 'prompt', depth: 0, isPinned: p.isPinned
                });
                this.listContainer!.appendChild(row);
            });
        }
    }

    private renderFoldersRecursively(parentId: string | null, depth: number) {
        const folders = this.store.folders.filter(f => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));

        folders.forEach(f => {
            const isExpanded = f.isExpanded || false;
            const isSelected = this.mode === 'move' ? (this.targetFolderId === f.id) : 
                               this.mode === 'export' ? this.exportSelectedIds.has(f.id) : false;

            const row = this.createRow({
                id: f.id, name: f.name, icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
                type: 'folder', depth, isExpanded, isSelected
            });
            this.listContainer!.appendChild(row);

            if (isExpanded) {
                this.renderFoldersRecursively(f.id, depth + 1);
                const children = this.store.prompts.filter(p => p.parentId === f.id);
                children.forEach(p => {
                    const pRow = this.createRow({
                        id: p.id, name: p.title, icon: ICONS.prompt, type: 'prompt', depth: depth + 1, isPinned: p.isPinned
                    });
                    this.listContainer!.appendChild(pRow);
                });
            }
        });
    }

    // Keep renderSearchNodes... (omitted for brevity, it stays same)
    private renderSearchNodes(parentId: string | null, depth: number, visibleIds: Set<string>) {
        // ... (Keep existing implementation)
        const folders = this.store.folders.filter(f => f.parentId === parentId);
        const prompts = this.store.prompts.filter(p => p.parentId === parentId);
        folders.forEach(f => {
            if (!visibleIds.has(f.id)) return;
            this.listContainer!.appendChild(this.createRow({
                id: f.id, name: f.name, icon: ICONS.folderOpen, type: 'folder', depth, isExpanded: true
            }));
            this.renderSearchNodes(f.id, depth + 1, visibleIds);
        });
        prompts.forEach(p => {
            if (!visibleIds.has(p.id)) return;
            this.listContainer!.appendChild(this.createRow({
                id: p.id, name: p.title, icon: ICONS.prompt, type: 'prompt', depth, isPinned: p.isPinned
            }));
        });
    }

    private createRow(opts: any) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type);
        
        if (this.mode === 'move' && opts.isSelected) row.classList.add('destination');
        if (this.mode === 'export' && opts.isSelected) row.classList.add('selected'); // Visual only
        if (this.mode === 'normal' && this.activeId === opts.id) row.classList.add('active');

        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        // Checkbox (Export)
        if (this.mode === 'export') {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'sb-checkbox';
            cb.checked = this.exportSelectedIds.has(opts.id);
            cb.onclick = (e) => {
                e.stopPropagation();
                // Toggle Logic
                this.toggleSelection(this.exportSelectedIds, opts.id, opts.type, cb.checked);
            };
            row.appendChild(cb);
        }

        // Chevron
        if (opts.type === 'folder') {
            const chev = document.createElement('span');
            chev.innerHTML = opts.isExpanded ? ICONS.chevronDown : ICONS.chevronRight;
            chev.style.marginRight = '6px';
            chev.style.opacity = '0.5';
            chev.onclick = (e) => { e.stopPropagation(); this.store.toggleFolderExpansion(opts.id); };
            row.appendChild(chev);
        } else {
            const sp = document.createElement('span'); sp.style.width = '18px'; row.appendChild(sp);
        }

        // Icon
        const icon = document.createElement('div');
        icon.className = 'row-icon';
        icon.innerHTML = (opts.isPinned && this.mode === 'normal') ? ICONS.pin : opts.icon;
        if (opts.isPinned && this.mode === 'normal') icon.style.color = 'var(--accent)';
        row.appendChild(icon);

        // Label
        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = opts.name;
        row.appendChild(lbl);

        // Click Handler
        row.onclick = () => {
            if (this.mode === 'move' && opts.type === 'folder') {
                this.targetFolderId = opts.id;
                this.renderTree();
            } else if (this.mode === 'normal') {
                if (opts.type === 'folder') {
                    // FIX: Ensure clicking row toggles folder
                    this.store.toggleFolderExpansion(opts.id);
                } else {
                    this.activeId = opts.id;
                    this.renderTree();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
                }
            } else if (this.mode === 'export' && opts.type === 'prompt') {
                this.activeId = opts.id;
                this.renderTree(); // Highlight
                this.shadow.dispatchEvent(new CustomEvent('workspace-preview-export', { detail: { promptId: opts.id } }));
            }
        };

        // ... (Keep existing Kebab/Add logic) ...
        if (this.mode === 'normal' && opts.type === 'prompt') {
            const acts = document.createElement('div');
            acts.className = 'row-actions';
            const kebab = document.createElement('button');
            kebab.className = 'icon-btn';
            kebab.innerHTML = ICONS.kebab;
            kebab.onclick = (e) => { e.stopPropagation(); this.showContextMenu(e, opts.id, opts.isPinned); };
            acts.appendChild(kebab);
            row.appendChild(acts);
        }
        if (this.mode === 'normal' && opts.type === 'folder') {
            const acts = document.createElement('div');
            acts.className = 'row-actions';
            const addBtn = document.createElement('button');
            addBtn.className = 'icon-btn';
            addBtn.innerHTML = ICONS.plus;
            addBtn.title = 'Create inside';
            addBtn.onclick = (e) => {
                e.stopPropagation();
                this.shadow.dispatchEvent(new CustomEvent('workspace-new-prompt', { detail: { parentId: opts.id } }));
            };
            acts.appendChild(addBtn);
            row.appendChild(acts);
        }

        return row;
    }

    // --- SELECTION LOGIC (Shared by Import/Export) ---
    private toggleSelection(set: Set<string>, id: string, type: 'folder'|'prompt', checked: boolean) {
        if (checked) {
            set.add(id);
            if (type === 'folder') this.selectChildren(set, id);
            // Optional: Select Parent? No, usually distinct.
        } else {
            set.delete(id);
            if (type === 'folder') this.unselectChildren(set, id);
            
            // FIX: If child unselected, unselect parent
            this.unselectParent(set, id);
        }
        this.renderTree();
    }

    private selectChildren(set: Set<string>, folderId: string) {
        // Find prompts/folders in store OR importData based on mode
        const isImport = this.mode === 'import';
        const prompts = isImport ? this.importData!.prompts : this.store.prompts;
        const folders = isImport ? this.importData!.folders : this.store.folders;

        prompts.filter(p => p.parentId === folderId).forEach(p => set.add(p.id));
        folders.filter(f => f.parentId === folderId).forEach(f => {
            set.add(f.id);
            this.selectChildren(set, f.id);
        });
    }

    private unselectChildren(set: Set<string>, folderId: string) {
        const isImport = this.mode === 'import';
        const prompts = isImport ? this.importData!.prompts : this.store.prompts;
        const folders = isImport ? this.importData!.folders : this.store.folders;

        prompts.filter(p => p.parentId === folderId).forEach(p => set.delete(p.id));
        folders.filter(f => f.parentId === folderId).forEach(f => {
            set.delete(f.id);
            this.unselectChildren(set, f.id);
        });
    }

    private unselectParent(set: Set<string>, childId: string) {
        const isImport = this.mode === 'import';
        const prompts = isImport ? this.importData!.prompts : this.store.prompts;
        const folders = isImport ? this.importData!.folders : this.store.folders;

        // Find parent
        const pObj = prompts.find(p => p.id === childId);
        const fObj = folders.find(f => f.id === childId);
        const parentId = pObj ? pObj.parentId : (fObj ? fObj.parentId : null);

        if (parentId && set.has(parentId)) {
            set.delete(parentId);
            this.unselectParent(set, parentId); // Recurse up
        }
    }

    // --- IMPORT RENDERER ---
    private renderImportNode(parentId: string | null, depth: number) {
        if (!this.importData) return;
        const folders = this.importData.folders.filter(f => f.parentId === parentId);
        const prompts = this.importData.prompts.filter(p => p.parentId === parentId);

        folders.forEach(f => {
            const row = this.createImportRow(f.name, 'folder', depth, f.id, false);
            this.listContainer!.appendChild(row);
            this.renderImportNode(f.id, depth + 1);
        });

        prompts.forEach(p => {
            const hasConflict = p.conflicts.title || p.conflicts.shortcut;
            const hasBodyMatch = p.conflicts.body;
            const row = this.createImportRow(p.title, 'prompt', depth, p.id, hasConflict, hasBodyMatch);
            this.listContainer!.appendChild(row);
        });
    }

    private createImportRow(name: string, type: string, depth: number, id: string, isConflict: boolean, isWarning?: string | null) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.style.paddingLeft = `${12 + (depth * 16)}px`;
        if (this.activeId === id) row.classList.add('active');

        // NEW: Checkbox for Import
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sb-checkbox';
        cb.checked = this.importSelectedIds.has(id);
        cb.onclick = (e) => {
            e.stopPropagation();
            this.toggleSelection(this.importSelectedIds, id, type as any, cb.checked);
        };
        row.appendChild(cb);

        // Status Dot
        const dot = document.createElement('div');
        dot.className = `status-dot ${isConflict ? 'red' : (isWarning ? 'amber' : 'green')}`;
        row.appendChild(dot);

        // Icon
        const icon = document.createElement('div');
        icon.className = 'row-icon';
        icon.innerHTML = type === 'folder' ? ICONS.folder : ICONS.prompt;
        row.appendChild(icon);

        // Label
        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = name;
        row.appendChild(lbl);

        row.onclick = () => {
            if (type === 'prompt') {
                this.activeId = id;
                this.renderTree(); 
                this.shadow.dispatchEvent(new CustomEvent('workspace-resolve-import', { detail: { promptId: id } }));
            }
        };

        return row;
    }
    // ... showContextMenu (keep existing)
    private showContextMenu(e: MouseEvent, promptId: string, isPinned: boolean) {
        const existing = this.shadow.querySelector('.ctx-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        Object.assign(menu.style, {
            position: 'fixed', top: `${e.clientY}px`, left: `${e.clientX}px`,
            background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)',
            borderRadius: '6px', padding: '4px', zIndex: '2147483647',
            display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '120px'
        });
        menu.className = 'ctx-menu';

        const createItem = (label: string, onClick: () => void, isDanger = false) => {
            const item = document.createElement('div');
            item.textContent = label;
            Object.assign(item.style, {
                padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
                color: isDanger ? 'var(--danger)' : 'var(--txt-primary)', borderRadius: '4px'
            });
            item.onmouseenter = () => item.style.background = 'var(--bg-hover)';
            item.onmouseleave = () => item.style.background = 'transparent';
            item.onclick = (ev) => { ev.stopPropagation(); onClick(); menu.remove(); };
            return item;
        };

        menu.appendChild(createItem(isPinned ? 'Unpin' : 'Pin', async () => {
            try { await this.store.togglePin(promptId); } catch(err: any) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: err.message } }));
            }
        }));
        menu.appendChild(createItem('Move To...', () => this.startMoveMode(promptId)));
        menu.appendChild(createItem('Delete', async () => {
            if (confirm('Delete prompt?')) {
                await this.store.deletePrompt(promptId);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Deleted' } }));
            }
        }, true));

        const close = () => { menu.remove(); document.removeEventListener('click', close); };
        setTimeout(() => document.addEventListener('click', close), 0);
        this.shadow.appendChild(menu);
    }
}
3. Update Workspace (src/content/components/Workspace.ts)

I've rewritten previewExport and resolveImport to reuse the look and feel of renderEditor, removing the "Boxy" look and using inline validation instead.

code
TypeScript
download
content_copy
expand_less
// src/content/components/Workspace.ts
import { Component } from './Component';
import { Store } from '../store';
import { Prompt } from '../store';
import { ICONS } from '../icons';
import { ControlPanel } from './ControlPanel';

export class Workspace extends Component {
    // ... existing props (container, draftPrompt, etc.)
    private container: HTMLElement | null = null;
    private currentMode: 'empty' | 'editor' | 'settings' = 'empty';
    private draftPrompt: Partial<Prompt> = {};
    private isDirty: boolean = false;
    private originalPromptId: string | null = null;
    private controlPanel: ControlPanel;

    constructor(store: Store, shadow: ShadowRoot) {
        super(store, shadow);
        this.controlPanel = new ControlPanel(store, shadow);
    }

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#workspace');
        if (!this.container) return;
        this.renderEmpty();
    }

    public openSettings() {
        if (this.checkUnsavedChanges()) return;
        this.currentMode = 'settings';
        if (this.container) this.controlPanel.mount(this.container);
    }

    public openEditor(promptId: string | null, parentId: string | null = null) {
        if (this.checkUnsavedChanges()) return;
        this.currentMode = 'editor';
        this.originalPromptId = promptId;
        this.isDirty = false;

        if (promptId) {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) this.draftPrompt = { ...p };
        } else {
            this.draftPrompt = { title: '', text: '', quick: '', parentId: parentId };
        }
        this.renderEditor();
    }

    // ... renderEmpty, renderEditor, populateFolderSelect, setupEditorListeners, save, delete, checkUnsavedChanges ...
    // (KEEP THESE METHODS AS THEY WERE IN PREVIOUS STEP 3)
    private renderEmpty() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="ws-empty">
                <div style="font-size: 24px; opacity: 0.2;">${ICONS.prompt}</div>
                <div>Select a prompt to edit</div>
            </div>
        `;
    }

    private renderEditor() {
        if (!this.container) return;
        const p = this.draftPrompt;
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" id="ws-title" class="ws-title-input" placeholder="Untitled Prompt" value="${p.title || ''}" autocomplete="off">
                <div class="ws-meta-row">
                    <input type="text" id="ws-quick" class="ws-input" placeholder="Shortcut (.code)" value="${p.quick || ''}" style="width: 140px;" autocomplete="off">
                    <select id="ws-folder" class="ws-select"><option value="">(Root)</option></select>
                </div>
            </div>
            <textarea id="ws-body" class="ws-editor-body" placeholder="Type your prompt here..." spellcheck="false">${p.text || ''}</textarea>
            <div class="ws-footer">
                <button id="ws-delete" class="btn-ghost" style="margin-right:auto; color:var(--danger); ${!this.originalPromptId ? 'display:none' : ''}">Delete</button>
                <button id="ws-cancel" class="btn-ghost">Cancel</button>
                <button id="ws-save" class="btn-primary">Save Changes</button>
            </div>
        `;
        this.populateFolderSelect();
        this.setupEditorListeners();
        this.focusTitle();
    }

    private populateFolderSelect() {
        const select = this.container?.querySelector('#ws-folder') as HTMLSelectElement;
        if (!select) return;
        const addOptions = (parentId: string | null, depth: number) => {
            const children = this.store.folders.filter(f => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
            children.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = `${'\u00A0'.repeat(depth * 3)}📁 ${f.name}`;
                if (this.draftPrompt.parentId === f.id) opt.selected = true;
                select.appendChild(opt);
                addOptions(f.id, depth + 1);
            });
        };
        addOptions(null, 0);
    }

    private setupEditorListeners() {
        const titleInp = this.container?.querySelector('#ws-title') as HTMLInputElement;
        const quickInp = this.container?.querySelector('#ws-quick') as HTMLInputElement;
        const bodyInp = this.container?.querySelector('#ws-body') as HTMLTextAreaElement;
        const folderInp = this.container?.querySelector('#ws-folder') as HTMLSelectElement;
        const markDirty = () => { this.isDirty = true; };
        titleInp.oninput = (e) => { this.draftPrompt.title = (e.target as HTMLInputElement).value; markDirty(); };
        quickInp.oninput = (e) => { this.draftPrompt.quick = (e.target as HTMLInputElement).value; markDirty(); };
        bodyInp.oninput = (e) => { this.draftPrompt.text = (e.target as HTMLTextAreaElement).value; markDirty(); };
        folderInp.onchange = (e) => { this.draftPrompt.parentId = (e.target as HTMLSelectElement).value || null; markDirty(); };
        this.container?.querySelector('#ws-save')?.addEventListener('click', () => this.save());
        this.container?.querySelector('#ws-cancel')?.addEventListener('click', () => { if (this.checkUnsavedChanges()) return; this.renderEmpty(); });
        this.container?.querySelector('#ws-delete')?.addEventListener('click', () => this.delete());
    }

    private async save() {
        const title = this.draftPrompt.title?.trim();
        if (!title) { this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title is required' } })); return; }
        try {
            if (this.originalPromptId) { await this.store.updatePrompt(this.originalPromptId, this.draftPrompt); } 
            else { await this.store.addPrompt(title, this.draftPrompt.text || '', this.draftPrompt.quick || '', [], this.draftPrompt.parentId); }
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Saved' } }));
            this.isDirty = false;
            if (!this.originalPromptId) this.renderEmpty(); 
        } catch (e: any) { this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message } })); }
    }

    private async delete() {
        if (!this.originalPromptId) return;
        if (confirm('Delete this prompt?')) { await this.store.deletePrompt(this.originalPromptId); this.renderEmpty(); }
    }

    private checkUnsavedChanges(): boolean {
        if (this.currentMode === 'editor' && this.isDirty) {
            if (!confirm('You have unsaved changes. Discard them?')) return true;
        }
        return false;
    }

    private focusTitle() { setTimeout(() => { const el = this.container?.querySelector('#ws-title') as HTMLElement; el?.focus(); }, 50); }


    // --- EXPORT PREVIEW (Read Only Editor) ---
    public previewExport(promptId: string) {
        if (!this.container) return;
        const p = this.store.prompts.find(x => x.id === promptId);
        if (!p) return;

        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" class="ws-title-input" value="${p.title}" readonly>
                <div class="ws-meta-row">
                    <input type="text" class="ws-input" value="${p.quick || ''}" readonly style="width: 140px;">
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${p.text}</textarea>
        `;
    }

    // --- IMPORT RESOLUTION (Editable, Inline Errors) ---
    public resolveImport(prompt: any, onUpdate: (p: any) => void) {
        if (!this.container) return;

        const { title, shortcut, body } = prompt.conflicts;

        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" id="res-title" class="ws-title-input ${title ? 'error' : 'success'}" value="${prompt.title}">
                <div id="err-title" class="validation-msg error" style="display:${title?'block':'none'}">Title already exists</div>
                <div id="warn-body" class="validation-msg warning" style="display:${body?'block':'none'}">Content matches existing prompt: "${body}"</div>

                <div class="ws-meta-row" style="margin-top:12px;">
                    <div>
                        <input type="text" id="res-quick" class="ws-input ${shortcut ? 'error' : (prompt.quick ? 'success' : '')}" value="${prompt.quick || ''}" placeholder="Shortcut" style="width: 140px;">
                        <div id="err-quick" class="validation-msg error" style="display:${shortcut?'block':'none'}">Shortcut taken</div>
                    </div>
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${prompt.text}</textarea>
        `;

        const titleInp = this.container.querySelector('#res-title') as HTMLInputElement;
        const quickInp = this.container.querySelector('#res-quick') as HTMLInputElement;
        const errTitle = this.container.querySelector('#err-title') as HTMLElement;
        const errQuick = this.container.querySelector('#err-quick') as HTMLElement;

        const handleInput = () => {
            prompt.title = titleInp.value;
            prompt.quick = quickInp.value;

            // Re-validate (Note: Logic duplicated here for UI speed, real validation happens in Sidebar Loop)
            const titleMatch = this.store.prompts.some(p => p.title.trim().toLowerCase() === prompt.title.trim().toLowerCase());
            const quickMatch = prompt.quick ? this.store.prompts.some(p => p.quick?.trim().toLowerCase() === prompt.quick.trim().toLowerCase()) : false;

            prompt.conflicts.title = titleMatch;
            prompt.conflicts.shortcut = quickMatch;

            // UI Update
            titleInp.className = `ws-title-input ${titleMatch ? 'error' : 'success'}`;
            errTitle.style.display = titleMatch ? 'block' : 'none';

            quickInp.className = `ws-input ${quickMatch ? 'error' : (prompt.quick ? 'success' : '')}`;
            errQuick.style.display = quickMatch ? 'block' : 'none';

            onUpdate(prompt); // Update Sidebar Dots
        };

        titleInp.addEventListener('input', handleInput);
        quickInp.addEventListener('input', handleInput);
    }
}
4. Update App Logic (src/content/components/App.ts)

Update app-exec-import to filter by selected IDs.

code
TypeScript
download
content_copy
expand_less
// src/content/components/App.ts -> inside setupListeners

this.shadow.addEventListener('app-exec-import', async () => {
    const data = this.sidebar.getImportData();
    // Use the public accessor for selected IDs
    const selectedIds = this.sidebar.importSelectedIds; 
    
    if (!data) return;

    // Filter by Selection
    const promptsToImport = data.prompts.filter(p => selectedIds.has(p.id));
    const foldersToImport = data.folders.filter(f => selectedIds.has(f.id));

    if (promptsToImport.length === 0 && foldersToImport.length === 0) {
        this.showToast("Nothing selected");
        return;
    }

    // Check for Red Conflicts in SELECTED items only
    const hasRed = promptsToImport.some(p => p.conflicts.title || p.conflicts.shortcut);
    if (hasRed) {
        this.showToast("Resolve red conflicts in selected items");
        return;
    }

    await this.store.finalizeImport(promptsToImport, foldersToImport);
    this.showToast("Import Successful");
    this.sidebar.setNormalMode();
    this.workspace.mount(this.modal as HTMLElement); // Clear workspace
});