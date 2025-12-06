// src/options.ts
export {};
import { getAllowedOrigins, removePermission } from './lib/permissions';

const ADD_BTN_ID = 'add-current-site-btn';
const LIST_ID = 'hosts-list';

// (Local getAllowedOrigins and normalizePattern have been removed)

async function rebuildList() {
  const listEl = document.getElementById(LIST_ID)! as HTMLElement;
  listEl.innerHTML = '';
  
  // Use the imported helper
  const hosts = await getAllowedOrigins();
  
  if (!hosts.length) {
    listEl.innerHTML = '<li class="small">No sites enabled yet.</li>';
    return;
  }
  
  for (const h of hosts) {
    const li = document.createElement('li');
    const span = document.createElement('div');
    span.className = 'host';
    span.textContent = h;
    
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.style.background = '#e02424';
    btn.style.color = '#fff';
    
    // --- UPDATED CLICK LISTENER ---
    btn.addEventListener('click', async () => {
      const removed = await removePermission(h);
      if (removed) {
          console.log(`Permission for ${h} removed. Rebuilding list.`);
          rebuildList();
      } else {
          console.log(`Permission removal for ${h} was not completed.`);
          // Optional: alert user if needed
          // alert(`Could not remove permission for ${h}`);
      }
    });
    // ------------------------------

    li.appendChild(span);
    li.appendChild(btn);
    listEl.appendChild(li);
  }
}

async function onAddCurrentSiteClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      return alert('Could not determine current site. Navigate to a tab and try again.');
    }
    const url = tabs[0].url;
    if (!url) {
      return alert('Could not get URL of current site.');
    }
    const pattern = new URL(url).origin + '/*';

    chrome.permissions.request({ origins: [pattern] }, async (granted) => {
      if (granted) {
        chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED', pattern }, () => {});
        rebuildList();
        alert('Permission granted for ' + pattern);
      } else {
        alert('Permission not granted.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById(ADD_BTN_ID) as HTMLButtonElement;
  if (addBtn) {
    addBtn.addEventListener('click', onAddCurrentSiteClick);
  }
  rebuildList();
});