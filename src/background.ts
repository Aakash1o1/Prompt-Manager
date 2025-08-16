// file: /home/auriga/Desktop/Projects/prompt manager/src/background.ts
// Background service worker: handles permission grants and injects content script into open tabs for allowed patterns.

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
  } catch (e) {
    console.warn('Injection failed', e);
  }
}

// Inject into all open tabs matching originPrefix
async function injectIntoOpenTabsForPattern(pattern: HostPattern) {
  const originPrefix = pattern.replace(/\*.*$/, '');
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (!t.url || !t.id) continue;
    if (t.url.startsWith(originPrefix)) {
      await injectIntoTab(t.id);
    }
  }
}

// Called when the user grants permission for pattern (from options/page)
async function onPermissionGrantedForPattern(pattern: HostPattern) {
  // persist to allowedHosts list
  const hosts = await getAllowedHosts();
  if (!hosts.includes(pattern)) {
    hosts.push(pattern);
    await setAllowedHosts(hosts);
  }

  // double-check permission exists (defensive)
  chrome.permissions.contains({ origins: [pattern] }, (has) => {
    if (has) {
      injectIntoOpenTabsForPattern(pattern).catch((e) => console.warn('Inject after permission granted failed', e));
    } else {
      console.warn('Permission reported granted but chrome.permissions.contains returned false for:', pattern);
    }
  });
}

// Message listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'PERMISSION_GRANTED' && msg?.pattern) {
    onPermissionGrantedForPattern(String(msg.pattern)).catch((e) => console.error(e));
    sendResponse({ ok: true });
    return true;
  } else if (msg?.type === 'INJECT_IF_MATCH') {
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
      chrome.permissions.contains({ origins: [p] }, (has) => {
        if (has) {
          injectIntoTab(tabId).catch((e) => console.warn(e));
        }
      });
      break;
    }
  }
});

// On install/startup, attempt to inject into open tabs for stored hosts if permission still present
chrome.runtime.onInstalled.addListener(async () => {
  const hosts = await getAllowedHosts();
  for (const p of hosts) {
    chrome.permissions.contains({ origins: [p] }, (has) => {
      if (has) injectIntoOpenTabsForPattern(p).catch(console.error);
    });
  }
});

// When permissions are added (anywhere), attempt to install content script for those origins
chrome.permissions.onAdded.addListener((perms) => {
  if (!perms || !perms.origins) return;
  for (const originPattern of perms.origins) {
    onPermissionGrantedForPattern(originPattern).catch((e) => console.error('onAdded handler failed', e));
  }
});
