// src/content/components/ColorPalette.ts

const COLORS = [
    '#FF6B6B', '#FF8A65', '#FFD166', '#F9F871', 
    '#9AE66E', '#6EE7B7', '#6ECFF6', '#6B9CFF',
    '#8F8CFF', '#D39BFF', '#FF9AD1', '#FFB3E6', 
    '#D0D0D0', '#A0A0A0', '#7F5539', '#2B2B2B'
];

export class ColorPalette {
    private onSelect: (color: string) => void;
    private onClose: () => void;
    private paletteEl: HTMLElement | null = null;
    private backdrop: HTMLElement | null = null;
    private el(tag: string, className?: string, text?: string): HTMLElement {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text) e.textContent = text;
        return e;
    }


    constructor(store: any, shadow: ShadowRoot, onSelect: (c: string) => void, onClose: () => void) {
        this.onSelect = onSelect;
        this.onClose = onClose;
    }

    showAt(parent: HTMLElement, x: number, y: number) {
        // 1. Transparent backdrop to handle "click outside"
        this.backdrop = this.el('div');
        Object.assign(this.backdrop.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            zIndex: '9998', cursor: 'default'
        });
        this.backdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            this.destroy();
        });
        parent.appendChild(this.backdrop);

        // 2. The Palette Box
        this.paletteEl = this.el('div');
        Object.assign(this.paletteEl.style, {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            zIndex: '9999',
            background: '#232323',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 20px)',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        });

        // 3. Color Swatches
        COLORS.forEach(color => {
            const btn = this.el('div');
            Object.assign(btn.style, {
                width: '20px', height: '20px', borderRadius: '4px',
                background: color, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.2)'
            });
            btn.title = color;
            
            btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
            btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onSelect(color);
                this.destroy();
            });
            
            this.paletteEl!.appendChild(btn);
        });

        parent.appendChild(this.paletteEl);
    }

    destroy() {
        if (this.paletteEl) this.paletteEl.remove();
        if (this.backdrop) this.backdrop.remove();
        this.onClose();
    }
}