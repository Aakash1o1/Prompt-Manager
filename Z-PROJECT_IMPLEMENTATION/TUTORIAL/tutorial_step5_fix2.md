Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_05_fix_v2.md
Step 5 (FIX v2): UI Layout & Signal Standardization
Objective: Move the Drawer to the right (unblocking instructions), remove the background blur, and fix the TypeError.
Files to Modify:
src/tutorial.ts
src/content/styles.ts
src/content/components/App.ts
src/content/components/TextExpander.ts
Tasks:
1. Tag the Host in src/tutorial.ts
This allows our CSS to know we are in "Tutorial Mode" even though the host lives outside the tutorial div.
code
TypeScript
// src/tutorial.ts
// Inside initTutorial(), right after createOrGetHost():

const { host, shadow } = createOrGetHost();
host.setAttribute('data-mode', 'tutorial'); // <--- ADD THIS LINE
2. Fix CSS Layout in src/content/styles.ts
We will use the [data-mode="tutorial"] selector to shift the UI and remove the blur.
code
CSS
/* src/content/styles.ts - Replace the previous tutorial overrides with this: */

:host([data-mode="tutorial"]) .backdrop {
    justify-content: flex-end !important;
    padding-right: 40px;
    background: rgba(0, 0, 0, 0.1) !important; /* Very transparent */
    backdrop-filter: none !important; /* REMOVE BLUR */
    pointer-events: none; /* Allow clicking the instructions behind the backdrop */
}

:host([data-mode="tutorial"]) .modal {
    pointer-events: auto; /* Re-enable clicking inside the actual drawer */
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    margin-right: 0;
}

/* Ensure the Instructions Panel has a high z-index in the main page */
/* (This part goes into your tutorial.html <style> block, not styles.ts) */
3. Standardize Signals in src/content/components/App.ts
We will ensure every signal uses a flat structure to prevent undefined errors.
code
TypeScript
// src/content/components/App.ts

// 1. Update the Relay in setupListeners:
const eventsToForward = [
    'workspace-open-folder-editor', 
    'workspace-open-editor', 
    'app-start-export', 
    'app-exec-export', 
    'app-start-import', 
    'app-exec-import'
];

eventsToForward.forEach(eventName => {
    this.shadow.addEventListener(eventName, (e: any) => {
        window.dispatchEvent(new CustomEvent('tutorial-signal', { 
            detail: { 
                type: eventName, 
                payload: e.detail || {} // Standardize to 'payload'
            } 
        }));
    });
});

// 2. Add Signal to openWithText (Fixes Right-Click instruction)
public openWithText(text: string) {
    this.open();
    this.workspace.openEditor(null, null, text);
    
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'workspace-open-editor', payload: { text } } 
    }));
}
4. Standardize Signal in src/content/components/TextExpander.ts
code
TypeScript
// src/content/components/TextExpander.ts
// Update the dispatch inside replaceText:

window.dispatchEvent(new CustomEvent('tutorial-signal', { 
    detail: { 
        type: 'SHORTCUT_EXPANDED',
        payload: { text: replacement } // Wrap in payload
    } 
}));
5. Update src/tutorial.ts Controller
Fix the handleSignal logic to use the new payload key and handle the Right-Click selection.
code
TypeScript
// src/tutorial.ts

    private handleSignal(detail: { type: string, payload?: any }) {
        const steps = TUTORIAL_DATA[this.activeModuleKey];
        const step = steps[this.currentStepIdx];

        if (!step) return;

        if (detail.type === step.triggerEvent) {
            // Use the standardized 'payload' property
            if (step.validate && !step.validate(detail.payload)) return;

            this.currentStepIdx++;
            this.render();
        }
    }
