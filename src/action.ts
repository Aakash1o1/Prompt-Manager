export {};

// action.ts - popup logic: host pattern input + popular sites dropdown + batch permission request
const HOST_INPUT = 'host';
const BTN = 'enable';
const STATUS = 'status';
const STORAGE_KEY = 'promptManager.allowedHosts';

type SiteDef = { id: string; title: string; pattern: string };

const POPULAR_SITES: SiteDef[] = [
  { id: 'aistudio-google', title: 'AI Studio', pattern: 'https://aistudio.google.com/*' },
  { id: 'chatgpt', title: 'ChatGPT', pattern: 'https://chatgpt.com/*' },
  { id: 'notebooklm-google', title: 'NotebookLM', pattern: 'https://notebooklm.google.com/*' },
  { id: 'deepseek-chat', title: 'DeepSeek', pattern: 'https://chat.deepseek.com/*' },
  { id: 'perplexity-ai', title: 'Perplexity', pattern: 'https://www.perplexity.ai/*' },
  { id: 'claude-ai', title: 'Claude', pattern: 'https://claude.ai/*' },
  { id: 'grok', title: 'Grok', pattern: 'https://grok.com/*' }
];

// Simple storage helpers
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

// Render popular sites grid of buttons
async function renderPopularSites() {
  const listEl = document.getElementById('dd-list')!;
  listEl.innerHTML = '';

  const checks = await Promise.all(POPULAR_SITES.map(s => new Promise<{s:SiteDef, allowed:boolean}>(res => {
    chrome.permissions.contains({ origins: [s.pattern] }, (has) => res({ s, allowed: Boolean(has) }));
  })));

  const persisted = await getHosts();

  for (const entry of checks) {
    const s = entry.s;
    const alreadyAllowed = entry.allowed || persisted.includes(s.pattern);

    const siteButton = document.createElement('div');
    siteButton.className = 'site-button';
    if (alreadyAllowed) {
      siteButton.classList.add('site-enabled');
    }
    siteButton.dataset.pattern = s.pattern;
    siteButton.title = alreadyAllowed ? `Already enabled on ${s.pattern}` : `Select to enable on ${s.title}`;
    siteButton.setAttribute('role', 'button');
    siteButton.textContent = s.title;

    // Clicking toggles selection only if not already enabled
    siteButton.addEventListener('click', () => {
      if (alreadyAllowed) return;
      siteButton.classList.toggle('site-selected');
    });

    listEl.appendChild(siteButton);
  }
}

// Helper to normalize user-entered host to a pattern
function normalizePattern(s: string) {
  s = s.trim();
  if (!s) return '';
  if (s.endsWith('/*')) return s;
  if (/^https?:\/\/[^\/]+\/?$/.test(s)) return s.replace(/\/?$/, '') + '/*';
  return s;
}

// Hook up UI events on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  const hostInput = document.getElementById(HOST_INPUT) as HTMLInputElement;
  const btn = document.getElementById(BTN) as HTMLButtonElement;
  const statusEl = document.getElementById(STATUS)!;

  // Dropdown toggle
  const ddToggle = document.getElementById('dd-toggle')!;
  const ddList = document.getElementById('dd-list')!;
  const popularDropdown = document.getElementById('popular-dropdown')!;
  
  function openDropdown() {
    ddList.style.display = 'grid'; // Use grid to display
    popularDropdown.classList.add('dd-open');
    renderPopularSites().catch(console.error);
  }
  function closeDropdown() {
    ddList.style.display = 'none';
    popularDropdown.classList.remove('dd-open');
  }

  ddToggle.addEventListener('click', () => {
    if (ddList.style.display === 'grid') closeDropdown(); else openDropdown();
  });

  // Universal "Enable" button for both manual input and grid selection
  btn.addEventListener('click', () => {
    const manualPattern = normalizePattern(hostInput.value);
    const selectedPatterns = Array.from(document.querySelectorAll<HTMLDivElement>('.site-button.site-selected'))
                                  .map(btn => btn.dataset.pattern!)
                                  .filter(Boolean);
    
    // Combine and deduplicate patterns
    const originsToRequest = [...new Set([manualPattern, ...selectedPatterns].filter(Boolean))];

    if (originsToRequest.length === 0) {
      setStatus('Enter a site pattern or select one from the list.');
      return;
    }

    setStatus('Requesting permission...');
    try {
      chrome.permissions.request({ origins: originsToRequest }, async (granted) => {
        if (chrome.runtime.lastError) {
          setStatus('Request failed. Check pattern format (e.g. https://example.com/*)');
          return;
        }
        if (granted) {
          const hosts = await getHosts();
          const newHosts = [...hosts, ...originsToRequest];
          await setHosts([...new Set(newHosts)]);
          
          // Notify background for each newly granted pattern
          for (const pattern of originsToRequest) {
            chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED', pattern: pattern }, () => {});
          }

          setStatus('Permission granted! Reload any matching tabs to activate.');
          hostInput.value = '';
          await renderPopularSites(); // Re-render to show new enabled states
        } else {
          setStatus('Permission not granted.');
        }
      });
    } catch (e) {
      console.error(e);
      setStatus('Request failed. Check pattern format (e.g. https://example.com/*)');
    }
  });

  // initial render (dropdown closed)
  await renderPopularSites();
  setStatus('');

  // close dropdown when clicking outside popup area
  document.addEventListener('click', (ev) => {
    const path = (ev as any).composedPath ? (ev as any).composedPath() : [];
    if (!path.find((n: any) => n && n.id === 'popular-dropdown')) {
      closeDropdown();
    }
  });
});