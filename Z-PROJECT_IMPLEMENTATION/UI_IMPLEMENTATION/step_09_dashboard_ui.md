Step 9: UI Redesign - Dashboard & List Styling
Objective
Fix Layout: Fix the "Edge" positioning bug.
Style Search: Create the modern glass-like search bar.
Style List: Implement the new Row designs (Folders with chevrons, Prompts with Badges).
Wire Footer: Connect the new Footer buttons to the application logic.
Files to Modify
src/content/styles.ts
src/content/components/SearchBar.ts
src/content/components/PromptList.ts
src/content/components/App.ts
Task 1: Update Styles (Fix Position & Add List Styles)
File: src/content/styles.ts
We need to add the Edge Mode override and the specific classes for the list items. Append this code to your existing STYLES string (or replace the specific sections if you prefer, but appending is safer).
code
TypeScript
// [UPDATE] src/content/styles.ts - Add/Replace these sections

/* --- FIX: EDGE POSITIONING --- */
:host([data-hotspot-position="edge"]) .panel {
  right: 0;
  bottom: auto; /* Reset bottom */
  top: 50%;
  transform: translateY(-50%);
  border-radius: var(--radius) 0 0 var(--radius);
  height: 90vh; /* Taller in edge mode */
  max-height: 90vh;
}

/* --- SEARCH BAR --- */
.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--txt-secondary);
  pointer-events: none;
  width: 16px; 
  height: 16px;
}

.search-input {
  padding-left: 36px !important; /* Make room for icon */
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid transparent !important;
  transition: background 0.2s, border-color 0.2s;
}

.search-input:focus {
  background: var(--bg-input) !important;
  border-color: var(--border-focus) !important;
}

/* --- LIST ROWS (New Design) --- */
.row, .folder-row {
  display: flex;
  align-items: center;
  padding: 8px 16px; /* Matches header/footer padding */
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background 0.15s;
  color: var(--txt-secondary);
}

.row:hover, .folder-row:hover {
  background-color: var(--bg-hover);
  color: var(--txt-primary);
}

/* Active/Selected state */
.row.selected, .folder-row.selected {
  background-color: rgba(59, 130, 246, 0.1); /* Low opacity blue */
  border-left-color: var(--accent);
  color: var(--txt-primary);
}

/* Folder Specifics */
.folder-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-weight: 600; /* Bold for folders */
  color: var(--txt-primary);
}

.folder-icon { 
    width: 18px; 
    height: 18px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    transition: transform 0.2s;
}
.folder-row.expanded .chevron { transform: rotate(90deg); }

/* Prompt Specifics */
.prompt-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.prompt-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

/* Shortcut Badge (The Pill) */
.shortcut-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-family: monospace;
  color: var(--txt-secondary);
  margin-left: auto; /* Push to right */
}

.row:hover .shortcut-badge {
  background: rgba(255, 255, 255, 0.15);
  color: var(--txt-primary);
}
Task 2: Update SearchBar Component
File: src/content/components/SearchBar.ts
We need to render the search icon inside the input wrapper. We will remove the old buttons (Add, Tags, Settings) from this component because they are now in the Footer or removed.
code
TypeScript
// [UPDATE] src/content/components/SearchBar.ts
import { Component } from './Component';

export class SearchBar extends Component {
    private container: HTMLElement | null = null;
    private input: HTMLInputElement | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#search-container');
        if (!this.container) return;

        this.container.innerHTML = ''; // Clear any existing

        // Create Wrapper
        const wrapper = this.el('div', 'search-wrapper');

        // Icon SVG
        const icon = this.el('div', 'search-icon');
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        // Input
        this.input = this.el('input', 'search-input') as HTMLInputElement;
        this.input.type = 'text';
        this.input.placeholder = 'Type to search...';
        this.input.id = 'search-input'; // Keep ID for App.ts focus logic

