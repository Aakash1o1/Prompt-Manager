Step 12: Fix Edit Mode Layout & Overflow
Objective
Fix the "wiggle room" / horizontal scroll issue in the Edit/Add screen.
CSS: Remove scrollbars from the .overlay-area container to prevent double-scrolling interactions.
Layout: Ensure the internal container of PromptEditor is strictly constrained to the parent width and handles its own scrolling internally via #form-content.
Files to Modify
src/content/styles.ts
src/content/components/PromptEditor.ts
Task 1: Fix Overlay CSS
File: src/content/styles.ts
Find the .overlay-area rule. We need to set overflow to hidden so it acts as a rigid frame, allowing the inner #form-content to handle the scrolling.
code
TypeScript
// [UPDATE] src/content/styles.ts

/* --- MODALS & OVERLAYS --- */
.overlay-area {
  position: absolute; 
  inset: 0;
  background: var(--bg-panel);
  z-index: 50;
  display: none;
  flex-direction: column;
  /* FIX: Disable scrolling on the container itself to prevent "wiggle" */
  overflow: hidden; 
  width: 100%;
  height: 100%;
}
.overlay-area.open { display: flex; }
Task 2: Tighten PromptEditor Layout
File: src/content/components/PromptEditor.ts
Update the renderForm method. We will be explicit about width and overflow to ensure it stays within bounds.
code
TypeScript
// [UPDATE] src/content/components/PromptEditor.ts

    private renderForm() {
        if (!this.area) return;
        // FIX: Added width: 100%, overflow: hidden to wrapper
        // Removed unnecessary height: 100% on wrapper if flex: 1 handles it, 
        // but keeping height:100% is safe with box-sizing.
        this.area.innerHTML = `
            <div style="
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 16px; 
                height: 100%; 
                width: 100%; 
                box-sizing: border-box; 
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                    <span id="editor-title-label" style="font-weight:700; font-size:12px; color:var(--txt-secondary); text-transform:uppercase;">Create New</span>
                    <div class="tab-container">
                        <button id="tab-prompt" class="tab-btn active">Prompt</button>
                        <button id="tab-folder" class="tab-btn">Folder</button>
                    </div>
                </div>

                <!-- Content (Scrollable) -->
                <!-- FIX: Added padding-right to account for potential scrollbar width if needed, though we hide it -->
                <div id="form-content" style="
                    flex: 1; 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                    padding-bottom: 10px;
                    scrollbar-width: none; /* Firefox */
                ">
                    <!-- Dynamic form fields injected here -->
                </div>

                <!-- Footer -->
                <div style="
                    display:flex; 
                    gap:12px; 
                    justify-content:flex-end; 
                    margin-top:auto; 
                    padding-top: 16px; 
                    flex-shrink: 0;
                    border-top: 1px solid var(--border-subtle); /* Optional: visual separation */
                ">
                    <button id="cancel-btn" style="color:var(--txt-secondary)">Cancel</button>
                    <button id="save-btn" style="background:var(--accent); color:white; padding:8px 20px; border-radius:8px; font-weight:600;">Save Changes</button>
                </div>
            </div>
        `;
    }
Task 3: Verify Input Styling
File: src/content/components/PromptEditor.ts
In renderFields, ensure the textarea and inputs inherit box-sizing: border-box correctly. The global style handles this, but we can ensure width: 100% behaves.
No code change needed here if Global Styles are applied correctly, but ensure styles.ts has:
code
CSS
input, textarea, select { box-sizing: border-box; }
