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
        
        if (rects.length > 0) {
            const rect = rects[rects.length - 1];
            return {
                x: rect.left, 
                y: rect.top,  
                lineHeight: rect.height
            };
        }

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
