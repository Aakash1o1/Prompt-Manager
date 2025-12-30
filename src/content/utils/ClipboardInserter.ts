export class ClipboardInserter {
    /**
     * Tries to paste text using the Clipboard API.
     * Strategy: Save user's clip -> Copy new text -> Paste -> Restore user's clip.
     * Returns true if successful, false if the site blocked it.
     */
    static async insert(text: string): Promise<boolean> {
        try {
            // 1. Focus element to ensure target is active
            const activeEl = document.activeElement as HTMLElement;
            if (activeEl) {
                activeEl.focus();
            }

            // 2. Save current clipboard (if possible)
            // Reading clipboard might require permission on some sites/browsers.
            // We wrap in try/catch so we don't crash if read fails.
            let originalData = '';
            try {
                originalData = await navigator.clipboard.readText();
            } catch (e) {
                // Ignore read errors. We just won't be able to restore the old clipboard.
                // This is an acceptable trade-off for speed.
            }

            // 3. Write prompt to clipboard
            await navigator.clipboard.writeText(text);

            // 4. Trigger Paste
            // We use execCommand('paste') because purely programmatic pasting 
            // is restricted for security. This command simulates the user pressing Ctrl+V.
            const success = document.execCommand('paste');

            // 5. Restore clipboard
            // We delay slightly to ensure the 'paste' event has fully processed the data 
            // before we overwrite the clipboard back to the original content.
            if (originalData) {
                setTimeout(() => {
                    navigator.clipboard.writeText(originalData).catch(() => {});
                }, 50);
            }

            return success;
        } catch (e) {
            console.warn("Clipboard paste failed", e);
            return false;
        }
    }
}
