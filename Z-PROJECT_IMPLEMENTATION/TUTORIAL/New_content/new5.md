Step: Universal Click-to-Close Restore
Objective: Ensure the drawer closes when clicking anywhere outside of the modal, including on the Navigation and Instruction panels.
Files to Modify:
src/content/styles.ts
Tasks:
1. Revert Backdrop Constraints in src/content/styles.ts
We will remove the clip-path and the left offset. We will return the backdrop to a full-screen element that captures clicks everywhere when the drawer is open.
code
CSS
/* src/content/styles.ts - Update the Tutorial Backdrop block */

:host([data-mode="tutorial"]) .backdrop {
    /* Restore full-screen coverage */
    inset: 0 !important;
    width: 100vw !important;
    left: 0 !important;
    
    /* Transparent background to see the instructions */
    background: transparent !important;
    
    /* Default to none so we don't block the page when drawer is closed */
    pointer-events: none;
    display: flex;
    justify-content: flex-end;
    
    /* REMOVE clip-path if it exists from previous steps */
    clip-path: none !important;
}

:host([data-mode="tutorial"]) .backdrop.open {
    /* Capture clicks everywhere on the screen to trigger the 'close' event */
    pointer-events: auto !important;
    
    /* Optional: very slight tint to show the drawer is active */
    background: rgba(0, 0, 0, 0.02) !important;
}

:host([data-mode="tutorial"]) .modal {
    margin: auto 20px auto auto;
    /* Ensure the modal itself remains interactive */
    pointer-events: auto;
}
