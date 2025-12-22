import { Component } from './Component';

export class PromptEditor extends Component {
    private area: HTMLElement | null = null;
    private currentTab: 'prompt' | 'folder' = 'prompt';
    private editingId: string | null = null;
    private editingFolderId: string | null = null;
    public draftTagIds: string[] = [];
    public onTagsChanged: (() => void) | null = null;

    // State buffer to preserve inputs when switching tabs
    private formData = {
        title: '',
        quick: '',
        text: '',
        folderId: '' as string | null
    };

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#add-area');
        if (!this.area) return;
        this.renderForm();
        this.setupFormListeners();
    }

    private renderForm() {
        if (!this.area) return;
        // FIX: Added width: 100%, overflow: hidden to wrapper for strict constraint
        this.area.innerHTML = `
            <div style="
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 16px; 
                height: 100%; 
                width: 100%; 
                box-sizing: border-box; 
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                    <div style="display:flex; align-items:center; gap: 12px;">
                        <span id="editor-title-label" style="font-weight:700; font-size:11px; color:var(--txt-secondary); text-transform:uppercase; letter-spacing: 0.05em;">Create New</span>
                        <div class="tab-container">
                            <button id="tab-prompt" class="tab-btn active">Prompt</button>
                            <button id="tab-folder" class="tab-btn">Folder</button>
                        </div>
                    </div>
                    <select id="input-folder" style="background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:4px 8px; border-radius:6px; font-size:12px; max-width: 120px;"></select>
                </div>

                <!-- Content (Scrollable) -->
                <div id="form-content" style="
                    flex: 1; 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                    padding-bottom: 10px;
                    scrollbar-width: none;
                ">
                    <!-- Dynamic form fields injected here -->
                </div>

                <div style="
                    display:flex; 
                    gap:12px; 
                    align-items: center;
                    justify-content: flex-end;
                    margin-top:auto; 
                    padding-top: 16px; 
                    flex-shrink: 0;
                    border-top: 1px solid var(--border-subtle);
                ">
                    <button id="delete-btn" class="btn-ghost" style="color:var(--danger); display:none; margin-right: auto; padding: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                    </button>
                    <button id="cancel-btn" class="btn-ghost">Cancel</button>
                    <button id="save-btn" class="btn-primary">Save Changes</button>
                </div>
            </div>
        `;
    }

    private setupFormListeners() {
        const pTab = this.area?.querySelector('#tab-prompt');
        const fTab = this.area?.querySelector('#tab-folder');

        pTab?.addEventListener('click', () => this.switchTab('prompt'));
        fTab?.addEventListener('click', () => this.switchTab('folder'));

        this.area?.querySelector('#save-btn')?.addEventListener('click', () => this.save());
        this.area?.querySelector('#cancel-btn')?.addEventListener('click', () => this.close());
        this.area?.querySelector('#delete-btn')?.addEventListener('click', () => this.handleDelete());
    }

    private switchTab(tab: 'prompt' | 'folder', saveState: boolean = true) {
        if (saveState) {
            this.saveCurrentState();
        }
        this.currentTab = tab;
        this.area?.querySelector('#tab-prompt')?.classList.toggle('active', tab === 'prompt');
        this.area?.querySelector('#tab-folder')?.classList.toggle('active', tab === 'folder');
        this.renderFields();
        this.restoreState();
    }

    private saveCurrentState() {
        if (!this.area) return;
        const titleInput = this.area.querySelector('#input-title') as HTMLInputElement;
        const quickInput = this.area.querySelector('#input-quick') as HTMLInputElement;
        const bodyInput = this.area.querySelector('#input-body') as HTMLTextAreaElement;
        const folderInput = this.area.querySelector('#input-folder') as HTMLSelectElement;

        if (titleInput) this.formData.title = titleInput.value;
        if (quickInput) this.formData.quick = quickInput.value;
        if (bodyInput) this.formData.text = bodyInput.value;
        // Only update folderId if the input exists (it's in the header, so it should usually exist)
        if (folderInput) this.formData.folderId = folderInput.value || null;
    }

    private restoreState() {
        if (!this.area) return;
        const titleInput = this.area.querySelector('#input-title') as HTMLInputElement;
        const quickInput = this.area.querySelector('#input-quick') as HTMLInputElement;
        const bodyInput = this.area.querySelector('#input-body') as HTMLTextAreaElement;
        const folderInput = this.area.querySelector('#input-folder') as HTMLSelectElement;

        // Restore what makes sense for the current tab
        if (titleInput) titleInput.value = this.formData.title;
        if (quickInput) quickInput.value = this.formData.quick;
        if (bodyInput) bodyInput.value = this.formData.text;

        // Restore folder selection if valid
        if (folderInput) {
            folderInput.value = this.formData.folderId || "";
        }
    }

    private renderFields() {
        const container = this.area?.querySelector('#form-content');
        if (!container) return;

        if (this.currentTab === 'prompt') {
            container.innerHTML = `
                <div style="display: flex; gap: 16px; align-items: flex-end; margin-bottom: 16px;">
                    <div style="flex: 7; min-width: 0;">
                        <input id="input-title" class="search-input" type="text" placeholder="Prompt Title" autocomplete="off" style="width: 100%; font-size:18px; font-weight:700; background:transparent !important; border:none !important; padding: 0 !important; height: auto; outline: none;">
                    </div>
                    <div style="flex: 3; min-width: 0;">
                        <input id="input-quick" type="text" placeholder="Shortcut (.code)" autocomplete="off" style="width:100%; background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:8px; border-radius:6px; font-size: 13px;">
                    </div>
                </div>
                <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Content</label>
                <textarea id="input-body" placeholder="Type your prompt here..." autocomplete="off" style="width:100%; min-height:200px; background:var(--bg-input); color:var(--txt-primary); border:1px solid var(--border-subtle); padding:12px; border-radius:6px; resize:vertical; white-space: pre-wrap; font-family: inherit;"></textarea>
            `;

            // --- Add listener to prevent space in shortcut ---
            const quickInput = container.querySelector('#input-quick') as HTMLInputElement;
            if (quickInput) {
                quickInput.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.code === 'Space') {
                        e.preventDefault();
                    }
                });
                quickInput.addEventListener('input', () => {
                    if (quickInput.value.includes(' ')) {
                        quickInput.value = quickInput.value.replace(/\s/g, '');
                    }
                });
            }

        } else {
            container.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <input id="input-title" class="search-input" type="text" placeholder="Folder Title (e.g. Work Prompts)" autocomplete="off" style="width: 100%; font-size:18px; font-weight:700; background:transparent !important; border:none !important; padding: 0 !important; height: auto; outline: none;">
                </div>
            `;
        }
        const select = this.area?.querySelector('#input-folder') as HTMLSelectElement;
        this.renderFolderOptions(select?.value || null);
    }

    private renderFolderOptions(selectedId: string | null) {
        const select = this.area?.querySelector('#input-folder') as HTMLSelectElement;
        if (!select) return;

        select.innerHTML = '';

        // Option 1: Root
        const rootOpt = document.createElement('option');
        rootOpt.value = "";
        rootOpt.textContent = "📁 (Root)";
        select.appendChild(rootOpt);

        // Identify folders to exclude (the folder being edited and all its descendants)
        const excludedIds = new Set<string>();
        if (this.editingFolderId) {
            excludedIds.add(this.editingFolderId);
            const addDescendants = (id: string) => {
                this.store.folders
                    .filter(f => f.parentId === id)
                    .forEach(f => {
                        excludedIds.add(f.id);
                        addDescendants(f.id);
                    });
            };
            addDescendants(this.editingFolderId);
        }

        const renderLevel = (parentId: string | null, depth: number) => {
            const children = this.store.folders
                .filter(f => f.parentId == parentId)
                .filter(f => !excludedIds.has(f.id)) // EXCLUDE
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            children.forEach(folder => {
                const opt = document.createElement('option');
                opt.value = folder.id;
                const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth) : "";
                opt.textContent = `${prefix}📁 ${folder.name}`;
                select.appendChild(opt);

                renderLevel(folder.id, depth + 1);
            });
        };

        renderLevel(null, 0);
        select.value = selectedId || "";
    }

    open(promptId?: string, folderId?: string, parentId?: string, prefillText?: string) {
        if (!this.area) return;

        this.area.classList.add('open');
        this.area.setAttribute('aria-hidden', 'false');
        this.shadow.getElementById('panel')?.classList.add('mode-add');

        // Hide tab container and title label when editing an existing item
        const isEditing = !!promptId || !!folderId;
        const tabContainer = this.area.querySelector('.tab-container') as HTMLElement;
        const titleLabel = this.area.querySelector('#editor-title-label') as HTMLElement;
        const deleteBtn = this.area.querySelector('#delete-btn') as HTMLElement;

        if (tabContainer) tabContainer.style.display = isEditing ? 'none' : '';
        if (titleLabel) titleLabel.style.display = isEditing ? 'none' : '';
        if (deleteBtn) deleteBtn.style.display = isEditing ? 'block' : 'none';

        if (promptId) {
            this.editingId = promptId;
            this.editingFolderId = null;

            // 1. Populate data from store
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                this.formData = {
                    title: p.title,
                    quick: p.quick || '',
                    text: p.text,
                    folderId: p.parentId || null
                };
                this.draftTagIds = [...(p.tags || [])];
            }

            // 2. Switch tab (updates UI and restores from formData)
            // Pass false to avoid saving previous state from DOM
            this.switchTab('prompt', false);

        } else if (folderId) {
            this.editingId = null;
            this.editingFolderId = folderId;

            // 1. Populate data from store
            const f = this.store.folders.find(x => x.id === folderId);
            if (f) {
                this.formData = {
                    title: f.name,
                    quick: '',
                    text: '',
                    folderId: f.parentId || null
                };
            }

            // 2. Switch tab (updates UI and restores from formData)
            this.switchTab('folder', false);

        } else {
            // Create new mode
            this.editingId = null;
            this.editingFolderId = null;
            this.draftTagIds = [];

            // 1. Initialize empty form state
            this.formData = {
                title: '',
                quick: '',
                text: prefillText || '', // Use prefillText if provided
                folderId: parentId || null
            };

            // 2. Switch tab (updates UI and restores from formData)
            this.switchTab('prompt', false);
        }

        if (this.onTagsChanged) this.onTagsChanged();
    }

    close() {
        if (!this.area) return;
        this.area.classList.remove('open');
        this.area.setAttribute('aria-hidden', 'true');
        this.shadow.getElementById('panel')?.classList.remove('mode-add');
        this.shadow.dispatchEvent(new CustomEvent('editor-closed'));
    }

    toggleTag(tagId: string) {
        if (this.draftTagIds.includes(tagId)) {
            this.draftTagIds = this.draftTagIds.filter(id => id !== tagId);
        } else {
            this.draftTagIds.push(tagId);
        }
        if (this.onTagsChanged) this.onTagsChanged();
    }

    public isOpen(): boolean {
        return this.area ? this.area.classList.contains('open') : false;
    }

    private async handleDelete() {
        if (this.currentTab === 'prompt' && this.editingId) {
            if (confirm('Are you sure you want to delete this prompt?')) {
                await this.store.deletePrompt(this.editingId);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Prompt deleted' } }));
                this.close();
            }
        } else if (this.currentTab === 'folder' && this.editingFolderId) {
            if (confirm('Are you sure you want to delete this folder? (Items inside will be moved to parent)')) {
                await this.store.deleteFolder(this.editingFolderId);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Folder deleted' } }));
                this.close();
            }
        }
    }

    private async save() {
        const titleInput = this.area?.querySelector('#input-title') as HTMLInputElement;
        const folderInput = this.area?.querySelector('#input-folder') as HTMLSelectElement;

        const title = titleInput?.value.trim();
        const folderId = folderInput?.value || null;

        if (!title) {
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title is required' } }));
            return;
        }

        try {
            if (this.currentTab === 'prompt') {
                const bodyInput = this.area?.querySelector('#input-body') as HTMLTextAreaElement;
                const quickInput = this.area?.querySelector('#input-quick') as HTMLInputElement;
                const text = bodyInput?.value;
                const quick = quickInput?.value.trim() || '';

                if (!text) {
                    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Content is required' } }));
                    return;
                }

                if (this.editingId) {
                    await this.store.updatePrompt(this.editingId, { title, text, quick, tags: this.draftTagIds, parentId: folderId });
                } else {
                    await this.store.addPrompt(title, text, quick, this.draftTagIds, folderId);
                }
            } else {
                // Folder mode
                if (this.editingFolderId) {
                    await this.store.updateFolder(this.editingFolderId, { name: title, parentId: folderId });
                } else {
                    await this.store.addFolder(title, folderId);
                }
            }

            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Saved' } }));
            this.close();
        } catch (error) {
            // Display validation errors to the user
            const message = error instanceof Error ? error.message : 'Failed to save';
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message } }));
        }
    }
}