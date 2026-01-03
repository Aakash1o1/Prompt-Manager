export interface TutorialStep {
    id: string;
    headline: string;
    details: string;
    triggerEvent: string | null;
    targetSelector?: string | string[];
    validate?: (payload: any) => boolean;
}

export interface TutorialGroup {
    id: string;
    title: string;
    description?: string;
    steps: TutorialStep[];
}

export interface TutorialModule {
    id: string;
    title: string;
    description: string;
    groups: TutorialGroup[];
}

export const TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: "setup",
        title: "Enable Sites",
        description: "Privacy first. Prompt Drawer only works on sites you explicitly authorize.",
        groups: [
            {
                id: "setup-add",
                title: "Granting Access",
                steps: [
                    { 
                        id: "go-gemini", 
                        headline: "Try it on Gemini", 
                        details: "Click the link in the right panel to open Gemini. Once there, press Alt + P and click 'Add to this site'.", 
                        triggerEvent: "PERMISSION_GRANTED",
                        validate: (p) => p.origin.includes('gemini.google.com')
                    }
                ]
            }
        ]
    },
    {
        id: "add",
        title: "Saving Prompts",
        description: "Prompt Manager is a complete solution to all your prompt-related needs.",
        groups: [
            {
                id: "add-context",
                title: "Method A: Context Menu",
                steps: [
                    { 
                        id: "rc-save", 
                        headline: "Select and Save", 
                        details: "Highlight the chat text on the right, then right-click it and choose 'Save to Prompt Manager'.", 
                        triggerEvent: "workspace-open-editor", 
                        targetSelector: "#demo-stage" // Highlight the chat area
                    },
                    { id: "p-save-1", headline: "Name and Save", details: "Add a title and shortcut, then click Save.\n The shortcut will be used to access the prompt.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-title", "#ws-quick", "#ws-save"] }
                ]
            },
            {
                id: "add-manual",
                title: "Method B: Manual Entry",
                steps: [
                    { id: "copy-text", headline: "Copy Text", details: "Highlight the text and press Ctrl + C.", triggerEvent: "app-tutorial-copy-detected", targetSelector: "#demo-stage" },
                    { id: "open-lib", headline: "Open Library", details: "Press Alt + P to open the library, then click the 'New Prompt' icon.", triggerEvent: "workspace-new-prompt", targetSelector: "#btn-new-root" },
                    { id: "paste-save", headline: "Paste and Save", details: "Paste text into the body and click Save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-body", "#ws-save"] }
                ]
            }
        ]
    },
    {
        id: "access",
        title: "Accessing Prompts",
        description: "Three methods to access your prompts.",
        groups: [
            {
                id: "acc-shortcut",
                title: "1. Shortcuts",
                steps: [
                    { id: "type-shortcut", headline: "Type Shortcut", details: "Type your shortcut and press Space in the chat.", triggerEvent: "SHORTCUT_EXPANDED", targetSelector: "#mock-chat-input" }
                ]
            },
            {
                id: "acc-menu",
                title: "2. Quick Menu (../)",
                steps: [
                    { id: "pin-items", headline: "Pin Prompt", details: "Open Drawer (Alt+P). Click '...' (kebab) on a prompt, then click 'Pin'.", triggerEvent: "app-tutorial-pin-toggled", targetSelector: [".tree-row[data-type='prompt'] .icon-btn", ".ctx-menu"] },
                    { id: "type-menu", headline: "Use ../ Menu", details: "Type ../ and Space. Select your prompt.", triggerEvent: "SHORTCUT_EXPANDED", validate: (p) => p.trigger === '../', targetSelector: "#mock-chat-input" }
                ]
            },
            {
                id: "acc-copy",
                title: "3. Direct Copy",
                steps: [
                    { id: "manual-copy", headline: "Copy Action", details: "Open Drawer. Click '...' on a prompt and select 'Copy'.", triggerEvent: "app-tutorial-copy", targetSelector: [".tree-row[data-type='prompt'] .icon-btn", ".ctx-menu"] }
                ]
            }
        ]
    },
    {
        id: "organize",
        title: "Organize",
        description: "Keep your library tidy with folders and sub-folders.",
        groups: [
            {
                id: "org-folders",
                title: "Folders",
                steps: [
                    { id: "new-f", headline: "New Folder", details: "Click the 'New Folder' icon in the sidebar.", triggerEvent: "workspace-open-folder-editor", targetSelector: "#btn-new-folder" },
                    { id: "new-sub", headline: "New Sub-folder", details: "Click '...' on a folder and select 'New Subfolder'.", triggerEvent: "workspace-open-folder-editor", targetSelector: ".tree-row[data-type='folder'] .icon-btn" }
                ]
            },
            {
                id: "org-move",
                title: "Moving Items",
                steps: [
                    { id: "m-start", headline: "Start Move", details: "Select 'Move To...' from a prompt's menu.", triggerEvent: "sidebar-mode-move-started", targetSelector: ".tree-row[data-type='prompt'] .icon-btn" },
                    { id: "m-end", headline: "Select Destination", details: "Click the target folder and press 'Move Here'.", triggerEvent: "app-tutorial-prompt-moved", targetSelector: "#btn-confirm" }
                ]
            }
        ]
    },
    {
        id: "export-import",
        title: "Export/Import",
        description: "Protect your data or move it between devices.",
        groups: [
            {
                id: "ei-export",
                title: "Exporting Data",
                steps: [
                    { id: "cp-open", headline: "Go to Settings", details: "Open the Gear icon in the sidebar.", triggerEvent: "workspace-settings", targetSelector: "#btn-settings" },
                    { id: "exp-card", headline: "Select Export", details: "Click the 'Export Data' card in the backup section.", triggerEvent: "app-start-export", targetSelector: "#cp-export" },
                    { id: "exp-exec", headline: "Download JSON", details: "Here you can select which prompts to export.\n\n\n Click 'Export Selected' in the footer.", triggerEvent: "app-exec-export", targetSelector: ".sb-footer .btn-new" }
                ]
            },
            {
                id: "ei-import",
                title: "Importing Data",
                steps: [
                    { id: "imp-mode", headline: "Select File", details: "Click 'Import Data' in Settings and pick your JSON file.", triggerEvent: "app-start-import", targetSelector: "#cp-import" },
                    { id: "res-conf", headline: "Resolve Conflicts", details: "Here you can review and selects which prompts to import\nClick a red prompt in the sidebar and edit its title to make it unique.", triggerEvent: "app-tutorial-conflict-resolved", targetSelector: ".status-dot.red" },
                    { id: "imp-exec", headline: "Finalize", details: "Click 'Finalize Import' to merge the data.", triggerEvent: "app-exec-import", targetSelector: "#btn-confirm" }
                ]
            }
        ]
    }
];

export const MODULE_ORDER = TUTORIAL_MODULES.map(m => m.id);
