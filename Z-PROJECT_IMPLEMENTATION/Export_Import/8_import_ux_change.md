Step 06: Enhanced Body Conflict Visibility
Objective: Modify the validation engine to capture the title of the clashing local prompt and display it in the import preview warning.
Files to Modify:
src/content/store.ts
src/content/components/ImportOverlay.ts
Tasks:
1. Update the Conflict Interface
In src/content/store.ts, change the body type in ImportConflict from a boolean to a string | null so we can store the matching prompt's title.
code
TypeScript
// src/content/store.ts -> Update the interface
export interface ImportConflict {
    title: boolean;
    shortcut: boolean;
    body: string | null; // Changed from boolean to string | null
}
2. Update the Validation Logic
Modify the validateImportData method in src/content/store.ts to find the matching prompt instead of just checking for its existence.
code
TypeScript
// src/content/store.ts -> inside validateImportData()

const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
    const titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === incoming.title.trim().toLowerCase());
    const shortcutMatch = incoming.quick 
        ? this.prompts.some(p => p.quick?.trim().toLowerCase() === incoming.quick?.trim().toLowerCase()) 
        : false;
    
    // FIND the actual matching prompt to get its title
    const matchingBodyPrompt = this.prompts.find(p => p.text.trim() === incoming.text.trim());

    return {
        ...incoming,
        isExcluded: false,
        conflicts: {
            title: titleMatch,
            shortcut: shortcutMatch,
            body: matchingBodyPrompt ? matchingBodyPrompt.title : null // Store the title
        }
    };
});
3. Update the UI Warning Message
In src/content/components/ImportOverlay.ts, update the createPromptRow method to display the name of the clashing prompt.
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside createPromptRow()

// Find the section where the Body Warning (Amber) is rendered
if (p.conflicts.body && this.selectedIds.has(p.id)) {
    const warn = document.createElement('div');
    // Display the matching title in the warning
    warn.textContent = `⚠ Content matches existing: "${p.conflicts.body}"`;
    warn.style.fontSize = '10px';
    warn.style.color = '#f59e0b';
    warn.style.marginLeft = '24px';
    warn.style.fontWeight = '500';
    row.append(warn);
}
4. Maintain Body Conflict during Real-time Updates
In src/content/components/ImportOverlay.ts, update updatePromptField to ensure the body conflict info isn't lost when a user edits the title or shortcut.
code
TypeScript
// src/content/components/ImportOverlay.ts -> inside updatePromptField()

// Re-validate logic...
const titleMatch = this.store.prompts.some(local => 
    local.title.trim().toLowerCase() === p.title.trim().toLowerCase()
);
const shortcutMatch = p.quick 
    ? this.store.prompts.some(local => 
        local.quick?.trim().toLowerCase() === p.quick?.trim().toLowerCase()
      ) 
    : false;

// Re-check body match title (incase local prompts changed, though unlikely in this view)
const matchingBodyPrompt = this.store.prompts.find(local => local.text.trim() === p.text.trim());

p.conflicts.title = titleMatch;
p.conflicts.shortcut = shortcutMatch;
p.conflicts.body = matchingBodyPrompt ? matchingBodyPrompt.title : null; // Update the title reference
