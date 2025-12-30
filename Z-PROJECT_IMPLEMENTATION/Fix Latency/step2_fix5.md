Phase 3: The Fix Implementation
We will modify TextExpander.ts to handle both issues.
Files to Modify:
src/content/components/TextExpander.ts
Tasks
Update src/content/components/TextExpander.ts
Replace the entire file with this version.
Key Changes:
Added handleKeyUp: Captures and kills Enter events to prevent NotebookLM submission.
Refactored replaceText: Moves execCommand('insertText') to the top. It attempts this first for everything. This solves the ChatGPT issue because it runs synchronously on the main thread while the User Token is active.
code
TypeScript
// src/content/components/TextExpander.ts
import { Store, Prompt } from '../store';
import { CaretLocator } from '../utils/CaretLocator';
import { QuickMenu } from './QuickMenu';
import { ClipboardInserter } from '../utils/ClipboardInserter';

export class TextExpander {
    private store: Store;
    private shadow: ShadowRoot;
    private menu: QuickMenu;
    private listening: boolean = false;
    private menuOpen: boolean = false;
    
    // Track the target editor element
    private targetEditor: HTMLElement | null = null;
    // Track if we just handled an Enter key to block the subsequent KeyUp
    private handledEnter: boolean = false;

    constructor(store: Store, shadow: ShadowRoot) {
        this.store = store;
        this.shadow = shadow;
        this.menu = new QuickMenu(store, shadow, (p) => this.handleSelection(p));
    }

    public mount() {
        if (this.listening) return;
        // Capture Phase (true) is crucial to intercept before the website does
        document.addEventListener('keydown', this.handleKeyDown, true);
        document.addEventListener('keyup', this.handleKeyUp, true); 
        document.addEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = true;
    }

    public destroy() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('keyup', this.handleKeyUp, true);
        document.removeEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = false;
    }

    private handleOutsideClick = (ev: MouseEvent) => {
        if (this.menuOpen) {
            const path = (ev as any).composedPath?.() || [];
            if (!path.some((el: any) => el === (this.menu as any).el)) {
                this.closeMenu();
            }
        }
    };

    // --- FIX A: BLOCK KEYUP (NotebookLM Fix) ---
    private handleKeyUp = (ev: KeyboardEvent) => {
        if (this.handledEnter && ev.key === 'Enter') {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.handledEnter = false; // Reset
        }
    };

    private handleKeyDown = (ev: KeyboardEvent) => {
        try {
            if (!chrome.runtime?.id) throw new Error();
        } catch (e) {
            this.destroy();
            return;
        }

        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return;

        // --- MENU NAVIGATION ---
        if (this.menuOpen) {
            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.menu.moveSelection('down');
                return;
            }
            if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.menu.moveSelection('up');
                return;
            }
            if (ev.key === 'Enter' || ev.key === 'Tab') {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                
                // Flag this so KeyUp listener knows to kill it too
                if (ev.key === 'Enter') this.handledEnter = true;

                this.handleSelection(this.menu.getSelectedPrompt());
                return;
            }
            if (ev.key === 'Escape') {
                ev.preventDefault();
                this.closeMenu();
                if (this.targetEditor) this.targetEditor.focus();
                return;
            }
            if (ev.key.length === 1) {
                this.closeMenu();
            }
        }

        // --- TRIGGER DETECTION ---
        if (ev.key === ' ' || ev.code === 'Space') {
            const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
            const isContentEditable = activeEl.isContentEditable;
            if (!isInput && !isContentEditable) return;

            const word = this.getWordBeforeCaret(activeEl);
            if (!word) return;

            if (word === '../') { 
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.openMenu(activeEl);
                return;
            }

            const shortcut = word;
            const match = this.store.prompts.find(p => p.quick === shortcut);

            if (match) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.store.recordUsage(match.id);
                this.replaceText(activeEl, word, match.text);
            }
        }
    };

    private openMenu(el: HTMLElement) {
        this.targetEditor = el;
        const coords = CaretLocator.getCaretCoords(el);
        this.menu.open(coords);
        this.menuOpen = true;
    }

    private closeMenu() {
        this.menu.close();
        this.menuOpen = false;
        this.targetEditor = null;
    }

    private handleSelection(p: Prompt) {
        const el = this.targetEditor || document.activeElement as HTMLElement;
        
        if (el) {
            el.focus();
            
            // Immediate insertion for synchronous reliability
            this.replaceText(el, '../', p.text); 
            this.store.recordUsage(p.id);
        }
        this.closeMenu();
    }

    // --- FIX B: SYNCHRONOUS INSERTION (ChatGPT Fix) ---
    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);

        el.focus();

        // 2. PRIMARY STRATEGY: Native InsertText (Synchronous)
        // This preserves the User Interaction Token required by ChatGPT/Browsers.
        // Even for large text, this is usually preferred over losing the token.
        try {
            const success = document.execCommand('insertText', false, replacement);
            if (success) {
                this.triggerEvents(el);
                return; // Done!
            }
        } catch (e) {
            // Ignore error and fall through to backup strategies
        }

        // 3. BACKUP STRATEGY: Clipboard API (Async)
        // Only if native insert failed (rare).
        const pasteSuccess = await ClipboardInserter.insert(replacement);
        if (pasteSuccess) {
            this.triggerEvents(el);
            return;
        }

        // 4. LAST RESORT: Manual DOM
        this.manualInsertFallback(el, replacement);
    }

    private deleteShortcut(el: HTMLElement, target: string) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement;
            const start = input.selectionStart || 0;
            const replaceStart = Math.max(0, start - target.length);
            input.setRangeText('', replaceStart, start, 'end');
        } else {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            
            try {
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const startOffset = Math.max(0, range.startOffset - target.length);
                    range.setStart(range.startContainer, startOffset);
                    range.deleteContents();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    for(let i=0; i<target.length; i++) {
                        document.execCommand('delete');
                    }
                }
            } catch (e) {
                console.warn("Clean deletion failed", e);
            }
        }
    }

    private manualInsertFallback(el: HTMLElement, replacement: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        
        const textNode = document.createTextNode(replacement);
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        
        this.triggerEvents(el);
    }

    private triggerEvents(el: HTMLElement) {
        const eventTypes = ['input', 'change'];
        for (const type of eventTypes) {
            const ev = new Event(type, { bubbles: true, cancelable: true });
            el.dispatchEvent(ev);
        }
    }

    private getWordBeforeCaret(el: HTMLElement): string | null {
        try {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const input = el as HTMLInputElement;
                const cursorPos = input.selectionStart || 0;
                const textBefore = input.value.slice(0, cursorPos);
                
                if (textBefore.endsWith('../')) return '../';
                const match = textBefore.match(/(\S+)$/);
                return match ? match[1] : null;
            } 
            else {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return null;
                
                let anchorNode = sel.anchorNode;
                let offset = sel.anchorOffset;

                if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                    const text = anchorNode.textContent || '';
                    if (text.endsWith('../')) return '../';
                    return null; 
                }

                if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) return null;

                const text = anchorNode.textContent || '';
                const textBefore = text.slice(0, offset);

                if (textBefore.endsWith('../')) return '../';

                const match = textBefore.match(/(\S+)$/);
                return match ? match[1] : null;
            }
        } catch (e) { return null; }
    }
}
