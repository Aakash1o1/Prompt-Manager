// src/content/store.ts
import { getStorage, setStorage } from '../lib/storage';
import { DEFAULT_PROMPTS, DEFAULT_TAGS } from '../lib/defaultPrompts';

// --- Types ---
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

export interface ImportConflict {
    title: boolean;
    shortcut: boolean;
    body: string | null; // Changed from boolean to string | null
}

export interface ValidatedPrompt extends Prompt {
    conflicts: ImportConflict;
    isExcluded: boolean; // For user selection
}

export interface ValidatedFolder extends Folder {
    isExcluded: boolean; // For user selection
}

export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
    parentId?: string | null; // NEW: ID of parent folder, or null for root
};

export type Folder = {
    id: string;
    name: string;
    parentId: string | null;
    order: number;       // For sorting folders amongst themselves
    isExpanded?: boolean; // Runtime only state for UI accordion
};

export type Tag = {
    id: string;
    name: string;
    color: string;
    order: number;
};

export type Settings = {
    popupHeightVh: number;
    popupWidthPx: number;
    fontFamily: string;
    fontSizePx: number;
    theme: 'light' | 'dark';
    hotspotPosition: 'corner' | 'edge';
    hotspotWidthPx: number;
    autoCloseOnHover: boolean;
};

// --- Constants ---
const PROMPTS_KEY = 'promptManager.prompts';
const FOLDERS_KEY = 'promptManager.folders';
const SETTINGS_KEY = 'promptManager.settings';
const TAGS_KEY = 'promptManager.tags';

const DEFAULT_SETTINGS: Settings = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSizePx: 13,
    theme: 'dark',
    hotspotPosition: 'edge',
    hotspotWidthPx: 24,
    autoCloseOnHover: true
};

// --- Helper Functions ---
function uid() {
    return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
}

/**
 * The Store class acts as the "Brain" of the application.
 * It manages the application state (prompts, tags, settings) and handles data persistence.
 */
export class Store {
    // State
    prompts: Prompt[] = [];
    tags: Tag[] = [];
    folders: Folder[] = []; // NEW: Initialize empty folder array
    settings: Settings = DEFAULT_SETTINGS;

    // UI State (transient)
    filterText: string = '';
    selectedTagIds: string[] = [];

    // Event System
    private listeners: { [key: string]: Function[] } = {};

    constructor() {
        this.setupStorageListener();
    }

    reorderPromptsSilently(oldIndex: number, newIndex: number) {
        if (oldIndex === newIndex) return;

        // Move the item
        const [item] = this.prompts.splice(oldIndex, 1);
        this.prompts.splice(newIndex, 0, item);

        // Save to storage, but DO NOT call notify('prompts_updated')
        setStorage({ [PROMPTS_KEY]: this.prompts });
    }



