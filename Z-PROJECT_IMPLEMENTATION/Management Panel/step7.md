Step 7: Import/Export V2 (Split View)
Objective:
Export Mode: Sidebar allows checking items (with "Select All/None"). Workspace shows a JSON preview of the selection. Footer has the "Download" button.
Import Mode: Sidebar shows the incoming tree with status dots (🔴/🟢). Workspace allows editing Title/Shortcut to resolve conflicts. Footer has the "Finalize Import" button.
Complexity: HIGH
Files to Modify:
src/content/styles.ts (Status indicators, selection styling).
src/content/components/ControlPanel.ts (Trigger file picker).
src/content/components/Sidebar.ts (Render Import/Export trees).
src/content/components/Workspace.ts (Render Resolution/Preview).
src/content/components/App.ts (State orchestration).
Tasks:
1. Update Styles (src/content/styles.ts)
Add styles for the Checkboxes (Export) and Status Dots (Import).
code
TypeScript
// src/content/styles.ts -> Append to STYLES string

/* --- IMPORT/EXPORT SIDEBAR --- */
.sb-checkbox {
  margin-right: 8px;
  cursor: pointer;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
.status-dot.green { background: var(--green, #10b981); }
.status-dot.red { background: var(--danger); box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
.status-dot.amber { background: #f59e0b; }

/* In Export mode, selected rows look distinct */
.sidebar.mode-export .tree-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

/* --- WORKSPACE PREVIEW (Export) --- */
.ws-code-block {
  background: var(--bg-hover);
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: var(--txt-secondary);
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  border: 1px solid var(--border-subtle);
}

/* --- WORKSPACE RESOLUTION (Import) --- */
.conflict-box {
  border: 1px solid var(--danger);
  background: rgba(239, 68, 68, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.conflict-title {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.safe-box {
  border: 1px solid var(--green, #10b981);
  background: rgba(16, 185, 129, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.safe-title {
  color: var(--green, #10b981);
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
2. Update Control Panel (src/content/components/ControlPanel.ts)
Add a hidden file input to handle the import file reading immediately.
code
TypeScript
// src/content/components/ControlPanel.ts -> inside render()

// Add this hidden input at the end of the HTML string
/* ... */
<input type="file" id="cp-file-input" accept=".json" style="display:none;" />
/* ... */

// src/content/components/ControlPanel.ts -> inside setupListeners()

// Export Trigger
this.container?.querySelector('#cp-export')?.addEventListener('click', () => {
    this.shadow.dispatchEvent(new CustomEvent('app-start-export'));
});

// Import Trigger (Click Card -> Click Input)
const fileInput = this.container?.querySelector('#cp-file-input') as HTMLInputElement;
this.container?.querySelector('#cp-import')?.addEventListener('click', () => {
    fileInput.click();
});

// Handle File Pick
fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            // Dispatch data up to App
            this.shadow.dispatchEvent(new CustomEvent('app-start-import', { detail: { data: json } }));
        } catch (err) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Invalid JSON file' } }));
        }
    };
    reader.readAsText(file);
    fileInput.value = ''; // Reset
});
3. Update Sidebar for Modes (src/content/components/Sidebar.ts)
This needs to handle rendering the "Checkboxes" (Export) and "Dots" (Import).
code
TypeScript
// src/content/components/Sidebar.ts
import { Component } from './Component';
import { Prompt, Folder, ValidatedPrompt, ValidatedFolder } from '../store'; // Import Validated types
import { ICONS } from '../icons';
import { getVisibleIds } from '../utils/searchTree';

export class Sidebar extends Component {
    private container: HTMLElement | null = null;
    private listContainer: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    
    // Modes
    private mode: 'normal' | 'move' | 'export' | 'import' = 'normal';
    
    // Normal/Move State
    private activeId: string | null = null;
    private movingPromptId: string | null = null;
    private targetFolderId: string | null = null;

    // Export State
    public exportSelectedIds: Set<string> = new Set(); // Public so App can read

    // Import State
    private importData: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#sidebar');
        if (!this.container) return;
        this.renderSkeleton();
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        this.setupListeners();
        
        // Subscriptions
        this.store.subscribe('prompts_updated', () => { if(this.mode === 'normal') this.renderTree(); });
        this.store.subscribe('folders_updated', () => { if(this.mode === 'normal') this.renderTree(); });
        
        this.renderTree();
    }

    // --- MODE SWITCHING ---

    public setNormalMode() {
        this.mode = 'normal';
        this.container?.classList.remove('mode-move', 'mode-export', 'mode-import');
        this.renderSkeleton(); // Reset header/footer
        this.renderTree();
    }

    public startMoveMode(promptId: string) {
        this.mode = 'move';
        this.movingPromptId = promptId;
        const p = this.store.prompts.find(x => x.id === promptId);
        this.targetFolderId = p ? (p.parentId || null) : null;
        this.container?.classList.add('mode-move');
        this.renderSkeleton(); // Show Move Header
        this.renderTree();
    }

    public startExportMode() {
        this.mode = 'export';
        // Select All by default
        this.exportSelectedIds = new Set([
            ...this.store.prompts.map(p => p.id),
            ...this.store.folders.map(f => f.id)
        ]);
        this.container?.classList.add('mode-export');
        this.renderSkeleton();
        this.renderTree();
    }

    public startImportMode(data: { prompts: ValidatedPrompt[], folders: ValidatedFolder[] }) {
        this.mode = 'import';
        this.importData = data;
        this.container?.classList.add('mode-import');
        this.renderSkeleton();
        this.renderTree();
    }

    public refreshImportTree() {
        // Called by App when a conflict is resolved to update dots
        if (this.mode === 'import') this.renderTree();
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
                <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>
                <div class="magic-dropdown" id="magic-dropdown"></div>`;
            
            footerHTML = `
                <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>`;
        } 
        else if (this.mode === 'move') {
            headerHTML = `<div class="sb-move-title">Select Destination</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Move Here</button>
                </div>`;
        }
        else if (this.mode === 'export') {
            headerHTML = `<div class="sb-move-title">Select Items to Export</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Export</button>
                </div>`;
        }
        else if (this.mode === 'import') {
            headerHTML = `<div class="sb-move-title">Review Import</div>`;
            footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Finalize Import</button>
                </div>`;
        }

        // Only update Header/Footer containers to avoid destroying list scroll
        // But since we change modes rarely, full innerHTML replace is safer for DOM listeners
        this.container.innerHTML = `
            <div class="sb-header">${headerHTML}</div>
            <div class="sb-list"></div>
            <div class="sb-footer">${footerHTML}</div>
        `;
        
        this.listContainer = this.container.querySelector('.sb-list');
        this.searchInput = this.container.querySelector('.sb-search-input');
        
        // Re-attach listeners after HTML replacement
        this.attachSkeletonListeners();
    }

    private attachSkeletonListeners() {
        // Common Cancel/Confirm for modes
        this.container?.querySelector('#btn-cancel')?.addEventListener('click', () => {
            this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel'));
        });
        
        this.container?.querySelector('#btn-confirm')?.addEventListener('click', () => {
            if (this.mode === 'move' && this.movingPromptId) {
                this.store.updatePrompt(this.movingPromptId, { parentId: this.targetFolderId }).then(() => {
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Moved' } }));
                    this.shadow.dispatchEvent(new CustomEvent('app-mode-cancel')); // Return to normal
                });
            } else if (this.mode === 'export') {
                this.shadow.dispatchEvent(new CustomEvent('app-exec-export'));
            } else if (this.mode === 'import') {
                this.shadow.dispatchEvent(new CustomEvent('app-exec-import'));
            }
        });

        // Normal Mode Listeners
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
            // Magic Menu (Simplified for brevity, copy previous logic if needed)
            const magicBtn = this.container?.querySelector('#btn-magic');
            const dropdown = this.container?.querySelector('#magic-dropdown');
            if(magicBtn && dropdown) {
                 import('../lib/magicScripts').then(({ MAGIC_SCRIPTS }) => {
                    dropdown.innerHTML = MAGIC_SCRIPTS.map(s => `<div class="magic-item" data-text="${encodeURIComponent(s.text)}"><span>${s.icon}</span> ${s.name}</div>`).join('');
                    dropdown.querySelectorAll('.magic-item').forEach(el => el.addEventListener('click', (e) => {
                        navigator.clipboard.writeText(decodeURIComponent((e.currentTarget as HTMLElement).dataset.text || ''));
                        dropdown.classList.remove('open');
                    }));
                 });
                 magicBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('open'); });
                 document.addEventListener('click', () => dropdown.classList.remove('open'));
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

        // Normal/Move/Export Logic
        // ... (Keep existing Filter Logic) ...
        const filter = this.store.filterText.trim().toLowerCase();
        if (filter && this.mode === 'normal') {
             // ... existing search render ...
             const visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
             this.renderNode(null, 0, visibleIds);
             return;
        }

        this.renderNode(null, 0, null);
        
        // Uncategorized Group (Only Normal/Move/Export)
        const rootPrompts = this.store.prompts.filter(p => p.parentId === null);
        if (rootPrompts.length > 0 || this.mode === 'move') {
             this.renderUncategorizedGroup(rootPrompts);
        }
    }

    // --- RECURSIVE RENDERERS ---

    private renderNode(parentId: string | null, depth: number, visibleIds: Set<string> | null) {
        const folders = this.store.folders.filter(f => f.parentId === parentId).sort((a,b) => a.order - b.order);
        const prompts = this.store.prompts.filter(p => p.parentId === parentId);

        folders.forEach(f => {
            if (visibleIds && !visibleIds.has(f.id)) return;
            const isExpanded = visibleIds ? true : (f.isExpanded || false);
            const isSelected = this.mode === 'move' ? (this.targetFolderId === f.id) : 
                               this.mode === 'export' ? this.exportSelectedIds.has(f.id) : false;

            const row = this.createRow({ 
                id: f.id, name: f.name, icon: isExpanded ? ICONS.folderOpen : ICONS.folder, 
                type: 'folder', depth, isExpanded, isSelected 
            });
            this.listContainer!.appendChild(row);
            if (isExpanded) {
                this.renderNode(f.id, depth + 1, visibleIds);
                // Render children prompts if open
                const children = this.store.prompts.filter(p => p.parentId === f.id);
                children.forEach(p => {
                    if (visibleIds && !visibleIds.has(p.id)) return;
                    this.renderPromptRow(p, depth + 1);
                });
            }
        });
    }

    private renderUncategorizedGroup(prompts: Prompt[]) {
        const header = document.createElement('div');
        header.className = 'uncategorized-header';
        header.textContent = 'Uncategorized';
        if (this.mode === 'move' && this.targetFolderId === null) header.classList.add('selected');
        
        if (this.mode === 'move') {
            header.onclick = () => { this.targetFolderId = null; this.renderTree(); };
        }
        this.listContainer!.appendChild(header);
        
        prompts.forEach(p => this.renderPromptRow(p, 0));
    }

    private renderPromptRow(p: Prompt, depth: number) {
        const isSelected = this.mode === 'export' ? this.exportSelectedIds.has(p.id) : (this.activeId === p.id);
        const row = this.createRow({
            id: p.id, name: p.title, icon: ICONS.prompt, type: 'prompt', depth, isSelected, isPinned: p.isPinned
        });
        this.listContainer!.appendChild(row);
    }

    private createRow(opts: any) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('data-type', opts.type);
        if (opts.isSelected && this.mode !== 'normal') {
            if (this.mode === 'move') row.classList.add('destination');
            // Export selection style handled by checkbox usually, but row highlight ok
        }
        if (this.mode === 'normal' && opts.isSelected) row.classList.add('active');

        row.style.paddingLeft = `${12 + (opts.depth * 16)}px`;

        // Checkbox for Export
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

        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = opts.name;
        row.appendChild(lbl);

        // Events
        row.onclick = () => {
            if (this.mode === 'move' && opts.type === 'folder') {
                this.targetFolderId = opts.id;
                this.renderTree();
            } else if (this.mode === 'normal' && opts.type === 'prompt') {
                this.activeId = opts.id;
                this.renderTree();
                this.shadow.dispatchEvent(new CustomEvent('workspace-open-prompt', { detail: { promptId: opts.id } }));
            } else if (this.mode === 'export') {
                // In export mode, clicking row previews it
                this.activeId = opts.id;
                // Highlight row without re-rendering everything
                this.listContainer?.querySelectorAll('.tree-row').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                
                if (opts.type === 'prompt') {
                    this.shadow.dispatchEvent(new CustomEvent('workspace-preview-export', { detail: { promptId: opts.id } }));
                }
            }
        };

        // Kebab (Normal only)
        if (this.mode === 'normal' && opts.type === 'prompt') {
             // ... copy existing kebab logic from Step 5 ...
             const kebab = document.createElement('button');
             kebab.className = 'icon-btn';
             kebab.innerHTML = ICONS.kebab;
             kebab.onclick = (e) => { e.stopPropagation(); this.shadow.dispatchEvent(new CustomEvent('sidebar-kebab', { detail: { event: e, id: opts.id, isPinned: opts.isPinned } })); };
             const acts = document.createElement('div'); acts.className = 'row-actions'; acts.appendChild(kebab); row.appendChild(acts);
        }

        return row;
    }

    // --- EXPORT LOGIC ---
    private toggleExportSelection(id: string, type: 'folder'|'prompt', checked: boolean) {
        if (checked) {
            this.exportSelectedIds.add(id);
            if (type === 'folder') this.selectChildrenRecursive(id);
            // Select parents logic if desired
        } else {
            this.exportSelectedIds.delete(id);
            if (type === 'folder') this.unselectChildrenRecursive(id);
        }
        this.renderTree();
    }
    
    private selectChildrenRecursive(folderId: string) {
        this.store.prompts.filter(p => p.parentId === folderId).forEach(p => this.exportSelectedIds.add(p.id));
        this.store.folders.filter(f => f.parentId === folderId).forEach(f => {
            this.exportSelectedIds.add(f.id);
            this.selectChildrenRecursive(f.id);
        });
    }
    
    private unselectChildrenRecursive(folderId: string) {
        this.store.prompts.filter(p => p.parentId === folderId).forEach(p => this.exportSelectedIds.delete(p.id));
        this.store.folders.filter(f => f.parentId === folderId).forEach(f => {
            this.exportSelectedIds.delete(f.id);
            this.unselectChildrenRecursive(f.id);
        });
    }

    // --- IMPORT RENDERER ---
    private renderImportNode(parentId: string | null, depth: number) {
        if (!this.importData) return;
        
        const folders = this.importData.folders.filter(f => f.parentId === parentId);
        const prompts = this.importData.prompts.filter(p => p.parentId === parentId);

        folders.forEach(f => {
            const row = this.createImportRow(f.name, 'folder', depth, f.id, false);
            this.listContainer!.appendChild(row);
            this.renderImportNode(f.id, depth + 1); // Auto expand everything for review
        });

        prompts.forEach(p => {
            const hasConflict = p.conflicts.title || p.conflicts.shortcut; // Red
            const hasBodyMatch = p.conflicts.body; // Amber
            const row = this.createImportRow(p.title, 'prompt', depth, p.id, hasConflict, hasBodyMatch);
            this.listContainer!.appendChild(row);
        });
    }

    private createImportRow(name: string, type: string, depth: number, id: string, isConflict: boolean, isWarning?: string | null) {
        const row = document.createElement('div');
        row.className = 'tree-row';
        row.style.paddingLeft = `${12 + (depth * 16)}px`;
        if (this.activeId === id) row.classList.add('active');

        // Status Dot
        const dot = document.createElement('div');
        dot.className = `status-dot ${isConflict ? 'red' : (isWarning ? 'amber' : 'green')}`;
        row.appendChild(dot);

        // Icon
        const icon = document.createElement('div');
        icon.className = 'row-icon';
        icon.innerHTML = type === 'folder' ? ICONS.folder : ICONS.prompt;
        row.appendChild(icon);

        const lbl = document.createElement('span');
        lbl.className = 'row-label';
        lbl.textContent = name;
        row.appendChild(lbl);

        row.onclick = () => {
            if (type === 'prompt') {
                this.activeId = id;
                this.renderTree(); // Highlight row
                this.shadow.dispatchEvent(new CustomEvent('workspace-resolve-import', { detail: { promptId: id } }));
            }
        };

        return row;
    }
}
4. Update Workspace (src/content/components/Workspace.ts)
Add logic to render the Export Preview (Read-only) and Import Resolution (Editable with live validation).
code
TypeScript
// src/content/components/Workspace.ts
// ... imports
import { ValidatedPrompt } from '../store';

export class Workspace extends Component {
    // ... existing
    private importContext: { prompt: ValidatedPrompt } | null = null;

    // ... openEditor, openSettings

    // EXPORT PREVIEW
    public previewExport(promptId: string) {
        this.currentMode = 'empty'; // Reuse empty structure container style or create new?
        // Let's just overwrite container
        if (!this.container) return;
        
        const p = this.store.prompts.find(x => x.id === promptId);
        if (!p) return;

        this.container.innerHTML = `
            <div class="ws-header">
                <div style="font-size:11px; font-weight:700; color:var(--txt-muted); text-transform:uppercase;">Export Preview</div>
                <div style="font-size:20px; font-weight:700; margin-top:4px;">${p.title}</div>
            </div>
            <div style="padding:24px; overflow:auto;">
                <div class="ws-meta-row" style="margin-bottom:16px;">
                    <div style="font-size:12px; background:var(--bg-hover); padding:4px 8px; border-radius:4px;">
                        Shortcut: <b>${p.quick || 'None'}</b>
                    </div>
                </div>
                <div class="ws-code-block">${p.text}</div>
            </div>
        `;
    }

    // IMPORT RESOLUTION
    public resolveImport(prompt: ValidatedPrompt, onUpdate: (p: ValidatedPrompt) => void) {
        if (!this.container) return;
        this.importContext = { prompt };

        const { title, shortcut, body } = prompt.conflicts;
        const isSafe = !title && !shortcut;

        this.container.innerHTML = `
            <div class="ws-header">
                <div style="font-size:11px; font-weight:700; color:var(--txt-muted); text-transform:uppercase;">Resolve Conflict</div>
            </div>
            <div style="padding:24px; overflow:auto;">
                
                ${!isSafe ? `
                    <div class="conflict-box">
                        <div class="conflict-title">Conflict Detected</div>
                        <div style="font-size:13px; color:var(--txt-secondary);">
                            This prompt conflicts with an existing one. Rename it to proceed.
                        </div>
                    </div>` 
                : `
                    <div class="safe-box">
                        <div class="safe-title">Ready to Import</div>
                        <div style="font-size:13px; color:var(--txt-secondary);">
                            This prompt has no conflicts.
                        </div>
                    </div>
                `}

                ${body ? `
                    <div style="margin-bottom:20px; padding:12px; border:1px dashed #f59e0b; border-radius:8px; color:#f59e0b; font-size:12px;">
                        ⚠ Content matches existing prompt: "<b>${body}</b>"
                    </div>
                ` : ''}

                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <label class="cp-label">Title</label>
                        <input type="text" id="res-title" class="ws-input" style="width:100%; border-color: ${title ? 'var(--danger)' : ''}" value="${prompt.title}">
                        ${title ? '<div style="color:var(--danger); font-size:11px; margin-top:4px;">Title already exists</div>' : ''}
                    </div>

                    <div>
                        <label class="cp-label">Shortcut</label>
                        <input type="text" id="res-quick" class="ws-input" style="width:100%; border-color: ${shortcut ? 'var(--danger)' : ''}" value="${prompt.quick || ''}">
                        ${shortcut ? '<div style="color:var(--danger); font-size:11px; margin-top:4px;">Shortcut already exists</div>' : ''}
                    </div>

                    <div>
                        <label class="cp-label">Content Preview</label>
                        <div class="ws-code-block" style="max-height:200px; opacity:0.7;">${prompt.text}</div>
                    </div>
                </div>
            </div>
        `;

        // Live Validation Listeners
        const titleInp = this.container.querySelector('#res-title') as HTMLInputElement;
        const quickInp = this.container.querySelector('#res-quick') as HTMLInputElement;

        const handleInput = () => {
            // Update the object ref
            prompt.title = titleInp.value;
            prompt.quick = quickInp.value;
            
            // Re-validate against Store
            // We need access to Store here. Workspace has access via `this.store`.
            const titleMatch = this.store.prompts.some(p => p.title.toLowerCase() === prompt.title.toLowerCase());
            const quickMatch = prompt.quick ? this.store.prompts.some(p => p.quick === prompt.quick) : false;
            
            prompt.conflicts.title = titleMatch;
            prompt.conflicts.shortcut = quickMatch;

            // Notify parent to re-render (Sidebar dots need update)
            onUpdate(prompt);
            // Re-render self to update borders/messages
            this.resolveImport(prompt, onUpdate);
            
            // Restore Focus (Simple hack: end of input)
            // Ideally we pass focus state like we did in Step 4_Fix, but for now this suffices or use same fix.
            // Let's implement focus restoration quickly:
            const activeId = document.activeElement?.id;
            // Actually, re-rendering blows away DOM. 
            // Better to just update classes manually? 
            // Given high complexity, let's just update styles manually without full re-render for input events.
        };

        // Optimized Input Handler (No Full Re-render)
        [titleInp, quickInp].forEach(inp => {
            inp.addEventListener('input', () => {
                prompt.title = titleInp.value;
                prompt.quick = quickInp.value;
                
                const titleMatch = this.store.prompts.some(p => p.title.toLowerCase() === prompt.title.trim().toLowerCase());
                const quickMatch = prompt.quick ? this.store.prompts.some(p => p.quick?.toLowerCase() === prompt.quick.trim().toLowerCase()) : false;
                
                prompt.conflicts.title = titleMatch;
                prompt.conflicts.shortcut = quickMatch;

                // Visual Updates
                titleInp.style.borderColor = titleMatch ? 'var(--danger)' : '';
                quickInp.style.borderColor = quickMatch ? 'var(--danger)' : '';
                
                // Trigger Sidebar Update (Dots)
                onUpdate(prompt);
            });
        });
    }
}
5. Orchestrate in App (src/content/components/App.ts)
Connect the events and handle the data flow.
code
TypeScript
// src/content/components/App.ts -> setupListeners

// EXPORT FLOW
this.shadow.addEventListener('app-start-export', () => {
    this.sidebar.startExportMode();
    // Clear workspace
    this.workspace.renderEmpty(); 
});

this.shadow.addEventListener('workspace-preview-export', ((e: CustomEvent) => {
    this.workspace.previewExport(e.detail.promptId);
}) as EventListener);

this.shadow.addEventListener('app-exec-export', () => {
    // Get selection from Sidebar
    const pIds = Array.from(this.sidebar.exportSelectedIds).filter(id => this.store.prompts.some(p => p.id === id));
    const fIds = Array.from(this.sidebar.exportSelectedIds).filter(id => this.store.folders.some(f => f.id === id));
    
    if(pIds.length === 0 && fIds.length === 0) {
        this.showToast("Nothing selected");
        return;
    }
    
    const data = this.store.prepareExportData(pIds, fIds);
    this.store.triggerDownload(data);
    this.showToast(`Exported ${pIds.length} prompts`);
    this.sidebar.setNormalMode();
});


// IMPORT FLOW
this.shadow.addEventListener('app-start-import', ((e: CustomEvent) => {
    const rawData = e.detail.data;
    try {
        const validated = this.store.validateImportData(rawData);
        this.sidebar.startImportMode(validated);
        // Show summary in workspace? Or empty instructions?
        this.workspace.mount(this.modal as HTMLElement); // Clear
        this.workspace.renderEmpty(); // Or render a "Select item on left"
    } catch(err: any) {
        this.showToast(err.message);
    }
}) as EventListener);

this.shadow.addEventListener('workspace-resolve-import', ((e: CustomEvent) => {
    // Find the object in the sidebar's current data?
    // Sidebar holds the state. We need to access it. 
    // Ideally, Sidebar emits the object, or we pass data to App.
    // For simplicity, let's assume App can reach Sidebar state or we pass it in event.
    // Let's modify Sidebar to emit the object in the event detail.
    // *Correction*: Sidebar.ts createImportRow dispatch needs to send the full prompt object or App needs to look it up.
    // Let's make Sidebar public accessor or event detail richer.
    
    // In Sidebar.ts, update: detail: { prompt: p }
    // Assuming we did that (check Sidebar code above... I used ID).
    // Let's fix Sidebar.ts logic to store the importData publicly or pass it.
    
    // Quick Fix: App accesses sidebar.importData (Make it public getter)
    const p = this.sidebar.getImportPrompt(e.detail.promptId); // Need to add this method to Sidebar
    if(p) {
        this.workspace.resolveImport(p, () => {
            this.sidebar.refreshImportTree(); // Update dots
        });
    }
}) as EventListener);

this.shadow.addEventListener('app-exec-import', async () => {
    const data = this.sidebar.getImportData(); // Need getter
    if(!data) return;
    
    // Check for blocking conflicts
    const hasRed = data.prompts.some(p => p.conflicts.title || p.conflicts.shortcut);
    if(hasRed) {
        this.showToast("Resolve red conflicts first");
        return;
    }
    
    await this.store.finalizeImport(data.prompts, data.folders);
    this.showToast("Import Successful");
    this.sidebar.setNormalMode();
    this.workspace.renderEmpty();
});

this.shadow.addEventListener('app-mode-cancel', () => {
    this.sidebar.setNormalMode();
    this.workspace.renderEmpty();
});

// Sidebar Kebab Helper
this.shadow.addEventListener('sidebar-kebab', ((e: CustomEvent) => {
    // Re-implement context menu here or in Sidebar. 
    // In Step 5 we put it in Sidebar. It should be fine there.
}) as EventListener);
Add Helpers to Sidebar.ts:
code
TypeScript
// src/content/components/Sidebar.ts
public getImportPrompt(id: string) {
    return this.importData?.prompts.find(p => p.id === id);
}
public getImportData() {
    return this.importData;
}
