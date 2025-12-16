Step 3: UI - Folder Expansion & Recursive Rendering
Objective
We will transform the PromptList to support infinite nesting.
Interaction: Clicking a folder row will toggle its isExpanded state.
Visuals: We will render children immediately below their parent with indentation.
Recursion: If a child folder is also expanded, we render its children too.
Files to Modify
src/content/store.ts
src/content/components/PromptList.ts
Task 1: Add Toggle Logic to Store
File: src/content/store.ts
We need a way to flip the isExpanded boolean on a folder without saving to the database (since this is UI state). We will also ensure notify is called to trigger a re-render.
code
TypeScript
// [UPDATE] src/content/store.ts - Add inside Store class

    // --- UI Helper Methods ---

    toggleFolderExpansion(folderId: string) {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            folder.isExpanded = !folder.isExpanded;
            this.notify('folders_updated');
            // Optional: If you want to persist open/closed state across reloads, 
            // call this.saveFolders() here. For now, in-memory is faster.
        }
    }
Task 2: Implement Recursive Rendering
File: src/content/components/PromptList.ts
We are replacing renderRootView with a recursive function renderTree.
Logic:
Function takes a parentId.
Finds all folders/prompts with that parentId.
Renders them.
If a Folder is rendered AND isExpanded is true:
Call the function again with the folder's ID (recursion).
Increase indentation depth.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    // 1. Replace the render() method to call renderTree
    render() {
        if (!this.list) return;
        const scrollTop = this.list.scrollTop;

        // Check if filtering is active
        const isFiltering = this.store.filterText.trim() !== '' || this.store.selectedTagIds.length > 0;

        this.list.innerHTML = '';

        if (isFiltering) {
            this.renderFlatView();
        } else {
            // Start recursion from Root (null) at depth 0
            this.renderTree(null, 0);
        }

        this.list.scrollTop = scrollTop;
    }

    // 2. Add the Recursive Tree Renderer
    private renderTree(parentId: string | null, depth: number) {
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
            const row = this.createFolderRow(folder, depth);
            this.list!.appendChild(row);

            // RECURSION: If expanded, render children immediately below
            if (folder.isExpanded) {
                this.renderTree(folder.id, depth + 1);
            }
        });

        // D. Render Prompts
        prompts.forEach(p => {
            const row = this.createPromptRow(p);
            // Apply Indentation
            this.applyIndentation(row, depth);
            this.list!.appendChild(row);
        });

        // E. Empty State (Only show if Root has no items)
        if (depth === 0 && folders.length === 0 && prompts.length === 0) {
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
    private createFolderRow(folder: Folder, depth: number): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;
        
        this.applyIndentation(row, depth);

        // Add 'expanded' class for CSS rotation
        if (folder.isExpanded) {
            row.classList.add('expanded');
        }

        // Chevron
        const chevron = this.el('div', 'folder-icon chevron', '▶');
        // Folder Icon
        const icon = this.el('div', 'folder-icon', '📁');
        // Name
        const name = this.el('div', 'folder-name', folder.name);

        row.appendChild(chevron);
        row.appendChild(icon);
        row.appendChild(name);

        // Click Handler: Toggle Expansion
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            this.store.toggleFolderExpansion(folder.id);
        });

        return row;
    }
