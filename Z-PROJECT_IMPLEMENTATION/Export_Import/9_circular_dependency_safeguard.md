Step 07: Robust Validation & Cycle Detection
Objective: Prevent browser crashes by detecting circular folder dependencies and validating data integrity before the UI attempts to render the tree.
Files to Modify:
src/content/store.ts
Tasks:
1. Update validateImportData in Store
We will add a logic loop that traces the ancestry of every folder. If a folder traces back to itself, or if the path is suspiciously deep (>20), we reject the file.
code
TypeScript
// src/content/store.ts -> Replace the existing validateImportData method

validateImportData(data: BackupData): { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } {
    // 1. Basic Schema Check
    if (!data || !Array.isArray(data.prompts) || !Array.isArray(data.folders)) {
        throw new Error('Invalid backup format: Missing prompts or folders arrays.');
    }

    // 2. Circular Dependency & Depth Check
    const folderMap = new Map<string, string | null>();
    data.folders.forEach(f => folderMap.set(f.id, f.parentId));

    // Iterate every folder to ensure no cycles exist
    for (const folder of data.folders) {
        let currentId: string | null = folder.id;
        const visited = new Set<string>();
        let depth = 0;

        while (currentId) {
            // Cycle detected?
            if (visited.has(currentId)) {
                throw new Error(`Circular dependency detected in folder structure (Folder ID: ${folder.id})`);
            }
            
            visited.add(currentId);
            depth++;

            // Reasonable depth limit for import (prevent stack overflow attacks)
            if (depth > 20) {
                 throw new Error(`Folder structure too deep (Level ${depth}). Max allowed is 20.`);
            }

            // Move up to parent
            currentId = folderMap.get(currentId) || null;
        }
    }

    // 3. Prompt Validation & Conflict Detection (Existing Logic)
    const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
        // ... (Keep your existing matching logic here) ...
        const titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === incoming.title.trim().toLowerCase());
        const shortcutMatch = incoming.quick 
            ? this.prompts.some(p => p.quick?.trim().toLowerCase() === incoming.quick?.trim().toLowerCase()) 
            : false;
        
        const matchingBodyPrompt = this.prompts.find(p => p.text.trim() === incoming.text.trim());

        return {
            ...incoming,
            isExcluded: false,
            conflicts: {
                title: titleMatch,
                shortcut: shortcutMatch,
                body: matchingBodyPrompt ? matchingBodyPrompt.title : null
            }
        };
    });

    const validatedFolders: ValidatedFolder[] = data.folders.map(incoming => ({
        ...incoming,
        isExcluded: false
    }));

    return { prompts: validatedPrompts, folders: validatedFolders };
}
2. Update ImportOverlay.ts to Handle Specific Errors
Update the catch block to show the specific error message (e.g., "Circular dependency detected") instead of a generic one.
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside handleFile

reader.onload = (event) => {
    try {
        const json = JSON.parse(event.target?.result as string) as BackupData;
        
        // This will now THROW if cycles exist
        const validated = this.store.validateImportData(json);
        
        this.validatedPrompts = validated.prompts;
        this.validatedFolders = validated.folders;
        
        // ... rest of logic
        this.selectedIds = new Set([ ... ]);
        this.renderPreview();

    } catch (err: any) {
        console.error(err);
        // Show the actual error message from the store
        const msg = err.message || 'Invalid backup file';
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg } }));
    }
};
