// src/background.ts
// Background service worker to listen for the Alt+P command and forward TOGGLE_POPUP to active tab.

chrome.commands.onCommand.addListener((command: string) => {
  if (command === 'open-prompt-drawer') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_POPUP' });
      }
    });
  }
});
