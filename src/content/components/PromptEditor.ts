import { Component } from './Component';

export class PromptEditor extends Component {
    private area: HTMLElement | null = null;
    private inputTitle: HTMLInputElement | null = null;
    private inputQuick: HTMLInputElement | null = null;
    private inputBody: HTMLTextAreaElement | null = null;
    private saveBtn: HTMLButtonElement | null = null;
    private cancelBtn: HTMLButtonElement | null = null;
    
    public isOpen(): boolean {
        return this.area ? this.area.classList.contains('open') : false;
    }

    // --- NEW PROPERTY ---
    private deleteBtn: HTMLButtonElement | null = null; 
    // --------------------

    private editingId: string | null = null;
    
    // Public property so App can read it
    public draftTagIds: string[] = []; 
    
    // Callback for when tags change internally
    public onTagsChanged: (() => void) | null = null;

    mount(parent: HTMLElement) {
        this.area = parent.querySelector('#add-area');
        this.inputTitle = parent.querySelector('#input-title');
        this.inputQuick = parent.querySelector('#input-quick');
        this.inputBody = parent.querySelector('#input-body');
        this.saveBtn = parent.querySelector('#save-btn');
        this.cancelBtn = parent.querySelector('#cancel-btn');

        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.save());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
    }

    // Helper method for App.ts to call
    toggleTag(tagId: string) {
        if (this.draftTagIds.includes(tagId)) {
            this.draftTagIds = this.draftTagIds.filter(id => id !== tagId);
        } else {
            this.draftTagIds.push(tagId);
        }
        // Notify if anyone is listening
        if (this.onTagsChanged) this.onTagsChanged();
    }

    open(promptId?: string) {
        if (!this.area) return;

        this.area.classList.add('open');
        this.area.setAttribute('aria-hidden', 'false');
        this.shadow.getElementById('panel')?.classList.add('mode-add');

        if (promptId) {
            this.editingId = promptId;
            const p = this.store.prompts.find(x => x.id === promptId);
            if (p) {
                if (this.inputTitle) this.inputTitle.value = p.title;
                if (this.inputQuick) this.inputQuick.value = p.quick || '';
                if (this.inputBody) this.inputBody.value = p.text;
                this.draftTagIds = [...(p.tags || [])];
            }
            // --- RENDER DELETE BUTTON (EDIT MODE) ---
            this.renderDeleteButton(); 
            // ---------------------------------------
        } else {
            this.editingId = null;
            this.resetInputs();
            this.draftTagIds = [];
            // --- REMOVE DELETE BUTTON (NEW MODE) ---
            this.removeDeleteButton();
            // ---------------------------------------
        }
        
        // Trigger callback to sync dropdown if open
        if (this.onTagsChanged) this.onTagsChanged();
    }

    close() {
        if (!this.area) return;
        this.area.classList.remove('open');
        this.area.setAttribute('aria-hidden', 'true');
        this.shadow.getElementById('panel')?.classList.remove('mode-add');
        this.resetInputs();
        
        // --- CLEAN UP DELETE BUTTON ---
        this.removeDeleteButton(); 
        // ------------------------------

        // Emit event so App knows to reset Dropdown
        this.shadow.dispatchEvent(new CustomEvent('editor-closed'));
    }

    // --- NEW HELPER METHODS ---
    private renderDeleteButton() {
        // Prevent duplicate buttons
        if (this.deleteBtn) return;
        if (!this.area) return;

        this.deleteBtn = this.el('button', 'delete-btn') as HTMLButtonElement;
        this.deleteBtn.title = 'Delete prompt';
        this.deleteBtn.setAttribute('aria-label', 'Delete prompt');
        this.deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" fill="none"/></svg>';

        this.deleteBtn.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            if (!this.editingId) return;
            
            if (confirm('Delete this prompt?')) {
                await this.store.deletePrompt(this.editingId);
                this.close();
            }
        });

        this.area.appendChild(this.deleteBtn);
    }

    private removeDeleteButton() {
        if (this.deleteBtn) {
            this.deleteBtn.remove();
            this.deleteBtn = null;
        }
    }
    // --------------------------------

    private resetInputs() {
        if (this.inputTitle) this.inputTitle.value = '';
        if (this.inputQuick) this.inputQuick.value = '';
        if (this.inputBody) this.inputBody.value = '';
    }

    private async save() {
        const title = this.inputTitle?.value.trim();
        const text = this.inputBody?.value;
        const quick = this.inputQuick?.value.trim() || '';

        if (!title || !text) {
            // REPLACED ALERT WITH TOAST EVENT
            this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'Title and Body are required' } 
            }));
            return;
        }

        if (this.editingId) {
            await this.store.updatePrompt(this.editingId, { title, text, quick, tags: this.draftTagIds });
        } else {
            await this.store.addPrompt(title, text, quick, this.draftTagIds);
        }

        // OPTIONAL SUCCESS MESSAGE
        this.shadow.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: 'Saved' } 
        }));

        this.close();
    }
}