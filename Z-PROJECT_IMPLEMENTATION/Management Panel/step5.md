Step 5: Move Mode Workflow
Objective: Implement the "Move To" feature. When triggered, the Sidebar transforms into a "Destination Picker" (graying out prompts, highlighting folders), and the user can move a prompt to a new folder.
Complexity: LOW/MEDIUM
Files to Modify:
src/content/styles.ts (Visual states for Move Mode).
src/content/components/Sidebar.ts (Mode logic, header/footer swapping).
src/content/components/App.ts (Event wiring).
Tasks:
1. Update Styles (src/content/styles.ts)
Add styles to handle the "Move Mode" visual state (dimmed prompts, selected folders).
code
TypeScript
// src/content/styles.ts -> Append to STYLES string

/* --- MOVE MODE --- */
.sidebar.mode-move .sb-header {
  background: var(--bg-active);
  border-bottom-color: var(--accent);
}

.sidebar.mode-move .tree-row[data-type="prompt"] {
  opacity: 0.3;
  pointer-events: none; /* Disable clicking prompts in move mode */
}

.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.1); /* Light blue hover */
  color: var(--accent);
}

.sidebar.mode-move .tree-row.destination {
  background: var(--accent);
  color: white;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white;
}

/* Hide standard controls in move mode */
.sidebar.mode-move .sb-search-wrapper,
.sidebar.mode-move #btn-magic,
.sidebar.mode-move #btn-settings,
.sidebar.mode-move #btn-new-root {
  display: none !important;
}

/* Show move controls (hidden by default) */
.sb-move-title { display: none; font-weight: 600; font-size: 13px; color: var(--txt-primary); }
.sidebar.mode-move .sb-move-title { display: block; }

.sb-move-actions { display: none; gap: 8px; width: 100%; justify-content: flex-end; }
.sidebar.mode-move .sb-move-actions { display: flex; }

.btn-small {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}
.btn-secondary { background: var(--bg-hover); color: var(--txt-primary); }
.btn-secondary:hover { background: var(--border-default); }
2. Update Sidebar Logic (src/content/components/Sidebar.ts)
Implement the state switching (isMoveMode), selection logic, and the modified render behavior.
code
TypeScript
// src/content/components/Sidebar.ts -> Replace entire file content to integrate move logic cleanly

import { Component } from './Component';
import { Prompt, Folder } from '../store';
import { ICONS } from '../icons';
import { getVisibleIds } from '../utils/searchTree';

export class Sidebar extends Component {
    private container: HTMLElement | null = null;
    private listContainer: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    private magicDropdown: HTMLElement | null = null;
    
    // State
    private activeId: string | null = null;
    
    // Move Mode State
    private isMoveMode: boolean = false;
    private movingPromptId: string | null = null;
    private targetFolderId: string | null = null; // null = Root

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

    // New Public Method called by App
    public startMoveMode(promptId: string) {
        this.isMoveMode = true;
        this.movingPromptId = promptId;
        this.targetFolderId = null; // Default to Root
        this.container?.classList.add('mode-move');
        this.renderTree();
    }

    public stopMoveMode() {
        this.isMoveMode = false;
        this.movingPromptId = null;
        this.targetFolderId = null;
        this.container?.classList.remove('mode-move');
        this.renderTree();
    }

    private renderSkeleton() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="sb-header">
                <!-- Normal Header -->
                <div class="sb-search-wrapper">
                    <span class="sb-search-icon">${ICONS.search}</span>
                    <input type="text" class="sb-search-input" placeholder="Search prompts..." spellcheck="false">
                </div>
                <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>
                
                <!-- Move Mode Header -->
                <div class="sb-move-title">Select Destination</div>
            </div>
            
            <div class="magic-dropdown" id="magic-dropdown"></div>

            <div class="sb-list"></div>

            <div class="sb-footer">
                <!-- Normal Footer -->
                <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>

