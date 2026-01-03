// file: /home/auriga/Desktop/Projects/prompt Drawer/src/background.ts
// Background service worker: handles permission grants and injects content script into open tabs for allowed patterns.




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
async function injectIntoOpenTabsForPattern(pattern: string) {
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
async function onPermissionGrantedForPattern(pattern: string) {
  // persist to allowedHosts list


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
  } else if (msg?.type === 'OPEN_TUTORIAL') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dist/tutorial.html') });
    sendResponse({ ok: true });
    return true;
  }
});

// When the user presses Alt+ P(command), toggle the popup in the active tab.
// If the content script is not injected into the active tab, we'll try to notify the user.
// --------------------------------------------------------------------------------------------------------------------------------
// src/background.ts

// When the user presses Alt+P, toggle the popup or request permission.
// src/background.ts

// REUSABLE FUNCTION to handle activation from any source (keyboard or icon click)
async function handleActivation(tab: chrome.tabs.Tab) {
  if (!tab?.id || !tab.url) {
    console.warn('Prompt Drawer: Cannot determine active tab.');
    return;
  }

  let originPattern: string;
  try {
    const u = new URL(tab.url);
    originPattern = `${u.protocol}//${u.hostname}/*`;
  } catch (e) {
    console.warn(`Prompt Drawer: Invalid URL for permission request: ${tab.url}`);
    return;
  }

  // 1. Check if we already have permission.
  chrome.permissions.contains({ origins: [originPattern] }, (hasPermission) => {
    if (hasPermission) {
      // SCENARIO A: Permission exists. Toggle the UI.
      chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP' }, (response) => {
        if (chrome.runtime.lastError) {
          // Fallback: If content script isn't there, inject it and then toggle.
          console.log('Content script not ready, injecting now.');
          chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ['dist/content.js'],
          }).then(() => {
            chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP' });
          }).catch(err => console.error("Injection fallback failed:", err));
        }
      });
    } else {
      // SCENARIO B: No permission. Request it from the user.
      chrome.permissions.request({ origins: [originPattern] }, async (granted) => {
        if (granted) {
          // User said yes! Inject the script and immediately open the UI.
          console.log(`Permission granted for ${originPattern}. Injecting...`);
          try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['dist/content.js'] });
            await chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP' });
          } catch (e) {
            console.error('Post-permission injection/toggle failed', e);
          }
        } else {
          // User said no.
          console.log('Permission not granted.');
        }
      });
    }
  });
}

// src/background.ts

// When the user presses Alt+P, decide whether to open the drawer or the action popup.
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'open-prompt-drawer') {
    return;
  }

  // Ensure we have a valid tab to work with.
  if (!tab?.id || !tab.url) {
    console.warn('Prompt Drawer: Cannot determine active tab.');
    // If we can't get a tab, just open the popup as a fallback.
    chrome.action.openPopup();
    return;
  }

  // NEW: Detect if we are on an internal extension page (like tutorial.html)
  if (tab.url.startsWith('chrome-extension://')) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_POPUP' }, () => {
      if (chrome.runtime.lastError) {
        console.warn("Toggle failed on internal page.");
      }
    });
    return;
  }

  let originPattern: string;
  try {
    // Create the origin pattern (e.g., "https://www.google.com/*")
    originPattern = new URL(tab.url).origin + '/*';
  } catch (e) {
    // This happens on special pages like chrome://extensions. Open the popup.
    console.warn(`Prompt Drawer: Invalid URL for permission check: ${tab.url}`);
    chrome.action.openPopup();
    return;
  }

  // Check if we have permission for the current site.
  chrome.permissions.contains({ origins: [originPattern] }, (hasPermission) => {
    if (hasPermission) {
      // --- BEHAVIOR 1: PERMISSION GRANTED ---
      // Send a message to the content script to toggle the main UI.
      chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP' }, (response) => {
        // Fallback: If the content script isn't there, inject it and then toggle.
        if (chrome.runtime.lastError) {
          console.log('Content script not ready, injecting now.');
          chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ['dist/content.js'],
          }).then(() => {
            chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_POPUP' });
          }).catch(err => console.error("Injection fallback failed:", err));
        }
      });
    } else {
      // --- BEHAVIOR 2: PERMISSION NOT GRANTED ---
      // Programmatically open the action.html popup.
      chrome.action.openPopup();
    }
  });
});


