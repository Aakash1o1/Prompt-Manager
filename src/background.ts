// src/background.ts
// Background service worker: handles keyboard command and injection after host permission is granted.

type HostPattern = string;

const PROMPTS_HOSTS_KEY = 'promptManager.allowedHosts';

// Helper: read allowed hosts from storage
function getAllowedHosts(): Promise<HostPattern[]> {
  return new Promise((res) => chrome.storage.local.get([PROMPTS_HOSTS_KEY], (r) => res(r[PROMPTS_HOSTS_KEY] ?? [])));
}
function setAllowedHosts(hosts: HostPattern[]): Promise<void> {
  return new Promise((res) => chrome.storage.local.set({ [PROMPTS_HOSTS_KEY]: hosts }, () => res()));
}

// Inject content script into a single tab (if not already present)
async function injectIntoTab(tabId: number) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['dist/content.js']
    });
    // (Optionally) inject CSS if you have separate css file
    // await chrome.scripting.insertCSS({ target: { tabId }, files: ['dist/content.css'] });
  } catch (e) {
    // injecting failed (likely no permission)
    console.warn('Injection failed', e);
  }
}

// Inject into all open tabs matching originPrefix
async function injectIntoOpenTabsForPattern(pattern: HostPattern) {
  // compute origin prefix for a typical pattern like "https://example.com/*"
  const originPrefix = pattern.replace(/\*.*$/, '');
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (!t.url || !t.id) continue;
    if (t.url.startsWith(originPrefix)) {
      await injectIntoTab(t.id);
    }
  }
}

// Called when the user grants permission for pattern (from options page)
async function onPermissionGrantedForPattern(pattern: HostPattern) {
  // save to allowedHosts
  const hosts = await getAllowedHosts();
  if (!hosts.includes(pattern)) {
    hosts.push(pattern);
    await setAllowedHosts(hosts);
  }

  // Ensure the permission actually exists before attempting injection.
  // This guards against race conditions if the request callback ran in a closed popup.
  chrome.permissions.contains({ origins: [pattern] }, (has) => {
    if (has) {
      // inject content script into existing open tabs for that pattern
      injectIntoOpenTabsForPattern(pattern).catch((e) => console.warn('Injection failed after permission granted', e));
    } else {
      console.warn('Permission indicated for pattern but chrome.permissions.contains returned false:', pattern);
    }
  });
}

// Listen for messages from options page (to notify background to inject) or other parts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'PERMISSION_GRANTED') {
    const pattern = msg.pattern as HostPattern;
    onPermissionGrantedForPattern(pattern).catch((e) => console.error(e));
    sendResponse({ ok: true });
    return true;
  } else if (msg?.type === 'INJECT_IF_MATCH') {
    // message asks background to attempt injection in the provided tab (e.g., on tab update)
    const tabId = msg.tabId as number;
    injectIntoTab(tabId).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
});

// When the user presses Alt+P (command), toggle the popup in the active tab.
// If the content script is not injected into the active tab, we'll try to notify the user.
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-prompt-drawer') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab?.id || !tab.url) return;

    // Try sending message to content script. If it isn't present the message will silently fail.
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_POPUP', source: 'keyboard' }, (resp) => {
      if (chrome.runtime.lastError) {
        // content script not injected -> advise user to grant permission for this site
        chrome.notifications?.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Prompt Manager',
          message: 'Prompt Manager is not enabled on this site. Open Options to add this site and allow access.'
        });
      }
    });
  }
});

// When a tab updates, check if its URL matches any allowed host and inject if so.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;
  const hosts = await getAllowedHosts();
  for (const p of hosts) {
    const originPrefix = p.replace(/\*.*$/, '');
    if (tab.url.startsWith(originPrefix)) {
      // we have an allowed host pattern; check permission exists
      chrome.permissions.contains({ origins: [p] }, (has) => {
        if (has) {
          // inject once the document is ready-ish
          injectIntoTab(tabId).catch((e) => console.warn(e));
        }
      });
      break;
    }
  }
});

// On install / startup, attempt to inject into open tabs for all stored hosts (if permission still present)
chrome.runtime.onInstalled.addListener(async () => {
  const hosts = await getAllowedHosts();
  for (const p of hosts) {
    // Only inject if permission still present
    chrome.permissions.contains({ origins: [p] }, (has) => {
      if (has) injectIntoOpenTabsForPattern(p).catch(console.error);
    });
  }
});

// Robustness: when permissions are added (anywhere), attempt to install content script
// for those newly added origins. This handles the case where the popup closed and
// the popup callback couldn't notify background.
chrome.permissions.onAdded.addListener((perms) => {
  if (!perms || !perms.origins) return;
  for (const originPattern of perms.origins) {
    // Call same handler used when the options page sends the PERMISSION_GRANTED message.
    // This will update storage and attempt injection (onPermissionGrantedForPattern checks permission).
    onPermissionGrantedForPattern(originPattern).catch((e) => console.error('onAdded handler failed', e));
  }
});