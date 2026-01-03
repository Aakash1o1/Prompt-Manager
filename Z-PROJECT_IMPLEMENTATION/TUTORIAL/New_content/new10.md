Step 20: Auto-Open & Style Definitions
Objective: Automatically launch the tutorial on install and define the high-visibility "Glitter" button styles.
Files to Modify:
src/background.ts
src/content/styles.ts
Tasks:
1. Implement Auto-Open in src/background.ts
Add the install listener to launch the tutorial tab.
code
TypeScript
// src/background.ts

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('dist/tutorial.html')
        });
    }
    // ... existing onInstalled logic (context menus, etc) ...
});
2. Define Glittery Styles in src/content/styles.ts
Add this "Magical" button style to your STYLES constant.
code
CSS
/* src/content/styles.ts - Add to end of STYLES */

@keyframes glitter {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.btn-tutorial {
    background: linear-gradient(45deg, #f2cc60, #ffffff, #f2cc60, #ff9a3d);
    background-size: 300% 300%;
    animation: glitter 3s ease infinite;
    color: #000 !important;
    border: none;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 0 10px rgba(242, 204, 96, 0.4);
    transition: transform 0.2s;
    border: 1px solid rgba(0,0,0,0.1);
}

.btn-tutorial:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(242, 204, 96, 0.6);
}
Step 21: Control Panel Integration
Objective: Add the button to the header and link it to the tutorial page.
Files to Modify:
src/content/components/ControlPanel.ts
Tasks:
1. Update render() in ControlPanel.ts
Insert the button into the header section.
code
TypeScript
// src/content/components/ControlPanel.ts

    private render() {
        if (!this.container) return;
        const s = this.store.settings;

        this.container.innerHTML = `
            <div class="ws-header" style="flex-direction: row; justify-content: space-between; align-items: center;">
                <h2 style="margin:0; font-size:18px;">Control Panel</h2>
                <button class="btn-tutorial" id="cp-tutorial-btn">
                    <span>✨</span> Tutorial
                </button>
            </div>
            
            <div class="cp-container">
                <!-- ... rest of existing settings code ... -->
            </div>
        `;

        this.setupListeners();
    }
2. Handle Button Click in setupListeners()
Add the event listener to open the tutorial page.
code
TypeScript
// src/content/components/ControlPanel.ts

    private setupListeners() {
        // ... existing listeners ...

        this.container?.querySelector('#cp-tutorial-btn')?.addEventListener('click', () => {
            // Extension pages can open chrome-extension:// URLs directly
            window.open(chrome.runtime.getURL('dist/tutorial.html'), '_blank');
        });
    }
