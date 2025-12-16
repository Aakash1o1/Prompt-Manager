Step 5: UI - Moving Prompts (The Editor)
Objective
Add a "Folder/Location" selector to the Prompt Editor.
HTML: Add a <select> dropdown to the Add/Edit form.
Logic: Populate this dropdown with a flattened view of the folder tree (e.g., "Root", "- Work", "-- Projects").
Persistence: Save the selected parentId when creating or updating a prompt.
Files to Modify
src/content/host.ts
src/content/components/PromptEditor.ts
Task 1: Update HTML Structure
File: src/content/host.ts
Add the Folder Select dropdown inside the .add-area div. Place it between the Title and the Quick Code inputs.
Find this section:
code
Html
<div class="add-area" id="add-area" aria-hidden="true">
  <input id="input-title" type="text" placeholder="Prompt title" />
  <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
Insert the <select> element:
code
Html
<div class="add-area" id="add-area" aria-hidden="true">
  <input id="input-title" type="text" placeholder="Prompt title" />
  
  <!-- NEW: Location Selector -->
  <select id="input-folder" style="width: 100%; margin-top: 6px;">
    <option value="">(Root)</option>
  </select>

  <input id="input-quick" type="text" placeholder="Quick search code (optional)" />
  <!-- ... rest of html ... -->
Task 2: Update PromptEditor Logic
File: src/content/components/PromptEditor.ts
We need to:
Reference the new <select> element.
Populate it with folders whenever the editor opens.
Read the value when saving.
code
TypeScript
// [UPDATE] src/content/components/PromptEditor.ts

// 1. Add Folder import
import { Component } from './Component';
import { Folder } from '../store'; // Import Folder type

export class PromptEditor extends Component {
    // ... existing props ...
    private inputFolder: HTMLSelectElement | null = null; // NEW PROP

    mount(parent: HTMLElement) {
        // ... existing selectors ...
        this.inputFolder = parent.querySelector('#input-folder'); // SELECT IT

        // ... existing event listeners ...
    }

    // 2. Helper to populate the dropdown
    private renderFolderOptions(selectedId: string | null) {
        if (!this.inputFolder) return;

        this.inputFolder.innerHTML = '';

        // Option 1: Root
        const rootOpt = document.createElement('option');
        rootOpt.value = ""; // Empty string = Root (null)
        rootOpt.textContent = "📁 (Root)";
        this.inputFolder.appendChild(rootOpt);

        // Recursive helper to render tree options
        const renderLevel = (parentId: string | null, depth: number) => {
            const children = this.store.folders
                .filter(f => f.parentId == parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            children.forEach(folder => {
                const opt = document.createElement('option');
                opt.value = folder.id;
                // Add visual indentation using non-breaking spaces or dashes
                const prefix = depth > 0 ? "— ".repeat(depth) : "";
                opt.textContent = `${prefix}📁 ${folder.name}`;
                this.inputFolder!.appendChild(opt);

                // Recurse
                renderLevel(folder.id, depth + 1);
            });
        };

        renderLevel(null, 0);

        // Set selected value
        this.inputFolder.value = selectedId || "";
    }

    open(promptId?: string) {
        // ... existing open logic ...

        if (promptId) {
            // EDIT MODE
            this.editingId = promptId;
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                // ... set title, quick, text ...
                
                // NEW: Set Folder
                this.renderFolderOptions(p.parentId || null);
            }
            this.renderDeleteButton(); 
        } else {
            // NEW MODE
            this.editingId = null;
            this.resetInputs();
            this.draftTagIds = [];
            
            // NEW: Default to Root (or potentially the currently open folder, if you want that logic later)
            this.renderFolderOptions(null);

            this.removeDeleteButton();
        }
        
        // ... rest of open ...
    }

    private resetInputs() {
        if (this.inputTitle) this.inputTitle.value = '';
        if (this.inputQuick) this.inputQuick.value = '';
        if (this.inputBody) this.inputBody.value = '';
        if (this.inputFolder) this.inputFolder.value = ''; // Reset folder
    }

    private async save() {
        const title = this.inputTitle?.value.trim();
        const text = this.inputBody?.value;
        const quick = this.inputQuick?.value.trim() || '';
        
        // NEW: Get Folder ID
        const folderId = this.inputFolder?.value || null; // "" becomes null

        if (!title || !text) {
             // ... existing error handling ...
            return;
        }

        if (this.editingId) {
            // NEW: Pass parentId
            await this.store.updatePrompt(this.editingId, { 
                title, text, quick, tags: this.draftTagIds, parentId: folderId 
            });
        } else {
            // NEW: Pass parentId
            await this.store.addPrompt(
                title, text, quick, this.draftTagIds, folderId
            );
        }

        // ... existing success logic ...
    }
}
