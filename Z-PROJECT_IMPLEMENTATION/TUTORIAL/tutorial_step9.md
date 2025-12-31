Master Plan Update (Phase 2)
Step 09: Implement Module 4 (Export/Import) signals and Conflict Resolution.
Step 10: Final UI Polishing (Onboarding Complete screen).
Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_09.md
Step 9: Module 4 (Export/Import) & Conflict Resolution
Objective: Enable the "Export/Import" tutorial module and implement validation for conflict resolution.
Files to Modify:
src/content/tutorial/tutorialData.ts
src/content/components/Workspace.ts
src/tutorial.ts
Tasks:
1. Update Module 4 Data in src/content/tutorial/tutorialData.ts
Refine the triggers and add the conflict resolution step.
code
TypeScript
// src/content/tutorial/tutorialData.ts

// Update the "export-import" module in TUTORIAL_DATA:
"export-import": [
    { 
        id: "exp-start", 
        headline: "Export Your Library", 
        details: "Open Settings (gear icon), then click 'Export Data'.", 
        triggerEvent: "app-start-export" 
    },
    { 
        id: "exp-exec", 
        headline: "Select and Download", 
        details: "Click the 'Export' button in the sidebar footer to download your backup.", 
        triggerEvent: "app-exec-export" 
    },
    { 
        id: "imp-start", 
        headline: "Import from File", 
        details: "In Settings, click 'Import Data' and select the JSON file you just downloaded.", 
        triggerEvent: "app-start-import" 
    },
    { 
        id: "resolve", 
        headline: "Resolve Conflicts", 
        details: "Click on a red item in the sidebar. In the Workspace, change the title to resolve the conflict.", 
        triggerEvent: "app-tutorial-conflict-resolved" 
    },
    { 
        id: "imp-exec", 
        headline: "Finalize Import", 
        details: "Once the red dots are gone, click 'Finalize Import' in the sidebar.", 
        triggerEvent: "app-exec-import" 
    }
]
2. Add Resolution Signal in src/content/components/Workspace.ts
Signal the tutorial when the user successfully resolves a conflict in the import editor.
code
TypeScript
// src/content/components/Workspace.ts

// Inside the resolveImport(prompt: any, onUpdate: (p: any) => void) method:
// Find the handleInput = () => { ... } block:

const handleInput = () => {
    // ... existing logic that calculates titleMatch and quickMatch ...

    // SIGNAL: Notify tutorial if the conflict is cleared
    if (!titleMatch && !quickMatch) {
        window.dispatchEvent(new CustomEvent('tutorial-signal', { 
            detail: { type: 'app-tutorial-conflict-resolved' } 
        }));
    }

    onUpdate(prompt);
};
3. Update src/tutorial.ts (Auto-scroll Logic)
Ensure the instruction panel stays focused on the active step as Module 4 has many steps.
code
TypeScript
// src/tutorial.ts

    private render() {
        // ... existing render logic ...
        
        // ADD THIS: Auto-scroll to the active step
        setTimeout(() => {
            const activeStepEl = document.querySelector('.step-item.active');
            if (activeStepEl) {
                activeStepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }
