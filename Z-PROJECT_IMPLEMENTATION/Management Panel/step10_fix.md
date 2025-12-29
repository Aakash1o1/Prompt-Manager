Fix: Enable Pointer Events on QuickMenu
Complexity: Low
Files to Modify:
src/content/components/QuickMenu.ts
Tasks:
Update setupStyles to explicitly set pointerEvents: 'auto'.
Update src/content/components/QuickMenu.ts
Replace the setupStyles method with this:
code
TypeScript
// src/content/components/QuickMenu.ts

    private setupStyles() {
        Object.assign(this.el.style, {
            position: 'fixed',
            zIndex: '2147483647',
            background: 'var(--bg-panel, #18181b)',
            border: '1px solid var(--border-default, #3f3f46)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            padding: '4px',
            display: 'none',
            flexDirection: 'column',
            minWidth: '200px',
            color: 'var(--txt-primary, #fafafa)',
            fontFamily: 'sans-serif',
            // FIX: Re-enable mouse interaction (was inheriting 'none' from host)
            pointerEvents: 'auto' 
        });
    }
