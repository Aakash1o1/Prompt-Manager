Tasks:
1. Reliable Signal Bridge in src/background.ts
Improve the tab search logic to ensure the background script finds the tutorial tab regardless of the URL scheme.
code
TypeScript
// src/background.ts
// Replace the existing onAdded logic for the tutorial bridge:

chrome.permissions.onAdded.addListener(async (perms) => {
  if (!perms || !perms.origins) return;
  
  for (const originPattern of perms.origins) {
    onPermissionGrantedForPattern(originPattern).catch((e) => console.error('onAdded handler failed', e));

    // RELIABLE SEARCH: Find all tabs belonging to this extension
    const tabs = await chrome.tabs.query({}); 
    const extensionId = chrome.runtime.id;

    for (const t of tabs) {
        // Send to any tab that looks like our tutorial page
        if (t.id && t.url?.includes(extensionId) && t.url?.includes('tutorial.html')) {
            chrome.tabs.sendMessage(t.id, { 
                type: 'TUTORIAL_EXTERNAL_SIGNAL', 
                detail: { type: 'PERMISSION_GRANTED', payload: { origin: originPattern } } 
            }).catch(() => {}); // Ignore errors for closed tabs
        }
    }
  }
});
2. Focus Refresh Logic in src/tutorial.ts
Add a listener for when the user clicks back to the Tutorial tab. This acts as a 100% reliable fallback for the background signal.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    constructor(private store: Store) {
        // ... existing signal listeners ...

        // NEW: Refresh UI when user returns to this tab
        window.addEventListener('focus', () => {
            this.updateUI(); // Re-checks allowed origins and updates list
        });

        this.initialRender();
        this.updateUI();
    }

    // Inside handleSignal: Ensure payload structure matches background message
    private handleSignal(detail: { type: string, payload?: any }) {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const group = module.groups[this.activeGroupIdx];
        const step = group.steps[this.activeStepIdx];

        if (!step) return;

        // Ensure we check PERMISSION_GRANTED signal
        if (detail.type === step.triggerEvent || detail.type === 'PERMISSION_GRANTED') {
            const checkPayload = detail.payload || {};
            if (step.validate && !step.validate(checkPayload)) return;

            this.advanceProgress();
        }
    }
}
3. Scrollable Permissions List in src/tutorial.ts
Update the CSS in renderPermissionsDashboard to handle many sites.
code
TypeScript
// src/tutorial.ts -> renderPermissionsDashboard method
// Find the div with id="origins-list" and update its style:

container.innerHTML = `
    <!-- ... header content ... -->
    <div id="origins-list" style="
        display: flex; 
        flex-direction: column; 
        gap: 10px; 
        text-align: left;
        max-height: 250px; /* FIXED HEIGHT */
        overflow-y: auto;  /* ENABLE SCROLLING */
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #30363d transparent;
    ">
        ${origins.length > 0 ? origins.map(o => `
            <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4ade80; background: rgba(74, 222, 128, 0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(74, 222, 128, 0.2);">
                <span>🌐</span> ${o}
            </div>
        `).join('')} : `
            <div style="text-align:center; color: var(--txt-muted); padding: 20px;">No sites authorized yet.</div>
        `}
    </div>
    <!-- ... -->
`;
