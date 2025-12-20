File: src/content/styles.ts
Replace the content of styles.ts with this updated version.
Changed: --bg-panel to #09090b (True Dark).
Changed: --bg-input to transparent (for search).
Added: .toggle-switch styles for the settings page.
Added: .row-actions styles for the edit buttons in the list.
code
TypeScript
export const STYLES = `
/* --- RESET & VARIABLES --- */
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  /* --- PALETTE (True Dark) --- */
  --bg-main: #000000;
  --bg-panel: #09090b;    /* Dark Black (Zinc-950) */
  --bg-hover: rgba(255, 255, 255, 0.08);
  --bg-active: rgba(255, 255, 255, 0.12);
  
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-focus: #3b82f6;
  
  --accent: #3b82f6;      /* Primary Blue */
  --accent-dim: rgba(59, 130, 246, 0.2);
  
  --txt-primary: #ffffff;
  --txt-secondary: #a1a1aa;
  
  --radius: 12px;
  --radius-sm: 6px;
  
  /* --- LAYOUT --- */
  --header-height: 60px;
  --footer-height: 50px;
  --popup-width: 360px;
  --popup-height: 600px;
}

/* --- MAIN PANEL --- */
.panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: var(--popup-width);
  height: var(--popup-height);
  background-color: var(--bg-panel);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px -5px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 14px;
}

.panel.open { pointer-events: auto; }

/* --- HOTSPOT --- */
.hotzone {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  color: var(--txt-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  pointer-events: auto;
  z-index: 2147483647;
  transition: transform 0.2s;
}
.hotzone:hover { transform: scale(1.1); border-color: var(--accent); }
/*
- [x] Popup panel correctly anchors to the edge when "Hotspot Position" is set to "edge".
- [x] Search input only focuses when opened via `Alt + P` shortcut.
- [x] Text Expander triggers immediately on shortcut match (no `..` prefix required).
*/
:host([data-hotspot-position="edge"]) .hotzone {
  right: 0;
  top: 50%;
  width: 8px;
  height: 120px;
  border-radius: 4px 0 0 4px;
  transform: translateY(-50%);
}

/* --- LAYOUT AREAS --- */
.header {
  height: var(--header-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.footer {
  height: var(--footer-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-panel);
  flex-shrink: 0;
}

/* --- SEARCH INPUT FIX --- */
.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03); /* Subtle bg */
  border-radius: var(--radius-sm);
  padding: 0 12px;
}
.search-wrapper:focus-within {
  background: rgba(255,255,255,0.06);
}

.search-icon {
  color: var(--txt-secondary);
  width: 16px; height: 16px;
  margin-right: 8px;
}

.search-input {
  width: 100%;
  height: 36px;
  background: transparent !important; /* Matches wrapper */
  border: none !important;
  outline: none !important;
  color: var(--txt-primary) !important;
  font-size: 14px !important;
  padding: 0 !important;
  box-shadow: none !important;
}

/* --- LIST ROWS --- */
.row, .folder-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--txt-secondary);
  transition: background 0.1s;
  position: relative; /* For absolute positioning of actions */
}

.row:hover, .folder-row:hover {
  background-color: var(--bg-hover);
  color: var(--txt-primary);
}

.folder-left {
  display: flex; align-items: center; gap: 8px; flex: 1; font-weight: 600; color: var(--txt-primary);
}
.prompt-left {
  display: flex; align-items: center; flex: 1; min-width: 0;
}

.folder-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
.folder-row.expanded .chevron { transform: rotate(90deg); }

.shortcut-badge {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--txt-secondary);
  margin-left: 8px;
}

/* --- EDIT BUTTONS (On Hover) --- */
.row-actions {
  display: none; /* Hidden by default */
  margin-left: auto;
  gap: 8px;
}
.row:hover .row-actions, .folder-row:hover .row-actions {
  display: flex; /* Show on hover */
}
.action-btn {
  padding: 4px;
  border-radius: 4px;
  color: var(--txt-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
}
.action-btn:hover { background: var(--bg-active); color: var(--txt-primary); }

/* --- SETTINGS TOGGLES --- */
.toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 12px;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: rgba(255,255,255,0.1);
  border-radius: 99px;
  transition: background-color 0.2s;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.toggle-checkbox:checked + .toggle-switch {
  background-color: var(--accent);
}

.toggle-checkbox:checked + .toggle-switch .toggle-slider {
  transform: translateX(18px);
}

/* --- BUTTONS --- */
.footer-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.footer-btn:hover { background: var(--bg-hover); color: var(--txt-primary); }
.footer-btn.primary { color: var(--txt-primary); font-weight: 600; }

/* --- MODALS --- */
.overlay-area {
  position: absolute; inset: 0;
  background: var(--bg-panel);
  z-index: 50;
  display: none;
  flex-direction: column;
}
.overlay-area.open { display: flex; }
`;
Task 2: Remove Copy Button from Footer
File: src/content/host.ts
Clean up the footer HTML.
code
TypeScript
// [UPDATE] src/content/host.ts

    // ... inside shadow.innerHTML ...

      <!-- 3. FOOTER -->
      <div class="footer" id="footer">
         <!-- Left Side -->
         <div>
            <button id="settings-btn" class="footer-btn">
               <!-- Simple Gear Icon -->
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
               <span style="margin-left:6px">Settings</span>
            </button>
         </div>

         <!-- Right Side -->
         <div>
            <button id="new-btn" class="footer-btn primary">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               <span style="margin-left:6px">New</span>
            </button>
         </div>
      </div>
