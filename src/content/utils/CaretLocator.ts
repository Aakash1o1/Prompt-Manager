export interface CaretCoords {
    x: number;
    y: number;
    lineHeight: number;
}

export class CaretLocator {
    /**
     * Main entry point to get coordinates for any supported editable element.
     */
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
        
        // If we have client rects (text exists), use the last one
        if (rects.length > 0) {
            const rect = rects[0];
            return {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                lineHeight: rect.height
            };
        }

        // Fallback: if line is empty, get position of the element itself
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            lineHeight: 20
        };
    }

    private static getInputCoords(el: HTMLInputElement | HTMLTextAreaElement): CaretCoords {
        const div = document.createElement('div');
        const copyStyles = window.getComputedStyle(el);

        // 1. Mirror styles
        for (const prop of copyStyles) {
            div.style.setProperty(prop, copyStyles.getPropertyValue(prop));
        }

        // 2. Critical functional styles
        Object.assign(div.style, {
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'hidden',
            top: '0',
            left: '0',
        });

        // 3. Content up to caret
        const value = el.value;
        const index = el.selectionStart || 0;
        const textBefore = value.substring(0, index);
        const textAfter = value.substring(index);

        div.textContent = textBefore;
        const span = document.createElement('span');
        span.textContent = textAfter.substring(0, 1) || '.';
        div.appendChild(span);

        document.body.appendChild(div);

        // 4. Calculate coordinates
        const rect = el.getBoundingClientRect();
        const spanRect = span.getBoundingClientRect();
        
        // Adjust for scroll position inside the textarea
        const x = rect.left + span.offsetLeft - el.scrollLeft + window.scrollX;
        const y = rect.top + span.offsetTop - el.scrollTop + window.scrollY;
        const lineHeight = spanRect.height;

        document.body.removeChild(div);

        return { x, y, lineHeight };
    }
}
