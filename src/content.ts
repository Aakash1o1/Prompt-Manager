// src/content.ts
import { getStorage, setStorage } from './lib/storage';

type Prompt = { id: string; title: string; text: string };

const STORAGE_KEY = 'promptManager.prompts';
const HOST_ID = 'prompt-drawer-host-shadow';

let prompts: Prompt[] = [];
let isAddingOrEditing = false;
let editingId: string | null = null;
let draggedId: string | null = null;

/* ---------- Helpers ---------- */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- Shadow host ---------- */
function createOrGetHost(): ShadowRoot {
  const existing = document.getElementById(HOST_ID) as HTMLElement | null;
  if (existing && existing.shadowRoot) return existing.shadowRoot;
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  Object.assign(host.style, { all: 'initial' });
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }

      /* Hotzone */
      .hotzone {
        position: fixed;
        right: 10px;
        bottom: 10px;
        width: 48px;
        height: 48px;
        background: #cfeeff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483650;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.14);
        user-select: none;
        font-size: 18px;
        color: #05314f;
      }

      /* Panel */
      .panel {
        position: fixed;
        right: 12px;
        bottom: 72px;
        width: 360px;
        height: 50vh;
        z-index: 2147483651;
        border-radius: 12px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.28);
        overflow: hidden;
        display: none;
        flex-direction: column;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        color: #e8f6ff;
        background: linear-gradient(145deg, #1e3c72 0%, #2a5298 60%, #3b6bb8 100%);
        border: 1px solid rgba(255,255,255,0.08);
        padding: 10px;
        box-sizing: border-box;
      }
      .panel.open { display: flex; }

      .header { display:flex; align-items:center; justify-content:space-between; gap:8px; padding: 6px 4px; }
      .title { font-weight:700; font-size:14px; color: #f8ffff; }
      .close-btn { background: rgba(255,255,255,0.06); border: none; color: #fff; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-weight:600; }

      /* List */
      .list { flex: 1 1 auto; overflow-y: auto; padding: 6px; margin-top: 6px; position: relative; }
      .row {
        display:flex; align-items:center; gap:8px;
        padding: 6px 8px; border-radius: 8px; background: rgba(255,255,255,0.02); margin-bottom: 8px;
        min-height: 36px; /* reduced default height */
        transition: transform 160ms ease, background-color 120ms ease, opacity 120ms ease;
      }
      .row.heading-row { min-height: 30px; } /* decreased heading bubble height */

      .row.dragging { opacity: 0.55; transform: scale(0.98); }
      .row.drop-target { outline: 2px dashed rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); }

      .left { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
      .drag-handle {
        width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;
        background: rgba(255,255,255,0.04); color:#e8f6ff; cursor:grab; user-select:none;
      }
      .drag-handle:active { cursor:grabbing; }
      .label { flex:1; font-weight:600; color:#f0fbff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:default; }

      .icons { display:flex; gap:6px; flex: 0 0 auto; }
      .icon-btn { background: rgba(255,255,255,0.06); border: none; color: #e8f6ff; width:32px; height:32px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
      .icon-btn:hover { background: rgba(255,255,255,0.12); }

      .placeholder {
        height: 12px;
        margin: 4px 0;
        border-radius: 6px;
        background: rgba(255,255,255,0.08);
        transition: height 120ms ease, background-color 120ms ease;
      }

      .add-area { margin-top: 8px; display: none; flex-direction: column; gap: 8px; }
      .add-area.open { display:flex; }
      .add-area input[type="text"], .add-area textarea {
        width:100%; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02); color: #eaf9ff; font-size:13px; box-sizing: border-box;
      }
      .add-area textarea { min-height:110px; resize:vertical; }

      .add-actions { display:flex; gap:8px; justify-content:flex-end; }
      .btn { background: rgba(255,255,255,0.06); color: #fff; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
      .btn.primary { background: linear-gradient(90deg,#54a0ff,#2b7bdb); font-weight:700; }

      .empty { color: rgba(235,245,255,0.8); padding: 18px; text-align:center; }
      .toast { position: absolute; left: 50%; transform: translateX(-50%); bottom: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px; opacity: 0; transition: opacity 0.18s, transform 0.18s; }
      .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

      .list::-webkit-scrollbar { width: 8px; }
      .list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px; }
    </style>

    <div class="hotzone" id="hotzone" title="Open Prompt Drawer">💬</div>

    <div class="panel" id="panel" role="dialog" aria-label="Prompt Drawer">
      <div class="header">
        <div class="title">Prompt Drawer</div>
        <div style="display:flex;gap:6px">
          <button class="btn" id="add-btn" title="Add prompt">Add</button>
          <button class="close-btn" id="close-btn" title="Close">✕</button>
        </div>
      </div>

      <div class="list" id="list" role="list"></div>

      <div class="add-area" id="add-area" aria-hidden="true">
        <input type="text" id="input-title" placeholder="Prompt title" />
        <textarea id="input-body" placeholder="Full prompt text"></textarea>
        <div class="add-actions">
          <button class="btn" id="cancel-btn">Cancel</button>
          <button class="btn primary" id="save-btn">Save</button>
        </div>
      </div>

      <div class="toast" id="toast" aria-hidden="true"></div>
    </div>
  `;

  return shadow;
}

/* ---------- FLIP animation helpers ---------- */
function getRectsMap(shadow: ShadowRoot): Map<string, DOMRect> {
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
    // force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetHeight;
    requestAnimationFrame(() => {
      el.style.transition = 'transform 180ms ease';
      el.style.transform = '';
      const clean = () => {
        el.style.transition = '';
        el.style.transform = '';
        el.removeEventListener('transitionend', clean);
      };
      el.addEventListener('transitionend', clean);
    });
  });
}

/* ---------- UI rendering & DnD logic ---------- */
async function renderUI(shadow: ShadowRoot) {
  const hotzone = shadow.getElementById('hotzone') as HTMLElement;
  const panel = shadow.getElementById('panel') as HTMLElement;
  const list = shadow.getElementById('list') as HTMLElement;
  const addArea = shadow.getElementById('add-area') as HTMLElement;
  const inputTitle = shadow.getElementById('input-title') as HTMLInputElement;
  const inputBody = shadow.getElementById('input-body') as HTMLTextAreaElement;
  const addBtn = shadow.getElementById('add-btn') as HTMLButtonElement;
  const saveBtn = shadow.getElementById('save-btn') as HTMLButtonElement;
  const cancelBtn = shadow.getElementById('cancel-btn') as HTMLButtonElement;
  const closeBtn = shadow.getElementById('close-btn') as HTMLButtonElement;
  const toastEl = shadow.getElementById('toast') as HTMLElement;

  function showPanel() { panel.classList.add('open'); }
  function hidePanel() { if (!isAddingOrEditing) panel.classList.remove('open'); }
  function showAddArea(prefillTitle = '', prefillBody = '') {
    isAddingOrEditing = true;
    editingId = null;
    inputTitle.value = prefillTitle;
    inputBody.value = prefillBody;
    addArea.classList.add('open');
    addArea.setAttribute('aria-hidden', 'false');
    list.style.display = 'none';
  }
  function hideAddArea() {
    isAddingOrEditing = false;
    editingId = null;
    addArea.classList.remove('open');
    addArea.setAttribute('aria-hidden', 'true');
    list.style.display = 'block';
    inputTitle.value = '';
    inputBody.value = '';
  }
  function showToast(msg: string) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => { toastEl.classList.remove('show'); }, 1400);
  }

  // placeholder element used to show drop insertion point
  let placeholder: HTMLElement | null = null;
  function ensurePlaceholder() {
    if (placeholder) return placeholder;
    placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    return placeholder;
  }
  function removePlaceholder() {
    if (!placeholder) return;
    if (placeholder.parentElement) placeholder.parentElement.removeChild(placeholder);
    placeholder = null;
  }

  // Build list items and wire drag handles
  function buildList() {
    list.innerHTML = '';

    if (!prompts.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = 'No prompts yet. Click Add to create one.';
      list.appendChild(e);
      return;
    }

    for (const p of prompts) {
      const row = document.createElement('div');
      row.className = 'row';
      row.dataset.id = p.id;
      // left: handle + label
      const left = document.createElement('div');
      left.className = 'left';
      const handle = document.createElement('div');
      handle.className = 'drag-handle';
      handle.innerHTML = '&#x2261;'; // ≡
      handle.title = 'Drag to reorder';
      // make handle draggable only
      handle.draggable = true;

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = p.title;
      label.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(p.text); showToast('Copied to clipboard'); } catch { showToast('Copy failed'); }
      });

      left.appendChild(handle);
      left.appendChild(label);

      // icons
      const icons = document.createElement('div');
      icons.className = 'icons';
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit';
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = p.id;
        showAddArea(p.title, p.text);
      });
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete';
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this prompt?')) {
          prompts = prompts.filter((x) => x.id !== p.id);
          setStorage({ [STORAGE_KEY]: prompts })
            .then(() => { buildList(); showToast('Deleted'); })
            .catch(() => showToast('Delete failed'));
        }
      });
      icons.appendChild(editBtn);
      icons.appendChild(delBtn);

      row.appendChild(left);
      row.appendChild(icons);
      list.appendChild(row);

      // Drag start only from handle
      handle.addEventListener('dragstart', (ev) => {
        draggedId = p.id;
        row.classList.add('dragging');
        try { ev.dataTransfer?.setData('text/plain', p.id); } catch {}
      });
      handle.addEventListener('dragend', () => {
        draggedId = null;
        shadow.querySelectorAll('.row.dragging').forEach((el) => el.classList.remove('dragging'));
        removePlaceholder();
      });

      // Prevent dropping *on top* to reorder. We'll handle between-insertions via list dragover.
      row.addEventListener('dragover', (ev) => {
        // do nothing - we handle insertion between items globally
        ev.preventDefault(); // still allow drop events to bubble
      });
      row.addEventListener('drop', (ev) => {
        // user dropped *on* a bubble — we skip reorder here (user said they'll add separate feature)
        ev.preventDefault();
        // optionally you could trigger some other action here in the future
        removePlaceholder();
      });
    }

    // add end drop spacer so user can drop at end
    const endSpacer = document.createElement('div');
    endSpacer.style.minHeight = '12px';
    endSpacer.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      // place placeholder at end
      const ph = ensurePlaceholder();
      if (list.lastElementChild !== ph) list.appendChild(ph);
    });
    endSpacer.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const srcId = draggedId ?? ev.dataTransfer?.getData('text/plain') ?? null;
      if (!srcId) return;
      // perform move to end with animation
      const before = getRectsMap(shadow);
      movePromptToIndex(srcId, prompts.length - 1, before);
      removePlaceholder();
    });
    list.appendChild(endSpacer);

    // global list dragover: compute between index based on mouse Y
    list.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      const ph = ensurePlaceholder();
      // find insertion index by comparing mouse Y to midpoints of row elements
      const rows = Array.from(list.querySelectorAll<HTMLElement>('.row'));
      let inserted = false;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rect = r.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (ev.clientY < mid) {
          if (r.parentElement && r.parentElement.querySelector('.placeholder') !== r) {
            list.insertBefore(ph, r);
          }
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        // append at end (before endSpacer)
        const end = list.lastElementChild!;
        if (end && end !== ph) list.insertBefore(ph, end);
      }
    });

    // drop on list (if user releases over list area)
    list.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const srcId = draggedId ?? ev.dataTransfer?.getData('text/plain') ?? null;
      if (!srcId) { removePlaceholder(); return; }
      // compute index from placeholder position
      const ph = list.querySelector('.placeholder');
      if (!ph) { removePlaceholder(); return; }
      // determine index to insert
      const children = Array.from(list.children);
      const idx = children.indexOf(ph);
      // convert children index to prompt array index (rows and possibly other elements)
      // we count only '.row' elements before the placeholder
      let targetIndex = 0;
      for (let i = 0; i < idx; i++) {
        if ((children[i] as HTMLElement).classList.contains('row')) targetIndex++;
      }
      // perform move
      const before = getRectsMap(shadow);
      movePromptToIndex(srcId, targetIndex, before);
      removePlaceholder();
    });
  }

  // move srcId to position targetIndex (0..n) — targetIndex is index in prompts AFTER removal to insert at
  function movePromptToIndex(srcId: string, targetIndex: number, beforeRects?: Map<string, DOMRect>) {
    const srcIndex = prompts.findIndex((x) => x.id === srcId);
    if (srcIndex === -1) return;
    // remove item
    const [item] = prompts.splice(srcIndex, 1);
    // adjust targetIndex if srcIndex < targetIndex because removal shifts indices
    const insertAt = srcIndex < targetIndex ? targetIndex : targetIndex;
    prompts.splice(insertAt, 0, item);
    // persist and animate
    setStorage({ [STORAGE_KEY]: prompts })
      .then(() => {
        // rebuild list and animate FLIP
        buildAndAnimate(beforeRects);
        showToast('Order saved');
      })
      .catch(() => {
        showToast('Save failed');
      });
  }

  function movePromptToEnd(srcId: string) {
    const srcIndex = prompts.findIndex((x) => x.id === srcId);
    if (srcIndex === -1) return;
    const [item] = prompts.splice(srcIndex, 1);
    prompts.push(item);
    const before = getRectsMap(shadow);
    setStorage({ [STORAGE_KEY]: prompts })
      .then(() => {
        buildAndAnimate(before);
        showToast('Order saved');
      })
      .catch(() => showToast('Save failed'));
  }

  // helper: rebuild list and play FLIP using provided before rects map
  function buildAndAnimate(before?: Map<string, DOMRect>) {
    buildList();
    if (before) playFLIP(shadow, before);
  }

  // initial build (first time)
  buildList();

  /* ---------- events wiring ---------- */
  hotzone.addEventListener('mouseenter', () => showPanel());
  panel.addEventListener('mouseleave', () => hidePanel());
  addBtn.addEventListener('click', () => showAddArea());
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  cancelBtn.addEventListener('click', () => hideAddArea());

  saveBtn.addEventListener('click', async () => {
    const title = inputTitle.value.trim();
    const text = inputBody.value.trim();
    if (!title || !text) { alert('Both title and prompt are required'); return; }

    if (editingId) {
      const idx = prompts.findIndex((x) => x.id === editingId);
      if (idx !== -1) prompts[idx] = { ...prompts[idx], title, text };
    } else {
      const newPrompt: Prompt = { id: uid(), title, text };
      prompts.unshift(newPrompt);
    }

    try {
      await setStorage({ [STORAGE_KEY]: prompts });
      buildList();
      hideAddArea();
      showToast('Saved');
    } catch {
      showToast('Save failed');
    }
  });
}

/* ---------- init ---------- */
async function loadAndInit() {
  try {
    const data = await getStorage<Prompt[]>(STORAGE_KEY);
    prompts = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('storage.load failed', e);
    prompts = [];
  }

  const shadow = createOrGetHost();
  await renderUI(shadow);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { loadAndInit().catch(console.error); }, { once: true });
} else {
  loadAndInit().catch(console.error);
}
