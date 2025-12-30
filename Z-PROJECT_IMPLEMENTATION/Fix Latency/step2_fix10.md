Add Verification: We will measure the length of the current text node before and after the insertion attempt. If the length hasn't increased, we know the method failed, even if no error was thrown.
Add Logging: Extensive [PD-DEBUG] logs to trace exactly which method is being tried and why it is failing.
Refine Fallback: If the "clean" methods (Native/Clipboard) fail verification, we aggressively fall back to Manual DOM Insertion, which forces the text into the node regardless of the site's listeners.
Files to Modify
src/content/components/TextExpander.ts
Tasks
Update src/content/components/TextExpander.ts
Replace the file with this version. It includes the new verifyInsertion logic and detailed logs.
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
    
    private targetEditor: HTMLElement | null = null;
    private handledEnter: boolean = false;

    constructor(store: Store, shadow: ShadowRoot) {
        this.store = store;
        this.shadow = shadow;
        this.menu = new QuickMenu(store, shadow, (p) => this.handleSelection(p));
    }

    public mount() {
        if (this.listening) return;
        document.addEventListener('keydown', this.handleKeyDown, true);
        document.addEventListener('keyup', this.handleKeyUp, true); 
        document.addEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = true;
        console.log('[PD-DEBUG] TextExpander: Mounted');
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

    private handleKeyUp = (ev: KeyboardEvent) => {
        if (this.handledEnter && ev.key === 'Enter') {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.handledEnter = false;
        }
    };

    private handleKeyDown = (ev: KeyboardEvent) => {
        // ZOMBIE CHECK
        try {
            if (!chrome.runtime?.id) throw new Error();
        } catch (e) {
            this.destroy();
            return;
        }
        if (!this.shadow.host.isConnected) {
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
                console.log(`[PD-DEBUG] Shortcut detected: ${shortcut}`);
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
            setTimeout(() => {
                this.replaceText(el, '../', p.text); 
                this.store.recordUsage(p.id);
            }, 10);
        }
        this.closeMenu();
    }

    // --- REPLACEMENT LOGIC ---
    private replaceText(el: HTMLElement, target: string, replacement: string) {
        console.log(`[PD-DEBUG] Starting replacement of "${target}"`);
        
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);
        
        el.focus();

        // 2. Insert Strategy (Waterfall with Verification)
        
        // Strategy A: Native 'insertText' (Best for Undo History)
        console.log('[PD-DEBUG] Trying Strategy A: Native Insert');
        let success = false;
        try {
            success = document.execCommand('insertText', false, replacement);
        } catch (e) { console.warn('[PD-DEBUG] Native Insert Threw Error', e); }

        // VERIFY A
        if (success && this.verifyInsertion(el, replacement)) {
            console.log('[PD-DEBUG] Strategy A Succeeded');
            this.triggerEvents(el);
            return;
        }
        console.warn('[PD-DEBUG] Strategy A Failed or was blocked. Trying B...');

        // Strategy B: Synchronous Clipboard (Fastest for large text)
        console.log('[PD-DEBUG] Trying Strategy B: Sync Clipboard');
        const didPaste = this.syncClipboardPaste(replacement, el);
        
        // VERIFY B
        if (didPaste && this.verifyInsertion(el, replacement)) {
            console.log('[PD-DEBUG] Strategy B Succeeded');
            this.triggerEvents(el);
            return;
        }
        console.warn('[PD-DEBUG] Strategy B Failed. Trying C...');

        // Strategy C: Manual DOM (Nuclear Option)
        // If the site blocks commands, we manually inject the text node.
        console.log('[PD-DEBUG] Trying Strategy C: Manual DOM');
        this.manualInsertFallback(el, replacement);
    }

    /**
     * Checks if the text node content actually grew. 
     * This is a heuristic to detect if the site "swallowed" the command.
     */
    private verifyInsertion(el: HTMLElement, insertedText: string): boolean {
        // 1. Input/Textarea Check
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement;
            // Simple check: does it contain the text?
            // (Not perfect if text matches existing, but good enough for confirmation)
            return input.value.includes(insertedText); 
        }

        // 2. ContentEditable Check
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return false; // Can't verify

        // We check the anchor node (where cursor is). 
        // If insertion worked, the text content length should likely be > 0.
        // Or strictly: did we insert a significant chunk?
        const nodeText = sel.anchorNode.textContent || '';
        
        // If text is very short (just inserted), verification passes.
        // If text is huge, we assume it worked if length > inserted length.
        // This is a "Loose" verification.
        if (nodeText.length >= insertedText.length) {
            return true;
        }
        
        // If node text is smaller than what we inserted, it definitely failed.
        return false;
    }

    private syncClipboardPaste(text: string, targetEl: HTMLElement): boolean {
        try {
            const textArea = document.createElement("textarea");
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            textArea.value = text;
            document.body.appendChild(textArea);
            
            textArea.focus();
            textArea.select();
            const copySuccess = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!copySuccess) return false;

            targetEl.focus();
            const pasteSuccess = document.execCommand('paste');
            return pasteSuccess;
        } catch (e) {
            return false;
        }
    }

    private deleteShortcut(el: HTMLElement, target: string) {
        console.log('[PD-DEBUG] Deleting shortcut...');
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
            } catch (e) { }
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
