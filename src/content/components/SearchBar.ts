import { Component } from './Component';

export class SearchBar extends Component {
    private container: HTMLElement | null = null;
    private input: HTMLInputElement | null = null;

    mount(parent: HTMLElement) {
        this.container = parent.querySelector('#search-container');
        if (!this.container) return;

        this.container.innerHTML = '';

        const wrapper = this.el('div', 'search-wrapper');

        // New SVG Icon
        const icon = this.el('div', 'search-icon');
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        this.input = this.el('input', 'search-input') as HTMLInputElement;
        this.input.type = 'text';
        this.input.placeholder = 'Type to search...';
        this.input.id = 'search-input';
        this.input.setAttribute('autocomplete', 'off');

        this.input.addEventListener('input', () => {
            this.store.setFilter(this.input!.value);
            this.shadow.dispatchEvent(new CustomEvent('nav-reset'));
        });

        // Keep nav keys
        this.input.addEventListener('keydown', (ev) => {
            if (ev.key === 'ArrowDown') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-next')); }
            else if (ev.key === 'ArrowUp') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-prev')); }
            else if (ev.key === 'Enter') { ev.preventDefault(); this.shadow.dispatchEvent(new CustomEvent('nav-copy')); }
        });

        this.input.value = this.store.filterText;

        wrapper.appendChild(icon);
        wrapper.appendChild(this.input);
        this.container.appendChild(wrapper);

        this.store.subscribe('filter_updated', () => {
            if (this.input && this.input.value !== this.store.filterText) {
                this.input.value = this.store.filterText;
            }
        });
    }
}