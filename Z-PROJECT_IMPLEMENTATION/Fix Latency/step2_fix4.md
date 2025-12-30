Fix: Robust Focus Management in TextExpander.ts
Complexity: Low
Files to Modify:
src/content/components/TextExpander.ts
Tasks:
Store the activeEl (the editor) as a class property when opening the menu.
In handleSelection, ignore document.activeElement (which might be wrong) and use the stored element.
Call el.focus() aggressively.
Update src/content/components/TextExpander.ts
Replace the class content with this updated version. (I've removed the debug logs to clean it up, but kept the logic fixes).
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
    
    // NEW: Track the target editor element specifically
    private targetEditor: HTMLElement | null = null;

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
                this.handleSelection(this.menu.getSelectedPrompt());
                return;
            }
            if (ev.key === 'Escape') {
                ev.preventDefault();
                this.closeMenu();
                // Refocus editor on escape
                if (this.targetEditor) this.targetEditor.focus();
                return;
            }
            // Close if user types space or normal char (let event propagate to type the char)
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
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.store.recordUsage(match.id);
                this.replaceText(activeEl, word, match.text);
            }
        }
    };

    private openMenu(el: HTMLElement) {
        this.targetEditor = el; // Capture the editor element
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
        // Use the captured target editor, fallback to activeElement if missing
        const el = this.targetEditor || document.activeElement as HTMLElement;
        
        if (el) {
            // Force focus back to the editor before pasting
            el.focus();
            
            // Wait 10ms for focus to settle (Fix for some React apps)
            setTimeout(() => {
               this.replaceText(el, '../', p.text); 
               this.store.recordUsage(p.id);
            }, 10);
        }
        this.closeMenu();
    }

    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);

        // 2. Insert Replacement
        
        // A. Small text? Use Native Command
        if (replacement.length < 50) {
            // execCommand requires focus
            el.focus();
            const success = document.execCommand('insertText', false, replacement);
            if (success) {
                this.triggerEvents(el);
                return;
            }
        }

        // B. Large text? Use Clipboard
        const pasteSuccess = await ClipboardInserter.insert(replacement);
        if (pasteSuccess) {
            this.triggerEvents(el);
            return;
        }

        // C. Fallback: Manual Node Insertion
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
                    // Fallback for complex nodes
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

                // Handle cases where anchor is an Element
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
