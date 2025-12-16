Step 3 (Fix): Subscribe to Folder Updates
The Issue
The PromptList component is not re-rendering when folders change.
When you click "Toggle", the isExpanded state changes in memory, but the UI doesn't refresh to show/hide children.
When you add a subfolder via console, it saves to the database, but the UI doesn't refresh to show it.
File to Modify
src/content/components/PromptList.ts
Task 1: Add Subscription
File: src/content/components/PromptList.ts
Find the mount method. Add a subscription to 'folders_updated'.
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    mount(parent: HTMLElement) {
        this.list = parent.querySelector('#list');
        if (!this.list) {
            console.error('PromptList: #list element not found in parent');
            return;
        }

        // Subscribe to store updates
        this.store.subscribe('prompts_updated', () => this.render());
        this.store.subscribe('filter_updated', () => this.render());
        this.store.subscribe('tags_updated', () => this.render());
        
        // +++ ADD THIS LINE +++
        this.store.subscribe('folders_updated', () => this.render()); 
        // ++++++++++++++++++++

        this.initSortable();
        this.render();
    }
Task 2: Verify Toggle Logic
File: src/content/store.ts
Ensure the toggleFolderExpansion method exists and is calling notify.
code
TypeScript
// [CHECK] src/content/store.ts

    toggleFolderExpansion(folderId: string) {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            folder.isExpanded = !folder.isExpanded;
            // Ensure this line exists:
            this.notify('folders_updated'); 
        }
    }
