Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_05_fix.md
Step 5 (FIX): CSP, Navigation, and Visibility
Objective: Fix security errors, enable module switching, and ensure instructions remain visible when the drawer is open.
Files to Modify:
src/tutorial.ts
src/content/styles.ts
src/background.ts
Tasks:
1. Fix Visibility in src/content/styles.ts
Add a rule to prevent the backdrop from hiding the instructions.
code
CSS
/* src/content/styles.ts - Add to end of STYLES */

/* Tutorial Page Override: Prevent drawer from covering instructions */
:host-context(#tutorial-root) .backdrop {
    justify-content: flex-end; /* Push modal to the right */
    padding-right: 50px;
    background: rgba(0, 0, 0, 0.2); /* Make backdrop lighter */
}

:host-context(#tutorial-root) .modal {
    margin-right: 20px;
    /* Ensure modal doesn't cover the first 520px of the screen */
    max-width: calc(100vw - 550px);
}
2. Fix CSP & Navigation in src/tutorial.ts
Remove onclick and use proper event listeners.
code
TypeScript
// src/tutorial.ts

// 1. Remove (window as any).switchModule = ...
// 2. Update the render() method to remove onclick from buttons:
// CHANGE THIS LINE:
// <button class="mod-btn ${key === this.activeModuleKey ? 'active' : ''}" onclick="window.switchModule('${key}')">
// TO THIS:
// <button class="mod-btn ${key === this.activeModuleKey ? 'active' : ''}" data-mod="${key}">

    private render() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;
        const steps = TUTORIAL_DATA[this.activeModuleKey];

        root.innerHTML = `
            <div class="tutorial-grid">
                <nav class="panel-nav">
                    <div style="font-weight: 800; font-size: 11px; color: #484f58; text-transform: uppercase; margin-bottom: 16px;">Modules</div>
                    ${MODULE_ORDER.map(key => `
                        <button class="mod-btn ${key === this.activeModuleKey ? 'active' : ''}" data-mod="${key}">
                            ${key.replace('-', ' ').toUpperCase()}
                        </button>
                    `).join('')}
                </nav>
                <!-- ... existing instructions and demo panels ... -->
            </div>
        `;

        // NEW: Attach listeners properly (Fixes CSP error)
        root.querySelectorAll('.mod-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = (btn as HTMLElement).dataset.mod;
                if (key) {
                    this.activeModuleKey = key;
                    this.currentStepIdx = 0;
                    this.render();
                }
            });
        });
    }
3. Fix Right-Click in src/background.ts
Handle the context menu correctly for internal pages.
code
TypeScript
// src/background.ts
// Find the chrome.contextMenus.onClicked listener:

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-prompt' && tab?.id) {
    
    // NEW: If we are on our own internal page, don't execute script, just message
    if (tab.url?.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'OPEN_WITH_TEXT',
            text: info.selectionText || '' // Internal pages can use this directly
        });
        return;
    }

    // ... existing logic for external pages (chrome.scripting.executeScript) ...
  }
});
