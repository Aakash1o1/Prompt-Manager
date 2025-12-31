Step 11: Yellow Multi-Highlight & Input Tracking
Objective: Update the pulse color to yellow, enable highlighting multiple elements simultaneously, and add textbox tracking.
Files to Modify:
src/content/styles.ts
src/content/components/App.ts
src/content/tutorial/tutorialData.ts
src/tutorial.ts
Tasks:
1. Update Colors in src/content/styles.ts
Change the pulse from blue to yellow and ensure it works on inputs.
code
CSS
/* src/content/styles.ts - Update the tutorial-highlight block */

@keyframes pulse-yellow {
    0% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(242, 204, 96, 0); }
    100% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0); }
}

.tutorial-highlight {
    outline: 2px solid #f2cc60 !important;
    outline-offset: 2px;
    animation: pulse-yellow 2s infinite !important;
    z-index: 999999 !important; /* Ensure it stays above everything */
}

/* Specific fix for inputs where box-shadow might be clipped */
input.tutorial-highlight, textarea.tutorial-highlight, [contenteditable].tutorial-highlight {
    border-color: #f2cc60 !important;
}
2. Upgrade Relay in src/content/components/App.ts
Modify the listener to handle multiple selectors and "late-arriving" elements (like menus).
code
TypeScript
// src/content/components/App.ts

// Replace the window.addEventListener('tutorial-highlight-request', ...) block:

window.addEventListener('tutorial-highlight-request', (e: any) => {
    const selectors: string[] = Array.isArray(e.detail.selector) 
        ? e.detail.selector 
        : [e.detail.selector].filter(Boolean);
    
    // 1. Clear ALL existing highlights
    this.shadow.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));

    // 2. Apply new highlights
    const apply = () => {
        selectors.forEach(selector => {
            const targets = this.shadow.querySelectorAll(selector);
            targets.forEach(target => {
                target.classList.add('tutorial-highlight');
            });
        });
    };

    apply();

    // 3. DYNAMIC OBSERVER: If the target doesn't exist yet (like a context menu),
    // we watch the DOM for a few seconds to see if it appears.
    const observer = new MutationObserver(() => {
        apply();
    });

    observer.observe(this.shadow, { childList: true, subtree: true });
    // Stop observing after 5 seconds to save performance
    setTimeout(() => observer.disconnect(), 5000);
});
3. Update Data Schema in src/content/tutorial/tutorialData.ts
Allow targetSelector to be an array and add textbox targets.
code
TypeScript
// src/content/tutorial/tutorialData.ts

export interface TutorialStep {
    // ...
    targetSelector?: string | string[]; // Allow array
}

// Example updates to Module 1 (Add):
"add": [
    { id: "f-open", ..., targetSelector: "#btn-new-folder" },
    { id: "f-save", ..., targetSelector: ["#ws-folder-name", "#ws-folder-save"] }, // Highlight name input AND save button
    { id: "p-open", ..., targetSelector: null }, // This will be handled in main window in Step 13
    { id: "p-save", ..., targetSelector: ["#ws-title", "#ws-quick", "#ws-save"] } 
],
// Example for Module 2 (Access):
"access": [
    { id: "pin", ..., targetSelector: ".row-actions .icon-btn" }, // Highlights ALL kebab buttons
],
4. Add Main-Page Highlight Style in src/tutorial.ts
Since the Demo Panel is in the main window, we need to inject the highlight CSS there too.
code
TypeScript
// src/tutorial.ts
// Add this to the top of the file or inside a style tag in the render() method:

const MAIN_PAGE_HIGHLIGHT_STYLE = `
    .main-highlight {
        outline: 3px solid #f2cc60 !important;
        outline-offset: 4px;
        animation: pulse-yellow 2s infinite !important;
        border-radius: 8px;
    }
    @keyframes pulse-yellow {
        0% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(242, 204, 96, 0); }
        100% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0); }
    }
`;
// Inject this into the document head
const styleTag = document.createElement('style');
styleTag.textContent = MAIN_PAGE_HIGHLIGHT_STYLE;
document.head.appendChild(styleTag);
