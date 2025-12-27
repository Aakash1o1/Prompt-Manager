Step 01: The Migration Engine & Schema v2
Objective: Upgrade the data model to Version 2 (adding flexible attributes) and implement the core logic that upgrades old data formats automatically.
Files to Modify:
src/content/store.ts
Tasks:
1. Update Types and Constants
In src/content/store.ts, update the interfaces and define the version constants.
code
TypeScript
// src/content/store.ts

// 1. ADD: Version Constants
export const CURRENT_SCHEMA_VERSION = 2;

// 2. UPDATE: Prompt & Folder Interfaces
// Add the 'attributes' bag for future-proofing
export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
    parentId?: string | null;
    lastUsed?: number;
    isPinned?: boolean;
    attributes?: Record<string, any>; // NEW: Flexible bag
};

export type Folder = {
    id: string;
    name: string;
    parentId: string | null;
    order: number;
    isExpanded?: boolean;
    attributes?: Record<string, any>; // NEW: Flexible bag
};

// ... existing BackupMetadata ...
2. Define the Migration Logic
Add the MIGRATIONS object and the migrateData method to the Store class.
code
TypeScript
// src/content/store.ts -> Add outside the class or as a private static property
// For simplicity, add it just above the Store class

const MIGRATIONS: Record<number, (data: any) => any> = {
    // Migration v1 -> v2
    // Goal: Ensure 'attributes' object exists on all items
    2: (data: any) => {
        console.log("Migrating data to v2...");
        if (Array.isArray(data.prompts)) {
            data.prompts = data.prompts.map((p: any) => ({
                ...p,
                attributes: p.attributes || {} // Initialize if missing
            }));
        }
        if (Array.isArray(data.folders)) {
            data.folders = data.folders.map((f: any) => ({
                ...f,
                attributes: f.attributes || {} // Initialize if missing
            }));
        }
        return data;
    }
    // Future migrations (e.g. 3) will go here...
};

// ... Inside Store Class ...

    /**
     * Pipelines the data through necessary migrations up to CURRENT_SCHEMA_VERSION.
     */
    private migrateData(data: BackupData): BackupData {
        // Deep copy to avoid mutating original reference during dry-runs
        let processed = JSON.parse(JSON.stringify(data));
        
        // Default to 0 if missing (legacy files)
        const fileVersion = processed.metadata?.schemaVersion || 0;

        // UPGRADE PATH (Old -> New)
        if (fileVersion < CURRENT_SCHEMA_VERSION) {
            for (let v = fileVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
                if (MIGRATIONS[v]) {
                    try {
                        processed = MIGRATIONS[v](processed);
                    } catch (e) {
                        console.error(`Migration to v${v} failed`, e);
                        // We continue, hoping the next step might recover or it's non-fatal
                    }
                }
            }
            // Update metadata after successful migration
            if (!processed.metadata) processed.metadata = {};
            processed.metadata.schemaVersion = CURRENT_SCHEMA_VERSION;
        }

        return processed;
    }
3. Update Export to use New Version
Modify prepareExportData to stamp the file with the new constant.
code
TypeScript
// src/content/store.ts -> prepareExportData

prepareExportData(selectedPromptIds: string[], selectedFolderIds: string[]): BackupData {
    const exportedPrompts = this.prompts.filter(p => selectedPromptIds.includes(p.id));
    const exportedFolders = this.folders.filter(f => selectedFolderIds.includes(f.id));

    return {
        metadata: {
            timestamp: new Date().toISOString(),
            schemaVersion: CURRENT_SCHEMA_VERSION, // UPDATE THIS
            itemCount: exportedPrompts.length
        },
        prompts: exportedPrompts,
        folders: exportedFolders
    };
}
4. Update Import Validation to Run Migration
Modify validateImportData to run the migration first.
code
TypeScript
// src/content/store.ts -> validateImportData

validateImportData(rawData: BackupData): { prompts: ValidatedPrompt[], folders: ValidatedFolder[], warnings: string[] } {
    const warnings: string[] = [];

    // 1. Basic Structure Check
    if (!rawData || !Array.isArray(rawData.prompts) || !Array.isArray(rawData.folders)) {
        throw new Error('Invalid backup format: Missing prompts or folders arrays.');
    }

    // 2. Downgrade Check (Future File -> Old App)
    const fileVersion = rawData.metadata?.schemaVersion || 0;
    if (fileVersion > CURRENT_SCHEMA_VERSION) {
        warnings.push(`Backup is from a newer version (v${fileVersion}). Some features may be missing.`);
    }

    // 3. Run Migrations (Safe to run even if downgraded, logic handles versions)
    const data = this.migrateData(rawData);

    // 4. Circular Dependency Check (Keep existing logic)
    // ... (Paste your existing circular dependency loop here) ...
    // Note: Use 'data.folders' (the migrated data) for the loop
    const folderMap = new Map<string, string | null>();
    data.folders.forEach(f => folderMap.set(f.id, f.parentId));
    
    for (const folder of data.folders) {
        let currentId: string | null = folder.id;
        const visited = new Set<string>();
        let depth = 0;
        while (currentId) {
            if (visited.has(currentId)) throw new Error(`Circular dependency detected (Folder ID: ${folder.id})`);
            visited.add(currentId);
            depth++;
            if (depth > 20) throw new Error(`Folder structure too deep (Level ${depth}).`);
            currentId = folderMap.get(currentId) || null;
        }
    }
    // ----------------------------------------------------

    // 5. Prompt Validation (Keep existing logic)
    const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
        // ... (Keep existing match logic) ...
        const titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === incoming.title.trim().toLowerCase());
        const shortcutMatch = incoming.quick 
            ? this.prompts.some(p => p.quick?.trim().toLowerCase() === incoming.quick?.trim().toLowerCase()) 
            : false;
        
        const matchingBodyPrompt = this.prompts.find(p => p.text.trim() === incoming.text.trim());

        return {
            ...incoming, // This now includes 'attributes' from migration
            isExcluded: false,
            conflicts: {
                title: titleMatch,
                shortcut: shortcutMatch,
                body: matchingBodyPrompt ? matchingBodyPrompt.title : null
            }
        };
    });

    const validatedFolders: ValidatedFolder[] = data.folders.map(incoming => ({
        ...incoming, // This now includes 'attributes'
        isExcluded: false
    }));

    // Return warnings too so UI can show them
    return { prompts: validatedPrompts, folders: validatedFolders, warnings }; // Note the return type change!
}
Note: I updated the return signature of validateImportData to include warnings. We will use this in the next step.
