Step 02: Integration & Downgrade Detection
Objective: Update the UI to display version warnings and modify the final save logic to persist the new attributes field (and other metadata) correctly.
Files to Modify:
src/content/components/ImportOverlay.ts
src/content/store.ts
Tasks:
1. Handle Warnings in ImportOverlay
Update src/content/components/ImportOverlay.ts to handle the new return signature from the store (which now includes warnings).
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside handleFile

// ... existing code ...
const json = JSON.parse(event.target?.result as string) as BackupData;

// Update destructuring to get warnings
const { prompts, folders, warnings } = this.store.validateImportData(json);

// 1. Show Warnings (if any)
if (warnings && warnings.length > 0) {
    warnings.forEach(msg => {
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg } }));
    });
}

this.validatedPrompts = prompts;
this.validatedFolders = folders;

// ... existing code (selection logic, renderPreview) ...
2. Update Persistence Logic in Store
Currently, finalizeImport constructs a new prompt object using specific fields (title, text, etc.). We need to update this to include the new attributes bag and other metadata (isPinned, lastUsed) so they are not lost during import.
code
TypeScript
// src/content/store.ts -> inside finalizeImport method

// ... inside the prompts loop ...
selectedPrompts.forEach(p => {
    const newId = (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
    const mappedParentId = idMap.get(p.parentId || null) || null;

    this.prompts.push({
        id: newId,
        title: p.title,
        text: p.text,
        quick: p.quick,
        tags: [], 
        parentId: mappedParentId,
        
        // ADD THESE FIELDS:
        isPinned: p.isPinned || false, // Preserve pin state
        lastUsed: p.lastUsed,          // Preserve history
        attributes: p.attributes || {} // Preserve flexible bag (ensured by migration)
    });
});
// ... rest of method ...
