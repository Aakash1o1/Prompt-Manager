Step 11: Fix Zombie Listeners on Reload
Files to Modify:
src/content/components/TextExpander.ts
Update src/content/components/TextExpander.ts
Replace the handleKeyDown method with this updated version containing the connectivity check.
code
TypeScript
// src/content/components/TextExpander.ts

    private handleKeyDown = (ev: KeyboardEvent) => {
        // --- 1. ZOMBIE CHECK (CRITICAL) ---
        // Check 1: Is Extension Context valid?
        try {
            if (!chrome.runtime?.id) throw new Error();
        } catch (e) {
            this.destroy();
            return;
        }

        // Check 2: Is our UI still on the page?
        // If the host element has been removed (by a new instance of the script),
        // we are a "Zombie" instance. We must stop and let the new instance handle events.
        if (!this.shadow.host.isConnected) {
            // console.log("Zombie TextExpander detected. Self-destructing.");
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
