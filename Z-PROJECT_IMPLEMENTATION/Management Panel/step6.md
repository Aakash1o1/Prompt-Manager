Step 6: Visual Polish & Resizability
Objective:
Make the Modal resizable (All edges).
Implement the "Uncategorized" group at the bottom of the list.
Update Move Mode visuals (Light blue default, Dark blue selected, Auto-select current parent).
Complexity: MEDIUM
Files to Modify/Create:
New File: src/content/resize.ts (Restored and adapted).
src/content/styles.ts (Resize handles, Move visuals, Uncategorized styling).
src/content/host.ts (Initialize resize).
src/content/components/Sidebar.ts (Updated Rendering & Move Logic).
Tasks:
1. Re-create Resize Logic (src/content/resize.ts)
I have adapted the previous resize logic to work with the centered Grid Layout Modal.
code
TypeScript
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

    // Logic for centered resizing (since margin: auto might be used, but here we use transform)
    // Actually, simpler approach for centered modal: 
    // We adjust width/height. CSS 'margin: auto' or flex center keeps it centered.
    
    if (currentHandle.includes('e')) newW = Math.max(600, startW + dx * 2); // *2 to expand both sides if centered
    if (currentHandle.includes('w')) newW = Math.max(600, startW - dx * 2);
    if (currentHandle.includes('s')) newH = Math.max(400, startH + dy * 2);
    if (currentHandle.includes('n')) newH = Math.max(400, startH - dy * 2);

    // Note: The *2 multiplier assumes the modal stays exactly centered. 
    // If we want standard resizing, we'd need to change positioning to top/left.
    // For this V2 architecture, standard resizing is safer. 
    // BUT, since we use flex center in CSS (.backdrop), changing width naturally keeps it centered.
    // So *2 is actually correct if we want the mouse to stay with the edge.
    
    modal.style.width = `${newW}px`;
    modal.style.height = `${newH}px`;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isResizing) return;
    isResizing = false;
    modal.classList.remove('resizing');
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Save size preference? (Optional, implemented in Store later)
  };

  const container = shadow.querySelector('.backdrop') || modal;
  container.addEventListener('pointerdown', onPointerDown as EventListener);
  container.addEventListener('pointermove', onPointerMove as EventListener);
  container.addEventListener('pointerup', onPointerUp as EventListener);
}
2. Update Styles (src/content/styles.ts)
Add styles for handles, the new Move Mode colors, and the "Uncategorized" group.
code
TypeScript
// src/content/styles.ts -> Append to STYLES string

/* --- RESIZE HANDLES --- */
.resize-handle {
  position: absolute;
  z-index: 100;
  opacity: 0; /* Invisible but clickable */
}
.resize-handle:hover { background: rgba(59,130,246,0.5); opacity: 1; }

.resize-handle.e, .resize-handle.w { width: 6px; height: 100%; top: 0; cursor: ew-resize; }
.resize-handle.n, .resize-handle.s { height: 6px; width: 100%; left: 0; cursor: ns-resize; }

.resize-handle.e { right: 0; }
.resize-handle.w { left: 0; }
.resize-handle.n { top: 0; }
.resize-handle.s { bottom: 0; }

.resize-handle.se { width: 12px; height: 12px; bottom: 0; right: 0; cursor: nwse-resize; z-index: 101; }
.resize-handle.sw { width: 12px; height: 12px; bottom: 0; left: 0; cursor: nesw-resize; z-index: 101; }
.resize-handle.ne { width: 12px; height: 12px; top: 0; right: 0; cursor: nesw-resize; z-index: 101; }
.resize-handle.nw { width: 12px; height: 12px; top: 0; left: 0; cursor: nwse-resize; z-index: 101; }

/* --- UNCATEGORIZED GROUP --- */
.uncategorized-header {
  padding: 12px 12px 4px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--txt-muted);
  margin-top: 8px;
  border-top: 1px solid var(--bg-hover);
  user-select: none;
}

/* Move Mode: Uncategorized acts as a target */
.sidebar.mode-move .uncategorized-header {
  cursor: pointer;
  border: 1px dashed var(--border-default);
  margin: 8px;
  border-radius: 6px;
  text-align: center;
  padding: 8px;
}
.sidebar.mode-move .uncategorized-header:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}
.sidebar.mode-move .uncategorized-header.selected {
  background: var(--accent);
  color: white;
  border-style: solid;
}

/* --- UPDATED MOVE MODE COLORS --- */
/* 1. All valid folders get Light Blue */
.sidebar.mode-move .tree-row[data-type="folder"] {
  background: rgba(59, 130, 246, 0.1); /* Light Blue */
  color: var(--txt-primary);
  margin-bottom: 1px;
}

/* 2. Hover effect */
.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.2); 
}

