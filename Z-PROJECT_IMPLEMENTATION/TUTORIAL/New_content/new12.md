Step: Smooth Sidebar Slide Logic
Objective: Replace "snappy" re-renders with a smooth CSS-driven sidebar expansion.
Files to Modify:
src/tutorial.ts
Tasks:
1. Rewrite CSS in initialRender()
Update the style block inside src/tutorial.ts to handle the grid and text transitions smoothly.
code
TypeScript
/* Inside initialRender() -> style.textContent = ... */

/* 1. The Grid: Professional Bezier curve for the slide */
.tutorial-grid {
    display: grid;
    grid-template-columns: 60px 320px 1fr; /* Start collapsed */
    height: 100vh;
    width: 100vw;
    background: #0f1117;
    transition: grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When the nav panel is expanded via class */
.tutorial-grid.nav-expanded {
    grid-template-columns: 240px 320px 1fr;
}

/* 2. The Panel: Hide overflow during animation */
.panel-nav {
    background: #0a0b0e;
    border-right: 1px solid #21262d;
    padding: 24px 8px; /* Fixed small padding */
    display: flex;
    flex-direction: column;
    overflow-x: hidden; 
    white-space: nowrap;
    transition: padding 0.4s ease;
}

.tutorial-grid.nav-expanded .panel-nav {
    padding: 24px 16px;
}

/* 3. The Content: Smoothly fade text in/out */
.mod-title, .panel-label, #nav-toggle span:last-child {
    opacity: 0;
    margin-left: 12px;
    transition: opacity 0.2s ease, transform 0.3s ease;
    transform: translateX(-10px);
    pointer-events: none;
}

.tutorial-grid.nav-expanded .mod-title, 
.tutorial-grid.nav-expanded .panel-label,
.tutorial-grid.nav-expanded #nav-toggle span:last-child {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
}

/* 4. Button Polish */
.mod-btn {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 8px;
    margin-bottom: 6px;
    transition: background 0.2s, border-color 0.2s;
}

.mod-btn .mod-icon {
    min-width: 44px; /* Icon stays centered in the 60px strip */
    display: flex;
    justify-content: center;
    font-size: 14px;
}
2. Simplify initialRender Listeners
Remove the updateUI() calls from the mouse events. We only want to toggle a class on the grid container.
code
TypeScript
/* Inside initialRender() logic */

const grid = root.querySelector('.tutorial-grid') as HTMLElement;
const navContainer = root.querySelector('#nav-container');

if (navContainer && grid) {
    navContainer.addEventListener('mouseenter', () => {
        grid.classList.add('nav-expanded');
    });
    navContainer.addEventListener('mouseleave', () => {
        grid.classList.remove('nav-expanded');
    });
}
3. Update updateUI() to render FULL content
The JavaScript should always render the text. The CSS will decide if it's visible. This prevents the "snappy" flash of content.
code
TypeScript
/* Update the navContainer.innerHTML section in updateUI() */

navContainer.innerHTML = `
    <button id="nav-toggle" class="mod-btn" style="margin-bottom: 20px; width: 100%; border: none; background: #161b22;">
        <span class="mod-icon">☰</span>
        <span class="mod-title">Tutorial Menu</span>
    </button>
    <div class="panel-label">Learning Modules</div>
    ${TUTORIAL_MODULES.map((m, i) => `
        <button class="mod-btn ${i === this.activeModuleIdx ? 'active' : ''}" data-idx="${i}" style="width: 100%;">
            <span class="mod-icon">${i + 1}</span>
            <span class="mod-title">${m.title}</span>
        </button>
    `).join('')}
`;

// IMPORTANT: Do NOT call grid.style.gridTemplateColumns here. 
// Let the CSS .nav-expanded class handle the transition.
