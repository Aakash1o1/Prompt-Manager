Step 2_Fix: Sidebar Logic Correction
Files to Modify:
src/content/components/Sidebar.ts
Tasks:
Remove the expandedFolderIds property.
Simplify toggleFolder to only call the store.
Simplify renderNode to only check the store.
Updated Code for src/content/components/Sidebar.ts
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
    private activeId: string | null = null;
    // REMOVED: private expandedFolderIds

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
            <div class="sb-header">
                <div class="sb-search-wrapper">
                    <span class="sb-search-icon">${ICONS.search}</span>
                    <input type="text" class="sb-search-input" placeholder="Search prompts..." spellcheck="false">
                </div>
                <button class="icon-btn" title="Magic Scripts">${ICONS.magic}</button>
            </div>
            <div class="sb-list"></div>
            <div class="sb-footer">
                <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>
            </div>
        `;
    }

    private setupListeners() {
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
    }

    private renderTree() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        const filter = this.store.filterText.trim().toLowerCase();
        let visibleIds: Set<string> | null = null;

        if (filter) {
            visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
            if (visibleIds.size === 0) {
                this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
                return;
            }
        }

        this.renderNode(null, 0, visibleIds);
    }

    private renderNode(parentId: string | null, depth: number, visibleIds: Set<string> | null) {
        const folders = this.store.folders
            .filter(f => f.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
            
        const prompts = this.store.prompts
            .filter(p => p.parentId === parentId);

        folders.forEach(f => {
            if (visibleIds && !visibleIds.has(f.id)) return;

            // FIX: Rely ONLY on visibleIds (search) OR Store state
            const isExpanded = visibleIds ? true : (f.isExpanded || false);
            
            const row = this.createRow({
                id: f.id,
                name: f.name,
                icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
                type: 'folder',
                depth,
                isExpanded
            });

            this.listContainer!.appendChild(row);

            if (isExpanded) {
                this.renderNode(f.id, depth + 1, visibleIds);
            }
        });

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

        if (opts.type === 'folder') {
            const chevron = document.createElement('span');
            chevron.innerHTML = opts.isExpanded ? ICONS.chevronDown : ICONS.chevronRight;
            chevron.style.marginRight = '6px';
            chevron.style.opacity = '0.5';
            row.appendChild(chevron);
        } else {
            const spacer = document.createElement('span');
            spacer.style.width = '18px';
            row.appendChild(spacer);
        }

        const iconBox = document.createElement('div');
        iconBox.className = 'row-icon';
        iconBox.innerHTML = opts.icon;
        
        if (opts.isPinned) {
            iconBox.innerHTML = ICONS.pin;
            iconBox.style.color = 'var(--accent)';
        }
        row.appendChild(iconBox);

        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = opts.name;
        row.appendChild(label);

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

        row.onclick = () => {
            if (opts.type === 'folder') {
                this.toggleFolder(opts.id);
            } else {
                this.selectItem(opts.id);
                this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
            }
        };

        return row;
    }

    private toggleFolder(id: string) {
        if (this.store.filterText) return; 
        
        // FIX: Just toggle store. Store update triggers renderTree automatically.
        this.store.toggleFolderExpansion(id);
    }

    public selectItem(id: string) {
        this.activeId = id;
        this.renderTree(); 
    }
}
Step 3: Workspace & Editor
Objective: Implement the Right Panel. It will handle two states initially: Empty State and Editor State (for creating/editing prompts). We will add "Settings State" in Step 4.
Complexity: MEDIUM
Files to Modify/Create:
src/content/styles.ts (Add Editor styling)
New File: src/content/components/Workspace.ts
src/content/components/App.ts (Wire Sidebar events to Workspace)
1. Update Styles (src/content/styles.ts)
Add styles for the Editor inputs, textarea, and footer.
code
TypeScript
// src/content/styles.ts -> Append to STYLES string

/* --- WORKSPACE EDITOR --- */
.ws-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.ws-title-input {
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: 700;
  color: var(--txt-primary);
  width: 100%;
  outline: none;
}
.ws-title-input::placeholder { color: var(--txt-muted); opacity: 0.5; }

.ws-meta-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ws-input {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.ws-input:focus { border-color: var(--accent); color: var(--txt-primary); }

.ws-select {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  max-width: 200px;
}

.ws-editor-body {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  padding: 24px;
  font-family: 'JetBrains Mono', Consolas, monospace; /* Monospace for prompts */
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: none;
}

.ws-footer {
  height: 60px;
  padding: 0 24px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Buttons on right */
  gap: 12px;
  flex-shrink: 0;
  background: var(--bg-app);
}

/* Empty State */
.ws-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--txt-muted);
  gap: 16px;
}
2. Create Workspace Component (src/content/components/Workspace.ts)
This component acts as a mini-router for the right side.
code
TypeScript
// src/content/components/Workspace.ts
import { Component } from './Component';
import { Prompt, Folder } from '../store';
import { ICONS } from '../icons';

export class Workspace extends Component {
    private container: HTMLElement | null = null;
    private currentMode: 'empty' | 'editor' | 'settings' = 'empty';
    
    // Editor State
    private draftPrompt: Partial<Prompt> = {};
    private isDirty: boolean = false;
    private originalPromptId: string | null = null; // Null if new

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#workspace');
        if (!this.container) return;
        this.renderEmpty();
    }

    public openEditor(promptId: string | null, parentId: string | null = null) {
        if (this.checkUnsavedChanges()) return;

        this.currentMode = 'editor';
        this.originalPromptId = promptId;
        this.isDirty = false;

        if (promptId) {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                this.draftPrompt = { ...p }; // Clone
            }
        } else {
            // New Prompt
            this.draftPrompt = {
                title: '',
                text: '',
                quick: '',
                parentId: parentId
            };
        }
        this.renderEditor();
    }

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
            <!-- HEADER -->
            <div class="ws-header">
                <input type="text" id="ws-title" class="ws-title-input" placeholder="Untitled Prompt" value="${p.title || ''}" autocomplete="off">
                
                <div class="ws-meta-row">
                    <input type="text" id="ws-quick" class="ws-input" placeholder="Shortcut (.code)" value="${p.quick || ''}" style="width: 140px;" autocomplete="off">
                    
                    <select id="ws-folder" class="ws-select">
                        <option value="">(Root)</option>
                        <!-- Options filled via JS -->
                    </select>
                </div>
            </div>

            <!-- BODY -->
            <textarea id="ws-body" class="ws-editor-body" placeholder="Type your prompt here..." spellcheck="false">${p.text || ''}</textarea>

            <!-- FOOTER -->
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

        // Flatten folders for dropdown (simple indentation)
        const addOptions = (parentId: string | null, depth: number) => {
            const children = this.store.folders
                .filter(f => f.parentId === parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
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
        this.container?.querySelector('#ws-cancel')?.addEventListener('click', () => this.renderEmpty());
        this.container?.querySelector('#ws-delete')?.addEventListener('click', () => this.delete());
    }

    private async save() {
        const title = this.draftPrompt.title?.trim();
        if (!title) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title is required' } }));
            return;
        }

        try {
            if (this.originalPromptId) {
                await this.store.updatePrompt(this.originalPromptId, this.draftPrompt);
            } else {
                await this.store.addPrompt(
                    title, 
                    this.draftPrompt.text || '', 
                    this.draftPrompt.quick || '', 
                    [], // Tags removed
                    this.draftPrompt.parentId
                );
            }
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Saved' } }));
            this.isDirty = false;
            // Stay in editor, but update original ID if it was new (so next save is update)
            if (!this.originalPromptId) {
                // We need to find the ID of the newly created prompt. 
                // Since store.addPrompt doesn't return ID currently, we might need to modify Store 
                // OR just close the editor for now to be safe.
                this.renderEmpty(); 
            }
        } catch (e: any) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message } }));
        }
    }

    private async delete() {
        if (!this.originalPromptId) return;
        if (confirm('Delete this prompt?')) {
            await this.store.deletePrompt(this.originalPromptId);
            this.renderEmpty();
        }
    }

    private checkUnsavedChanges(): boolean {
        if (this.currentMode === 'editor' && this.isDirty) {
            if (!confirm('You have unsaved changes. Discard them?')) {
                return true; // Abort switch
            }
        }
        return false;
    }

    private focusTitle() {
        setTimeout(() => {
            const el = this.container?.querySelector('#ws-title') as HTMLElement;
            el?.focus();
        }, 50);
    }
}
3. Wire App Logic (src/content/components/App.ts)
Connect the events emitted by Sidebar to the Workspace methods.
code
TypeScript
// src/content/components/App.ts
import { Component } from './Component';
import { Store } from '../store';
import { Sidebar } from './Sidebar';
import { Workspace } from './Workspace'; // Import
import { TextExpander } from './TextExpander'; 

export class App extends Component {
    private backdrop: HTMLElement | null = null;
    private modal: HTMLElement | null = null;
    private toastEl: HTMLElement | null = null;
    private toastTimer: number | null = null;

    private host: HTMLElement;
    private sidebar: Sidebar;
    private workspace: Workspace; // Add

    constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
        super(store, shadow);
        this.host = host;
        this.sidebar = new Sidebar(store, shadow);
        this.workspace = new Workspace(store, shadow); // Init
    }

    mount(parent: HTMLElement) { 
        this.backdrop = this.shadow.getElementById('backdrop');
        this.modal = this.shadow.getElementById('modal');
        this.toastEl = this.shadow.getElementById('toast');

        if (!this.backdrop || !this.modal) return;

        this.setupListeners();

        this.sidebar.mount(this.modal);
        this.workspace.mount(this.modal); // Mount Workspace

        console.log('App: Components Mounted.');
    }

    private setupListeners() {
        // ... (Existing Backdrop/Toast listeners) ...
        this.backdrop?.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && this.backdrop?.classList.contains('open')) {
                ev.preventDefault();
                this.close();
            }
        });
        this.shadow.addEventListener('show-toast', ((e: CustomEvent) => {
            this.showToast(e.detail.message);
        }) as EventListener);

        // --- NEW: Route Sidebar Events to Workspace ---
        
        this.shadow.addEventListener('workspace-open-prompt', ((e: CustomEvent) => {
            this.workspace.openEditor(e.detail.promptId);
        }) as EventListener);

        this.shadow.addEventListener('workspace-new-prompt', ((e: CustomEvent) => {
            this.workspace.openEditor(null, e.detail.parentId);
        }) as EventListener);

        this.shadow.addEventListener('workspace-settings', () => {
            // Future: this.workspace.openSettings();
            console.log("Open Settings (Coming in Step 4)");
        });
    }

    // ... (rest of class) ...
}
