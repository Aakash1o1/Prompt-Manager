Step 4: UI - Folder Management
Objective
Implement the UI controls to Create and Delete folders.
Header: Add a "New Folder" button 📁+.
Folder Row: Add "Add Subfolder" + and "Delete" × buttons to each folder line item.
Files to Modify
src/content/host.ts
src/content/styles.ts
src/content/components/SearchBar.ts
src/content/components/PromptList.ts
Task 1: Update HTML Structure
File: src/content/host.ts
Add the "New Folder" button to the header controls area.
Find this section in the shadow.innerHTML:
code
Html
<div class="controls">
  <button id="add-btn" class="ctrl-btn" title="Add">＋</button>
Add the new button immediately after it:
code
Html
<div class="controls">
  <button id="add-btn" class="ctrl-btn" title="Add Prompt">＋</button>
  <!-- NEW BUTTON -->
  <button id="new-folder-btn" class="ctrl-btn" title="New Folder">📁+</button>
  <!-- ... existing buttons ... -->
Task 2: Add Styles for Actions
File: src/content/styles.ts
Add CSS for the folder action buttons (right-aligned on the folder row).
code
CSS
/* [APPEND TO STYLES CONSTANT] */

/* Container for folder icons on the right */
.folder-actions {
  display: flex;
  gap: 4px;
  opacity: 0; /* Hidden by default */
  transition: opacity 0.2s ease;
}

/* Show actions on hover */
.folder-row:hover .folder-actions {
  opacity: 1;
}

/* Tiny action buttons */
.folder-action-btn {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
}

.folder-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--txt);
}

.folder-action-btn.delete:hover {
  color: #ff6b6b; /* Red hover for delete */
}
Task 3: Wire Up Header Button
File: src/content/components/SearchBar.ts
Bind the click listener to the new #new-folder-btn.
code
TypeScript
// [UPDATE] src/content/components/SearchBar.ts

export class SearchBar extends Component {
    // ... existing props ...
    private newFolderBtn: HTMLButtonElement | null = null; // NEW PROP

    mount(parent: HTMLElement) {
        // ... existing selectors ...
        this.newFolderBtn = parent.querySelector('#new-folder-btn'); // SELECT IT

        // ... existing listeners ...

        // NEW LISTENER
        if (this.newFolderBtn) {
            this.newFolderBtn.addEventListener('click', async () => {
                const name = prompt("Enter folder name:");
                if (name && name.trim()) {
                    await this.store.addFolder(name.trim(), null); // Null = Root
                }
            });
        }
        
        // ... rest of mount ...
    }
}
Task 4: Wire Up Folder Row Buttons
File: src/content/components/PromptList.ts
Update createFolderRow to include the actions container and buttons.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    private createFolderRow(folder: Folder, depth: number): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;
        
        this.applyIndentation(row, depth);

        if (folder.isExpanded) {
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
            this.store.toggleFolderExpansion(folder.id);
        });

        return row;
    }
