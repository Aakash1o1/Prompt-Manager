// file: /home/auriga/Desktop/Projects/prompt manager/src/action.ts
// Popup logic: host pattern input + popular sites dropdown + runtime permission request.
// Full-file replacement.

export {};

// constants & types
const HOST_INPUT = 'host';
const BTN = 'enable';
const STATUS = 'status';
const STORAGE_KEY = 'promptManager.allowedHosts';

type SiteDef = { id: string; title: string; pattern: string };

// Popular list (UI convenience)
const POPULAR_SITES: SiteDef[] = [
  { id: 'aistudio-google', title: 'AI Studio', pattern: 'https://aistudio.google.com/*' },
  { id: 'chatgpt', title: 'ChatGPT', pattern: 'https://chatgpt.com/*' },
  { id: 'notebooklm-google', title: 'NotebookLM', pattern: 'https://notebooklm.google.com/*' },
  { id: 'deepseek-chat', title: 'DeepSeek', pattern: 'https://chat.deepseek.com/*' },
  { id: 'perplexity-ai', title: 'Perplexity', pattern: 'https://www.perplexity.ai/*' },
  { id: 'claude-ai', title: 'Claude', pattern: 'https://claude.ai/*' },
  { id: 'grok', title: 'Grok', pattern: 'https://grok.com/*' }
];

// small wrappers for chrome.storage
async function getHosts(): Promise<string[]> {
  return new Promise((res) => chrome.storage.local.get([STORAGE_KEY], (r) => res(r[STORAGE_KEY] ?? [])));
}
async function setHosts(hs: string[]) {
  return new Promise<void>((res) => chrome.storage.local.set({ [STORAGE_KEY]: hs }, () => res()));
}

// UI helper
function setStatus(msg: string) {
  const el = document.getElementById(STATUS)!;
  el.textContent = msg;
}

// normalize user input into origin pattern
function normalizePattern(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (s.endsWith('/*')) {
    try {
      const candidate = s.replace(/\*.*$/, '');
      const u = new URL(candidate);
      if (!u.hostname) return '';
      return `${u.protocol}//${u.hostname}/*`;
    } catch { }
  }
  try {
    let candidate = s;
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = 'https://' + candidate;
    }
    const u = new URL(candidate);
    if (!u.hostname) return '';
    return `${u.protocol}//${u.hostname}/*`;
  } catch {
    return '';
  }
}

// request permission wrapper
function requestPermissionForPattern(pattern: string): Promise<boolean> {
  return new Promise((res) => {
    try {
      chrome.permissions.request({ origins: [pattern] }, (granted) => {
        if (chrome.runtime.lastError) {
          console.error('Permission request error', chrome.runtime.lastError);
          res(false);
          return;
        }
        res(Boolean(granted));
      });
    } catch (e) {
      console.error('permissions.request threw', e);
      res(false);
    }
  });
}

// UI renderer for popular sites grid
async function renderPopularSites() {
  const listEl = document.getElementById('popular-sites-list')!;
  listEl.innerHTML = '';
  listEl.style.display = 'grid'; // Ensure it's a grid

  const checks = await Promise.all(POPULAR_SITES.map(s => new Promise<{ s: SiteDef; allowed: boolean }>(res => {
    chrome.permissions.contains({ origins: [s.pattern] }, (has) => res({ s, allowed: Boolean(has) }));
  })));
  const persisted = await getHosts();

  for (const entry of checks) {
    const s = entry.s;
    const alreadyAllowed = entry.allowed || persisted.includes(s.pattern);
    const siteButton = document.createElement('div');
    siteButton.className = 'site-button';
    if (alreadyAllowed) siteButton.classList.add('site-enabled');
    siteButton.dataset.pattern = s.pattern;
    siteButton.title = alreadyAllowed ? `Already enabled on ${s.pattern}` : `Select to enable on ${s.title}`;
    siteButton.textContent = s.title;
    siteButton.addEventListener('click', () => {
      if (alreadyAllowed) return;
      siteButton.classList.toggle('site-selected');
    });
    listEl.appendChild(siteButton);
  }
}

