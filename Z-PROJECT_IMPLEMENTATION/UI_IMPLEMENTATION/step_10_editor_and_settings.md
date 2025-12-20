Step 10: UI Redesign - Editor Tabs & Settings Modal
Objective
Search Input Style: Apply full-width styling and remove the default browser border.
Prompt Editor Refactor: Implement the "PROMPT | FOLDER" tab system and the new form layout.
Settings Modal Refactor: Implement Segmented Controls (buttons) and Toggles.
Files to Modify
src/content/styles.ts
src/content/components/PromptEditor.ts
src/content/components/SettingsModal.ts
Task 1: Update Search & Form Styles
File: src/content/styles.ts
Add these rules to ensure inputs and tabs look like the screenshots.
code
CSS
/* [APPEND TO STYLES CONSTANT] */

/* --- SEARCH INPUT FIX --- */
.search-input {
  width: 100%;
  height: 36px;
  background: var(--bg-input) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  padding: 0 12px 0 36px !important;
  color: var(--txt-primary) !important;
  font-size: 14px !important;
}

/* --- TABS (Editor) --- */
.tab-container {
  display: flex;
  background: var(--bg-main);
  padding: 3px;
  border-radius: var(--radius-sm);
  width: fit-content;
  margin-left: auto;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--txt-secondary);
  text-transform: uppercase;
}

.tab-btn.active {
  background: var(--bg-input);
  color: var(--txt-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* --- SEGMENTED CONTROL (Settings) --- */
.segmented-control {
  display: flex;
  background: var(--bg-input);
  padding: 2px;
  border-radius: var(--radius-sm);
  gap: 2px;
}

.segment-btn {
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  justify-content: center;
  color: var(--txt-secondary);
}

.segment-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--txt-primary);
}

/* Row Layout for Settings */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-row label {
  font-weight: 500;
}
Task 2: Refactor PromptEditor (Tabs Logic)
File: src/content/components/PromptEditor.ts
Update open() and mount() to handle the "Create New" header and the "Prompt/Folder" tabs.
code
TypeScript
// [UPDATE] src/content/components/PromptEditor.ts

export class PromptEditor extends Component {
    private currentTab: 'prompt' | 'folder' = 'prompt';

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#add-area');
        if (!this.area) return;

        // Render the new UI structure
        this.renderForm();
        this.setupFormListeners();
    }

    private renderForm() {
        if (!this.area) return;
        this.area.innerHTML = `
            <div style="padding: 20px; display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; font-size:12px; color:var(--txt-secondary); text-transform:uppercase;">Create New</span>
                    <div class="tab-container">
                        <button id="tab-prompt" class="tab-btn active">Prompt</button>
                        <button id="tab-folder" class="tab-btn">Folder</button>
                    </div>
                </div>

                <div id="form-content">
                    <!-- Dynamic form fields injected here -->
                </div>

                <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:auto;">
                    <button id="cancel-btn" style="color:var(--txt-secondary)">Cancel</button>
                    <button id="save-btn" style="background:var(--accent); color:white; padding:8px 20px; border-radius:8px; font-weight:600;">Save Changes</button>
                </div>
            </div>
        `;
    }

    private setupFormListeners() {
        const pTab = this.area?.querySelector('#tab-prompt');
        const fTab = this.area?.querySelector('#tab-folder');
        
        pTab?.addEventListener('click', () => this.switchTab('prompt'));
        fTab?.addEventListener('click', () => this.switchTab('folder'));

        this.area?.querySelector('#save-btn')?.addEventListener('click', () => this.handleSave());
        this.area?.querySelector('#cancel-btn')?.addEventListener('click', () => this.close());
    }

    private switchTab(tab: 'prompt' | 'folder') {
        this.currentTab = tab;
        this.area?.querySelector('#tab-prompt')?.classList.toggle('active', tab === 'prompt');
        this.area?.querySelector('#tab-folder')?.classList.toggle('active', tab === 'folder');
        this.renderFields();
    }

    private renderFields() {
        const container = this.area?.querySelector('#form-content');
        if (!container) return;

        if (this.currentTab === 'prompt') {
            container.innerHTML = `
                <input id="input-title" type="text" placeholder="Title" style="font-size:24px; font-weight:700; background:transparent; border:none; margin-bottom:12px;">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
                    <div>
                        <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Location</label>
                        <select id="input-folder"></select>
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Shortcut</label>
                        <input id="input-quick" type="text" placeholder=".code">
                    </div>
                </div>
                <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Content</label>
                <textarea id="input-body" placeholder="Type your prompt here..." style="min-height:200px;"></textarea>
            `;
        } else {
            container.innerHTML = `
                <input id="input-title" type="text" placeholder="Folder Title" style="font-size:24px; font-weight:700; background:transparent; border:none; margin-bottom:12px;">
                <label style="display:block; font-size:12px; color:var(--txt-secondary); margin-bottom:4px;">Location</label>
                <select id="input-folder"></select>
            `;
        }
        this.renderFolderOptions(null); // Refill select
    }
    
    // ... existing save logic updated to handle currentTab check ...
}
Task 3: Update SettingsModal (Segmented Controls)
File: src/content/components/SettingsModal.ts
code
TypeScript
// [UPDATE] src/content/components/SettingsModal.ts

    private renderUI() {
        if (!this.area) return;
        this.area.innerHTML = `
            <div style="padding: 24px;">
                <h2 style="margin-bottom:24px;">Settings</h2>
                
                <div class="settings-row">
                    <label>Font Size</label>
                    <div class="segmented-control">
                        <button class="segment-btn" data-size="12">A</button>
                        <button class="segment-btn" data-size="14">A</button>
                        <button class="segment-btn active" data-size="18">A</button>
                    </div>
                </div>

                <div class="settings-row">
                    <label>Hotspot Position</label>
                    <div class="segmented-control">
                        <button class="segment-btn" data-pos="corner">
                            <!-- SVG Placeholder for Corner: Paste your circle SVG here -->
                            ○
                        </button>
                        <button class="segment-btn active" data-pos="edge">
                            <!-- SVG Placeholder for Edge: Paste your square SVG here -->
                            □
                        </button>
                    </div>
                </div>
                
                <!-- Add Toggle Switch logic here matching Screenshot 2 -->
                
                <button id="s-save" style="width:100%; margin-top:20px; background:var(--accent); color:white; padding:12px; border-radius:8px;">Save</button>
            </div>
        `;
    }
