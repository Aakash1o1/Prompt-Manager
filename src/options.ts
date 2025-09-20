export {};


// src/options.ts
const INPUT_ID = 'new-host';
const REQ_BTN = 'request-btn';
const LIST_ID = 'hosts-list';
const STORAGE_KEY = 'promptManager.allowedHosts';

async function getHosts(): Promise<string[]> {
  return new Promise((res) => chrome.storage.local.get([STORAGE_KEY], (r) => res(r[STORAGE_KEY] ?? [])));
}
async function setHosts(hosts: string[]) {
  return new Promise<void>((res) => chrome.storage.local.set({ [STORAGE_KEY]: hosts }, () => res()));
}

function normalizePattern(s: string) {
  return s.trim();
}

async function rebuildList() {
  const listEl = document.getElementById(LIST_ID)! as HTMLElement;
  listEl.innerHTML = '';
  const hosts = await getHosts();
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
    btn.addEventListener('click', async () => {
      // ONLY call chrome.permissions.remove. 
      // The background script's onRemoved listener will handle everything else.
      chrome.permissions.remove({ origins: [h] }, (removed) => {
        if (chrome.runtime.lastError) {
          console.error(`permissions.remove failed for ${h}:`, chrome.runtime.lastError.message);
          // Optional: show an alert or status message to the user
          alert(`Failed to remove permission: ${chrome.runtime.lastError.message}`);
          return;
        }
        
        if (removed) {
          // The permission was successfully removed.
          // The onRemoved listener in background.js will handle storage cleanup.
          // We just need to rebuild the list in this options page UI.
          console.log(`Permission for ${h} removed. Rebuilding list.`);
          rebuildList();
        } else {
          // The removal was not successful (e.g., user canceled a prompt).
          console.log(`Permission removal for ${h} was not completed.`);
        }
      });
    });

    li.appendChild(span);
    li.appendChild(btn);
    listEl.appendChild(li);
  }
}

async function onRequestClick() {
  const input = document.getElementById(INPUT_ID) as HTMLInputElement;
  const val = normalizePattern(input.value);
  if (!val) return alert('Enter a host pattern like https://example.com/*');
  try {
    chrome.permissions.request({ origins: [val] }, async (granted) => {
      if (granted) {
        const hosts = await getHosts();
        if (!hosts.includes(val)) {
          hosts.push(val);
          await setHosts(hosts);
        }
        // inform background to inject on open tabs
        chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED', pattern: val }, () => {});
        input.value = '';
        rebuildList();
        alert('Permission granted and content injected into matching open tabs (if any).');
      } else {
        alert('Permission not granted.');
      }
    });
  } catch (e) {
    console.error(e);
    alert('Request failed. Check the pattern format (e.g. https://example.com/*)');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (document.getElementById(REQ_BTN) as HTMLButtonElement).addEventListener('click', onRequestClick);
  rebuildList();
});
