Step 1: Data Layer Foundation
Objective
We are updating the application's state management (Store) to support a Relational (Flat) Data Model for folders. We are not building the UI yet. We are establishing the database structure so Prompts can belong to Folders, and Folders can belong to other Folders.
Key Logic:
Flat Structure: Folders and Prompts live in separate arrays. Hierarchy is determined by a parentId field.
Deletion Logic: If a folder is deleted, its contents (prompts and subfolders) must not be deleted; they must be moved to the deleted folder's parent (or root).
Files to Modify
src/content/store.ts
src/content/ui.ts (Temporary modification for debugging)
Task 1: Update Types and Constants
File: src/content/store.ts
Update Prompt Type: Add an optional parentId field.
Create Folder Type: Define the structure for a folder.
Add Constant: Define FOLDERS_KEY for local storage persistence.
code
TypeScript
// [UPDATE] src/content/store.ts

// 1. Find the Prompt type definition and add parentId
export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
    parentId?: string | null; // NEW: ID of parent folder, or null for root
};

// 2. Add this NEW type definition
export type Folder = {
    id: string;
    name: string;
    parentId: string | null;
    order: number;       // For sorting folders amongst themselves
    isExpanded?: boolean; // Runtime only state for UI accordion
};

// 3. Add this to the Constants section
const FOLDERS_KEY = 'promptManager.folders';
Task 2: Update Store State and Listeners
File: src/content/store.ts
Add folders array to the Store class properties.
Update setupStorageListener to listen for folder changes from other tabs/windows.
code
TypeScript
// [UPDATE] src/content/store.ts - Inside class Store

export class Store {
    // ... existing properties ...
    prompts: Prompt[] = [];
    tags: Tag[] = [];
    folders: Folder[] = []; // NEW: Initialize empty folder array
    settings: Settings = DEFAULT_SETTINGS;

    // ... existing properties ...

    private setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'local') return;

            // ... existing checks ...

            // NEW: Add this check
            if (changes[FOLDERS_KEY]) {
                this.folders = changes[FOLDERS_KEY].newValue || [];
                this.notify('folders_updated');
            }
        });
    }
}
Task 3: Update Loading and Defaults
File: src/content/store.ts
Update load() to fetch folders from storage.
Update initializeDefaults() to create the initial storage entry for folders.
code
TypeScript
// [UPDATE] src/content/store.ts - Inside class Store

    async load() {
        try {
            // ... existing prompt loading ...

            // NEW: Load Folders
            const f = await getStorage<Folder[]>(FOLDERS_KEY);
            this.folders = Array.isArray(f) ? f : [];

            // ... existing settings/tags loading ...

            if (this.prompts.length === 0 && this.tags.length === 0) {
                await this.initializeDefaults();
            }

            this.notify('loaded');
            this.notify('prompts_updated');
            this.notify('tags_updated');
            this.notify('folders_updated'); // NEW notification
            this.notify('settings_updated');
        } catch (e) {
            console.error('Store: Failed to load data', e);
        }
    }

    private async initializeDefaults() {
        // ... existing default generation ...
        
        // NEW: Ensure default prompts have null parentId
        this.prompts.forEach(p => p.parentId = null);

        await Promise.all([
            this.savePrompts(),
            this.saveTags(),
            this.saveSettings(),
            this.saveFolders() // NEW: Save empty folder list
        ]);
    }
Task 4: Implement Folder Logic
File: src/content/store.ts
Add these new methods to the Store class.
code
TypeScript
// [UPDATE] src/content/store.ts - Add these methods to class Store

    // --- Folder Persistence ---
    async saveFolders() {
        try {
            await setStorage({ [FOLDERS_KEY]: this.folders });
            this.notify('folders_updated');
        } catch (e) {
            console.warn('Store: Failed saving folders', e);
        }
    }

    // --- Folder Operations ---

    async addFolder(name: string, parentId: string | null = null) {
        const newFolder: Folder = {
            id: uid(), // Uses existing uid() helper
            name,
            parentId,
            order: this.folders.length, 
            isExpanded: true 
        };
        this.folders.push(newFolder);
        await this.saveFolders();
    }

    async updateFolder(id: string, updates: Partial<Folder>) {
        const idx = this.folders.findIndex(f => f.id === id);
        if (idx === -1) return;
        this.folders[idx] = { ...this.folders[idx], ...updates };
        await this.saveFolders();
    }

    /**
     * Deletes a folder.
     * LOGIC: Prompts and Subfolders inside it are NOT deleted.
     * They are moved to the parent of the deleted folder.
     */
    async deleteFolder(folderId: string) {
        const folderToDelete = this.folders.find(f => f.id === folderId);
        if (!folderToDelete) return;

        const newParentId = folderToDelete.parentId; // Move items here

        // 1. Move subfolders up
        this.folders.forEach(f => {
            if (f.parentId === folderId) {
                f.parentId = newParentId;
            }
        });

        // 2. Move prompts up
        this.prompts.forEach(p => {
            if (p.parentId === folderId) {
                p.parentId = newParentId;
            }
        });

        // 3. Remove the folder
        this.folders = this.folders.filter(f => f.id !== folderId);

        // Save everything
        await Promise.all([this.saveFolders(), this.savePrompts()]);
    }
Task 5: Update Prompt Creation
File: src/content/store.ts
Update addPrompt to accept a parentId.
code
TypeScript
// [UPDATE] src/content/store.ts - Replace existing addPrompt

    async addPrompt(title: string, text: string, quick: string, tagIds: string[], parentId: string | null = null) {
        const newPrompt: Prompt = {
            id: uid(),
            title,
            text,
            quick,
            tags: tagIds,
            parentId: parentId // Set parent
        };
        this.prompts.push(newPrompt);
        await this.savePrompts();
    }
Task 6: Expose Store for Testing
File: src/content/ui.ts
We need to verify this logic works before building the UI. We will expose the store object to the window so we can manipulate it via the Chrome Console.
code
TypeScript
// [UPDATE] src/content/ui.ts

export async function renderUI(opts: { /*...*/ }) {
  // ... existing code ...

  // Initialize Store
  const store = new Store();
  
  // +++ INSERT THIS LINE +++
  (window as any).debugStore = store; 
  // ++++++++++++++++++++++++

  store.prompts = prompts;
  // ... rest of function
}
