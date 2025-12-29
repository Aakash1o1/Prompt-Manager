Step 10: Rotating Tips in Workspace
Objective:
Add a rotating tip section to the "Empty State" of the Workspace.
Implement a 10-second timer that cycles through a predefined list.
Ensure the timer cleans up correctly when the user opens an editor or settings.
Files to Modify:
src/content/components/Workspace.ts
Tasks:
Update src/content/components/Workspace.ts
Replace the file content (or update specific sections) to include the TIPS array and the rotation logic.
code
TypeScript
// src/content/components/Workspace.ts
import { Component } from './Component';
import { Store, Prompt } from '../store'; // Fixed import imports
import { ICONS } from '../icons';
import { ControlPanel } from './ControlPanel';

// --- CONFIGURATION ---
const TIPS = [
    "💡 Type `../` followed by Space in any text box to open the Quick Menu.",
    "💡 Pin your top 5 most used prompts to access them instantly.",
    "💡 Organize prompts into folders to keep your library clean.",
    "💡 Right-click selected text on any webpage to 'Save to Prompt Drawer'.",
    "💡 Keep shortcuts short (e.g., `.fix`) for faster typing.",
    "💡 Export your data regularly to keep a safe backup.",
    "💡 Use Markdown formatting in your prompts for better AI readability.",
    "💡 You can move prompts by clicking the 'Kebab' menu and selecting 'Move To'.",
    "💡 Check the Settings to adjust the font size or switch to Light Mode."
];

export class Workspace extends Component {
    private container: HTMLElement | null = null;
    private currentMode: 'empty' | 'editor' | 'settings' = 'empty';
    
    // Editor State
    private draftPrompt: Partial<Prompt> = {};
    private isDirty: boolean = false;
    private originalPromptId: string | null = null;

    private controlPanel: ControlPanel;
    
    // Tip Rotation State
    private tipInterval: number | null = null;

