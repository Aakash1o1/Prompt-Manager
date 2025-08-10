// src/content/drag.ts
// FLIP helpers: read positions and play animation for moved items.

export function getRectsMap(shadow: ShadowRoot) {
  const map = new Map<string, DOMRect>();
  shadow.querySelectorAll<HTMLElement>('.row').forEach((el) => {
    const id = el.dataset.id;
    if (id) map.set(id, el.getBoundingClientRect());
  });
  return map;
}

export function playFLIP(shadow: ShadowRoot, before: Map<string, DOMRect>) {
  const after = getRectsMap(shadow);
  after.forEach((newRect, id) => {
    const oldRect = before.get(id);
    const el = shadow.querySelector<HTMLElement>(`.row[data-id="${id}"]`);
    if (!oldRect || !el) return;
    const dy = oldRect.top - newRect.top;
    if (dy === 0) return;
    el.style.transition = 'none';
    el.style.transform = `translateY(${dy}px)`;
    el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.transition = 'transform 180ms ease';
      el.style.transform = '';
      const clean = () => { el.style.transition = ''; el.style.transform = ''; el.removeEventListener('transitionend', clean); };
      el.addEventListener('transitionend', clean);
    });
  });
}
