// src/content/ui.ts
// Renders the UI into the provided host/shadow and wires events.
// This file contains the core UI logic but delegates FLIP & resize helpers.

import { getStorage, setStorage } from '../lib/storage';
import { getRectsMap, playFLIP } from './drag';
import { setupResizeHandles } from './resize';

type Prompt = { id: string; title: string; text: string; quick?: string; tags?: string[] };
type Tag = { id: string; name: string; color: string; order: number };
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
  tags: Tag[];
  settings: Settings;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
}) {
  const { host, shadow, PROMPTS_KEY, SETTINGS_KEY, TAGS_KEY } = opts;
  let prompts: Prompt[] = opts.prompts || [];
  let tags: Tag[] = opts.tags || [];
  let settings: Settings = opts.settings;

  // --- NEW: Selection state ---
  let selectedIndex = 0;
  let filteredPrompts: Prompt[] = [];

  // ensure prompts have tags arrays
  prompts = prompts.map(p => ({ ...p, tags: p.tags ? Array.from(p.tags) : [] }));

  // grab elements
  const hotzone = shadow.getElementById('hotzone') as HTMLElement;
  const panel = shadow.getElementById('panel') as HTMLElement;
  const list = shadow.getElementById('list') as HTMLElement;
  const addArea = shadow.getElementById('add-area') as HTMLElement;
  const addTagsContainer = shadow.getElementById('add-tags') as HTMLElement;

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

  // Tags UI elements
  const tagsBtn = shadow.getElementById('tags-btn') as HTMLButtonElement;
  const tagsDropdown = shadow.getElementById('tags-dropdown') as HTMLElement;
  const tagsClearBtn = shadow.getElementById('tags-clear') as HTMLButtonElement;
  const tagsEditBtn = shadow.getElementById('tags-edit') as HTMLButtonElement;
  const tagsNewBtn = shadow.getElementById('tags-new') as HTMLButtonElement;
  const tagsList = shadow.getElementById('tags-list') as HTMLElement;

  // Handle mousedown *inside* tagsDropdown (runs inside shadow)
  // - If click is inside the color palette: do nothing (palette already stops propagation).
  // - If click is inside dropdown but outside palette: close only the palette (if open), and stopPropagation
  //   so the document handler doesn't treat this as a click *outside* and close the dropdown itself.
  tagsDropdown.addEventListener('mousedown', (ev) => {
    // Get composed path (works inside the shadow)
    const path = (ev as any).composedPath ? (ev as any).composedPath() : [ev.target];

    // If the click was inside the palette, let the palette handler handle it (it already stops propagation)
    if (colorPaletteEl && pathTouches(path, [colorPaletteEl])) {
      return;
    }

    // Click is inside tagsDropdown but NOT inside palette:
    // Close palette (if open) but keep dropdown open.
    if (colorPaletteEl) {
      closeColorPalette();
    }

    // Prevent the event from reaching the document handler which would otherwise treat this as "outside"
    ev.stopPropagation();
  });



  const sFontSize = shadow.getElementById('s-font-size') as HTMLInputElement;
  const sTheme = shadow.getElementById('s-theme') as HTMLSelectElement;
  const sHotpos = shadow.getElementById('s-hotspot-pos') as HTMLSelectElement;
  const sSave = shadow.getElementById('s-save') as HTMLButtonElement || shadow.getElementById('s-save') as any;
  const sCancel = shadow.getElementById('s-cancel') as HTMLButtonElement;
// Shared color input appended to document.body for reliable native picker behavior
const sharedColorPicker = document.createElement('input');
sharedColorPicker.type = 'color';
sharedColorPicker.style.position = 'fixed';
sharedColorPicker.style.left = '-9999px';
sharedColorPicker.style.width = '1px';
sharedColorPicker.style.height = '1px';
sharedColorPicker.setAttribute('aria-hidden', 'true');
try {
  // append to document.body (more reliable than shadow root for native pickers)
  (document.body || document.documentElement).appendChild(sharedColorPicker);
} catch (e) {
  // fallback: append to shadow if body isn't available (very unlikely)
  try { shadow.appendChild(sharedColorPicker); } catch (err) { /* ignore */ }
}


  const inputElements = [inputTitle, inputQuick, inputBody, searchInput, sFontSize, sTheme, sHotpos];
  // Prevent key events from leaking to global handlers when user is typing inside the panel.
  const stopBubbleHandler = (ev: KeyboardEvent) => {
    if (!panel.classList.contains('open')) return;
    // Let the input itself receive default behavior (typing) but stop propagation to document
    ev.stopPropagation();
  };
  panel.addEventListener('keydown', stopBubbleHandler, false);
  panel.addEventListener('keypress', stopBubbleHandler, false);
  panel.addEventListener('keyup', stopBubbleHandler, false);

  let isAddingOrEditing = false;
  let editingId: string | null = null;
  let draggedId: string | null = null;
  let placeholder: HTMLElement | null = null;
  const CLOSE_TOLERANCE_PX = 10;

  // ---------- Helper: robustly detect "click inside" with composedPath support ----------
  function pathTouches(path: any[], els: Array<Element | ShadowRoot | null>) {
    if (!Array.isArray(path)) return false;
    for (const node of path) {
      for (const el of els) {
        if (!el) continue;
        // exact match
        if (node === el) return true;
        // element contains node (descendant clicked)
        try {
          if (el instanceof Node && node instanceof Node && (el as Node).contains(node)) return true;
        } catch (e) { /* ignore cross-origin/other issues */ }
        // shadow-root entry: composedPath may include a ShadowRoot whose .host is the element
        if ((node as any)?.host && (node as any).host === el) return true;
      }
    }
    return false;
  }

  // -----------------------------
  // Backdrop helpers (single controlled backdrop)
  // -----------------------------
  let panelBackdrop: HTMLElement | null = null;

  function createPanelBackdrop() {
    if (panelBackdrop) return panelBackdrop;
    const b = document.createElement('div');
    b.className = 'panel-backdrop';
    Object.assign(b.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '9980', // intentionally lower than palette (palette uses 9999)
      background: 'transparent',
      pointerEvents: 'auto'
    });




    panelBackdrop = b;
    return b;
  }

  function attachPanelBackdrop() {
    // append to document.body only when panel opens
    const b = createPanelBackdrop();
    if (!document.body.contains(b)) document.body.appendChild(b);
  }

  function removePanelBackdrop() {
    if (!panelBackdrop) return;
    try { panelBackdrop.remove(); } catch (e) { /* ignore */ }
    panelBackdrop = null;
  }







  // Draft tags for new prompt being created (unsaved)
  let draftPromptTagIds: string[] = [];

  function uid() { return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9); }

  function stripHTMLTags(input: string) {
    if (!input) return '';
    return input.replace(/<\/?[^>]+(>|$)/g, '');
  }



  // -----------------------------
  // Color helpers
  // -----------------------------
  // Parse hex (#rrggbb or #rgb) or 'rgb(r,g,b)' into {r,g,b} or return null
  function parseColorToRgb(input: string): { r: number; g: number; b: number } | null {
    if (!input) return null;
    const s = (input || '').trim();
    // hex #rrggbb or #rgb
    if (s[0] === '#') {
      let hex = s.slice(1);
      if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
      return { r, g, b };
    }
    // rgb(...) format
    const rgbMatch = s.match(/rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)/i);
    if (rgbMatch) {
      return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
    }
    // Fallback: create element, set color, read computed style (handles named colors)
    try {
      const el = document.createElement('div');
      el.style.color = s;
      document.body.appendChild(el);
      const cs = getComputedStyle(el).color;
      el.remove();
      const m = cs.match(/rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)/i);
      if (m) return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
    } catch (e) {
      // ignore
    }
    return null;
  }

  // Return '#000' or '#fff' for readable text on top of the given background color
  function getContrastTextColor(bgColor: string): string {
    const rgb = parseColorToRgb(bgColor);
    if (!rgb) return '#000';
    // perceptual luminance
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const lum = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4))
              + 0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4))
              + 0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));
    // contrast threshold - choose white text for dark backgrounds
    return lum > 0.5 ? '#000' : '#fff';
  }

  // Build a lightly tinted background rgba() string from a color and alpha
  function tintBackground(bgColor: string, alpha = 0.08) {
    const rgb = parseColorToRgb(bgColor);
    if (!rgb) return '';
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  // -----------------------------
  // Color palette popup helper
  // -----------------------------
  // Palette configuration: a compact set of usable colors
  const COLOR_PALETTE = [
    '#FF6B6B','#FF8A65','#FFD166','#F9F871','#9AE66E','#6EE7B7','#6ECFF6','#6B9CFF',
    '#8F8CFF','#D39BFF','#FF9AD1','#FFB3E6','#D0D0D0','#A0A0A0','#7F5539','#2B2B2B'
  ];

  // palette element (created lazily)
  let colorPaletteEl: HTMLElement | null = null;
  let colorPaletteOpenForTagId: string | null = null;

  function createColorPaletteElement() {
    if (colorPaletteEl) return colorPaletteEl;
    const pal = document.createElement('div');
    pal.className = 'tag-color-palette';
    pal.setAttribute('role', 'dialog');
    pal.style.position = 'absolute';
    pal.style.zIndex = '9999';
    pal.style.padding = '8px';
    pal.style.display = 'grid';
    pal.style.gridTemplateColumns = 'repeat(8, 20px)';
    pal.style.gridGap = '8px';
    pal.style.background = 'var(--panel-bg, #111)';
    pal.style.border = '1px solid rgba(255,255,255,0.06)';
    pal.style.borderRadius = '6px';
    pal.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    pal.style.maxWidth = 'calc(100% - 16px)';
    pal.style.padding = '10px';

    for (const c of COLOR_PALETTE) {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'palette-swatch';
      sw.dataset.color = c;
      sw.style.width = '20px';
      sw.style.height = '20px';
      sw.style.borderRadius = '4px';
      sw.style.border = '1px solid rgba(0,0,0,0.18)';
      sw.style.background = c;
      sw.style.cursor = 'pointer';
      sw.style.padding = '0';
      sw.title = c;
      sw.addEventListener('click', (ev) => {
        // Prevent the click from bubbling up and being treated as "outside".
        ev.stopPropagation();
        ev.preventDefault();

        const color = (ev.currentTarget as HTMLElement).dataset.color!;
        if (!color) return;

        if (colorPaletteOpenForTagId) {
          // Apply color immediately and update UI/storage.
          recolorTag(colorPaletteOpenForTagId, color).catch(() => {});
        }

        // Keep the palette open so the user can try other colors.
        // Keep focus on the palette for keyboard support.
        try { (colorPaletteEl as HTMLElement).focus?.(); } catch (e) { /* ignore */ }
      });
      sw.addEventListener('mousedown', (ev) => ev.stopPropagation());
      pal.appendChild(sw);
    }

    // clicking inside palette shouldn't close tags dropdown
    pal.addEventListener('mousedown', (ev) => ev.stopPropagation());
    // close on Escape
    pal.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { ev.stopPropagation(); closeColorPalette(); }
    });

    colorPaletteEl = pal;
    return pal;
  }

  function openColorPaletteFor(tagId: string, anchorEl: HTMLElement) {
    const pal = createColorPaletteElement();
    colorPaletteOpenForTagId = tagId;

    // append palette into tagsDropdown (so it moves with it)
    if (!tagsDropdown) return;
    tagsDropdown.appendChild(pal);

    // compute position anchored to anchorEl within tagsDropdown
    const anchorRect = anchorEl.getBoundingClientRect();
    const containerRect = tagsDropdown.getBoundingClientRect();
    // position relative to tagsDropdown
    const left = Math.max(8, anchorRect.right - containerRect.left - pal.offsetWidth);
    // prefer aligning vertically centered over the row, but keep inside container
    const top = Math.max(8, anchorRect.top - containerRect.top - (pal.offsetHeight / 2) + (anchorRect.height / 2));

    pal.style.left = `${left}px`;
    pal.style.top = `${top}px`;

    // ensure focus for keyboard Escape
    pal.tabIndex = -1;
    pal.focus?.();
  }

  function closeColorPalette() {
    if (!colorPaletteEl) return;
    try { if (colorPaletteEl.parentElement) colorPaletteEl.parentElement.removeChild(colorPaletteEl); } catch {}
    colorPaletteOpenForTagId = null;
  }

