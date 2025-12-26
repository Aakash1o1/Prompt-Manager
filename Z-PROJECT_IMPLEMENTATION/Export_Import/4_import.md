Step 03: Import Parsing & Conflict Engine
Objective: Implement the file-upload handling and the validation engine that detects Title, Shortcut, and Body conflicts between the backup file and local storage.
Files to Modify:
src/content/host.ts
src/content/store.ts
src/content/components/App.ts
New File: src/content/components/ImportOverlay.ts
Tasks:
1. Add the Import Overlay Container
In src/content/host.ts, add the import-area div inside the panel div.
code
TypeScript
// src/content/host.ts -> Inside the <div class="panel"> section
/* ... other overlays ... */
<div id="export-area" class="overlay-area"></div>
<div id="import-area" class="overlay-area"></div> // ADD THIS LINE
2. Define Conflict Types in the Store
In src/content/store.ts, add these types to help the UI identify which indicators to "light up."
code
TypeScript
// src/content/store.ts -> Add to top of file
export interface ImportConflict {
    title: boolean;
    shortcut: boolean;
    body: boolean;
}

export interface ValidatedPrompt extends Prompt {
    conflicts: ImportConflict;
    isExcluded: boolean; // For user selection
}

export interface ValidatedFolder extends Folder {
    isExcluded: boolean; // For user selection
}
3. Add Validation Logic to Store Class
Add the validateImportData method to the Store class in src/content/store.ts. This logic performs the string comparisons you requested.
code
TypeScript
// src/content/store.ts -> Inside Store class

validateImportData(data: BackupData): { prompts: ValidatedPrompt[], folders: ValidatedFolder[] } {
    const validatedPrompts: ValidatedPrompt[] = data.prompts.map(incoming => {
        const titleMatch = this.prompts.some(p => p.title.trim().toLowerCase() === incoming.title.trim().toLowerCase());
        const shortcutMatch = incoming.quick 
            ? this.prompts.some(p => p.quick?.trim().toLowerCase() === incoming.quick?.trim().toLowerCase()) 
            : false;
        const bodyMatch = this.prompts.some(p => p.text.trim() === incoming.text.trim());

        return {
            ...incoming,
            isExcluded: false,
            conflicts: {
                title: titleMatch,
                shortcut: shortcutMatch,
                body: bodyMatch
            }
        };
    });

    const validatedFolders: ValidatedFolder[] = data.folders.map(incoming => ({
        ...incoming,
        isExcluded: false
    }));

    return { prompts: validatedPrompts, folders: validatedFolders };
}
4. Create the ImportOverlay Component (File Picker)
Create src/content/components/ImportOverlay.ts. In this step, we implement the file selection and the transition to the validation state.
code
TypeScript
// src/content/components/ImportOverlay.ts
import { Component } from './Component';
import { BackupData, ValidatedPrompt, ValidatedFolder } from '../store';

export class ImportOverlay extends Component {
    private area: HTMLElement | null = null;
    private fileInput: HTMLInputElement | null = null;

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#import-area');
        if (!this.area) return;
        this.renderInitial();
    }

    private renderInitial() {
        if (!this.area) return;
        this.area.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; height: 100%; width: 100%; box-sizing: border-box;">
                <h2 style="margin:0; font-size:18px;">Import Prompts</h2>
                <p style="font-size:13px; color:var(--txt-secondary);">Select a .json backup file to begin.</p>
                
                <div id="drop-zone" style="flex:1; border:2px dashed var(--border-subtle); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; cursor:pointer; transition: background 0.2s;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m7-7-5-5-5 5m5-5v12"/></svg>
                    <span style="font-size:14px; font-weight:500;">Click or drag file here</span>
                    <input type="file" id="import-file-input" accept=".json" style="display:none;">
                </div>

                <div style="display:flex; justify-content:flex-end; padding-top:16px;">
                    <button id="import-cancel" class="btn-ghost">Cancel</button>
                </div>
            </div>
        `;

        this.fileInput = this.area.querySelector('#import-file-input');
        const dropZone = this.area.querySelector('#drop-zone');

        dropZone?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFile(e));
        this.area.querySelector('#import-cancel')?.addEventListener('click', () => this.close());
    }

    open() {
        this.area?.classList.add('open');
        this.renderInitial(); // Reset to file picker
    }

    close() {
        this.area?.classList.remove('open');
    }

    private handleFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as BackupData;
                if (!json.prompts || !json.folders) throw new Error('Invalid format');
                
                const validated = this.store.validateImportData(json);
                console.log('Validation Results:', validated);
                
                // For Step 3 Verification: We dispatch an event with the data
                this.shadow.dispatchEvent(new CustomEvent('file-validated', { detail: validated }));
            } catch (err) {
                this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Error reading backup file' } }));
            }
        };
        reader.readAsText(file);
    }
}
5. Wire up the App Component
In src/content/components/App.ts, initialize the new component and listeners.
code
TypeScript
// src/content/components/App.ts
import { ImportOverlay } from './ImportOverlay';

/* ... inside App class ... */
private importOverlay: ImportOverlay;

constructor(store: Store, shadow: ShadowRoot, host: HTMLElement) {
    /* ... existing ... */
    this.importOverlay = new ImportOverlay(store, shadow);
}

mount(parent: HTMLElement) {
    /* ... existing ... */
    this.importOverlay.mount(this.panel!);
    this.setupEventListeners();
}

private setupEventListeners() {
    /* ... existing ... */
    this.shadow.addEventListener('open-import-overlay', () => {
        this.settingsModal.close();
        this.importOverlay.open();
    });

    // Temporary listener for Step 3 verification
    this.shadow.addEventListener('file-validated', ((e: CustomEvent) => {
        const count = e.detail.prompts.length;
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Loaded ${count} prompts for review.` } }));
    }) as EventListener);
}