//-------------------------------------------------------------------------------




// When a tab updates, check if its URL matches any allowed host and inject if so.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject when a page is finished loading to avoid issues.
  if (changeInfo.status !== 'complete' || !tab.url || !tab.url.startsWith('http')) {
    return;
  }
  const tabUrl = tab.url;

  // Ask the browser if we have permission for this specific URL.
  // This is the most reliable check.
  chrome.permissions.contains({ origins: [tabUrl] }, (hasPermission) => {
    if (hasPermission) {
      injectIntoTab(tabId).catch(() => { }); // Fails silently if not possible
    }
  });
});




// On install/startup, attempt to inject into open tabs for stored hosts if permission still present
chrome.runtime.onInstalled.addListener((details) => {
  // NEW: Open Tutorial on Install
  if (details.reason === 'install') {
      chrome.tabs.create({
          url: chrome.runtime.getURL('dist/tutorial.html')
      });
  }

  // === REPLACE THE LOGIC WITH THIS SIMPLER VERSION ===
  chrome.permissions.getAll(permissions => {
    if (permissions.origins) {
      for (const origin of permissions.origins) {
        injectIntoOpenTabsForPattern(origin).catch(console.error);
      }
    }
  });

  // Create context menu item for saving selected text to prompt
  chrome.contextMenus.create({
    id: 'save-prompt',
    title: 'Save to Prompt Drawer',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-prompt' && tab?.id) {
    // Detect if we are on an internal extension page
    if (tab.url?.startsWith('chrome-extension://')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'OPEN_WITH_TEXT',
        text: info.selectionText || ''
      });
      return;
    }

    // Instead of using info.selectionText (which may lose formatting),
    // execute a script in the page to get the actual selection
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
      }
    }).then((results) => {
      const selectedText = results && results[0] && results[0].result ? results[0].result : '';

      // Send message to the active tab to open with selected text
      chrome.tabs.sendMessage(tab.id!, {
        type: 'OPEN_WITH_TEXT',
        text: selectedText
      }).catch((error) => {
        console.warn('Failed to send message to tab. Content script may not be loaded:', error);

        // Try to inject content script and then send message
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ['dist/content.js']
        }).then(() => {
          chrome.tabs.sendMessage(tab.id!, {
            type: 'OPEN_WITH_TEXT',
            text: selectedText
          }).catch(err => console.error('Failed after injection:', err));
        }).catch(err => console.error('Injection failed:', err));
      });
    }).catch((error) => {
      console.error('Failed to get selection:', error);
      // Fallback to selectionText if executeScript fails
      const selectedText = info.selectionText || '';
      chrome.tabs.sendMessage(tab.id!, {
        type: 'OPEN_WITH_TEXT',
        text: selectedText
      }).catch(err => console.warn('Fallback message send failed:', err));
    });
  }
});


// When permissions are added (anywhere), attempt to install content script for those origins
chrome.permissions.onAdded.addListener(async (perms) => {
  if (!perms || !perms.origins) return;
  
  for (const originPattern of perms.origins) {
    onPermissionGrantedForPattern(originPattern).catch((e) => console.error('onAdded handler failed', e));

    // RELIABLE SEARCH: Find all tabs belonging to this extension
    const tabs = await chrome.tabs.query({}); 
    const extensionId = chrome.runtime.id;

    for (const t of tabs) {
        // Send to any tab that looks like our tutorial page
        if (t.id && t.url?.includes(extensionId) && t.url?.includes('tutorial.html')) {
            chrome.tabs.sendMessage(t.id, { 
                type: 'TUTORIAL_EXTERNAL_SIGNAL', 
                detail: { type: 'PERMISSION_GRANTED', payload: { origin: originPattern } } 
            }).catch(() => {}); // Ignore errors for closed tabs
        }
    }
  }
});

// --- handle permission removals: update storage + notify content scripts to teardown ---
chrome.permissions.onRemoved.addListener(async (perms) => {

  try {
    if (!perms || !perms.origins) return;
    for (const originPattern of perms.origins) {

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
