Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_07.md
Step 7: Ghost Cursor Fix & Module 2 (Access)
Objective: Eliminate invisible UI interference and enable the "Access Prompts" tutorial module.
Files to Modify:
src/content/styles.ts
src/content/tutorial/tutorialData.ts
src/tutorial.ts
src/content/store.ts
Tasks:
1. Fix Ghost UI in src/content/styles.ts
Restrict pointer events on the modal so it only exists when the drawer is open.
code
CSS
/* src/content/styles.ts - Update the Tutorial Overrides */

:host([data-mode="tutorial"]) .backdrop {
    pointer-events: none !important;
    visibility: hidden; /* Completely hide from accessibility/interaction */
}

:host([data-mode="tutorial"]) .backdrop.open {
    pointer-events: auto !important;
    visibility: visible;
}

:host([data-mode="tutorial"]) .modal {
    /* CRITICAL: Modal must not capture events unless its parent is open */
    pointer-events: none; 
}

:host([data-mode="tutorial"]) .backdrop.open .modal {
    pointer-events: auto;
}
2. Update Module 2 Data in src/content/tutorial/tutorialData.ts
We'll refine the validation for Module 2 to make it more robust.
code
TypeScript
// src/content/tutorial/tutorialData.ts

// Find the "access" module and update the steps:
"access": [
    { 
        id: "pin", 
        headline: "Pin a Prompt", 
        details: "Open the drawer (Alt+P). Hover over any prompt, click '...', and select 'Pin'. Pinned items appear at the top of your Quick Menu.", 
        triggerEvent: "app-tutorial-pin-toggled" 
    },
    { 
        id: "shortcut", 
        headline: "Use a Shortcut", 
        details: "In the chat box, type a shortcut (e.g. .sample) and press Space. It will expand into the full text automatically!", 
        triggerEvent: "SHORTCUT_EXPANDED" 
    },
    { 
        id: "quick", 
        headline: "Use the Quick Menu", 
        details: "The Quick Menu shows pinned and recent prompts. Type ../ and press Space. Use arrows to select a prompt and hit Enter.", 
        triggerEvent: "SHORTCUT_EXPANDED",
        // Logic: If they expanded a shortcut, but the trigger text wasn't '../', 
        // it means they used the menu to insert a prompt.
        validate: (payload) => payload.trigger !== '../' 
    }
],
3. Update Expansion Signal in src/content/components/TextExpander.ts
We need to know what was typed (the trigger) to distinguish between a manual shortcut and the Quick Menu.
code
TypeScript
// src/content/components/TextExpander.ts
// Update the signal inside replaceText:

window.dispatchEvent(new CustomEvent('tutorial-signal', { 
    detail: { 
        type: 'SHORTCUT_EXPANDED',
        payload: { 
            text: replacement,
            trigger: target // This will be '.shortcut' or '../'
        } 
    } 
}));
4. Update Pin Signal in src/content/store.ts
code
TypeScript
// src/content/store.ts
// Inside togglePin(id: string):

async togglePin(id: string) {
    // ... existing logic ...
    await this.savePrompts();

    // SIGNAL: Notify tutorial
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'app-tutorial-pin-toggled' } 
    }));
}
