import { Component } from './Component';

export class SearchBar extends Component {
    private input: HTMLInputElement | null = null;
    private addBtn: HTMLButtonElement | null = null;
    private tagsBtn: HTMLButtonElement | null = null;
    private settingsBtn: HTMLButtonElement | null = null;
    private closeBtn: HTMLButtonElement | null = null;
    private newFolderBtn: HTMLButtonElement | null = null;

    mount(parent: HTMLElement) {
        this.input = parent.querySelector('#search-input');
        this.addBtn = parent.querySelector('#add-btn');
        this.tagsBtn = parent.querySelector('#tags-btn');
        this.settingsBtn = parent.querySelector('#settings-btn');
        this.closeBtn = parent.querySelector('#close-btn');
        this.newFolderBtn = parent.querySelector('#new-folder-btn');

        if (this.input) {
            // --- UPDATED INPUT LISTENER ---
            this.input.addEventListener('input', () => {
                this.store.setFilter(this.input!.value);
                // Reset to top result on new search so selection doesn't get lost
                this.shadow.dispatchEvent(new CustomEvent('nav-reset'));
            });

            // --- ADDED KEYDOWN LISTENER ---
            this.input.addEventListener('keydown', (ev) => {
                if (ev.key === 'ArrowDown') {
                    ev.preventDefault();
                    this.shadow.dispatchEvent(new CustomEvent('nav-next'));
                } else if (ev.key === 'ArrowUp') {
                    ev.preventDefault();
                    this.shadow.dispatchEvent(new CustomEvent('nav-prev'));
                } else if (ev.key === 'Enter') {
                    ev.preventDefault();
                    this.shadow.dispatchEvent(new CustomEvent('nav-copy'));
                } else if (ev.key === 'Escape') {
                    // We let the global listener handle closing the panel, 
                    // but we might want to ensure we don't trigger other things.
                }
            });
            // ------------------------------

            // Restore filter if store has it (e.g. after re-render)
            this.input.value = this.store.filterText;
        }

        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('open-add-mode'));
            });
        }

        if (this.tagsBtn) {
            this.tagsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shadow.dispatchEvent(new CustomEvent('toggle-tags-dropdown'));
            });
        }

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('open-settings'));
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.shadow.dispatchEvent(new CustomEvent('close-panel'));
            });
        }

        if (this.newFolderBtn) {
            this.newFolderBtn.addEventListener('click', async () => {
                const name = prompt("Enter folder name:");
                if (name && name.trim()) {
                    await this.store.addFolder(name.trim(), null); // Null = Root
                }
            });
        }

        // Subscribe to store to update UI if needed (e.g. clear search)
        this.store.subscribe('filter_updated', () => {
            if (this.input && this.input.value !== this.store.filterText) {
                this.input.value = this.store.filterText;
            }
            // Update tags button active state
            if (this.tagsBtn) {
                if (this.store.selectedTagIds.length > 0) this.tagsBtn.classList.add('active');
                else this.tagsBtn.classList.remove('active');
            }
        });
    }
}