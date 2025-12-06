Requirement: Implement Text Expander Feature
1. Context
We have an existing Chrome Extension ("Prompt Drawer") built with TypeScript, Esbuild, and Manifest V3.
Current Functionality: A Shadow DOM popup that allows users to store and copy prompts. It injects content scripts only into specific sites whitelisted by the user via optional_host_permissions.
New Goal: Add a "Text Expander" feature. When a user types a shortcut (defined in the quick field of a prompt) followed by a Space, it should automatically replace that shortcut with the prompt text.
Target Constraints:
Must work on LLM sites (ChatGPT, Claude, etc.) which use contenteditable divs.
Must work on standard <input> and <textarea> elements.
Must run locally (no data sent to server) for security.
Must integrate into the existing src/content/main.ts entry point.
2. Technical Architecture
A. Logic Flow
Initialization: When content.js loads (which only happens on whitelisted sites), fetch all prompts from chrome.storage.local.
Mapping: Create a Map<string, string> where keys are the shortcuts (e.g., .mail) and values are the prompt texts.
Listening: Attach a global input event listener to the document in the Capture Phase.
Detection:
Check if the user typed a Space.
If yes, look at the text immediately preceding the cursor.
If that text matches a key in our Map (e.g., matches .mail), trigger replacement.
Replacement:
Rich Text (LLMs): Use document.execCommand('insertText'). This simulates a user paste/type action, ensuring React/Vue frameworks used by ChatGPT/Claude update their internal state correctly.
Standard Inputs: Manipulate value, move cursor, and dispatch a synthetic input event.
B. File Structure Changes
Create: src/content/expander.ts (New file for logic).
Modify: src/content/main.ts (To initialize the expander).
3. Implementation Steps
Step 1: Create src/content/expander.ts
Create this file to handle the typing detection and replacement logic. This isolates the feature from your UI code.
code
TypeScript
// src/content/expander.ts

import { getStorage } from '../lib/storage';

// Define minimal types needed for the expander
type Prompt = { id: string; title: string; text: string; quick?: string; };

let triggers: Record<string, string> = {};

/**
 * Initialize the Text Expander.
 * 1. Loads initial triggers.
 * 2. Sets up storage listener for updates.
 * 3. Attaches the global input listener.
 */
export function initExpander(initialPrompts: Prompt[], PROMPTS_KEY: string) {
  updateTriggers(initialPrompts);

  // Listen for changes so the expander updates immediately if the user adds a new prompt
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[PROMPTS_KEY]) {
      const newPrompts = changes[PROMPTS_KEY].newValue as Prompt[];
      if (Array.isArray(newPrompts)) {
        updateTriggers(newPrompts);
      }
    }
  });

  // Use 'true' for capture phase to ensure we catch events early
  document.addEventListener('input', handleInput, true);
}

/**
 * Converts the Prompts array into a lookup map.
 * We append a space to the key because we trigger on Space press.
 */
function updateTriggers(prompts: Prompt[]) {
  triggers = {};
  prompts.forEach(p => {
    if (p.quick && p.quick.trim()) {
      // Example: if quick is "mail", we look for ".mail "
      const key = '.' + p.quick.trim() + ' ';
      triggers[key] = p.text;
    }
  });
}

/**
 * Global Input Handler
 */
function handleInput(e: Event) {
  const event = e as InputEvent;
  const target = event.target as HTMLElement;
  
  // OPTIMIZATION: Only run logic if the user typed a Space.
  // event.data is the character string inserted.
  const isSpace = event.data === ' ' || (event.inputType === 'insertText' && event.data === null);
  
  if (!isSpace) return;

  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    handleStandardInput(target as HTMLInputElement | HTMLTextAreaElement);
  } else if (target.isContentEditable) {
    handleContentEditable(target);
  }
}

/**
 * Handle <input> and <textarea>
 */
