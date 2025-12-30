The Fix: Explicit Refocusing
We need to pass the target element into the paste function and force the browser to look at it before issuing the paste command.
Files to Modify:
src/content/components/TextExpander.ts
Tasks
Update src/content/components/TextExpander.ts
Replace the replaceText and syncClipboardPaste methods with this updated logic.
code
TypeScript
// src/content/components/TextExpander.ts

    // ... (Keep existing methods) ...

    // --- REPLACEMENT LOGIC ---
    private replaceText(el: HTMLElement, target: string, replacement: string) {
        // 1. Delete Shortcut
        this.deleteShortcut(el, target);
        
        el.focus();

        // 2. Insert Strategy (Synchronous)
        
        // A. Use Native 'insertText' for short/medium text (Most Reliable)
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
        // PASS THE ELEMENT 'el' SO WE CAN REFOCUS IT
        const didPaste = this.syncClipboardPaste(replacement, el);
        if (didPaste) {
            this.triggerEvents(el);
            return;
        }

        // C. Fallback: Native Insert again (if paste failed/blocked)
        // This will be slow for large text, but it GUARANTEES it appears.
        console.log("Clipboard paste failed or blocked. Using slow insert fallback.");
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
     */
    private syncClipboardPaste(text: string, targetEl: HTMLElement): boolean {
        try {
            // 1. Create hidden textarea to hold text
            const textArea = document.createElement("textarea");
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            textArea.value = text;
            document.body.appendChild(textArea);
            
            // 2. Select and Copy (This steals focus!)
            textArea.focus();
            textArea.select();
            const copySuccess = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!copySuccess) return false;

            // 3. CRITICAL FIX: Restore focus to the actual input before pasting
            targetEl.focus();

            // 4. Paste into target
            const pasteSuccess = document.execCommand('paste');
            return pasteSuccess;
        } catch (e) {
            console.warn("Sync paste failed", e);
            return false;
        }
    }

    // ... (Keep remaining methods: deleteShortcut, manualInsertFallback, triggerEvents, getWordBeforeCaret) ...
