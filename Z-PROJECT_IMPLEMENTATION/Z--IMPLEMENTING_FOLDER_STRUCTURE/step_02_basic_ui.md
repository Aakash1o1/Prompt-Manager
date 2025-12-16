Step 2: UI - Basic Folder Rendering
Objective
We will modify the PromptList component to render Folders visually.
Currently, the list just dumps all prompts. We will change this to:
If searching/filtering: Show the flat list of matching prompts (status quo).
If NOT searching: Show Root Level items only. This includes Root Folders (at the top) followed by Root Prompts.
Note: In this step, clicking a folder will not expand it yet (that is Step 3). We are just establishing the visual hierarchy and sorting.
Files to Modify
src/content/styles.ts
src/content/components/PromptList.ts
Task 1: Add Folder Styles
File: src/content/styles.ts
Add CSS classes for the folder rows. They should look distinct from prompts (different background or icon).
code
TypeScript
// [UPDATE] src/content/styles.ts - Append to the STYLES string

/* --- Folder Styles --- */
.folder-row {
  display: flex;
  align-items: center;
  gap: var(--gap);
  padding: var(--padding-small);
  border-radius: var(--border-radius-small);
  background: rgba(255, 255, 255, 0.03); /* Slightly distinct from prompts */
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  margin-bottom: 2px;
  font-weight: 500;
  color: var(--txt);
}

.folder-row:hover {
  background: var(--bg-hover);
  border-color: var(--border);
}

.folder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--muted);
  transition: transform 0.2s ease;
}

.folder-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chevron rotation for Step 3 (adding now for prep) */
.folder-row.expanded .folder-icon.chevron {
  transform: rotate(90deg);
}
Task 2: Update PromptList Logic
File: src/content/components/PromptList.ts
Import Folder type.
Update render() to handle the two modes (Search vs. Tree).
Implement renderRootView() to sort folders on top.
Implement createFolderRow() helper.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

// 1. Update Imports
import { Component } from './Component';
import { Store, Prompt, Tag, Folder } from '../store'; // Added Folder
import Sortable from 'sortablejs';

export class PromptList extends Component {
    // ... existing properties ...

    // 2. Update render()
    render() {
        if (!this.list) return;
        const scrollTop = this.list.scrollTop;

        // Check if filtering is active (Search text or Tags selected)
        const isFiltering = this.store.filterText.trim() !== '' || this.store.selectedTagIds.length > 0;

        this.list.innerHTML = '';

        if (isFiltering) {
            // --- FLAT VIEW (Existing Logic) ---
            this.renderFlatView();
        } else {
            // --- TREE VIEW (New Logic) ---
            this.renderRootView();
        }

        this.list.scrollTop = scrollTop;
    }

    // 3. Helper for Flat View (Search)
    private renderFlatView() {
        this.filteredPrompts = this.store.getFilteredPrompts();
        
        // Reset selection if out of bounds
        if (this.selectedIndex >= this.filteredPrompts.length) this.selectedIndex = 0;

        if (this.filteredPrompts.length === 0) {
            const e = this.el('div', 'empty', 'No matching prompts.');
            this.list!.appendChild(e);
            return;
        }

        this.filteredPrompts.forEach((p, index) => {
            const row = this.createPromptRow(p);
            if (index === this.selectedIndex) row.classList.add('selected');
            this.list!.appendChild(row);
        });
    }

    // 4. Helper for Root View (Default)
    private renderRootView() {
        // A. Get Root Folders (parentId === null)
        const rootFolders = this.store.folders
            .filter(f => f.parentId === null)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // B. Get Root Prompts (parentId === null)
        // We use the full prompt list from store, not filtered
        const rootPrompts = this.store.prompts
            .filter(p => p.parentId === null); 
            // Note: You might want to sort prompts by order here too if you have an order field

        if (rootFolders.length === 0 && rootPrompts.length === 0) {
             const e = this.el('div', 'empty', 'No prompts yet.');
             this.list!.appendChild(e);
             return;
        }

        // Render Folders First
        rootFolders.forEach(folder => {
            const row = this.createFolderRow(folder);
            this.list!.appendChild(row);
        });

        // Render Prompts Second
        // Note: In Tree View, we might want to disable keyboard navigation selection 
        // for now until Step 6, or update filteredPrompts to include visible items.
        // For this step, we just render them.
        rootPrompts.forEach(p => {
            const row = this.createPromptRow(p);
            this.list!.appendChild(row);
        });
    }

    // 5. Create Folder Row Element
    private createFolderRow(folder: Folder): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;

        // Chevron Icon (Static for now)
        const chevron = this.el('div', 'folder-icon chevron', '▶'); 
        // You can replace '▶' with SVG later: <svg...><path d="..."></svg>
        
        // Folder Icon
        const icon = this.el('div', 'folder-icon', '📁');

        // Name
        const name = this.el('div', 'folder-name', folder.name);

        row.appendChild(chevron);
        row.appendChild(icon);
        row.appendChild(name);

        return row;
    }

    // ... keep createPromptRow and other methods ...
}