function handleStandardInput(el: HTMLInputElement | HTMLTextAreaElement) {
  const cursor = el.selectionEnd || 0;
  const text = el.value;
  const textUpToCursor = text.slice(0, cursor); // Text before cursor

  // Check for match
  for (const [trigger, replacement] of Object.entries(triggers)) {
    if (textUpToCursor.endsWith(trigger)) {
      
      const startOfTrigger = cursor - trigger.length;
      const textBeforeTrigger = text.slice(0, startOfTrigger);
      const textAfterCursor = text.slice(cursor);
      
      // 1. Update Value (remove trigger, insert replacement, keep trailing space)
      const newText = textBeforeTrigger + replacement + ' ' + textAfterCursor;
      el.value = newText;

      // 2. Move Cursor
      const newCursorPos = startOfTrigger + replacement.length + 1;
      el.setSelectionRange(newCursorPos, newCursorPos);

      // 3. Dispatch Event (Vital for React/Vue to detect change)
      el.dispatchEvent(new Event('input', { bubbles: true }));
      
      return; // Stop processing
    }
  }
}

/**
 * Handle ContentEditable (ChatGPT, Claude, Gmail, Notion)
 */
function handleContentEditable(el: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const offset = range.startOffset;

  // Ensure we are operating on a text node
  if (node.nodeType !== Node.TEXT_NODE) return;

  const textContent = node.textContent || '';
  const textUpToCursor = textContent.slice(0, offset);

  for (const [trigger, replacement] of Object.entries(triggers)) {
    // Rich text editors sometimes use Non-Breaking Spaces (&nbsp;)
    const triggerNbsp = trigger.replace(' ', '\u00A0');

    if (textUpToCursor.endsWith(trigger) || textUpToCursor.endsWith(triggerNbsp)) {
      
      // 1. Select the trigger text (e.g. ".name ")
      const rangeToReplace = document.createRange();
      rangeToReplace.setStart(node, offset - trigger.length);
      rangeToReplace.setEnd(node, offset);
      
      selection.removeAllRanges();
      selection.addRange(rangeToReplace);

      // 2. Execute Replacement
      // 'insertText' is deprecated but is the ONLY reliable way to modify 
      // ContentEditable elements without breaking the host site's internal state.
      // It simulates a native paste/type action.
      document.execCommand('insertText', false, replacement + ' ');
      
      // Cleanup
      selection.collapseToEnd();
      return;
    }
  }
}
Step 2: Modify src/content/main.ts
Integrate the expander initialization into the main boot process.
code
TypeScript
// src/content/main.ts

// ... existing imports ...
import { createOrGetHost } from './host';
import { renderUI } from './ui';
import { getStorage, setStorage } from '../lib/storage';
import { DEFAULT_PROMPTS, DEFAULT_TAGS } from '../lib/defaultPrompts';

// +++ NEW IMPORT +++
import { initExpander } from './expander'; 

// ... keep existing types ...
// ... keep existing constants ...

async function loadAndInit() {
  let prompts: Prompt[] = [];
  // ... existing setup code ...

  // [EXISTING LOADING LOGIC]
  try {
    const p = await getStorage<Prompt[]>(PROMPTS_KEY);
    prompts = Array.isArray(p) ? p : [];
  } catch (e) {
    prompts = [];
  }
  
  // ... [EXISTING DEFAULT DATA LOGIC] ...

  // +++ NEW CODE START +++
  // Initialize the Text Expander listener immediately
  // This runs globally on the page, independent of the Prompt Drawer UI
  try {
    initExpander(prompts, PROMPTS_KEY);
    console.log('Prompt Drawer: Text Expander initialized');
  } catch (err) {
    console.error('Prompt Drawer: Failed to init expander', err);
  }
  // +++ NEW CODE END +++

  const { host, shadow } = createOrGetHost();
  await renderUI({ host, shadow, prompts, tags, settings, PROMPTS_KEY, SETTINGS_KEY, TAGS_KEY });
}

// ... keep existing event listeners ...