                <!-- Move Mode Footer -->
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-move-cancel">Cancel</button>
                    <button class="btn-new" id="btn-move-confirm">Move Here</button>
                </div>
            </div>
        `;
    }

    private setupListeners() {
        // ... (Existing Listeners: Search, Settings, Magic - Keep logic from Step 4) ...
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

        // Move Controls
        this.container?.querySelector('#btn-move-cancel')?.addEventListener('click', () => this.stopMoveMode());
        
        this.container?.querySelector('#btn-move-confirm')?.addEventListener('click', async () => {
            if (this.movingPromptId) {
                await this.store.updatePrompt(this.movingPromptId, { parentId: this.targetFolderId });
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Moved successfully' } }));
                this.stopMoveMode();
            }
        });

        // Magic Dropdown Logic (Re-pasting for completeness)
        const magicBtn = this.container?.querySelector('#btn-magic');
        this.magicDropdown = this.container?.querySelector('#magic-dropdown');
        if (this.magicDropdown) {
            import('../lib/magicScripts').then(({ MAGIC_SCRIPTS }) => {
                if(!this.magicDropdown) return;
                this.magicDropdown.innerHTML = MAGIC_SCRIPTS.map(script => `
                    <div class="magic-item" data-text="${encodeURIComponent(script.text)}">
                        <span>${script.icon}</span> ${script.name}
                    </div>
                `).join('');
                this.magicDropdown.querySelectorAll('.magic-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const text = decodeURIComponent((item as HTMLElement).dataset.text || '');
                        navigator.clipboard.writeText(text);
                        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Script copied' } }));
                        this.magicDropdown?.classList.remove('open');
                    });
                });
            });
        }
        magicBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.magicDropdown?.classList.toggle('open'); });
        document.addEventListener('click', () => this.magicDropdown?.classList.remove('open'));
    }

    private renderTree() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        // If Move Mode: Show Root Folder Option
        if (this.isMoveMode) {
            const rootRow = document.createElement('div');
            rootRow.className = 'tree-row';
            if (this.targetFolderId === null) rootRow.classList.add('destination');
            rootRow.style.paddingLeft = '12px';
            rootRow.innerHTML = `<span class="row-icon">${ICONS.folder}</span><span class="row-label">(Root)</span>`;
            rootRow.onclick = () => { this.targetFolderId = null; this.renderTree(); };
            this.listContainer.appendChild(rootRow);
        }

        const filter = this.store.filterText.trim().toLowerCase();
        let visibleIds: Set<string> | null = null;

        if (filter && !this.isMoveMode) { // Disable search filtering in move mode
            visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
            if (visibleIds.size === 0) {
                this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
                return;
            }
        }

        this.renderNode(null, 0, visibleIds);
    }

    private renderNode(parentId: string | null, depth: number, visibleIds: Set<string> | null) {
        const folders = this.store.folders.filter(f => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
        const prompts = this.store.prompts.filter(p => p.parentId === parentId);

        folders.forEach(f => {
            if (visibleIds && !visibleIds.has(f.id)) return;
            const isExpanded = visibleIds ? true : (f.isExpanded || false);
            // In Move Mode, force expand everything to make finding easier? Or keep standard? Standard is fine.
            
            const row = this.createRow({
                id: f.id,
                name: f.name,
                icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
                type: 'folder',
                depth,
                isExpanded,
                // Move Mode Specifics
                isSelected: this.isMoveMode && this.targetFolderId === f.id
            });
            this.listContainer!.appendChild(row);

            if (isExpanded) {
                this.renderNode(f.id, depth + 1, visibleIds);
            }
        });

        prompts.forEach(p => {
            if (visibleIds && !visibleIds.has(p.id)) return;
            // In move mode, prompts are rendered but grayed out via CSS
            const row = this.createRow({
                id: p.id,
                name: p.title,
                icon: ICONS.prompt,
                type: 'prompt',
                depth,
                isPinned: p.isPinned
            });
            this.listContainer!.appendChild(row);
        });
    }

    private createRow(opts: any) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type); // For CSS targeting
        
        // Active State Logic
        if (this.isMoveMode) {
            if (opts.isSelected) row.classList.add('destination');
        } else {
            if (this.activeId === opts.id) row.classList.add('active');
        }
        
        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        // Chevron
        if (opts.type === 'folder') {
            const chevron = document.createElement('span');
            chevron.innerHTML = opts.isExpanded ? ICONS.chevronDown : ICONS.chevronRight;
            chevron.style.marginRight = '6px';
            chevron.style.opacity = '0.5';
            // Click chevron to toggle expansion ONLY
            chevron.onclick = (e) => { e.stopPropagation(); this.store.toggleFolderExpansion(opts.id); };
            row.appendChild(chevron);
        } else {
            const spacer = document.createElement('span');
            spacer.style.width = '18px';
            row.appendChild(spacer);
        }

        // Icon + Label
        const iconBox = document.createElement('div');
        iconBox.className = 'row-icon';
        iconBox.innerHTML = (opts.isPinned && !this.isMoveMode) ? ICONS.pin : opts.icon;
        if (opts.isPinned && !this.isMoveMode) iconBox.style.color = 'var(--accent)';
        
        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = opts.name;
        
        row.appendChild(iconBox);
        row.appendChild(label);

        // Actions (Only in Normal Mode)
        if (!this.isMoveMode) {
            const actions = document.createElement('div');
            actions.className = 'row-actions';

            if (opts.type === 'folder') {
                const addBtn = document.createElement('button');
                addBtn.className = 'icon-btn';
                addBtn.innerHTML = ICONS.plus;
                addBtn.title = 'Create inside';
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-new-prompt', { detail: { parentId: opts.id } }));
                };
                actions.appendChild(addBtn);
            } else {
                // Prompt Actions: Kebab (Move, Pin, Delete)
                const kebabBtn = document.createElement('button');
                kebabBtn.className = 'icon-btn';
                kebabBtn.innerHTML = ICONS.kebab;
                kebabBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.showContextMenu(e, opts.id, opts.isPinned);
                };
                actions.appendChild(kebabBtn);
            }
            row.appendChild(actions);
        }

        // Click Handler
        row.onclick = () => {
            if (this.isMoveMode) {
                if (opts.type === 'folder') {
                    this.targetFolderId = opts.id;
                    this.renderTree();
                }
            } else {
                if (opts.type === 'folder') {
                    this.store.toggleFolderExpansion(opts.id);
                } else {
                    this.activeId = opts.id;
                    this.renderTree();
                    this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
                }
            }
        };

        return row;
    }

    private showContextMenu(e: MouseEvent, promptId: string, isPinned: boolean) {
        // Simple inline context menu logic using a fixed element in sidebar
        // For complexity, let's just use a small absolute div appended to body or shadow
        // Simplest for now: Use the native browser context menu? No, not custom enough.
        // Let's create a temporary dropdown.
        
        const existing = this.container?.querySelector('.ctx-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        Object.assign(menu.style, {
            position: 'fixed',
            top: `${e.clientY}px`,
            left: `${e.clientX}px`,
            background: 'var(--bg-panel, #18181b)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px',
            zIndex: '2147483647',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            minWidth: '120px'
        });
        menu.className = 'ctx-menu';

        const createItem = (label: string, onClick: () => void, isDanger = false) => {
            const item = document.createElement('div');
            item.textContent = label;
            Object.assign(item.style, {
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                color: isDanger ? 'var(--danger)' : 'var(--txt-primary)',
                borderRadius: '4px'
            });
            item.onmouseenter = () => item.style.background = 'var(--bg-hover)';
            item.onmouseleave = () => item.style.background = 'transparent';
            item.onclick = (ev) => {
                ev.stopPropagation();
                onClick();
                menu.remove();
            };
            return item;
        };

        menu.appendChild(createItem(isPinned ? 'Unpin' : 'Pin', async () => {
            try { await this.store.togglePin(promptId); } catch(e:any) { 
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message }})); 
            }
        }));

        menu.appendChild(createItem('Move To...', () => {
            this.startMoveMode(promptId);
        }));

        menu.appendChild(createItem('Delete', async () => {
            if (confirm('Delete prompt?')) {
                await this.store.deletePrompt(promptId);
            }
        }, true));

        // Click outside closes
        const close = () => { menu.remove(); document.removeEventListener('click', close); };
        setTimeout(() => document.addEventListener('click', close), 0);

        this.shadow.appendChild(menu);
    }
}
3. Update App Logic (src/content/components/App.ts)
We don't need significant changes here since the Sidebar handles the move logic internally now (via startMoveMode). The events dispatched are handled inside Sidebar.ts.
However, verify App.ts passes the Shadow Root to Sidebar correctly, which it does in Step 2.