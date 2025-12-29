// src/content/components/Workspace.ts
import { Component } from './Component';
import { Store } from '../store';
import { Prompt, Folder } from '../store';
import { ICONS } from '../icons';
import { ControlPanel } from './ControlPanel'; // Import

// --- CONFIGURATION ---
const TIPS = [
    "Type `../` followed by Space in any text box to open the Quick Menu.",
    "Pin your prompts to access them in Quick Menu.",
    "Right-click text -> right-click -> save to drawer",
    "Export your data regularly to keep a safe backup.",
];

export class Workspace extends Component {
    private container: HTMLElement | null = null;
    private currentMode: 'empty' | 'editor' | 'settings' = 'empty';
    
    // Editor State
    private draftPrompt: Partial<Prompt> = {};
    private draftFolder: Partial<Folder> = {};
    private isDirty: boolean = false;
    private originalPromptId: string | null = null; // Null if new
    private originalFolderId: string | null = null;
    private tipInterval: number | null = null;

    private controlPanel: ControlPanel;

    constructor(store: Store, shadow: ShadowRoot) {
        super(store, shadow);
        this.controlPanel = new ControlPanel(store, shadow);
    }

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#workspace');
        if (!this.container) return;
        
        // Subscribe to store updates to handle external deletions
        this.store.subscribe('prompts_updated', () => this.handleExternalUpdate());
        
