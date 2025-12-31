Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_03.md
Step 3: 3-Panel Layout & Tutorial Controller
Objective: Implement the professional 3-panel UI and the logic to render modules and instructions.
Files to Modify:
src/content/styles.ts
src/content/tutorial/tutorialData.ts (New File)
src/tutorial.ts
Tasks:
1. Update src/content/styles.ts (Add Tutorial CSS)
Add the layout styles to your existing STYLES constant.
code
CSS
/* --- Add this to the end of STYLES in src/content/styles.ts --- */

.tutorial-grid {
    display: grid;
    grid-template-columns: 200px 300px 1fr;
    height: 100vh;
    width: 100vw;
    background: #0f1117;
    color: white;
}

.panel-nav { background: #101012; border-right: 1px solid #21262d; padding: 20px; }
.panel-instr { background: #161b22; border-right: 1px solid #21262d; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.panel-demo { display: flex; flex-direction: column; background: #0f1117; position: relative; }

/* Panel 1: Modules */
.mod-btn {
    width: 100%; text-align: left; padding: 12px; margin-bottom: 8px;
    background: transparent; border: 1px solid #30363d;
    color: #8b949e; border-radius: 8px; cursor: pointer; font-size: 13px;
}
.mod-btn.active { background: #2f81f7; color: white; border-color: #2f81f7; }

/* Panel 2: Instructions */
.step-item { border-radius: 8px; overflow: hidden; border: 1px solid #30363d; opacity: 0.5; transition: opacity 0.3s; }
.step-item.active { opacity: 1; border-color: #e3b341; }
.step-item.completed { opacity: 0.8; border-color: #238636; }

.step-header { 
    padding: 12px; font-weight: 600; font-size: 13px; display: flex; gap: 10px; align-items: center;
}
.step-item.active .step-header { background: #e3b341; color: #000; }
.step-item.completed .step-header { background: #238636; color: white; }

.step-content { padding: 12px; font-size: 12px; line-height: 1.5; color: #a5c9ff; background: #0d1117; }

/* Panel 3: Demo Area */
#demo-stage { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end; gap: 15px; overflow-y: auto; }
.chat-bubble { padding: 12px 16px; border-radius: 12px; max-width: 70%; font-size: 14px; line-height: 1.4; }
.chat-bubble.bot { background: #161b22; border: 1px solid #30363d; align-self: flex-start; color: #c9d1d9; }

.demo-input-area { padding: 20px 40px 40px 40px; border-top: 1px solid #21262d; }
#mock-chat-input {
    background: #0d1117; border: 2px solid #30363d; padding: 16px; border-radius: 12px;
    color: white; outline: none; min-height: 20px; font-size: 15px; transition: border-color 0.2s;
}
#mock-chat-input:focus { border-color: #2f81f7; }
#mock-chat-input[contenteditable]:empty:before { content: attr(placeholder); color: #484f58; }
2. Create src/content/tutorial/tutorialData.ts
Define the sequence of actions for the user to perform.
code
TypeScript
export interface TutorialStep {
    id: string;
    headline: string;
    details: string;
    signalType: 'DRAWER_OPENED' | 'SHORTCUT_EXPANDED';
}

export interface TutorialModule {
    id: string;
    title: string;
    steps: TutorialStep[];
}

export const TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: 'basics',
        title: 'The Basics',
        steps: [
            {
                id: 'open-drawer',
                headline: 'Open the Prompt Drawer',
                details: 'The drawer is where you manage everything. Press Alt + P to open it now.',
                signalType: 'DRAWER_OPENED'
            },
            {
                id: 'use-shortcut',
                headline: 'Expand a Shortcut',
                details: 'Type any of your shortcuts (e.g. .expand) followed by Space in the chat box below.',
                signalType: 'SHORTCUT_EXPANDED'
            }
        ]
    }
];
3. Update src/tutorial.ts
Replace the test scaffold with the real 3-panel UI controller.
code
TypeScript
import { createOrGetHost } from './content/host';
import { renderUI } from './content/ui';
import { getStorage } from './lib/storage';
import { Store } from './content/store';
import { TextExpander } from './content/components/TextExpander';
import { TUTORIAL_MODULES } from './content/tutorial/tutorialData';

class TutorialController {
    private activeModuleIdx = 0;
    private currentStepIdx = 0;

    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        this.render();
    }

    private handleSignal(detail: { type: string }) {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const step = module.steps[this.currentStepIdx];

        if (step && detail.type === step.signalType) {
            this.currentStepIdx++;
            this.render();
        }
    }

    private render() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;

        const activeModule = TUTORIAL_MODULES[this.activeModuleIdx];

        root.innerHTML = `
            <div class="tutorial-grid">
                <nav class="panel-nav">
                    <h3 style="margin-bottom:20px; font-size:16px;">Modules</h3>
                    ${TUTORIAL_MODULES.map((m, i) => `
                        <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}">${m.title}</button>
                    `).join('')}
                </nav>

                <section class="panel-instr">
                    <h3 style="margin-bottom:10px; font-size:16px;">Instructions</h3>
                    ${activeModule.steps.map((step, i) => {
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
                        <div class="chat-bubble bot">Welcome to the playground! Follow the instructions on the left to learn how to use Prompt Drawer.</div>
                    </div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true" placeholder="Type here..."></div>
                    </div>
                </section>
            </div>
        `;
    }
}

async function initTutorial() {
    const prompts = await getStorage('promptManager.prompts') || [];
    const tags = await getStorage('promptManager.tags') || [];
    const folders = await getStorage('promptManager.folders') || [];
    const settings = await getStorage('promptManager.settings') || {};

    const { host, shadow } = createOrGetHost();
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders;
    store.settings = settings;

    await renderUI({ host, shadow, prompts, tags, folders, settings, PROMPTS_KEY: 'p', SETTINGS_KEY: 's', TAGS_KEY: 't', FOLDERS_KEY: 'f' });

    const expander = new TextExpander(store, shadow);
    expander.mount();

    // Start Tutorial UI
    new TutorialController(store);
}

initTutorial();
