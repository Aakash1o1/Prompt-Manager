Step 04_fix: Focus Persistence for Inline Editing
Objective: Ensure that typing in conflict resolution inputs does not cause focus loss by tracking the active element and its cursor position during the re-render cycle.
Files to Modify:
src/content/components/ImportOverlay.ts
Tasks:
1. Update createPromptRow to include unique IDs
We need a way to find the specific input after it is recreated. Update the input creation logic in createPromptRow.
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside createPromptRow

// Title Input
const titleInp = document.createElement('input');
titleInp.id = `title-${p.id}`; // Add unique ID
titleInp.value = p.title;
/* ... rest of your styles ... */
titleInp.oninput = () => this.updatePromptField(p.id, 'title', titleInp.value);

// Shortcut Input
const quickInp = document.createElement('input');
quickInp.id = `quick-${p.id}`; // Add unique ID
quickInp.value = p.quick || '';
/* ... rest of your styles ... */
quickInp.oninput = () => this.updatePromptField(p.id, 'quick', quickInp.value);
2. Modify updatePromptField and renderPreview
We will capture the ID and the selection (caret) position before the render, and restore them immediately after.
code
TypeScript
// src/content/components/ImportOverlay.ts

private updatePromptField(id: string, field: 'title' | 'quick', value: string) {
    const p = this.validatedPrompts.find(x => x.id === id);
    if (!p) return;
    (p as any)[field] = value;
    
    // Capture focus state
    const activeEl = this.shadow.activeElement as HTMLInputElement;
    const activeId = activeEl?.id;
    const cursorStart = activeEl?.selectionStart;
    const cursorEnd = activeEl?.selectionEnd;

    // Re-validate
    const titleMatch = this.store.prompts.some(local => 
        local.title.trim().toLowerCase() === p.title.trim().toLowerCase()
    );
    const shortcutMatch = p.quick 
        ? this.store.prompts.some(local => 
            local.quick?.trim().toLowerCase() === p.quick?.trim().toLowerCase()
          ) 
        : false;
    
    p.conflicts.title = titleMatch;
    p.conflicts.shortcut = shortcutMatch;

    // Render
    this.renderPreview();

    // Restore focus and cursor
    if (activeId) {
        const newEl = this.shadow.getElementById(activeId) as HTMLInputElement;
        if (newEl) {
            newEl.focus();
            if (cursorStart !== null && cursorEnd !== null) {
                newEl.setSelectionRange(cursorStart, cursorEnd);
            }
        }
    }
}