    private setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'local') return;

            // Update local state if external storage changed
            if (changes[PROMPTS_KEY]) {
                this.prompts = (changes[PROMPTS_KEY].newValue as Prompt[]) || [];
                this.notify('prompts_updated');
            }
            if (changes[TAGS_KEY]) {
                this.tags = (changes[TAGS_KEY].newValue as Tag[]) || [];
                this.notify('tags_updated');
            }
            if (changes[SETTINGS_KEY]) {
                this.settings = (changes[SETTINGS_KEY].newValue as Settings) || DEFAULT_SETTINGS;
                this.notify('settings_updated');
            }
            if (changes[FOLDERS_KEY]) {
                this.folders = (changes[FOLDERS_KEY].newValue as Folder[]) || [];
                this.notify('folders_updated');
            }
        });
    }

    async load() {
        try {
            const p = await getStorage<Prompt[]>(PROMPTS_KEY);
            this.prompts = Array.isArray(p) ? p : [];

            // Ensure every prompt has a valid parentId (null if missing)
            let needsSave = false;
            this.prompts.forEach(prompt => {
                if (prompt.parentId === undefined) {
                    prompt.parentId = null;
                    needsSave = true;
                }
            });
            // If we found old data, save the cleaned version immediately
            if (needsSave) {
                await this.savePrompts();
            }
            // --------------------------------------

            // NEW: Load Folders
            const f = await getStorage<Folder[]>(FOLDERS_KEY);
            this.folders = Array.isArray(f) ? f : [];

            const s = await getStorage<Settings>(SETTINGS_KEY);
            this.settings = s ? s : DEFAULT_SETTINGS;

            const t = await getStorage<Tag[]>(TAGS_KEY);
            this.tags = Array.isArray(t) ? t : [];

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
        console.log('Store: Initializing default data...');

        this.tags = DEFAULT_TAGS.map((dt, index) => ({
            id: uid(),
            name: dt.name,
            color: dt.color,
            order: index
        }));

        this.prompts = DEFAULT_PROMPTS.map(dp => {
            const promptTags: string[] = [];
            if (dp.tags) {
                for (const tagName of dp.tags) {
                    const tag = this.tags.find(t => t.name === tagName);
                    if (tag) promptTags.push(tag.id);
                }
            }
            return {
                id: uid(),
                title: dp.title,
                text: dp.text,
                quick: dp.quick,
                tags: promptTags
            };
        });

        // NEW: Ensure default prompts have null parentId
        this.prompts.forEach(p => p.parentId = null);

        await Promise.all([
            this.savePrompts(),
            this.saveTags(),
            this.saveSettings(),
            this.saveFolders() // NEW: Save empty folder list
        ]);
    }

    // --- Persistence Methods ---

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

    validateImportData(data: BackupData): { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } {
        const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
            const titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === incoming.title.trim().toLowerCase());
            const shortcutMatch = incoming.quick 
                ? this.prompts.some(p => p.quick?.trim().toLowerCase() === incoming.quick?.trim().toLowerCase()) 
                : false;
            
            // FIND the actual matching prompt to get its title
            const matchingBodyPrompt = this.prompts.find(p => p.text.trim() === incoming.text.trim());

            return {
                ...incoming,
                isExcluded: false,
                conflicts: {
                    title: titleMatch,
                    shortcut: shortcutMatch,
                    body: matchingBodyPrompt ? matchingBodyPrompt.title : null // Store the title
                }
            };
        });

        const validatedFolders: ValidatedFolder[] = data.folders.map(incoming => ({
            ...incoming,
            isExcluded: false
        }));

        return { prompts: validatedPrompts, folders: validatedFolders };
    }

    /**
     * Finalizes the import by merging folder structures and creating new prompts.
     */
    async finalizeImport(
        selectedPrompts: ValidatedPrompt[], 
        selectedFolders: ValidatedFolder[]
    ) {
        // Map to track { importedFolderId : actualLocalFolderId }
        const idMap = new Map<string | null, string | null>();
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

    async savePrompts() {
        try {
            await setStorage({ [PROMPTS_KEY]: this.prompts });
            this.notify('prompts_updated');
        } catch (e) {
            console.warn('Store: Failed saving prompts', e);
        }
    }

    async saveTags() {
        try {
            await setStorage({ [TAGS_KEY]: this.tags });
            this.notify('tags_updated');
        } catch (e) {
            console.warn('Store: Failed saving tags', e);
        }
    }

    async saveSettings() {
        try {
            await setStorage({ [SETTINGS_KEY]: this.settings });
            this.notify('settings_updated');
        } catch (e) {
            console.warn('Store: Failed saving settings', e);
        }
    }

    // --- Folder Persistence ---
    async saveFolders() {
        try {
            await setStorage({ [FOLDERS_KEY]: this.folders });
            this.notify('folders_updated');
        } catch (e) {
            console.warn('Store: Failed saving folders', e);
        }
    }

    private isTitleExists(title: string, excludeId?: string): boolean {
        const normalized = title.trim().toLowerCase();
        if (!normalized) return false;
        return this.prompts.some(p => p.id !== excludeId && p.title.trim().toLowerCase() === normalized);
    }

    private isFolderNameExists(name: string, excludeId?: string): boolean {
        const normalized = name.trim().toLowerCase();
        if (!normalized) return false;
        return this.folders.some(f => f.id !== excludeId && f.name.trim().toLowerCase() === normalized);
    }

    private isShortcutExists(quick: string, excludeId?: string): boolean {
        const normalized = quick.trim().toLowerCase();
        if (!normalized) return false;
        return this.prompts.some(p => p.id !== excludeId && p.quick && p.quick.trim().toLowerCase() === normalized);
    }

    // --- Folder Operations ---

    async addFolder(name: string, parentId: string | null = null) {
        if (this.isFolderNameExists(name)) {
            throw new Error('A folder with this name already exists');
        }

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

        if (updates.name !== undefined) {
            if (this.isFolderNameExists(updates.name, id)) {
                throw new Error('A folder with this name already exists');
            }
        }

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

    // --- Prompt Management ---

    async addPrompt(title: string, text: string, quick: string, tagIds: string[], parentId: string | null = null) {
        if (this.isTitleExists(title)) {
            throw new Error('A prompt with this name already exists');
        }

        if (quick && this.isShortcutExists(quick)) {
            throw new Error('A shortcut with this name already exists');
        }

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

    async updatePrompt(id: string, updates: Partial<Prompt>) {
        const idx = this.prompts.findIndex(p => p.id === id);
        if (idx === -1) return;

        if (updates.title !== undefined) {
            if (this.isTitleExists(updates.title, id)) {
                throw new Error('A prompt with this name already exists');
            }
        }

        if (updates.quick !== undefined && updates.quick) {
            if (this.isShortcutExists(updates.quick, id)) {
                throw new Error('A shortcut with this name already exists');
            }
        }


        this.prompts[idx] = { ...this.prompts[idx], ...updates };
        await this.savePrompts();
    }

    async deletePrompt(id: string) {
        this.prompts = this.prompts.filter(p => p.id !== id);
        await this.savePrompts();
    }

    async reorderPrompts(srcId: string, targetId: string | null) {
        const srcIndex = this.prompts.findIndex(x => x.id === srcId);
        if (srcIndex === -1) return;

        // Remove source from current position
        const [item] = this.prompts.splice(srcIndex, 1);

        if (targetId === null) {
            // Move to end of the list
            this.prompts.push(item);
        } else {
            // Find index of the specific target prompt to insert BEFORE
            const targetIndex = this.prompts.findIndex(x => x.id === targetId);
            if (targetIndex !== -1) {
                this.prompts.splice(targetIndex, 0, item);
            } else {
                // Fallback: If target not found (shouldn't happen), append to end
                this.prompts.push(item);
            }
        }

        await this.savePrompts();
    }

    // --- Tag Management ---

    async addTag(name: string, color: string) {
        const newTag: Tag = {
            id: uid(),
            name,
            color,
            order: this.tags.length
        };
        this.tags.push(newTag);
        await this.saveTags();
    }

    // --- NEW: Add Tag with explicit ID (for UI selection) ---
    async addTagWithId(id: string, name: string, color: string) {
        const newTag: Tag = {
            id, // Use passed ID
            name,
            color,
            order: this.tags.length
        };
        this.tags.push(newTag);
        await this.saveTags();
    }
    // -------------------------------------------------------

    async updateTag(id: string, updates: Partial<Tag>) {
        const idx = this.tags.findIndex(t => t.id === id);
        if (idx === -1) return;

        this.tags[idx] = { ...this.tags[idx], ...updates };
        await this.saveTags();
    }

    async deleteTag(id: string) {
        // 1. Remove the tag itself
        this.tags = this.tags.filter(t => t.id !== id);

        // 2. Remove references from all prompts
        this.prompts.forEach(p => {
            if (p.tags && p.tags.includes(id)) {
                p.tags = p.tags.filter(tid => tid !== id);
            }
        });

        // 3. Remove from selection if selected
        this.selectedTagIds = this.selectedTagIds.filter(tid => tid !== id);

        await Promise.all([this.saveTags(), this.savePrompts()]);
        this.notify('filter_updated');
    }

    // --- UI Helper Methods ---

    toggleFolderExpansion(folderId: string) {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            folder.isExpanded = !folder.isExpanded;
            this.notify('folders_updated');
            // Optional: If you want to persist open/closed state across reloads,
            // call this.saveFolders() here. For now, in-memory is faster.
        }
    }

    // --- Tag Reordering Logic ---
    async reorderTags(srcId: string, targetIndex: number) {
        const srcIndex = this.tags.findIndex(x => x.id === srcId);
        if (srcIndex === -1) return;

        // Remove item
        const [item] = this.tags.splice(srcIndex, 1);

        // Clamp target index
        const clamped = Math.max(0, Math.min(targetIndex, this.tags.length));

        // Insert item
        this.tags.splice(clamped, 0, item);

        // Update 'order' property on all tags to persist this state
        this.tags = this.tags.map((t, i) => ({ ...t, order: i }));

        await this.saveTags();
    }
    // --------------------------------

    // --- Settings Management ---

    async updateSettings(updates: Partial<Settings>) {
        this.settings = { ...this.settings, ...updates };
        await this.saveSettings();
    }

    // --- Filtering & Selection ---

    setFilter(text: string) {
        this.filterText = text;
        this.notify('filter_updated');
    }

    toggleTagSelection(tagId: string) {
        if (this.selectedTagIds.includes(tagId)) {
            this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
        } else {
            this.selectedTagIds.push(tagId);
        }
        this.notify('filter_updated');
    }

    clearTagSelection() {
        this.selectedTagIds = [];
        this.notify('filter_updated');
    }

    getFilteredPrompts(): Prompt[] {
        const q = (this.filterText || '').trim().toLowerCase();
        let base = this.prompts;

        if (this.selectedTagIds.length > 0) {
            base = base.filter(p => (p.tags || []).some(tid => this.selectedTagIds.includes(tid)));
        }

        if (!q) return base;
        return base.filter(p =>
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.quick && p.quick.toLowerCase().includes(q))
        );
    }

    // --- Event System ---

    subscribe(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    private notify(event: string, data?: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}