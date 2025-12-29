Fix: Pass Selected Text to Editor
Objective:
Update Workspace.openEditor to accept an optional initialText parameter.
Update App.openWithText to pass the captured text to the Workspace.
Files to Modify:
src/content/components/Workspace.ts
src/content/components/App.ts
Tasks:
1. Update src/content/components/Workspace.ts
Modify the openEditor method to accept the text argument and use it when creating a new draft.
code
TypeScript
// src/content/components/Workspace.ts

    // Update the method signature to accept initialText
    public openEditor(promptId: string | null, parentId: string | null = null, initialText: string = '') {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation();

        this.currentMode = 'editor';
        this.originalPromptId = promptId;
        this.isDirty = !!initialText; // Mark dirty if we are pre-filling text

        if (promptId) {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                this.draftPrompt = { ...p };
            }
        } else {
            // New Prompt
            this.draftPrompt = {
                title: '',
                text: initialText, // USE THE PASSED TEXT
                quick: '',
                parentId: parentId
            };
        }
        this.renderEditor();
    }
2. Update src/content/components/App.ts
Update the openWithText method to actually call the workspace with the data.
code
TypeScript
// src/content/components/App.ts

    public openWithText(text: string) {
        this.open();
        // Pass null for ID, null for Parent, and the text for Body
        this.workspace.openEditor(null, null, text);
    }
