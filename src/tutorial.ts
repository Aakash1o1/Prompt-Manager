import { createOrGetHost } from './content/host';
import { renderUI } from './content/ui';
import { getStorage } from './lib/storage';
import { Store } from './content/store';
import { TextExpander } from './content/components/TextExpander';
import { TUTORIAL_DATA, MODULE_ORDER } from './content/tutorial/tutorialData';

class TutorialController {
    private activeModuleKey = MODULE_ORDER[0];
    private currentStepIdx = 0;
    private isNavCollapsed = false;
    private chatHistory: { type: 'bot' | 'user', text: string }[] = [
        { type: 'bot', text: "Welcome to the playground! I'm your tutorial guide. Let's learn how to create and save prompts." }
    ];

    constructor(private store: Store, private shadow: ShadowRoot) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        
        // Expose helper functions to window for the "Next Module" buttons (safely for CSP)
        (window as any).switchModule = (key: string) => this.switchModule(key);
        (window as any).closeTutorial = () => this.closeTutorial();
        
        this.render();
    }

    private switchModule(key: string) {
        if (!MODULE_ORDER.includes(key)) return;
        this.activeModuleKey = key;
        this.currentStepIdx = 0;
        
        const welcome = { 
            "add": "Let's learn how to create and save prompts.",
            "access": "Now, let's see how fast you can use them!",
            "organize": "Time to tidy up your library.",
            "export-import": "Final step: Protecting your data."
        }[key] || "Next module started!";
        
        this.chatHistory = [{ type: 'bot', text: welcome }];
        this.render();
    }

    private closeTutorial() {
        if (confirm("Great job! Ready to go back to work?")) {
            window.close(); // Closes the tab
        }
    }

    private handleSignal(detail: { type: string, payload?: any }) {
        const steps = TUTORIAL_DATA[this.activeModuleKey];
        const step = steps[this.currentStepIdx];

        if (!step) return;

        if (detail.type === step.triggerEvent) {
            // FOLDER VALIDATION: Check if user saved in a folder or root
            if (step.id === 'p-save' && detail.payload && !detail.payload.parentId) {
                // Dispatch a toast to the real app shadow
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: '💡 Tip: Save it inside your new folder to stay organized!' } 
                }));
            }

            if (step.validate && !step.validate(detail.payload)) return;

            this.currentStepIdx++;
            
            // NEW: Add a bot reaction for success
            this.addBotMessage(`Nice! You completed: ${step.headline}`);
            
            this.render();
        }
    }

    private addBotMessage(text: string) {
        this.chatHistory.push({ type: 'bot', text });
        // Keep history manageable
        if (this.chatHistory.length > 5) this.chatHistory.shift();
    }

    private render() {
        // INJECT MAIN PAGE STYLES (for Demo Panel highlights)
        if (!document.getElementById('tutorial-main-styles')) {
            const style = document.createElement('style');
            style.id = 'tutorial-main-styles';
            style.textContent = `
                .tutorial-highlight {
                    outline: 2px solid #f2cc60 !important;
                    outline-offset: 2px;
                    animation: pulse-yellow 2s infinite !important;
                    z-index: 999;
                }
                @keyframes pulse-yellow {
                    0% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(242, 204, 96, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        const root = document.getElementById('tutorial-root');
        if (!root) return;

        const steps = TUTORIAL_DATA[this.activeModuleKey];
        const gridCols = this.isNavCollapsed ? "60px 320px 1fr" : "220px 320px 1fr";
        
        const isModuleDone = this.currentStepIdx >= steps.length;
        const nextModuleKey = MODULE_ORDER[MODULE_ORDER.indexOf(this.activeModuleKey) + 1];

        root.innerHTML = `
            <style>
                .btn-primary {
                    background: #238636;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 16px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background 0.2s;
                }
                .btn-primary:hover {
                    background: #2ea043;
                }
            </style>
            <div class="tutorial-grid" style="grid-template-columns: ${gridCols}">
                <!-- PANEL 1: NAV -->
                <nav class="panel-nav ${this.isNavCollapsed ? 'collapsed' : ''}">
                    <button id="nav-toggle" class="mod-btn" style="text-align:center; margin-bottom: 20px; font-size: 11px;">
                        ${this.isNavCollapsed ? '☰' : '◀ Collapse'}
                    </button>

                    <div class="nav-content" style="${this.isNavCollapsed ? 'display:none' : ''}">
                        <div style="font-weight: 800; font-size: 11px; color: #484f58; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; padding-left: 8px;">
                            Tutorial Modules
                        </div>
                        ${MODULE_ORDER.map(key => `
                            <button class="mod-btn ${key === this.activeModuleKey ? 'active' : ''}" data-mod="${key}">
                                <span>${key.replace('-', ' ').toUpperCase()}</span>
                            </button>
                        `).join('')}
                    </div>
                </nav>

                <!-- PANEL 2: INSTRUCTIONS -->
                <section class="panel-instr">
                    <div style="font-weight: 800; font-size: 11px; color: #484f58; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                        Guide
                    </div>
                    ${steps.map((step, i) => {
                        const isActive = i === this.currentStepIdx;
                        const isDone = i < this.currentStepIdx;
                        return `
                            <div class="step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}">
                                <div class="step-header">
                                    <span style="font-size: 16px;">${isDone ? '✅' : (isActive ? '🟡' : '⚪')}</span>
                                    ${step.headline}
                                </div>
                                ${isActive ? `<div class="step-content">${step.details}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                    
                    ${isModuleDone ? `
                        <div style="text-align:center; padding: 24px; background: rgba(35, 134, 54, 0.1); border-radius: 12px; border: 1px solid #238636; margin-top: 20px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
                            <div style="color: #4ade80; font-weight: bold; margin-bottom: 12px;">Module Complete!</div>
                            ${nextModuleKey ? `
                                <button id="next-module-btn" class="btn-primary" style="width: 100%;" data-next="${nextModuleKey}">
                                    Next: ${nextModuleKey.toUpperCase()}
                                </button>
                            ` : `
                                <div style="color: #8b949e; font-size: 12px; margin-bottom: 12px;">You've mastered Prompt Drawer!</div>
                                <button id="finish-tutorial-btn" class="btn-primary" style="width: 100%;">
                                    Finish Tutorial
                                </button>
                            `}
                        </div>
                    ` : ''}
                </section>

                <!-- PANEL 3: DEMO -->
                <section class="panel-demo">
                    <div id="demo-stage">
                        ${this.chatHistory.map(msg => `
                            <div class="chat-bubble ${msg.type}">${msg.text}</div>
                        `).join('')}
                    </div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true"></div>
                    </div>
                </section>
            </div>
        `;

        // Attach listeners properly (Fixes CSP error)
        root.querySelectorAll('.mod-btn[data-mod]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = (btn as HTMLElement).dataset.mod;
                if (key) {
                    this.switchModule(key);
                }
            });
        });

        root.querySelector('#nav-toggle')?.addEventListener('click', () => {
            this.isNavCollapsed = !this.isNavCollapsed;
            this.render();
        });

        root.querySelector('#next-module-btn')?.addEventListener('click', () => {
            const next = (root.querySelector('#next-module-btn') as HTMLElement).dataset.next;
            if (next) this.switchModule(next);
        });

        root.querySelector('#finish-tutorial-btn')?.addEventListener('click', () => {
            this.closeTutorial();
        });

        // Auto-scroll to the active step
        setTimeout(() => {
            const activeStepEl = root.querySelector('.step-item.active');
            if (activeStepEl) {
                activeStepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);

        // Auto-scroll chat history
        const demoStage = root.querySelector('#demo-stage');
        if (demoStage) {
            demoStage.scrollTop = demoStage.scrollHeight;
        }

        // NEW: Request a highlight for the current step
        const activeStep = steps[this.currentStepIdx];
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
}

async function initTutorial() {
    // 1. Load Data
    const prompts = await getStorage('promptManager.prompts') || [];
    const tags = await getStorage('promptManager.tags') || [];
    const folders = await getStorage('promptManager.folders') || [];
    const settings = await getStorage('promptManager.settings') || {};

    // 2. Initialize Core Engine
    const { host, shadow } = createOrGetHost();
    host.setAttribute('data-mode', 'tutorial'); 
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders;
    store.settings = settings;

    // We MUST use the correct keys for synchronization
    await renderUI({ 
        host, shadow, prompts, tags, folders, settings, 
        PROMPTS_KEY: 'promptManager.prompts', 
        SETTINGS_KEY: 'promptManager.settings', 
        TAGS_KEY: 'promptManager.tags', 
        FOLDERS_KEY: 'promptManager.folders' 
    });

    const expander = new TextExpander(store, shadow);
    expander.mount();

    // 3. Start Tutorial Controller
    new TutorialController(store, shadow);

    console.log("Tutorial Master Data Engine Loaded.");
}

initTutorial();
