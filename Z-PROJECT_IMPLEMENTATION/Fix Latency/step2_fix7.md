Step 1: Update src/content/components/TextExpander.ts
Replace the entire file with this code. It includes the new synchronous copy-paste logic inside replaceText.
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
            // Use timeout to allow focus to settle on complex frameworks
            setTimeout(() => {
                this.replaceText(el, '../', p.text); 
                this.store.recordUsage(p.id);
            }, 10);
        }
        this.closeMenu();
    }

    // --- REPLACEMENT LOGIC ---
    private replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);
        
        el.focus();

        // 2. Insert Strategy (Synchronous)
        
        // A. Use Native 'insertText' for short/medium text (Most Reliable)
        // Raised limit to 600 chars as native is usually fine up to that.
        if (replacement.length < 600) {
            try {
                const success = document.execCommand('insertText', false, replacement);
                if (success) {
                    this.triggerEvents(el);
                    return; 
                }
            } catch (e) { }
        }

        // B. Use Synchronous Copy-Paste for Large Text (Fastest)
        // This avoids the 'await' issue that broke ChatGPT.
        const didPaste = this.syncClipboardPaste(replacement);
        if (didPaste) {
            this.triggerEvents(el);
            return;
        }

        // C. Fallback: Native Insert again (if paste failed)
        try {
            document.execCommand('insertText', false, replacement);
            this.triggerEvents(el);
        } catch (e) {
            // D. Nuclear Fallback: Manual DOM
            this.manualInsertFallback(el, replacement);
        }
    }

    /**
     * Hacks the clipboard synchronously to paste text instantly.
     * Required because 'execCommand' only works during the user event loop.
     */
    private syncClipboardPaste(text: string): boolean {
        try {
            // 1. Create hidden textarea to hold text
            const textArea = document.createElement("textarea");
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            
            textArea.value = text;
            textArea.select();
            
            // 2. Copy to clipboard (Synchronous)
            const copySuccess = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!copySuccess) return false;

            // 3. Paste into target (Synchronous)
            const pasteSuccess = document.execCommand('paste');
            return pasteSuccess;
        } catch (e) {
            console.warn("Sync paste failed", e);
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
                
                const anchorNode = sel.anchorNode;
                const offset = sel.anchorOffset;

                // 1. Handle Text Node (Standard)
                if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
                    const text = anchorNode.textContent || '';
                    const textBefore = text.slice(0, offset);
                    
                    if (textBefore.endsWith('../')) return '../';
                    const match = textBefore.match(/(\S+)$/);
                    return match ? match[1] : null;
                }

                // 2. Handle Element Node (Fallback for empty lines or weird editors)
                // If cursor is inside a <div> or <p> directly
                if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                    // Try to get text content of the element itself
                    // This is aggressive but necessary for some empty states
                    const text = anchorNode.textContent || '';
                    if (text.endsWith('../')) return '../';
                    
                    // Also check children if offset points to a specific node
                    if (offset > 0) {
                        const child = anchorNode.childNodes[offset - 1];
                        if (child && child.textContent?.endsWith('../')) return '../';
                    }
                }
                return null;
            }
        } catch (e) { return null; }
    }
}
