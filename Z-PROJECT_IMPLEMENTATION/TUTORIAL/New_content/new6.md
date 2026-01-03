Tasks:
1. Refine Backdrop Styles in src/content/styles.ts
We will configure the backdrop to be a full-screen "invisible shield" that is only active when the drawer is open.
code
CSS
/* src/content/styles.ts - Find and replace the :host([data-mode="tutorial"]) blocks with this: */

:host([data-mode="tutorial"]) .backdrop {
    /* 1. Full Screen Coverage */
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    left: 0 !important;
    top: 0 !important;
    
    /* 2. Total Transparency (Instructions remain visible) */
    background: transparent !important;
    backdrop-filter: none !important;
    
    /* 3. Invisible when closed */
    pointer-events: none;
    display: flex;
    justify-content: flex-end; /* Keep modal on the right */
    align-items: center;
    visibility: hidden;
    opacity: 0;
}

:host([data-mode="tutorial"]) .backdrop.open {
    /* 4. Active when open: Catch clicks everywhere to trigger close */
    pointer-events: auto !important;
    visibility: visible;
    opacity: 1;
}

:host([data-mode="tutorial"]) .modal {
    /* 5. The actual drawer box stays on the right */
    margin-right: 20px;
    pointer-events: auto; /* Clicks inside the drawer work normally */
    box-shadow: 0 10px 50px rgba(0,0,0,0.5); /* Stronger shadow since background is clear */
}