/* 3. Selected Target gets Dark Blue */
.sidebar.mode-move .tree-row.destination {
  background: var(--accent) !important;
  color: white !important;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white !important;
}
`;
3. Update Host to Initialize Resize (src/content/host.ts)
Wire up the new resize utility.
code
TypeScript
// src/content/host.ts
import { STYLES } from './styles';
import { setupResizeHandles } from './resize'; // Import

export function createOrGetHost() {
  // ... (existing check and element creation) ...

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>${STYLES}</style>
    <div class="backdrop" id="backdrop">
      <div class="modal" id="modal">
        <!-- Sidebar/Workspace placeholders -->
        <aside class="sidebar" id="sidebar"></aside>
        <main class="workspace" id="workspace"></main>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `;

  // Initialize Resize
  const modal = shadow.getElementById('modal');
  if (modal) setupResizeHandles(modal, shadow);

  return { host, shadow };
}
4. Update Sidebar Logic (src/content/components/Sidebar.ts)
Here is the heavy lifting. We need to restructure renderTree to put root prompts at the bottom under "Uncategorized", and handle the new default selection in Move Mode.
code
TypeScript
// src/content/components/Sidebar.ts -> Replace renderTree and startMoveMode

// ... imports

export class Sidebar extends Component {
    // ... existing props
    
    // Updated startMoveMode
    public startMoveMode(promptId: string) {
        this.isMoveMode = true;
        this.movingPromptId = promptId;
        
        // AUTO-SELECT CURRENT PARENT
        const p = this.store.prompts.find(x => x.id === promptId);
        this.targetFolderId = p ? (p.parentId || null) : null; 
        
        this.container?.classList.add('mode-move');
        this.renderTree();
    }

    // ... stopMoveMode (keep same) ...

    // Completely Rewritten renderTree
    private renderTree() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        // SEARCH MODE: Flat(ish) List
        const filter = this.store.filterText.trim().toLowerCase();
        if (filter && !this.isMoveMode) {
            const visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
            if (visibleIds.size === 0) {
                this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
            } else {
                this.renderNode(null, 0, visibleIds);
            }
            return;
        }

        // NORMAL / MOVE MODE: Structured List
        
        // 1. Render Root Folders First
        this.renderFoldersRecursively(null, 0);

        // 2. Render "Uncategorized" Section (For Root Prompts)
        const rootPrompts = this.store.prompts.filter(p => p.parentId === null);
        
        // Always show header in Move Mode (as a target), or if prompts exist
        if (rootPrompts.length > 0 || this.isMoveMode) {
            const uncategorizedHeader = document.createElement('div');
            uncategorizedHeader.className = 'uncategorized-header';
            uncategorizedHeader.textContent = 'Uncategorized';
            
            // Move Mode Logic for Uncategorized (Targeting Root)
            if (this.isMoveMode) {
                if (this.targetFolderId === null) uncategorizedHeader.classList.add('selected');
                uncategorizedHeader.onclick = () => {
                    this.targetFolderId = null;
                    this.renderTree();
                };
            }
            
            this.listContainer.appendChild(uncategorizedHeader);

            // Render the prompts inside this group
            rootPrompts.forEach(p => {
                const row = this.createRow({
                    id: p.id,
                    name: p.title,
                    icon: ICONS.prompt,
                    type: 'prompt',
                    depth: 0, // Visual depth 0 relative to group
                    isPinned: p.isPinned
                });
                this.listContainer!.appendChild(row);
            });
        }
    }

    // New helper to strictly render folders recursively
    private renderFoldersRecursively(parentId: string | null, depth: number) {
        const folders = this.store.folders
            .filter(f => f.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        folders.forEach(f => {
            const isExpanded = f.isExpanded || false;
            
            const row = this.createRow({
                id: f.id,
                name: f.name,
                icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
                type: 'folder',
                depth,
                isExpanded,
                // Move Mode: Highlight if matches target
                isSelected: this.isMoveMode && this.targetFolderId === f.id
            });
            this.listContainer!.appendChild(row);

            // Render Children
            if (isExpanded) {
                this.renderFoldersRecursively(f.id, depth + 1);
                
                // If this folder is open, render its prompts (unless we are in Move Mode?)
                // Actually, standard view renders prompts inside folders.
                // Move mode usually hides prompts to reduce clutter, but let's stick to standard:
                // Only grey out prompts.
                
                const prompts = this.store.prompts.filter(p => p.parentId === f.id);
                prompts.forEach(p => {
                    const pRow = this.createRow({
                        id: p.id,
                        name: p.title,
                        icon: ICONS.prompt,
                        type: 'prompt',
                        depth: depth + 1,
                        isPinned: p.isPinned
                    });
                    this.listContainer!.appendChild(pRow);
                });
            }
        });
    }

    // renderNode (Keep for Search Mode usage)
    private renderNode(parentId: string | null, depth: number, visibleIds: Set<string>) {
       // ... (Keep existing logic from previous step, just ensure it uses visibleIds check)
       // Copy logic from Step 2_Fix but strictly check visibleIds
       const folders = this.store.folders.filter(f => f.parentId === parentId);
       const prompts = this.store.prompts.filter(p => p.parentId === parentId);

       folders.forEach(f => {
           if (!visibleIds.has(f.id)) return;
           const isExpanded = true; // Always expand in search
           this.listContainer!.appendChild(this.createRow({
               id: f.id, name: f.name, icon: ICONS.folderOpen, type: 'folder', depth, isExpanded
           }));
           this.renderNode(f.id, depth + 1, visibleIds);
       });

       prompts.forEach(p => {
           if (!visibleIds.has(p.id)) return;
           this.listContainer!.appendChild(this.createRow({
               id: p.id, name: p.title, icon: ICONS.prompt, type: 'prompt', depth, isPinned: p.isPinned
           }));
       });
    }
}
