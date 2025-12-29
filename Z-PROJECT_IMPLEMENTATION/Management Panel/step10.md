The Fix
Add onmouseenter to items so the highlight follows the mouse.
Change the item selection event from onclick to onmousedown (with e.preventDefault()) so it fires before the global close listener.
Files to Modify:
src/content/components/QuickMenu.ts
Tasks:
Update src/content/components/QuickMenu.ts
Replace the render method with this updated version.
code
TypeScript
// src/content/components/QuickMenu.ts

    private render() {
        this.el.innerHTML = '';
        this.prompts.forEach((p, i) => {
            const item = document.createElement('div');
            Object.assign(item.style, {
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                // Highlight if selected
                background: i === this.selectedIndex ? 'var(--accent, #3b82f6)' : 'transparent',
                color: i === this.selectedIndex ? '#fff' : 'inherit',
                transition: 'background 0.1s'
            });

            // 1. FIX: Sync Mouse Hover with Keyboard Selection
            item.onmouseenter = () => {
                this.selectedIndex = i;
                // Manually update siblings to avoid full re-render loop
                Array.from(this.el.children).forEach((child, idx) => {
                    const el = child as HTMLElement;
                    if (idx === i) {
                        el.style.background = 'var(--accent, #3b82f6)';
                        el.style.color = '#fff';
                        // Update Icon opacity if present
                        const icon = el.querySelector('.pin-icon') as HTMLElement;
                        if(icon) icon.style.opacity = '1';
                    } else {
                        el.style.background = 'transparent';
                        el.style.color = 'inherit';
                        const icon = el.querySelector('.pin-icon') as HTMLElement;
                        if(icon) icon.style.opacity = '0.7';
                    }
                });
            };

            // Left container for Icon + Title
            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '8px';
            left.style.overflow = 'hidden';
            left.style.pointerEvents = 'none'; // Let clicks pass to parent item

            // Render Pin Icon if pinned
            if (p.isPinned) {
                const pinIcon = document.createElement('span');
                pinIcon.className = 'pin-icon'; // Class for easy selection
                pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
                pinIcon.style.display = 'flex';
                pinIcon.style.opacity = i === this.selectedIndex ? '1' : '0.7';
                left.appendChild(pinIcon);
            }

            const title = document.createElement('span');
            title.textContent = p.title;
            title.style.whiteSpace = 'nowrap';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.style.maxWidth = '250px';

            left.appendChild(title);
            item.appendChild(left);
            
            // Shortcut hint on right
            if (p.quick) {
                const sc = document.createElement('span');
                sc.textContent = p.quick;
                sc.style.opacity = '0.5';
                sc.style.fontSize = '10px';
                sc.style.fontFamily = 'monospace';
                sc.style.pointerEvents = 'none';
                item.appendChild(sc);
            }
            
            // 2. FIX: Use 'mousedown' to beat the 'blur' event
            item.onmousedown = (e) => {
                e.preventDefault(); // Prevent focus loss
                e.stopPropagation();
                this.onSelect(p);
            };

            this.el.appendChild(item);
        });
    }
