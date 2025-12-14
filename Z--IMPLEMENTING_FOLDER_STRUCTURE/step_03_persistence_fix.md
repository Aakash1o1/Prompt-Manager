Step 3 (Fix 2): Wire Up Folder Persistence
Objective
Update the application boot process (main.ts and ui.ts) to ensure Folders are loaded from chrome.storage.local when the page refreshes.
Files to Modify
src/content/main.ts
src/content/ui.ts
Task 1: Update Main Entry Point
File: src/content/main.ts
We need to fetch the folders and pass them to the UI renderer.
code
TypeScript
// [UPDATE] src/content/main.ts

// 1. Add Folder to the type definition at the top (if not already imported, just define it simply here)
import { Folder } from '../lib/store'; // Or define type Folder = { ... } locally if store isn't exported here
// Actually, easier to just treat it as any[] or generic in the loadAndInit for now to avoid circular deps if Store isn't exported.
// But better: define the constant.

const FOLDERS_KEY = 'promptManager.folders'; // Add this constant

async function loadAndInit() {
  let prompts: Prompt[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  let tags: Tag[] = [];
  let folders: any[] = []; // NEW: Variable for folders

  // ... existing prompt loading ...
  // ... existing settings loading ...
  // ... existing tag loading ...

  // NEW: Load Folders
  try {
    const f = await getStorage<any[]>(FOLDERS_KEY);
    folders = Array.isArray(f) ? f : [];
  } catch (e) {
    folders = [];
  }

  // ... Check for first install ...
  if (prompts.length === 0 && tags.length === 0) {
      // ... existing default logic ...
      // Make sure you save empty folders here too if not already added in Step 1
  }

  const { host, shadow } = createOrGetHost();
  if (!host || !shadow) return;

  // Initialize Store
  // Pass folders to renderUI
  await renderUI({ 
      host, 
      shadow, 
      prompts, 
      tags, 
      settings, 
      folders, // <--- PASS THIS
      PROMPTS_KEY, 
      SETTINGS_KEY, 
      TAGS_KEY,
      FOLDERS_KEY // Pass this key too
  });
  
  // ... existing expander logic ...
}
Task 2: Update UI Initializer
File: src/content/ui.ts
Update renderUI to accept the folders argument and inject it into the Store.
code
TypeScript
// [UPDATE] src/content/ui.ts

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: any[];
  tags: any[];
  folders: any[]; // NEW: Add this type
  settings: any;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
  FOLDERS_KEY: string; // Add this
}) {
  // Destructure folders
  const { host, shadow, prompts, tags, folders, settings } = opts;
  
  if (!host || !shadow) return;

  const store = new Store();
  store.prompts = prompts;
  store.tags = tags;
  
  // +++ NEW: Inject Folders into Store +++
  store.folders = folders || []; 
  // +++++++++++++++++++++++++++++++++++++
  
  store.settings = settings;

  // ... rest of the function (App initialization) ...
}
