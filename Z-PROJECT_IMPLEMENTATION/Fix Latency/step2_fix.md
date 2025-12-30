Fix 1: Correct Coordinates (Menu Visibility)
File: src/content/utils/CaretLocator.ts
Task: Remove window.scrollX and window.scrollY from the calculations. getBoundingClientRect already returns viewport-relative coordinates, which is exactly what our fixed overlay needs.
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
            return this.getInputCoords(el);
        } else {
            return this.getContentEditableCoords(el);
        }
    }

    private static getContentEditableCoords(el: HTMLElement): CaretCoords {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return { x: 0, y: 0, lineHeight: 20 };

        const range = sel.getRangeAt(0).cloneRange();
        const rects = range.getClientRects();
        
        // Use the last rect (cursor position)
        if (rects.length > 0) {
            const rect = rects[rects.length - 1];
            return {
                x: rect.left, // REMOVED scrollX
                y: rect.top,  // REMOVED scrollY
                lineHeight: rect.height
            };
        }

        // Fallback to parent element rect
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
        
        // Calculate relative to viewport
        const x = rect.left + span.offsetLeft - el.scrollLeft; // REMOVED scrollX
        const y = rect.top + span.offsetTop - el.scrollTop;   // REMOVED scrollY
        const lineHeight = spanRect.height;

        document.body.removeChild(div);

        return { x, y, lineHeight };
    }
}
Fix 2: Robust Insertion (TextExpander)
File: src/content/components/TextExpander.ts
Task:
Update deleteShortcut to re-apply the selection after deletion.
Refine replaceText logic to ensure focus.
code
TypeScript
// src/content/components/TextExpander.ts

    // ... (Keep existing methods until deleteShortcut) ...

    private deleteShortcut(el: HTMLElement, target: string) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const input = el as HTMLInputElement;
            const start = input.selectionStart || 0;
            const replaceStart = Math.max(0, start - target.length);
            // Native inputs handle selection update automatically with setRangeText
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
                    
                    // FIX: Re-apply the updated range to the selection
                    // Without this, the browser's cursor state is desynced
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    // Complex fallback
                    for(let i=0; i<target.length; i++) {
                        document.execCommand('delete');
                    }
                }
            } catch (e) {
                console.warn("Clean deletion failed", e);
            }
        }
    }

    // ... (rest of file) ...
