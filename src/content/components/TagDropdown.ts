// src/content/components/TagDropdown.ts
import { Component } from './Component';
import { Tag } from '../store';
import { ColorPalette } from './ColorPalette';

export class TagDropdown extends Component {
  private dropdown: HTMLElement | null = null;
  private list: HTMLElement | null = null;
  private clearBtn: HTMLButtonElement | null = null;
  private editBtn: HTMLButtonElement | null = null;
  private newBtn: HTMLButtonElement | null = null;

  private activePalette: ColorPalette | null = null;

  // --- PROPERTIES ---
  public onTagSelect: ((tagId: string) => void) | null = null; // Custom click handler
  public activeTagIds: string[] = []; // IDs to show as checked
  // ------------------

  // Public check for App.ts hierarchy handling
  public isOpen(): boolean {
    return this.dropdown ? this.dropdown.classList.contains('open') : false;
  }

  private isEditMode = false;
  private isNewMode = false;

  public refresh() {
    this.renderList();
  }

  mount(parent: HTMLElement) {
    this.dropdown = parent.querySelector('#tags-dropdown');
    this.list = parent.querySelector('#tags-list');
    this.clearBtn = parent.querySelector('#tags-clear');
    this.editBtn = parent.querySelector('#tags-edit');
    this.newBtn = parent.querySelector('#tags-new');

    if (!this.dropdown || !this.list) return;

    this.renderList();

    // Event listeners
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.store.clearTagSelection();
      });
    }

    if (this.editBtn) {
      this.editBtn.addEventListener('click', () => {
        this.isEditMode = !this.isEditMode;
        this.editBtn!.textContent = this.isEditMode ? 'Done' : 'Edit';
        this.renderList();
      });
    }

    if (this.newBtn) {
      this.newBtn.addEventListener('click', () => {
        this.isNewMode = !this.isNewMode;
        this.newBtn!.textContent = this.isNewMode ? 'Cancel' : 'New';
        this.renderList();
      });
    }

    // Subscribe to updates
    this.store.subscribe('tags_updated', () => this.renderList());
    this.store.subscribe('filter_updated', () => this.renderList());
  }

  toggle() {
    if (this.dropdown) {
      this.dropdown.classList.toggle('open');
    }
  }

  close() {
    if (this.dropdown) {
      this.dropdown.classList.remove('open');
    }
  }

  private renderList() {
    if (!this.list) return;
    this.list.innerHTML = '';

    if (this.isNewMode) {
      this.renderNewTagForm();
    }

    // 1. Determine which tags should be checked.
    const idsToCheck = this.onTagSelect ? this.activeTagIds : this.store.selectedTagIds;

    // Sort tags by order
    const sortedTags = [...this.store.tags].sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedTags.forEach(tag => {
      // 2. Calculate boolean
      const isChecked = idsToCheck.includes(tag.id);

      // 3. Pass it to the function
      const row = this.createTagRow(tag, isChecked);
      this.list!.appendChild(row);
    });
  }

  private createTagRow(tag: Tag, isChecked: boolean): HTMLElement {
    const row = this.el('div', 'tag-row');
    // Necessary for Drag and Drop data transfer
    row.dataset.id = tag.id;

    // --- ADD DRAG HANDLE (Edit Mode Only) ---
    if (this.isEditMode) {
      const handle = this.el('div');
      handle.textContent = '≡';
      Object.assign(handle.style, {
        cursor: 'grab',
        marginRight: '8px',
        color: 'var(--muted, #888)',
        userSelect: 'none',
        fontSize: '18px',
        lineHeight: '1'
      });
      handle.draggable = true;

      handle.addEventListener('dragstart', (ev) => {
        ev.stopPropagation();
        if (ev.dataTransfer) {
          ev.dataTransfer.setData('text/plain', tag.id);
          ev.dataTransfer.effectAllowed = 'move';
        }
        row.style.opacity = '0.5';
      });

      handle.addEventListener('dragend', (ev) => {
        ev.stopPropagation();
        row.style.opacity = '1';
      });

      row.appendChild(handle);

      // Allow dropping ONTO this row to sort
      row.addEventListener('dragover', (ev) => {
        ev.preventDefault(); // Necessary to allow dropping
        ev.stopPropagation();
      });

      row.addEventListener('drop', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const srcId = ev.dataTransfer?.getData('text/plain');
        if (srcId && srcId !== tag.id) {
          // Calculate target index based on this row's position
          const targetIndex = this.store.tags.findIndex(t => t.id === tag.id);
          this.store.reorderTags(srcId, targetIndex);
        }
      });
    }
    // ----------------------------------------

    // Swatch
    const swatch = this.el('div', 'tag-swatch');
    swatch.style.background = tag.color;

    // Swatch Click Listener (Color Palette)
    swatch.addEventListener('click', (e) => {
      e.stopPropagation();

      // Only allow color changing in Edit Mode
      if (!this.isEditMode) return;

      // Close existing if any
      if (this.activePalette) this.activePalette.destroy();

      // Calculate position relative to the dropdown container
      const rect = swatch.getBoundingClientRect();
      const containerRect = this.dropdown!.getBoundingClientRect();

      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top + 24; // 24px below swatch

      this.activePalette = new ColorPalette(
        this.store,
        this.shadow,
        (newColor) => {
          // Handle Selection
          this.store.updateTag(tag.id, { color: newColor });
        },
        () => {
          // Handle Close
          this.activePalette = null;
        }
      );

      this.activePalette.showAt(this.dropdown!, x, y);
    });
    row.appendChild(swatch);

    // Name (Edit: Input, View: Text)
    if (this.isEditMode) {
      const input = this.el('input') as HTMLInputElement;
      input.type = 'text';
      input.value = tag.name;
      input.setAttribute('autocomplete', 'off');

      // Basic styling to fit the row
      Object.assign(input.style, {
        flex: '1',
        minWidth: '0',
        border: '1px solid var(--border-input, #ccc)',
        background: 'var(--bg-input-solid, #fff)',
        color: 'var(--txt, #000)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: 'inherit'
      });

      // Stop clicks from selecting the row
      input.addEventListener('click', (e) => e.stopPropagation());

      // Prevent global hotkeys
      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          input.blur(); // Commit on Enter
        }
      });

      // Save on blur
      input.addEventListener('blur', () => {
        const newName = input.value.trim();
        if (newName && newName !== tag.name) {
          this.store.updateTag(tag.id, { name: newName });
        }
      });

      row.appendChild(input);
    } else {
      // Render Text for Display
      const name = this.el('div', 'tag-name', tag.name);
      row.appendChild(name);
    }

    // Tick or Delete
    if (this.isEditMode) {
      const delBtn = this.el('div', 'delete-icon-btn');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete tag "${tag.name}"?`)) {
          this.store.deleteTag(tag.id);
        }
      });
      row.appendChild(delBtn);
    } else {
      if (isChecked) {
        const tick = this.el('div', 'tag-tick', '✓');
        row.appendChild(tick);
      }
    }

    // Row Click Listener
    row.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!this.isEditMode) {
        if (this.onTagSelect) {
          // Case A: We are choosing tags for a Prompt (Editor Mode)
          this.onTagSelect(tag.id);
          this.renderList();
        } else {
          // Case B: We are filtering the main list
          this.store.toggleTagSelection(tag.id);
        }
      }
    });

    return row;
  }

  // --- UPDATED: Render Form with Auto-Focus and ID generation ---
  private renderNewTagForm() {
    const form = this.el('div', 'new-tag-form');

    const row = this.el('div', 'new-tag-form-row');
    const input = this.el('input') as HTMLInputElement;
    input.type = 'text';
    input.placeholder = 'Tag name';
    input.setAttribute('autocomplete', 'off');

    // Auto-focus the input
    setTimeout(() => input.focus(), 50);

    const colorInput = this.el('input') as HTMLInputElement;
    colorInput.type = 'color';
    colorInput.value = '#FF6B6B'; // Default

    row.appendChild(input);
    row.appendChild(colorInput);
    form.appendChild(row);

    const btns = this.el('div', 'new-tag-form-buttons');
    const addBtn = this.el('button', 'btn-primary', 'Add');
    addBtn.style.padding = '4px 12px';
    addBtn.style.fontSize = '12px';

    // Updated Click Listener
    addBtn.addEventListener('click', async () => {
      const name = input.value.trim();
      if (name) {
        // 1. Generate ID manually
        const newId = (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);

        // 2. Add to store (casting to any to assume the method exists on Store)
        await (this.store as any).addTagWithId(newId, name, colorInput.value);

        // 3. Auto-select if in Editor Mode
        if (this.onTagSelect) {
          this.onTagSelect(newId);
        }

        // 4. Reset UI
        this.isNewMode = false;
        if (this.newBtn) this.newBtn.textContent = 'New';
        this.renderList();
      }
    });
    // ----------------------

    btns.appendChild(addBtn);
    form.appendChild(btns);

    this.list!.appendChild(form);
  }
}