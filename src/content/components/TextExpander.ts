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
        console.log('TextExpander: Mounted.');
    }

    public destroy() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = false;
    }

    private handleOutsideClick = (ev: MouseEvent) => {
        if (this.menuOpen) {
            // Check if clicking inside the menu is handled by the menu itself
            // but for safety, we close it if the click is anywhere else.
            // Since QuickMenu is appended to shadow, we check the composed path.
            const path = (ev as any).composedPath?.() || [];
            if (!path.some((el: any) => el === (this.menu as any).el)) {
                this.closeMenu();
            }
        }
    };

    private handleKeyDown = (ev: KeyboardEvent) => {
        // --- 1. CRITICAL: SELF-DESTRUCT CHECK ---
        // If the extension has been reloaded, chrome.runtime.id might be invalid 
        // or the connection broken. We MUST stop listening to avoid ghost errors.
        try {
            if (!chrome.runtime?.id) {
                throw new Error("Extension context invalidated");
            }
        } catch (e) {
            // Context is dead. Remove listeners and stop.
            this.destroy();
            return;
        }

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
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
                return;
            }
            if (ev.key === ' ' || ev.code === 'Space') {
                this.closeMenu();
                return;
            }
            if (ev.key.length === 1) {
                this.closeMenu();
            }
        }

        // --- 2. TRIGGER CHECK ---
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

    /**
     * Replaces 'target' (the shortcut) with 'replacement' (the prompt)
     * inside the element, handling both Input and ContentEditable.
     */

// src/content/components/TextExpander.ts

    /**
     * Replaces 'target' (the shortcut) with 'replacement' (the prompt).
     * OPTIMIZED: Uses native browser commands for speed and formatting compatibility.
     */
    private replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Handle <input> and <textarea>
        // These are simple: we calculate positions and manipulate the string directly.
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;

            const replaceStart = start - target.length;

            if (replaceStart >= 0) {
                // Determine new cursor position
                const newCursorPos = replaceStart + replacement.length;

                // Native replacement (preserves Undo history in most browsers)
                // 'select' mode keeps text selected, 'end' moves cursor to end.
                // We use setRangeText to be safe, then set cursor manually.
                input.setRangeText(replacement, replaceStart, start, 'end');
                
                // Fire events so frameworks (React/Vue) detect the change
                this.triggerEvents(input);
            }
        } 
        
        // 2. Handle contentEditable (Rich Text Editors like Gmail, ChatGPT, Notion)
        else {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            
            // Step A: Remove the shortcut text ("../")
            // We adjust the range to cover the shortcut characters before the cursor
            try {
                // Move start pointer back by the length of the shortcut
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const startOffset = Math.max(0, range.startOffset - target.length);
                    range.setStart(range.startContainer, startOffset);
                    range.deleteContents();
                } else {
                    // Complex DOM case: Fallback to simple backspace simulation logic isn't possible 
                    // via API, so we rely on the user having typed it sequentially.
                    // If we can't delete cleanly, we proceed to insert anyway.
                }
            } catch (e) {
                console.warn("Could not cleanly delete shortcut text", e);
            }

            // Step B: Insert the Prompt using execCommand
            // This is the "Magic Bullet". It inserts text at the cursor position
            // and lets the browser handle formatting (newlines -> <br> or <p>).
            
            el.focus(); // Focus is required for execCommand
            
            // 'insertText' handles newlines correctly for the specific editor
            const success = document.execCommand('insertText', false, replacement);

            // Step C: Fallback for sites blocking execCommand
            if (!success) {
                // If execCommand failed, we insert a raw text node. 
                // This is faster than the previous loop but might lose newline formatting
                // depending on the editor's CSS (white-space: pre-wrap).
                const textNode = document.createTextNode(replacement);
                range.insertNode(textNode);
                
                // Move cursor to end
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
                
                this.triggerEvents(el);
            }
        }
    }





    private manualInsertFallback(el: HTMLElement, target: string, replacement: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const node = range.startContainer;

        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const offset = range.startOffset;
            const replaceStart = Math.max(0, offset - target.length);

            range.setStart(node, replaceStart);
            range.setEnd(node, offset);
            range.deleteContents();

            const lines = replacement.split(/\r?\n/);
            const fragment = document.createDocumentFragment();
            let lastNode: Node | null = null;

            lines.forEach((line, index) => {
                if (index > 0) {
                    const br = document.createElement('br');
                    fragment.appendChild(br);
                    lastNode = br;
                }
                if (line) {
                    const textNode = document.createTextNode(line);
                    fragment.appendChild(textNode);
                    lastNode = textNode;
                }
            });

            if (lastNode) {
                range.insertNode(fragment);
                range.setStartAfter(lastNode);
                range.setEndAfter(lastNode);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    /**
     * Fires input/change events to notify JS frameworks of the change.
     */
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
                const input = el as HTMLInputElement | HTMLTextAreaElement;
                const cursorPos = input.selectionStart || 0;
                const textBefore = input.value.slice(0, cursorPos);
                const match = textBefore.match(/(\S+)$/);
                return match ? match[1] : null;
            } else {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return null;
                const range = sel.getRangeAt(0);
                const node = range.startContainer;
                const offset = range.startOffset;
                if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                    const textBefore = node.textContent.slice(0, offset);
                    const match = textBefore.match(/(\S+)$/);
                    return match ? match[1] : null;
                }
            }
        } catch (e) { return null; }
        return null;
    }
}