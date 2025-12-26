Step 01: Data Schema & Core Export Logic
Objective: Define the structured JSON format for backups and implement the core logic in the Store to generate this data and trigger a browser download.
Files to Modify:
src/content/store.ts
src/content/components/SettingsModal.ts
Tasks:
1. Define the Export Interfaces
In src/content/store.ts, add the following interfaces at the top of the file (after existing imports) to ensure our backup data is strictly typed.
code
TypeScript
// --- Backup Schema ---
export interface BackupMetadata {
    timestamp: string;
    schemaVersion: number;
    itemCount: number;
}

export interface BackupData {
    metadata: BackupMetadata;
    prompts: Prompt[];
    folders: Folder[];
}
2. Add Export Logic to the Store Class
In src/content/store.ts, add these two methods inside the Store class.
prepareExportData: Filters and structures the current state into the backup format.
downloadJSON: A helper to trigger the actual browser file save.
code
TypeScript
// Add these methods to the Store class in src/content/store.ts

/**
 * Prepares the JSON structure for export based on selected IDs.
 */
prepareExportData(selectedPromptIds: string[], selectedFolderIds: string[]): BackupData {
    const exportedPrompts = this.prompts.filter(p => selectedPromptIds.includes(p.id));
    const exportedFolders = this.folders.filter(f => selectedFolderIds.includes(f.id));

    return {
        metadata: {
            timestamp: new Date().toISOString(),
            schemaVersion: 1,
            itemCount: exportedPrompts.length
        },
        prompts: exportedPrompts,
        folders: exportedFolders
    };
}

/**
 * Triggers a browser download of the provided data as a .json file.
 */
triggerDownload(data: BackupData) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompts_backup_${date}.json`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
3. Update Settings UI with Initial Buttons
In src/content/components/SettingsModal.ts, we need to add the buttons to the UI and wire up a temporary "Full Export" test to verify the logic works before we build the selection overlay in the next step.
Update the renderUI method to include the Export/Import buttons.
code
TypeScript
// Inside SettingsModal.ts -> renderUI() 
// Add this block inside the scrollable content area, perhaps after the "Auto-close" toggle

/* ... existing toggles ... */

<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
    <label style="color: var(--txt-secondary); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 12px;">Data Management</label>
    <div style="display: flex; gap: 8px;">
        <button id="btn-export-trigger" class="btn-ghost" style="flex: 1; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/></svg>
            Export
        </button>
        <button id="btn-import-trigger" class="btn-ghost" style="flex: 1; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m7-7-5-5-5 5m5-5v12"/></svg>
            Import
        </button>
    </div>
</div>
4. Wire up Temporary Test Logic
In src/content/components/SettingsModal.ts, add the listener in setupListeners() to trigger a full export.
code
TypeScript
// Inside SettingsModal.ts -> setupListeners()

this.area?.querySelector('#btn-export-trigger')?.addEventListener('click', () => {
    // For Step 1 verification, we export EVERYTHING
    const pIds = this.store.prompts.map(p => p.id);
    const fIds = this.store.folders.map(f => f.id);
    
    const data = this.store.prepareExportData(pIds, fIds);
    this.store.triggerDownload(data);
});

this.area?.querySelector('#btn-import-trigger')?.addEventListener('click', () => {
    this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Import coming in Step 3' } }));
});
