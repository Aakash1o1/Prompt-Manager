Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_06.md
Step 6: UI Polish, Clicks, and Folder Validation
Objective: Shrink the drawer, make the module list collapsible, fix interaction blocks, and validate folder placement.
Files to Modify:
src/content/styles.ts
src/content/components/App.ts
src/content/store.ts
src/tutorial.ts
Tasks:
1. Adjust Sizes & Sidebar in src/content/styles.ts
Shrink the modal for tutorial mode and add the collapsible sidebar logic.
code
CSS
/* src/content/styles.ts - Update the Tutorial Overrides */

:host([data-mode="tutorial"]) {
    --modal-width: 650px; /* Reduced from 800px */
    --modal-height: 500px; /* Reduced from 600px */
}

:host([data-mode="tutorial"]) .backdrop {
    justify-content: flex-end !important;
    padding-right: 20px;
    background: transparent !important; /* Fully transparent backdrop */
    backdrop-filter: none !important;
    pointer-events: none; /* Default to none */
}

/* When open, backdrop allows clicking to close, but we use 'modal' for interaction */
:host([data-mode="tutorial"]) .backdrop.open {
    pointer-events: auto;
}

:host([data-mode="tutorial"]) .modal {
    pointer-events: auto;
}

/* Tutorial Page Navigation Collapse (Add to tutorial.html <style> or tutorial.ts injection) */
.panel-nav.collapsed {
    width: 60px;
    padding: 24px 8px;
}
.panel-nav.collapsed .mod-btn span { display: none; }
.panel-nav.collapsed h3, .panel-nav.collapsed div { display: none; }
2. Fix Pointer Events in src/content/components/App.ts
Ensure that closing the drawer immediately releases the screen so the tutorial page becomes clickable again.
code
TypeScript
// src/content/components/App.ts

public close() {
    this.backdrop?.classList.remove('open');
    // FIX: Specifically set host to none to allow clicking through to tutorial page
    this.host.style.pointerEvents = 'none'; 
    
    // SIGNAL: Notify tutorial that drawer closed
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'DRAWER_CLOSED' } 
    }));
}
3. Enhance Signals in src/content/store.ts
Emit signals when items are saved so we can check the parentId.
code
TypeScript
// src/content/store.ts

// Inside addPrompt():
async addPrompt(title: string, text: string, quick: string, tagIds: string[], parentId: string | null = null) {
    // ... existing logic ...
    const newPrompt = { id: uid(), title, text, quick, tags: tagIds, parentId, attributes: {} };
    this.prompts.push(newPrompt);
    await this.savePrompts();

    // SIGNAL: For tutorial validation
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'app-tutorial-prompt-saved', payload: { parentId } } 
    }));
}

// Inside addFolder():
async addFolder(name: string, parentId: string | null = null) {
    // ... existing logic ...
    const newFolder = { id: uid(), name, parentId, order: this.folders.length, isExpanded: true, attributes: {} };
    this.folders.push(newFolder);
    await this.saveFolders();

    // SIGNAL: For tutorial validation
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'app-tutorial-folder-saved', payload: { parentId } } 
    }));
}
4. Update src/tutorial.ts (Collapse Logic & Folder Toast)
Add the sidebar toggle and the "Wrong Folder" warning.
code
TypeScript
// src/tutorial.ts

class TutorialController {
    private isNavCollapsed = false;
    // ... existing properties ...

    private handleSignal(detail: { type: string, payload?: any }) {
        const steps = TUTORIAL_DATA[this.activeModuleKey];
        const step = steps[this.currentStepIdx];
        if (!step) return;

        if (detail.type === step.triggerEvent) {
            // FOLDER VALIDATION: Check if user saved in a folder or root
            if (step.id === 'p-save' && !detail.payload.parentId) {
                // Dispatch a toast to the real app shadow
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: '💡 Tip: Save it inside your new folder to stay organized!' } 
                }));
                // We don't return; we let them finish, but the toast guides them.
            }

            if (step.validate && !step.validate(detail.payload)) return;
            this.currentStepIdx++;
            this.render();
        }
    }

    private render() {
        // ... (Update the grid columns based on isNavCollapsed)
        const gridCols = this.isNavCollapsed ? "60px 320px 1fr" : "220px 320px 1fr";
        
        root.innerHTML = `
            <div class="tutorial-grid" style="grid-template-columns: ${gridCols}">
                <nav class="panel-nav ${this.isNavCollapsed ? 'collapsed' : ''}">
                    <button id="nav-toggle" class="mod-btn" style="text-align:center; margin-bottom: 20px;">
                        ${this.isNavCollapsed ? '☰' : '◀ Collapse'}
                    </button>
                    <!-- ... rest of nav ... -->
                </nav>
                <!-- ... existing panels ... -->
            </div>
        `;

        root.querySelector('#nav-toggle')?.addEventListener('click', () => {
            this.isNavCollapsed = !this.isNavCollapsed;
            this.render();
        });
        
        // ... rest of listeners ...
    }
}
