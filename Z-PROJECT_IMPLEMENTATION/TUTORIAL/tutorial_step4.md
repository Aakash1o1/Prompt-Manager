Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_04.md
Step 4: Finalizing the 3-Panel Professional UI
Objective: Clean up the test scaffold and apply the professional CSS grid layout.
Files to Modify:
src/tutorial.html
src/tutorial.ts
Tasks:
1. Clean src/tutorial.html
We need to remove the "Engine Test Page" headers and the old textarea so the TutorialController can take over the whole screen.
code
Html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Drawer - Tutorial Playground</title>
    <style>
        /* Base Reset */
        body, html { 
            margin: 0; padding: 0; height: 100%; width: 100%; 
            overflow: hidden; background: #0f1117; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #tutorial-root { height: 100vh; width: 100vw; }

        /* --- PASTE THE TUTORIAL CSS HERE --- */
        .tutorial-grid {
            display: grid;
            grid-template-columns: 220px 320px 1fr;
            height: 100vh;
            width: 100vw;
        }

        .panel-nav { background: #0a0b0e; border-right: 1px solid #21262d; padding: 24px 16px; }
        .panel-instr { background: #161b22; border-right: 1px solid #21262d; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .panel-demo { display: flex; flex-direction: column; background: #0f1117; position: relative; }

        .mod-btn {
            width: 100%; text-align: left; padding: 12px 16px; margin-bottom: 8px;
            background: transparent; border: 1px solid #30363d;
            color: #8b949e; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
        }
        .mod-btn.active { background: #2f81f7; color: white; border-color: #2f81f7; }

        .step-item { border-radius: 10px; overflow: hidden; border: 1px solid #30363d; opacity: 0.4; transition: all 0.3s ease; }
        .step-item.active { opacity: 1; border-color: #f2cc60; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .step-item.completed { opacity: 0.8; border-color: #238636; }

        .step-header { padding: 14px; font-weight: 600; font-size: 13px; display: flex; gap: 10px; align-items: center; }
        .step-item.active .step-header { background: #f2cc60; color: #000; }
        .step-item.completed .step-header { background: #238636; color: white; }

        .step-content { padding: 14px; font-size: 13px; line-height: 1.5; color: #a5c9ff; background: #0d1117; }

        #demo-stage { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end; gap: 16px; overflow-y: auto; }
        .chat-bubble { padding: 12px 18px; border-radius: 16px; max-width: 75%; font-size: 14px; line-height: 1.5; }
        .chat-bubble.bot { background: #161b22; border: 1px solid #30363d; align-self: flex-start; color: #c9d1d9; border-bottom-left-radius: 4px; }

        .demo-input-area { padding: 20px 40px 40px 40px; }
        #mock-chat-input {
            background: #0d1117; border: 2px solid #30363d; padding: 18px; border-radius: 14px;
            color: white; outline: none; min-height: 24px; font-size: 15px; transition: all 0.2s;
        }
        #mock-chat-input:focus { border-color: #2f81f7; box-shadow: 0 0 0 4px rgba(47, 129, 247, 0.1); }
        #mock-chat-input[contenteditable]:empty:before { content: "Type a shortcut here..."; color: #484f58; }
    </style>
</head>
<body>
    <div id="tutorial-root"></div>
    <script src="tutorial.js"></script>
</body>
</html>
2. Update src/tutorial.ts
Ensure the TutorialController doesn't append, but replaces the content.
code
TypeScript
// src/tutorial.ts
// Replace your existing TutorialController class with this refined version:

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

        // We use innerHTML to replace EVERYTHING in the root with our grid
        root.innerHTML = `
            <div class="tutorial-grid">
                <!-- PANEL 1: NAV -->
                <nav class="panel-nav">
                    <div style="font-weight: 800; font-size: 12px; color: #484f58; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding-left: 8px;">
                        Tutorial Modules
                    </div>
                    ${TUTORIAL_MODULES.map((m, i) => `
                        <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}">${m.title}</button>
                    `).join('')}
                </nav>

                <!-- PANEL 2: INSTRUCTIONS -->
                <section class="panel-instr">
                    <div style="font-weight: 800; font-size: 12px; color: #484f58; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">
                        Guide
                    </div>
                    ${activeModule.steps.map((step, i) => {
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
                    
                    ${this.currentStepIdx >= activeModule.steps.length ? `
                        <div style="text-align:center; padding: 20px; color: #238636; font-weight: bold;">
                            🎉 Module Complete!
                        </div>
                    ` : ''}
                </section>

                <!-- PANEL 3: DEMO -->
                <section class="panel-demo">
                    <div id="demo-stage">
                        <div class="chat-bubble bot">
                            Welcome to the playground! 
                            <br><br>
                            This is a simulated chat environment. Follow the instructions in the middle panel to learn the workflow.
                        </div>
                    </div>
                    <div class="demo-input-area">
                        <div id="mock-chat-input" contenteditable="true"></div>
                    </div>
                </section>
            </div>
        `;
    }
}
