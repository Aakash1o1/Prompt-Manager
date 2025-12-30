Steps to Fix
Fix manualInsertFallback: Removed the duplicate deletion logic. It now strictly inserts text at the current cursor position.
Fix Focus: Added el.focus() before insertion commands to ensure the browser knows where to type.
Improve Detection: Updated getWordBeforeCaret to handle cases where the cursor is reported on the Element rather than the Text Node (common in empty lines or specific editors).
Update: src/content/components/TextExpander.ts
Replace the entire file with this version:
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
        console.log('TextExpander: Mounted (Optimized).');
    }

    public destroy() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
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

    private handleKeyDown = (ev: KeyboardEvent) => {
        try {
            if (!chrome.runtime?.id) throw new Error("Extension context invalidated");
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
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
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

            // Trigger: "../"
            if (word === '../') { 
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.openMenu(activeEl);
                return;
            }

            // Trigger: Standard Shortcut
            const shortcut = word;
            const match = this.store.prompts.find(p => p.quick === shortcut);

            if (match) {
                console.log(`Expanding shortcut: ${shortcut}`);
                ev.preventDefault();
                ev.stopImmediatePropagation();
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
            // Need to pass '../' manually as target since 'getWordBeforeCaret' isn't called on click
            this.replaceText(activeEl, '../', p.text); 
            this.store.recordUsage(p.id);
        }
        this.closeMenu();
    }

    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete the shortcut text first
        this.deleteShortcut(el, target);

        // Ensure element is refocused for insertion
        el.focus();

        // 2. Insert Replacement
        
        // A. Small text? Use Native Command (Fastest for small edits)
        if (replacement.length < 50) {
            const success = document.execCommand('insertText', false, replacement);
            if (success) {
                this.triggerEvents(el);
                return;
            }
        }

        // B. Large text? Use Clipboard (Fastest for bulk, handles formatting)
        const pasteSuccess = await ClipboardInserter.insert(replacement);
        if (pasteSuccess) {
            this.triggerEvents(el);
            return;
        }

        // C. Fallback: Manual Node Insertion (Robust fallback)
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
                    
                    // Critical: Update selection to collapsed point so subsequent insert works
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    // Fallback for complex nodes: simple backspace simulation
                    for(let i=0; i<target.length; i++) {
                        document.execCommand('delete');
                    }
                }
            } catch (e) {
                console.warn("Clean deletion failed", e);
            }
        }
    }

    // FIX: Simplified fallback that ONLY inserts (does not try to delete again)
    private manualInsertFallback(el: HTMLElement, replacement: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        
        // Insert raw text node
        const textNode = document.createTextNode(replacement);
        range.insertNode(textNode);
        
        // Move cursor to end of insertion
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

                // FIX: Handle cases where anchor is an Element (e.g. empty line <div><br></div>)
                // If anchor is element, offset is child index. We try to find the text node before it.
                if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                    // Try to grab text content of the element as fallback
                    // This is less precise but works for "start of line" triggers
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
