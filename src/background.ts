// file: /home/auriga/Desktop/Projects/prompt manager/src/background.ts
// Background service worker: handles permission grants and injects content script into open tabs for allowed patterns.

type HostPattern = string;

const PROMPTS_HOSTS_KEY = 'promptManager.allowedHosts';


async function logCurrentPermissionsState(moment: string) {
  // 1. Get the list from YOUR extension's storage
  const hostsFromStorage = await getAllowedHosts();

  // 2. Get the list directly from CHROME's permission API
  const permissionsFromChrome = await new Promise<string[]>((resolve) => {
    chrome.permissions.getAll((permissions) => {
      resolve(permissions.origins || []);
    });
  });

  // 3. Print them both out with clear labels
  console.log(`\n--- PERMISSION STATE CHECK @ ${moment} ---`);
  console.log("[STORAGE] Your extension thinks it has permission for:", hostsFromStorage);
  console.log("[CHROME API] The browser says you have permission for:", permissionsFromChrome);
  console.log("-------------------------------------------\n");
}

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
  // We no longer rely on reading tab.url (requires "tabs" permission).
  // Instead, iterate open tab ids and attempt injection — injection will
  // succeed only on pages where we have host permission for `pattern`.
  const tabs = await chrome.tabs.query({}); // still returns tab ids without "tabs" permission
  for (const t of tabs) {
    if (!t?.id) continue;
    try {
      // attempt injection; will succeed only on pages that match the granted origin
      await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ['dist/content.js'] });
    } catch (e) {
      // ignore injection failures (not a matching host or not injectible page)
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

// When the user presses Alt+ P(command), toggle the popup in the active tab.
// If the content script is not injected into the active tab, we'll try to notify the user.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'open-prompt-drawer') return;

  // Get active tab (user gesture via keyboard command allows reading its URL)
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || !tab.id || !tab.url) {
      // No usable tab
      chrome.notifications?.create?.({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Prompt Manager',
        message: 'Unable to determine the active tab.'
      });
      return;
    }

    // Build origin pattern (https://origin/*)
    let originPattern: string;
    try {
      const u = new URL(tab.url);
      originPattern = `${u.protocol}//${u.hostname}/*`;
    } catch (err) {
      // fallback: can't parse URL
      chrome.notifications?.create?.({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Prompt Manager',
        message: 'Invalid page URL — cannot request permission.'
      });
      return;
    }

    // If permission already granted, just try toggling/injecting.
    chrome.permissions.contains({ origins: [originPattern] }, async (has) => {
      if (has) {
        // Already allowed — try messaging content script (same behavior as before)
        chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP', source: 'keyboard' }, (resp) => {
          if (chrome.runtime.lastError) {
            // fallback: try injection (content script might not be injected yet)
            chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['dist/content.js'] })
              .catch(() => {
                chrome.notifications?.create?.({
                  type: 'basic',
                  iconUrl: 'icon.png',
                  title: 'Prompt Manager',
                  message: 'Prompt Manager is not enabled on this site. Open Options to add this site.'
                });
              });
          }
        });
        return;
      }

      // Request persistent permission for this origin
      chrome.permissions.request({ origins: [originPattern] }, async (granted) => {
        if (chrome.runtime.lastError) {
          console.error('permissions.request error', chrome.runtime.lastError);
          chrome.notifications?.create?.({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Prompt Manager',
            message: 'Permission request failed. See console for details.'
          });
          return;
        }

        if (!granted) {
          // User denied. Optional: attempt one-time injection using activeTab behavior.
          chrome.notifications?.create?.({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Prompt Manager',
            message: 'Permission not granted. You can enable the extension from Options.'
          });
          return;
        }

        // Permission granted. Persist and inject.
        try {
          // reuse your helper to persist + inject across open tabs
          await onPermissionGrantedForPattern(originPattern);
          // inject into the current tab immediately
          await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['dist/content.js'] });
        } catch (e) {
          console.warn('Post-permission injection failed', e);
        }

        // Optional: notify user briefly
        chrome.notifications?.create?.({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Prompt Manager',
          message: `Enabled on ${originPattern}`
        });
      });
    });

  } catch (e) {
    console.error('commands handler failed', e);
  }
});





// When a tab updates, check if its URL matches any allowed host and inject if so.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Prefer to use changeInfo.url when available (URL change event).
  // Otherwise, when the tab status becomes 'complete' try injection once
  // (will succeed only if we have host permission for that tab).
  const hosts = await getAllowedHosts();
  console.log("hosts --> ",hosts);
  

  // If changeInfo.url is present we can check it without needing "tabs"
  if (changeInfo?.url) {
    const url = String(changeInfo.url);
    for (const p of hosts) {
      const originPrefix = p.replace(/\*.*$/, '');
      if (url.startsWith(originPrefix)) {
        chrome.permissions.contains({ origins: [p] }, (has) => {
          if (has) {
            injectIntoTab(tabId).catch((e) => console.warn(e));
          }
        });
        break;
      }
    }
    return;
  }

  // If no changeInfo.url, when the tab finished loading, do a safe attempt to inject.
  if (changeInfo?.status === 'complete') {
    for (const p of hosts) {
      // confirm permission exists before attempting
      chrome.permissions.contains({ origins: [p] }, (has) => {
        if (has) {
          // try injection — will fail harmlessly on non-matching pages
          injectIntoTab(tabId).catch(() => {});
        }
      });
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

// --- handle permission removals: update storage + notify content scripts to teardown ---
chrome.permissions.onRemoved.addListener(async (perms) => {
  await logCurrentPermissionsState("onRemoved listener START");

  try {
    if (!perms || !perms.origins) return;
    for (const originPattern of perms.origins) {
      // Remove from stored allowed-hosts (defensive)
      try {
        const hosts = await getAllowedHosts();
        const next = hosts.filter(h => h !== originPattern);
        if (next.length !== hosts.length) {
          await setAllowedHosts(next);
        }
      } catch (e) {
        console.error('Failed updating allowed hosts after removal', e);
      }

      // Notify all tabs: content scripts that are injected will receive this and teardown.
      try {
        const tabs = await chrome.tabs.query({});
        for (const t of tabs) {
          if (!t?.id) continue;
          chrome.tabs.sendMessage(t.id, { type: 'PERMISSION_REMOVED', pattern: originPattern }, () => {
            // swallow runtime.lastError — many tabs won't have the content script.
            // eslint-disable-next-line no-unused-expressions
            chrome.runtime.lastError && null;
          });
        }
      } catch (e) {
        console.error('Failed to notify tabs of permission removal', e);
      }
    }
  } catch (e) {
    console.error('permissions.onRemoved handler failed', e);
  }
});
