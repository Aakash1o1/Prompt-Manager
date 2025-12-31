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
    public importSelectedIds: Set<string> = new Set();

    private importData: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#sidebar');
        if (!this.container) return;
        this.renderSkeleton();
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        this.setupListeners();
        
        this.store.subscribe('prompts_updated', () => this.renderTree());
        this.store.subscribe('folders_updated', () => this.renderTree());
        
        this.renderTree();
    }

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
        this.container?.classList.remove('mode-export', 'mode-import');
        this.shadow.dispatchEvent(new CustomEvent('sidebar-mode-move-started'));
        
        // SIGNAL: Notify tutorial
        window.dispatchEvent(new CustomEvent('tutorial-signal', { 
            detail: { type: 'sidebar-mode-move-started' } 
        }));

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
        this.container?.classList.remove('mode-move', 'mode-import');
        this.renderSkeleton();
        this.setupListeners();
        this.renderTree();
    }

    public startImportMode(data: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] }) {
        this.mode = 'import';
        this.importData = data;
        this.importSelectedIds = new Set([
            ...data.prompts.map(p => p.id),
            ...data.folders.map(f => f.id)
        ]);
        this.container?.classList.add('mode-import');
        this.container?.classList.remove('mode-move', 'mode-export');
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
                <div style="display: flex; gap: 4px;">
                    <button class="icon-btn" id="btn-toggle-expansion" title="Expand/Collapse All">${this.areAllFoldersExpanded() ? ICONS.collapseAll : ICONS.expandAll}</button>
                    <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>
                </div>`;
            footerHTML = `
                <div style="display: flex; gap: 8px;">
                    <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                    <button class="icon-btn" id="btn-new-folder" title="New Folder">${ICONS.folder}</button>
                </div>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>`;
        } else if (this.mode === 'move') {
            headerHTML = `<div class="sb-move-title">Select Destination</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Move Here</button>
                </div>`;
        } else if (this.mode === 'export') {
            headerHTML = `
                <div class="sb-move-title">Select Items to Export</div>
                <div class="sb-selection-toggles">
                    <label class="sb-select-all-label">
                        <input type="checkbox" id="cb-select-all" class="sb-checkbox">
                        <span>Select All</span>
                    </label>
                </div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Export</button>
                </div>`;
        } else if (this.mode === 'import') {
            headerHTML = `
                <div class="sb-move-title">Select Items to Import</div>
                <div class="sb-selection-toggles">
                    <label class="sb-select-all-label">
                        <input type="checkbox" id="cb-select-all" class="sb-checkbox">
                        <span>Select All</span>
                    </label>
                </div>`;
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
        this.container?.querySelector('#btn-cancel')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel'));
        });
        
        this.container?.querySelector('#btn-confirm')?.addEventListener('click', async () => {
            if (this.mode === 'move' && this.movingPromptId) {
                await this.store.updatePrompt(this.movingPromptId, { parentId: this.targetFolderId });
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Moved' } }));
                this.shadow.dispatchEvent(new CustomEvent('app-tutorial-prompt-moved'));
                this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel'));
            } else if (this.mode === 'export') {
                this.shadow.dispatchEvent(new CustomEvent('app-exec-export'));
            } else if (this.mode === 'import') {
                this.shadow.dispatchEvent(new CustomEvent('app-exec-import'));
            }
        });

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

            this.container?.querySelector('#btn-new-folder')?.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('workspace-open-folder-editor', { detail: { folderId: null, parentId: null } }));
            });

            const magicBtn = this.container?.querySelector('#btn-magic');
            if (magicBtn && this.magicDropdown) {
                import('../lib/magicScripts').then(({ MAGIC_SCRIPTS }) => {
                    if(!this.magicDropdown) return;
                    this.magicDropdown.innerHTML = MAGIC_SCRIPTS.map(s => 
                        `<div class="magic-item" data-text="${encodeURIComponent(s.text)}"><span>${s.icon}</span> ${s.name}</div>`
                    ).join('');
                    this.magicDropdown.querySelectorAll('.magic-item').forEach(el => {
                        el.addEventListener('click', () => {
                            const scriptText = decodeURIComponent((el as HTMLElement).dataset.text || '');
                            this.shadow.dispatchEvent(new CustomEvent('app-apply-magic', { detail: { script: scriptText } }));
                            this.magicDropdown?.classList.remove('open');
                        });
                    });
                });
                magicBtn.addEventListener('click', (e) => { e.stopPropagation(); this.magicDropdown?.classList.toggle('open'); });
                document.addEventListener('click', () => this.magicDropdown?.classList.remove('open'));
            }

            this.container?.querySelector('#btn-toggle-expansion')?.addEventListener('click', () => {
                const anyExpanded = this.store.folders.some(f => f.isExpanded);
                this.store.setAllFoldersExpansion(!anyExpanded);
            });
        }

        if (this.mode === 'export' || this.mode === 'import') {
            const cbAll = this.container?.querySelector('#cb-select-all') as HTMLInputElement;
            cbAll?.addEventListener('change', () => {
                this.toggleAllSelection(cbAll.checked);
            });
        }
    }

    private areAllFoldersExpanded(): boolean {
        if (this.store.folders.length === 0) return false;
        return this.store.folders.every(f => f.isExpanded);
    }

    private renderTree() {
        if (!this.listContainer) return;

        // Update header Expansion button icon
        const expBtn = this.container?.querySelector('#btn-toggle-expansion');
        if (expBtn) expBtn.innerHTML = this.store.folders.some(f => f.isExpanded) ? ICONS.collapseAll : ICONS.expandAll;

        // Update header Select All checkbox state
        if (this.mode === 'export' || this.mode === 'import') {
            const cbAll = this.container?.querySelector('#cb-select-all') as HTMLInputElement;
            if (cbAll) {
                const set = this.mode === 'export' ? this.exportSelectedIds : this.importSelectedIds;
                const totalIds = this.mode === 'export' 
                    ? this.store.prompts.length + this.store.folders.length
                    : (this.importData?.prompts.length || 0) + (this.importData?.folders.length || 0);

                cbAll.checked = set.size > 0 && set.size === totalIds;
                cbAll.indeterminate = set.size > 0 && set.size < totalIds;
            }
        }

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
            header.textContent = 'uncategorized';
            if (this.mode === 'move' && this.targetFolderId === null) header.classList.add('selected');
            if (this.mode === 'move') {
                header.onclick = () => { this.targetFolderId = null; this.renderTree(); };
            }
            this.listContainer.appendChild(header);

            rootPrompts.forEach(p => {
                const row = this.createRow({
                    id: p.id, name: p.title, shortcut: p.quick, icon: ICONS.prompt, type: 'prompt', depth: 0, isPinned: p.isPinned
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
                        id: p.id, name: p.title, shortcut: p.quick, icon: ICONS.prompt, type: 'prompt', depth: depth + 1, isPinned: p.isPinned
                    });
                    this.listContainer!.appendChild(pRow);
                });
            }
        });
    }

    private renderSearchNodes(parentId: string | null, depth: number, visibleIds: Set<string>) {
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
                id: p.id, name: p.title, shortcut: p.quick, icon: ICONS.prompt, type: 'prompt', depth, isPinned: p.isPinned
            }));
        });
    }

    private createRow(opts: any) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type);
        
        if (this.mode === 'move' && opts.isSelected) row.classList.add('destination');
        if (this.mode === 'export' && opts.isSelected) row.classList.add('selected');
        if (this.mode === 'normal' && this.activeId === opts.id) row.classList.add('active');

        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        if (this.mode === 'export') {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'sb-checkbox';
            
            const isChecked = this.exportSelectedIds.has(opts.id);
            cb.checked = isChecked;

            // Indeterminate state for folders
            if (opts.type === 'folder' && isChecked) {
                const descendants = this.getAllDescendants(opts.id, this.store.prompts, this.store.folders);
                const allSelected = descendants.every(id => this.exportSelectedIds.has(id));
                if (descendants.length > 0 && !allSelected) {
                    cb.indeterminate = true;
                }
            }

            cb.onclick = (e) => {
                e.stopPropagation();
                this.toggleSelection(this.exportSelectedIds, opts.id, opts.type, cb.checked);
            };
            row.appendChild(cb);
        }

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

        const icon = document.createElement('div');
        icon.className = 'row-icon';
        icon.innerHTML = (opts.isPinned && this.mode === 'normal') ? ICONS.pin : opts.icon;
        if (opts.isPinned && this.mode === 'normal') icon.style.color = 'var(--accent)';
        row.appendChild(icon);

        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = opts.name;
        row.appendChild(lbl);

        if (opts.type === 'prompt' && opts.shortcut) {
            const sh = document.createElement('span');
            sh.className = 'row-shortcut';
            sh.textContent = opts.shortcut;
            row.appendChild(sh);
        }

        row.onclick = () => {
            if (opts.type === 'folder') {
                if (this.mode === 'move') {
                    this.targetFolderId = opts.id;
                    this.renderTree();
                } else {
                    // Normal AND Export: toggle expansion
                    this.store.toggleFolderExpansion(opts.id);
                }
            } else if (opts.type === 'prompt') {
                if (this.mode === 'normal') {
                    this.activeId = opts.id;
                    this.renderTree();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
                } else if (this.mode === 'export') {
                    this.activeId = opts.id;
                    this.listContainer?.querySelectorAll('.tree-row').forEach(r => r.classList.remove('active'));
                    row.classList.add('active');
                    this.shadow.dispatchEvent(new CustomEvent('workspace-preview-export', { detail: { promptId: opts.id } }));
                }
            }
        };

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
            
            const kebab = document.createElement('button');
            kebab.className = 'icon-btn';
            kebab.innerHTML = ICONS.kebab;
            kebab.onclick = (e) => { e.stopPropagation(); this.showFolderContextMenu(e, opts.id); };
            acts.appendChild(kebab);

            row.appendChild(acts);
        }

        return row;
    }

    private toggleSelection(set: Set<string>, id: string, type: 'folder' | 'prompt', checked: boolean) {
        const isImport = this.mode === 'import';
        const sourcePrompts = isImport ? this.importData!.prompts : this.store.prompts;
        const sourceFolders = isImport ? this.importData!.folders : this.store.folders;

        if (checked) {
            set.add(id);
            if (type === 'folder') {
                const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
                descendants.forEach(dId => set.add(dId));
            }
            this.selectAncestors(id, sourcePrompts, sourceFolders, set);
        } else {
            set.delete(id);
            if (type === 'folder') {
                const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
                descendants.forEach(dId => set.delete(dId));
            }
            // Sticky parents: do not deselect ancestors
        }
        this.renderTree();
    }

    private getAllDescendants(folderId: string, allPrompts: any[], allFolders: any[]): string[] {
        let ids: string[] = [];
        const childPrompts = allPrompts.filter(p => p.parentId === folderId);
        const childFolders = allFolders.filter(f => f.parentId === folderId);

        childPrompts.forEach(p => ids.push(p.id));
        childFolders.forEach(f => {
            ids.push(f.id);
            ids = ids.concat(this.getAllDescendants(f.id, allPrompts, allFolders));
        });
        return ids;
    }

    private selectAncestors(itemId: string, allPrompts: any[], allFolders: any[], set: Set<string>) {
        const pObj = allPrompts.find(p => p.id === itemId);
        const fObj = allFolders.find(f => f.id === itemId);
        const parentId = pObj ? pObj.parentId : (fObj ? fObj.parentId : null);

        if (parentId) {
            set.add(parentId);
            this.selectAncestors(parentId, allPrompts, allFolders, set);
        }
    }

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
            const row = this.createImportRow(p.title, 'prompt', depth, p.id, hasConflict, hasBodyMatch, p.quick);
            this.listContainer!.appendChild(row);
        });
    }

    private createImportRow(name: string, type: string, depth: number, id: string, isConflict: boolean, isWarning?: string | null, shortcut?: string) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.style.paddingLeft = `${12 + (depth * 16)}px`;
        if (this.activeId === id) row.classList.add('active');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sb-checkbox';
        
        const isChecked = this.importSelectedIds.has(id);
        cb.checked = isChecked;

        // Indeterminate state for import folders
        if (type === 'folder' && isChecked && this.importData) {
            const descendants = this.getAllDescendants(id, this.importData.prompts, this.importData.folders);
            const allSelected = descendants.every(dId => this.importSelectedIds.has(dId));
            if (descendants.length > 0 && !allSelected) {
                cb.indeterminate = true;
            }
        }

        cb.onclick = (e) => {
            e.stopPropagation();
            this.toggleSelection(this.importSelectedIds, id, type as any, cb.checked);
        };
        row.appendChild(cb);

        const dot = document.createElement('div');
        dot.className = `status-dot ${isConflict ? 'red' : (isWarning ? 'amber' : 'green')}`;
        row.appendChild(dot);

        const icon = document.createElement('div');
        icon.className = 'row-icon';
        icon.innerHTML = type === 'folder' ? ICONS.folder : ICONS.prompt;
        row.appendChild(icon);

        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = name;
        row.appendChild(lbl);

        if (type === 'prompt' && shortcut) {
            const sh = document.createElement('span');
            sh.className = 'row-shortcut';
            sh.textContent = shortcut;
            row.appendChild(sh);
        }

        row.onclick = () => {
            if (type === 'prompt') {
                this.activeId = id;
                this.renderTree();
                this.shadow.dispatchEvent(new CustomEvent('workspace-resolve-import', { detail: { promptId: id } }));
            }
        };

        return row;
    }

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
            try { 
                await this.store.togglePin(promptId); 
                this.shadow.dispatchEvent(new CustomEvent('app-tutorial-pin-toggled'));
            } catch(err: any) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: err.message } }));
            }
        }));
        menu.appendChild(createItem('Copy', () => {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                navigator.clipboard.writeText(p.text);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
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

    private showFolderContextMenu(e: MouseEvent, folderId: string) {
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

        menu.appendChild(createItem('New Prompt', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-new-prompt', { detail: { parentId: folderId } }));
        }));

        menu.appendChild(createItem('New Subfolder', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-open-folder-editor', { detail: { folderId: null, parentId: folderId } }));
        }));

        menu.appendChild(createItem('Rename', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-open-folder-editor', { detail: { folderId: folderId } }));
        }));

        menu.appendChild(createItem('Delete Folder', async () => {
            if (confirm('Delete folder? Prompts and subfolders will move to parent.')) {
                await this.store.deleteFolder(folderId);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Folder deleted' } }));
            }
        }, true));

        const close = () => { menu.remove(); document.removeEventListener('click', close); };
        setTimeout(() => document.addEventListener('click', close), 0);
        this.shadow.appendChild(menu);
    }

    private toggleAllSelection(checked: boolean) {
        const set = this.mode === 'export' ? this.exportSelectedIds : this.importSelectedIds;
        set.clear();
        if (checked) {
            const isImport = this.mode === 'import';
            const prompts = isImport ? this.importData!.prompts : this.store.prompts;
            const folders = isImport ? this.importData!.folders : this.store.folders;
            prompts.forEach(p => set.add(p.id));
            folders.forEach(f => set.add(f.id));
        }
        this.renderTree();
    }
}
