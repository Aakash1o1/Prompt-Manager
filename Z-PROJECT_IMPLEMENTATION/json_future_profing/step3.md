Files to Modify: src/content/store.ts
Update the Step 4: Sanitization block inside validateImportData to explicitly catch self-references.
code
TypeScript
// src/content/store.ts -> inside validateImportData

    // ... (Steps 1, 2, 3 remain same) ...

        // --- STEP 4: SANITIZATION (Enhanced) ---
        const validFolderIds = new Set(data.folders.map(f => f.id));

        // Fix Folders
        data.folders.forEach(f => {
            // Case A: Parent ID points to non-existent folder
            if (f.parentId && !validFolderIds.has(f.parentId)) {
                f.parentId = null;
            }
            // Case B: Parent ID points to ITSELF (The Fix for your JSON)
            if (f.id === f.parentId) {
                console.warn(`Folder "${f.name}" refers to itself. Moving to Root.`);
                f.parentId = null;
            }
        });

        // Fix Prompts
        data.prompts.forEach(p => {
            // Case A: Parent ID points to non-existent folder
            if (p.parentId && !validFolderIds.has(p.parentId)) {
                p.parentId = null;
            }
            // Case B: Prompt somehow points to itself (Unlikely but safe to check)
            if (p.id === p.parentId) {
                p.parentId = null;
            }
        });
        // --------------------------------------

    // ... (Step 5, 6 remain same) ...
