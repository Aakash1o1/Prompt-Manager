// src/content/resize.ts
export function setupResizeHandles(modal: HTMLElement, shadow: ShadowRoot) {
  let isResizing = false;
  let currentHandle: string | null = null;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  // Create Handles
  const directions = ['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'];
  directions.forEach(dir => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${dir}`;
    handle.dataset.dir = dir;
    modal.appendChild(handle);
  });

  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('resize-handle')) return;
    
    e.preventDefault();
    target.setPointerCapture(e.pointerId);
    
    isResizing = true;
    currentHandle = target.dataset.dir || null;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = modal.getBoundingClientRect();
    startW = rect.width;
    startH = rect.height;

    modal.classList.add('resizing');
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isResizing || !currentHandle) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newW = startW;
    let newH = startH;

    // Logic for centered resizing
    // Since the modal is centered in the backdrop using flex/grid,
    // we multiply by 2 to expand both sides evenly so the mouse stays on the handle.
    
    if (currentHandle.includes('e')) newW = Math.max(600, startW + dx * 2);
    if (currentHandle.includes('w')) newW = Math.max(600, startW - dx * 2);
    if (currentHandle.includes('s')) newH = Math.max(400, startH + dy * 2);
    if (currentHandle.includes('n')) newH = Math.max(400, startH - dy * 2);

    modal.style.width = `${newW}px`;
    modal.style.height = `${newH}px`;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isResizing) return;
    isResizing = false;
    modal.classList.remove('resizing');
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const container = shadow.querySelector('.backdrop') || modal;
  container.addEventListener('pointerdown', onPointerDown as EventListener);
  container.addEventListener('pointermove', onPointerMove as EventListener);
  container.addEventListener('pointerup', onPointerUp as EventListener);
}
