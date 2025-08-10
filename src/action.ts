export {};


// src/action.ts
const HOST_INPUT = 'host';
const BTN = 'enable';
const STATUS = 'status';
const STORAGE_KEY = 'promptManager.allowedHosts';

function setStatus(msg: string) {
  const el = document.getElementById(STATUS)!;
  el.textContent = msg;
}

function normalize(s: string) { return s.trim(); }

async function getHosts(): Promise<string[]> {
  return new Promise((res) => chrome.storage.sync.get([STORAGE_KEY], (r) => res(r[STORAGE_KEY] ?? [])));
}
async function setHosts(hs: string[]) {
  return new Promise<void>((res) => chrome.storage.sync.set({ [STORAGE_KEY]: hs }, () => res()));
}

document.addEventListener('DOMContentLoaded', () => {
  (document.getElementById(BTN) as HTMLButtonElement).addEventListener('click', () => {
    const input = document.getElementById(HOST_INPUT) as HTMLInputElement;
    const val = normalize(input.value);
    if (!val) { setStatus('Enter a host pattern.'); return; }
    setStatus('Requesting permission...');
    try {
      chrome.permissions.request({ origins: [val] }, async (granted) => {
        if (granted) {
          const hosts = await getHosts();
          if (!hosts.includes(val)) {
            hosts.push(val);
            await setHosts(hosts);
          }
          // Tell background to inject into open tabs
          chrome.runtime.sendMessage({ type: 'PERMISSION_GRANTED', pattern: val }, () => {});
          setStatus('Permission granted — content injected into matching tabs.');
          input.value = '';
        } else {
          setStatus('Permission not granted.');
        }
      });
    } catch (e) {
      console.error(e);
      setStatus('Request failed. Check pattern format (e.g. https://example.com/*)');
    }
  });
});
