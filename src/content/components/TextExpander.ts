// src/content/components/TextExpander.ts
import { Store, Prompt } from '../store';
import { CaretLocator } from '../utils/CaretLocator';
import { QuickMenu } from './QuickMenu';
import { ClipboardInserter } from '../utils/ClipboardInserter';

// --- STRATEGY DEFINITIONS ---
type InsertionStrategy = 'NATIVE' | 'SYNC_CLIPBOARD' | 'ASYNC_CLIPBOARD' | 'MANUAL';

// Site-specific preferences based on known constraints
const SITE_CONFIG: Record<string, InsertionStrategy[]> = {
    // ChatGPT blocks Async Clipboard (User Token expires). Needs Sync.
    'chatgpt.com': ['NATIVE', 'SYNC_CLIPBOARD', 'MANUAL'],
    'openai.com': ['NATIVE', 'SYNC_CLIPBOARD', 'MANUAL'],

    // Claude/Gemini handle Async Clipboard well, but Sync stealing focus confuses them.
    'claude.ai': ['NATIVE', 'ASYNC_CLIPBOARD', 'MANUAL'],
    'gemini.google.com': ['NATIVE', 'ASYNC_CLIPBOARD', 'MANUAL'],
    'aistudio.google.com': ['NATIVE', 'ASYNC_CLIPBOARD', 'MANUAL'],

    // Google Docs blocks native insert heavily. Needs Async Clipboard.
    'docs.google.com': ['ASYNC_CLIPBOARD', 'MANUAL'],
};

// Default "Waterfall" for unknown sites
const DEFAULT_STRATEGIES: InsertionStrategy[] = ['NATIVE', 'SYNC_CLIPBOARD', 'ASYNC_CLIPBOARD', 'MANUAL'];

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

        // --- ZOMBIE PROTECTION (RESTORED) ---
        // Check if our UI host is still attached to the DOM.
        // If not, we are a "Zombie" instance from before the reload.
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

            // FIX: Handle Space explicitly to close menu and allow typing
            if (ev.key === ' ') {
                this.closeMenu();
                return; // Exit function so we don't hit Trigger Detection below
            }

            // Close if user types any other char
            if (ev.key.length === 1) {
                this.closeMenu();
                return; 
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

    // --- SMART REPLACEMENT LOGIC ---
    
    private getStrategies(): InsertionStrategy[] {
        const hostname = window.location.hostname;
        // Check for exact match or substring match (e.g. chatgpt.com)
        const key = Object.keys(SITE_CONFIG).find(k => hostname.includes(k));
        if (key) {
            console.log(`[PD] Using site-specific config for: ${key}`);
            return SITE_CONFIG[key];
        }
        return DEFAULT_STRATEGIES;
    }

    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);
        el.focus();

        // 2. Get Strategies for this Site
        let strategies = this.getStrategies();

        // OPTIMIZATION: If text is small (< 300 chars), prioritize Native Insert
        // Native is the fastest/safest for small text everywhere.
        if (replacement.length < 300) {
            // Put NATIVE at the front of the list if it's not already there
            strategies = ['NATIVE', ...strategies.filter(s => s !== 'NATIVE')];
        }

        // 3. Execute Strategies in Order
        for (const strategy of strategies) {
            console.log(`[PD] Trying Strategy: ${strategy}`);
            
            let success = false;

            switch (strategy) {
                case 'NATIVE':
                    success = this.tryNativeInsert(el, replacement);
                    break;
                case 'SYNC_CLIPBOARD':
                    success = this.syncClipboardPaste(replacement, el);
                    break;
                case 'ASYNC_CLIPBOARD':
                    success = await this.tryAsyncClipboard(replacement, el);
                    break;
                case 'MANUAL':
                    this.manualInsertFallback(el, replacement);
                    success = true; // Manual always "succeeds" in execution
                    break;
            }

            // 4. Verify Success
            if (success) {
                // For manual, we assume success as verification is hard on raw DOM injection
                if (strategy === 'MANUAL' || this.verifyInsertion(el, replacement)) {
                    console.log(`[PD] Strategy ${strategy} Succeeded`);
                    this.triggerEvents(el);

                    // SIGNAL: Notify the window that a shortcut was expanded
                    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
                        detail: { 
                            type: 'SHORTCUT_EXPANDED',
                            payload: { 
                                text: replacement,
                                trigger: target // This will be '.shortcut' or '../'
                            } 
                        } 
                    }));

                    return; // EXIT
                }
            }
            console.warn(`[PD] Strategy ${strategy} Failed or was Blocked.`);
        }
    }

    // --- STRATEGY IMPLEMENTATIONS ---

    private tryNativeInsert(el: HTMLElement, text: string): boolean {
        try {
            return document.execCommand('insertText', false, text);
        } catch (e) { return false; }
    }

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

    private async tryAsyncClipboard(text: string, el: HTMLElement): Promise<boolean> {
        const success = await ClipboardInserter.insert(text);
        // Ensure focus returns
        el.focus();
        return success;
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

    // --- HELPERS ---

    private verifyInsertion(el: HTMLElement, text: string): boolean {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement;
            return input.value.includes(text.substring(0, 10)); 
        }
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return false;
        const nodeText = sel.anchorNode.textContent || '';
        return nodeText.length > 0;
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
                
                const range = sel.getRangeAt(0).cloneRange();
                
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const lookBack = Math.min(range.startOffset, 50);
                    range.setStart(range.startContainer, range.startOffset - lookBack);
                    const text = range.toString();
                    if (text.endsWith('../')) return '../';
                    const match = text.match(/(\S+)$/);
                    return match ? match[1] : null;
                }

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