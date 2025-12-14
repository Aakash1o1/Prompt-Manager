Step 6: UI - Tree-Preserving Search
Objective
We are replacing the standard "Flat List" search with a Tree-Preserving Search.
When a user searches, we will:
Identify all prompts and folders that match the search term.
Calculate the "Ancestry Chain" for every match (find their parents, grandparents, etc.).
Filter the view to show only the matches and their ancestors.
Auto-expand all relevant folders so the user can see the matches deep inside the structure.
Files to Modify
src/content/utils/searchTree.ts (New File)
src/content/components/PromptList.ts
Task 1: Create Search Utility
File: src/content/utils/searchTree.ts
Create this file to handle the logic of calculating which IDs should remain visible.
code
TypeScript
// [NEW FILE] src/content/utils/searchTree.ts
import { Prompt, Folder } from '../store';

/**
 * Returns a Set of IDs (folders and prompts) that should be visible
 * based on the search text.
 * 
 * Logic:
 * 1. Find direct text matches.
 * 2. Walk up the tree from matches to Root, adding parents to the Set.
 */
export function getVisibleIds(
    prompts: Prompt[], 
    folders: Folder[], 
    filterText: string
): Set<string> {
    const visibleIds = new Set<string>();
    const query = filterText.toLowerCase().trim();

    if (!query) return visibleIds; // Return empty set if no query

    // Helper map for quick parent lookup
    const folderMap = new Map<string, Folder>();
    folders.forEach(f => folderMap.set(f.id, f));

    // Helper: Add item and its ancestors
    const addWithAncestors = (parentId: string | null | undefined) => {
        let currentId = parentId;
        while (currentId) {
            if (visibleIds.has(currentId)) break; // Optimization: Path already traced
            visibleIds.add(currentId);
            const parent = folderMap.get(currentId);
            currentId = parent ? (parent.parentId || null) : null;
        }
    };

    // 1. Check Prompts
    prompts.forEach(p => {
        if (p.title.toLowerCase().includes(query) || 
            (p.quick && p.quick.toLowerCase().includes(query)) ||
            (p.text && p.text.toLowerCase().includes(query))
        ) {
            visibleIds.add(p.id);
            addWithAncestors(p.parentId);
        }
    });

    // 2. Check Folders (If folder name matches, show it)
    folders.forEach(f => {
        if (f.name.toLowerCase().includes(query)) {
            visibleIds.add(f.id);
            addWithAncestors(f.parentId);
        }
    });

    return visibleIds;
}
Task 2: Refactor PromptList Rendering
File: src/content/components/PromptList.ts
We will delete the renderFlatView logic and update renderTree to accept a filter set.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

// 1. Add Import
import { getVisibleIds } from '../utils/searchTree';

export class PromptList extends Component {
    // ... existing properties ...

    // 2. Replace render() completely
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

    // 3. Remove renderFlatView() method entirely (Cleanup)

    // 4. Update renderTree signature and logic
    private renderTree(parentId: string | null, depth: number, visibleSet: Set<string> | null) {
        // A. Get Folders for this level
        const folders = this.store.folders
            .filter(f => f.parentId == parentId) // loose match for null/undefined
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // B. Get Prompts for this level
        const prompts = this.store.prompts
            .filter(p => p.parentId == parentId); // loose match

        // C. Render Folders
        folders.forEach(folder => {
            // FILTER CHECK
            if (visibleSet && !visibleSet.has(folder.id)) return;

            // EXPANSION CHECK
            // Force expand if searching (visibleSet exists), otherwise use user preference
            const isExpanded = visibleSet ? true : folder.isExpanded;

            const row = this.createFolderRow(folder, depth, isExpanded);
            this.list!.appendChild(row);

            // RECURSION
            if (isExpanded) {
                this.renderTree(folder.id, depth + 1, visibleSet);
            }
        });

        // D. Render Prompts
        prompts.forEach(p => {
            // FILTER CHECK
            if (visibleSet && !visibleSet.has(p.id)) return;

            const row = this.createPromptRow(p);
            this.applyIndentation(row, depth);
            this.list!.appendChild(row);
        });

        // E. Empty State (Only show at root if no items exist at all)
        if (depth === 0 && !visibleSet && folders.length === 0 && prompts.length === 0) {
             const e = this.el('div', 'empty', 'No prompts yet.');
             this.list!.appendChild(e);
        }
    }

    // 5. Update createFolderRow to accept isExpanded override
    private createFolderRow(folder: Folder, depth: number, isExpanded: boolean = false): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;
        
        this.applyIndentation(row, depth);

        if (isExpanded) {
            row.classList.add('expanded');
        }

        // ... existing visual creation (Left Side, Chevron, Icon, Name) ...
        // (Copy your existing code for creating elements here)
        
        // RE-ADD ACTIONS (Copy your existing Step 4 code for buttons)
        
        // Click Handler
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            // Only allow toggling if NOT searching
            // (If searching, we want to keep the structure fixed to show results)
            if (this.store.filterText.trim() === '') {
                this.store.toggleFolderExpansion(folder.id);
            }
        });

        return row;
    }
}