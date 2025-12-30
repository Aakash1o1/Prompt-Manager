1. src/content/components/TextExpander.ts (Debug Version)
Added logs for Trigger Detection, Insertion Strategy, and Menu State.
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
        console.log('[PD-DEBUG] TextExpander: Mounted');
    }

    public destroy() {
        document.removeEventListener('keydown', this.handleKeyDown, true);
        document.removeEventListener('mousedown', this.handleOutsideClick, true);
        this.listening = false;
        console.log('[PD-DEBUG] TextExpander: Destroyed');
    }

    private handleOutsideClick = (ev: MouseEvent) => {
        if (this.menuOpen) {
            const path = (ev as any).composedPath?.() || [];
            if (!path.some((el: any) => el === (this.menu as any).el)) {
                console.log('[PD-DEBUG] Click outside detected. Closing menu.');
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
            console.log(`[PD-DEBUG] Menu Open. Key: ${ev.key}`);
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
                console.log('[PD-DEBUG] Typed char while menu open. Closing.');
                this.closeMenu();
            }
        }

        // --- TRIGGER DETECTION ---
        if (ev.key === ' ' || ev.code === 'Space') {
            const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
            const isContentEditable = activeEl.isContentEditable;
            
            if (!isInput && !isContentEditable) return;

            const word = this.getWordBeforeCaret(activeEl);
            if (!word) {
                // console.log('[PD-DEBUG] No word detected before caret');
                return;
            }

            console.log(`[PD-DEBUG] Word detected: "${word}"`);

            // Trigger: "../"
            if (word === '../') { 
                ev.preventDefault();
                ev.stopImmediatePropagation();
                console.log('[PD-DEBUG] Trigger "../" detected. Opening menu...');
                this.openMenu(activeEl);
                return;
            }

            // Trigger: Standard Shortcut
            const shortcut = word;
            const match = this.store.prompts.find(p => p.quick === shortcut);

            if (match) {
                console.log(`[PD-DEBUG] Shortcut match found: ${shortcut}`);
                ev.preventDefault();
                ev.stopImmediatePropagation();
                this.store.recordUsage(match.id);
                this.replaceText(activeEl, word, match.text);
            }
        }
    };

    private openMenu(el: HTMLElement) {
        const coords = CaretLocator.getCaretCoords(el);
        console.log(`[PD-DEBUG] Opening Menu at: x=${coords.x}, y=${coords.y}`);
        
        // Safety check for off-screen
        if (coords.x === 0 && coords.y === 0) {
            console.warn('[PD-DEBUG] Coordinates look suspicious (0,0). Menu might be invisible.');
        }

        this.menu.open(coords);
        this.menuOpen = true;
    }

    private closeMenu() {
        console.log('[PD-DEBUG] Closing Menu');
        this.menu.close();
        this.menuOpen = false;
    }

    private handleSelection(p: Prompt) {
        const activeEl = document.activeElement as HTMLElement;
        console.log(`[PD-DEBUG] Menu Item Selected: ${p.title}`);
        if (activeEl) {
            // Force focus back to editor
            activeEl.focus();
            this.replaceText(activeEl, '../', p.text); 
            this.store.recordUsage(p.id);
        } else {
            console.error('[PD-DEBUG] Lost active element focus');
        }
        this.closeMenu();
    }

    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        console.log(`[PD-DEBUG] Replacing "${target}" with text length ${replacement.length}`);
        
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);

        // Ensure focus
        el.focus();

        // 2. Insert Replacement
        
        // A. Small text
        if (replacement.length < 50) {
            console.log('[PD-DEBUG] Strategy: Native execCommand(insertText)');
            const success = document.execCommand('insertText', false, replacement);
            if (success) {
                console.log('[PD-DEBUG] Native insert success');
                this.triggerEvents(el);
                return;
            }
            console.warn('[PD-DEBUG] Native insert failed. Trying Fallback.');
        }

        // B. Large text / Clipboard
        console.log('[PD-DEBUG] Strategy: Clipboard API');
        const pasteSuccess = await ClipboardInserter.insert(replacement);
        if (pasteSuccess) {
            console.log('[PD-DEBUG] Clipboard insert success');
            this.triggerEvents(el);
            return;
        }
        console.warn('[PD-DEBUG] Clipboard insert failed. Trying Fallback.');

        // C. Fallback
        console.log('[PD-DEBUG] Strategy: Manual Fallback');
        this.manualInsertFallback(el, replacement);
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
                    console.log('[PD-DEBUG] TextNode delete success');
                } else {
                    console.log('[PD-DEBUG] Complex node delete (execCommand)');
                    for(let i=0; i<target.length; i++) {
                        document.execCommand('delete');
                    }
                }
            } catch (e) {
                console.warn("[PD-DEBUG] Clean deletion failed", e);
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

                // Log node type for debugging
                // console.log(`[PD-DEBUG] AnchorNode Type: ${anchorNode?.nodeType}`);

                if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                    const text = anchorNode.textContent || '';
                    // console.log(`[PD-DEBUG] Element Node Text: ${text}`);
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
2. src/content/utils/CaretLocator.ts (Debug Version)
Added logs to see exactly what rectangles the browser is returning.
code
TypeScript
// src/content/utils/CaretLocator.ts

export interface CaretCoords {
    x: number;
    y: number;
    lineHeight: number;
}

export class CaretLocator {
    static getCaretCoords(el: HTMLElement): CaretCoords {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            console.log('[PD-DEBUG] Getting Coords: Input Strategy');
            return this.getInputCoords(el);
        } else {
            console.log('[PD-DEBUG] Getting Coords: ContentEditable Strategy');
            return this.getContentEditableCoords(el);
        }
    }

    private static getContentEditableCoords(el: HTMLElement): CaretCoords {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return { x: 0, y: 0, lineHeight: 20 };

        const range = sel.getRangeAt(0).cloneRange();
        const rects = range.getClientRects();
        
        console.log(`[PD-DEBUG] Range rects found: ${rects.length}`);

        if (rects.length > 0) {
            const rect = rects[rects.length - 1];
            // Log calculated values
            // console.log(`[PD-DEBUG] Rect: L=${rect.left}, T=${rect.top}, H=${rect.height}`);
            return {
                x: rect.left, 
                y: rect.top,  
                lineHeight: rect.height
            };
        }

        // Fallback to parent element rect
        console.log('[PD-DEBUG] No range rects. Fallback to parent bounding box.');
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            lineHeight: 20
        };
    }

    private static getInputCoords(el: HTMLInputElement | HTMLTextAreaElement): CaretCoords {
        const div = document.createElement('div');
        const copyStyles = window.getComputedStyle(el);

        for (const prop of copyStyles) {
            div.style.setProperty(prop, copyStyles.getPropertyValue(prop));
        }

        Object.assign(div.style, {
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'hidden',
            top: '0',
            left: '0',
        });

        const value = el.value;
        const index = el.selectionStart || 0;
        const textBefore = value.substring(0, index);
        const textAfter = value.substring(index);

        div.textContent = textBefore;
        const span = document.createElement('span');
        span.textContent = textAfter.substring(0, 1) || '.';
        div.appendChild(span);

        document.body.appendChild(div);

        const rect = el.getBoundingClientRect();
        const spanRect = span.getBoundingClientRect();
        
        const x = rect.left + span.offsetLeft - el.scrollLeft; 
        const y = rect.top + span.offsetTop - el.scrollTop;   
        const lineHeight = spanRect.height;

        document.body.removeChild(div);

        return { x, y, lineHeight };
    }
}