        this.renderEmpty();
    }

    public openSettings() {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation();
        
        if (this.currentMode === 'settings') {
            this.currentMode = 'empty';
            this.renderEmpty();
            return;
        }

        this.currentMode = 'settings';
        this.originalPromptId = null;
        this.isDirty = false;
        
        if (this.container) {
            this.controlPanel.mount(this.container);
        }
    }

    public getDraftText(): string | null {
        if (this.currentMode !== 'editor') return null;
        return this.draftPrompt.text || '';
    }

    private handleExternalUpdate() {
        // If we are editing an existing prompt (not new)
        if (this.currentMode === 'editor' && this.originalPromptId) {
            // Check if it still exists in the store
            const exists = this.store.prompts.some(p => p.id === this.originalPromptId);
            
            if (!exists) {
                // It was deleted externally (e.g., Sidebar Kebab -> Delete)
                // Force close the editor to prevent "Phantom Saves"
                this.isDirty = false; // Prevent "Unsaved changes" alert loop
                this.renderEmpty();
            }
        }
    }

    private clearTipRotation() {
        if (this.tipInterval) {
            window.clearInterval(this.tipInterval);
            this.tipInterval = null;
        }
    }

    private startTipRotation() {
        const tipEl = this.container?.querySelector('#ws-tip-text') as HTMLElement;
        if (!tipEl) return;

        let index = Math.floor(Math.random() * TIPS.length);
        tipEl.textContent = TIPS[index];

        this.tipInterval = window.setInterval(() => {
            tipEl.style.opacity = '0';
            setTimeout(() => {
                index = (index + 1) % TIPS.length;
                tipEl.textContent = TIPS[index];
                tipEl.style.opacity = '1';
            }, 300);
        }, 5000);
    }

    public openEditor(promptId: string | null, parentId: string | null = null, initialText: string = '') {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation();

        this.currentMode = 'editor';
        this.originalPromptId = promptId;
        this.originalFolderId = null;
        this.isDirty = !!initialText;

        if (promptId) {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                this.draftPrompt = { ...p }; // Clone
            }
        } else {
            // New Prompt
            this.draftPrompt = {
                title: '',
                text: initialText,
                quick: '',
                parentId: parentId
            };
        }
        this.renderEditor();
    }

    public openFolderEditor(folderId: string | null, parentId: string | null = null) {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation();

        this.currentMode = 'editor';
        this.originalFolderId = folderId;
        this.originalPromptId = null;
        this.isDirty = false;

        if (folderId) {
            const f = this.store.folders.find(x => x.id === folderId);
            if (f) {
                this.draftFolder = { ...f };
            }
        } else {
            this.draftFolder = {
                name: '',
                parentId: parentId
            };
        }
        this.renderFolderEditor();
    }

    private renderEmpty() {
        if (!this.container) return;
        this.currentMode = 'empty';
        this.clearTipRotation();

        this.container.innerHTML = `
            <div class="ws-empty">
                <div style="font-size: 24px; opacity: 0.2; margin-bottom: 16px;">${ICONS.prompt}</div>
                <div style="font-weight: 500; color: var(--txt-secondary);">Select a prompt to edit</div>
                <!-- Tip Container -->
                <div style="margin-top: 40px; max-width: 300px; text-align: center;">
                    <div id="ws-tip-text" style="font-size: 13px; color: var(--txt-muted); line-height: 1.5; min-height: 40px; transition: opacity 0.3s;">
                        ${TIPS[0]}
                    </div>
                </div>
            </div>
        `;
        this.startTipRotation();
    }

    private renderEditor() {
        if (!this.container) return;
        
        const p = this.draftPrompt;

        this.container.innerHTML = `
            <!-- HEADER -->
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" id="ws-title" class="ws-title-input" placeholder="Untitled Prompt" value="${p.title || ''}" autocomplete="off" style="flex: 1;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="ws-quick" class="ws-input" placeholder="Shortcut (.code)" value="${p.quick || ''}" style="width: 140px;" autocomplete="off">
                        <select id="ws-folder" class="ws-select">
                            <option value="">(Root)</option>
                        </select>
                    </div>
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

        this.populateFolderSelect('#ws-folder', this.draftPrompt.parentId || null);
        this.setupEditorListeners();
        this.focusTitle();
    }

    private renderFolderEditor() {
        if (!this.container) return;
        const f = this.draftFolder;

        this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" id="ws-folder-name" class="ws-title-input" placeholder="Folder Name" value="${f.name || ''}" autocomplete="off" style="flex: 1;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 12px; color: var(--txt-muted);">Location:</span>
                        <select id="ws-folder-parent" class="ws-select">
                            <option value="">(Root)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style="flex: 1; padding: 24px; color: var(--txt-muted); font-size: 13px;">
                Manage your prompts and subfolders within this folder.
            </div>
            <div class="ws-footer">
                <button id="ws-folder-delete" class="btn-ghost" style="margin-right:auto; color:var(--danger); ${!this.originalFolderId ? 'display:none' : ''}">Delete Folder</button>
                <button id="ws-folder-cancel" class="btn-ghost">Cancel</button>
                <button id="ws-folder-save" class="btn-primary">Save Folder</button>
            </div>
        `;

        this.populateFolderSelect('#ws-folder-parent', f.parentId || null, this.originalFolderId);
        this.setupFolderEditorListeners();
        this.focusId('#ws-folder-name');
    }

    private populateFolderSelect(selector: string, currentParentId: string | null, excludeId: string | null = null) {
        const select = this.container?.querySelector(selector) as HTMLSelectElement;
        if (!select) return;

        // Flatten folders for dropdown (simple indentation)
        const addOptions = (parentId: string | null, depth: number) => {
            const children = this.store.folders
                .filter(f => f.parentId === parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            children.forEach(f => {
                if (f.id === excludeId) return; // Prevent picking self as parent
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = `${'\u00A0'.repeat(depth * 3)}📁 ${f.name}`;
                if (currentParentId === f.id) opt.selected = true;
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
        
        quickInp.onkeydown = (e) => {
            if (e.key === ' ') e.preventDefault();
        };
        quickInp.oninput = (e) => { 
            const val = (e.target as HTMLInputElement).value.replace(/\s/g, '');
            if (val !== (e.target as HTMLInputElement).value) {
                (e.target as HTMLInputElement).value = val;
            }
            this.draftPrompt.quick = val; 
            markDirty(); 
        };
        bodyInp.oninput = (e) => { this.draftPrompt.text = (e.target as HTMLTextAreaElement).value; markDirty(); };
        folderInp.onchange = (e) => { this.draftPrompt.parentId = (e.target as HTMLSelectElement).value || null; markDirty(); };

        this.container?.querySelector('#ws-save')?.addEventListener('click', () => this.save());
        this.container?.querySelector('#ws-cancel')?.addEventListener('click', () => {
            if (this.checkUnsavedChanges()) return;
            this.renderEmpty();
        });
        this.container?.querySelector('#ws-delete')?.addEventListener('click', () => this.delete());
    }

    private setupFolderEditorListeners() {
        const nameInp = this.container?.querySelector('#ws-folder-name') as HTMLInputElement;
        const parentInp = this.container?.querySelector('#ws-folder-parent') as HTMLSelectElement;

        const markDirty = () => { this.isDirty = true; };

        nameInp.oninput = (e) => { this.draftFolder.name = (e.target as HTMLInputElement).value; markDirty(); };
        parentInp.onchange = (e) => { this.draftFolder.parentId = (e.target as HTMLSelectElement).value || null; markDirty(); };

        this.container?.querySelector('#ws-folder-save')?.addEventListener('click', () => this.saveFolder());
        this.container?.querySelector('#ws-folder-cancel')?.addEventListener('click', () => {
            if (this.checkUnsavedChanges()) return;
            this.renderEmpty();
        });
        this.container?.querySelector('#ws-folder-delete')?.addEventListener('click', () => this.deleteFolder());
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
                this.renderEmpty(); 
            }
        } catch (e: any) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message } }));
        }
    }

    private async saveFolder() {
        const name = this.draftFolder.name?.trim();
        if (!name) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Name is required' } }));
            return;
        }

        try {
            if (this.originalFolderId) {
                await this.store.updateFolder(this.originalFolderId, this.draftFolder);
            } else {
                await this.store.addFolder(name, this.draftFolder.parentId);
            }
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Saved' } }));
            this.isDirty = false;
            this.renderEmpty();
        } catch (e: any) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message } }));
        }
    }

    private async deleteFolder() {
        if (!this.originalFolderId) return;
        if (confirm('Delete this folder? Prompts and subfolders will move up.')) {
            await this.store.deleteFolder(this.originalFolderId);
            this.renderEmpty();
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
        this.focusId('#ws-title');
    }

    private focusId(selector: string) {
        setTimeout(() => {
            const el = this.container?.querySelector(selector) as HTMLElement;
            el?.focus();
        }, 50);
    }

    // --- EXPORT PREVIEW (Read Only Editor) ---
    public previewExport(promptId: string) {
        this.clearTipRotation();
        if (!this.container) return;
        const p = this.store.prompts.find(x => x.id === promptId);
        if (!p) return;

        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" class="ws-title-input" value="${this.escapeHtml(p.title)}" readonly style="flex: 1;">
                    <input type="text" class="ws-input" value="${p.quick || ''}" readonly style="width: 140px;" placeholder="No shortcut">
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${this.escapeHtml(p.text)}</textarea>
        `;
    }

    // --- IMPORT RESOLUTION (Editable, Inline Errors) ---
    public resolveImport(prompt: any, onUpdate: (p: any) => void) {
        this.clearTipRotation();
        if (!this.container) return;

        const { title, shortcut, body } = prompt.conflicts;

        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
                    <input type="text" id="res-title" class="ws-title-input ${title ? 'error' : 'success'}" value="${this.escapeHtml(prompt.title)}" style="flex: 1;">
                    <input type="text" id="res-quick" class="ws-input ${shortcut ? 'error' : (prompt.quick ? 'success' : '')}" value="${prompt.quick || ''}" placeholder="Shortcut" style="width: 140px;">
                </div>
                <div id="err-title" class="validation-msg error" style="display:${title ? 'block' : 'none'}">Title already exists</div>
                <div id="err-quick" class="validation-msg error" style="display:${shortcut ? 'block' : 'none'}">Shortcut taken</div>
                <div id="warn-body" class="validation-msg warning" style="display:${body ? 'block' : 'none'}">Content matches existing prompt: "${body}"</div>
            </div>
            <textarea class="ws-editor-body" readonly>${this.escapeHtml(prompt.text)}</textarea>
        `;

        const titleInp = this.container.querySelector('#res-title') as HTMLInputElement;
        const quickInp = this.container.querySelector('#res-quick') as HTMLInputElement;
        const errTitle = this.container.querySelector('#err-title') as HTMLElement;
        const errQuick = this.container.querySelector('#err-quick') as HTMLElement;

        const handleInput = () => {
            const cleanQuick = quickInp.value.replace(/\s/g, '');
            if (cleanQuick !== quickInp.value) {
                quickInp.value = cleanQuick;
            }

            prompt.title = titleInp.value;
            prompt.quick = cleanQuick;

            const titleMatch = this.store.prompts.some(p => p.title.trim().toLowerCase() === prompt.title.trim().toLowerCase());
            const quickMatch = prompt.quick ? this.store.prompts.some(p => p.quick?.trim().toLowerCase() === prompt.quick.trim().toLowerCase()) : false;

            prompt.conflicts.title = titleMatch;
            prompt.conflicts.shortcut = quickMatch;

            titleInp.className = `ws-title-input ${titleMatch ? 'error' : 'success'}`;
            errTitle.style.display = titleMatch ? 'block' : 'none';

            quickInp.className = `ws-input ${quickMatch ? 'error' : (prompt.quick ? 'success' : '')}`;
            errQuick.style.display = quickMatch ? 'block' : 'none';

            onUpdate(prompt);
        };

        quickInp.onkeydown = (e) => {
            if (e.key === ' ') e.preventDefault();
        };

        titleInp.addEventListener('input', handleInput);
        quickInp.addEventListener('input', handleInput);
    }

    private escapeHtml(text: string): string {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
