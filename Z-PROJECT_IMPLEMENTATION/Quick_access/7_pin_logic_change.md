Step 03: Quick Menu Visuals & Logic Fix
Objective:
Logic Fix: Pinned items appear at the top. Below them, we show up to X recently used items (where X is your setting).
Visuals: Add a "Pushpin" icon to pinned items in the dropdown to distinguish them.
Files to Modify:
src/content/store.ts
src/content/components/QuickMenu.ts
Tasks:
1. Fix Store Logic (store.ts)
Update getRecentPrompts to treat the limit as a "Recents Limit", not a "Total Limit".
code
TypeScript
// src/content/store.ts -> inside Store class

getRecentPrompts(): Prompt[] {
    const recentsLimit = this.settings.quickMenuLimit || 4;
    
    // 1. Get All Pinned Items (Max 5, sorted by order or title if you want, currently storage order)
    const pinned = this.prompts.filter(p => p.isPinned);
    
    // 2. Get Recents (Excluding pinned ones)
    const others = this.prompts
        .filter(p => !p.isPinned && p.lastUsed !== undefined)
        .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

    // 3. Slice Recents based on the setting
    const recents = others.slice(0, recentsLimit);
    
    // 4. Combine: Pinned on Top, Recents below
    return [...pinned, ...recents];
}
2. Update Quick Menu Visuals (QuickMenu.ts)
Modify the render method to check for isPinned and add an icon.
code
TypeScript
// src/content/components/QuickMenu.ts -> inside render() method

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
            alignItems: 'center', // Align icon and text
            justifyContent: 'space-between',
            gap: '8px', // Space between title/icon
            background: i === this.selectedIndex ? 'var(--accent, #3b82f6)' : 'transparent',
            color: i === this.selectedIndex ? '#fff' : 'inherit'
        });

        // Left container for Icon + Title
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.style.overflow = 'hidden';

        // 1. Render Pin Icon if pinned
        if (p.isPinned) {
            const pinIcon = document.createElement('span');
            // Small pushpin SVG
            pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
            pinIcon.style.display = 'flex';
            pinIcon.style.opacity = i === this.selectedIndex ? '1' : '0.7'; // Dim slightly if not selected
            left.appendChild(pinIcon);
        }

        const title = document.createElement('span');
        title.textContent = p.title;
        title.style.whiteSpace = 'nowrap';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.maxWidth = '250px'; // Prevent super wide menu

        left.appendChild(title);
        item.appendChild(left);
        
        // Optional: Shortcut hint on right
        if (p.quick) {
            const sc = document.createElement('span');
            sc.textContent = p.quick;
            sc.style.opacity = '0.5';
            sc.style.fontSize = '10px';
            sc.style.fontFamily = 'monospace';
            item.appendChild(sc);
        }
        
        item.onclick = (e) => {
            e.stopPropagation(); // Prevent document click from closing immediately
            this.onSelect(p);
        };
        this.el.appendChild(item);
    });
}
