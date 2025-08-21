// file: /home/auriga/Desktop/Projects/prompt manager/src/content/ui.ts
// Renders the UI into the provided host/shadow and wires events.
// This file contains the core UI logic but delegates FLIP & resize helpers.

import { getStorage, setStorage } from '../lib/storage';
import { getRectsMap, playFLIP } from './drag';
import { setupResizeHandles } from './resize';

type Prompt = { id: string; title: string; text: string; quick?: string };
type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: Prompt[];
  settings: Settings;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
}) {
  const { host, shadow, PROMPTS_KEY, SETTINGS_KEY } = opts;
  let prompts: Prompt[] = opts.prompts || [];
  let settings: Settings = opts.settings;

  // --- NEW: Selection state ---
  let selectedIndex = 0;
  let filteredPrompts: Prompt[] = [];

  // grab elements
  const hotzone = shadow.getElementById('hotzone') as HTMLElement;
  const panel = shadow.getElementById('panel') as HTMLElement;
  const list = shadow.getElementById('list') as HTMLElement;
  const addArea = shadow.getElementById('add-area') as HTMLElement;
  const settingsArea = shadow.getElementById('settings-area') as HTMLElement;
  const inputTitle = shadow.getElementById('input-title') as HTMLInputElement;
  const inputQuick = shadow.getElementById('input-quick') as HTMLInputElement;
  const inputBody = shadow.getElementById('input-body') as HTMLTextAreaElement;
  const addBtn = shadow.getElementById('add-btn') as HTMLButtonElement;
  const saveBtn = shadow.getElementById('save-btn') as HTMLButtonElement;
  const cancelBtn = shadow.getElementById('cancel-btn') as HTMLButtonElement;
  const closeBtn = shadow.getElementById('close-btn') as HTMLButtonElement;
  const settingsBtn = shadow.getElementById('settings-btn') as HTMLButtonElement;
  const toastEl = shadow.getElementById('toast') as HTMLElement;
  const searchInput = shadow.getElementById('search-input') as HTMLInputElement;

  const sFontSize = shadow.getElementById('s-font-size') as HTMLInputElement;
  const sTheme = shadow.getElementById('s-theme') as HTMLSelectElement;
  const sHotpos = shadow.getElementById('s-hotspot-pos') as HTMLSelectElement;
  const sSave = shadow.getElementById('s-save') as HTMLButtonElement || shadow.getElementById('s-save') as any;
  const sCancel = shadow.getElementById('s-cancel') as HTMLButtonElement;

  const inputElements = [inputTitle, inputQuick, inputBody, searchInput, sFontSize, sTheme, sHotpos];
  let isAddingOrEditing = false;
  let editingId: string | null = null;
  let draggedId: string | null = null;
  let placeholder: HTMLElement | null = null;
  const CLOSE_TOLERANCE_PX = 10;

  const stopBubbleHandler = (ev: KeyboardEvent) => {
    // Only act when our panel is open
    if (!panel.classList.contains('open')) return;

    // Stop propagation so the page doesn't get this key event.
    // Do NOT call preventDefault() here — letting the element receive default actions (typing/newline) is crucial.
    ev.stopPropagation();
  };

  panel.addEventListener('keydown', stopBubbleHandler, false);
  panel.addEventListener('keypress', stopBubbleHandler, false);
  panel.addEventListener('keyup', stopBubbleHandler, false);



  function uid() { return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9); }

  // sanitize user input by stripping HTML tags — store and render only plain text
  function stripHTMLTags(input: string) {
    if (!input) return '';
    return input.replace(/<\/?[^>]+(>|$)/g, '');
  }

  function applySettingsToHost() {
    host.style.setProperty('--popup-width', `${settings.popupWidthPx}px`);
    host.style.setProperty('--popup-height', `${settings.popupHeightVh}vh`);

    host.style.setProperty('--hotspot-width', `${settings.hotspotWidthPx}px`);
    host.setAttribute('data-hotspot-position', settings.hotspotPosition);
    host.setAttribute('data-theme', settings.theme);
    // ensure font-size var exists (fallback 13px)
    if (!host.style.getPropertyValue('--font-size')) host.style.setProperty('--font-size', '13px');
    // apply to panel to be safe
    try { (shadow.getElementById('panel') as HTMLElement).style.fontSize = host.style.getPropertyValue('--font-size') || '13px'; } catch {}
  }


  applySettingsToHost();

  function showToast(msg: string) { toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 1400); }

  function ensurePlaceholder() { if (placeholder) return placeholder; placeholder = document.createElement('div'); placeholder.className = 'placeholder'; return placeholder; }
  function removePlaceholder() { if (!placeholder) return; if (placeholder.parentElement) placeholder.parentElement.removeChild(placeholder); placeholder = null; }

  // --- MODIFIED: filterPrompts now only searches title and quick search ---
  function filterPrompts(q: string) {
    const s = q.trim().toLowerCase();
    if (!s) return prompts;
    return prompts.filter(p =>
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.quick && p.quick.toLowerCase().includes(s))
    );
  }

  // --- NEW: Selection helpers ---
  function resetSelection() {
    selectedIndex = 0;
    highlightSelection();
  }

  function highlightSelection() {
    // Clear all highlights
    list.querySelectorAll('.row').forEach(el => el.classList.remove('selected'));
    // Highlight selected if valid
    if (filteredPrompts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredPrompts.length) {
      const selId = filteredPrompts[selectedIndex].id;
      const selEl = list.querySelector<HTMLElement>(`.row[data-id="${selId}"]`);
      if (selEl) {
        selEl.classList.add('selected');
        // keep selected in view
        try { selEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch { selEl.scrollIntoView(false); }
      }
    }
  }

  // copy with fallback (kept from original for robustness)
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        const prevActive = document.activeElement as HTMLElement | null;
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        prevActive?.focus();
        return Boolean(ok);
      } catch (e) {
        return false;
      }
    }
  }

  // MODIFIED: buildList now populates the filteredPrompts array and resets selection
  function buildList() {
    const q = (searchInput?.value || '').trim();
    filteredPrompts = filterPrompts(q); // Store the filtered list
    list.innerHTML = '';
    if (!filteredPrompts.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No prompts (or none match your search).'; list.appendChild(e); return;
    }

    for (const p of filteredPrompts) { // Iterate over the new filteredPrompts array
      const row = document.createElement('div'); row.className = 'row'; if (!p.quick) row.classList.add('heading-row'); row.dataset.id = p.id;
      const left = document.createElement('div'); left.className = 'left';
      const handle = document.createElement('div'); handle.className = 'drag-handle'; handle.innerHTML = '&#x2261;'; handle.draggable = true;
      const label = document.createElement('div'); label.className = 'label'; label.textContent = p.title;
      label.addEventListener('click', async (ev) => { ev.stopPropagation(); try { await copyToClipboard(p.text); showToast('Copied'); } catch { showToast('Copy failed'); }});
      left.appendChild(handle); left.appendChild(label);

      const icons = document.createElement('div'); icons.className = 'icons';
      // Edit button (opens the add/edit area)
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      // static SVG — developer-controlled, safe to set as innerHTML
      editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = p.id; // set editing id so showAddArea can show 'Delete' inside edit view
        showAddArea(p.title, p.quick || '', p.text);
      });
      icons.appendChild(editBtn);

      row.appendChild(left); row.appendChild(icons);
      list.appendChild(row);

      // drag handlers
      handle.addEventListener('dragstart', (ev) => { draggedId = p.id; row.classList.add('dragging'); try { ev.dataTransfer?.setData('text/plain', p.id); } catch {} });
      handle.addEventListener('dragend', () => { draggedId = null; shadow.querySelectorAll('.row.dragging').forEach(el => el.classList.remove('dragging')); removePlaceholder(); });

      row.addEventListener('dragover', (ev) => { ev.preventDefault(); });
      row.addEventListener('drop', (ev) => { ev.preventDefault(); removePlaceholder(); });
    }

    const endSpacer = document.createElement('div'); endSpacer.style.minHeight = '12px';
    endSpacer.addEventListener('dragover', (ev) => { ev.preventDefault(); const ph = ensurePlaceholder(); if (list.lastElementChild !== ph) list.appendChild(ph); });
    endSpacer.addEventListener('drop', (ev) => { ev.preventDefault(); const srcId = draggedId ?? ev.dataTransfer?.getData('text/plain') ?? null; if (!srcId) return; const before = getRectsMap(shadow); movePromptToIndex(srcId, prompts.length - 1, before); removePlaceholder(); });
    list.appendChild(endSpacer);

    list.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      const ph = ensurePlaceholder();
      const rows = Array.from(list.querySelectorAll<HTMLElement>('.row'));
      let inserted = false;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rect = r.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (ev.clientY < mid) { if (r.parentElement && r.parentElement.querySelector('.placeholder') !== r) list.insertBefore(ph, r); inserted = true; break; }
      }
      if (!inserted) { const end = list.lastElementChild!; if (end && end !== ph) list.insertBefore(ph, end); }
    });

    list.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const srcId = draggedId ?? ev.dataTransfer?.getData('text/plain') ?? null;
      if (!srcId) { removePlaceholder(); return; }
      const ph = list.querySelector('.placeholder');
      if (!ph) { removePlaceholder(); return; }
      const children = Array.from(list.children);
      const idx = children.indexOf(ph);
      let targetIndex = 0;
      for (let i = 0; i < idx; i++) { if ((children[i] as HTMLElement).classList.contains('row')) targetIndex++; }
      const before = getRectsMap(shadow);
      movePromptToIndex(srcId, targetIndex, before);
      removePlaceholder();
    });

    // after building, reset selection to top
    resetSelection();
  }

  function movePromptToIndex(srcId: string, targetIndex: number, beforeRects?: Map<string, DOMRect>) {
    const srcIndex = prompts.findIndex(x => x.id === srcId);
    if (srcIndex === -1) return;
    const [item] = prompts.splice(srcIndex, 1);
    prompts.splice(targetIndex, 0, item);
    setStorage({ [PROMPTS_KEY]: prompts }).then(() => { buildAndAnimate(beforeRects); showToast('Order saved'); });
  }

  function buildAndAnimate(before?: Map<string, DOMRect>) {
    buildList();
    if (before) playFLIP(shadow, before);
  }

  // initial build
  buildList();

  /* UI events */
  // Open panel on hover and focus the search input (unless add/edit or settings are open).
  hotzone.addEventListener('mouseenter', () => {
    showPanel();

    // Focus the search input a short moment after opening so the panel has finished its open transition.
    // Do not steal focus if the add/edit area or settings area is currently open.
    setTimeout(() => {
      try {
        if (!addArea.classList.contains('open') && !settingsArea.classList.contains('open')) {
          // focus and move caret to end of existing search text
          searchInput?.focus();
          if (typeof (searchInput as any).setSelectionRange === 'function') {
            const len = (searchInput.value || '').length;
            (searchInput as HTMLInputElement).setSelectionRange(len, len);
          }
        }
      } catch (e) {
        // ignore any focus errors
      }
    }, 60);
  });
  addBtn.addEventListener('click', () => {
    editingId = null;
    showAddArea();
    settingsArea.classList.remove('open');
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  cancelBtn.addEventListener('click', () => hideAddArea());

  saveBtn.addEventListener('click', async () => {
    // sanitize inputs to prevent any HTML/script being stored or displayed
    const title = stripHTMLTags(inputTitle.value.trim());
    const quick = stripHTMLTags(inputQuick.value.trim());
    const text = stripHTMLTags(inputBody.value.trim());
    if (!title || !text) { alert('Both title and prompt are required'); return; }
    if (editingId != null) {
      const idx = prompts.findIndex(x => x.id === editingId);
      if (idx !== -1) prompts[idx] = { ...prompts[idx], title, quick, text };
    } else {
      const newPrompt: Prompt = { id: uid(), title, quick, text };
      prompts.unshift(newPrompt);
    }
    try { await setStorage({ [PROMPTS_KEY]: prompts }); buildList(); hideAddArea(); showToast('Saved'); } catch { showToast('Save failed'); }
  });

  settingsBtn.addEventListener('click', () => { if (settingsArea.classList.contains('open')) hideSettingsArea(); else showSettingsArea(); });
  sCancel.addEventListener('click', () => hideSettingsArea());
  sSave.addEventListener('click', async () => {
    const newS: Settings = {
      popupHeightVh: settings.popupHeightVh,
      popupWidthPx: settings.popupWidthPx,
      theme: (sTheme.value as 'light' | 'dark') || settings.theme,
      hotspotPosition: (sHotpos.value as 'corner' | 'edge') || settings.hotspotPosition,
      hotspotWidthPx: settings.hotspotWidthPx
    };
    // apply simple font-size if provided
    const fs = Number(sFontSize.value);
    if (fs && !Number.isNaN(fs)) {
      // set inline CSS var for font sizing inside host
      host.style.setProperty('--font-size', `${fs}px`);
      // apply to host styles (label/input font sizes will inherit)
    }
    settings = newS; applySettingsToHost();
    try { await setStorage({ [SETTINGS_KEY]: settings }); hideSettingsArea(); showToast('Settings saved'); } catch { showToast('Save failed'); }
  });

  // show/hide add/settings helpers
  function showPanel() { panel.classList.add('open'); resetSelection(); }
  function hidePanel() { if (!isAddingOrEditing) panel.classList.remove('open'); }
  
  function showAddArea(prefillTitle = '', prefillQuick = '', prefillBody = '') {
    isAddingOrEditing = true;
    // prefill but sanitize (defensive)
    inputTitle.value = stripHTMLTags(prefillTitle);
    inputQuick.value = stripHTMLTags(prefillQuick);
    inputBody.value = stripHTMLTags(prefillBody);

    // open add area
    addArea.classList.add('open');
    addArea.setAttribute('aria-hidden', 'false');
    list.style.display = 'none';
    settingsArea.classList.remove('open');

    addArea.classList.add('open')
    // panel mode class for CSS (hides search etc.)
    panel.classList.add('mode-add');
    panel.classList.remove('mode-settings');

    // Remove any existing dynamic delete icon to be safe (idempotent)
    const existingDel = addArea.querySelector<HTMLButtonElement>('.delete-btn');
    if (existingDel) existingDel.remove();

    // Only show delete icon when editing an existing prompt
    if (editingId != null) {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete prompt';
      delBtn.setAttribute('aria-label', 'Delete prompt');

      // lightweight line-drawing trash SVG (inherits currentColor)
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" fill="none"/></svg>';

      // click handler: confirm, delete from prompts, persist, show toast, rebuild
      delBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        if (!editingId) return;
        if (!confirm('Delete this prompt?')) return;
        const idToDelete = editingId;
        prompts = prompts.filter(x => x.id !== idToDelete);
        try {
          await setStorage({ [PROMPTS_KEY]: prompts });
          showToast('Deleted');
        } catch (e) {
          showToast('Delete failed');
        }
        editingId = null;
        hideAddArea();
        buildList();
      });

      // append to addArea (positioned absolute via CSS)
      addArea.appendChild(delBtn);
    }
  }

  function hideAddArea() {
    isAddingOrEditing = false;
    editingId = null;

    // remove dynamic delete icon if present
    const existingDel = addArea.querySelector<HTMLButtonElement>('.delete-btn');
    if (existingDel) existingDel.remove();

    addArea.classList.remove('open');
    addArea.setAttribute('aria-hidden', 'true');
    list.style.display = 'block';
    inputTitle.value = '';
    inputBody.value = '';
    inputQuick.value = '';


    try { (searchInput as HTMLInputElement).tabIndex = 0; } catch {}
try { (searchInput as HTMLInputElement).tabIndex = 0; } catch {}

    // clear add-mode class
    panel.classList.remove('mode-add');
  }
  
  function showSettingsArea() {
    settingsArea.classList.add('open'); settingsArea.setAttribute('aria-hidden', 'false');
    // populate our reduced settings:
    sFontSize.value = String(parseInt(window.getComputedStyle(host).getPropertyValue('--font-size') || '13') || 13);
    sTheme.value = settings.theme;
    sHotpos.value = settings.hotspotPosition;
    list.style.display = 'none'; addArea.classList.remove('open');
    panel.classList.add('mode-settings'); panel.classList.remove('mode-add');
  }
  
  function hideSettingsArea() { 
    settingsArea.classList.remove('open');
    settingsArea.setAttribute('aria-hidden', 'true'); 
    list.style.display = 'block'; 
    panel.classList.remove('mode-settings'); 
    try { (searchInput as HTMLInputElement).tabIndex = 0; } catch {}

  }

  function isPointInsideExtendedRect(x: number, y: number, rect: DOMRect, tol: number) {
    return x >= (rect.left - tol) && x <= (rect.right + tol) && y >= (rect.top - tol) && y <= (rect.bottom + tol);
  }

  [addArea, settingsArea, panel].forEach((el) => {
    el?.addEventListener('click', (ev) => ev.stopPropagation());
    el?.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  });

  panel.addEventListener('mouseup', async () => {
    const w = panel.offsetWidth;
    const hPx = panel.offsetHeight;
    const vh = Math.round((hPx / window.innerHeight) * 100);
    settings.popupWidthPx = w;
    settings.popupHeightVh = vh;
    applySettingsToHost();
    try { await setStorage({ [SETTINGS_KEY]: settings }); } catch {}
  });

  // live search
  searchInput.addEventListener('input', () => buildList());

  // --- REPLACED: New keyboard handling ---
