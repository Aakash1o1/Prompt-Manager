Step 9: Hardening Host Cleanup
Objective: Ensure a clean slate on every extension reload (preventing UI glitches) and verify the Toast positioning fix.
Files to Modify:
src/content/host.ts
Tasks:
Update src/content/host.ts
Replace the file with this robust version. It aggressively searches for any existing hosts (by ID or potential leftovers) and removes them before creating a new one.
code
TypeScript
// src/content/host.ts
import { STYLES } from './styles';
import { setupResizeHandles } from './resize';

export function createOrGetHost() {
  const HOST_ID = 'prompt-drawer-host-shadow';

  // 1. Aggressive Cleanup: Find ANY existing host by ID and remove it.
  // This handles the "Zombie" state after extension reload.
  const existingHost = document.getElementById(HOST_ID);
  if (existingHost) {
    existingHost.remove();
    // Force a small browser repaint/reflow if needed, though usually remove() is enough
  }

  // 2. Reset the global flag to allow re-initialization
  // Even though new content scripts get isolated globals, 
  // ensuring this is clean prevents logic loops if the page context leaks.
  (window as any).__promptManagerInitialized = true;

  // 3. Create Fresh Host
  const host = document.createElement('div');
  host.id = HOST_ID;

  Object.assign(host.style, {
    all: 'initial',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0', /* Host has no size, children are fixed/modal */
    height: '0',
    zIndex: '2147483647',
    pointerEvents: 'none' // Pass-through when closed
  });

  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // 4. Inject Skeleton
  shadow.innerHTML = `
    <style>${STYLES}</style>
    
    <!-- BACKDROP -->
    <div class="backdrop" id="backdrop">
      <div class="modal" id="modal">
        <!-- Placeholders for components -->
        <aside class="sidebar" id="sidebar"></aside>
        <main class="workspace" id="workspace"></main>
      </div>
    </div>

    <!-- TOAST (Fixed position relative to window) -->
    <div class="toast" id="toast"></div>
  `;

  // 5. Initialize Resize Logic
  const modal = shadow.getElementById('modal');
  if (modal) setupResizeHandles(modal, shadow);

  return { host, shadow };
}
