Step 10: Final Polish & Completion UX
Objective: Add bot responses to user actions, implement a "Next Module" flow, and create a final "Success" state.
Files to Modify:
src/tutorial.ts
src/content/tutorial/tutorialData.ts
Tasks:
1. Add Bot Reactions in src/tutorial.ts
We will update the TutorialController to add new chat bubbles when the user completes steps.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    private chatHistory: { type: 'bot' | 'user', text: string }[] = [
        { type: 'bot', text: "Welcome to the playground! I'm your tutorial guide." }
    ];

    // ... inside handleSignal(detail) ...
    if (detail.type === step.triggerEvent) {
        if (step.validate && !step.validate(detail.payload)) return;

        this.currentStepIdx++;
        
        // NEW: Add a bot reaction for success
        this.addBotMessage(`Nice! You completed: ${step.headline}`);
        
        this.render();
    }

    private addBotMessage(text: string) {
        this.chatHistory.push({ type: 'bot', text });
        // Keep history manageable
        if (this.chatHistory.length > 5) this.chatHistory.shift();
    }

    private render() {
        // ... (Keep existing grid/nav logic) ...

        // Update the Demo Stage rendering in the root.innerHTML:
        // Replace the #demo-stage content with:
        /*
        <div id="demo-stage">
            ${this.chatHistory.map(msg => `
                <div class="chat-bubble ${msg.type}">${msg.text}</div>
            `).join('')}
        </div>
        */

        // Update the Module Completion Logic in Panel 2:
        const isModuleDone = this.currentStepIdx >= steps.length;
        const nextModuleKey = MODULE_ORDER[MODULE_ORDER.indexOf(this.activeModuleKey) + 1];

        // Replace the "🎉 Module Complete!" block with:
        /*
        ${isModuleDone ? `
            <div style="text-align:center; padding: 24px; background: rgba(35, 134, 54, 0.1); border-radius: 12px; border: 1px solid #238636; margin-top: 20px;">
                <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
                <div style="color: #4ade80; font-weight: bold; margin-bottom: 12px;">Module Complete!</div>
                ${nextModuleKey ? `
                    <button class="btn-primary" style="width: 100%;" onclick="window.switchModule('${nextModuleKey}')">
                        Next: ${nextModuleKey.toUpperCase()}
                    </button>
                ` : `
                    <div style="color: var(--txt-secondary); font-size: 12px;">You've mastered Prompt Drawer!</div>
                    <button class="btn-primary" style="width: 100%; margin-top: 12px;" onclick="window.closeTutorial()">
                        Finish Tutorial
                    </button>
                `}
            </div>
        ` : ''}
        */

        // NEW: Expose close function
        (window as any).closeTutorial = () => {
            if (confirm("Great job! Ready to go back to work?")) {
                window.close(); // Closes the tab
            }
        };
    }
}
2. Add "Welcome" Messages to src/content/tutorial/tutorialData.ts
Optionally, we can add a welcomeMsg to each module to set the context.
code
TypeScript
// src/content/tutorial/tutorialData.ts
// Update the Module interface and add messages:

export interface TutorialModule {
    id: string;
    title: string;
    steps: TutorialStep[];
    welcomeMsg: string; // Add this
}

export const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    "add": [ /* ... */ ], // welcomeMsg: "Let's learn how to add prompts."
    // ... etc
};
3. Update src/tutorial.ts to use Welcome Messages
code
TypeScript
// In switchModule(key):
(window as any).switchModule = (key: string) => {
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
};
