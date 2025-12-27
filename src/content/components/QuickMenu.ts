// src/content/components/QuickMenu.ts
import { Store, Prompt } from '../store';
import { CaretCoords } from '../utils/CaretLocator';

export class QuickMenu {
    private el: HTMLElement;
    private store: Store;
    private prompts: Prompt[] = [];
    private selectedIndex: number = 0;
    private onSelect: (p: Prompt) => void;
    private shadow: ShadowRoot;

    constructor(store: Store, shadow: ShadowRoot, onSelect: (p: Prompt) => void) {
        this.store = store;
        this.shadow = shadow;
        this.onSelect = onSelect;
        this.el = document.createElement('div');
        this.setupStyles();
    }

    private setupStyles() {
        Object.assign(this.el.style, {
            position: 'fixed',
            zIndex: '2147483647',
            background: 'var(--bg-panel, #18181b)',
            border: '1px solid var(--border-default, #3f3f46)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            padding: '4px',
            display: 'none',
            flexDirection: 'column',
            minWidth: '200px',
            color: 'var(--txt-primary, #fafafa)',
            fontFamily: 'sans-serif'
        });
    }

    public open(coords: CaretCoords) {
        this.prompts = this.store.getRecentPrompts();
        if (this.prompts.length === 0) return;

        this.selectedIndex = 0;
        this.render();
        
        // Append to shadow host instead of body to keep styling context
        this.shadow.appendChild(this.el);
        this.el.style.display = 'flex';

        // Smart Positioning (Check if there's space below)
        const menuHeight = this.el.offsetHeight || 160;
        const spaceBelow = window.innerHeight - (coords.y - window.scrollY);
        
        this.el.style.left = `${coords.x}px`;
        if (spaceBelow < menuHeight + 20) {
            // Show above the cursor
            this.el.style.top = `${coords.y - menuHeight - 5}px`;
        } else {
            // Show below the cursor
            this.el.style.top = `${coords.y + coords.lineHeight + 5}px`;
        }
    }

    public close() {
        this.el.style.display = 'none';
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    public moveSelection(dir: 'up' | 'down') {
        if (dir === 'up') {
            this.selectedIndex = (this.selectedIndex - 1 + this.prompts.length) % this.prompts.length;
        } else {
            this.selectedIndex = (this.selectedIndex + 1) % this.prompts.length;
        }
        this.render();
    }

    public getSelectedPrompt(): Prompt {
        return this.prompts[this.selectedIndex];
    }

    private render() {
        this.el.innerHTML = '';
        this.prompts.forEach((p, i) => {
            const item = document.createElement('div');
            Object.assign(item.style, {
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center', // Align icon and text
                justifyContent: 'space-between',
                gap: '8px', // Space between title/icon
                background: i === this.selectedIndex ? 'var(--accent, #3b82f6)' : 'transparent',
                color: i === this.selectedIndex ? '#fff' : 'inherit'
            });

            // Left container for Icon + Title
            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '8px';
            left.style.overflow = 'hidden';

            // 1. Render Pin Icon if pinned
            if (p.isPinned) {
                const pinIcon = document.createElement('span');
                // Small pushpin SVG
                pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
                pinIcon.style.display = 'flex';
                pinIcon.style.opacity = i === this.selectedIndex ? '1' : '0.7'; // Dim slightly if not selected
                left.appendChild(pinIcon);
            }

            const title = document.createElement('span');
            title.textContent = p.title;
            title.style.whiteSpace = 'nowrap';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.style.maxWidth = '250px'; // Prevent super wide menu

            left.appendChild(title);
            item.appendChild(left);
            
            // 2. Shortcut hint on right
            if (p.quick) {
                const sc = document.createElement('span');
                sc.textContent = p.quick;
                sc.style.opacity = '0.5';
                sc.style.fontSize = '10px';
                sc.style.fontFamily = 'monospace';
                item.appendChild(sc);
            }
            
            item.onclick = (e) => {
                e.stopPropagation(); // Prevent document click from closing immediately
                this.onSelect(p);
            };
            this.el.appendChild(item);
        });
    }
}
