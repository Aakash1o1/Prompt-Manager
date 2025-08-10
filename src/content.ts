// src/content.ts
// Content script (Shadow DOM) for Prompt Manager
// Updated: improved close behavior, single scrollbar (only .list), tolerant leave,
// global outside-click to close, and stable resize from any edge/corner.

import { getStorage, setStorage } from './lib/storage';

type Prompt = { id: string; title: string; text: string; quick?: string };
type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontFamily: string;
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

const PROMPTS_KEY = 'promptManager.prompts';
const SETTINGS_KEY = 'promptManager.settings';
const HOST_ID = 'prompt-drawer-host-shadow';

let prompts: Prompt[] = [];
let settings: Settings;
let isAddingOrEditing = false;
let editingId: string | null = null;
let draggedId: string | null = null;

/* Defaults */
const DEFAULT_SETTINGS: Settings = {
  popupHeightVh: 50,
  popupWidthPx: 360,
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  theme: 'dark',
  hotspotPosition: 'corner',
  hotspotWidthPx: 28
};

function uid() { return Math.random().toString(36).slice(2, 9); }

/* --- create/get host + shadow DOM --- */
function createOrGetHost() {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (host && host.shadowRoot) return { host, shadow: host.shadowRoot as ShadowRoot };
  if (host) host.remove();
  host = document.createElement('div');
  host.id = HOST_ID;
  Object.assign(host.style, { all: 'initial' });
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      :host { --popup-width: 360px; --popup-height: 50vh; --font-family: 'Inter', system-ui; --bg-a: #1f2d4a; --bg-b: #274a8f; --txt: #eaf4ff; --hotspot-color: #cfeeff; --hotspot-width: 28px; }
      :host([data-theme="light"]) { --bg-a: #ffffff; --bg-b: #f3f6fb; --txt: #111827; --hotspot-color: #cfeeff; }
      .hotzone { position: fixed; right: 10px; bottom: 10px; width: 48px; height: 48px; background: var(--hotspot-color); border-radius: 10px; display:flex; align-items:center; justify-content:center; z-index:2147483650; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,0.2); user-select:none; font-size:18px; color:#05314f; }
      :host([data-hotspot-position="edge"]) .hotzone { right:0; width: var(--hotspot-width); height: var(--popup-height); top: calc(50% - (var(--popup-height) / 2)); border-radius:0; display:flex; align-items:center; justify-content:center; writing-mode: vertical-rl; }
      /* IMPORTANT: panel overflow hidden so only inner .list shows scrollbars */
      .panel { position: fixed; right: 12px; bottom: 72px; width: var(--popup-width); height: var(--popup-height); z-index:2147483651; border-radius: 10px; box-shadow: 0 14px 44px rgba(0,0,0,0.36); overflow: hidden; display:none; flex-direction:column; font-family: var(--font-family); color: var(--txt); background: linear-gradient(180deg, var(--bg-a), var(--bg-b)); border: 1px solid rgba(255,255,255,0.04); padding:10px; box-sizing:border-box; resize: both; }
      .panel.open { display:flex; }
      .header { display:flex; align-items:center; gap:8px; padding:6px; flex: 0 0 auto; }
      .title { font-weight:700; font-size:14px; color:var(--txt); flex: 0 0 auto; }
      .search { flex:1; min-width:0; }
      .search input { width:100%; padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:var(--txt); }
      .controls { display:flex; gap:6px; flex:0 0 auto; }
      .ctrl-btn { background: transparent; border: 1px solid rgba(255,255,255,0.06); border-radius:8px; padding:6px 8px; color:var(--txt); cursor:pointer; }
      /* list is the only scrollable area */
      .list { flex:1 1 auto; overflow-y:auto; padding:6px; margin-top:6px; -webkit-overflow-scrolling: touch; }
      .row { display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.02); margin-bottom:8px; min-height:34px; transition: transform 160ms ease, opacity 120ms ease; }
      .row.heading-row { min-height:26px; }
      .dragging { opacity:0.55; transform: scale(0.98); }
      .left { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
      .drag-handle { width:20px; height:20px; display:flex; align-items:center; justify-content:center; border-radius:6px; background: rgba(255,255,255,0.03); cursor:grab; }
      .label { flex:1; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--txt); }
      .icons { display:flex; gap:6px; }
      .icon-btn { background: rgba(255,255,255,0.03); border: none; color: var(--txt); width:32px; height:32px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
      .placeholder { height:12px; margin:6px 0; border-radius:6px; background: rgba(255,255,255,0.06); transition: height 120ms ease; }
      .add-area { margin-top:8px; display:none; flex-direction:column; gap:8px; }
      .add-area.open { display:flex; }
      input[type="text"], textarea { width:100%; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:var(--txt); box-sizing:border-box; }
      textarea { min-height:110px; resize: vertical; }
      .settings-area { margin-top:8px; display:none; flex-direction:column; gap:8px; }
      .settings-area.open { display:flex; }
      .settings-row { display:flex; gap:8px; align-items:center; }
      .settings-row label { width:140px; color:var(--txt); font-size:13px; }
      .toast { position:absolute; left:50%; transform:translateX(-50%); bottom:12px; background: rgba(0,0,0,0.65); color:#fff; padding:8px 12px; border-radius:8px; font-size:13px; opacity:0; transition:opacity .18s; }
      .toast.show { opacity:1; }
      /* resize handles (hit-targets) */
      .resize-handle { position: absolute; background: transparent; z-index:2147483652; }
      /* hide panel-level scrollbar if any (safety) */
      .panel::-webkit-scrollbar { display: none; }
    </style>

    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">💬</div>

    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">
      <div class="header">
        <div class="title">Prompt Drawer</div>
        <div class="search"><input id="search-input" type="text" placeholder="Search prompts or quick code (e.g. ../)..." /></div>
        <div class="controls">
          <button id="add-btn" class="ctrl-btn">Add</button>
          <button id="settings-btn" class="ctrl-btn">Settings</button>
          <button id="close-btn" class="ctrl-btn">✕</button>
        </div>
      </div>

      <div class="list" id="list" role="list"></div>

      <div class="add-area" id="add-area" aria-hidden="true">
        <input id="input-title" type="text" placeholder="Prompt title" />
        <input id="input-quick" type="text" placeholder="Quick search code (e.g. ../ or pp)" />
        <textarea id="input-body" placeholder="Full prompt text"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="cancel-btn" class="ctrl-btn">Cancel</button>
          <button id="save-btn" class="ctrl-btn">Save</button>
        </div>
      </div>

      <div class="settings-area" id="settings-area" aria-hidden="true">
        <div class="settings-row"><label>Popup height (vh)</label><input id="s-popup-height" type="number" min="20" max="100" /></div>
        <div class="settings-row"><label>Popup width (px)</label><input id="s-popup-width" type="number" min="200" max="1000" /></div>
        <div class="settings-row"><label>Font family</label><input id="s-font-family" type="text" /></div>
        <div class="settings-row"><label>Theme</label>
          <select id="s-theme"><option value="dark">Dark</option><option value="light">Light</option></select>
        </div>
        <div class="settings-row"><label>Hotspot position</label>
          <select id="s-hotspot-pos"><option value="corner">Corner</option><option value="edge">Right edge</option></select>
        </div>
        <div class="settings-row"><label>Hotspot width (px)</label><input id="s-hotspot-width" type="number" min="12" max="120" /></div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="s-cancel" class="ctrl-btn">Cancel</button>
          <button id="s-save" class="ctrl-btn">Save</button>
        </div>
      </div>

      <div class="toast" id="toast" aria-hidden="true"></div>
    </div>
  `;

  return { host, shadow };
}

/* --- FLIP helpers --- */
function getRectsMap(shadow: ShadowRoot) {
  const map = new Map<string, DOMRect>();
  shadow.querySelectorAll<HTMLElement>('.row').forEach((el) => {
    const id = el.dataset.id;
    if (id) map.set(id, el.getBoundingClientRect());
  });
  return map;
}
function playFLIP(shadow: ShadowRoot, before: Map<string, DOMRect>) {
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

function applySettingsToHost(host: HTMLElement, s: Settings) {
  host.style.setProperty('--popup-width', `${s.popupWidthPx}px`);
  host.style.setProperty('--popup-height', `${s.popupHeightVh}vh`);
  host.style.setProperty('--font-family', s.fontFamily);
  host.style.setProperty('--hotspot-width', `${s.hotspotWidthPx}px`);
  host.setAttribute('data-hotspot-position', s.hotspotPosition);
  host.setAttribute('data-theme', s.theme);
}

/* --- render UI + behavior --- */
async function renderUI(host: HTMLElement, shadow: ShadowRoot) {
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

  const sPopupH = shadow.getElementById('s-popup-height') as HTMLInputElement;
  const sPopupW = shadow.getElementById('s-popup-width') as HTMLInputElement;
  const sFont = shadow.getElementById('s-font-family') as HTMLInputElement;
  const sTheme = shadow.getElementById('s-theme') as HTMLSelectElement;
  const sHotpos = shadow.getElementById('s-hotspot-pos') as HTMLSelectElement;
  const sHotw = shadow.getElementById('s-hotspot-width') as HTMLInputElement;
  const sSave = shadow.getElementById('s-save') as HTMLButtonElement;
  const sCancel = shadow.getElementById('s-cancel') as HTMLButtonElement;

  function showPanel() { panel.classList.add('open'); }
  function hidePanel() { if (!isAddingOrEditing) panel.classList.remove('open'); }
  function togglePanel() { panel.classList.toggle('open'); }

  function showAddArea(prefillTitle = '', prefillQuick = '', prefillBody = '') {
    isAddingOrEditing = true; editingId = null;
    inputTitle.value = prefillTitle; inputQuick.value = prefillQuick; inputBody.value = prefillBody;
    addArea.classList.add('open'); addArea.setAttribute('aria-hidden', 'false'); list.style.display = 'none'; settingsArea.classList.remove('open');
  }
  function hideAddArea() {
    isAddingOrEditing = false; editingId = null;
    addArea.classList.remove('open'); addArea.setAttribute('aria-hidden', 'true'); list.style.display = 'block';
    inputTitle.value = ''; inputBody.value = ''; inputQuick.value = '';
  }

  function showSettingsArea() {
    settingsArea.classList.add('open'); settingsArea.setAttribute('aria-hidden', 'false');
    sPopupH.value = String(settings.popupHeightVh);
    sPopupW.value = String(settings.popupWidthPx);
    sFont.value = settings.fontFamily;
    sTheme.value = settings.theme;
    sHotpos.value = settings.hotspotPosition;
    sHotw.value = String(settings.hotspotWidthPx);
    list.style.display = 'none'; addArea.classList.remove('open');
  }
  function hideSettingsArea() { settingsArea.classList.remove('open'); settingsArea.setAttribute('aria-hidden', 'true'); list.style.display = 'block'; }

  function showToast(msg: string) { toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 1400); }

  let placeholder: HTMLElement | null = null;
  function ensurePlaceholder() { if (placeholder) return placeholder; placeholder = document.createElement('div'); placeholder.className = 'placeholder'; return placeholder; }
  function removePlaceholder() { if (!placeholder) return; if (placeholder.parentElement) placeholder.parentElement.removeChild(placeholder); placeholder = null; }

  function filterPrompts(q: string) {
    const s = q.trim().toLowerCase();
    if (!s) return prompts;
    return prompts.filter(p => (p.title && p.title.toLowerCase().includes(s)) || (p.quick && p.quick.toLowerCase().includes(s)));
  }

  function buildList() {
    const q = (searchInput?.value || '').trim();
    const items = filterPrompts(q);
    list.innerHTML = '';
    if (!items.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No prompts (or none match your search).'; list.appendChild(e); return;
    }

    for (const p of items) {
      const row = document.createElement('div'); row.className = 'row'; if (!p.quick) row.classList.add('heading-row'); row.dataset.id = p.id;
      const left = document.createElement('div'); left.className = 'left';
      const handle = document.createElement('div'); handle.className = 'drag-handle'; handle.innerHTML = '&#x2261;'; handle.draggable = true;
      const label = document.createElement('div'); label.className = 'label'; label.textContent = p.title;
      // clicking title copies full prompt to clipboard
      label.addEventListener('click', async () => { try { await navigator.clipboard.writeText(p.text); showToast('Copied'); } catch { showToast('Copy failed'); }});
      left.appendChild(handle); left.appendChild(label);

      const icons = document.createElement('div'); icons.className = 'icons';
      const editBtn = document.createElement('button'); editBtn.className = 'icon-btn'; editBtn.textContent = '✎';
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); editingId = p.id; showAddArea(p.title, p.quick || '', p.text); });
      const delBtn = document.createElement('button'); delBtn.className = 'icon-btn'; delBtn.textContent = '🗑';
      delBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm('Delete this prompt?')) { prompts = prompts.filter(x => x.id !== p.id); setStorage({ [PROMPTS_KEY]: prompts }).then(()=>{ buildList(); showToast('Deleted'); }); }});
      icons.appendChild(editBtn); icons.appendChild(delBtn);

      row.appendChild(left); row.appendChild(icons);
      list.appendChild(row);

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

  /* events */
  hotzone.addEventListener('mouseenter', () => showPanel());

  // --- tolerant hide: 10px around popup ---
  let lastMouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (ev) => { lastMouse.x = ev.clientX; lastMouse.y = ev.clientY; }, { passive: true });
  const CLOSE_TOLERANCE_PX = 10;
  let pendingHideTimer: number | null = null;

  panel.addEventListener('mouseleave', () => {
    if (pendingHideTimer) window.clearTimeout(pendingHideTimer);
    pendingHideTimer = window.setTimeout(() => {
      const rect = panel.getBoundingClientRect();
      if (isPointInsideExtendedRect(lastMouse.x, lastMouse.y, rect, CLOSE_TOLERANCE_PX)) {
        pendingHideTimer = null;
        return;
      }
      if (!isAddingOrEditing) panel.classList.remove('open');
      pendingHideTimer = null;
    }, 120);
  });
  panel.addEventListener('mouseenter', () => { if (pendingHideTimer) { window.clearTimeout(pendingHideTimer); pendingHideTimer = null; } });

  function isPointInsideExtendedRect(x: number, y: number, rect: DOMRect, tol: number) {
    return x >= (rect.left - tol) && x <= (rect.right + tol) && y >= (rect.top - tol) && y <= (rect.bottom + tol);
  }

  // stop propagation so page-level handlers don't swallow clicks
  [addArea, settingsArea, panel].forEach((el) => {
    el?.addEventListener('click', (ev) => ev.stopPropagation());
    el?.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  });

  addBtn.addEventListener('click', () => { showAddArea(); settingsArea.classList.remove('open'); });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  cancelBtn.addEventListener('click', () => hideAddArea());

  saveBtn.addEventListener('click', async () => {
    const title = inputTitle.value.trim();
    const quick = inputQuick.value.trim();
    const text = inputBody.value.trim();
    if (!title || !text) { alert('Both title and prompt are required'); return; }
    if (editingId) {
      const idx = prompts.findIndex(x => x.id === editingId);
      if (idx !== -1) prompts[idx] = { ...prompts[idx], title, quick, text };
    } else {
      const newPrompt: Prompt = { id: uid(), title, quick, text };
      prompts.unshift(newPrompt);
    }
    try { await setStorage({ [PROMPTS_KEY]: prompts }); buildList(); hideAddArea(); showToast('Saved'); } catch { showToast('Save failed'); }
  });

  // settings handlers
  settingsBtn.addEventListener('click', () => { if (settingsArea.classList.contains('open')) hideSettingsArea(); else showSettingsArea(); });
  sCancel.addEventListener('click', () => hideSettingsArea());
  sSave.addEventListener('click', async () => {
    const newS: Settings = {
      popupHeightVh: Number(sPopupH.value) || settings.popupHeightVh,
      popupWidthPx: Number(sPopupW.value) || settings.popupWidthPx,
      fontFamily: sFont.value || settings.fontFamily,
      theme: (sTheme.value as 'light' | 'dark') || settings.theme,
      hotspotPosition: (sHotpos.value as 'corner' | 'edge') || settings.hotspotPosition,
      hotspotWidthPx: Number(sHotw.value) || settings.hotspotWidthPx
    };
    settings = newS; applySettingsToHost(host, settings);
    try { await setStorage({ [SETTINGS_KEY]: settings }); hideSettingsArea(); showToast('Settings saved'); } catch { showToast('Save failed'); }
  });

  // Focus search input when showing panel via Alt+P (message source 'keyboard')
  chrome.runtime.onMessage.addListener((msg: any) => {
    if (msg?.type === 'TOGGLE_POPUP') {
      const origin = msg.source || '';
      if (!panel.classList.contains('open')) {
        showPanel();
        setTimeout(() => searchInput?.focus(), 60);
      } else {
        hidePanel();
      }
    }
  });

  // persist size when user resizes via native resize (mouseup) — keep existing behavior too
  panel.addEventListener('mouseup', async () => {
    const w = panel.offsetWidth;
    const hPx = panel.offsetHeight;
    const vh = Math.round((hPx / window.innerHeight) * 100);
    settings.popupWidthPx = w;
    settings.popupHeightVh = vh;
    applySettingsToHost(host, settings);
    try { await setStorage({ [SETTINGS_KEY]: settings }); } catch {}
  });

  // search filtering live
  searchInput.addEventListener('input', () => buildList());

  // storage.onChanged -> keep UI in sync across tabs
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes[PROMPTS_KEY]) {
      prompts = changes[PROMPTS_KEY].newValue ?? [];
      buildList();
    }
    if (changes[SETTINGS_KEY]) {
      settings = changes[SETTINGS_KEY].newValue ?? settings;
      applySettingsToHost(host, settings);
    }
  });

  // --- RESIZE: allow pulling any edge or corner ---
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
        // basic styles; we'll position precisely later
        Object.assign(el.style, {
          position: 'absolute',
          zIndex: '2147483652',
          background: 'transparent',
          width: '12px',
          height: '12px',
          cursor: getCursorForDir(d)
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

    // pointerdown handlers
    panel.querySelectorAll<HTMLElement>('.resize-handle').forEach((el) => {
      el.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        (ev.target as HTMLElement).setPointerCapture?.((ev as PointerEvent).pointerId);
        startResize((ev as PointerEvent).clientX, (ev as PointerEvent).clientY, (el.className || '').replace('resize-handle','').trim());
      });
    });

    // set positions next tick
    setTimeout(setPositions, 0);
  }

  function startResize(mouseX: number, mouseY: number, cls: string) {
    isResizing = true;
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
    resizeDir = null;
    document.documentElement.style.userSelect = '';
    // persist new size to settings (convert height px -> vh)
    settings.popupWidthPx = panel.offsetWidth;
    const vh = Math.round((panel.offsetHeight / window.innerHeight) * 100);
    settings.popupHeightVh = vh;
    applySettingsToHost(host, settings);
    try { await setStorage({ [SETTINGS_KEY]: settings }); } catch {}
  });

  // ensure handles exist
  ensureResizeHandles();

  // --- Global outside-click: close when clicking outside panel (respects tolerance and editing) ---
  function isNodeInsidePanel(node: EventTarget | null) {
    if (!node) return false;
    // event.composedPath works with shadow DOM
    try {
      const path = (node as any)?.composedPath?.();
      if (Array.isArray(path)) return path.includes(panel) || path.includes(host);
    } catch {}
    return false;
  }

  document.addEventListener('mousedown', (ev) => {
    // only react when panel is open
    if (!panel.classList.contains('open')) return;
    // if click was inside panel or host, ignore
    const path = (ev as any).composedPath ? (ev as any).composedPath() : (ev as any).path || [];
    if (Array.isArray(path) && (path.includes(panel) || path.includes(host))) return;
    // if clicked inside 10px tolerance area, ignore
    const rect = panel.getBoundingClientRect();
    if (isPointInsideExtendedRect((ev as MouseEvent).clientX, (ev as MouseEvent).clientY, rect, CLOSE_TOLERANCE_PX)) return;
    if (!isAddingOrEditing) panel.classList.remove('open');
  });

  // also hide on window blur (user switches tab/window)
  window.addEventListener('blur', () => { if (!isAddingOrEditing) panel.classList.remove('open'); });

  // close on Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && panel.classList.contains('open') && !isAddingOrEditing) {
      panel.classList.remove('open');
    }
  });
}

/* initialization */
async function loadAndInit() {
  try { const p = await getStorage<Prompt[]>(PROMPTS_KEY); prompts = Array.isArray(p) ? p : []; } catch { prompts = []; }
  try { const s = await getStorage<Settings>(SETTINGS_KEY); settings = s ? s : DEFAULT_SETTINGS; } catch { settings = DEFAULT_SETTINGS; }
  const { host, shadow } = createOrGetHost();
  applySettingsToHost(host, settings);
  await renderUI(host, shadow);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => loadAndInit().catch(console.error), { once: true });
else loadAndInit().catch(console.error);
