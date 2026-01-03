Step 15: Interaction Fixes & Missing Signals
Objective: Enable manual scrolling for instructions, fix click detection for New Prompt/Settings, and add the missing Export button step.
Files to Modify:
src/content/styles.ts
src/content/components/App.ts
src/content/tutorial/tutorialData.ts
src/tutorial.ts
Tasks:
1. Fix Manual Scroll (Pointer Events) in src/content/styles.ts
We need to ensure the Backdrop physically doesn't cover the left 540px of the screen (Module + Instruction panels).
code
CSS
/* src/content/styles.ts - Update the tutorial override */

:host([data-mode="tutorial"]) .backdrop {
    /* Instead of inset: 0, we only cover the right side */
    left: 540px !important; 
    width: calc(100vw - 540px) !important;
    background: transparent !important;
    pointer-events: none;
}

:host([data-mode="tutorial"]) .backdrop.open {
    pointer-events: auto;
}

/* Ensure the modal within that narrow backdrop still centers or pushes right */
:host([data-mode="tutorial"]) .modal {
    margin: auto 20px auto auto; /* Push to right */
}
2. Update Relay in src/content/components/App.ts
Add the missing events so the tutorial can "hear" them.
code
TypeScript
// src/content/components/App.ts

// Inside setupListeners(), update the eventsToForward array:
const eventsToForward = [
    'workspace-open-folder-editor', 
    'workspace-open-editor', 
    'workspace-new-prompt', // ADD THIS
    'workspace-settings',   // ADD THIS
    'app-start-export', 
    'app-exec-export', 
    'app-start-import', 
    'app-exec-import'
];
3. Update Module 4 Data in src/content/tutorial/tutorialData.ts
Add the explicit step for clicking the Export button.
code
TypeScript
// src/content/tutorial/tutorialData.ts

// Update Module 4 (export-import) -> ei-export group:
{
    id: "ei-export",
    title: "Exporting Data",
    steps: [
        { id: "cp-open", headline: "Go to Settings", details: "Press Alt+P and click the Gear icon (bottom-left).", triggerEvent: "workspace-settings", targetSelector: "#btn-settings" },
        { id: "exp-card", headline: "Select Export", details: "Click the 'Export Data' card in the backup section.", triggerEvent: "app-start-export", targetSelector: "#cp-export" },
        { id: "exp-exec", headline: "Download JSON", details: "The sidebar is now in Export Mode. Click 'Export Selected' in the footer.", triggerEvent: "app-exec-export", targetSelector: ".sb-footer .btn-new" }
    ]
}
4. Visual Polish for Highlighting in src/tutorial.ts
Ensure that when a step asks for a highlight, the instruction panel doesn't "eat" the scroll.
code
TypeScript
// src/tutorial.ts

// In the TutorialController -> render() method:
// Ensure we handle the updated navigation and scrolling

    private render() {
        // ... (Keep existing logic) ...

        // NEW: Ensure manual scroll is possible by keeping the root clear
        const instrPanel = root.querySelector('.panel-instr');
        if (instrPanel) {
            // This ensures manual wheel/touch events work
            instrPanel.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
        }
    }
