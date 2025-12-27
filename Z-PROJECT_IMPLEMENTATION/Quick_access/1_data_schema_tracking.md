Step 01: MRU Data Schema & Tracking
Objective: Update the data model to track when prompts are used and add a setting to control the Quick Menu size.
Files to Modify:
src/content/store.ts
src/content/components/PromptList.ts
src/content/components/TextExpander.ts
Tasks:
1. Update Interfaces in src/content/store.ts
Update the Prompt and Settings type definitions to include usage tracking.
code
TypeScript
// src/content/store.ts

export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
    parentId?: string | null;
    lastUsed?: number; // ADD THIS: Unix timestamp
};

export type Settings = {
    // ... existing properties
    autoCloseOnHover: boolean;
    quickMenuLimit: number; // ADD THIS: Max items in ../ menu
};

const DEFAULT_SETTINGS: Settings = {
    // ... existing properties
    autoCloseOnHover: false,
    quickMenuLimit: 4 // Default to 4
};
2. Add recordUsage and getRecentPrompts to Store Class
Add these methods inside the Store class to handle the logic for the new menu.
code
TypeScript
// src/content/store.ts -> Inside Store class

/**
 * Updates the lastUsed timestamp for a prompt and persists it.
 */
async recordUsage(id: string) {
    const idx = this.prompts.findIndex(p => p.id === id);
    if (idx === -1) return;

    this.prompts[idx].lastUsed = Date.now();
    // We save silently to avoid re-rendering the whole main list UI immediately
    await setStorage({ ['promptManager.prompts']: this.prompts });
}

/**
 * Returns the most recently used prompts based on the user's settings.
 * Falls back to random prompts if none have been used.
 */
getRecentPrompts(): Prompt[] {
    const limit = this.settings.quickMenuLimit || 4;
    
    // Filter prompts that have been used at least once
    const used = this.prompts
        .filter(p => p.lastUsed !== undefined)
        .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

    if (used.length >= limit) {
        return used.slice(0, limit);
    }

    // If we don't have enough "used" prompts, fill the rest with "random" (unsorted) ones
    const unused = this.prompts.filter(p => p.lastUsed === undefined);
    const combined = [...used, ...unused];
    
    return combined.slice(0, limit);
}
3. Wire Usage Tracking to PromptList (Copy Action)
Update the copy button in PromptList.ts to record usage.
code
TypeScript
// src/content/components/PromptList.ts -> inside createPromptRow()

copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
        await navigator.clipboard.writeText(p.text);
        this.store.recordUsage(p.id); // ADD THIS
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
    } catch {
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copy failed' } }));
    }
});
4. Wire Usage Tracking to TextExpander (Shortcut Expansion)
Update the expansion logic in TextExpander.ts to record usage.
code
TypeScript
// src/content/components/TextExpander.ts -> inside handleKeyDown()

if (match) {
    // ... existing logs and preventDefaults
    this.store.recordUsage(match.id); // ADD THIS
    this.replaceText(activeEl, word, match.text);
}
