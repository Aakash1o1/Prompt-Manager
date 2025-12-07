import { Component } from './Component';
import { Store, Prompt, Tag } from '../store';
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

        // Setup static listeners ONCE

        // Initial render
        this.initSortable();

        this.render();
    }

    render() {
        if (!this.list) return;


        const scrollTop = this.list.scrollTop;

        // 2. Calculate data
        const newFiltered = this.store.getFilteredPrompts();

        // Detect if list changed (filter applied/removed or reordered)
        if (newFiltered.length !== this.filteredPrompts.length ||
            (newFiltered.length > 0 && this.filteredPrompts.length > 0 && newFiltered[0].id !== this.filteredPrompts[0].id)) {
            this.selectedIndex = 0;
        }

        this.filteredPrompts = newFiltered;

        // Safety check: Reset selection if out of bounds
        if (this.selectedIndex >= this.filteredPrompts.length) {
            this.selectedIndex = 0;
        }

        // 3. Update DOM
        this.list.innerHTML = '';

        if (this.filteredPrompts.length === 0) {
            const e = this.el('div', 'empty', 'No prompts (or none match your search).');
            this.list.appendChild(e);
            return;
        }

        this.filteredPrompts.forEach((p, index) => {
            const row = this.createPromptRow(p);

            if (index === this.selectedIndex) {
                row.classList.add('selected');
            }

            this.list!.appendChild(row);
        });

        this.list.scrollTop = scrollTop;
    }

    // src/content/components/PromptList.ts

// src/content/components/PromptList.ts

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


