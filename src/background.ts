// Chrome types fallback
// @ts-ignore
declare const chrome: any;

// Listen for keyboard shortcut
if (chrome.commands) {
  chrome.commands.onCommand.addListener((command: string) => {
    if (command === "open-prompt-drawer") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_POPUP" });
        }
      });
    }
  });
} else {
  console.warn("chrome.commands API not available. Did you add 'commands' in manifest?");
}
