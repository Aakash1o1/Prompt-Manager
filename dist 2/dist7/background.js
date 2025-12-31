"use strict";
(() => {
  // src/background.ts
  async function injectIntoTab(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      });
    } catch (e) {
      console.warn("Injection failed", e);
    }
  }
  async function injectIntoOpenTabsForPattern(pattern) {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (!t?.id)
        continue;
      try {
        await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ["content.js"] });
      } catch (e) {
      }
    }
  }
  async function onPermissionGrantedForPattern(pattern) {
    chrome.permissions.contains({ origins: [pattern] }, (has) => {
      if (has) {
        injectIntoOpenTabsForPattern(pattern).catch((e) => console.warn("Inject after permission granted failed", e));
      } else {
        console.warn("Permission reported granted but chrome.permissions.contains returned false for:", pattern);
      }
    });
  }
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "PERMISSION_GRANTED" && msg?.pattern) {
      onPermissionGrantedForPattern(String(msg.pattern)).catch((e) => console.error(e));
      sendResponse({ ok: true });
      return true;
    } else if (msg?.type === "INJECT_IF_MATCH") {
      const tabId = msg.tabId;
      injectIntoTab(tabId).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
      return true;
    }
  });
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command !== "open-prompt-drawer") {
      return;
    }
    if (!tab?.id || !tab.url) {
      console.warn("Prompt Drawer: Cannot determine active tab.");
      chrome.action.openPopup();
      return;
    }
    let originPattern;
    try {
      originPattern = new URL(tab.url).origin + "/*";
    } catch (e) {
      console.warn(`Prompt Drawer: Invalid URL for permission check: ${tab.url}`);
      chrome.action.openPopup();
      return;
    }
    chrome.permissions.contains({ origins: [originPattern] }, (hasPermission) => {
      if (hasPermission) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_POPUP" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("Content script not ready, injecting now.");
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
            }).then(() => {
              chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_POPUP" });
            }).catch((err) => console.error("Injection fallback failed:", err));
          }
        });
      } else {
        chrome.action.openPopup();
      }
    });
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url || !tab.url.startsWith("http")) {
      return;
    }
    const tabUrl = tab.url;
    chrome.permissions.contains({ origins: [tabUrl] }, (hasPermission) => {
      if (hasPermission) {
        injectIntoTab(tabId).catch(() => {
        });
      }
    });
  });
  chrome.runtime.onInstalled.addListener(() => {
    chrome.permissions.getAll((permissions) => {
      if (permissions.origins) {
        for (const origin of permissions.origins) {
          injectIntoOpenTabsForPattern(origin).catch(console.error);
        }
      }
    });
    chrome.contextMenus.create({
      id: "save-prompt",
      title: "Save to Prompt Drawer",
      contexts: ["selection"]
    });
  });
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-prompt" && tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection();
          return selection ? selection.toString() : "";
        }
      }).then((results) => {
        const selectedText = results && results[0] && results[0].result ? results[0].result : "";
        chrome.tabs.sendMessage(tab.id, {
          type: "OPEN_WITH_TEXT",
          text: selectedText
        }).catch((error) => {
          console.warn("Failed to send message to tab. Content script may not be loaded:", error);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          }).then(() => {
            chrome.tabs.sendMessage(tab.id, {
              type: "OPEN_WITH_TEXT",
              text: selectedText
            }).catch((err) => console.error("Failed after injection:", err));
          }).catch((err) => console.error("Injection failed:", err));
        });
      }).catch((error) => {
        console.error("Failed to get selection:", error);
        const selectedText = info.selectionText || "";
        chrome.tabs.sendMessage(tab.id, {
          type: "OPEN_WITH_TEXT",
          text: selectedText
        }).catch((err) => console.warn("Fallback message send failed:", err));
      });
    }
  });
  chrome.permissions.onAdded.addListener((perms) => {
    if (!perms || !perms.origins)
      return;
    for (const originPattern of perms.origins) {
      onPermissionGrantedForPattern(originPattern).catch((e) => console.error("onAdded handler failed", e));
    }
  });
  chrome.permissions.onRemoved.addListener(async (perms) => {
    try {
      if (!perms || !perms.origins)
        return;
      for (const originPattern of perms.origins) {
        try {
          const tabs = await chrome.tabs.query({});
          for (const t of tabs) {
            if (!t?.id)
              continue;
            chrome.tabs.sendMessage(t.id, { type: "PERMISSION_REMOVED", pattern: originPattern }, () => {
              chrome.runtime.lastError && null;
            });
          }
        } catch (e) {
          console.error("Failed to notify tabs of permission removal", e);
        }
      }
    } catch (e) {
      console.error("permissions.onRemoved handler failed", e);
    }
  });
})();
