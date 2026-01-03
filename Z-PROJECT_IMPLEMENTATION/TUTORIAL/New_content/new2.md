Step 13: Hierarchical UI Rendering
Objective: Refactor the TutorialController to support the 3-level hierarchy (Module > Group > Step) and update the instruction panel to show a nested list.
Files to Modify:
src/tutorial.ts
Tasks:
1. Update State Management
Update the TutorialController class to track the indices for both the active group and the active step.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    private activeModuleIdx = 0;
    private activeGroupIdx = 0;
    private activeStepIdx = 0;

    constructor(private store: Store) {
        window.addEventListener('tutorial-signal', (e: any) => this.handleSignal(e.detail));
        this.render();
    }

    private handleSignal(detail: { type: string, payload?: any }) {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const group = module.groups[this.activeGroupIdx];
        const step = group.steps[this.activeStepIdx];

        if (!step) return;

        if (detail.type === step.triggerEvent) {
            if (step.validate && !step.validate(detail.payload)) return;

            this.advanceProgress();
        }
    }

    private advanceProgress() {
        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const group = module.groups[this.activeGroupIdx];

        if (this.activeStepIdx < group.steps.length - 1) {
            // Move to next step in group
            this.activeStepIdx++;
        } else if (this.activeGroupIdx < module.groups.length - 1) {
            // Move to next group in module
            this.activeGroupIdx++;
            this.activeStepIdx = 0;
        } else {
            // Module complete logic
            this.activeStepIdx++; // Past the last step to trigger "Done" UI
        }
        this.render();
    }
}
2. Implement Nested Rendering Logic
Update the render() method to display the module description, the groups, and their steps.
code
TypeScript
// src/tutorial.ts -> render() method

    private render() {
        const root = document.getElementById('tutorial-root');
        if (!root) return;

        const module = TUTORIAL_MODULES[this.activeModuleIdx];
        const isModuleDone = this.activeGroupIdx >= module.groups.length || 
                           (this.activeGroupIdx === module.groups.length - 1 && this.activeStepIdx >= module.groups[this.activeGroupIdx].steps.length);

        root.innerHTML = `
            <div class="tutorial-grid">
                <!-- PANEL 1: NAV -->
                <nav class="panel-nav">
                    <div class="panel-label">Modules</div>
                    ${TUTORIAL_MODULES.map((m, i) => `
                        <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}" data-idx="${i}">
                            ${m.title}
                        </button>
                    `).join('')}
                </nav>

                <!-- PANEL 2: INSTRUCTIONS -->
                <section class="panel-instr">
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
                                    <div class="group-title">
                                        ${isGroupDone ? '✅' : (isGroupActive ? '🟡' : '⚪')} ${group.title}
                                    </div>
                                    <div class="steps-list">
                                        ${group.steps.map((step, sIdx) => {
                                            const isStepActive = isGroupActive && sIdx === this.activeStepIdx;
                                            const isStepDone = isGroupDone || (gIdx === this.activeGroupIdx && sIdx < this.activeStepIdx);
                                            
                                            return `
                                                <div class="step-leaf ${isStepActive ? 'active' : ''} ${isStepDone ? 'done' : ''}">
                                                    <div class="step-leaf-header">
                                                        <span class="dot"></span> ${step.headline}
                                                    </div>
                                                    ${isStepActive ? `<div class="step-leaf-content">${step.details}</div>` : ''}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    ${isModuleDone ? `<div class="completion-card">🎉 Module Complete!</div>` : ''}
                </section>

                <!-- PANEL 3: DEMO -->
                <section class="panel-demo">
                    <div id="demo-stage"></div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true"></div>
                    </div>
                </section>
            </div>
        `;

        this.attachListeners(root);
        this.updateHighlights(module, isModuleDone);
    }
3. Add Component Styles
Add these new specific classes to the CSS in src/tutorial.html to support the nested look.
code
CSS
