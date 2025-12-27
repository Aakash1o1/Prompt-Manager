Phase 1: Analysis & Logic
1. The "Pin" Logic
Capacity: You requested "Up to 5". We will enforce this hard limit in the Store. If a user tries to pin a 6th item, we will show a Toast error.
Priority: Pinned items will always appear at the top of the ../ menu.
Space Management:
If you have 3 Pinned items and your "Quick Menu Limit" is 4, we show: 3 Pinned + 1 Recent.
If you have 5 Pinned items and your "Quick Menu Limit" is 3, we show: 5 Pinned + 0 Recents. (Pinned items override the visual limit to ensure they are always accessible).
2. UI Changes
Main List: Add a "Pin" icon button to the hover actions of every prompt. Pinned prompts will get a visual badge.
Quick Menu: Pinned items will have a small "Pushpin" icon next to them to distinguish them from Recents.
Phase 2: Master Plan
Step 1: Schema & Store Logic
Update Prompt interface (isPinned).
Implement togglePin(id) in Store (with the max-5 check).
Update the getRecentPrompts logic to merge Pinned + Recents.
Step 2: UI Integration (Main List)
Update PromptList.ts to render the Pin button and state.
Step 3: Quick Menu Visuals
Update QuickMenu.ts to render the pin icon next to pinned items.
Step 01: Schema & Store Logic
Objective: Update the data model to support pinning and rewrite the retrieval logic for the Quick Menu to prioritize pinned items.
Files to Modify:
src/content/store.ts
Tasks:
Update Interface: Add isPinned to Prompt.
Add togglePin: Handle the logic and the limit check.
Update getRecentPrompts: Implement the "Pinned + Recents" merging strategy.
Instruction Code:
code
TypeScript
// src/content/store.ts

// 1. Update Prompt Interface
export type Prompt = {
    id: string;
    title: string;
    text: string;
    quick?: string;
    tags?: string[];
    parentId?: string | null;
    lastUsed?: number;
    isPinned?: boolean; // ADD THIS
};

// ... Inside Store Class ...

/**
 * Toggles the pinned state of a prompt.
 * Enforces a maximum of 5 pinned items.
 */
async togglePin(id: string) {
    const p = this.prompts.find(x => x.id === id);
    if (!p) return;

    if (!p.isPinned) {
        // Check limit before pinning
        const currentPinnedCount = this.prompts.filter(x => x.isPinned).length;
        if (currentPinnedCount >= 5) {
            throw new Error('Max 5 pinned prompts allowed');
        }
        p.isPinned = true;
    } else {
        p.isPinned = false;
    }

    await this.savePrompts();
}

// REPLACE the existing getRecentPrompts with this new logic:

getRecentPrompts(): Prompt[] {
    const limit = this.settings.quickMenuLimit || 4;
    
    // 1. Get Pinned (Max 5 guaranteed by togglePin, but safe slice anyway)
    const pinned = this.prompts.filter(p => p.isPinned);
    
    // 2. Get Recents (Excluding pinned ones to avoid duplicates)
    const others = this.prompts
        .filter(p => !p.isPinned && p.lastUsed !== undefined)
        .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

    // 3. Calculate remaining slots for recents
    // We always show all pinned items. 
    // If Pinned Count < Limit, fill the rest with Recents.
    // If Pinned Count >= Limit, we show 0 Recents.
    const slotsLeft = Math.max(0, limit - pinned.length);
    
    const recents = others.slice(0, slotsLeft);
    
    // If we still have space (e.g. 0 pinned, 0 used, limit 4), fill with randoms?
    // Let's stick to just Pinned + Used for cleaner UX. 
    // If the user has strictly NO history and NO pins, the menu just won't open or shows nothing.
    // (Optional: You can keep the 'random fill' logic if you prefer).
    
    return [...pinned, ...recents];
}
