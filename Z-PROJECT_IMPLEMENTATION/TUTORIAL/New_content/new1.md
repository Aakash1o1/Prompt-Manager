Step 12: Hierarchical Tutorial Data
Objective: Define the new nested data structure to support modules with multiple task groups and sub-steps.
Files to Modify:
src/content/tutorial/tutorialData.ts
Tasks:
1. Define the Nested Interfaces
Update src/content/tutorial/tutorialData.ts to support the hierarchy.
code
TypeScript
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
2. Implement the Full Content Map
Replace the existing TUTORIAL_DATA constant with this comprehensive nested version.
code
TypeScript
export const TUTORIAL_MODULES: TutorialModule[] = [
    {
        id: "add",
        title: "Saving Prompts",
        description: "Prompt Manager is a complete solution to all your prompt-related needs. Let's start by adding your first prompts.",
        groups: [
            {
                id: "add-context",
                title: "Method A: Context Menu",
                steps: [
                    { id: "sel-text", headline: "Select Text", details: "Highlight the text in the chat bubble on the right.", triggerEvent: null }, // Visual only step
                    { id: "rc-save", headline: "Right-Click Save", details: "Right-click the selected text and choose 'Save to Prompt Drawer'.", triggerEvent: "workspace-open-editor", targetSelector: "#mock-chat-input" },
                    { id: "p-save-1", headline: "Name and Save", details: "Add a title (e.g., 'Sample') and a shortcut (e.g., '.sample'), then click Save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-title", "#ws-quick", "#ws-save"] }
                ]
            },
            {
                id: "add-manual",
                title: "Method B: Manual Entry",
                steps: [
                    { id: "copy-text", headline: "Copy Text", details: "Copy the chat text manually (Ctrl+C).", triggerEvent: "app-tutorial-copy-detected" },
                    { id: "open-lib", headline: "Open Library", details: "Open the drawer (Alt+P) and click the 'New Prompt' button.", triggerEvent: "workspace-new-prompt", targetSelector: "#btn-new-root" },
                    { id: "paste-save", headline: "Paste and Save", details: "Paste the text into the body, give it a name, and save.", triggerEvent: "app-tutorial-prompt-saved", targetSelector: ["#ws-body", "#ws-save"] }
                ]
            }
        ]
    },
    {
        id: "access",
        title: "Accessing Prompts",
        description: "There are three powerful ways to retrieve your prompts instantly.",
        groups: [
            {
                id: "acc-shortcut",
                title: "1. Using Shortcuts",
                steps: [
                    { id: "type-shortcut", headline: "Type Shortcut", details: "Type your shortcut (e.g., .sample) and press Space in the chat.", triggerEvent: "SHORTCUT_EXPANDED", validate: (p) => p.trigger !== '../' }
                ]
            },
            {
                id: "acc-menu",
                title: "2. The Quick Menu (../)",
                steps: [
                    { id: "pin-items", headline: "Pin Two Prompts", details: "Open the drawer, click '...' on two prompts, and select 'Pin'.", triggerEvent: "app-tutorial-pin-toggled" },
                    { id: "type-menu", headline: "Use ../ Menu", details: "Type ../ followed by Space. Use arrow keys to select a prompt and hit Enter.", triggerEvent: "SHORTCUT_EXPANDED", validate: (p) => p.trigger === '../' }
                ]
            },
            {
                id: "acc-copy",
                title: "3. Direct Copy",
                steps: [
                    { id: "manual-copy", headline: "Copy from Drawer", details: "Open the drawer, click '...' on any prompt, and select 'Copy'.", triggerEvent: "app-tutorial-copy" }
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
                    { id: "new-sub", headline: "New Sub-folder", details: "Click '...' on a folder and select 'New Subfolder'.", triggerEvent: "workspace-open-folder-editor" }
                ]
            },
            {
                id: "org-move",
                title: "Moving Items",
                steps: [
                    { id: "m-start", headline: "Start Move", details: "Select 'Move To...' from a prompt's menu.", triggerEvent: "sidebar-mode-move-started" },
                    { id: "m-end", headline: "Select Destination", details: "Click the target folder and press 'Move Here'.", triggerEvent: "app-tutorial-prompt-moved" }
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
                    { id: "exp-mode", headline: "Select Prompts", details: "Click 'Export Data'. Use the top checkbox to select/deselect all.", triggerEvent: "app-start-export", targetSelector: "#cp-export" },
                    { id: "exp-exec", headline: "Download JSON", details: "Click 'Export Selected' in the footer.", triggerEvent: "app-exec-export" }
                ]
            },
            {
                id: "ei-import",
                title: "Importing Data",
                steps: [
                    { id: "imp-mode", headline: "Select File", details: "Click 'Import Data' in Settings and pick your JSON file.", triggerEvent: "app-start-import", targetSelector: "#cp-import" },
                    { id: "res-conf", headline: "Resolve Conflicts", details: "Click a red prompt in the sidebar and edit its title to make it unique.", triggerEvent: "app-tutorial-conflict-resolved" },
                    { id: "imp-exec", headline: "Finalize", details: "Click 'Finalize Import' to merge the data.", triggerEvent: "app-exec-import" }
                ]
            }
        ]
    }
];

export const MODULE_ORDER = TUTORIAL_MODULES.map(m => m.id);
