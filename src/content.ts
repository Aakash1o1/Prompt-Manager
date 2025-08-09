// src/content.ts
import { getStorage, setStorage } from './lib/storage';

type Prompt = { id: string; title: string; text: string };

const STORAGE_KEY = 'promptManager.prompts';
const HOTZONE_ID = 'pm-hotzone';
const POPUP_ID = 'pm-popup';

// --- DOM creation (host elements) ---
function createHostElements() {
  // remove old if present (avoid duplicates)
  document.getElementById(HOTZONE_ID)?.remove();
  document.getElementById(POPUP_ID)?.remove();

  const hotzone = document.createElement('div');
  hotzone.id = HOTZONE_ID;
  hotzone.setAttribute('title', 'Open Prompt Manager');
  document.body.appendChild(hotzone);

  const popup = document.createElement('div');
  popup.id = POPUP_ID;
  popup.innerHTML = `
    <div id="pm-list" role="list"></div>
    <div id="pm-add-section">
      <button id="pm-add-btn" type="button">Add</button>
    </div>
    <div id="pm-toast" aria-hidden="true"></div>
  `;
  document.body.appendChild(popup);

  return { hotzone, popup };
}

// --- Utilities ---
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function flashToast(msg: string) {
  const t = document.getElementById('pm-toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => (t.style.opacity = '0'), 1400);
}

// --- App state & storage ---
let prompts: Prompt[] = [];
let isAdding = false;
let editingIndex: number | null = null;

async function loadPrompts() {
  const data = await getStorage<Prompt[]>(STORAGE_KEY);
  prompts = Array.isArray(data) ? data : [];
  renderList();
}
async function savePrompts() {
  await setStorage({ [STORAGE_KEY]: prompts });
}

// --- Rendering ---
function renderList() {
  const listEl = document.getElementById('pm-list')!;
  listEl.innerHTML = '';

  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'pm-empty';
    empty.textContent = 'No prompts yet.';
    listEl.appendChild(empty);
    return;
  }

  // show most recent first
  for (const p of prompts) {
    const row = document.createElement('div');
    row.className = 'pm-item';

    const title = document.createElement('div');
    title.className = 'pm-title';
    title.textContent = p.title;
    title.title = 'Click to copy full prompt';
    title.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(p.text);
        flashToast('Copied prompt to clipboard');
      } catch {
        flashToast('Copy failed');
      }
    });

    const icons = document.createElement('div');
    icons.className = 'pm-icons';

    const editBtn = document.createElement('button');
    editBtn.className = 'pm-icon-btn';
    editBtn.setAttribute('aria-label', 'Edit');
    editBtn.innerHTML = '&#9998;'; // pencil
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startEditPrompt(p.id);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'pm-icon-btn';
    delBtn.setAttribute('aria-label', 'Delete');
    delBtn.innerHTML = '&#128465;'; // trash
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this prompt?')) {
        prompts = prompts.filter((x) => x.id !== p.id);
        savePrompts().then(renderList);
      }
    });

    icons.appendChild(editBtn);
    icons.appendChild(delBtn);

    row.appendChild(title);
    row.appendChild(icons);
    listEl.appendChild(row);
  }
}

// --- Add / Edit flows ---
function startAddPrompt() {
  isAdding = true;
  editingIndex = null;
  const listEl = document.getElementById('pm-list')!;
  const addSection = document.getElementById('pm-add-section')!;
  listEl.style.display = 'none';
  addSection.innerHTML = `
    <input id="pm-title-input" type="text" placeholder="Title" />
    <textarea id="pm-text-input" placeholder="Full prompt"></textarea>
    <div class="pm-add-actions">
      <button id="pm-save-btn">Save</button>
      <button id="pm-cancel-btn">Cancel</button>
    </div>
  `;

  (document.getElementById('pm-cancel-btn') as HTMLButtonElement).addEventListener('click', stopAddEdit);
  (document.getElementById('pm-save-btn') as HTMLButtonElement).addEventListener('click', async () => {
    const title = (document.getElementById('pm-title-input') as HTMLInputElement).value.trim();
    const text = (document.getElementById('pm-text-input') as HTMLTextAreaElement).value.trim();
    if (!title || !text) {
      alert('Both title and prompt are required');
      return;
    }
    prompts.unshift({ id: uid(), title, text });
    await savePrompts();
    stopAddEdit();
    renderList();
  });
}

function startEditPrompt(id: string) {
  isAdding = true;
  const idx = prompts.findIndex((p) => p.id === id);
  if (idx === -1) return;
  editingIndex = idx;
  const listEl = document.getElementById('pm-list')!;
  const addSection = document.getElementById('pm-add-section')!;
  listEl.style.display = 'none';
  const p = prompts[idx];
  addSection.innerHTML = `
    <input id="pm-title-input" type="text" value="${escapeHtml(p.title)}" />
    <textarea id="pm-text-input">${escapeHtml(p.text)}</textarea>
    <div class="pm-add-actions">
      <button id="pm-update-btn">Update</button>
      <button id="pm-cancel-btn">Cancel</button>
    </div>
  `;

  (document.getElementById('pm-cancel-btn') as HTMLButtonElement).addEventListener('click', stopAddEdit);
  (document.getElementById('pm-update-btn') as HTMLButtonElement).addEventListener('click', async () => {
    const title = (document.getElementById('pm-title-input') as HTMLInputElement).value.trim();
    const text = (document.getElementById('pm-text-input') as HTMLTextAreaElement).value.trim();
    if (!title || !text) {
      alert('Both title and prompt are required');
      return;
    }
    prompts[idx] = { ...prompts[idx], title, text };
    await savePrompts();
    stopAddEdit();
    renderList();
  });
}

function stopAddEdit() {
  isAdding = false;
  editingIndex = null;
  const listEl = document.getElementById('pm-list')!;
  const addSection = document.getElementById('pm-add-section')!;
  listEl.style.display = 'block';
  addSection.innerHTML = `<button id="pm-add-btn" type="button">Add</button>`;
  (document.getElementById('pm-add-btn') as HTMLButtonElement).addEventListener('click', startAddPrompt);
}

// --- helpers ---
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- Initialization ---
function init() {
  const { hotzone, popup } = createHostElements();

  // wire hover to show popup immediately
  hotzone.addEventListener('mouseenter', () => {
    popup.style.display = 'flex';
  });
  popup.addEventListener('mouseleave', () => {
    if (!isAdding) popup.style.display = 'none';
  });

  // initial add button
  (document.getElementById('pm-add-btn') as HTMLButtonElement).addEventListener('click', startAddPrompt);

  // load data
  loadPrompts().catch((e) => console.error('loadPrompts failed', e));
}

// run
init();
