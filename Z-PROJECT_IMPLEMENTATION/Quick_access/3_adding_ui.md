Step 03 & 04: Floating QuickMenu & Integration
Objective: Create the floating dropdown component and modify the TextExpander to detect ../, calculate the position, and show the menu.
Files to Modify:
New File: src/content/components/QuickMenu.ts
src/content/components/TextExpander.ts
src/content/components/App.ts
1. Create the QuickMenu Component
Create src/content/components/QuickMenu.ts. This component will handle the floating UI and keyboard navigation within the recents list.
code
TypeScript
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
                justifyContent: 'space-between',
                background: i === this.selectedIndex ? 'var(--accent, #3b82f6)' : 'transparent',
                color: i === this.selectedIndex ? '#fff' : 'inherit'
            });

            const title = document.createElement('span');
            title.textContent = p.title;
            
            const num = document.createElement('span');
            num.textContent = `${i + 1}`;
            num.style.opacity = '0.5';
            num.style.fontSize = '10px';

            item.appendChild(title);
            item.appendChild(num);
            
            item.onclick = () => this.onSelect(p);
            this.el.appendChild(item);
        });
    }
}
2. Update the TextExpander logic
Modify src/content/components/TextExpander.ts to handle the trigger ../ and control the QuickMenu.
code
TypeScript
// src/content/components/TextExpander.ts
import { Store, Prompt } from '../store';
import { CaretLocator } from '../utils/CaretLocator';
import { QuickMenu } from './QuickMenu';

export class TextExpander {
    private store: Store;
    private shadow: ShadowRoot;
    private menu: QuickMenu;
    private listening: boolean = false;
    private menuOpen: boolean = false;

    constructor(store: Store, shadow: ShadowRoot) {
        this.store = store;
        this.shadow = shadow;
        this.menu = new QuickMenu(store, shadow, (p) => this.handleSelection(p));
    }

    public mount() {
        if (this.listening) return;
        document.addEventListener('keydown', this.handleKeyDown, true);
        document.addEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = true;
    }

    private handleOutsideClick = (ev: MouseEvent) => {
        if (this.menuOpen) this.closeMenu();
    };

    private handleKeyDown = (ev: KeyboardEvent) => {
        // ... (Existing self-destruct check)

        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return;

        // 1. Handle Navigation when menu is open
        if (this.menuOpen) {
            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                this.menu.moveSelection('down');
                return;
            }
            if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                this.menu.moveSelection('up');
                return;
            }
            if (ev.key === 'Enter') {
                ev.preventDefault();
                this.handleSelection(this.menu.getSelectedPrompt());
                return;
            }
            if (ev.key === 'Escape' || ev.key === 'Backspace') {
                this.closeMenu();
                return;
            }
            // Close menu if user continues typing anything else
            if (ev.key.length === 1 && ev.key !== ' ') {
                this.closeMenu();
            }
        }

        // 2. Standard Shortcut Expansion (existing logic)
        if (ev.key === ' ') {
            const word = this.getWordBeforeCaret(activeEl);
            if (word === '../') { // TRIGGER DETECTED
                ev.preventDefault();
                this.openMenu(activeEl);
                return;
            }
            
            // Handle existing quick shortcuts
            const match = this.store.prompts.find(p => p.quick === word);
            if (match) {
                ev.preventDefault();
                this.store.recordUsage(match.id);
                this.replaceText(activeEl, word, match.text);
            }
        }
    };

    private openMenu(el: HTMLElement) {
        const coords = CaretLocator.getCaretCoords(el);
        this.menu.open(coords);
        this.menuOpen = true;
    }

    private closeMenu() {
        this.menu.close();
        this.menuOpen = false;
    }

    private handleSelection(p: Prompt) {
        const activeEl = document.activeElement as HTMLElement;
        if (activeEl) {
            this.replaceText(activeEl, '../', p.text); // Replace the trigger
            this.store.recordUsage(p.id);
        }
        this.closeMenu();
    }

    // ... (Keep existing replaceText, triggerEvents, and getWordBeforeCaret methods)
}
3. Update App.ts Mounting
Make sure the TextExpander is correctly mounted with the shadow root.
code
TypeScript
// src/content/main.ts -> Ensure this change
const expander = new TextExpander(store, shadow); // Pass shadow root
expander.mount();
