Step 2: The Sidebar (Navigation & Search)
Objective: Build the Left Sidebar containing the Header (Search), the Recursive Tree List (Folders/Prompts), and the Footer (Settings/New Buttons). We will also implement the "Hierarchical Search" logic you requested.
Complexity: MEDIUM
Files to Modify/Create:
New File: src/content/icons.ts (Centralized SVG library to keep components clean).
New File: src/content/components/Sidebar.ts (The main logic).
src/content/styles.ts (Add sidebar-specific CSS).
src/content/components/App.ts (Mount the Sidebar).
Tasks:
1. Create Icon Library (src/content/icons.ts)
Instead of cluttering our logic with long <svg> strings, let's export them.
code
TypeScript
// src/content/icons.ts
export const ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    folderOpen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><path d="M2 10h20"></path></svg>`,
    prompt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    chevronRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    kebab: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
    pin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`,
    magic: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>`,
    settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};
2. Update Styles (src/content/styles.ts)
Add the sidebar-specific CSS to the existing string.
code
TypeScript
// src/content/styles.ts -> Append inside the STYLES string, before the closing `

/* --- SIDEBAR COMPONENTS --- */
.sb-header {
  height: 50px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  gap: 8px;
}

.sb-search-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  color: var(--txt-muted);
}

.sb-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  font-size: 13px;
  padding: 6px 0 6px 24px; /* Space for icon */
  outline: none;
}
.sb-search-input::placeholder { color: var(--txt-muted); }

.sb-search-icon {
  position: absolute;
  left: 0;
  pointer-events: none;
}

.sb-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--txt-secondary);
  font-size: 13px;
  user-select: none;
  position: relative;
  transition: background 0.1s;
}
.tree-row:hover { background: var(--bg-hover); color: var(--txt-primary); }
.tree-row.active { background: var(--bg-active); color: var(--txt-primary); box-shadow: inset 3px 0 0 var(--accent); }

.row-indent { width: 16px; flex-shrink: 0; }
.row-icon { width: 16px; margin-right: 8px; display: flex; align-items: center; color: var(--txt-muted); }
.tree-row:hover .row-icon { color: var(--txt-secondary); }

.row-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Kebab & Actions */
.row-actions { display: none; margin-left: auto; gap: 4px; }
.tree-row:hover .row-actions { display: flex; }

.icon-btn {
  padding: 4px;
  border-radius: 4px;
  color: var(--txt-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--txt-primary); }

