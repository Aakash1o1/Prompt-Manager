// file: src/action.ts
// Popup logic: host pattern input + popular sites dropdown + runtime permission request.
// Full-file replacement.

export {};
import { getAllowedOrigins, requestPermission, removePermission, normalizePattern } from './lib/permissions';

// constants & types
const STATUS = 'status';

// UI helper
function setStatus(msg: string) {
  const el = document.getElementById(STATUS)!;
  el.textContent = msg;
}

// UI renderer for the list of currently allowed sites
async function renderAllowedSites() {
  const container = document.getElementById('allowed-sites-list')!;
  container.innerHTML = '';

  const hosts = await getAllowedOrigins();
  if (hosts.length === 0) {
    container.innerHTML = '<div class="small" style="padding: 4px;">No sites have been enabled yet.</div>';
    return;
  }

  for (const pattern of hosts) {
    const row = document.createElement('div');
    row.className = 'site-row';
    const span = document.createElement('span');
    span.textContent = pattern;
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.className = 'remove-btn';
    
    // --- UPDATED: Use removePermission helper ---
    btn.addEventListener('click', async () => {
      setStatus(`Removing permission for ${pattern}...`);
      const removed = await removePermission(pattern);
      if (removed) {
           setStatus(`Permission for ${pattern} has been revoked.`);
           renderAllowedSites();
      } else {
           setStatus(`Permission removal was not completed for ${pattern}.`);
      }
    });
    // --------------------------------------------

    row.appendChild(span);
    row.appendChild(btn);
    container.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // --- Element References ---
  const addSiteBtn = document.getElementById('add-current-site-btn') as HTMLButtonElement;
  const enabledSitesDropdown = document.getElementById('enabled-sites-dropdown')!;
  const enabledSitesToggle = document.getElementById('enabled-sites-toggle')!;
  const enabledSitesList = document.getElementById('allowed-sites-list')!;

  let currentTabPattern: string | null = null;

  // --- DYNAMIC BUTTON LOGIC ---
  const initializeDynamicButton = async () => {
    // 1. Get the current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs?.[0];

    // Disable button if we can't get a valid tab/URL
    if (!tab?.url || !tab.url.startsWith('http')) {
      addSiteBtn.textContent = 'Cannot determine current site';
      addSiteBtn.disabled = true;
      return;
    }

    currentTabPattern = new URL(tab.url).origin + '/*';

    // 2. Check if permission already exists for this tab's origin
    chrome.permissions.contains({ origins: [currentTabPattern] }, (hasPermission) => {
      if (hasPermission) {
        // If permission exists, configure the button to be a "Remove" button
        updateButtonState('remove');
      } else {
        // Otherwise, configure it to be an "Add" button
        updateButtonState('add');
      }
      addSiteBtn.disabled = false;
    });
  };

  const updateButtonState = (state: 'add' | 'remove') => {
    if (!currentTabPattern) return;

    if (state === 'add') {
      addSiteBtn.textContent = 'Add to this site';
      addSiteBtn.classList.remove('danger');
      addSiteBtn.onclick = handleAddPermission;
    } else {
      addSiteBtn.textContent = 'Remove permission from this site';
      addSiteBtn.classList.add('danger');
      addSiteBtn.onclick = handleRemovePermission;
    }
  };

  // --- UPDATED: Use requestPermission helper ---
  const handleAddPermission = () => {
    if (!currentTabPattern) return;
    setStatus(`Requesting permission for ${currentTabPattern}...`);
    
    requestPermission(currentTabPattern).then(granted => {
        if (granted) {
             setStatus(`Permission granted for ${currentTabPattern}`);
             renderAllowedSites();
             updateButtonState('remove');
        } else {
             setStatus('Permission request was denied.');
        }
    });
  };
  // --------------------------------------------

  // --- UPDATED: Use removePermission helper ---
  const handleRemovePermission = () => {
    if (!currentTabPattern) return;
    setStatus(`Removing permission for ${currentTabPattern}...`);
    
    removePermission(currentTabPattern).then(removed => {
        if (removed) {
            setStatus(`Permission removed for ${currentTabPattern}`);
            renderAllowedSites();
            updateButtonState('add');
        } else {
            setStatus('Permission removal failed or was cancelled.');
        }
    });
  };
  // --------------------------------------------

  // --- Setup for Enabled Sites Dropdown ---
  enabledSitesToggle.addEventListener('click', () => {
    const isOpen = enabledSitesList.style.display === 'block';
    enabledSitesList.style.display = isOpen ? 'none' : 'block';
    enabledSitesDropdown.classList.toggle('dd-open', !isOpen);
  });

  // --- Initial Render ---
  await renderAllowedSites(); // Render the list of all enabled sites
  await initializeDynamicButton(); // Set up the main button's state
  setStatus('');

  // --- Click-outside logic to close dropdown ---
  document.addEventListener('click', (ev) => {
    const path = (ev as any).composedPath ? (ev as any).composedPath() : [];
    const isClickInside = path.some((n: any) => n && n.id === 'enabled-sites-dropdown');
    if (!isClickInside) {
      enabledSitesList.style.display = 'none';
      enabledSitesDropdown.classList.remove('dd-open');
    }
  });
});