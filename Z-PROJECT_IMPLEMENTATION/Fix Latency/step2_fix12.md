Fix: Restore Zombie Detection
File: src/content/components/TextExpander.ts
Action: Update the handleKeyDown method to include the isConnected check immediately after the runtime check.
Changes:
In handleKeyDown:
code
TypeScript
private handleKeyDown = (ev: KeyboardEvent) => {
        try {
            if (!chrome.runtime?.id) throw new Error();
        } catch (e) {
            this.destroy();
            return;
        }

        // --- RESTORE THIS BLOCK ---
        // Check if our UI host is still attached to the DOM.
        // If not, we are a "Zombie" instance from before the reload.
        if (!this.shadow.host.isConnected) {
            this.destroy();
            return;
        }
        // --------------------------

        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return;

        // ... rest of method