// UI renderer for the list of currently allowed sites
async function renderAllowedSites() {
  const container = document.getElementById('allowed-sites-list')!;
  container.innerHTML = '';

  const hosts = await getHosts();
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
    btn.addEventListener('click', async () => {
      await new Promise<void>((res) => {
        chrome.permissions.remove({ origins: [pattern] }, () => res());
      });
      const next = (await getHosts()).filter(p => p !== pattern);
      await setHosts(next);
      setStatus(`Removed permission for ${pattern}`);
      await renderAllowedSites();
      await renderPopularSites();
    });
    row.appendChild(span);
    row.appendChild(btn);
    container.appendChild(row);
  }
}

function confirmPermissionUi(pattern: string): boolean {
  return confirm(`Grant Prompt Drawer permission to access pages on:\n\n${pattern}`);
}

document.addEventListener('DOMContentLoaded', async () => {
  const hostInput = document.getElementById(HOST_INPUT) as HTMLInputElement;
  const btn = document.getElementById(BTN) as HTMLButtonElement;

  // --- Setup for Enabled Sites Dropdown ---
  const enabledSitesDropdown = document.getElementById('enabled-sites-dropdown')!;
  const enabledSitesToggle = document.getElementById('enabled-sites-toggle')!;
  const enabledSitesList = document.getElementById('allowed-sites-list')!;

  enabledSitesToggle.addEventListener('click', () => {
    const isOpen = enabledSitesList.style.display === 'block';
    enabledSitesList.style.display = isOpen ? 'none' : 'block';
    enabledSitesDropdown.classList.toggle('dd-open', !isOpen);
  });

  // --- Setup for Popular Sites Dropdown ---
  const popularSitesDropdown = document.getElementById('popular-sites-dropdown')!;
  const popularSitesToggle = document.getElementById('popular-sites-toggle')!;
  const popularSitesList = document.getElementById('popular-sites-list')!;

  popularSitesToggle.addEventListener('click', () => {
    const isOpen = popularSitesList.style.display === 'grid';
    popularSitesList.style.display = isOpen ? 'none' : 'grid';
    popularSitesDropdown.classList.toggle('dd-open', !isOpen);
  });

  // --- Main "Enable" button logic ---
  btn.addEventListener('click', async () => {
    const manual = normalizePattern(hostInput.value);
    const selected = Array.from(document.querySelectorAll<HTMLDivElement>('.site-button.site-selected'))
                          .map(e => (e.dataset.pattern || '').trim()).filter(Boolean);
    const originsToRequest = Array.from(new Set([...(manual ? [manual] : []), ...selected]));

    if (originsToRequest.length === 0) {
      setStatus('Enter a site (e.g., https://example.com) or select one.');
      return;
    }

    let grantedCount = 0;
    for (const pattern of originsToRequest) {
      if (!confirmPermissionUi(pattern)) {
        setStatus('Permission cancelled by user.');
        continue;
      }
      setStatus(`Requesting permission for ${pattern}...`);
      const granted = await requestPermissionForPattern(pattern);
      if (!granted) {
        setStatus(`Permission not granted for ${pattern}.`);
        continue;
      }
      grantedCount++;
      const cur = await getHosts();
      await setHosts(Array.from(new Set([...cur, pattern])));
      chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED', pattern }, () => {});
    }

    if (grantedCount > 0) {
      setStatus(`Permission granted for ${grantedCount} site(s). Reload tabs to activate.`);
      await renderPopularSites();
      await renderAllowedSites();
    }
    hostInput.value = '';
    setTimeout(() => setStatus(''), 4000);
  });

  // --- Initial Render ---
  await renderPopularSites();
  await renderAllowedSites();
  setStatus('');

  // --- Click-outside logic to close both dropdowns ---
  document.addEventListener('click', (ev) => {
    const path = (ev as any).composedPath ? (ev as any).composedPath() : [];
    // If the click path does not contain either dropdown, close them
    const isClickInside = path.some((n: any) => n && (n.id === 'popular-sites-dropdown' || n.id === 'enabled-sites-dropdown'));
    if (!isClickInside) {
      popularSitesList.style.display = 'none';
      popularSitesDropdown.classList.remove('dd-open');
      enabledSitesList.style.display = 'none';
      enabledSitesDropdown.classList.remove('dd-open');
    }
  });
});