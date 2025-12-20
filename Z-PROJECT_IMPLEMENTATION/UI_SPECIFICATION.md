# UI Specification: "Deep Focus" Theme

## 1. Design Tokens

### Colors
*   **Background (App):** `#18181b` (Zinc-950) - Solid, Opaque.
*   **Background (Panel):** `#1e1e2e` (Deep Blue/Purple).
*   **Background (Input):** `#27273a` (Lighter slot).
*   **Border:** `rgba(255, 255, 255, 0.06)`.
*   **Accent:** `#3b82f6` (Blue).
*   **Text Primary:** `#ffffff`.
*   **Text Muted:** `#a1a1aa`.

### Layout
*   **Header:** 64px height. Contains full-width Search.
*   **Footer:** 56px height. Contains Actions.
*   **List Item:** 40px height.

---

## 2. Component Logic

### Main Page
*   **Search:** Top, full width.
*   **List:**
    *   **Folder:** Name (Bold). No counts. Chevron left.
    *   **Prompt:** Name. Shortcut Badge (Right).
    *   **Interaction:** **Clicking a row opens the Editor.**
*   **Footer:**
    *   **Left:** Settings Icon.
    *   **Left-Center:** "Copy" Button (Text or Icon). Copies currently selected item.
    *   **Right:** "+ New" (Text + Icon). Opens Editor in "New" mode.

### Editor (Modal)
*   **Tabs:** PROMPT | FOLDER (Top switch).
*   **Fields:** Title, Location (Dropdown), Shortcut, Content.
*   **Actions:** Cancel (Text), Save (Solid Blue Button).

### Settings (Modal)
*   **Controls:** Segmented Buttons for Font/Position.
*   **Toggles:** Dark Mode, Auto-close.
*   **Removed:** Tags, Text Expander toggle.