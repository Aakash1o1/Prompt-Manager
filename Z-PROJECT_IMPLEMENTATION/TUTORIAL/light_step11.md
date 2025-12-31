Step 11: Highlighting Logic & Styles
Objective: Create a visual pulse effect and a communication channel to highlight specific UI elements.
Files to Modify:
src/content/styles.ts
src/content/components/App.ts
src/content/tutorial/tutorialData.ts
src/tutorial.ts
Tasks:
1. Add Highlight Animation in src/content/styles.ts
This creates a glowing blue ring around the target.
code
CSS
/* src/content/styles.ts - Add to STYLES */

@keyframes pulse-blue {
    0% { box-shadow: 0 0 0 0 rgba(47, 129, 247, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(47, 129, 247, 0); }
    100% { box-shadow: 0 0 0 0 rgba(47, 129, 247, 0); }
}

.tutorial-highlight {
    outline: 2px solid #2f81f7 !important;
    outline-offset: 2px;
    animation: pulse-blue 2s infinite !important;
    position: relative;
    z-index: 999;
}
2. Update Selectors in src/content/tutorial/tutorialData.ts
Add the targetSelector property to the steps.
code
TypeScript
// src/content/tutorial/tutorialData.ts

export interface TutorialStep {
    // ... existing properties ...
    targetSelector?: string; // NEW: The CSS selector inside the Shadow DOM
}

export const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    "add": [
        { id: "f-open", headline: "Create a New Folder", details: "...", triggerEvent: "workspace-open-folder-editor", targetSelector: "#btn-new-folder" },
        { id: "f-save", headline: "Name and Save Your Folder", details: "...", triggerEvent: "app-tutorial-folder-saved", targetSelector: "#ws-folder-save" },
        // ... add targetSelectors for other steps (e.g., #btn-settings, #cp-export, etc.)
    ],
    // ...
};
3. Implement Highlight Handler in src/content/components/App.ts
Add a method to find and highlight elements.
code
TypeScript
// src/content/components/App.ts

// 1. Add this to setupListeners():
window.addEventListener('tutorial-highlight-request', (e: any) => {
    const selector = e.detail.selector;
    
    // Clear previous highlights
    this.shadow.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });

    if (selector) {
        const target = this.shadow.querySelector(selector);
        if (target) {
            target.classList.add('tutorial-highlight');
            // Ensure the element is scrolled into view if in a list
            target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }
});
4. Trigger Highlights in src/tutorial.ts
Update the render method to request a highlight whenever a step changes.
code
TypeScript
// src/tutorial.ts

    private render() {
        // ... existing render logic ...

        const activeStep = steps[this.currentStepIdx];
        
        // NEW: Request a highlight for the current step
        if (activeStep && activeStep.targetSelector) {
            window.dispatchEvent(new CustomEvent('tutorial-highlight-request', { 
                detail: { selector: activeStep.targetSelector } 
            }));
        } else {
            // Clear highlight if no selector
            window.dispatchEvent(new CustomEvent('tutorial-highlight-request', { 
                detail: { selector: null } 
            }));
        }
    }