// --- Fixed keyboard handling ---
document.addEventListener('keydown', async (ev: KeyboardEvent) => {
  if (!panel.classList.contains('open')) return;

  // Since we're using stopPropagation on all inputs,
  // if we reach this handler, we know the user is NOT typing in any input field
  
  // Don't interfere when in special modes
  if (isAddingOrEditing || settingsArea.classList.contains('open')) {
    if (ev.key === 'Escape' && !isAddingOrEditing && !settingsArea.classList.contains('open')) {
      panel.classList.remove('open');
    }
    return;
  }

  // Handle navigation keys
  if (ev.key === 'ArrowDown') {
    ev.preventDefault();
    if (filteredPrompts.length > 0) {
      selectedIndex = (selectedIndex + 1) % filteredPrompts.length;
      highlightSelection();
    }
  } else if (ev.key === 'ArrowUp') {
    ev.preventDefault();
    if (filteredPrompts.length > 0) {
      selectedIndex = (selectedIndex - 1 + filteredPrompts.length) % filteredPrompts.length;
      highlightSelection();
    }
  } else if (ev.key === 'Enter') {
    ev.preventDefault();
    if (filteredPrompts.length === 0 || !filteredPrompts[selectedIndex]) {
      showToast('No prompt selected.');
      return;
    }
    const prompt = filteredPrompts[selectedIndex];
    const ok = await copyToClipboard(prompt.text);
    showToast(ok ? 'Copied' : 'Copy failed');
  } else if (ev.key === 'Escape') {
    panel.classList.remove('open');
  }
});

  // listen for storage changes to local across tabs
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[PROMPTS_KEY]) {
      prompts = changes[PROMPTS_KEY].newValue ?? [];
      buildList();
    }
    if (changes[SETTINGS_KEY]) {
      settings = changes[SETTINGS_KEY].newValue ?? settings;
      applySettingsToHost();
    }
  });

  // toggle via keyboard command
  chrome.runtime.onMessage.addListener((msg: any) => {
    if (msg?.type === 'TOGGLE_POPUP') {
      if (!panel.classList.contains('open')) {
        showPanel();
        setTimeout(() => searchInput?.focus(), 60);
      } else {
        hidePanel();
      }
    }
  });

  // resize handles
  setupResizeHandles({ panel, shadow, host, getSettings: () => settings, saveSettings: async (s: Settings) => { settings = s; applySettingsToHost(); await setStorage({ [SETTINGS_KEY]: settings }); } });

  document.addEventListener('mousedown', (ev) => {
    if (!panel.classList.contains('open')) return;
    const path = (ev as any).composedPath ? (ev as any).composedPath() : (ev as any).path || [];
    if (Array.isArray(path) && (path.includes(panel) || path.includes(host))) return;
    const rect = panel.getBoundingClientRect();
    if (isPointInsideExtendedRect((ev as MouseEvent).clientX, (ev as MouseEvent).clientY, rect, CLOSE_TOLERANCE_PX)) return;
    
    // Always hide sub-panels and the main panel on outside click.
    hideAddArea();
    hideSettingsArea();
    panel.classList.remove('open');
  });

  function getRectsMapLocal() { return getRectsMap(shadow); }
  function playFLIPLocal(before: Map<string, DOMRect>) { playFLIP(shadow, before); }

  // NOTE: intentionally do NOT expose internal API on window — avoid giving pages access to extension internals.
  // previous code exposed window.__promptManager which is a potential leak; removed for safety.

  buildList();
}