        // Wire Events
        this.input.addEventListener('input', () => {
            this.store.setFilter(this.input!.value);
            this.shadow.dispatchEvent(new CustomEvent('nav-reset'));
        });
        
        this.input.addEventListener('keydown', (ev) => {
            // Keep navigation keys
             if (ev.key === 'ArrowDown') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-next')); }
             else if (ev.key === 'ArrowUp') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-prev')); }
             else if (ev.key === 'Enter') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-copy')); }
        });

        // Restore State
        this.input.value = this.store.filterText;

        wrapper.appendChild(icon);
        wrapper.appendChild(this.input);
        this.container.appendChild(wrapper);

        // Store subscription
        this.store.subscribe('filter_updated', () => {
             if (this.input && this.input.value !== this.store.filterText) {
                this.input.value = this.store.filterText;
            }
        });
    }
}
Task 3: Update PromptList Visuals
File: src/content/components/PromptList.ts
Update the row creation methods to match the new design (Badges, cleaner layout).
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    // ... existing imports ...

    // 1. Update createPromptRow
    private createPromptRow(p: Prompt, showContext: boolean = false): HTMLElement {
        const row = this.el('div', 'row');
        row.dataset.id = p.id;

        // Click to EDIT (New Requirement)
        row.addEventListener('click', (e) => {
             e.stopPropagation();
             // Dispatch edit event instead of copy
             this.shadow.dispatchEvent(new CustomEvent('edit-prompt', { detail: { promptId: p.id } }));
        });

        const left = this.el('div', 'prompt-left');

        // Title
        const label = this.el('div', 'prompt-title', p.title);
        left.appendChild(label);

        // Folder Context Badge (for Search mode)
        if (showContext && p.parentId) {
            const folder = this.store.folders.find(f => f.id === p.parentId);
            if (folder) {
                const fBadge = this.el('span', 'prompt-folder-badge');
                fBadge.textContent = folder.name;
                // Add folder icon
                fBadge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> ${folder.name}`;
                left.appendChild(fBadge);
            }
        }

        row.appendChild(left);

        // Shortcut Badge (Right side)
        if (p.quick) {
            const badge = this.el('div', 'shortcut-badge', `.${p.quick}`);
            row.appendChild(badge);
        }

        return row;
    }

    // 2. Update createFolderRow
    private createFolderRow(folder: Folder, depth: number, isExpanded: boolean = false): HTMLElement {
        const row = this.el('div', 'folder-row');
        row.dataset.folderId = folder.id;
        
        // Indentation
        if (depth > 0) row.style.paddingLeft = `${16 + (depth * 16)}px`;

        if (isExpanded) row.classList.add('expanded');

        const left = this.el('div', 'folder-left');

        // Chevron
        const chevron = this.el('div', 'folder-icon chevron');
        chevron.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        // Folder Name
        const name = this.el('span', '', folder.name);

        left.appendChild(chevron);
        left.appendChild(name);
        row.appendChild(left);

        // Right side: Count or Edit
        // For now, let's keep it simple as per screenshot logic
        // We can add the '2' count later if needed by filtering store prompts
        
        // Click to Toggle
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.store.filterText.trim() === '') {
                this.store.toggleFolderExpansion(folder.id);
            }
        });

        return row;
    }
Task 4: Wire Up Footer
File: src/content/components/App.ts
Bind the new footer buttons to existing actions.
code
TypeScript
// [UPDATE] src/content/components/App.ts

    private setupEventListeners() {
        // ... existing listeners ...

        // NEW: Footer Button Wiring
        // We find the buttons from the Shadow DOM
        
        const settingsBtn = this.shadow.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.settingsModal.open());
        }

        const newBtn = this.shadow.getElementById('new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openEditor()); // Opens in "New" mode
        }

        const copyBtn = this.shadow.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                // Trigger the PromptList to copy the currently selected item
                // (PromptList listens for 'nav-copy')
                this.shadow.dispatchEvent(new CustomEvent('nav-copy'));
            });
        }
    }
