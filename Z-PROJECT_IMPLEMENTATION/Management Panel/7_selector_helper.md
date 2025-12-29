Step 8: Sticky Selection Logic
Objective:
Implement the "Sticky" selection logic for both Import and Export modes.
Implement indeterminate visual state for checkboxes.
Ensure the data source (Store vs ImportData) is switched correctly based on mode.
Files to Modify:
src/content/components/Sidebar.ts
Tasks:
Update src/content/components/Sidebar.ts
Replace the logic helper methods at the bottom of the file (toggleSelection, selectChildrenRecursive, etc.) with the new "Sticky" implementation.
code
TypeScript
// src/content/components/Sidebar.ts

    // ... (Keep existing mount, rendering, listeners) ...

    // --- UPDATED SELECTION LOGIC (Sticky Parent) ---

    private toggleSelection(set: Set<string>, id: string, type: 'folder' | 'prompt', checked: boolean) {
        // Determine Data Source based on Mode
        const isImport = this.mode === 'import';
        const sourcePrompts = isImport ? this.importData!.prompts : this.store.prompts;
        const sourceFolders = isImport ? this.importData!.folders : this.store.folders;

        if (checked) {
            // 1. Select Self
            set.add(id);

            // 2. Select Descendants (Recursively)
            if (type === 'folder') {
                const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
                descendants.forEach(dId => set.add(dId));
            }

            // 3. Select Ancestors (Recursively up)
            this.selectAncestors(id, sourcePrompts, sourceFolders, set);

        } else {
            // 1. Deselect Self
            set.delete(id);

            // 2. Deselect Descendants
            if (type === 'folder') {
                const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
                descendants.forEach(dId => set.delete(dId));
            }

            // 3. DO NOT Deselect Ancestors (Sticky Behavior)
        }

        this.renderTree();
    }

    // Helper: Get all IDs inside a folder (deep)
    private getAllDescendants(folderId: string, allPrompts: any[], allFolders: any[]): string[] {
        let ids: string[] = [];
        
        // Direct Children
        const childPrompts = allPrompts.filter(p => p.parentId === folderId);
        const childFolders = allFolders.filter(f => f.parentId === folderId);

        childPrompts.forEach(p => ids.push(p.id));
        
        childFolders.forEach(f => {
            ids.push(f.id);
            // Recurse
            ids = ids.concat(this.getAllDescendants(f.id, allPrompts, allFolders));
        });

        return ids;
    }

    // Helper: Select parents recursively up to root
    private selectAncestors(itemId: string, allPrompts: any[], allFolders: any[], set: Set<string>) {
        const pObj = allPrompts.find(p => p.id === itemId);
        const fObj = allFolders.find(f => f.id === itemId);
        const parentId = pObj ? pObj.parentId : (fObj ? fObj.parentId : null);

        if (parentId) {
            set.add(parentId);
            this.selectAncestors(parentId, allPrompts, allFolders, set);
        }
    }

    // --- UPDATED RENDER ROW (Handle Indeterminate State) ---

    private createRow(opts: any) {
        // ... (Keep existing element creation: row, padding) ...
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type);
        
        if (this.mode === 'move' && opts.isSelected) row.classList.add('destination');
        if (this.mode === 'export' && opts.isSelected) row.classList.add('selected'); // Visual background
        if (this.mode === 'normal' && this.activeId === opts.id) row.classList.add('active');

        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        // Checkbox Logic (Export)
        if (this.mode === 'export') {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'sb-checkbox';
            
            const isChecked = this.exportSelectedIds.has(opts.id);
            cb.checked = isChecked;

            // Handle Indeterminate State for Folders
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

        // ... (Keep existing Chevron logic) ...
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

        // ... (Keep Icon, Label, Click Handler, Kebab/Add logic EXACTLY as before) ...
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
                    this.store.toggleFolderExpansion(opts.id);
                } else {
                    this.activeId = opts.id;
                    this.renderTree();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
                }
            } else if (this.mode === 'export' && opts.type === 'prompt') {
                this.activeId = opts.id;
                this.listContainer?.querySelectorAll('.tree-row').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                this.shadow.dispatchEvent(new CustomEvent('workspace-preview-export', { detail: { promptId: opts.id } }));
            }
        };

        // Kebab (Normal only)
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

    // --- APPLY SAME LOGIC TO IMPORT ROWS ---

    private createImportRow(name: string, type: string, depth: number, id: string, isConflict: boolean, isWarning?: string | null) {
        // ... (Keep existing element creation) ...
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.style.paddingLeft = `${12 + (depth * 16)}px`;
        if (this.activeId === id) row.classList.add('active');

        // Checkbox (Import)
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sb-checkbox';
        
        const isChecked = this.importSelectedIds.has(id);
        cb.checked = isChecked;

        // Indeterminate Logic for Import
        if (type === 'folder' && isChecked && this.importData) {
            const descendants = this.getAllDescendants(id, this.importData.prompts, this.importData.folders);
            const allSelected = descendants.every(id => this.importSelectedIds.has(id));
            if (descendants.length > 0 && !allSelected) {
                cb.indeterminate = true;
            }
        }

        cb.onclick = (e) => {
            e.stopPropagation();
            this.toggleSelection(this.importSelectedIds, id, type as any, cb.checked);
        };
        row.appendChild(cb);

        // ... (Keep Status Dot, Icon, Label, Click logic) ...
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
