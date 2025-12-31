Step 5: Master Data & Signal Relay
Objective: Implement the full tutorial data structure and set up App.ts to forward internal Shadow DOM events to the Tutorial Controller.
Files to Modify:
src/content/tutorial/tutorialData.ts
src/content/components/App.ts
src/tutorial.ts
Tasks:
1. Update src/content/tutorial/tutorialData.ts
Paste your provided structure into the TypeScript interface. We add a validate function for complex checks.
code
TypeScript
export interface TutorialStep {
    id: string;
    headline: string;
    details: string;
    triggerEvent: string | null;
    validate?: (detail: any) => boolean;
}

export interface TutorialModule {
    id: string;
    title: string;
    steps: TutorialStep[];
}

export const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    "add": [
        { id: "f-open", headline: "Create a New Folder", details: "Press Alt + P, then click the 'New Folder' icon in the bottom-left of the sidebar.", triggerEvent: "workspace-open-folder-editor" },
        { id: "f-save", headline: "Name and Save Your Folder", details: "Name your folder 'My Tutorial' and click 'Save Folder'.", triggerEvent: "app-tutorial-folder-saved" },
        { id: "p-open", headline: "Add from Selected Text", details: "Right-click the chat text and choose 'Save to Prompt Drawer'.", triggerEvent: "workspace-open-editor" },
        { id: "p-save", headline: "Save Your First Prompt", details: "Title it 'Sample Prompt', shortcut '.sample', move to 'My Tutorial', and Save.", triggerEvent: "app-tutorial-prompt-saved" }
    ],
    "access": [
        { id: "pin", headline: "Pin a Prompt", details: "Hover over a prompt, click '...', and select 'Pin'.", triggerEvent: "app-tutorial-pin-toggled" },
        { id: "shortcut", headline: "Use a Shortcut", details: "Type your shortcut (e.g. .sample) and press Space in the chat.", triggerEvent: "SHORTCUT_EXPANDED" },
        { id: "quick", headline: "Use the Quick Menu", details: "Type ../ and press Space. Select a prompt and hit Enter.", triggerEvent: "SHORTCUT_EXPANDED", validate: (d) => d.text !== '../' }
    ],
    "organize": [
        { id: "sub", headline: "Create a Sub-folder", details: "Click '...' on 'My Tutorial' and select 'New Subfolder'.", triggerEvent: "workspace-open-folder-editor" },
        { id: "move-start", headline: "Move a Prompt", details: "Hover over 'Sample Prompt', click '...', and select 'Move To...'.", triggerEvent: "sidebar-mode-move-started" },
        { id: "move-end", headline: "Select a Destination", details: "Click 'Nested Prompts' then 'Move Here'.", triggerEvent: "app-tutorial-prompt-moved" }
    ],
    "export-import": [
        { id: "exp-start", headline: "Export Your Library", details: "Open Settings (gear icon), then click 'Export Data'.", triggerEvent: "app-start-export" },
        { id: "exp-exec", headline: "Select and Download", details: "Click the 'Export' button in the footer.", triggerEvent: "app-exec-export" },
        { id: "imp-start", headline: "Import from File", details: "Go to Settings and click 'Import Data'. Select your JSON file.", triggerEvent: "app-start-import" }
    ]
};

export const MODULE_ORDER = ["add", "access", "organize", "export-import"];
2. Update src/content/components/App.ts (The Relay)
We need to listen for events on the ShadowRoot and re-dispatch them to the window so the tutorial page can hear them.
code
TypeScript
// src/content/components/App.ts
// Add this logic to the end of the setupListeners() method:

private setupListeners() {
    // ... existing listeners ...

    // TUTORIAL RELAY: Catch internal shadow events and forward to window
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
                detail: { type: eventName, originalDetail: e.detail } 
            }));
        });
    });
}
3. Update src/tutorial.ts (Module Support)
Update the controller to handle the new key-based data structure and module navigation.
code
TypeScript
// src/tutorial.ts
import { TUTORIAL_DATA, MODULE_ORDER } from './content/tutorial/tutorialData';

class TutorialController {
    private activeModuleKey = MODULE_ORDER[0];
    private currentStepIdx = 0;

    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        this.render();
    }

    private handleSignal(detail: { type: string, originalDetail?: any }) {
        const steps = TUTORIAL_DATA[this.activeModuleKey];
        const step = steps[this.currentStepIdx];

        if (!step) return;

        // Check if event type matches
        if (detail.type === step.triggerEvent) {
            // If there's a custom validation function, run it
            if (step.validate && !step.validate(detail.originalDetail)) return;

            this.currentStepIdx++;
            this.render();
        }
    }

    private render() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;

        const steps = TUTORIAL_DATA[this.activeModuleKey];

        root.innerHTML = `
            <div class="tutorial-grid">
                <nav class="panel-nav">
                    <div style="font-weight: 800; font-size: 11px; color: #484f58; text-transform: uppercase; margin-bottom: 16px;">Modules</div>
                    ${MODULE_ORDER.map(key => `
                        <button class="mod-btn ${key === this.activeModuleKey ? 'active' : ''}" onclick="window.switchModule('${key}')">
                            ${key.replace('-', ' ').toUpperCase()}
                        </button>
                    `).join('')}
                </nav>

                <section class="panel-instr">
                    <div style="font-weight: 800; font-size: 11px; color: #484f58; text-transform: uppercase; margin-bottom: 4px;">Guide</div>
                    ${steps.map((step, i) => {
                        const isActive = i === this.currentStepIdx;
                        const isDone = i < this.currentStepIdx;
                        return `
                            <div class="step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}">
                                <div class="step-header">
                                    <span>${isDone ? '✅' : (isActive ? '🟡' : '⚪')}</span>
                                    ${step.headline}
                                </div>
                                ${isActive ? `<div class="step-content">${step.details}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </section>

                <section class="panel-demo">
                    <div id="demo-stage">
                        <div class="chat-bubble bot">Module: ${this.activeModuleKey.toUpperCase()}</div>
                    </div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true"></div>
                    </div>
                </section>
            </div>
        `;

        // Expose switch function to window for the onclick handlers
        (window as any).switchModule = (key: string) => {
            this.activeModuleKey = key;
            this.currentStepIdx = 0;
            this.render();
        };
    }
}
