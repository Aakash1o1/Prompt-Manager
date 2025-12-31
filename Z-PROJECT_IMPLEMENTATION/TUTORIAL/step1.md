Phase 2: Design & Step-by-Step Planning
We are now starting Step 1.
Folder/File for instructions: IMPLEMENTING_TUTORIAL_PAGE/step_01.md
Step 1: Environment Scaffold & Engine Mount
Objective: Create the tutorial.html page and ensure the real TextExpander and App Drawer are functional within it.
Files to Modify:
package.json
src/tutorial.html (New File)
src/tutorial.ts (New File)
Tasks:
1. Update package.json
Add the tutorial build task to the scripts section so esbuild knows where to look.
code
JSON
// In "scripts", add build:tutorial and update build:all:
"build:tutorial": "esbuild src/tutorial.ts --bundle --platform=browser --outfile=dist/tutorial.js && cpx \"src/tutorial.html\" dist",
"build:all": "npm run build:content && npm run build:background && npm run build:options && npm run build:action && npm run build:tutorial",
2. Create src/tutorial.html
This provides the mounting point. We add a textarea to test shortcuts immediately.
code
Html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Drawer - Engine Test</title>
    <style>
        body { background: #0f1117; color: white; font-family: sans-serif; padding: 40px; }
        #test-area { 
            width: 100%; max-width: 600px; height: 150px; 
            background: #161b22; color: white; border: 1px solid #30363d; 
            padding: 15px; border-radius: 8px; font-size: 16px; 
        }
        .info { color: #8b949e; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Engine Test Page</h1>
    <div class="info">Testing Shortcuts and Drawer on internal page.</div>
    
    <textarea id="test-area" placeholder="Type a shortcut here (e.g. .expand) and press Space..."></textarea>
    
    <div id="tutorial-root"></div>
    <script src="tutorial.js"></script>
</body>
</html>
3. Create src/tutorial.ts
This file manually starts the extension's internal "Brain."
code
TypeScript
import { createOrGetHost } from './content/host';
import { renderUI } from './content/ui';
import { getStorage } from './lib/storage';
import { Store } from './content/store';
import { TextExpander } from './content/components/TextExpander';

async function initTutorialEngine() {
    // 1. Load Real Data from Storage
    const prompts = await getStorage('promptManager.prompts') || [];
    const tags = await getStorage('promptManager.tags') || [];
    const folders = await getStorage('promptManager.folders') || [];
    const settings = await getStorage('promptManager.settings') || {};

    // 2. Initialize the Store & UI Overlay
    const { host, shadow } = createOrGetHost();
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders;
    store.settings = settings;

    await renderUI({
        host, shadow, prompts, tags, folders, settings,
        PROMPTS_KEY: 'promptManager.prompts',
        SETTINGS_KEY: 'promptManager.settings',
        TAGS_KEY: 'promptManager.tags',
        FOLDERS_KEY: 'promptManager.folders'
    });

    // 3. Initialize TextExpander specifically for this page
    const expander = new TextExpander(store, shadow);
    expander.mount();

    // 4. Manually add Alt+P listener for this internal page 
    // (Because background.ts commands often fail on chrome-extension:// urls)
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            // Look for the toggle logic we verified in analyze phase
            const toggleMsg = { type: 'TOGGLE_POPUP' };
            window.dispatchEvent(new CustomEvent('toggle-drawer-manual'));
        }
    });

    // Listen for our manual toggle
    window.addEventListener('toggle-drawer-manual', () => {
        // App is already rendered in shadow by renderUI
        // We'll use a direct message to the window as a bypass
        chrome.runtime.onMessage.dispatch?.({ type: 'TOGGLE_POPUP' }, {}, () => {});
        // If the above is restricted, we'll fix it in step 2.
    });

    console.log("Tutorial Engine Loaded.");
}

initTutorialEngine();
