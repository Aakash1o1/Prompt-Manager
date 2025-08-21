(() => {
  // src/background.ts
  var PROMPTS_HOSTS_KEY = "promptManager.allowedHosts";
  function getAllowedHosts() {
    return new Promise((res) => chrome.storage.local.get([PROMPTS_HOSTS_KEY], (r) => res(r[PROMPTS_HOSTS_KEY] ?? [])));
  }
  function setAllowedHosts(hosts) {
    return new Promise((res) => chrome.storage.local.set({ [PROMPTS_HOSTS_KEY]: hosts }, () => res()));
  }
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
    const originPrefix = pattern.replace(/\*.*$/, "");
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (!t.url || !t.id)
        continue;
      if (t.url.startsWith(originPrefix)) {
        await injectIntoTab(t.id);
      }
    }
  }
  async function onPermissionGrantedForPattern(pattern) {
    const hosts = await getAllowedHosts();
    if (!hosts.includes(pattern)) {
      hosts.push(pattern);
      await setAllowedHosts(hosts);
    }
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
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "open-prompt-drawer") {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id || !tab.url)
        return;
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_POPUP", source: "keyboard" }, (resp) => {
        if (chrome.runtime.lastError) {
          chrome.notifications?.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Prompt Manager",
            message: "Prompt Manager is not enabled on this site. Open Options to add this site and allow access."
          });
        }
      });
    }
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url)
      return;
    const hosts = await getAllowedHosts();
    for (const p of hosts) {
      const originPrefix = p.replace(/\*.*$/, "");
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
  chrome.runtime.onInstalled.addListener(async () => {
    const hosts = await getAllowedHosts();
    for (const p of hosts) {
      chrome.permissions.contains({ origins: [p] }, (has) => {
        if (has)
          injectIntoOpenTabsForPattern(p).catch(console.error);
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
})();
