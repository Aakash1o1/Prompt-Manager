Phase 2: Design & Step-by-Step Planning
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_02.md
Step 2: Internal Page Fix & Signal Infrastructure
Objective: Resolve the Alt + P conflict for internal pages and implement the event emitters (Signals) so the Tutorial UI can track user actions.
Files to Modify:
src/background.ts
src/content/ui.ts
src/content/components/App.ts
src/content/components/TextExpander.ts
src/tutorial.ts
Tasks:
1. Fix background.ts (Hotkey Bypass)
Modify the onCommand listener to recognize internal extension pages.
code
TypeScript
// src/background.ts
// Find the chrome.commands.onCommand.addListener block and update the URL check:

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'open-prompt-drawer') return;
  if (!tab?.id || !tab.url) return;

  // NEW: Detect if we are on an internal extension page
  if (tab.url.startsWith('chrome-extension://')) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_POPUP' }, () => {
      if (chrome.runtime.lastError) {
        // Content script might not be initialized yet in a new tab
        console.warn("Toggle failed on internal page.");
      }
    });
    return; // Stop here, no permission check needed
  }

  // ... rest of existing originPattern logic ...
});
2. Update src/content/ui.ts (Return App Instance)
We need the renderUI function to return the App instance so the tutorial can control it directly.
code
TypeScript
// src/content/ui.ts
// Change the return type from Promise<void> to Promise<any>:

export async function renderUI(opts: { ... }) {
  // ... existing code ...
  const app = new App(store, shadow, host);
  app.mount(host);

  // ... existing message listener ...

  console.log('Prompt Manager UI initialized');
  return app; // <--- ADD THIS RETURN
}
3. Add Signals to src/content/components/App.ts
Emit a signal when the Drawer is opened.
code
TypeScript
// src/content/components/App.ts
// Inside the open() method:

public open() {
    this.backdrop?.classList.add('open');
    this.host.style.pointerEvents = 'auto';

    // SIGNAL: Notify the window that the drawer is now visible
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { type: 'DRAWER_OPENED' } 
    }));
}
4. Add Signals to src/content/components/TextExpander.ts
Emit a signal when a shortcut is successfully expanded.
code
TypeScript
// src/content/components/TextExpander.ts
// Inside the replaceText() method, at the very end of the successful path:

private async replaceText(el: HTMLElement, target: string, replacement: string) {
    // ... existing logic ...
    
    // After triggerEvents(el):
    window.dispatchEvent(new CustomEvent('tutorial-signal', { 
        detail: { 
            type: 'SHORTCUT_EXPANDED',
            text: replacement 
        } 
    }));
}
5. Update src/tutorial.ts (Event Listener Verification)
Update the tutorial script to catch these signals and log them.
code
TypeScript
// src/tutorial.ts
// Update the initTutorialEngine function:

async function initTutorialEngine() {
    // ... previous setup code (Store, Host, etc.) ...

    const app = await renderUI({ ... }); // Now returns app instance

    // ... previous TextExpander setup ...

    // SIGNAL VERIFICATION
    window.addEventListener('tutorial-signal', (e: any) => {
        const { type, text } = e.detail;
        console.log(`%c[SIGNAL RECEIVED]: ${type}`, "color: #10b981; font-weight: bold;", text || "");
        
        // Visual feedback on the page for verification
        const status = document.createElement('div');
        status.textContent = `Event: ${type} ${text ? '(' + text.substring(0, 10) + '...)' : ''}`;
        status.style.cssText = "color: #10b981; font-size: 12px; margin-top: 5px;";
        document.body.appendChild(status);
    });
}