.sb-footer {
  height: 48px;
  border-top: 1px solid var(--border-subtle);
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-new {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-new:hover { filter: brightness(1.1); }
3. Create Sidebar Component (src/content/components/Sidebar.ts)
This component handles the rendering and the "Hierarchical Search" logic.
code
TypeScript
// src/content/components/Sidebar.ts
import { Component } from './Component';
import { Prompt, Folder } from '../store';
import { ICONS } from '../icons';
import { getVisibleIds } from '../utils/searchTree';

export class Sidebar extends Component {
    private container: HTMLElement | null = null;
    private listContainer: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    
    // State
    private expandedFolderIds: Set<string> = new Set();
    private activeId: string | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#sidebar');
        if (!this.container) return;
        
        this.renderSkeleton();
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');

        this.setupListeners();
        this.store.subscribe('prompts_updated', () => this.renderTree());
        this.store.subscribe('folders_updated', () => this.renderTree());
        
        // Initial Render
        this.renderTree();
    }

    private renderSkeleton() {
        if (!this.container) return;
        this.container.innerHTML = `
            <!-- HEADER -->
            <div class="sb-header">
                <div class="sb-search-wrapper">
                    <span class="sb-search-icon">${ICONS.search}</span>
                    <input type="text" class="sb-search-input" placeholder="Search prompts..." spellcheck="false">
                </div>
                <button class="icon-btn" title="Magic Scripts">${ICONS.magic}</button>
            </div>

            <!-- LIST -->
            <div class="sb-list"></div>

            <!-- FOOTER -->
            <div class="sb-footer">
                <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                <button class="btn-new" id="btn-new-root">
                    ${ICONS.plus} New Prompt
                </button>
            </div>
        `;
    }

    private setupListeners() {
        // Search Input
        this.searchInput?.addEventListener('input', () => {
            this.store.setFilter(this.searchInput!.value);
            this.renderTree();
        });

        // New Prompt (Root)
        this.container?.querySelector('#btn-new-root')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-new-prompt', { detail: { parentId: null } }));
        });

        // Settings
        this.container?.querySelector('#btn-settings')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('workspace-settings'));
        });
    }

    private renderTree() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        const filter = this.store.filterText.trim().toLowerCase();
        let visibleIds: Set<string> | null = null;

        if (filter) {
            // Hierarchical Search Logic
            visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
            
            // If empty search result
            if (visibleIds.size === 0) {
                this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
                return;
            }
        }

        this.renderNode(null, 0, visibleIds);
    }

    private renderNode(parentId: string | null, depth: number, visibleIds: Set<string> | null) {
        // 1. Get Children
        const folders = this.store.folders
            .filter(f => f.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
            
        const prompts = this.store.prompts
            .filter(p => p.parentId === parentId);
            // .sort by order if implemented

        // 2. Render Folders
        folders.forEach(f => {
            if (visibleIds && !visibleIds.has(f.id)) return;

            // In search mode, auto-expand. Otherwise check state.
            const isExpanded = visibleIds ? true : (f.isExpanded || this.expandedFolderIds.has(f.id));
            
            const row = this.createRow({
                id: f.id,
                name: f.name,
                icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
                type: 'folder',
                depth,
                hasChevron: true, // simplified: always show chevron or check if children exist
                isExpanded
            });

            this.listContainer!.appendChild(row);

            if (isExpanded) {
                this.renderNode(f.id, depth + 1, visibleIds);
            }
        });

        // 3. Render Prompts
        prompts.forEach(p => {
            if (visibleIds && !visibleIds.has(p.id)) return;

            const row = this.createRow({
                id: p.id,
                name: p.title,
                icon: ICONS.prompt,
                type: 'prompt',
                depth,
                isPinned: p.isPinned,
                data: p
            });
            this.listContainer!.appendChild(row);
        });
    }

    private createRow(opts: any) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        if (this.activeId === opts.id) row.classList.add('active');
        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        // Chevron (for folders)
        if (opts.type === 'folder') {
            const chevron = document.createElement('span');
            chevron.innerHTML = opts.isExpanded ? ICONS.chevronDown : ICONS.chevronRight;
            chevron.style.marginRight = '6px';
            chevron.style.opacity = '0.5';
            row.appendChild(chevron);
        } else {
            // Spacer for alignment
            const spacer = document.createElement('span');
            spacer.style.width = '18px'; // 12px svg + 6px margin
            row.appendChild(spacer);
        }

        // Icon
        const iconBox = document.createElement('div');
        iconBox.className = 'row-icon';
        iconBox.innerHTML = opts.icon;
        
        // Pinned Indicator overrides icon color or adds badge? 
        // Design said "Pin Icon (📌, if pinned)". Let's prepend it or color it.
        if (opts.isPinned) {
            iconBox.innerHTML = ICONS.pin;
            iconBox.style.color = 'var(--accent)';
        }
        row.appendChild(iconBox);

        // Label
        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = opts.name;
        row.appendChild(label);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'row-actions';

        if (opts.type === 'folder') {
            // Folder Actions: New Prompt
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
            // Prompt Actions: Kebab
            // For MVP, lets put Pin/Delete directly to save click
            const pinBtn = document.createElement('button');
            pinBtn.className = 'icon-btn';
            pinBtn.innerHTML = ICONS.pin;
            pinBtn.onclick = async (e) => {
                e.stopPropagation();
                try { await this.store.togglePin(opts.id); } 
                catch(err:any) { 
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: err.message }})); 
                }
            };
            actions.appendChild(pinBtn);
        }

        row.appendChild(actions);

        // Click Handler
        row.onclick = () => {
            if (opts.type === 'folder') {
                this.toggleFolder(opts.id);
            } else {
                this.selectItem(opts.id);
                // Dispatch event to open editor
                this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
            }
        };

        return row;
    }

    private toggleFolder(id: string) {
        if (this.store.filterText) return; // Disable toggle during search
        
        // Update local state
        if (this.expandedFolderIds.has(id)) {
            this.expandedFolderIds.delete(id);
        } else {
            this.expandedFolderIds.add(id);
        }
        
        // Also update Store for persistence if needed (optional)
        this.store.toggleFolderExpansion(id);
        this.renderTree();
    }

    public selectItem(id: string) {
        this.activeId = id;
        this.renderTree(); // Re-render to update 'active' class
    }
}
4. Update App.ts (src/content/components/App.ts)
Mount the Sidebar and check if it renders.
code
TypeScript
// src/content/components/App.ts
// ... imports
import { Sidebar } from './Sidebar'; // Import Sidebar

export class App extends Component {
    // ... props
    private sidebar: Sidebar;

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        this.host = host;
        this.sidebar = new Sidebar(store, shadow); // Init
    }

    mount(parent: HTMLElement) {
        // ... existing mount code ...
        if (!this.backdrop || !this.modal) return;

        this.setupListeners();

        // MOUNT SIDEBAR
        this.sidebar.mount(this.modal); // It will find #sidebar inside modal

        console.log('App: Sidebar Mounted.');
    }
    
    // ... existing code
}
