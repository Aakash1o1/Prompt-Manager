Step 9: UI Redesign - Dashboard & Interactions
Objective
Fix the main dashboard UI and interactions.
Search Bar: Apply the glass design and icon.
Prompt List: Style rows, remove old copy logic, implement Click-to-Edit.
Footer: Ensure buttons are visible and wired correctly.
Files to Modify
src/content/components/SearchBar.ts
src/content/components/PromptList.ts
Task 1: Update SearchBar Logic
File: src/content/components/SearchBar.ts
We need to inject the icon SVG and update the structure.
code
TypeScript
// [UPDATE] src/content/components/SearchBar.ts
import { Component } from './Component';

export class SearchBar extends Component {
    private container: HTMLElement | null = null;
    private input: HTMLInputElement | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#search-container');
        if (!this.container) return;

        this.container.innerHTML = ''; 

        const wrapper = this.el('div', 'search-wrapper');

        // New SVG Icon
        const icon = this.el('div', 'search-icon');
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        this.input = this.el('input', 'search-input') as HTMLInputElement;
        this.input.type = 'text';
        this.input.placeholder = 'Type to search...';
        this.input.id = 'search-input';

        this.input.addEventListener('input', () => {
            this.store.setFilter(this.input!.value);
            this.shadow.dispatchEvent(new CustomEvent('nav-reset'));
        });
        
        // Keep nav keys
        this.input.addEventListener('keydown', (ev) => {
             if (ev.key === 'ArrowDown') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-next')); }
             else if (ev.key === 'ArrowUp') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-prev')); }
             else if (ev.key === 'Enter') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-copy')); }
        });

        this.input.value = this.store.filterText;

        wrapper.appendChild(icon);
        wrapper.appendChild(this.input);
        this.container.appendChild(wrapper);

        this.store.subscribe('filter_updated', () => {
             if (this.input && this.input.value !== this.store.filterText) {
                this.input.value = this.store.filterText;
            }
        });
    }
}
Task 2: Update PromptList Interaction
File: src/content/components/PromptList.ts
We must change the click handler on the row. Instead of copying, it should dispatch edit-prompt.
We also remove the old drag handle logic for now to clean up the UI.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    // ... existing imports ...

    private createPromptRow(p: Prompt, showContext: boolean = false): HTMLElement {
        const row = this.el('div', 'row');
        row.dataset.id = p.id;

        // CLICK TO EDIT (New Behavior)
        row.addEventListener('click', (e) => {
             e.stopPropagation();
             this.shadow.dispatchEvent(new CustomEvent('edit-prompt', { detail: { promptId: p.id } }));
        });

        const left = this.el('div', 'prompt-left');

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
            const badge = this.el('div', 'shortcut-badge', `.${p.quick}`);
            row.appendChild(badge);
        }

        return row;
    }
    
    // ... keep createFolderRow ...
Task 3: Verify Footer Connection
File: src/content/components/App.ts
Ensure the listener for edit-prompt opens the editor.
(No changes needed if you already have this listener, just verify it exists):
code
TypeScript
this.shadow.addEventListener('edit-prompt', ((e: CustomEvent) => {
    this.openEditor(e.detail.promptId);
}) as EventListener);
