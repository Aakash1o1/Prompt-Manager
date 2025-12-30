Step 2: Optimized Logic Core (TextExpander)
Objective:
Fix Read Lag: Detect triggers by reading only the current text node (Anchor Node) instead of the entire document.
Fix Write Lag: Implement the "Waterfall Strategy" for insertion (Native for short text, Clipboard for long text).
Complexity: MEDIUM
Files to Modify:
src/content/components/TextExpander.ts
Tasks:
Update src/content/components/TextExpander.ts
Replace the entire file with this optimized version.
Key Changes:
Import: Added ClipboardInserter.
replaceText: Now async. Implements deletion before insertion. Uses Clipboard for texts > 50 chars.
getWordBeforeCaret: completely rewritten for ContentEditable to use sel.anchorNode (Fast) instead of textContent (Slow).
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
        // --- 1. CRITICAL: SELF-DESTRUCT CHECK ---
        try {
            if (!chrome.runtime?.id) throw new Error("Extension context invalidated");
        } catch (e) {
            this.destroy();
            return;
        }

        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return;

        // --- 2. MENU NAVIGATION ---
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
            // Close if user types space or normal char
            if (ev.key.length === 1) {
                this.closeMenu();
            }
        }

        // --- 3. TRIGGER DETECTION (Space) ---
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
                // Call async replacement
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
            this.replaceText(activeEl, '../', p.text);
            this.store.recordUsage(p.id);
        }
        this.closeMenu();
    }

    /**
     * OPTIMIZED REPLACEMENT STRATEGY (Waterfall)
     */
    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. DELETE SHORTCUT
        this.deleteShortcut(el, target);

        // 2. INSERT REPLACEMENT
        
        // A. Small text (<50 chars)? Use Native Command (Fastest for small edits)
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

        // C. Fallback: Manual Text Node Insertion (If clipboard blocked)
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
            
            // Attempt to remove characters backwards
            try {
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const startOffset = Math.max(0, range.startOffset - target.length);
                    range.setStart(range.startContainer, startOffset);
                    range.deleteContents();
                } else {
                    // Complex DOM (shortcut spans nodes) - Try execCommand delete
                    // This is imperfect but handles edge cases where text nodes are split
                    for(let i=0; i<target.length; i++) {
                        document.execCommand('delete');
                    }
                }
            } catch (e) {
                console.warn("Clean deletion failed", e);
            }
        }
    }

    private manualInsertFallback(el: HTMLElement, text: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const textNode = document.createTextNode(text);
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

    /**
     * OPTIMIZED DETECTION: Reads only Anchor Node (Current Line/Para)
     */
    private getWordBeforeCaret(el: HTMLElement): string | null {
        try {
            // Case A: Input/Textarea (Simple String Slice)
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const input = el as HTMLInputElement;
                const cursorPos = input.selectionStart || 0;
                const textBefore = input.value.slice(0, cursorPos);
                
                // Check specific trigger
                if (textBefore.endsWith('../')) return '../';
                
                // Check word
                const match = textBefore.match(/(\S+)$/);
                return match ? match[1] : null;
            } 
            
            // Case B: ContentEditable (Anchor Node Strategy)
            else {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return null;
                
                // Only look at the text node where the cursor is
                const anchorNode = sel.anchorNode;
                if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) return null;

                const text = anchorNode.textContent || '';
                const offset = sel.anchorOffset;
                const textBefore = text.slice(0, offset);

                // Check specific trigger
                if (textBefore.endsWith('../')) return '../';

                // Check word
                const match = textBefore.match(/(\S+)$/);
                return match ? match[1] : null;
            }
        } catch (e) { return null; }
    }
}
