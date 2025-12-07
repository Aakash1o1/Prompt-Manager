// src/content/store.ts
import { getStorage, setStorage } from '../lib/storage';
import { DEFAULT_PROMPTS, DEFAULT_TAGS } from '../lib/defaultPrompts';

// --- Types ---
export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
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
};

// --- Constants ---
const PROMPTS_KEY = 'promptManager.prompts';
const SETTINGS_KEY = 'promptManager.settings';
const TAGS_KEY = 'promptManager.tags';

const DEFAULT_SETTINGS: Settings = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSizePx: 13,
    theme: 'dark',
    hotspotPosition: 'edge',
    hotspotWidthPx: 24
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
                this.prompts = changes[PROMPTS_KEY].newValue || [];
                this.notify('prompts_updated');
            }
            if (changes[TAGS_KEY]) {
                this.tags = changes[TAGS_KEY].newValue || [];
                this.notify('tags_updated');
            }
            if (changes[SETTINGS_KEY]) {
                this.settings = changes[SETTINGS_KEY].newValue || DEFAULT_SETTINGS;
                this.notify('settings_updated');
            }
        });
    }

    async load() {
        try {
            const p = await getStorage<Prompt[]>(PROMPTS_KEY);
            this.prompts = Array.isArray(p) ? p : [];

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

        await Promise.all([
            this.savePrompts(),
            this.saveTags(),
            this.saveSettings()
        ]);
    }

    // --- Persistence Methods ---

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

    // --- Prompt Management ---

    async addPrompt(title: string, text: string, quick: string, tagIds: string[]) {
        const newPrompt: Prompt = {
            id: uid(),
            title,
            text,
            quick,
            tags: tagIds
        };
        this.prompts.push(newPrompt);
        await this.savePrompts();
    }

    async updatePrompt(id: string, updates: Partial<Prompt>) {
        const idx = this.prompts.findIndex(p => p.id === id);
        if (idx === -1) return;

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