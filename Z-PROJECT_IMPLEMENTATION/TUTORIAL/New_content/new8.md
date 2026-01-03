Step 17: Cross-Tab Permission Bridge
Objective: Enable the tutorial page to "hear" when the user grants permission to a site in another tab.
Files to Modify:
src/background.ts
Tasks:
1. Update background.ts
Add logic to the onAdded listener to find the tutorial tab and send a message.
code
TypeScript
// src/background.ts

chrome.permissions.onAdded.addListener(async (perms) => {
  if (!perms || !perms.origins) return;
  
  for (const originPattern of perms.origins) {
    onPermissionGrantedForPattern(originPattern).catch((e) => console.error('onAdded handler failed', e));

    // NEW: Notify Tutorial Tab specifically
    const tabs = await chrome.tabs.query({ url: "*://*/tutorial.html*" });
    for (const t of tabs) {
        if (t.id) {
            chrome.tabs.sendMessage(t.id, { 
                type: 'TUTORIAL_EXTERNAL_SIGNAL', 
                detail: { type: 'PERMISSION_GRANTED', origin: originPattern } 
            });
        }
    }
  }
});
Step 18: Setup Module Data
Objective: Add the "Enable Sites" module as the first item in the tutorial.
Files to Modify:
src/content/tutorial/tutorialData.ts
src/tutorial.ts
Tasks:
1. Add Module to src/content/tutorial/tutorialData.ts
Insert the new module at the beginning of the TUTORIAL_MODULES array.
code
TypeScript
// src/content/tutorial/tutorialData.ts

export const TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: "setup",
        title: "Enable Sites",
        description: "Privacy first. Prompt Drawer only works on sites you explicitly authorize.",
        groups: [
            {
                id: "setup-add",
                title: "Granting Access",
                steps: [
                    { 
                        id: "go-gemini", 
                        headline: "Try it on Gemini", 
                        details: "Click the link in the right panel to open Gemini. Once there, press Alt + P and click 'Add to this site'.", 
                        triggerEvent: "PERMISSION_GRANTED",
                        validate: (p) => p.origin.includes('gemini.google.com')
                    }
                ]
            }
        ]
    },
    // ... existing "add", "access", etc. modules ...
];
2. Update src/tutorial.ts for External Signals
Handle the message coming from the background script.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        
        // NEW: Listen for background script messages (Cross-tab signals)
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'TUTORIAL_EXTERNAL_SIGNAL') {
                this.handleSignal(msg.detail);
            }
        });

        this.initialRender();
        this.updateUI();
    }
    // ...
}
Step 19: Permissions Dashboard (Panel 3)
Objective: Replace the chat box with a Permissions UI for the Setup module.
Files to Modify:
src/tutorial.ts
src/lib/permissions.ts (Import getAllowedOrigins)
Tasks:
1. Implement renderDemoPanel logic
Modify updateUI() in src/tutorial.ts to switch the right panel layout.
code
TypeScript
// src/tutorial.ts

    private async updateUI() {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const demoContainer = document.getElementById('demo-panel-content'); // Add this ID to your initialRender
        
        if (module.id === 'setup') {
            await this.renderPermissionsDashboard(demoContainer);
        } else {
            this.renderChatSimulation(demoContainer);
        }
        // ... (rest of nav and instructions update) ...
    }

    private async renderPermissionsDashboard(container: HTMLElement | null) {
        if (!container) return;
        
        // Use your existing helper
        const { getAllowedOrigins } = await import('./lib/permissions');
        const origins = await getAllowedOrigins();

        container.innerHTML = `
            <div style="padding: 60px; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h1 style="font-size: 42px; margin-bottom: 20px; color: #f2cc60;">To add to any site, press Alt + P</h1>
                <p style="color: var(--txt-secondary); max-width: 500px; line-height: 1.6; margin-bottom: 40px;">
                    The extension remains inactive until you grant permission. This keeps your browsing data private and secure.
                </p>

                <div style="background: #161b22; border: 1px solid #30363d; border-radius: 16px; width: 100%; max-width: 600px; padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #30363d; padding-bottom: 12px;">
                        <span style="font-weight: bold;">Authorized Sites</span>
                        <a href="https://gemini.google.com" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px; padding: 6px 12px;">Open Gemini</a>
                    </div>
                    
                    <div id="origins-list" style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
                        ${origins.map(o => `
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4ade80; background: rgba(74, 222, 128, 0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(74, 222, 128, 0.2);">
                                <span>🌐</span> ${o}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
