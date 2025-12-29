# Sidebar Expandability Analysis

To make the left sidebar resizable (expandable), we would need to move from a fixed-width layout to a dynamic one. Below is the breakdown of complexity and required changes.

## 1. Complexity Assessment
**Overall Complexity: Moderate**
- **UI/UX (Low)**: Adding a resizer handle is straightforward.
- **Logic (Moderate)**: Managing mouse events (drag) inside a Shadow DOM requires careful handling of coordinates and event propagation.
- **Persistence (Low)**: Adding a single integer to the `Store` to remember the width is a standard task.

## 2. Required Changes

### A. Styling (src/content/styles.ts)
- Modify `.modal` to use a dynamic CSS variable: `grid-template-columns: var(--sidebar-width, 260px) 1fr;`.
- Add a `.resizer` element style:
    - Width: 4-6px.
    - Cursor: `col-resize`.
    - Positioned exactly between the Sidebar and Workspace.
    - Hover effects (e.g., a subtle blue highlight) to indicate interactivity.

### B. Component Layer (src/content/components/App.ts)
- Update the HTML structure in `mount` (or where the grid is defined) to insert the resizer `<div>` between the Sidebar and Workspace components.
- Implement the "Resizer Logic":
    - **`onmousedown`**: Attach global `mousemove` and `mouseup` listeners.
    - **`onmousemove`**: Calculate the delta between mouse start and current position. Update the `--sidebar-width` CSS variable on the host or modal element.
    - **`onmouseup`**: Remove listeners and save the final width to the `Store`.

### C. Data Layer (src/content/store.ts)
- Add `sidebarWidth` to the `Settings` interface.
- Ensure the value is persisted to `chrome.storage.local`.
- Initialize the CSS variable on load using the stored value.

## 3. Potential Challenges
- **Minimum/Maximum Constraints**: We must enforce a `min-width` (e.g., 180px) and `max-width` (e.g., 50% of modal) to prevent breaking the UI.
- **IFRAME Interaction**: If the modal is ever placed inside a container that traps mouse events, the "drag-outside" behavior might be jittery.
- **Text Selection**: While dragging, user text selection should be disabled (`user-select: none`) to prevent accidental highlighting of prompts.

## Summary
Adding this feature would likely take ~2-3 hours of implementation and testing to ensure it feels smooth and "premium" (Zinc aesthetic standards).
