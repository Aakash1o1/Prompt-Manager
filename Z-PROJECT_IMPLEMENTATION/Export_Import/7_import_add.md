Step 05: Smart Merge & Persistence
Objective: Implement the "Path-Walking" logic to merge folder structures and finalize the import by persisting the data to chrome.storage.local.
Files to Modify:
src/content/store.ts
src/content/components/ImportOverlay.ts
src/content/components/App.ts
Tasks:
1. Add finalizeImport to the Store
This method handles the "Smart Merge" logic. It ensures we don't duplicate folders and maps the incoming folder IDs to local IDs so prompts end up in the right place.
code
TypeScript
// src/content/store.ts -> Inside Store class

/**
 * Finalizes the import by merging folder structures and creating new prompts.
 */
async finalizeImport(
    selectedPrompts: ValidatedPrompt[], 
    selectedFolders: ValidatedFolder[]
) {
    // Map to track { importedFolderId : actualLocalFolderId }
    const idMap = new Map<string, string | null>();
    idMap.set(null, null); // Root maps to Root

    // We must process folders level by level to ensure parents exist before children
    // Sort by depth (simplest way is to process recursively)
    const processFolders = async (importedParentId: string | null, localParentId: string | null, depth: number) => {
        if (depth > 10) return; // Max depth safety

        const children = selectedFolders.filter(f => f.parentId === importedParentId);

        for (const importedFolder of children) {
            // Check if folder with same name exists at this local level
            let existingLocal = this.folders.find(f => 
                f.parentId === localParentId && 
                f.name.trim().toLowerCase() === importedFolder.name.trim().toLowerCase()
            );

            let localId: string;

            if (existingLocal) {
                localId = existingLocal.id;
            } else {
                // Create new folder
                localId = (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
                this.folders.push({
                    id: localId,
                    name: importedFolder.name,
                    parentId: localParentId,
                    order: this.folders.length,
                    isExpanded: true
                });
            }

            idMap.set(importedFolder.id, localId);
            // Recurse to children
            await processFolders(importedFolder.id, localId, depth + 1);
        }
    };

    // 1. Merge Folders
    await processFolders(null, null, 0);

    // 2. Create Prompts
    selectedPrompts.forEach(p => {
        const newId = (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
        const mappedParentId = idMap.get(p.parentId || null) || null;

        this.prompts.push({
            id: newId,
            title: p.title,
            text: p.text,
            quick: p.quick,
            tags: [], // Tags removed as per requirement
            parentId: mappedParentId
        });
    });

    // 3. Persist everything
    await Promise.all([this.saveFolders(), this.savePrompts()]);
}
2. Update ImportOverlay to Trigger Finalization
In src/content/components/ImportOverlay.ts, update the renderPreview confirm button listener to actually call the store.
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside renderPreview

this.area?.querySelector('#import-confirm')?.addEventListener('click', async () => {
    if (this.checkGlobalClashes()) return;

    const btn = this.area?.querySelector('#import-confirm') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Importing...';

    // Filter only what is selected
    const promptsToImport = this.validatedPrompts.filter(p => this.selectedIds.has(p.id));
    const foldersToImport = this.validatedFolders.filter(f => this.selectedIds.has(f.id));

    try {
        await this.store.finalizeImport(promptsToImport, foldersToImport);
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Import successful!' } }));
        this.close();
    } catch (err) {
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Import failed' } }));
        btn.disabled = false;
        btn.textContent = 'Import Selected';
    }
});
3. Cleanup Temporary Listeners in App.ts
In src/content/components/App.ts, you can now remove the temporary file-validated listener we used in Step 3.
code
TypeScript
// src/content/components/App.ts -> setupEventListeners()

// REMOVE THIS BLOCK
/*
this.shadow.addEventListener('file-validated', ((e: CustomEvent) => {
    ...
}) as EventListener);
*/
