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

    // 4. Update createFolderRow to handle clicks and depth
    private createFolderRow(folder: Folder, depth: number, isExpanded: boolean = false): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;

        this.applyIndentation(row, depth);

        if (isExpanded) {
            row.classList.add('expanded');
        }

        // --- Left Side (Chevron + Icon + Name) ---
        // We wrap them in a div so they push the actions to the far right
        const leftGroup = this.el('div', 'folder-left');
        Object.assign(leftGroup.style, { display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '0' });

        const chevron = this.el('div', 'folder-icon chevron', '▶');
        const icon = this.el('div', 'folder-icon', '📁');
        const name = this.el('div', 'folder-name', folder.name);

        leftGroup.appendChild(chevron);
        leftGroup.appendChild(icon);
        leftGroup.appendChild(name);

        row.appendChild(leftGroup);

        // --- Right Side (Actions) ---
        const actions = this.el('div', 'folder-actions');

        // 1. Add Subfolder Button
        const addBtn = this.el('button', 'folder-action-btn', '+');
        addBtn.title = 'Create Subfolder';
        addBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const subName = prompt(`Create subfolder in "${folder.name}":`);
            if (subName && subName.trim()) {
                await this.store.addFolder(subName.trim(), folder.id);
                // Auto-expand the parent so we see the new child
                if (!folder.isExpanded) {
                    this.store.toggleFolderExpansion(folder.id);
                }
            }
        });

        // 2. Delete Button
        const delBtn = this.el('button', 'folder-action-btn delete', '×');
        delBtn.title = 'Delete Folder';
        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Delete folder "${folder.name}"? Contents will move up.`)) {
                await this.store.deleteFolder(folder.id);
            }
        });

        actions.appendChild(addBtn);
        actions.appendChild(delBtn);

        row.appendChild(actions);

        // --- Click Handler (Toggle) ---
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            // Only allow toggling if NOT searching
            if (this.store.filterText.trim() === '') {
                this.store.toggleFolderExpansion(folder.id);
            }
        });

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

    private createPromptRow(p: Prompt): HTMLElement {
        const row = this.el('div', 'row');
        if (!p.quick) row.classList.add('heading-row');
        row.dataset.id = p.id;

        // Click to copy
        row.addEventListener('click', async () => {
            const idx = this.filteredPrompts.findIndex(x => x.id === p.id);
            if (idx !== -1) {
                this.selectedIndex = idx;
                this.updateSelectionVisuals();
            }

            try {
                await navigator.clipboard.writeText(p.text);
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
            } catch {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copy failed' } }));
            }
        });

        // Left side
        const left = this.el('div', 'left');

        const isFiltered = this.store.filterText.trim() !== '' || this.store.selectedTagIds.length > 0;

        // src/content/components/PromptList.ts inside createPromptRow

        if (!isFiltered) {
            const handle = this.el('div', 'drag-handle');
            handle.innerHTML = '&#x2261;';

            // Prevent click on handle from triggering copy on the row
            handle.addEventListener('click', (ev) => {
                ev.stopPropagation();
            });

            // NO MORE dragstart/dragend listeners here. They are delegated now.

            left.appendChild(handle);
        }


        const label = this.el('div', 'label', p.title);
        left.appendChild(label);

        // Tags Chips
        const isTagFilterActive = this.store.selectedTagIds.length > 0;
        if (isTagFilterActive && p.tags && p.tags.length > 0) {
            const chips = this.createTagChips(p.tags);
            left.appendChild(chips);
        }

        // Right side (Icons)
        const icons = this.el('div', 'icons');
        const editBtn = this.el('button', 'icon-btn');
        editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const event = new CustomEvent('edit-prompt', { detail: { promptId: p.id } });
            this.shadow.dispatchEvent(event);
        });

        icons.appendChild(editBtn);
        row.appendChild(left);
        row.appendChild(icons);

        row.addEventListener('dragover', (ev) => ev.preventDefault());

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


