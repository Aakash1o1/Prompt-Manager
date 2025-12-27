Step 02: UI Integration (Main List)
Objective: Update the prompt list to display a "Pin" button for each prompt and a visual indicator (icon) for prompts that are already pinned.
Files to Modify:
src/content/components/PromptList.ts
Tasks:
1. Update createPromptRow
Modify the row creation logic to include the Pin button and the status icon.
code
TypeScript
// src/content/components/PromptList.ts -> inside createPromptRow(p: Prompt, ...)

// ... (Existing code: row creation) ...

const left = this.el('div', 'prompt-left');

// 1. ADD: Pinned Visual Indicator (Icon before title)
if (p.isPinned) {
    const pinIcon = this.el('span', 'pin-icon');
    pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
    pinIcon.style.marginRight = '6px';
    pinIcon.style.display = 'flex';
    pinIcon.style.alignItems = 'center';
    left.appendChild(pinIcon);
    
    // Optional: Add a subtle background to the row to highlight it
    row.style.background = 'var(--bg-active, rgba(255,255,255,0.05))';
}

// ... (Existing code: Title and Context Badge) ...
// Ensure label is appended AFTER the pin icon
const label = this.el('div', 'prompt-title', p.title);
left.appendChild(label);

// ... (Existing code: Context Badge logic) ...

// ... (Existing code: Shortcut Badge) ...


// 2. ADD: Pin Action Button
const actions = this.el('div', 'row-actions');

const pinBtn = this.el('button', 'action-btn');
pinBtn.title = p.isPinned ? 'Unpin' : 'Pin';
// Use filled icon if pinned, outline if not
if (p.isPinned) {
    pinBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
    pinBtn.style.color = 'var(--accent)';
} else {
    pinBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
}

pinBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
        await this.store.togglePin(p.id);
        // Store update triggers render(), so UI updates automatically
    } catch (err: any) {
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: err.message || 'Failed to pin' } 
        }));
    }
});

actions.appendChild(pinBtn);
// ... (Existing code: Copy Button append) ...
const copyBtn = this.el('button', 'action-btn'); 
// ...
actions.appendChild(copyBtn);
row.appendChild(actions);

return row;
