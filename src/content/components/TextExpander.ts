// src/content/components/TextExpander.ts
import { Store, Prompt } from '../store';

export class TextExpander {
    private store: Store;
    private listening: boolean = false;

    constructor(store: Store) {
        this.store = store;
    }

    public mount() {
        if (this.listening) return;
        document.addEventListener('keydown', this.handleKeyDown, true);
        this.listening = true;
        console.log('TextExpander: Mounted.');
    }

    public destroy() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
        this.listening = false;
    }

    private handleKeyDown = (ev: KeyboardEvent) => {
        // --- 1. SELF-DESTRUCT CHECK (Fixes duplicate logs during dev) ---
        // If the extension context is invalidated (reloaded), stop listening.
        try {
            if (!chrome.runtime.id) throw new Error();
        } catch (e) {
            this.destroy();
            return;
        }

        // --- 2. TRIGGER CHECK ---
        // Only trigger on Space
        if (ev.key !== ' ' && ev.code !== 'Space') return;

        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return;

        // Check if editable
        const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
        const isContentEditable = activeEl.isContentEditable;
        if (!isInput && !isContentEditable) return;

        // --- 3. GET WORD ---
        const word = this.getWordBeforeCaret(activeEl);
        if (!word) return;

        const shortcut = word;

        // --- 4. FIND MATCH ---
        // Search the store for a prompt with this quick code
        const match = this.store.prompts.find(p => p.quick === shortcut);

        if (match) {
            console.log(`TextExpander: Expanding ".${shortcut}"`);

            // Prevent the Space from being typed
            ev.preventDefault();
            ev.stopImmediatePropagation();

            // Perform Replacement
            this.replaceText(activeEl, word, match.text);
        }
    };

    /**
     * Replaces 'target' (the shortcut) with 'replacement' (the prompt)
     * inside the element, handling both Input and ContentEditable.
     */
    private replaceText(el: HTMLElement, target: string, replacement: string) {
        // A. Handle <input> / <textarea>
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;

            // Calculate where the shortcut starts
            // (Assumes the cursor is immediately after the shortcut)
            const replaceStart = start - target.length;

            if (replaceStart >= 0) {
                // Use setRangeText to preserve undo history in some browsers
                input.setRangeText(replacement, replaceStart, start, 'end');

                // Critical: Fire events so frameworks (React/Angular) detect change
                this.triggerEvents(input);
            }
        }
        // B. Handle ContentEditable (Divs, Rich Text)
        else {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            const node = range.startContainer; // The text node we are in

            // We need to operate on the text node data
            if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                const text = node.textContent;
                const offset = range.startOffset;
                const replaceStart = offset - target.length;

                if (replaceStart >= 0) {
                    // 1. Delete the shortcut text
                    range.setStart(node, replaceStart);
                    range.setEnd(node, offset);
                    range.deleteContents();

                    // 2. Insert the new text handling newlines
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

                    // 3. Insert and position caret
                    if (lastNode) {
                        range.insertNode(fragment);
                        range.setStartAfter(lastNode);
                        range.setEndAfter(lastNode);
                    } else {
                        // Edge case: empty replacement
                        range.collapse(true);
                    }

                    sel.removeAllRanges();
                    sel.addRange(range);

                    // Critical: Fire events
                    this.triggerEvents(el);
                }
            }
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