Task 3: Update PromptList (Add Edit Icons)
File: src/content/components/PromptList.ts
We need to add the .row-actions container to both createFolderRow and createPromptRow. This container holds the Pencil icon which appears on hover (handled by CSS).
code
TypeScript
// [UPDATE] src/content/components/PromptList.ts

    // 1. In createFolderRow
    private createFolderRow(folder: Folder, depth: number, isExpanded: boolean = false): HTMLElement {
        // ... existing setup ...
        
        // Add Edit Button container at the end
        const actions = this.el('div', 'row-actions');
        
        const editBtn = this.el('button', 'action-btn');
        editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        
        // We probably want to open an Edit Folder dialog here later
        // For now, let's just log or hook it up to the editor if you support folder editing
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Dispatch edit with isFolder flag if your editor supports it, 
            // OR just use console for now until we wire Folder Editing fully
            console.log('Edit Folder', folder.name); 
            // Optional: this.shadow.dispatchEvent(new CustomEvent('edit-folder', { detail: { id: folder.id } }));
        });

        actions.appendChild(editBtn);
        row.appendChild(actions);

        return row;
    }

    // 2. In createPromptRow
    private createPromptRow(p: Prompt, showContext: boolean = false): HTMLElement {
        // ... existing setup ...
        
        // Add Edit Button container (Same as folder)
        const actions = this.el('div', 'row-actions');
        
        const editBtn = this.el('button', 'action-btn');
        editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shadow.dispatchEvent(new CustomEvent('edit-prompt', { detail: { promptId: p.id } }));
        });

        actions.appendChild(editBtn);
        row.appendChild(actions);

        // ... existing return ...
        return row;
    }
Task 4: Update Settings Modal (Toggles)
File: src/content/components/SettingsModal.ts
Replace the manual renderUI string with this version that uses the new Toggle CSS structure.
code
TypeScript
// [UPDATE] src/content/components/SettingsModal.ts

    private renderUI() {
        if (!this.area) return;
        
        // Helper to check state
        const isDark = this.store.settings.theme === 'dark';
        const isAutoClose = this.store.settings.autoCloseOnHover;

        this.area.innerHTML = `
            <div style="padding: 24px;">
                <h2 style="margin-bottom:24px; font-size: 18px; font-weight: 600;">Settings</h2>
                
                <!-- Font Size (Segmented) -->
                <div class="settings-row">
                    <label>Font Size</label>
                    <div class="segmented-control">
                        <button class="segment-btn" data-size="12">A</button>
                        <button class="segment-btn" data-size="14">A</button>
                        <button class="segment-btn active" data-size="18">A</button>
                    </div>
                </div>

                <!-- Hotspot (Segmented) -->
                <div class="settings-row">
                    <label>Hotspot Position</label>
                    <div class="segmented-control">
                        <button class="segment-btn" data-pos="corner">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>
                        </button>
                        <button class="segment-btn active" data-pos="edge">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="18" y="4" width="4" height="16" rx="1"/><path d="M14 12H2m12 0-4-4m4 4-4 4"/></svg>
                        </button>
                    </div>
                </div>
                
                <!-- TOGGLE: Dark Theme -->
                <div class="settings-row">
                    <label>Dark theme</label>
                    <label class="toggle-label">
                        <input type="checkbox" class="toggle-checkbox" id="s-theme" ${isDark ? 'checked' : ''}>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </label>
                </div>

                <!-- TOGGLE: Auto Close -->
                <div class="settings-row">
                    <label>Auto-close</label>
                    <label class="toggle-label">
                        <input type="checkbox" class="toggle-checkbox" id="s-auto-close" ${isAutoClose ? 'checked' : ''}>
                        <div class="toggle-switch">
                            <div class="toggle-slider"></div>
                        </div>
                    </label>
                </div>
                
                <button id="s-save" style="width:100%; margin-top:24px; background:var(--accent); color:white; padding:10px; border-radius:8px; font-weight:600; border:none;">Save</button>
            </div>
        `;
        
        // Re-attach listeners after rendering
        this.attachListeners();
    }
