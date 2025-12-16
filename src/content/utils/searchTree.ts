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

    // 2. Check Folders (REMOVED: Folders are only shown if they contain matching prompts)
    /*
    folders.forEach(f => {
        if (f.name.toLowerCase().includes(query)) {
            visibleIds.add(f.id);
            addWithAncestors(f.parentId);
        }
    });
    */

    return visibleIds;
}
