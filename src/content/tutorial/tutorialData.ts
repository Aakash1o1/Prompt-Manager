export interface TutorialStep {
    id: string;
    headline: string;
    details: string;
    triggerEvent: string | null;
    validate?: (detail: any) => boolean;
    targetSelector?: string | string[]; // Allow array
}

export interface TutorialModule {
    id: string;
    title: string;
    steps: TutorialStep[];
}

export const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    "add": [
        { id: "f-open", headline: "Create a New Folder", details: "Press Alt + P, then click the 'New Folder' icon in the bottom-left of the sidebar.", triggerEvent: "workspace-open-folder-editor", targetSelector: "#btn-new-folder" },
        { id: "f-save", headline: "Name and Save Your Folder", details: "Name your folder 'My Tutorial' and click 'Save Folder'.", triggerEvent: "app-tutorial-folder-saved", targetSelector: ["#ws-folder-name", "#ws-folder-save"] },
        { id: "p-open", headline: "Add from Selected Text", details: "Right-click the chat text and choose 'Save to Prompt Drawer'.", triggerEvent: "workspace-open-editor", targetSelector: null },
        { id: "p-save", headline: "Save Your First Prompt", details: "Title it 'Sample Prompt', shortcut '.sample', move to 'My Tutorial', and Save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-title", "#ws-quick", "#ws-save"] }
    ],
    "access": [
        { id: "pin", headline: "Pin a Prompt", details: "Hover over a prompt, click '...', and select 'Pin'.", triggerEvent: "app-tutorial-pin-toggled", targetSelector: ".row-actions .icon-btn" },
        { 
            id: "shortcut", 
            headline: "Use a Shortcut", 
            details: "Type a shortcut (e.g. .sample) and press Space.", 
            triggerEvent: "SHORTCUT_EXPANDED",
            validate: (payload) => payload.trigger !== '../', // Must NOT be the quick menu
            targetSelector: "#mock-chat-input"
        },
        { 
            id: "quick", 
            headline: "Use the Quick Menu", 
            details: "Type ../ and press Space. Select a prompt and hit Enter.", 
            triggerEvent: "SHORTCUT_EXPANDED", 
            validate: (payload) => payload.trigger === '../', // Must BE the quick menu
            targetSelector: "#mock-chat-input"
        }
    ],
    "organize": [
        { 
            id: "sub", 
            headline: "Create a Sub-folder", 
            details: "Click '...' on 'My Tutorial' and select 'New Subfolder'.", 
            triggerEvent: "workspace-open-folder-editor",
            targetSelector: ".sb-row"
        },
        { 
            id: "move-start", 
            headline: "Move a Prompt", 
            details: "Hover over 'Sample Prompt', click '...', and select 'Move To...'.", 
            triggerEvent: "sidebar-mode-move-started",
            targetSelector: ".sb-row"
        },
        { 
            id: "move-end", 
            headline: "Select a Destination", 
            details: "Click 'Nested Prompts' then 'Move Here'.", 
            triggerEvent: "app-tutorial-prompt-moved",
            targetSelector: "#btn-confirm"
        }
    ],
    "export-import": [
        { 
            id: "exp-start", 
            headline: "Export Your Library", 
            details: "Open Settings (gear icon), then click 'Export Data'.", 
            triggerEvent: "app-start-export",
            targetSelector: "#btn-settings"
        },
        { 
            id: "exp-exec", 
            headline: "Select and Download", 
            details: "Click the 'Export' button in the sidebar footer to download your backup.", 
            triggerEvent: "app-exec-export",
            targetSelector: "#btn-confirm"
        },
        { 
            id: "imp-start", 
            headline: "Import from File", 
            details: "In Settings, click 'Import Data' and select the JSON file you just downloaded.", 
            triggerEvent: "app-start-import",
            targetSelector: "#btn-settings"
        },
        { 
            id: "resolve", 
            headline: "Resolve Conflicts", 
            details: "Click on a red item in the sidebar. In the Workspace, change the title to resolve the conflict.", 
            triggerEvent: "app-tutorial-conflict-resolved",
            targetSelector: ".sb-row"
        },
        { 
            id: "imp-exec", 
            headline: "Finalize Import", 
            details: "Once the red dots are gone, click 'Finalize Import' in the sidebar.", 
            triggerEvent: "app-exec-import",
            targetSelector: "#btn-confirm"
        }
    ]
};

export const MODULE_ORDER = ["add", "access", "organize", "export-import"];