    constructor(store: Store, shadow: ShadowRoot) {
        super(store, shadow);
        this.controlPanel = new ControlPanel(store, shadow);
    }

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#workspace');
        if (!this.container) return;
        this.renderEmpty();
    }

    // --- MODE SWITCHING & CLEANUP ---

    private clearTipRotation() {
        if (this.tipInterval) {
            window.clearInterval(this.tipInterval);
            this.tipInterval = null;
        }
    }

    public openSettings() {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation(); // Stop tips
        this.currentMode = 'settings';
        this.originalPromptId = null;
        this.isDirty = false;
        
        if (this.container) {
            this.controlPanel.mount(this.container);
        }
    }

    public openEditor(promptId: string | null, parentId: string | null = null) {
        if (this.checkUnsavedChanges()) return;
        this.clearTipRotation(); // Stop tips

        this.currentMode = 'editor';
        this.originalPromptId = promptId;
        this.isDirty = false;

        if (promptId) {
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                this.draftPrompt = { ...p };
            }
        } else {
            this.draftPrompt = {
                title: '',
                text: '',
                quick: '',
                parentId: parentId
            };
        }
        this.renderEditor();
    }

    // --- RENDERING ---

    public renderEmpty() {
        if (!this.container) return;
        this.currentMode = 'empty';
        this.clearTipRotation(); // Ensure no duplicate timers

        this.container.innerHTML = `
            <div class="ws-empty">
                <div style="font-size: 24px; opacity: 0.2; margin-bottom: 16px;">${ICONS.prompt}</div>
                <div style="font-weight: 500; color: var(--txt-secondary);">Select a prompt to edit</div>
                
                <!-- Tip Container -->
                <div style="margin-top: 40px; max-width: 300px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 8px;">Pro Tip</div>
                    <div id="ws-tip-text" style="font-size: 13px; color: var(--txt-muted); line-height: 1.5; min-height: 40px; transition: opacity 0.3s;">
                        ${TIPS[0]}
                    </div>
                </div>
            </div>
        `;

        this.startTipRotation();
    }

    private startTipRotation() {
        const tipEl = this.container?.querySelector('#ws-tip-text') as HTMLElement;
        if (!tipEl) return;

        let index = 0;
        
        // Randomize start? Optional. Let's start at 0 for consistency or Math.floor(Math.random() * TIPS.length)
        index = Math.floor(Math.random() * TIPS.length);
        tipEl.textContent = TIPS[index];

        this.tipInterval = window.setInterval(() => {
            // Fade out
            tipEl.style.opacity = '0';
            
            setTimeout(() => {
                // Update text
                index = (index + 1) % TIPS.length;
                tipEl.textContent = TIPS[index];
                // Fade in
                tipEl.style.opacity = '1';
            }, 300); // Wait for fade out transition

        }, 10000); // 10 Seconds
    }

    // ... (Keep existing renderEditor, populateFolderSelect, setupEditorListeners, save, delete, checkUnsavedChanges, focusTitle methods exactly as they were) ...
    
    private renderEditor() {
        if (!this.container) return;
        const p = this.draftPrompt;
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" id="ws-title" class="ws-title-input" placeholder="Untitled Prompt" value="${p.title || ''}" autocomplete="off">
                <div class="ws-meta-row">
                    <input type="text" id="ws-quick" class="ws-input" placeholder="Shortcut (.code)" value="${p.quick || ''}" style="width: 140px;" autocomplete="off">
                    <select id="ws-folder" class="ws-select"><option value="">(Root)</option></select>
                </div>
            </div>
            <textarea id="ws-body" class="ws-editor-body" placeholder="Type your prompt here..." spellcheck="false">${p.text || ''}</textarea>
            <div class="ws-footer">
                <button id="ws-delete" class="btn-ghost" style="margin-right:auto; color:var(--danger); ${!this.originalPromptId ? 'display:none' : ''}">Delete</button>
                <button id="ws-cancel" class="btn-ghost">Cancel</button>
                <button id="ws-save" class="btn-primary">Save Changes</button>
            </div>
        `;
        this.populateFolderSelect();
        this.setupEditorListeners();
        this.focusTitle();
    }

    private populateFolderSelect() {
        const select = this.container?.querySelector('#ws-folder') as HTMLSelectElement;
        if (!select) return;
        const addOptions = (parentId: string | null, depth: number) => {
            const children = this.store.folders.filter(f => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
            children.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = `${'\u00A0'.repeat(depth * 3)}📁 ${f.name}`;
                if (this.draftPrompt.parentId === f.id) opt.selected = true;
                select.appendChild(opt);
                addOptions(f.id, depth + 1);
            });
        };
        addOptions(null, 0);
    }

    private setupEditorListeners() {
        const titleInp = this.container?.querySelector('#ws-title') as HTMLInputElement;
        const quickInp = this.container?.querySelector('#ws-quick') as HTMLInputElement;
        const bodyInp = this.container?.querySelector('#ws-body') as HTMLTextAreaElement;
        const folderInp = this.container?.querySelector('#ws-folder') as HTMLSelectElement;
        const markDirty = () => { this.isDirty = true; };
        titleInp.oninput = (e) => { this.draftPrompt.title = (e.target as HTMLInputElement).value; markDirty(); };
        quickInp.oninput = (e) => { this.draftPrompt.quick = (e.target as HTMLInputElement).value; markDirty(); };
        bodyInp.oninput = (e) => { this.draftPrompt.text = (e.target as HTMLTextAreaElement).value; markDirty(); };
        folderInp.onchange = (e) => { this.draftPrompt.parentId = (e.target as HTMLSelectElement).value || null; markDirty(); };
        this.container?.querySelector('#ws-save')?.addEventListener('click', () => this.save());
        this.container?.querySelector('#ws-cancel')?.addEventListener('click', () => { if (this.checkUnsavedChanges()) return; this.renderEmpty(); });
        this.container?.querySelector('#ws-delete')?.addEventListener('click', () => this.delete());
    }

    private async save() {
        const title = this.draftPrompt.title?.trim();
        if (!title) { this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title is required' } })); return; }
        try {
            if (this.originalPromptId) { await this.store.updatePrompt(this.originalPromptId, this.draftPrompt); } 
            else { await this.store.addPrompt(title, this.draftPrompt.text || '', this.draftPrompt.quick || '', [], this.draftPrompt.parentId); }
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Saved' } }));
            this.isDirty = false;
            if (!this.originalPromptId) this.renderEmpty(); 
        } catch (e: any) { this.shadow.dispatchEvent(new CustomEvent('show-toast', { detail: { message: e.message } })); }
    }

    private async delete() {
        if (!this.originalPromptId) return;
        if (confirm('Delete this prompt?')) { await this.store.deletePrompt(this.originalPromptId); this.renderEmpty(); }
    }

    private checkUnsavedChanges(): boolean {
        if (this.currentMode === 'editor' && this.isDirty) {
            if (!confirm('You have unsaved changes. Discard them?')) return true;
        }
        return false;
    }

    private focusTitle() { setTimeout(() => { const el = this.container?.querySelector('#ws-title') as HTMLElement; el?.focus(); }, 50); }

    // --- PREVIEW / IMPORT RESOLUTION (Keep existing methods) ---
    public previewExport(promptId: string) {
        this.clearTipRotation();
        if (!this.container) return;
        const p = this.store.prompts.find(x => x.id === promptId);
        if (!p) return;
        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" class="ws-title-input" value="${p.title}" readonly>
                <div class="ws-meta-row">
                    <input type="text" class="ws-input" value="${p.quick || ''}" readonly style="width: 140px;">
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${p.text}</textarea>
        `;
    }

    public resolveImport(prompt: any, onUpdate: (p: any) => void) {
        this.clearTipRotation();
        if (!this.container) return;
        const { title, shortcut, body } = prompt.conflicts;
        this.currentMode = 'empty';
        this.container.innerHTML = `
            <div class="ws-header">
                <input type="text" id="res-title" class="ws-title-input ${title ? 'error' : 'success'}" value="${prompt.title}">
                <div id="err-title" class="validation-msg error" style="display:${title?'block':'none'}">Title already exists</div>
                <div id="warn-body" class="validation-msg warning" style="display:${body?'block':'none'}">Content matches existing prompt: "${body}"</div>
                <div class="ws-meta-row" style="margin-top:12px;">
                    <div>
                        <input type="text" id="res-quick" class="ws-input ${shortcut ? 'error' : (prompt.quick ? 'success' : '')}" value="${prompt.quick || ''}" placeholder="Shortcut" style="width: 140px;">
                        <div id="err-quick" class="validation-msg error" style="display:${shortcut?'block':'none'}">Shortcut taken</div>
                    </div>
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${prompt.text}</textarea>
        `;
        const titleInp = this.container.querySelector('#res-title') as HTMLInputElement;
        const quickInp = this.container.querySelector('#res-quick') as HTMLInputElement;
        const errTitle = this.container.querySelector('#err-title') as HTMLElement;
        const errQuick = this.container.querySelector('#err-quick') as HTMLElement;
        const handleInput = () => {
            prompt.title = titleInp.value;
            prompt.quick = quickInp.value;
            const titleMatch = this.store.prompts.some(p => p.title.trim().toLowerCase() === prompt.title.trim().toLowerCase());
            const quickMatch = prompt.quick ? this.store.prompts.some(p => p.quick?.trim().toLowerCase() === prompt.quick.trim().toLowerCase()) : false;
            prompt.conflicts.title = titleMatch;
            prompt.conflicts.shortcut = quickMatch;
            titleInp.className = `ws-title-input ${titleMatch ? 'error' : 'success'}`;
            errTitle.style.display = titleMatch ? 'block' : 'none';
            quickInp.className = `ws-input ${quickMatch ? 'error' : (prompt.quick ? 'success' : '')}`;
            errQuick.style.display = quickMatch ? 'block' : 'none';
            onUpdate(prompt);
        };
        titleInp.addEventListener('input', handleInput);
        quickInp.addEventListener('input', handleInput);
    }
}
