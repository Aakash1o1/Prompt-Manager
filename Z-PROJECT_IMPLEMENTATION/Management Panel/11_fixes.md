1. Fix: Import Validation (Internal Duplicates)
Verification: Valid. The previous logic only checked incoming items against the Store. It failed to check if the incoming file contained two identical prompts (e.g., "Refactor Code" appearing twice in the JSON).
File: src/content/store.ts
Action: Update validateImportData to track titles and shortcuts encountered within the current batch.
code
TypeScript
// src/content/store.ts

    validateImportData(rawData: BackupData): { prompts: ValidatedPrompt[], folders: ValidatedFolder[], warnings: string[] } {
        // ... (Keep existing checks: Schema, Downgrade, Migrations) ...
        // ... (Keep existing Sanitization and Circular Dependency checks) ...

        // --- NEW: Batch Tracking Sets ---
        const batchTitles = new Set<string>();
        const batchShortcuts = new Set<string>();

        // 6. Prompt Validation & Conflict Detection
        const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
            const normalizedTitle = incoming.title.trim().toLowerCase();
            const normalizedQuick = incoming.quick ? incoming.quick.trim().toLowerCase() : null;

            // Check against Local Store
            let titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === normalizedTitle);
            let shortcutMatch = normalizedQuick 
                ? this.prompts.some(p => p.quick?.trim().toLowerCase() === normalizedQuick) 
                : false;
            
            // Check against Current Batch (Internal Duplicates)
            if (batchTitles.has(normalizedTitle)) titleMatch = true;
            if (normalizedQuick && batchShortcuts.has(normalizedQuick)) shortcutMatch = true;

            // Add to Batch Sets for next iteration
            batchTitles.add(normalizedTitle);
            if (normalizedQuick) batchShortcuts.add(normalizedQuick);

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

        // ... (Rest of function) ...
    }
2. Fix: Sidebar Delete Sync
Verification: Valid. If a prompt is deleted via the Sidebar (Kebab menu), the Workspace is currently unaware and keeps the deleted prompt open. Saving causes an error or creates a "zombie" entry.
File: src/content/components/Workspace.ts
Action: Subscribe to prompts_updated in the Workspace and check if the currently open prompt still exists.
code
TypeScript
// src/content/components/Workspace.ts

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#workspace');
        if (!this.container) return;
        
        // NEW: Subscribe to store updates to handle external deletions
        this.store.subscribe('prompts_updated', () => this.handleExternalUpdate());
        
        this.renderEmpty();
    }

    // NEW: Handler for store updates
    private handleExternalUpdate() {
        // If we are editing an existing prompt (not new)
        if (this.currentMode === 'editor' && this.originalPromptId) {
            // Check if it still exists in the store
            const exists = this.store.prompts.some(p => p.id === this.originalPromptId);
            
            if (!exists) {
                // It was deleted externally (e.g., Sidebar Kebab -> Delete)
                // Force close the editor to prevent "Phantom Saves"
                this.isDirty = false; // Prevent "Unsaved changes" alert loop
                this.renderEmpty();
            }
        }
    }
3. Fix: Indeterminate Logic Data Source
Verification: Valid. In the createRow method (used for Export) and createImportRow method (used for Import), ensuring the getAllDescendants helper receives the correct data array is critical. If you use this.store while in Import mode, the recursion will fail or return wrong results.
File: src/content/components/Sidebar.ts
Action: Update createRow (for Export) and createImportRow (for Import) to explicitly ensure they pass the correct data source to getAllDescendants.
For createRow (Export Mode):
It correctly uses this.store. Ensure line ~375 looks like this:
code
TypeScript
// Inside createRow (Export logic)
const descendants = this.getAllDescendants(opts.id, this.store.prompts, this.store.folders);
For createImportRow (Import Mode):
It MUST use this.importData. Update the logic block:
code
TypeScript
// src/content/components/Sidebar.ts -> inside createImportRow

    // Indeterminate Logic for Import
    // FIX: Ensure we check if importData exists and pass IT, not the store
    if (type === 'folder' && isChecked && this.importData) {
        
        // Pass Import Data Prompts/Folders
        const descendants = this.getAllDescendants(
            id, 
            this.importData.prompts, 
            this.importData.folders
        );
        
        const allSelected = descendants.every(descId => this.importSelectedIds.has(descId));
        
        if (descendants.length > 0 && !allSelected) {
            cb.indeterminate = true;
        }
    }
