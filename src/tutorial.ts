import { createOrGetHost } from './content/host';
import { renderUI } from './content/ui';
import { getStorage } from './lib/storage';
import { Store } from './content/store';
import { TextExpander } from './content/components/TextExpander';
import { TUTORIAL_MODULES, MODULE_ORDER } from './content/tutorial/tutorialData';

class TutorialController {
    private activeModuleIdx = 0;
    private activeGroupIdx = 0;
    private activeStepIdx = 0;
    private isNavCollapsed = true;
    private chatHistory: { type: 'bot' | 'user', text: string }[] = [
        { type: 'bot', text: "Welcome to the playground! I'm your tutorial guide. Let's learn how to create and save prompts." }
    ];

    constructor(private store: Store, private shadow: ShadowRoot) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        
        // NEW: Listen for background script messages (Cross-tab signals)
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'TUTORIAL_EXTERNAL_SIGNAL') {
                this.handleSignal(msg.detail);
            }
        });
        
        // NEW: Refresh UI when user returns to this tab
        window.addEventListener('focus', () => {
             this.updateUI(); // Re-checks allowed origins and updates list
        });
        
        // NEW: Detect Ctrl + C
        document.addEventListener('copy', () => {
            window.dispatchEvent(new CustomEvent('tutorial-signal', { 
                detail: { type: 'app-tutorial-copy-detected' } 
            }));
        });
        
        // Expose helper functions to window for the "Next Module" buttons (safely for CSP)
        (window as any).switchModule = (idx: number) => this.switchModule(idx);
        (window as any).closeTutorial = () => this.closeTutorial();
        
        this.initialRender();
        this.updateUI();
    }

    private switchModule(idx: number) {
        if (idx < 0 || idx >= TUTORIAL_MODULES.length) return;
        
        this.activeModuleIdx = idx;
        this.activeGroupIdx = 0;
        this.activeStepIdx = 0;
        
        const module = TUTORIAL_MODULES[idx];
        if (module.id !== 'setup') {
             this.addBotMessage(`Starting module: ${this.escapeHtml(module.title)}`);
        }
        this.updateUI();
    }

    private closeTutorial() {
        const { host } = createOrGetHost();
        host.removeAttribute('data-mode');
        window.location.reload(); 
    }

    // XSS Protection: Escape HTML special characters
    private escapeHtml(str: string): string {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    private handleSignal(detail: { type: string, payload?: any }) {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        if (!module) return;
        const group = module.groups[this.activeGroupIdx];
        if (!group) return; 
        const step = group.steps[this.activeStepIdx];
        if (!step) return;

        // Ensure we check PERMISSION_GRANTED signal
        if (detail.type === step.triggerEvent || detail.type === 'PERMISSION_GRANTED') {
            const checkPayload = detail.payload || {};
             if (step.validate) {
                 if (!step.validate(checkPayload)) return;
             }
             this.advanceProgress();
        }
    }

    private advanceProgress() {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const group = module.groups[this.activeGroupIdx];
        
        this.activeStepIdx++;
        if (this.activeStepIdx >= group.steps.length) {
            this.activeStepIdx = 0;
            this.activeGroupIdx++;

             if (this.activeGroupIdx >= module.groups.length) {
                 this.addBotMessage(`Great job! You've completed the "${this.escapeHtml(module.title)}" module.`);
             }
        }
        
        this.updateUI();
    }

    private addBotMessage(text: string) {
        this.chatHistory.push({ type: 'bot', text });
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        if (module.id !== 'setup') {
             const demoContainer = document.getElementById('demo-panel-content');
             if (demoContainer) this.renderChatSimulation(demoContainer); 
        }
    }

    // 1. Create the permanent layout ONCE
    private initialRender() {
        // ... (Styles injection remains same) ...
        // INJECT MAIN PAGE STYLES
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
                .icon-btn.tutorial-highlight {
                    outline-offset: -2px !important;
                    border-radius: 50% !important;
                }
                @keyframes pulse-yellow {
                    0% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(242, 204, 96, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(242, 204, 96, 0); }
                }

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
                .btn-primary:hover { background: #2ea043; }
                
                .panel-label {
                    font-weight: 800; font-size: 11px; color: #484f58; 
                    text-transform: uppercase; letter-spacing: 0.1em; 
                    margin-bottom: 20px;
                }

                .panel-instr {
                    background: #161b22;
                    border-right: 1px solid #21262d;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #30363d transparent;
                }

                /* Group Styles */
                .task-group { margin-bottom: 24px; }
                .task-group .group-title {
                    font-size: 13px; font-weight: 700; color: #8b949e;
                    margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
                    padding-bottom: 8px; border-bottom: 1px solid #30363d;
                }
                .task-group.active .group-title { color: #f2cc60; border-bottom-color: #f2cc60; }
                .task-group.done .group-title { color: #238636; border-bottom-color: #238636; }

                /* Step Styles */
                .steps-list { display: flex; flex-direction: column; gap: 12px; padding-left: 12px; border-left: 2px solid #21262d; margin-left: 6px; }
                .task-group.active .steps-list { border-left-color: #f2cc60; }
                
                .step-leaf { 
                    padding: 12px; background: #0d1117; border: 1px solid #30363d; 
                    border-radius: 8px; opacity: 0.6; transition: all 0.2s;
                }
                .step-leaf.active { opacity: 1; border-color: #f2cc60; box-shadow: 0 0 0 1px #f2cc60; transform: translateX(5px); }
                .step-leaf.done { opacity: 0.8; border-color: #238636; }

                .step-leaf-header { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
                .step-leaf-content { font-size: 12px; color: #c9d1d9; margin-top: 8px; line-height: 1.5; }

                .completion-card {
                    text-align: center; padding: 24px; background: rgba(35, 134, 54, 0.1); 
                    border-radius: 12px; border: 1px solid #238636; margin-top: 20px;
                    color: #4ade80; font-weight: bold; font-size: 16px;
                }

                /* 1. The Grid: Professional Bezier curve for the slide */
                .tutorial-grid {
                    display: grid;
                    grid-template-columns: 60px 320px 1fr; /* Start collapsed */
                    height: 100vh;
                    width: 100vw;
                    background: #0f1117;
                    transition: grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* When the nav panel is expanded via class */
                .tutorial-grid.nav-expanded {
                    grid-template-columns: 240px 320px 1fr;
                }

                /* 2. The Panel: Hide overflow during animation */
                .panel-nav {
                    background: #0a0b0e;
                    border-right: 1px solid #21262d;
                    padding: 24px 8px; /* Fixed small padding */
                    display: flex;
                    flex-direction: column;
                    overflow-x: hidden; 
                    white-space: nowrap;
                    transition: padding 0.4s ease;
                }

                .tutorial-grid.nav-expanded .panel-nav {
                    padding: 24px 16px;
                }

                /* 3. The Content: Smoothly fade text in/out */
                .mod-title, .panel-label, #nav-toggle span:last-child {
                    opacity: 0;
                    margin-left: 12px;
                    transition: opacity 0.2s ease, transform 0.3s ease;
                    transform: translateX(-10px);
                    pointer-events: none;
                }

                .tutorial-grid.nav-expanded .mod-title, 
                .tutorial-grid.nav-expanded .panel-label,
                .tutorial-grid.nav-expanded #nav-toggle span:last-child {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }

                /* 4. Button Polish */
                .mod-btn {
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    border-radius: 8px;
                    margin-bottom: 6px;
                    transition: background 0.2s, border-color 0.2s;
                }

                .mod-btn .mod-icon {
                    min-width: 44px; /* Icon stays centered in the 60px strip */
                    display: flex;
                    justify-content: center;
                    font-size: 14px;
                }
            `;
            document.head.appendChild(style);
        }

        const root = document.getElementById('tutorial-root');
        if (!root) return;

        root.innerHTML = `
            <div class="tutorial-grid">
                <nav class="panel-nav" id="nav-container"></nav>
                <section class="panel-instr" id="instr-container"></section>
                <section class="panel-demo" style="display: flex; flex-direction: column; background: #0f1117; position: relative;">
                    <div id="demo-panel-content" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                        <!-- Dynamic Content: Chat OR Permissions -->
                    </div>
                </section>
            </div>
        `;
        
        // Ensure manual wheel/touch events work on instruction panel
        const instrPanel = root.querySelector('#instr-container');
        if (instrPanel) {
            instrPanel.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
        }

        const grid = root.querySelector('.tutorial-grid') as HTMLElement;
        const navContainer = root.querySelector('#nav-container');

        if (navContainer && grid) {
            navContainer.addEventListener('mouseenter', () => {
                grid.classList.add('nav-expanded');
            });
            navContainer.addEventListener('mouseleave', () => {
                grid.classList.remove('nav-expanded');
            });
        }
    }

    // 2. Update only the changing parts
    private async updateUI() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;
        
        const navContainer = document.getElementById('nav-container');
        const instrContainer = document.getElementById('instr-container');
        const demoContainer = document.getElementById('demo-panel-content');

        if (!navContainer || !instrContainer || !demoContainer) return;

        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const isModuleDone = this.activeGroupIdx >= module.groups.length || 
                           (this.activeGroupIdx === module.groups.length - 1 && this.activeStepIdx >= module.groups[this.activeGroupIdx].steps.length);

        // Update Navigation
        navContainer.innerHTML = `
            <button id="nav-toggle" class="mod-btn" style="margin-bottom: 20px; width: 100%; border: none; background: #161b22;">
                <span class="mod-icon">☰</span>
                <span class="mod-title">Tutorial Menu</span>
            </button>
            <div class="panel-label">Learning Modules</div>
            ${TUTORIAL_MODULES.map((m, i) => `
                <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}" data-idx="${i}" style="width: 100%;">
                    <span class="mod-icon">${i + 1}</span>
                    <span class="mod-title">${this.escapeHtml(m.title)}</span>
                </button>
            `).join('')}
        `;
        
        // Re-attach nav listeners
        navContainer.querySelectorAll('.mod-btn[data-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchModule(parseInt((btn as HTMLElement).dataset.idx!));
            });
        });

        /* Toggle logic is handled by CSS hover now, but if we want click-toggle, we can add it here too */
        navContainer.querySelector('#nav-toggle')?.addEventListener('click', () => {
             const grid = root.querySelector('.tutorial-grid');
             if (grid) grid.classList.toggle('nav-expanded');
        });

        // Update Instructions
        instrContainer.innerHTML = `
            <div class="panel-label">Learning Path</div>
            <div style="margin-bottom: 24px;">
                <h2 style="font-size: 20px; margin-bottom: 8px; color: white;">${this.escapeHtml(module.title)}</h2>
                <p style="font-size: 13px; color: #8b949e; margin: 0; line-height: 1.4;">${this.escapeHtml(module.description)}</p>
            </div>
            <div class="groups-container">
                ${module.groups.map((group, gIdx) => {
                    const isGroupActive = gIdx === this.activeGroupIdx && !isModuleDone;
                    const isGroupDone = gIdx < this.activeGroupIdx || (isModuleDone && gIdx < module.groups.length);
                    return `
                        <div class="task-group ${isGroupActive ? 'active' : ''} ${isGroupDone ? 'done' : ''}">
                            <div class="group-title">${isGroupDone ? '✅' : (isGroupActive ? '🟡' : '⚪')} ${this.escapeHtml(group.title)}</div>
                            <div class="steps-list">
                                ${group.steps.map((step, sIdx) => {
                                    const isStepActive = isGroupActive && sIdx === this.activeStepIdx;
                                    const isStepDone = isGroupDone || (gIdx === this.activeGroupIdx && sIdx < this.activeStepIdx);
                                    return `
                                        <div class="step-leaf ${isStepActive ? 'active' : ''} ${isStepDone ? 'done' : ''}">
                                            <div class="step-leaf-header">
                                                <span style="color: ${isStepDone ? '#238636' : (isStepActive ? '#f2cc60' : '#484f58')}">
                                                    ${isStepDone ? '✔' : '•'}
                                                </span>
                                                ${this.escapeHtml(step.headline)}
                                            </div>
                                            ${isStepActive ? `<div class="step-leaf-content">${this.escapeHtml(step.details)}</div>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${isModuleDone ? `
                <div class="completion-card">
                    <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
                    <div>Module Complete!</div>
                    ${this.activeModuleIdx < TUTORIAL_MODULES.length - 1 ? `
                        <button id="next-module-btn" class="btn-primary" style="width: 100%; margin-top: 16px;" data-idx="${this.activeModuleIdx + 1}">
                            Next: ${this.escapeHtml(TUTORIAL_MODULES[this.activeModuleIdx + 1].title)}
                        </button>
                    ` : `
                        <div style="font-size: 12px; color: #8b949e; margin-top: 8px;">You've mastered Prompt Drawer!</div>
                        <button id="finish-tutorial-btn" class="btn-primary" style="width: 100%; margin-top: 16px;">
                            Finish Tutorial
                        </button>
                    `}
                </div>
            ` : ''}
        `;
        
        // Attach flow listeners
        instrContainer.querySelector('#next-module-btn')?.addEventListener('click', (e) => {
            const idx = parseInt((e.target as HTMLElement).dataset.idx || '0');
            this.switchModule(idx);
        });

        instrContainer.querySelector('#finish-tutorial-btn')?.addEventListener('click', () => {
             this.closeTutorial();
        });

        // Auto-scroll to active step
        setTimeout(() => {
            const activeStepEl = instrContainer.querySelector('.step-leaf.active');
            if (activeStepEl) {
                activeStepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Utility: Highlight Styles
        document.querySelectorAll('.mod-btn.active').forEach((el: any) => {
             el.style.borderColor = '#2f81f7';
             el.style.color = 'white';
        });

        // DEMO PANEL RENDER
        if (module.id === 'setup') {
            await this.renderPermissionsDashboard(demoContainer);
        } else {
            this.renderChatSimulation(demoContainer);
        }

        // Trigger highlights (only if NOT setup module, or handle appropriately)
        // ... (existing highlight logic) ...
        const activeGroup = module.groups[this.activeGroupIdx];
        if (activeGroup) {
            const activeStep = activeGroup.steps[this.activeStepIdx];
            if (activeStep && activeStep.targetSelector && !isModuleDone) {
                 window.dispatchEvent(new CustomEvent('tutorial-highlight-request', { 
                    detail: { selector: activeStep.targetSelector } 
                }));
            } else {
                 window.dispatchEvent(new CustomEvent('tutorial-highlight-request', { 
                    detail: { selector: null } 
                }));
            }
        }
    }

    private renderChatSimulation(container: HTMLElement) {
        // If chat simulation is already there, don't re-render entire thing
        if (container.querySelector('#demo-stage')) return;

        container.innerHTML = `
            <div id="demo-stage" style="flex: 1; padding: 20px; overflow-y: auto;">
                ${this.chatHistory.map(msg => `
                    <div class="chat-bubble ${this.escapeHtml(msg.type)}">${this.escapeHtml(msg.text)}</div>
                `).join('')}
            </div>
            <div class="demo-input-area" style="padding: 20px; border-top: 1px solid #30363d;">
                <div id="mock-chat-input" contenteditable="true" placeholder="Type a shortcut here..." style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px; color: white; min-height: 40px; outline: none;"></div>
            </div>
        `;
        const demoStage = container.querySelector('#demo-stage');
        if (demoStage) demoStage.scrollTop = demoStage.scrollHeight;
    }

    private async renderPermissionsDashboard(container: HTMLElement) {
        // We can just re-render this fully each time as it's state-based and not interactive text
        // Use your existing helper - dynamic import because it might not be loaded
        let origins: string[] = [];
        try {
            const { getAllowedOrigins } = await import('./lib/permissions');
            origins = await getAllowedOrigins();
            
            // Simplified Check: If Gemini is already authorized, just move on
            if (origins.includes('https://gemini.google.com/*') && this.activeModuleIdx === 0 && this.activeStepIdx === 0) {
                 this.advanceProgress();
                 return; // Avoid rendering if we are moving away
            }
        } catch (e) { console.warn("Could not load permissions lib", e); }

        container.innerHTML = `
            <div style="padding: 60px; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h1 style="color: white;">To add to any site, press <span style="font-size: 42px; margin-bottom: 20px; color: #f2cc60;">Alt + P</span></h1>
                <p style="color: white; max-width: 500px; line-height: 1.6; margin-bottom: 40px;">
                    The tool will appear only on the sites you add it to, giving you maximum control.
                </p>

                <div style="background: #161b22; border: 1px solid #30363d; border-radius: 16px; width: 100%; max-width: 600px; padding: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #30363d; padding-bottom: 12px;">
                        <span style="font-weight: bold; color:white">Authorized Sites</span>
                        <a href="https://gemini.google.com" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px; padding: 6px 12px;">Open Gemini</a>
                    </div>
                    
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
                                <span>🌐</span> ${this.escapeHtml(o)}
                            </div>
                        `).join('') : '<div style="text-align:center; color: var(--txt-muted); padding: 20px; color:white;">No sites authorized yet.</div>'}
                    </div>
                </div>
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
    host.setAttribute('data-mode', 'tutorial'); 
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders;
    store.settings = settings;

    await renderUI({ 
        host, shadow, prompts, tags, folders, settings, 
        PROMPTS_KEY: 'promptManager.prompts', 
        SETTINGS_KEY: 'promptManager.settings', 
        TAGS_KEY: 'promptManager.tags', 
        FOLDERS_KEY: 'promptManager.folders' 
    });

    const expander = new TextExpander(store, shadow);
    expander.mount();

    new TutorialController(store, shadow);
    console.log("Tutorial Master Data Engine Loaded.");
}

initTutorial();