// Document-level outside-click handler: runs only when panel is open and the event bubbles up here.
// If the event reaches this handler it means the click was NOT handled inside the dropdown/palette.
document.addEventListener('mousedown', (ev) => {
  const isPanelOpen = panel.classList.contains('open');
  if (!isPanelOpen) return;

  const path = (ev as any).composedPath ? (ev as any).composedPath() : [ev.target];

  // If click is inside the panel (but didn't get handled inside dropdown), we may want to close dropdown
  // only when click is outside the panel area. Here we treat clicks on panel/host as "inside", so we do nothing.
  if (pathTouches(path, [panel, host])) {
    // click is inside panel (but not inside dropdown/palette because those handlers stopped propagation)
    // If dropdown was open but user clicked other parts of panel we should close the dropdown.
    // (Optional) You can close tagsDropdown here; current behavior in your code closed tags dropdown
    // when clicking other parts of panel; if you prefer to keep dropdown open when clicking panel body,
    // skip the closeTagsDropdown() call.
    if (tagsDropdown.classList.contains('open')) {
      closeTagsDropdown();
    }
    return;
  }

  // Click is outside the panel entirely -> close everything
  hideAddArea();
  hideSettingsArea();
  if (tagsDropdown.classList.contains('open')) closeTagsDropdown();
  if (colorPaletteEl) closeColorPalette();
  panel.classList.remove('open');
  removePanelBackdrop();
}, false);






  function applySettingsToHost() {
    host.style.setProperty('--popup-width', `${settings.popupWidthPx}px`);
    host.style.setProperty('--popup-height', `${settings.popupHeightVh}vh`);

    host.style.setProperty('--hotspot-width', `${settings.hotspotWidthPx}px`);
    host.setAttribute('data-hotspot-position', settings.hotspotPosition);
    host.setAttribute('data-theme', settings.theme);
    if (!host.style.getPropertyValue('--font-size')) host.style.setProperty('--font-size', '13px');
    try { (shadow.getElementById('panel') as HTMLElement).style.fontSize = host.style.getPropertyValue('--font-size') || '13px'; } catch {}
  }

  function getTagsDropdownContext(): 'list' | 'edit' {
    // If the add/edit area is open, dropdown acts on prompt assignment (edit/draft)
    if (addArea.classList.contains('open')) return 'edit';
    return 'list';
  }

  // Close tags dropdown whenever UI mode changes (entering add/edit or settings)
