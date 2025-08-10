// src/content.ts
// Content script (TypeScript) — Shadow-DOM-isolated Prompt Drawer (flat list only)
//
// Requires: src/lib/storage.ts with exported getStorage/setStorage that use chrome.storage.sync
//
// Path: /home/auriga/Desktop/Projects/prompt manager/src/content.ts

import { getStorage, setStorage } from './lib/storage';

type Prompt = { id: string; title: string; text: string };

const STORAGE_KEY = 'promptManager.prompts';
const HOST_ID = 'prompt-drawer-host-shadow';

let prompts: Prompt[] = [];
let isAddingOrEditing = false;
let editingId: string | null = null;

// ---------- Helpers ----------
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

// ---------- Create host & shadow root ----------
function createOrGetHost(): ShadowRoot {
  // If host exists, reuse it and return its shadowRoot
  const existing = document.getElementById(HOST_ID) as HTMLElement | null;
  if (existing && existing.shadowRoot) {
    return existing.shadowRoot;
  }

  // Remove any stale element with same id (defensive)
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  // make sure host does not interfere with page layout
  Object.assign(host.style, {
    all: 'initial',
  });
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Base HTML inside shadow
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
        background: #cfeeff; /* visible light-blue */
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

      /* Popup panel */
      .panel {
        position: fixed;
        right: 12px;
        bottom: 72px;
        width: 360px;
        height: 50vh; /* half viewport */
        z-index: 2147483651;
        border-radius: 12px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.28);
        overflow: hidden;
        display: none;
        flex-direction: column;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        color: #e8f6ff;
        /* metallic blue gradient */
        background: linear-gradient(145deg, #1e3c72 0%, #2a5298 60%, #3b6bb8 100%);
        border: 1px solid rgba(255,255,255,0.08);
        padding: 10px;
        box-sizing: border-box;
      }

      .panel.open { display: flex; }

      /* Header */
      .header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        padding: 6px 4px;
      }
      .title {
        font-weight:700;
        font-size:14px;
        color: #f8ffff;
      }
      .close-btn {
        background: rgba(255,255,255,0.06);
        border: none;
        color: #fff;
        padding: 6px 8px;
        border-radius: 8px;
        cursor: pointer;
        font-weight:600;
      }

      /* List area */
      .list {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 6px;
        margin-top: 6px;
      }

      .row {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        padding: 8px;
        border-radius: 8px;
        background: rgba(255,255,255,0.02);
        margin-bottom: 8px;
        min-height:44px;
      }
      .row:hover { background: rgba(255,255,255,0.04); }

      .row .label {
        flex: 1 1 auto;
        font-weight:600;
        color: #f0fbff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      .icons {
        display:flex;
        gap:6px;
        flex: 0 0 auto;
      }
      .icon-btn {
        background: rgba(255,255,255,0.06);
        border: none;
        color: #e8f6ff;
        width:32px;
        height:32px;
        border-radius:6px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
      }
      .icon-btn:hover { background: rgba(255,255,255,0.12); }

      /* Add/Edit area (hidden while not adding) */
      .add-area {
        margin-top: 8px;
        display: none;
        flex-direction: column;
        gap: 8px;
      }
      .add-area.open { display:flex; }
      .add-area input[type="text"], .add-area textarea {
        width:100%;
        padding:8px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02);
        color: #eaf9ff;
        font-size:13px;
        box-sizing: border-box;
      }
      .add-area textarea { min-height:110px; resize:vertical; }

      .add-actions {
        display:flex;
        gap:8px;
        justify-content:flex-end;
      }
      .btn {
        background: rgba(255,255,255,0.06);
        color: #fff;
        border: none;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .btn.primary {
        background: linear-gradient(90deg,#54a0ff,#2b7bdb);
        font-weight:700;
      }

      /* Empty state */
      .empty {
        color: rgba(235,245,255,0.8);
        padding: 18px;
        text-align:center;
      }

      /* Toast */
      .toast {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 12px;
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        opacity: 0;
        transition: opacity 0.18s, transform 0.18s;
      }
      .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

      /* scrollbar */
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

// ---------- Render & UI logic (all inside shadow) ----------
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
  function hidePanel() {
    if (!isAddingOrEditing) panel.classList.remove('open');
  }
  function showAddArea(prefillTitle = '', prefillBody = '') {
    isAddingOrEditing = true;
    editingId = null;
    inputTitle.value = prefillTitle;
    inputBody.value = prefillBody;
    addArea.classList.add('open');
    addArea.setAttribute('aria-hidden', 'false');
    // hide list while adding
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

  // build the list items
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

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = p.title;
      // clicking title copies full prompt to clipboard
      label.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(p.text);
          showToast('Copied to clipboard');
        } catch {
          showToast('Copy failed');
        }
      });

      const icons = document.createElement('div');
      icons.className = 'icons';

      // Edit icon (pencil)
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✎';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = p.id;
        showAddArea(p.title, p.text);
      });

      // Delete icon (trash)
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '🗑';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this prompt?')) {
          prompts = prompts.filter((x) => x.id !== p.id);
          setStorage({ [STORAGE_KEY]: prompts }).then(() => {
            buildList();
            showToast('Deleted');
          }).catch(() => showToast('Delete failed'));
        }
      });

      icons.appendChild(editBtn);
      icons.appendChild(delBtn);

      row.appendChild(label);
      row.appendChild(icons);
      list.appendChild(row);
    }
  }

  // wire events
  hotzone.addEventListener('mouseenter', () => showPanel());
  // close on panel leave
  panel.addEventListener('mouseleave', () => hidePanel());

  addBtn.addEventListener('click', () => {
    showAddArea();
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
  });

  cancelBtn.addEventListener('click', () => {
    hideAddArea();
  });

  saveBtn.addEventListener('click', async () => {
    const title = inputTitle.value.trim();
    const text = inputBody.value.trim();
    if (!title || !text) {
      alert('Both title and prompt are required');
      return;
    }

    if (editingId) {
      // update existing
      const idx = prompts.findIndex((x) => x.id === editingId);
      if (idx !== -1) {
        prompts[idx] = { ...prompts[idx], title, text };
      }
    } else {
      // add new on top
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

  // build initial list
  buildList();
}

// ---------- Storage load ----------
async function loadAndInit() {
  try {
    const data = await getStorage<Prompt[]>(STORAGE_KEY);
    prompts = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('storage.load failed', e);
    prompts = [];
  }

  const shadow = createOrGetHost();
  // render UI and attach event handlers
  await renderUI(shadow);
}

// run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { loadAndInit().catch(console.error); }, { once: true });
} else {
  loadAndInit().catch(console.error);
}
