Step 13: Feature - Save from Context Menu
Objective
Implement a feature where the user can select text on a webpage, right-click, and choose "Save to Prompt Drawer". This action should:
Open the extension panel (if closed).
Open the Editor in "Create New Prompt" mode.
Pre-fill the "Content" textarea with the selected text.
Files to Modify
manifest.json
src/background.ts
src/content/components/PromptEditor.ts
src/content/components/App.ts
src/content/ui.ts
Task 1: Add Permissions
File: manifest.json
Action: Locate the permissions array.
Change: Add the string "contextMenus" to the array.
Task 2: Background Script Logic
File: src/background.ts
Action: Add an event listener for chrome.runtime.onInstalled.
Logic: Inside this listener, call chrome.contextMenus.create.
Config: Set id to "save-prompt", title to "Save to Prompt Drawer", and contexts to ["selection"].
Action: Add an event listener for chrome.contextMenus.onClicked.
Logic: Check if info.menuItemId equals "save-prompt".
Logic: If true, send a message to the active tab (tab.id).
Message Payload: { type: 'OPEN_WITH_TEXT', text: info.selectionText }.
Error Handling: Add a .catch() block to the message sending to log a warning if the content script isn't loaded on that specific page.
Task 3: Update PromptEditor Signature & Logic
File: src/content/components/PromptEditor.ts
Action: Locate the open method.
Change: Update the method signature to accept a third optional parameter: prefillText?: string.
New Signature: open(promptId?: string, folderId?: string, prefillText?: string)
Action: Inside the else block (the block that handles "Create New" mode, where promptId and folderId are null):
Logic: After resetting inputs and switching tabs, check if prefillText is defined.
Logic: If defined, find the textarea element (#input-body) and set its .value to prefillText.
Tip: You might need to wrap the value setting in a small setTimeout(() => { ... }, 0) to ensure the DOM has finished rendering the form fields before you try to set the value.
Task 4: Expose Method in App Component
File: src/content/components/App.ts
Action: Create a new public method named openWithText(text: string).
Logic:
Check if the panel is currently open. If not, call the method to open/toggle it.
Call this.promptEditor.open(undefined, undefined, text).
Task 5: Handle Message in UI Entry Point
File: src/content/ui.ts
Action: Locate the chrome.runtime.onMessage.addListener block.
Change: Add a new condition for msg.type === 'OPEN_WITH_TEXT'.
Logic: Inside this condition, call app.openWithText(msg.text) and send a success response.
