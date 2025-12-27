import { Component } from './Component';
import { Store, Prompt, Tag, Folder } from '../store'; // Added Folder
import { getVisibleIds } from '../utils/searchTree';
import Sortable from 'sortablejs';


export class PromptList extends Component {
    private list: HTMLElement | null = null;
    private MAX_CHIPS_TO_SHOW = 3;

    // --- PROPERTIES ---
    private selectedIndex: number = 0;
    private filteredPrompts: Prompt[] = []; // To track what is currently visible
    private sortable: Sortable | null = null;

    // ------------------

    mount(parent: HTMLElement) {
        this.list = parent.querySelector('#list');
        if (!this.list) {
            console.error('PromptList: #list element not found in parent');
            return;
        }

        // Subscribe to store updates
        this.store.subscribe('prompts_updated', () => this.render());
        this.store.subscribe('filter_updated', () => this.render());
        this.store.subscribe('tags_updated', () => this.render());
        this.store.subscribe('folders_updated', () => this.render());

        // Setup static listeners ONCE

        // Initial render
        this.initSortable();

        this.render();
    }

    render() {
        if (!this.list) return;
        const scrollTop = this.list.scrollTop;
        const filterText = this.store.filterText.trim();
        const isFiltering = filterText !== '';

        this.list.innerHTML = '';

        let visibleSet: Set<string> | null = null;

        if (isFiltering) {
            // Calculate which items to show
            visibleSet = getVisibleIds(this.store.prompts, this.store.folders, filterText);

            if (visibleSet.size === 0) {
                const e = this.el('div', 'empty', 'No matches found.');
                this.list.appendChild(e);
                return;
            }
        }

        // Always use Tree View, but pass the filter set
        this.renderTree(null, 0, visibleSet);

        this.list.scrollTop = scrollTop;
    }

    // 2. Add the Recursive Tree Renderer
    private renderTree(parentId: string | null, depth: number, visibleSet: Set<string> | null) {
        // A. Get Folders for this level
        const folders = this.store.folders
            .filter(f => f.parentId == parentId) // Use == to match null/undefined
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // B. Get Prompts for this level
        const prompts = this.store.prompts
            .filter(p => p.parentId == parentId); // Use == to match null/undefined
        // .sort(...) // Add prompt sorting logic here later if needed

        // C. Render Folders
        folders.forEach(folder => {
            // FILTER CHECK
            if (visibleSet && !visibleSet.has(folder.id)) return;

            // EXPANSION CHECK
            // Force expand if searching (visibleSet exists), otherwise use user preference
            const isExpanded = visibleSet ? true : folder.isExpanded;

            const row = this.createFolderRow(folder, depth, isExpanded);
            this.list!.appendChild(row);

            // RECURSION: If expanded, render children immediately below
            if (isExpanded) {
                this.renderTree(folder.id, depth + 1, visibleSet);
            }
        });

        // D. Render Prompts
        prompts.forEach(p => {
            // FILTER CHECK
            if (visibleSet && !visibleSet.has(p.id)) return;

            const row = this.createPromptRow(p);
            // Apply Indentation
            this.applyIndentation(row, depth);
            this.list!.appendChild(row);
        });

        // E. Empty State (Only show if Root has no items)
        if (depth === 0 && !visibleSet && folders.length === 0 && prompts.length === 0) {
            const e = this.el('div', 'empty', 'No prompts yet.');
            this.list!.appendChild(e);
        }
    }

    // 3. Helper to apply indentation
    private applyIndentation(element: HTMLElement, depth: number) {
        if (depth > 0) {
            // 24px per level (adjust based on your design preferences)
            element.style.paddingLeft = `${10 + (depth * 24)}px`;
        }
    }

    // 2. Update createFolderRow
    private createFolderRow(folder: Folder, depth: number, isExpanded: boolean = false): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;

        // Indentation
        if (depth > 0) row.style.paddingLeft = `${16 + (depth * 16)}px`;

        if (isExpanded) row.classList.add('expanded');

        const left = this.el('div', 'folder-left');

        // Chevron
        const chevron = this.el('div', 'folder-icon chevron');
        chevron.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        // Folder Name
        const name = this.el('span', '', folder.name);

        left.appendChild(chevron);
        left.appendChild(name);
        row.appendChild(left);

        // Right side: Count or Edit
        // For now, let's keep it simple as per screenshot logic
        // We can add the '2' count later if needed by filtering store prompts