function ensureTagsClosedOnModeChange() {
  // If tagsEditMode was left enabled, disable it when changing UI modes.
  if (tagsEditMode) {
    tagsEditMode = false;
    try { tagsEditBtn.textContent = 'Edit'; } catch {}
  }
  if (tagsDropdown && tagsDropdown.classList.contains('open')) {
    closeTagsDropdown();
  }
}




  applySettingsToHost();

  function showToast(msg: string) { toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(() => toastEl.classList.remove('show'), 1400); }

  // Placeholder utils for reorder drag
  function ensurePlaceholder() { if (placeholder) return placeholder; placeholder = document.createElement('div'); placeholder.className = 'placeholder'; return placeholder; }
  function removePlaceholder() { if (!placeholder) return; if (placeholder.parentElement) placeholder.parentElement.removeChild(placeholder); placeholder = null; }

  // -----------------------------
  // Tags: storage & selection
  // -----------------------------
  let selectedTagIds: string[] = [];
  const SELECTED_TAGS_SESSION_KEY = 'promptManager.selectedTags';
  const MAX_CHIPS_TO_SHOW = 3;

  try {
    const raw = sessionStorage.getItem(SELECTED_TAGS_SESSION_KEY);
    selectedTagIds = raw ? JSON.parse(raw) : [];
  } catch (e) {
    selectedTagIds = [];
  }

  async function saveTags() {
    try { await setStorage({ [TAGS_KEY]: tags }); } catch (e) { console.warn('Failed saving tags', e); }
  }
  async function savePrompts() {
    try { await setStorage({ [PROMPTS_KEY]: prompts }); } catch (e) { console.warn('Failed saving prompts', e); }
  }
  // ---------- Tag helpers: rename, recolor, delete ----------
  async function renameTag(id: string, newName: string) {
    // const nm = stripHTMLTags((newName || '').trim());
    const nm = newName;
    if (!nm) return false;
    if (tagNameExists(nm, id)) { showToast('Tag name already exists'); return false; }
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) return false;
    tags[idx] = { ...tags[idx], name: nm };
    await saveTags();
    renderAddTags();
    renderTagsList();
    buildList();
    return true;
  }

  async function recolorTag(id: string, color: string) {
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) return false;
    tags[idx] = { ...tags[idx], color };
    await saveTags();
    renderAddTags();
    renderTagsList();
    buildList();
    return true;
  }

  async function deleteTag(id: string) {
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const name = tags[idx].name;
    if (!confirm(`Delete tag "${name}"? This will remove it from all prompts.`)) return false;
    // remove tag
    tags.splice(idx, 1);
    // remove references on prompts
    for (const p of prompts) {
      if (Array.isArray(p.tags) && p.tags.includes(id)) {
        p.tags = p.tags.filter(x => x !== id);
      }
    }
    // persist
    await Promise.all([ saveTags(), savePrompts() ]);
    // update selected/draft selections
    selectedTagIds = selectedTagIds.filter(x => x !== id);
    draftPromptTagIds = (draftPromptTagIds || []).filter(x => x !== id);
    renderAddTags();
    renderTagsList();
    buildList();
    showToast('Tag deleted');
    return true;
  }
  // -----------------------------------------------------------





  function persistSelectedTags() {
    try { sessionStorage.setItem(SELECTED_TAGS_SESSION_KEY, JSON.stringify(selectedTagIds)); } catch (e) {}
    // update T button visual
    if (selectedTagIds.length > 0) tagsBtn.classList.add('active'); else tagsBtn.classList.remove('active');
  }
  function isTagSelected(id: string) { return selectedTagIds.includes(id); }
  function toggleTagSelection(id: string) {
    if (isTagSelected(id)) selectedTagIds = selectedTagIds.filter(x => x !== id);
    else selectedTagIds.push(id);
    persistSelectedTags();
    buildList();
    renderTagsList();
  }
  function clearTagSelection() {
    selectedTagIds = [];
    persistSelectedTags();
    buildList();
    renderTagsList();
  }

  // Helper: check duplicate tag name (case-insensitive)
  function tagNameExists(name: string, excludeId?: string) {
    const lower = (name || '').trim().toLowerCase();
    if (!lower) return false;
    return tags.some(t => t.id !== excludeId && (t.name || '').trim().toLowerCase() === lower);
  }

  // -----------------------------
  // Filtering: modified to apply tag filters first
  // -----------------------------
  function filterPrompts(q: string) {
    const s = q.trim().toLowerCase();
    let base = prompts;
    if (selectedTagIds && selectedTagIds.length > 0) {
      base = prompts.filter(p => (p.tags || []).some(tid => selectedTagIds.includes(tid)));
    }
    if (!s) return base;
    return base.filter(p =>
      (p.title && p.title.toLowerCase().includes(s)) ||
      (p.quick && p.quick.toLowerCase().includes(s))
    );
  }

  // -----------------------------
  // Build list & selection
  // -----------------------------
  function resetSelection() {
    selectedIndex = 0;
    highlightSelection();
  }

  function highlightSelection() {
    list.querySelectorAll('.row').forEach(el => el.classList.remove('selected'));
    if (filteredPrompts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredPrompts.length) {
      const selId = filteredPrompts[selectedIndex].id;
      const selEl = list.querySelector<HTMLElement>(`.row[data-id="${selId}"]`);
      if (selEl) {
        selEl.classList.add('selected');
        try { selEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch { selEl.scrollIntoView(false); }
      }
    }
  }

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

  // buildList now uses filterPrompts and renders chips when tags selected
  function buildList() {
    const q = (searchInput?.value || '').trim();
    filteredPrompts = filterPrompts(q);
    list.innerHTML = '';
    if (!filteredPrompts.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No prompts (or none match your search).'; list.appendChild(e); return;
    }

    for (const p of filteredPrompts) {
      const row = document.createElement('div'); row.className = 'row'; if (!p.quick) row.classList.add('heading-row'); row.dataset.id = p.id;
      row.addEventListener('click', async () => {
        try {
          await copyToClipboard(p.text);
          showToast('Copied');
        } catch {
          showToast('Copy failed');
        }
      });

      const left = document.createElement('div'); left.className = 'left';
      const handle = document.createElement('div'); handle.className = 'drag-handle'; handle.innerHTML = '&#x2261;'; handle.draggable = true;
      const label = document.createElement('div'); label.className = 'label'; label.textContent = p.title;
      left.appendChild(handle); left.appendChild(label);

      // When a tag filter is active, show up to MAX_CHIPS_TO_SHOW chips on each row
      if (selectedTagIds.length > 0 && (p.tags || []).length > 0) {
        const chips = document.createElement('div'); chips.className = 'tag-chips';
        const pTags = (p.tags || []).map(id => tags.find(t => t.id === id)).filter(Boolean) as Tag[];
        const visible = pTags.slice(0, MAX_CHIPS_TO_SHOW);
        for (const t of visible) {
          const chip = document.createElement('span');
          chip.className = 'tag-chip';
          chip.textContent = t.name;
          chip.title = t.name;
          const bg = t.color || 'rgba(255,255,255,0.06)';
          chip.style.background = bg;
          chip.style.color = getContrastTextColor(bg);
          chip.style.border = '1px solid rgba(0,0,0,0.06)'; // subtle border for readability
          chips.appendChild(chip);
        }
        if (pTags.length > MAX_CHIPS_TO_SHOW) {
          const more = document.createElement('span');
          more.className = 'tag-chip overflow';
          more.textContent = `+${pTags.length - MAX_CHIPS_TO_SHOW}`;
          chips.appendChild(more);
        }
        left.appendChild(chips);
      }

      const icons = document.createElement('div'); icons.className = 'icons';
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21v-3.6l11.2-11.2 3.6 3.6L6.6 21H3zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6 1.8-1.4z" stroke="currentColor" fill="none"/></svg>';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = p.id;
        showAddArea(p.title, (p.quick || ''), p.text);
        // prefill tag draft from this prompt during edit
        draftPromptTagIds = Array.from(p.tags || []);
      });
      icons.appendChild(editBtn);

      row.appendChild(left); row.appendChild(icons);
      list.appendChild(row);

      // drag handlers for prompts
      handle.addEventListener('dragstart', (ev) => { draggedId = p.id; row.classList.add('dragging'); try { ev.dataTransfer?.setData('text/plain', p.id); } catch {} });
      handle.addEventListener('dragend', () => { draggedId = null; shadow.querySelectorAll('.row.dragging').forEach(el => el.classList.remove('dragging')); removePlaceholder(); });

      row.addEventListener('dragover', (ev) => { ev.preventDefault(); });
      // row.addEventListener('drop', (ev) => { ev.preventDefault(); removePlaceholder(); });
    }

    const endSpacer = document.createElement('div'); endSpacer.style.minHeight = '12px';
    endSpacer.addEventListener('dragover', (ev) => { ev.preventDefault(); const ph = ensurePlaceholder(); if (list.lastElementChild !== ph) list.appendChild(ph); });
    endSpacer.addEventListener('drop', (ev) => { ev.preventDefault(); const srcId = draggedId ?? ev.dataTransfer?.getData('text/plain') ?? null; if (!srcId) return; const before = getRectsMap(shadow); movePromptToIndex(srcId, prompts.length, before); removePlaceholder(); });
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
      // Map targetIndex (position among filteredPrompts) back to index in prompts array
      // If placeholder is at end, append
      if (targetIndex >= filteredPrompts.length) {
        movePromptToIndex(srcId, prompts.length, before);
      } else {
        const targetFilteredPrompt = filteredPrompts[targetIndex];
        const idxInPrompts = prompts.findIndex(x => x.id === targetFilteredPrompt.id);
        movePromptToIndex(srcId, idxInPrompts === -1 ? prompts.length : idxInPrompts, before);
      }
      removePlaceholder();
    });

    highlightSelection();
  }

  function movePromptToIndex(srcId: string, targetIndex: number, beforeRects?: Map<string, DOMRect>) {
    const srcIndex = prompts.findIndex(x => x.id === srcId);
    if (srcIndex === -1 || srcIndex === targetIndex) return; // also prevent drop on itself

    const [item] = prompts.splice(srcIndex, 1);

    // FIX: Adjust the target index if we are moving an item downwards
    let adjustedTargetIndex = targetIndex;
    if (srcIndex < targetIndex) {
      adjustedTargetIndex--;
    }

    // if targetIndex > prompts.length, clamp
    const clamped = Math.max(0, Math.min(adjustedTargetIndex, prompts.length));
    prompts.splice(clamped, 0, item);
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
  // Open panel on hover and focus the search input (unless add/edit or settings are open).
  hotzone.addEventListener('mouseenter', () => {
    // attach a single backdrop when opening the panel
    attachPanelBackdrop();

    showPanel();
    setTimeout(() => {
      try {
        if (!addArea.classList.contains('open') && !settingsArea.classList.contains('open')) {
          searchInput?.focus();
          if (typeof (searchInput as any).setSelectionRange === 'function') {
            const len = (searchInput.value || '').length;
            (searchInput as HTMLInputElement).setSelectionRange(len, len);
          }
        }
      } catch (e) {}
    }, 60);
  });



  // Tags button toggle
  function renderTagsList() {
  const displayCtx = getTagsDropdownContext(); // 'list' | 'edit'
  let editMode = false;

  if (displayCtx === 'list') {
    editMode = tagsEditMode;   // only allow toggling here
    tagsClearBtn.style.display = '';
    tagsEditBtn.style.display = '';
    tagsNewBtn.style.display = '';
  } else {
    editMode = false;          // always normal view in prompt edit/new
    tagsClearBtn.style.display = 'none';
    tagsEditBtn.style.display = 'none';
    tagsNewBtn.style.display = 'none';
  }

  tagsList.innerHTML = '';

    // sort by order then name
    const sortedTags = tags.slice().sort((a,b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    if (!sortedTags.length) {
      tagsList.innerHTML = '<div class="small" style="padding:6px 4px">No tags yet. Click New to create one.</div>';
      return;
    }

    // container for rows
    for (let i = 0; i < sortedTags.length; i++) {
      const t = sortedTags[i];
      const row = document.createElement('div');
      row.className = 'tag-row';
      row.dataset.id = t.id;
      row.tabIndex = 0;
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';
      row.style.padding = '6px';
      row.style.borderRadius = '6px';
      row.style.cursor = 'pointer';
      row.style.userSelect = 'none';
      // prevent outside click handler from closing dropdown

      // color swatch (clickable in edit mode)
      const sw = document.createElement('div'); sw.className = 'tag-swatch'; sw.style.width = '18px'; sw.style.height = '18px'; sw.style.borderRadius = '4px';
      sw.style.background = t.color || '#cccccc';
      sw.title = 'Color';
      sw.addEventListener('click', (ev) => ev.stopPropagation()); // clicks handled below
      if (editMode) {
        // drag handle
        const handle = document.createElement('div');
        handle.textContent = '≡';
        handle.title = 'Drag to reorder';
        handle.style.cursor = 'grab';
        handle.draggable = true;
        // drag handlers for tag reorder
        handle.addEventListener('dragstart', (ev: DragEvent) => {
          ev.stopPropagation();
          (ev.dataTransfer as any)?.setData?.('text/plain', t.id);
          // mark dragged visually
          row.classList.add('dragging');
        });
        handle.addEventListener('dragend', (ev: DragEvent) => {
          ev.stopPropagation();
          row.classList.remove('dragging');
          // If we dropped somewhere else, the global drop handler will call moveTagToIndex
        });
        // allow dropping above/below
        row.addEventListener('dragover', (ev) => { ev.preventDefault(); ev.stopPropagation(); });
        row.addEventListener('drop', (ev: DragEvent) => {
          ev.preventDefault(); ev.stopPropagation();
          const srcId = (ev.dataTransfer as any)?.getData('text/plain') ?? null;
          if (!srcId || srcId === t.id) return;
          // compute target index based on sortedTags position
          const beforeRects = getRectsMap(shadow);
          const targetIndex = sortedTags.findIndex(x => x.id === t.id);
          moveTagToIndex(srcId, targetIndex, beforeRects);
        });
        row.appendChild(handle);
      }



      // name / input
      const nameWrap = document.createElement('div'); nameWrap.style.flex = '1'; nameWrap.style.minWidth = '0';
      if (editMode) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = t.name;
        input.maxLength = 80;
        input.style.width = '100%';
        input.style.fontSize = '13px';
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
          ev.stopPropagation();
        });
        input.addEventListener('blur', async () => {
          // commit rename
          if (input.value.trim() !== t.name) {
            await renameTag(t.id, input.value);
          }
        });
        input.addEventListener('click', (ev) => ev.stopPropagation());
        nameWrap.appendChild(input);
      } else {
        const name = document.createElement('div'); name.className = 'tag-name';
        name.textContent = t.name.length > 30 ? t.name.slice(0,27)+'…' : t.name;
        name.style.whiteSpace = 'nowrap';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';

        // apply color to the tag name text, and give the row a faint tinted background for that tag
        try {
          name.style.color = t.color || '';
          // faint background using the color (very subtle)
          const bg = tintBackground(t.color || '#000', 0.06);
          if (bg) row.style.background = bg;
        } catch (e) { /* ignore styling errors */ }

        nameWrap.appendChild(name);
      }

      // tick / selection indicator
      const tick = document.createElement('div'); tick.className = 'tag-tick';
      const isSelectedInList = (selectedTagIds || []).includes(t.id);
      const isSelectedInDraft = (draftPromptTagIds || []).includes(t.id);
      tick.innerHTML = displayCtx === 'list' ? (isSelectedInList ? '✓' : '') : (isSelectedInDraft ? '✓' : '');

      // assemble row (order: swatch, name, tick, controls)
      if (editMode) {row.appendChild(sw);}
      row.appendChild(nameWrap);
      if(!editMode){row.appendChild(tick);}
      // If editMode: add color control, drag handle and delete button
      if (editMode) {





          
          // color control -> open our palette anchored to the row
          const colorBtn = document.createElement('button');
          colorBtn.type = 'button';
          colorBtn.className = 'ctrl-btn tag-color-btn';
          colorBtn.title = 'Change color';
          colorBtn.textContent = '●';
          colorBtn.style.padding = '4px';
          colorBtn.style.minWidth = '28px';
          colorBtn.style.display = 'inline-flex';
          colorBtn.style.alignItems = 'center';
          colorBtn.style.justifyContent = 'center';

          colorBtn.addEventListener('mousedown', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            // close any open native palette first
            closeColorPalette();
            // open our palette anchored to the row element
            openColorPaletteFor(t.id, row);
          });

          row.appendChild(colorBtn);



        // delete button
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'ctrl-btn';
        del.textContent = 'Delete';
        del.addEventListener('mousedown', async (ev) => {
          ev.stopPropagation();
          await deleteTag(t.id);
        });
        row.appendChild(del);
      } else {
        // normal mode: clicking toggles selection (list context)
      row.addEventListener('mousedown', (ev) => {
        ev.stopPropagation(); // Stop propagation first

        if (getTagsDropdownContext() === 'list') {
          if (!tagsEditMode) toggleTagSelection(t.id);
        } else {
          // edit context for drafts: toggle in draftPromptTagIds
          const idx = (draftPromptTagIds || []).indexOf(t.id);
          if (idx === -1) draftPromptTagIds.push(t.id);
          else draftPromptTagIds.splice(idx, 1);
          renderAddTags();
          renderTagsList();
        }
      });

      }

      // keyboard support: Enter/Space toggles (or commits) and Arrow keys handled globally
      row.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault(); ev.stopPropagation();
          // if edit mode and there's an input, blur it to commit
          if (editMode) {
            const input = row.querySelector('input[type="text"]') as HTMLInputElement | null;
            if (input) input.blur();
          } else {
            row.click();
          }
        }
      });

      tagsList.appendChild(row);
    }
  }

  
  function renderAddTags() {
    if (!addTagsContainer) return;
    addTagsContainer.innerHTML = '';
    if (!tags || tags.length === 0) {
      addTagsContainer.innerHTML = '<div style="opacity:0.7;font-size:12px">No tags yet</div>';
      return;
    }

    // Use the tag order defined in tags array (they should already be sorted by order)
    for (const t of tags) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-select';
      btn.title = t.name;
      btn.textContent = t.name;
      const bg = t.color || '#cccccc';
      btn.style.background = bg;
      btn.style.color = getContrastTextColor(bg);
      btn.style.border = '1px solid rgba(0,0,0,0.06)';
      btn.style.padding = '6px 8px';
      btn.style.borderRadius = '999px';
      btn.style.whiteSpace = 'nowrap';
      btn.style.overflow = 'hidden';
      btn.style.textOverflow = 'ellipsis';
      btn.dataset.id = t.id;

      // determine whether selected for current draft/edit
      const wasSelected = (draftPromptTagIds || []).includes(t.id);
      if (wasSelected) btn.classList.add('selected');

      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const id = t.id;
        if (!id) return;
        const idx = (draftPromptTagIds || []).indexOf(id);
        if (idx === -1) {
          draftPromptTagIds.push(id);
          btn.classList.add('selected');
        } else {
          draftPromptTagIds.splice(idx, 1);
          btn.classList.remove('selected');
        }
      });

      addTagsContainer.appendChild(btn);
    }
  }




  function moveTagToIndex(srcId: string, targetIndex: number, beforeRects?: Map<string, DOMRect>) {
    const srcIndex = tags.findIndex(x => x.id === srcId);
    if (srcIndex === -1) return;
    const [item] = tags.splice(srcIndex, 1);
    const clamped = Math.max(0, Math.min(targetIndex, tags.length));
    tags.splice(clamped, 0, item);
    // reassign order based on array index
    tags = tags.map((t, i) => ({ ...t, order: i }));
    saveTags().then(() => {
      buildList();
      renderTagsList();
      if (beforeRects) playFLIP(shadow, beforeRects);
      showToast('Tags order saved');
    });
  }

  function openTagsDropdown() {
    const ctx = getTagsDropdownContext(); // 'list' or 'edit'
    if (ctx === 'edit') {
      // Force-disable list-edit mode when dropdown is opened for prompt edit/creation
      tagsEditMode = false;
      tagsEditBtn.textContent = 'Edit';
    }

    tagsDropdown.classList.add('open');
    tagsDropdown.setAttribute('aria-hidden', 'false');
    tagsDropdownOpen = true;

    // Hide top controls in edit mode (per your request)
    if (ctx === 'edit') {
      tagsClearBtn.style.display = 'none';
      tagsEditBtn.style.display = 'none';
      tagsNewBtn.style.display = 'none';
    } else {
      tagsClearBtn.style.display = '';
      tagsEditBtn.style.display = '';
      tagsNewBtn.style.display = '';
    }

    // render with context-aware selection source
    renderTagsList();

    // update T button visual: in list mode reflect filters, in edit mode reflect draft tags presence
    if (ctx === 'list') {
      tagsBtn.classList.toggle('active', selectedTagIds.length > 0);
    } else {
      tagsBtn.classList.toggle('active', (draftPromptTagIds || []).length > 0);
    }
  }



  function closeTagsDropdown() {
    tagsDropdown.classList.remove('open');
    tagsDropdown.setAttribute('aria-hidden', 'true');
    tagsDropdownOpen = false;

    // preserve visual active state based on selected filters or draft tags
    const ctx = getTagsDropdownContext();
    if (ctx === 'list') {
      tagsBtn.classList.toggle('active', selectedTagIds.length > 0);
    } else {
      tagsBtn.classList.toggle('active', (draftPromptTagIds || []).length > 0);
    }
  }



  let tagsDropdownOpen = false;
  let tagsEditMode = false;

  tagsBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (!tagsDropdownOpen) openTagsDropdown(); else closeTagsDropdown();
  });

  tagsClearBtn.addEventListener('mousedown', (ev) => {
    ev.stopPropagation();
    clearTagSelection();
  });

  tagsEditBtn.addEventListener('mousedown', (ev) => {
    ev.stopPropagation();
    tagsEditMode = !tagsEditMode;
    tagsEditBtn.textContent = tagsEditMode ? 'Finish' : 'Edit';
    renderTagsList();
  });

  tagsNewBtn.addEventListener('mousedown', (ev) => {
    ev.stopPropagation();
    // inline quick add at top of list
    const form = document.createElement('div');
    form.style.display = 'flex';
    form.style.gap = '8px';
    form.style.padding = '6px';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Tag name';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#8fb7ff';
    const save = document.createElement('button');
    save.className = 'ctrl-btn';
    save.textContent = 'Save';
    const cancel = document.createElement('button');
    cancel.className = 'ctrl-btn';
    cancel.textContent = 'Cancel';
    form.appendChild(nameInput); form.appendChild(colorInput); form.appendChild(save); form.appendChild(cancel);
    tagsList.insertBefore(form, tagsList.firstChild);
    nameInput.focus();

    save.addEventListener('click', async (e) => {
      // const nm = stripHTMLTags(nameInput.value.trim());
      const nm = nameInput.value
      const color = colorInput.value || '#8fb7ff';
      if (!nm) { showToast('Name required'); return; }
      if (tagNameExists(nm)) { showToast('Tag name already exists'); return; }
      const newTag: Tag = { id: uid(), name: nm, color, order: tags.length };
      tags.push(newTag);
      await saveTags();
      // auto-assign to prompt if editing or drafting
      if (isAddingOrEditing) {
        if (editingId) {
          const idx = prompts.findIndex(x => x.id === editingId);
          if (idx !== -1) {
            prompts[idx].tags = Array.from(new Set([...(prompts[idx].tags || []), newTag.id]));
            await savePrompts();
          }
        } else {
          // new unsaved prompt - attach to draft
          draftPromptTagIds = Array.from(new Set([...(draftPromptTagIds || []), newTag.id]));
        }
      }
      renderAddTags();
      renderTagsList();
      buildList();
      showToast('Tag created');
      form.remove();
    });

    cancel.addEventListener('click', () => {
      form.remove();
    });
  });

  // When the search is focused and we're on the list page, use keys for list navigation.
  searchInput.addEventListener('input', () => buildList());
  // When the search box is focused and we're on the list page, use keys for list navigation.
  // This mirrors the previous behavior where arrows/Enter operate on the list even while typing.
  searchInput.addEventListener('keydown', async (ev: KeyboardEvent) => {
    if (!panel.classList.contains('open')) return;
    if (isAddingOrEditing || settingsArea.classList.contains('open') || tagsDropdownOpen) return;

    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      ev.stopPropagation();
      if (!filteredPrompts || filteredPrompts.length === 0) return;
      if (ev.key === 'ArrowDown') selectedIndex = (selectedIndex + 1) % filteredPrompts.length;
      else selectedIndex = (selectedIndex - 1 + filteredPrompts.length) % filteredPrompts.length;
      highlightSelection();
      return;
    }

    if (ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      if (!filteredPrompts || !filteredPrompts[selectedIndex]) {
        showToast('No prompt selected.');
        return;
      }
      const prompt = filteredPrompts[selectedIndex];
      const ok = await copyToClipboard(prompt.text);
      showToast(ok ? 'Copied' : 'Copy failed');
      // keep focus in searchInput after copying
      try { (searchInput as HTMLInputElement).focus(); } catch {}
      return;
    }

    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      panel.classList.remove('open');
    }
  });


  // Add keyboard behavior when tags dropdown open: make sure up/down keys navigate tags
  document.addEventListener('keydown', (ev: KeyboardEvent) => {
    // if tags dropdown open, intercept navigation
    if (!tagsDropdownOpen) return;
    const rows = Array.from(tagsList.querySelectorAll<HTMLElement>('.tag-row'));
    if (!rows.length) return;
    let idx = rows.findIndex(r => r.classList.contains('focused'));
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (idx < rows.length - 1) {
        if (idx >= 0) rows[idx].classList.remove('focused');
        idx = idx + 1;
        rows[idx].classList.add('focused');
        rows[idx].focus?.();
      }
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (idx > 0) {
        rows[idx].classList.remove('focused');
        idx = idx - 1;
        rows[idx].classList.add('focused');
        rows[idx].focus?.();
      }
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      if (idx === -1) return;
      const id = rows[idx].dataset.id;
      if (!id) return;
      if (!tagsEditMode) {
        toggleTagSelection(id);
      } else {
        // In edit mode Enter should commit edit, handled by input blur handlers
        const input = rows[idx].querySelector('input[type="text"]') as HTMLInputElement | null;
        if (input) input.blur();
      }
    } else if (ev.key === 'Escape') {
      closeTagsDropdown();
    }
  });

  // MODIFIED global keyboard handling: do not interfere while tags dropdown open
  document.addEventListener('keydown', async (ev: KeyboardEvent) => {
    if (!panel.classList.contains('open')) return;
    // If user is typing inside inputs we already stop propagation on panel inputs.
    if (isAddingOrEditing || settingsArea.classList.contains('open') || tagsDropdownOpen) {
      return;
    }

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

  // show/hide add/settings helpers
  function showPanel() {
    // attach backdrop when panel opens
    attachPanelBackdrop();
    panel.classList.add('open');
    resetSelection();
    ensureTagsClosedOnModeChange();
  }

  function hidePanel() {
    // remove backdrop when panel closes
    removePanelBackdrop();
    if (!isAddingOrEditing && !tagsDropdownOpen) panel.classList.remove('open');
    ensureTagsClosedOnModeChange();
  }

  function showAddArea(prefillTitle = '', prefillQuick = '', prefillBody = '') {
    
    isAddingOrEditing = true;
    ensureTagsClosedOnModeChange();

    inputTitle.value = prefillTitle;
    inputQuick.value = prefillQuick;
    inputBody.value = prefillBody;
    // inputTitle.value = stripHTMLTags(prefillTitle);
    // inputQuick.value = stripHTMLTags(prefillQuick);
    // inputBody.value = stripHTMLTags(prefillBody);

    addArea.classList.add('open');
    addArea.setAttribute('aria-hidden', 'false');
    list.style.display = 'none';
    settingsArea.classList.remove('open');

    panel.classList.add('mode-add');
    panel.classList.remove('mode-settings');

    const existingDel = addArea.querySelector<HTMLButtonElement>('.delete-btn');
    if (existingDel) existingDel.remove();

    if (editingId != null) {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete prompt';
      delBtn.setAttribute('aria-label', 'Delete prompt');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" fill="none"/></svg>';

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

      addArea.appendChild(delBtn);
    }

    // when opening edit area, populate draftPromptTagIds if editing an existing prompt
    if (editingId) {
      const p = prompts.find(x => x.id === editingId);
      draftPromptTagIds = p ? Array.from(p.tags || []) : [];
    } else {
      // creating new prompt -> start with draft tags if any
      // draftPromptTagIds remains as is (user may have added tags from tag dropdown)
    }
    renderAddTags();

  }





  function hideAddArea() {
    isAddingOrEditing = false;
    editingId = null;

    const existingDel = addArea.querySelector<HTMLButtonElement>('.delete-btn');
    if (existingDel) existingDel.remove();

    addArea.classList.remove('open');
    addArea.setAttribute('aria-hidden', 'true');
    list.style.display = 'block';
    inputTitle.value = '';
    inputBody.value = '';
    inputQuick.value = '';
    draftPromptTagIds = [];

    panel.classList.remove('mode-add');
  }

  function showSettingsArea() {
    settingsArea.classList.add('open'); settingsArea.setAttribute('aria-hidden', 'false');
    sFontSize.value = String(parseInt(window.getComputedStyle(host).getPropertyValue('--font-size') || '13') || 13);
    sTheme.value = settings.theme;
    sHotpos.value = settings.hotspotPosition;
    list.style.display = 'none'; addArea.classList.remove('open');
    panel.classList.add('mode-settings'); panel.classList.remove('mode-add');
    ensureTagsClosedOnModeChange();

  }

  function hideSettingsArea() {
    settingsArea.classList.remove('open');
    settingsArea.setAttribute('aria-hidden', 'true');
    list.style.display = 'block';
    panel.classList.remove('mode-settings');
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

  saveBtn.addEventListener('click', async () => {
    const title =inputTitle.value.trim();
    const quick =inputQuick.value.trim();
    const text = inputBody.value.trim();
    // const title = stripHTMLTags(inputTitle.value.trim());
    // const quick = stripHTMLTags(inputQuick.value.trim());
    // const text = stripHTMLTags(inputBody.value.trim());
    if (!title || !text) { alert('Both title and prompt are required'); return; }
    if (editingId != null) {
      const idx = prompts.findIndex(x => x.id === editingId);
      if (idx !== -1) {
        prompts[idx] = { ...prompts[idx], title, quick, text, tags: Array.from(new Set(draftPromptTagIds || [])) };
      }
    } else {
      const newPrompt: Prompt = { id: uid(), title, quick, text, tags: Array.from(new Set(draftPromptTagIds || [])) };
      prompts.unshift(newPrompt);
    }
    try { await setStorage({ [PROMPTS_KEY]: prompts }); buildList(); hideAddArea(); showToast('Saved'); } catch { showToast('Save failed'); }
  });

  addBtn.addEventListener('click', () => {
    editingId = null;
    draftPromptTagIds = [];
    showAddArea();
    settingsArea.classList.remove('open');
  });

  cancelBtn.addEventListener('click', () => hideAddArea());
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

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
    const fs = Number(sFontSize.value);
    if (fs && !Number.isNaN(fs)) {
      host.style.setProperty('--font-size', `${fs}px`);
    }
    settings = newS; applySettingsToHost();
    try { await setStorage({ [SETTINGS_KEY]: settings }); hideSettingsArea(); showToast('Settings saved'); } catch { showToast('Save failed'); }
  });



  function isPointInsideExtendedRect(x: number, y: number, rect: DOMRect, tol: number) {
    return x >= (rect.left - tol) && x <= (rect.right + tol) && y >= (rect.top - tol) && y <= (rect.bottom + tol);
  }

  // storage change listener
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[PROMPTS_KEY]) {
      prompts = changes[PROMPTS_KEY].newValue ?? [];
      prompts = prompts.map(p => ({ ...p, tags: p.tags ? Array.from(p.tags) : [] }));
      buildList();
    }
    if (changes[SETTINGS_KEY]) {
      settings = changes[SETTINGS_KEY].newValue ?? settings;
      applySettingsToHost();
    }
    if (changes[TAGS_KEY]) {
      tags = changes[TAGS_KEY].newValue ?? tags;
      renderAddTags();

      renderTagsList();
      buildList();
    }
  });

  // toggle via message
  chrome.runtime.onMessage.addListener((msg: any) => {
      if (!panel.classList.contains('open')) {
        attachPanelBackdrop();
        showPanel();
        setTimeout(() => searchInput?.focus(), 60);
      } else {
        hidePanel();
      }

  });

  // resize handles
  setupResizeHandles({ panel, shadow, host, getSettings: () => settings, saveSettings: async (s: Settings) => { settings = s; applySettingsToHost(); await setStorage({ [SETTINGS_KEY]: settings }); } });

  function getRectsMapLocal() { return getRectsMap(shadow); }
  function playFLIPLocal(before: Map<string, DOMRect>) { playFLIP(shadow, before); }

  // re-render tags list initially
  renderTagsList();
}
