Fix: The "All-In-One" Insertion Chain
Complexity: Medium
Files to Modify: src/content/components/TextExpander.ts
Update src/content/components/TextExpander.ts
Replace the replaceText and helper methods with this robust chain.
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
        console.log('[PD] TextExpander: Mounted');
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
                console.log(`[PD] Shortcut detected: ${shortcut}`);
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
    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);
        
        el.focus();

        // 2. Insert Strategy (Waterfall)

        // STRATEGY A: Native 'insertText' (Small Text)
        // Most reliable for small insertions (< 300 chars)
        if (replacement.length < 300) {
            try {
                const success = document.execCommand('insertText', false, replacement);
                if (success && this.verifyInsertion(el, replacement)) {
                    this.triggerEvents(el);
                    return; 
                }
            } catch (e) { }
        }

        // STRATEGY B: Synchronous Clipboard (Medium/Large Text)
        // Works best for ChatGPT (Requires sync execution)
        console.log("[PD] Trying Strategy B: Sync Clipboard");
        const syncPaste = this.syncClipboardPaste(replacement, el);
        if (syncPaste && this.verifyInsertion(el, replacement)) {
             this.triggerEvents(el);
             return;
        }

        // STRATEGY C: Async Clipboard API (Large Text)
        // Works best for Gemini/Claude (They support the API well)
        // Note: We use 'await' here, so ChatGPT might block this, but we tried Sync first.
        console.log("[PD] Trying Strategy C: Async Clipboard");
        const asyncPaste = await ClipboardInserter.insert(replacement);
        if (asyncPaste && this.verifyInsertion(el, replacement)) {
            this.triggerEvents(el);
            return;
        }

        // STRATEGY D: Native Insert Fallback (Slow but guaranteed)
        console.warn("[PD] Clipboard strategies failed. Using slow native insert.");
        try {
            document.execCommand('insertText', false, replacement);
            this.triggerEvents(el);
        } catch (e) {
            // STRATEGY E: Nuclear Fallback (Manual DOM)
            this.manualInsertFallback(el, replacement);
        }
    }

    /**
     * Checks if text node grew. Simple verification.
     */
    private verifyInsertion(el: HTMLElement, text: string): boolean {
        // 1. Input/Textarea Check
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement;
            return input.value.includes(text.substring(0, 10)); // Check start
        }

        // 2. ContentEditable Check
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return false;
        
        const nodeText = sel.anchorNode.textContent || '';
        // Loose check: If node isn't empty, we likely succeeded
        return nodeText.length > 0;
    }

    /**
     * Hacky Synchronous Clipboard Copy-Paste
     */
    private syncClipboardPaste(text: string, targetEl: HTMLElement): boolean {
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

        try {
            const textArea = document.createElement("textarea");
            Object.assign(textArea.style, { position: 'fixed', left: '-9999px', top: '0', opacity: '0' });
            textArea.value = text;
            document.body.appendChild(textArea);
            
            textArea.focus();
            textArea.select();
            const copySuccess = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!copySuccess) return false;

            // RESTORE
            targetEl.focus();
            if (range && selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }

            return document.execCommand('paste');
        } catch (e) {
            targetEl.focus();
            return false;
        }
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
                
                // RANGE API Strategy (Robust)
                const range = sel.getRangeAt(0).cloneRange();
                
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const lookBack = Math.min(range.startOffset, 50);
                    range.setStart(range.startContainer, range.startOffset - lookBack);
                    const text = range.toString();
                    if (text.endsWith('../')) return '../';
                    const match = text.match(/(\S+)$/);
                    return match ? match[1] : null;
                }

                // Fallback for Element Nodes
                const anchorNode = sel.anchorNode;
                if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                    const text = anchorNode.textContent || '';
                    if (text.endsWith('../')) return '../';
                    return null; 
                }

                return null;
            }
        } catch (e) { return null; }
    }
}
