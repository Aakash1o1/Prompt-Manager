Step 22: Reliable Tab Opening via Background Bridge
Objective: Fix the "Tutorial" button by moving the tab-opening logic to the background script.
Files to Modify:
src/background.ts
src/content/components/ControlPanel.ts
Tasks:
1. Add Message Listener to src/background.ts
Handle a new message type OPEN_TUTORIAL.
code
TypeScript
// src/background.ts
// Add this inside your existing chrome.runtime.onMessage.addListener block:

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // ... existing logic (PERMISSION_GRANTED, etc.) ...

    if (msg.type === 'OPEN_TUTORIAL') {
        chrome.tabs.create({ 
            url: chrome.runtime.getURL('dist/tutorial.html') 
        });
        sendResponse({ ok: true });
        return true;
    }

    // ... existing return true for other messages ...
});
2. Update ControlPanel.ts to Send Message
Change the window.open call to chrome.runtime.sendMessage.
code
TypeScript
// src/content/components/ControlPanel.ts

    private setupListeners() {
        // ... existing listeners ...

        this.container?.querySelector('#cp-tutorial-btn')?.addEventListener('click', () => {
            // Tell the background script to open the tutorial tab
            chrome.runtime.sendMessage({ type: 'OPEN_TUTORIAL' });
        });
    }
