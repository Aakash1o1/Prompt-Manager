// src/background.ts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-prompt-drawer') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var _a;
            if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_POPUP' });
            }
        });
    }
});
// src/content.ts
// Content script for Prompt Manager
// IMPORTANT: do NOT declare 'chrome' here. Install @types/chrome instead.
let prompts = [];
let isAdding = false;
let editingIndex = null;
/**
 * Create hotzone element (light-blue)
 */
const hotzone = document.createElement('div');
hotzone.id = 'pm-hotzone';
hotzone.setAttribute('title', 'Open Prompt Manager');
document.body.appendChild(hotzone);
/**
 * Create popup container
 */
const popup = document.createElement('div');
popup.id = 'pm-popup';
popup.innerHTML = `
  <div id="pm-list" aria-live="polite"></div>
  <div id="pm-add-section">
    <button id="pm-add-btn" type="button">Add</button>
  </div>
  <div id="pm-toast" aria-hidden="true"></div>
`;
document.body.appendChild(popup);
/**
 * Utilities: escape HTML safely without replaceAll
 */
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
/**
 * Storage helpers using chrome.storage.sync
 */
function loadPrompts() {
    chrome.storage.sync.get(['prompts'], (data) => {
        var _a;
        prompts = (_a = data === null || data === void 0 ? void 0 : data.prompts) !== null && _a !== void 0 ? _a : [];
        renderList();
    });
}
function savePrompts() {
    chrome.storage.sync.set({ prompts });
}
/**
 * Show/Hide popup: instant show on hotzone hover
 */
hotzone.addEventListener('mouseenter', () => {
    popup.style.display = 'flex';
});
popup.addEventListener('mouseleave', () => {
    if (!isAdding)
        popup.style.display = 'none';
});
/**
 * Render list of titles. Clicking the title copies the full prompt text to clipboard.
 * The popup height is 50vh (CSS); the list will scroll automatically.
 */
function renderList() {
    const listEl = document.getElementById('pm-list');
    listEl.innerHTML = '';
    if (!prompts.length) {
        const empty = document.createElement('div');
        empty.className = 'pm-empty';
        empty.textContent = 'No prompts yet.';
        listEl.appendChild(empty);
        return;
    }
    prompts.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = 'pm-item';
        // Title only visible in list. Clicking title copies full prompt text.
        const titleEl = document.createElement('div');
        titleEl.className = 'pm-title';
        titleEl.textContent = p.title;
        titleEl.title = 'Click to copy full prompt';
        titleEl.addEventListener('click', () => {
            navigator.clipboard.writeText(p.text).then(() => {
                flashToast('Copied prompt to clipboard');
            }).catch(() => {
                flashToast('Copy failed');
            });
        });
        // Edit icon
        const editBtn = document.createElement('button');
        editBtn.className = 'pm-icon-btn';
        editBtn.setAttribute('aria-label', 'Edit');
        editBtn.innerHTML = '&#9998;'; // pencil
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startEditPrompt(idx);
        });
        // Delete icon (on header right)
        const delBtn = document.createElement('button');
        delBtn.className = 'pm-icon-btn';
        delBtn.setAttribute('aria-label', 'Delete');
        delBtn.innerHTML = '&#128465;'; // trash
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this prompt?')) {
                prompts.splice(idx, 1);
                savePrompts();
                renderList();
            }
        });
        item.appendChild(titleEl);
        // wrapper for icons
        const iconWrap = document.createElement('div');
        iconWrap.className = 'pm-icons';
        iconWrap.appendChild(editBtn);
        iconWrap.appendChild(delBtn);
        item.appendChild(iconWrap);
        listEl.appendChild(item);
    });
}
/**
 * Add flow
 */
function startAddPrompt() {
    isAdding = true;
    const listEl = document.getElementById('pm-list');
    const addSection = document.getElementById('pm-add-section');
    listEl.style.display = 'none';
    addSection.innerHTML = `
    <input id="pm-title-input" type="text" placeholder="Title" />
    <textarea id="pm-text-input" placeholder="Full prompt"></textarea>
    <div class="pm-add-actions">
      <button id="pm-save-btn">Save</button>
      <button id="pm-cancel-btn">Cancel</button>
    </div>
  `;
    document.getElementById('pm-cancel-btn')
        .addEventListener('click', () => stopAddEdit());
    document.getElementById('pm-save-btn')
        .addEventListener('click', () => {
        const title = document.getElementById('pm-title-input').value.trim();
        const text = document.getElementById('pm-text-input').value.trim();
        if (!title || !text) {
            alert('Both title and prompt are required');
            return;
        }
        prompts.unshift({ title, text });
        savePrompts();
        stopAddEdit();
        renderList();
    });
}
/**
 * Edit flow
 */
function startEditPrompt(index) {
    isAdding = true;
    editingIndex = index;
    const listEl = document.getElementById('pm-list');
    const addSection = document.getElementById('pm-add-section');
    listEl.style.display = 'none';
    const p = prompts[index];
    addSection.innerHTML = `
    <input id="pm-title-input" type="text" value="${escapeHtml(p.title)}" />
    <textarea id="pm-text-input">${escapeHtml(p.text)}</textarea>
    <div class="pm-add-actions">
      <button id="pm-update-btn">Update</button>
      <button id="pm-cancel-btn">Cancel</button>
    </div>
  `;
    document.getElementById('pm-cancel-btn')
        .addEventListener('click', () => stopAddEdit());
    document.getElementById('pm-update-btn')
        .addEventListener('click', () => {
        const title = document.getElementById('pm-title-input').value.trim();
        const text = document.getElementById('pm-text-input').value.trim();
        if (!title || !text) {
            alert('Both title and prompt are required');
            return;
        }
        prompts[index] = { title, text };
        savePrompts();
        stopAddEdit();
        renderList();
    });
}
/**
 * Stop add/edit
 */
function stopAddEdit() {
    isAdding = false;
    editingIndex = null;
    const listEl = document.getElementById('pm-list');
    const addSection = document.getElementById('pm-add-section');
    listEl.style.display = 'block';
    addSection.innerHTML = `<button id="pm-add-btn" type="button">Add</button>`;
    document.getElementById('pm-add-btn')
        .addEventListener('click', () => startAddPrompt());
}
/**
 * Toast feedback
 */
function flashToast(msg) {
    const t = document.getElementById('pm-toast');
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 1400);
}
/**
 * Init
 */
function init() {
    document.getElementById('pm-add-btn')
        .addEventListener('click', () => startAddPrompt());
    popup.style.display = 'none';
    loadPrompts();
}
init();
