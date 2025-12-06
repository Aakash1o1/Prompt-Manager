// src/content/resize.ts
// Creates invisible resize handles around the panel and wires pointer events
// so the user can resize by dragging any edge or corner.

type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontSizePx: number; 
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

export function setupResizeHandles(opts: {
  panel: HTMLElement;
  shadow: ShadowRoot;
  host: HTMLElement;
  getSettings: () => Settings;
  saveSettings: (s: Settings) => Promise<void>;
}) {
  const { panel, shadow, host, getSettings, saveSettings } = opts;

  let isResizing = false;
  let resizeDir: string | null = null;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0 };

  function getCursorForDir(d: string) {
    switch (d) {
      case 'left': case 'right': return 'ew-resize';
      case 'top': case 'bottom': return 'ns-resize';
      case 'top-left': case 'bottom-right': return 'nwse-resize';
      case 'top-right': case 'bottom-left': return 'nesw-resize';
      default: return 'move';
    }
  }

  function ensureResizeHandles() {
    const dirs = ['left','right','top','bottom','top-left','top-right','bottom-left','bottom-right'];
    for (const d of dirs) {
      let el = shadow.querySelector<HTMLElement>(`.resize-${d}`);
      if (!el) {
        el = document.createElement('div');
        el.className = `resize-handle resize-${d}`;
        Object.assign(el.style, {
          position: 'absolute',
          zIndex: '2147483652',
          background: 'transparent',
          width: '12px',
          height: '12px',
          cursor: getCursorForDir(d),
        } as any);
        panel.appendChild(el);
      }
    }

    const setPositions = () => {
      const size = 12;
      const half = size / 2;
      const mapping: Record<string, Partial<CSSStyleDeclaration>> = {
        'resize-left': { left: `-${half}px`, top: '0', height: '100%', width: `${size}px` },
        'resize-right': { right: `-${half}px`, top: '0', height: '100%', width: `${size}px` },
        'resize-top': { top: `-${half}px`, left: '0', width: '100%', height: `${size}px` },
        'resize-bottom': { bottom: `-${half}px`, left: '0', width: '100%', height: `${size}px` },
        'resize-top-left': { left: `-${half}px`, top: `-${half}px`, width: `${size}px`, height: `${size}px` },
        'resize-top-right': { right: `-${half}px`, top: `-${half}px`, width: `${size}px`, height: `${size}px` },
        'resize-bottom-left': { left: `-${half}px`, bottom: `-${half}px`, width: `${size}px`, height: `${size}px` },
        'resize-bottom-right': { right: `-${half}px`, bottom: `-${half}px`, width: `${size}px`, height: `${size}px` },
      };
      Object.entries(mapping).forEach(([cls, styleObj]) => {
        const el = panel.querySelector<HTMLElement>(`.${cls}`);
        if (!el) return;
        Object.assign(el.style, styleObj as any);
      });
    };

    panel.querySelectorAll<HTMLElement>('.resize-handle').forEach((el) => {
      el.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        el.setPointerCapture(ev.pointerId); 

        (ev.target as HTMLElement).setPointerCapture?.((ev as PointerEvent).pointerId);
        startResize((ev as PointerEvent).clientX, (ev as PointerEvent).clientY, (el.className || '').replace('resize-handle','').trim());
        
        el.addEventListener('pointerup', (ev) => {
            el.releasePointerCapture(ev.pointerId);
        });
      });
    });

    setTimeout(setPositions, 0);
  }

  function startResize(mouseX: number, mouseY: number, cls: string) {
    isResizing = true;
    
    // --- ADDED: Toggle Class on Start ---
    panel.classList.add('is-resizing');
    // ------------------------------------

    resizeDir = cls.replace('resize-','');
    const rect = panel.getBoundingClientRect();
    resizeStart = { x: mouseX, y: mouseY, w: rect.width, h: rect.height };
    document.documentElement.style.userSelect = 'none';
  }

  document.addEventListener('pointermove', (ev) => {
    if (!isResizing || !resizeDir) return;
    ev.preventDefault();
    const dx = ev.clientX - resizeStart.x;
    const dy = ev.clientY - resizeStart.y;
    let newW = resizeStart.w;
    let newH = resizeStart.h;

    if (resizeDir.includes('right')) newW = Math.max(200, resizeStart.w + dx);
    if (resizeDir.includes('left'))  newW = Math.max(200, resizeStart.w - dx);
    if (resizeDir.includes('bottom')) newH = Math.max(120, resizeStart.h + dy);
    if (resizeDir.includes('top'))    newH = Math.max(120, resizeStart.h - dy);

    panel.style.width = `${newW}px`;
    panel.style.height = `${newH}px`;
  });

  document.addEventListener('pointerup', async () => {
    if (!isResizing) return;
    isResizing = false;
    
    // --- ADDED: Remove Class on End ---
    panel.classList.remove('is-resizing');
    // ----------------------------------

    resizeDir = null;
    document.documentElement.style.userSelect = '';
    
    try {
      const s = getSettings();
      const vh = Math.round((panel.offsetHeight / window.innerHeight) * 100);
      s.popupWidthPx = panel.offsetWidth;
      s.popupHeightVh = vh;
      await saveSettings(s);
    } catch (e) {
      // ignore persistence errors
    }
  });

  ensureResizeHandles();
}