        // Click to Toggle
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.store.filterText.trim() === '') {
                this.store.toggleFolderExpansion(folder.id);
            }
        });

        // Add Edit Button container
        const actions = this.el('div', 'row-actions');

        const addBtn = this.el('button', 'action-btn');
        addBtn.title = 'Add Sub-item';
        addBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shadow.dispatchEvent(new CustomEvent('add-to-folder', { detail: { folderId: folder.id } }));
        });

        const editBtn = this.el('button', 'action-btn');
        editBtn.title = 'Edit Folder';
        editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shadow.dispatchEvent(new CustomEvent('edit-folder', { detail: { folderId: folder.id } }));
        });

        actions.appendChild(addBtn);
        actions.appendChild(editBtn);
        row.appendChild(actions);

        return row;
    }

    // src/content/components/PromptList.ts

    // 3. Helper for Flat View (Search) - REMOVED

    // src/content/components/PromptList.ts


    // --- Only handles the bottom spacer ---

    // --- PUBLIC METHODS ---
    public selectNext() {
        if (this.filteredPrompts.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredPrompts.length;
        this.updateSelectionVisuals();
    }

    public selectPrev() {
        if (this.filteredPrompts.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredPrompts.length) % this.filteredPrompts.length;
        this.updateSelectionVisuals();
    }

    public async copySelected() {
        if (this.filteredPrompts.length === 0) return;
        const p = this.filteredPrompts[this.selectedIndex];
        if (p) {
            try {
                await navigator.clipboard.writeText(p.text);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
            } catch {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copy failed' } }));
            }
        }
    }

    private updateSelectionVisuals() {
        const rows = this.list?.children;
        if (!rows) return;

        let rowIndex = 0;
        for (let i = 0; i < rows.length; i++) {
            const el = rows[i] as HTMLElement;
            if (!el.classList.contains('row')) continue;

            if (rowIndex === this.selectedIndex) {
                el.classList.add('selected');
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.classList.remove('selected');
            }
            rowIndex++;
        }
    }

    private createPromptRow(p: Prompt, showContext: boolean = false): HTMLElement {
        const row = this.el('div', 'row');
        row.dataset.id = p.id;

        // Subtle background for pinned rows
        if (p.isPinned) {
            row.style.background = 'var(--bg-active, rgba(255,255,255,0.05))';
        }

        // CLICK TO EDIT (New Behavior)
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shadow.dispatchEvent(new CustomEvent('edit-prompt', { detail: { promptId: p.id } }));
        });

        const left = this.el('div', 'prompt-left');

        // Pinned Visual Indicator (Icon before title)
        if (p.isPinned) {
            const pinIcon = this.el('span', 'pin-icon');
            pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
            pinIcon.style.marginRight = '6px';
            pinIcon.style.display = 'flex';
            pinIcon.style.alignItems = 'center';
            left.appendChild(pinIcon);
        }

        // Title
        const label = this.el('div', 'prompt-title', p.title);
        left.appendChild(label);

        // Context Badge
        if (showContext && p.parentId) {
            const folder = this.store.folders.find(f => f.id === p.parentId);
            if (folder) {
                const fBadge = this.el('span', 'prompt-folder-badge');
                fBadge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> ${folder.name}`;
                left.appendChild(fBadge);
            }
        }

        row.appendChild(left);

        // Shortcut Badge
        if (p.quick) {
            const badge = this.el('div', 'shortcut-badge', p.quick);
            row.appendChild(badge);
        }

        // Actions container
        const actions = this.el('div', 'row-actions');

        // Pin Button
        const pinBtn = this.el('button', 'action-btn');
        pinBtn.title = p.isPinned ? 'Unpin' : 'Pin (Max 5)';
        if (p.isPinned) {
            pinBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
            pinBtn.style.color = 'var(--accent)';
        } else {
            pinBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
        }

        pinBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await this.store.togglePin(p.id);
                // Notification and refresh handled by Store and Subscription
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: p.isPinned ? 'Pinned' : 'Unpinned' } 
                }));
            } catch (err: any) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: err.message || 'Pin failed' } 
                }));
            }
        });
        actions.appendChild(pinBtn);

        // Copy Button
        const copyBtn = this.el('button', 'action-btn');
        copyBtn.title = 'Copy Prompt';
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

        copyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(p.text);
                this.store.recordUsage(p.id);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
            } catch {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copy failed' } }));
            }
        });

        actions.appendChild(copyBtn);
        row.appendChild(actions);

        return row;
    }

    private createTagChips(tagIds: string[]): HTMLElement {
        const chips = this.el('div', 'tag-chips');
        const pTags = tagIds.map(id => this.store.tags.find(t => t.id === id)).filter(Boolean) as Tag[];
        const visible = pTags.slice(0, this.MAX_CHIPS_TO_SHOW);

        visible.forEach(t => {
            const chip = this.el('span', 'tag-chip', t.name);
            chip.title = t.name;
            const bg = t.color || '#333333';
            chip.style.background = bg;
            chip.style.color = this.getContrastTextColor(bg);
            chip.style.border = '1px solid rgba(0,0,0,0.1)';
            chip.style.fontWeight = '600';
            chips.appendChild(chip);
        });

        if (pTags.length > this.MAX_CHIPS_TO_SHOW) {
            const more = this.el('span', 'tag-chip overflow', `+${pTags.length - this.MAX_CHIPS_TO_SHOW}`);
            chips.appendChild(more);
        }
        return chips;
    }


    private getContrastTextColor(hexColor: string): string {
        if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    private initSortable() {
        if (!this.list) return;

        this.sortable = new Sortable(this.list, {
            animation: 150,
            ghostClass: "ghost",  // Class for the drop placeholder
            chosenClass: "chosen", // Class for the item being dragged
            handle: ".drag-handle", // Restrict drag start to this handle
            fallbackTolerance: 5,
            // Fired when the user finishes dragging
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;

                // Do nothing if the position hasn't changed
                if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
                    return;
                }

                // Silently update the store's data to match the new DOM order
                (this.store as any).reorderPromptsSilently(oldIndex, newIndex);
            },
        });
    }




}


