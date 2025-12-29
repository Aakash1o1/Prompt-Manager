Fix: Sidebar Expansion Logic
Objective:
Allow renderTree to trigger on folder updates regardless of the mode.
Enable clicking the folder row (not just the chevron) to toggle expansion in Export/Move modes for better UX.
Files to Modify:
src/content/components/Sidebar.ts
Tasks:
Update src/content/components/Sidebar.ts
Replace the mount method and the createRow method (specifically the click handler section).
code
TypeScript
// src/content/components/Sidebar.ts

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#sidebar');
        if (!this.container) return;
        this.renderSkeleton();
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        this.setupListeners();
        
        // FIX 1: Remove the mode checks. 
        // renderTree handles specific mode rendering internally, so it's safe to call.
        this.store.subscribe('prompts_updated', () => this.renderTree());
        this.store.subscribe('folders_updated', () => this.renderTree());
        
        this.renderTree();
    }

    // ... (Keep renderSkeleton, setupListeners, renderTree, renderFoldersRecursively, renderSearchNodes, renderUncategorizedGroup same) ...

    private createRow(opts: any) {
        // ... (Keep element creation, checkbox, chevron, icon, label logic same) ...
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type);
        
        if (this.mode === 'move' && opts.isSelected) row.classList.add('destination');
        if (this.mode === 'export' && opts.isSelected) row.classList.add('selected');
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
                this.toggleExportSelection(opts.id, opts.type, cb.checked);
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

        // FIX 2: Updated Click Handlers for Export/Move
        row.onclick = () => {
            // FOLDER CLICK LOGIC
            if (opts.type === 'folder') {
                if (this.mode === 'move') {
                    // In Move Mode: Select as destination
                    this.targetFolderId = opts.id;
                    this.renderTree();
                } else {
                    // In Normal AND Export Mode: Toggle Expansion
                    this.store.toggleFolderExpansion(opts.id);
                }
            } 
            // PROMPT CLICK LOGIC
            else if (opts.type === 'prompt') {
                if (this.mode === 'normal') {
                    this.activeId = opts.id;
                    this.renderTree();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
                } else if (this.mode === 'export') {
                    this.activeId = opts.id;
                    // Visual active state update
                    this.listContainer?.querySelectorAll('.tree-row').forEach(r => r.classList.remove('active'));
                    row.classList.add('active');
                    this.shadow.dispatchEvent(new CustomEvent('workspace-preview-export', { detail: { promptId: opts.id } }));
                }
            }
        };

        // ... (Keep Kebab/Add Button logic same) ...
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
