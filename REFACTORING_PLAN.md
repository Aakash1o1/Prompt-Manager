# Refactoring Plan: Prompt Drawer Extension

## Objective
Transition the codebase from a monolithic script approach to a modular, component-based architecture to improve maintainability, readability, and scalability.

## Phase 1: Shared Utilities & cleanup
**Goal:** Remove code duplication and simplify DOM creation.

1.  **Create `src/lib/dom.ts`**
    *   Create a helper function `el(tag, attributes, ...children)` to replace verbose `document.createElement` blocks.
    *   Example: `const btn = el('button', { className: 'btn', onclick: handler }, 'Click me')`
2.  **Create `src/lib/permissions-service.ts`**
    *   Move `getAllowedOrigins`, `normalizePattern`, and permission request/remove logic here.
    *   Refactor `src/action.ts` and `src/options.ts` to import these functions.

## Phase 2: State Management (The "Brain")
**Goal:** Decouple data logic from UI logic.

1.  **Create `src/content/store.ts`**
    *   Create a `Store` class.
    *   **State:** Holds `prompts`, `tags`, `settings`, `filterText`, `selectedTags`.
    *   **Methods:** `load()`, `addPrompt()`, `updatePrompt()`, `deletePrompt()`, `reorderPrompts()`, `updateSettings()`, etc.
    *   **Events:** Implement a simple listener system: `store.subscribe(event, callback)`.
    *   *Benefit:* The UI no longer worries about *how* to save to Chrome storage; it just asks the Store to do it.

## Phase 3: Componentization (The UI)
**Goal:** Break `ui.ts` into manageable classes.

1.  **Create `src/content/components/Component.ts`**
    *   A base class ensuring every component has access to the `Store` and a standard `mount(parent)` method.

2.  **Refactor `ui.ts` into a Main Entry point**
    *   It should only initialize the ShadowHost, the Store, and mount the `App` component.

3.  **Create Components (in `src/content/components/`)**:
    *   **`App.ts`**: The main container. Orchestrates the layout (Header, List, Modals).
    *   **`SearchBar.ts`**: Handles the search input and "Add/Tags/Settings" buttons.
    *   **`TagDropdown.ts`**: Handles the complex tag list, color picking, and creation logic.
    *   **`PromptList.ts`**: Subscribes to store changes. Renders the list of prompts. Handles Drag & Drop logic (moved from `ui.ts`).
    *   **`PromptEditor.ts`**: The Add/Edit form overlay.
    *   **`SettingsModal.ts`**: The settings overlay.

## Phase 4: Styling Separation
**Goal:** Clean up the TypeScript files.

1.  **Create `src/content/styles.ts`**
    *   Move the massive CSS string from `src/content/host.ts` to this file.
    *   Export it as `export const STYLES = \`...\`;`
    *   Import it in `host.ts`.

## Execution Order (Prompt for LLM)

To implement this, ask the LLM to execute in this specific order to ensure the build never breaks significantly:

1.  "Implement `src/lib/dom.ts` and `src/lib/permissions-service.ts`, then refactor `action.ts` and `options.ts` to use them."
2.  "Implement `src/content/store.ts` to handle `prompts`, `tags`, and `settings` with chrome storage logic, extracting it from `main.ts` and `ui.ts`."
3.  "Refactor `src/content/host.ts` to move CSS into `src/content/styles.ts`."
4.  "Create the Base Component class and the `PromptList` component to replace the prompt rendering logic in `ui.ts`."
5.  "Extract the Edit Form and Settings Form into their own component files."
6.  "Finalize `ui.ts` to act only as the bootstrapper that connects the Store to the Components."