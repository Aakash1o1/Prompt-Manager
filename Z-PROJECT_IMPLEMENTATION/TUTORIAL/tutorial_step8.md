Step 8: Module 2 Logic Fix & Module 3 (Organize)
Objective: Correct the Quick Menu detection and enable the "Organize Prompts" tutorial module.
Files to Modify:
src/content/tutorial/tutorialData.ts
src/content/components/Sidebar.ts
src/content/store.ts
Tasks:
1. Fix Module 2 & Add Module 3 in src/content/tutorial/tutorialData.ts
Correct the expansion logic and add the "Move Mode" triggers.
code
TypeScript
// src/content/tutorial/tutorialData.ts

// Update Module 2 (access) and Module 3 (organize):
export const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    // ... "add" module ...
    "access": [
        { id: "pin", headline: "Pin a Prompt", details: "Hover over a prompt, click '...', and select 'Pin'.", triggerEvent: "app-tutorial-pin-toggled" },
        { 
            id: "shortcut", 
            headline: "Use a Shortcut", 
            details: "Type a shortcut (e.g. .sample) and press Space.", 
            triggerEvent: "SHORTCUT_EXPANDED",
            validate: (payload) => payload.trigger !== '../' // Must NOT be the quick menu
        },
        { 
            id: "quick", 
            headline: "Use the Quick Menu", 
            details: "Type ../ and press Space. Select a prompt and hit Enter.", 
            triggerEvent: "SHORTCUT_EXPANDED", 
            validate: (payload) => payload.trigger === '../' // Must BE the quick menu
        }
    ],
    "organize": [
        { 
            id: "sub", 
            headline: "Create a Sub-folder", 
            details: "Click '...' on 'My Tutorial' and select 'New Subfolder'.", 
            triggerEvent: "workspace-open-folder-editor" 
        },
        { 
            id: "move-start", 
            headline: "Move a Prompt", 
            details: "Hover over 'Sample Prompt', click '...', and select 'Move To...'.", 
            triggerEvent: "sidebar-mode-move-started" 
        },
        { 
            id: "move-end", 
            headline: "Select a Destination", 
            details: "Click 'Nested Prompts' then 'Move Here'.", 
            triggerEvent: "app-tutorial-prompt-moved" 
        }
    ],
    // ... "export-import" module ...
};
2. Add Move Signals to src/content/components/Sidebar.ts
Signal the tutorial when the user enters Move Mode.
code
TypeScript
// src/content/components/Sidebar.ts

// Inside startMoveMode(promptId: string):
public startMoveMode(promptId: string) {
    // ... existing logic ...
    
    // SIGNAL: Notify tutorial
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'sidebar-mode-move-started' } 
    }));
}
3. Add Move Completion Signal to src/content/store.ts
Signal the tutorial when the updatePrompt actually changes the parentId.
code
TypeScript
