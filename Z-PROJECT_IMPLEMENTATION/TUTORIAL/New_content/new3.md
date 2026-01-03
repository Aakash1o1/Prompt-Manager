Step 14: Interaction Signals & Scroll Fixes.
Fix the Instruction Panel scrolling.
Implement Ctrl+C and Context-Menu Copy detection.
Refine the highlighting for kebabs and the export panel.
Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_14.md
Step 14: Interactive Signals & UI Refinements
Objective: Enable scrollable instructions, detect clipboard copies, and fix the specific highlighting gaps in the "Access" and "Organize" modules.
Files to Modify:
src/tutorial.html
src/tutorial.ts
src/content/tutorial/tutorialData.ts
src/content/components/Sidebar.ts
Tasks:
1. Fix Scrolling in src/tutorial.html
Update the CSS to allow the instruction panel to scroll and look better.
code
CSS
/* Update in src/tutorial.html <style> */
.panel-instr {
    background: #161b22;
    border-right: 1px solid #21262d;
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto; /* ENABLE SCROLLING */
    scrollbar-width: thin;
    scrollbar-color: #30363d transparent;
}

/* Add this for the pulse to be more visible on small icons */
.icon-btn.tutorial-highlight {
    outline-offset: -2px !important;
    border-radius: 50% !important;
}
2. Update src/content/tutorial/tutorialData.ts
Merge steps as requested and update target selectors for kebabs and buttons.
code
TypeScript
// src/content/tutorial/tutorialData.ts

export const TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: "add",
        title: "Saving Prompts",
        description: "Prompt Manager is a complete solution to all your prompt-related needs.",
        groups: [
            {
                id: "add-context",
                title: "Method A: Context Menu",
                steps: [
                    { 
                        id: "rc-save", 
                        headline: "Select and Save", 
                        details: "Highlight the chat text on the right, then right-click it and choose 'Save to Prompt Drawer'.", 
                        triggerEvent: "workspace-open-editor", 
                        targetSelector: "#demo-stage" // Highlight the chat area
                    },
                    { id: "p-save-1", headline: "Name and Save", details: "Add a title and shortcut, then click Save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-title", "#ws-quick", "#ws-save"] }
                ]
            },
            {
                id: "add-manual",
                title: "Method B: Manual Entry",
                steps: [
                    { id: "copy-text", headline: "Copy Text", details: "Highlight the text and press Ctrl + C.", triggerEvent: "app-tutorial-copy-detected", targetSelector: "#demo-stage" },
                    { id: "open-lib", headline: "Open Library", details: "Press Alt + P to open the library, then click the 'New Prompt' icon.", triggerEvent: "workspace-new-prompt", targetSelector: "#btn-new-root" },
                    { id: "paste-save", headline: "Paste and Save", details: "Paste text into the body and click Save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-body", "#ws-save"] }
                ]
            }
        ]
    },
    {
        id: "access",
        title: "Accessing Prompts",
        description: "Three methods to access your prompts.",
        groups: [
            {
                id: "acc-shortcut",
                title: "1. Shortcuts",
                steps: [
                    { id: "type-shortcut", headline: "Type Shortcut", details: "Type your shortcut and press Space in the chat.", triggerEvent: "SHORTCUT_EXPANDED", targetSelector: "#mock-chat-input" }
                ]
            },
            {
                id: "acc-menu",
                title: "2. Quick Menu (../)",
                steps: [
                    { id: "pin-items", headline: "Pin Prompt", details: "Open Drawer (Alt+P). Click '...' (kebab) on a prompt, then click 'Pin'.", triggerEvent: "app-tutorial-pin-toggled", targetSelector: [".tree-row[data-type='prompt'] .icon-btn", ".ctx-menu"] },
                    { id: "type-menu", headline: "Use ../ Menu", details: "Type ../ and Space. Select your prompt.", triggerEvent: "SHORTCUT_EXPANDED", validate: (p) => p.trigger === '../', targetSelector: "#mock-chat-input" }
                ]
            },
            {
                id: "acc-copy",
                title: "3. Direct Copy",
                steps: [
                    { id: "manual-copy", headline: "Copy Action", details: "Open Drawer. Click '...' on a prompt and select 'Copy'.", triggerEvent: "app-tutorial-copy", targetSelector: [".tree-row[data-type='prompt'] .icon-btn", ".ctx-menu"] }
                ]
            }
        ]
    }
    // ... we will update Organize/Export in next iteration
];
3. Update src/tutorial.ts (Copy Detection & Auto-Scroll)
Implement the global copy listener and automatic scrolling to the active step.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    // ... inside constructor ...
    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        
        // NEW: Detect Ctrl + C
        document.addEventListener('copy', () => {
            window.dispatchEvent(new CustomEvent('tutorial-signal', { 
                detail: { type: 'app-tutorial-copy-detected' } 
            }));
        });

        this.render();
    }

    private render() {
        // ... (Existing render logic) ...

        // NEW: Automatic Scroll to Active Step
        setTimeout(() => {
            const activeStep = document.querySelector('.step-leaf.active');
            if (activeStep) {
                activeStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        this.attachListeners(root);
        this.updateHighlights(module, isModuleDone);
    }
}
4. Update src/content/components/Sidebar.ts (Context Menu Signal)
The "Direct Copy" step needs to know when the "Copy" item in the context menu is clicked.
code
TypeScript
// src/content/components/Sidebar.ts

// Inside showContextMenu(e, promptId, isPinned):
// Locate the 'Copy' menu item:
menu.appendChild(createItem('Copy', () => {
    const p = this.store.prompts.find(x => x.id === promptId);
    if (p) {
        navigator.clipboard.writeText(p.text);
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied' } }));
        
        // NEW: SIGNAL FOR TUTORIAL
        window.dispatchEvent(new CustomEvent('tutorial-signal', { 
            detail: { type: 'app-tutorial-copy' } 
        }));
    }
}));
