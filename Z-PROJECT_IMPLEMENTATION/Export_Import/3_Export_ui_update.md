Step 02_fix: Advanced Export Selection Logic
Objective: Implement bi-directional selection logic where parents control children, but children only "invite" their parents without triggering a full branch selection.
Files to Modify:
src/content/components/ExportOverlay.ts
Tasks:
1. Update Selection Methods
Replace the handleSelection and unselectChildren methods in ExportOverlay.ts, and add the new selectChildren and selectAncestors helper methods.
code
TypeScript
// src/content/components/ExportOverlay.ts

private handleSelection(id: string, isFolder: boolean, isChecked: boolean) {
    if (isChecked) {
        this.selectedIds.add(id);
        
        // 1. Downward Selection: If folder, select all children
        if (isFolder) {
            this.selectChildren(id);
        }
        
        // 2. Upward Selection: Always select ancestors
        this.selectAncestors(id);
        
    } else {
        this.selectedIds.delete(id);
        
        // 3. Downward Deselection: If folder, must deselect all children
        if (isFolder) {
            this.unselectChildren(id);
        }
    }
    this.renderTree();
}

/**
 * Recursively selects all prompts and folders inside a parent folder.
 */
private selectChildren(folderId: string) {
    this.store.prompts.forEach(p => {
        if (p.parentId === folderId) {
            this.selectedIds.add(p.id);
        }
    });
    this.store.folders.forEach(f => {
        if (f.parentId === folderId) {
            this.selectedIds.add(f.id);
            this.selectChildren(f.id); // Recursive call
        }
    });
}

/**
 * Recursively selects parents. 
 * CRITICAL: This does NOT call selectChildren, satisfying the edge case.
 */
private selectAncestors(itemId: string) {
    // Check if the item is a prompt
    const prompt = this.store.prompts.find(p => p.id === itemId);
    // Check if the item is a folder
    const folder = this.store.folders.find(f => f.id === itemId);
    
    const parentId = prompt ? prompt.parentId : (folder ? folder.parentId : null);

    if (parentId) {
        this.selectedIds.add(parentId);
        this.selectAncestors(parentId); // Recursive call up the tree
    }
}

/**
 * Recursively removes all prompts and folders inside a parent folder from selection.
 */
private unselectChildren(folderId: string) {
    this.store.prompts.forEach(p => {
        if (p.parentId === folderId) {
            this.selectedIds.delete(p.id);
        }
    });
    this.store.folders.forEach(f => {
        if (f.parentId === folderId) {
            this.selectedIds.delete(f.id);
            this.unselectChildren(f.id); // Recursive call
        }
    });
}
