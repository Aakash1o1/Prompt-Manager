Files to Modify:
src/content/components/TextExpander.ts
Tasks:
Update src/content/components/TextExpander.ts
Replace the replaceText method with this logic.
code
TypeScript
// src/content/components/TextExpander.ts

    private async replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);

        el.focus();

        // 2. HYBRID STRATEGY
        
        // A. LONG TEXT (> 300 chars) -> Try Clipboard First for Speed
        if (replacement.length > 300) {
            // Attempt Clipboard Injection
            const pasteSuccess = await ClipboardInserter.insert(replacement);
            if (pasteSuccess) {
                this.triggerEvents(el);
                return; // Success! Fast path done.
            }
            // If failed (permissions/token), fall through to 'B' (Reliable Slow Path)
        }

        // B. SHORT TEXT or FALLBACK -> Native Insert (Reliable)
        try {
            const success = document.execCommand('insertText', false, replacement);
            if (success) {
                this.triggerEvents(el);
                return; 
            }
        } catch (e) {
            // Ignore error
        }

        // C. LAST RESORT -> Clipboard Retry (if we haven't tried it yet)
        if (replacement.length <= 300) {
             const pasteSuccess = await ClipboardInserter.insert(replacement);
             if (pasteSuccess) {
                 this.triggerEvents(el);
                 return;
             }
        }

        // D. NUCLEAR OPTION -> Manual DOM
        this.manualInsertFallback(el, replacement);
    }
