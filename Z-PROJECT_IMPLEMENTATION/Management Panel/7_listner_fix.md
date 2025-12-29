Fix: Self-Destructing Listeners
Objective: Ensure the TextExpander automatically removes its listeners if it detects the extension context has been invalidated (which happens on reload).
Files to Modify: src/content/components/TextExpander.ts
Tasks:
Add a context validity check at the start of the keydown handler.
Add a try/catch block around the runtime check.
Update src/content/components/TextExpander.ts
Replace the handleKeyDown method with this robust version:
code
TypeScript
// src/content/components/TextExpander.ts

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
            // ... (Keep existing navigation logic) ...
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
            if (ev.key.length === 1 && ev.key !== ' ') {
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
