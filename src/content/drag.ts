// src/content/drag.ts

export function getRectsMap(shadow: ShadowRoot) {
  const map = new Map<string, DOMRect>();
  shadow.querySelectorAll<HTMLElement>('.row, .tag-row').forEach((el) => {
    const id = el.dataset.id;
    if (id) map.set(id, el.getBoundingClientRect());
  });
  return map;
}

export function playFLIP(shadow: ShadowRoot, before: Map<string, DOMRect>) {
  const after = getRectsMap(shadow);
  
  after.forEach((newRect, id) => {
    const oldRect = before.get(id);
    const el = shadow.querySelector<HTMLElement>(`.row[data-id="${id}"], .tag-row[data-id="${id}"]`);
    
    if (!oldRect || !el) return;

    // Calculate change in Y position
    const dy = oldRect.top - newRect.top;
    
    // If no movement, skip
    if (Math.abs(dy) < 1) return;

    // 1. Invert: Move element back to old position instantly
    el.style.transition = 'none';
    el.style.transform = `translateY(${dy}px)`;

    // Force Reflow (critical for animation to trigger)
    // accessing offsetHeight forces the browser to calculate layout
    void el.offsetHeight; 

    // 2. Play: Animate to new position (0px transform)
    requestAnimationFrame(() => {
        // Use ease-out for a natural "settling" feel
        el.style.transition = 'transform 250ms cubic-bezier(0.2, 0, 0.2, 1)';
        el.style.transform = '';
        
        // Cleanup after animation
        const clean = () => { 
            el.style.transition = ''; 
            el.style.transform = ''; 
            el.removeEventListener('transitionend', clean); 
        };
        el.addEventListener('transitionend', clean);
    });
  });
}