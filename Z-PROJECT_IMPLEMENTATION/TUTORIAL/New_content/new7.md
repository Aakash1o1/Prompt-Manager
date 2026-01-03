Step: Instruction UI Persistence
Objective: Stop the chat text from disappearing by refactoring the controller to update instructions surgically without re-rendering the input area.
Files to Modify:
src/tutorial.ts
Tasks:
1. Refactor TutorialController in src/tutorial.ts
We will change render() to initialRender() (called once) and create a new updateInstructions() method to refresh the progress without wiping the chat.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    private activeModuleIdx = 0;
    private activeGroupIdx = 0;
    private activeStepIdx = 0;
    // ... other properties ...

    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        this.initialRender(); // Render the skeleton once
        this.updateUI();      // Fill in the data
    }

    // 1. Create the permanent layout
    private initialRender() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;

        root.innerHTML = `
            <div class="tutorial-grid">
                <nav class="panel-nav" id="nav-container"></nav>
                <section class="panel-instr" id="instr-container"></section>
                <section class="panel-demo">
                    <div id="demo-stage">
                        <div class="chat-bubble bot">Welcome! Follow the instructions to begin.</div>
                    </div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true" placeholder="Type a shortcut here..."></div>
                    </div>
                </section>
            </div>
        `;
    }

    // 2. Update only the changing parts
    private updateUI() {
        const navContainer = document.getElementById('nav-container');
        const instrContainer = document.getElementById('instr-container');
        if (!navContainer || !instrContainer) return;

        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const isModuleDone = this.activeGroupIdx >= module.groups.length || 
                           (this.activeGroupIdx === module.groups.length - 1 && this.activeStepIdx >= module.groups[this.activeGroupIdx].steps.length);

        // Update Navigation
        navContainer.innerHTML = `
            <div class="panel-label">Modules</div>
            ${TUTORIAL_MODULES.map((m, i) => `
                <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}" data-idx="${i}">
                    ${m.title}
                </button>
            `).join('')}
        `;

        // Update Instructions
        instrContainer.innerHTML = `
            <div class="panel-label">Learning Path</div>
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; margin-bottom: 8px;">${module.title}</h2>
                <p style="font-size: 13px; color: var(--txt-secondary); margin: 0;">${module.description}</p>
            </div>
            <div class="groups-container">
                ${module.groups.map((group, gIdx) => {
                    const isGroupActive = gIdx === this.activeGroupIdx && !isModuleDone;
                    const isGroupDone = gIdx < this.activeGroupIdx || isModuleDone;
                    return `
                        <div class="task-group ${isGroupActive ? 'active' : ''} ${isGroupDone ? 'done' : ''}">
                            <div class="group-title">${isGroupDone ? '✅' : (isGroupActive ? '🟡' : '⚪')} ${group.title}</div>
                            <div class="steps-list">
                                ${group.steps.map((step, sIdx) => {
                                    const isStepActive = isGroupActive && sIdx === this.activeStepIdx;
                                    const isStepDone = isGroupDone || (gIdx === this.activeGroupIdx && sIdx < this.activeStepIdx);
                                    return `
                                        <div class="step-leaf ${isStepActive ? 'active' : ''} ${isStepDone ? 'done' : ''}">
                                            <div class="step-leaf-header"><span class="dot"></span> ${step.headline}</div>
                                            ${isStepActive ? `<div class="step-leaf-content">${step.details}</div>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${isModuleDone ? `<div class="completion-card" style="text-align:center; padding: 20px; color: #238636; font-weight: bold; border: 1px solid #238636; border-radius: 8px; margin-top: 20px;">🎉 Module Complete!</div>` : ''}
        `;

        // Re-attach listeners to the new nav buttons
        navContainer.querySelectorAll('.mod-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeModuleIdx = parseInt((btn as HTMLElement).dataset.idx!);
                this.activeGroupIdx = 0;
                this.activeStepIdx = 0;
                this.updateUI();
            });
        });

        // Trigger highlights
        this.updateHighlights(module, isModuleDone);
    }

    // 3. Update handleSignal to use updateUI()
    private handleSignal(detail: { type: string, payload?: any }) {
        // ... (existing logic to find step) ...
        if (detail.type === step.triggerEvent) {
            if (step.validate && !step.validate(detail.payload)) return;
            this.advanceProgress();
        }
    }

    private advanceProgress() {
        // ... (existing logic to increment indices) ...
        this.updateUI(); // <--- Call updateUI instead of render
    }
}
