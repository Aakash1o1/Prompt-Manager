"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/content/lib/magicScripts.ts
  var magicScripts_exports = {};
  __export(magicScripts_exports, {
    MAGIC_SCRIPTS: () => MAGIC_SCRIPTS
  });
  var MAGIC_SCRIPTS;
  var init_magicScripts = __esm({
    "src/content/lib/magicScripts.ts"() {
      "use strict";
      MAGIC_SCRIPTS = [
        {
          name: "Make Prompt",
          icon: "\u{1F3D7}\uFE0F",
          text: `You are an expert Prompt Architect and Context Engineer.

meta[1]{role,goal,behavior}: PromptArchitect+ContextEngineer,Turn a brief into a production-ready natural language prompt using Markdown,Ask bundled clarification questions when independent; ask sequentially only when dependent; continue until info complete or user denies; use clear Markdown structures.

tips[6]{line}: I\u2019ll ask concise questions to clarify your task. Independent questions will be asked together to save time. Dependent questions will be asked later only if needed. You can answer briefly or say "skip" for any question. Say "stop" or "done" anytime to proceed with available info. Final structured outputs will use clear Natural Language with Markdown formatting.

PROMPT PRINCIPLES
principles[4]{rule}: Use clear Markdown headers (#, ##) for hierarchy. Use bullet points for constraints and inputs to improve readability. Use "System Role" framing to establish persona. Ensure the final prompt is modular and easy for a human to edit.

REQUIRED INFO CHECKLIST
required_info[8]{field}: role goal inputs constraints output_format audience tone research_need

QUESTIONING STRATEGY
question_strategy[6]{bundling,max_total,short_limit,numbering,skip_words,stop_words}: Bundle independent questions together. Max total questions: 6. Each question \u226414 words. Number questions Q1, Q2, Q3... Accept "skip" as valid answer. Stop on "stop|done".

CLARIFICATION PHASE RULES
clarification[4]{phase1,phase2,phase3,exit}: Phase1: Ask a bundled set of independent questions (role, audience, tone, output format). Phase2: Ask a bundled set of task-specific questions (inputs, constraints, success criteria). Phase3: Ask dependent or follow-up questions only if gaps remain. Exit: When required_info is satisfied or user stops.

RESEARCH RULES
research[4]{when,with_tool,summary_limit,no_tool}: When: domain is broad, niche, or time-sensitive. With_tool: do brief research (max 3 sources). Summary_limit: bullets only. No_tool: ask user whether to proceed without research or provide sources.

FINAL PROMPT STRUCTURE (Markdown)
final_prompt_structure[13]{section}:

[Title]
Persona/Role
Primary Goal
Context & Background
Task Inputs
Constraints & Guardrails
Output Format Requirements
Tone & Voice
Intended Audience
Examples (Few-Shot)
Success Criteria
Retrieval Instructions (If applicable)
Operational Notes
READY-TO-PASTE BLOCK
ready_block[2]{summary,final_prompt}: One-sentence intent summary, Full execution prompt (formatted in a clean Markdown code block)

OUTPUT RULES
output_rules[4]{formatting,clarity,examples,confirm}: Use natural language exclusively (no code-like syntax for the final result). Ensure high readability for both humans and LLMs. Include one "Good Example" and one "Common Pitfall" section. Ask user if refinements are needed.

START
start[1]{prompt}: Please provide a one-paragraph brief of what you want to do.
`
        }
      ];
    }
  });

  // src/content/styles.ts
  var STYLES = `
/* --- VARIABLES --- */
:host {
  all: initial;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--txt-primary);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  
  /* --- BACKGROUNDS --- */
  --bg-app: #0f1117;       /* Main container background (Deepest Blue-Grey) */
  --bg-panel: #161b22;     /* Sidebar / Modals (Slightly lighter) */
  --bg-input: #0d1117;     /* Input fields (Darker for depth) */
  --bg-hover: rgba(56, 139, 253, 0.1); /* Subtle Blue tint on hover */
  --bg-active: rgba(56, 139, 253, 0.2); /* Stronger Blue tint when selected */
  
  /* --- BORDERS --- */
  --border-subtle: #21262d; /* Very subtle dividers */
  --border-default: #30363d; /* Standard borders */
  --border-focus: #58a6ff;   /* Bright Blue focus ring */
  
  /* --- ACCENTS --- */
  --accent: #2f81f7;       /* Primary Action Blue (Vibrant but readable) */
  --accent-hover: #58a6ff; /* Lighter Blue for hover states */
  --accent-dim: rgba(47, 129, 247, 0.15); /* Low opacity accent for backgrounds */
  --danger: #da3633;       /* Muted Red for delete actions */
  
  /* --- TYPOGRAPHY --- */
  --txt-primary: #ffffff;  /* Pure White */
  --txt-secondary: #8b949e; /* Cool Grey (Good for labels) */
  --txt-muted: #484f58;    /* Dark Grey (For placeholders/disabled) */
  
  /* --- DIMENSIONS --- */
  --modal-width: 800px;
  --modal-height: 600px;
  --sidebar-width: 260px;
  
  /* --- DYNAMIC SETTINGS --- */
  --font-size: 13px; /* Default, updated by App.ts */
  
  /* --- Z-INDEX --- */
  --z-max: 2147483647;
}

/* --- RESET & BASE --- */
* {
  box-sizing: border-box;
  scrollbar-width: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 600;
  color: inherit;
}
*::-webkit-scrollbar {
  display: none;
}

/* Hide number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/* --- BACKDROP --- */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: var(--z-max);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

/* --- MODAL CONTAINER --- */
.modal {
  width: var(--modal-width);
  height: var(--modal-height);
  background: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 
    0 0 0 1px rgba(0,0,0,0.5),
    0 20px 50px -12px rgba(0,0,0,0.8);
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr; /* Split View */
  overflow: hidden;
  
  /* Animation */
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.backdrop.open .modal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* --- LAYOUT COLUMNS --- */
.sidebar {
  background: var(--bg-panel);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative; /* FIX 1: Establishes coordinate system for dropdown */
}

.workspace {
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* --- SIDEBAR COMPONENTS --- */
.sb-header {
  height: 50px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  gap: 8px;
  flex-shrink: 0;
}

.sb-search-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  color: var(--txt-muted);
}

.sb-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  font-size: var(--font-size); /* FIX 2: Dynamic Font */
  padding: 6px 0 6px 24px;
  outline: none;
}
.sb-search-input::placeholder { color: var(--txt-muted); }

.sb-search-icon {
  position: absolute;
  left: 0;
  pointer-events: none;
}

.sb-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--txt-primary);
  font-size: var(--font-size); /* FIX 2 */
  user-select: none;
  position: relative;
  transition: background 0.1s;
}
.tree-row:hover { background: var(--bg-hover); color: var(--txt-primary); }
.tree-row.active { background: var(--bg-active); color: var(--txt-primary); box-shadow: inset 3px 0 0 var(--accent); }

.row-indent { width: 16px; flex-shrink: 0; }
.row-icon { width: 16px; margin-right: 8px; display: flex; align-items: center; color: var(--txt-muted); }
.tree-row:hover .row-icon { color: var(--txt-secondary); }

.row-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-shortcut {
  font-size: 11px;
  color: var(--txt-muted);
  margin-left: 8px;
  margin-right: 4px;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

/* Kebab & Actions */
.row-actions { display: none; margin-left: auto; gap: 4px; }
.tree-row:hover .row-actions { display: flex; }

.icon-btn {
  padding: 6px;
  border-radius: 6px;
  color: var(--txt-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  display: flex;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-btn:hover { 
  background: var(--bg-hover); 
  color: var(--txt-primary);
  transform: translateY(-1px);
}
.icon-btn:active {
  transform: translateY(0);
}

button {
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sb-footer {
  height: 48px;
  border-top: 1px solid var(--border-subtle);
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

/* --- BUTTONS --- */
.btn-new {
  background: linear-gradient(180deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
}
.btn-new:hover { 
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.btn-primary:hover { 
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--txt-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-secondary:hover { 
  background: var(--bg-active);
  border-color: var(--border-default);
}

.btn-ghost {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-ghost:hover { 
  background: var(--bg-hover);
  color: var(--txt-primary);
}

.btn-small {
  padding: 4px 10px;
  font-size: 11px;
}

/* --- MAGIC DROPDOWN --- */
.magic-dropdown {
  position: absolute;
  top: 46px; /* FIX 3: Align nicely under header */
  right: 8px; /* FIX 3: 8px padding from sidebar edge */
  width: 200px;
  background: var(--bg-app);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 100;
  display: none;
  flex-direction: column;
  padding: 4px;
}
.magic-dropdown.open { display: flex; }

.magic-item {
  padding: 8px 12px;
  font-size: var(--font-size); /* FIX 2 */
  color: var(--txt-secondary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.magic-item:hover { background: var(--bg-hover); color: var(--txt-primary); }

/* --- WORKSPACE EDITOR --- */
.ws-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.ws-title-input {
  background: transparent;
  border: none;
  font-size: calc(var(--font-size) + 6px); /* FIX 2: Relative scaling */
  font-weight: 700;
  color: var(--txt-primary);
  width: 100%;
  outline: none;
}
.ws-title-input::placeholder { color: var(--txt-muted); opacity: 0.5; }

.ws-meta-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ws-input {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: var(--font-size); /* FIX 2 */
  outline: none;
  transition: border-color 0.2s;
}
.ws-input:focus { border-color: var(--accent); color: var(--txt-primary); }

.ws-select {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--txt-secondary);
  font-size: var(--font-size); /* FIX 2 */
  outline: none;
  cursor: pointer;
  max-width: 200px;
}

.ws-editor-body {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--txt-primary);
  padding: 24px;
  font-family: inherit;
  font-size: var(--font-size); /* FIX 2 */
  line-height: 1.6;
  outline: none;
  resize: none;
}

.ws-footer {
  height: 60px;
  padding: 0 24px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end; 
  gap: 12px;
  flex-shrink: 0;
  background: var(--bg-app);
}

.ws-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--txt-muted);
  gap: 16px;
}

/* --- CONTROL PANEL --- */
.cp-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.cp-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--txt-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.cp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-hover);
}

.cp-label { font-size: 14px; color: var(--txt-primary); }
.cp-desc { font-size: 12px; color: var(--txt-muted); margin-top: 2px; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--bg-hover);
  border-radius: 99px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid var(--border-subtle);
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
input:checked + .toggle-switch { background-color: var(--accent); border-color: var(--accent); }
input:checked + .toggle-switch::after { transform: translateX(20px); }

/* Import/Export Cards */
.backup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.backup-card {
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.backup-card:hover { border-color: var(--accent); background: var(--bg-active); }
.backup-icon { font-size: 24px; }
.backup-title { font-weight: 600; font-size: 14px; }

/* --- MOVE MODE --- */
.sidebar.mode-move .sb-header {
  background: var(--bg-active);
  border-bottom-color: var(--accent);
}

.sidebar.mode-move .tree-row[data-type="prompt"] {
  opacity: 0.3;
  pointer-events: none; /* Disable clicking prompts in move mode */
}

.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.1); /* Light blue hover */
  color: var(--accent);
}

.sidebar.mode-move .tree-row.destination {
  background: var(--accent);
  color: white;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white;
}

/* Hide standard controls in move mode */
.sidebar.mode-move .sb-search-wrapper,
.sidebar.mode-move #btn-magic,
.sidebar.mode-move #btn-settings,
.sidebar.mode-move #btn-new-root {
  display: none !important;
}

/* Show move controls (hidden by default) */
.sb-move-title { display: none; font-weight: 600; font-size: 13px; color: var(--txt-primary); }
.sidebar.mode-move .sb-move-title { display: block; }

.sb-move-actions { display: none; gap: 8px; width: 100%; justify-content: flex-end; }
.sidebar.mode-move .sb-move-actions { display: flex; }

.btn-small {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}
.btn-secondary { background: var(--bg-hover); color: var(--txt-primary); }
.btn-secondary:hover { background: var(--border-default); }

/* --- TOAST --- */
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-panel);
    border: 1px solid var(--border-default);
    color: var(--txt-primary);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    width: max-content;
    max-width: 300px;
    text-align: center;
}
.toast.show { opacity: 1; }

/* --- RESIZE HANDLES --- */
.resize-handle {
  position: absolute;
  z-index: 100;
  opacity: 0; /* Invisible but clickable */
}
.resize-handle:hover { background: rgba(59,130,246,0.3); opacity: 1; }

.resize-handle.e, .resize-handle.w { width: 8px; height: 100%; top: 0; cursor: ew-resize; }
.resize-handle.n, .resize-handle.s { height: 8px; width: 100%; left: 0; cursor: ns-resize; }

.resize-handle.e { right: -4px; }
.resize-handle.w { left: -4px; }
.resize-handle.n { top: -4px; }
.resize-handle.s { bottom: -4px; }

.resize-handle.se { width: 16px; height: 16px; bottom: -8px; right: -8px; cursor: nwse-resize; z-index: 101; }
.resize-handle.sw { width: 16px; height: 16px; bottom: -8px; left: -8px; cursor: nesw-resize; z-index: 101; }
.resize-handle.ne { width: 16px; height: 16px; top: -8px; right: -8px; cursor: nesw-resize; z-index: 101; }
.resize-handle.nw { width: 16px; height: 16px; top: -8px; left: -8px; cursor: nwse-resize; z-index: 101; }

/* --- UNCATEGORIZED GROUP --- */
.uncategorized-header {
  padding: 12px 12px 4px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--txt-muted);
  margin-top: 8px;
  border-top: 1px solid var(--bg-hover);
  user-select: none;
}

/* Move Mode: Uncategorized acts as a target */
.sidebar.mode-move .uncategorized-header {
  cursor: pointer;
  border: 1px dashed var(--border-default);
  margin: 8px;
  border-radius: 6px;
  text-align: center;
  padding: 8px;
  background: rgba(59, 130, 246, 0.05);
}
.sidebar.mode-move .uncategorized-header:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}
.sidebar.mode-move .uncategorized-header.selected {
  background: var(--accent);
  color: white;
  border-style: solid;
}

/* --- UPDATED MOVE MODE COLORS --- */
/* 1. All valid folders get Light Blue */
.sidebar.mode-move .tree-row[data-type="folder"] {
  background: rgba(59, 130, 246, 0.1); /* Light Blue */
  color: var(--txt-primary);
  margin-bottom: 1px;
}

/* 2. Hover effect */
.sidebar.mode-move .tree-row[data-type="folder"]:hover {
  background: rgba(59, 130, 246, 0.2); 
}

/* 3. Selected Target gets Dark Blue */
.sidebar.mode-move .tree-row.destination {
  background: var(--accent) !important;
  color: white !important;
}
.sidebar.mode-move .tree-row.destination .row-icon {
  color: white !important;
}

/* --- IMPORT/EXPORT MODES --- */
.sb-selection-toggles {
  font-size: 11px;
  color: var(--txt-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-select-all-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.sb-select-all-label:hover {
  color: var(--txt-primary);
}

.sb-checkbox {
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--accent);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
.status-dot.green { background: #10b981; }
.status-dot.red { background: var(--danger); box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
.status-dot.amber { background: #f59e0b; }

/* Export mode: selected rows */
.sidebar.mode-export .tree-row.selected {
  background: rgba(59, 130, 246, 0.15);
}

/* Show mode titles/actions in export/import */
.sidebar.mode-export .sb-move-title,
.sidebar.mode-import .sb-move-title { display: block; }
.sidebar.mode-export .sb-move-actions,
.sidebar.mode-import .sb-move-actions { display: flex; }
.sidebar.mode-export .sb-search-wrapper,
.sidebar.mode-export #btn-magic,
.sidebar.mode-export #btn-settings,
.sidebar.mode-export #btn-new-root,
.sidebar.mode-import .sb-search-wrapper,
.sidebar.mode-import #btn-magic,
.sidebar.mode-import #btn-settings,
.sidebar.mode-import #btn-new-root { display: none !important; }

/* --- WORKSPACE CODE BLOCK --- */
.ws-code-block {
  background: var(--bg-hover);
  padding: 16px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  color: var(--txt-secondary);
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  border: 1px solid var(--border-subtle);
}

/* --- WORKSPACE INPUT VALIDATION --- */
.ws-input.error, .ws-title-input.error {
  border-color: var(--danger) !important;
  background: rgba(239, 68, 68, 0.05);
}
.ws-input.success, .ws-title-input.success {
  border-color: #10b981 !important;
}
.validation-msg {
  font-size: 11px;
  margin-top: 4px;
  margin-left: 2px;
  display: block;
}
.validation-msg.error { color: var(--danger); }
.validation-msg.warning { color: #f59e0b; }

/* Read-only inputs for Preview */
.ws-title-input:read-only,
.ws-input:read-only,
.ws-editor-body:read-only {
  cursor: default;
  opacity: 0.8;
}
.ws-editor-body:read-only { user-select: text; }

/* --- WORKSPACE CONFLICT/SAFE BOXES --- */
.conflict-box {
  border: 1px solid var(--danger);
  background: rgba(239, 68, 68, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.conflict-title {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.safe-box {
  border: 1px solid #10b981;
  background: rgba(16, 185, 129, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.safe-title {
  color: #10b981;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
`;

  // src/content/resize.ts
  function setupResizeHandles(modal, shadow) {
    let isResizing = false;
    let currentHandle = null;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;
    const directions = ["se", "sw", "ne", "nw", "n", "s", "e", "w"];
    directions.forEach((dir) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${dir}`;
      handle.dataset.dir = dir;
      modal.appendChild(handle);
    });
    const onPointerDown = (e) => {
      const target = e.target;
      if (!target.classList.contains("resize-handle"))
        return;
      e.preventDefault();
      target.setPointerCapture(e.pointerId);
      isResizing = true;
      currentHandle = target.dataset.dir || null;
      startX = e.clientX;
      startY = e.clientY;
      const rect = modal.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      modal.classList.add("resizing");
    };
    const onPointerMove = (e) => {
      if (!isResizing || !currentHandle)
        return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newW = startW;
      let newH = startH;
      if (currentHandle.includes("e"))
        newW = Math.max(600, startW + dx * 2);
      if (currentHandle.includes("w"))
        newW = Math.max(600, startW - dx * 2);
      if (currentHandle.includes("s"))
        newH = Math.max(400, startH + dy * 2);
      if (currentHandle.includes("n"))
        newH = Math.max(400, startH - dy * 2);
      modal.style.width = `${newW}px`;
      modal.style.height = `${newH}px`;
    };
    const onPointerUp = (e) => {
      if (!isResizing)
        return;
      isResizing = false;
      modal.classList.remove("resizing");
      e.target.releasePointerCapture(e.pointerId);
    };
    const container = shadow.querySelector(".backdrop") || modal;
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
  }

  // src/content/host.ts
  function createOrGetHost() {
    const HOST_ID = "prompt-drawer-host-shadow";
    const existingHost = document.getElementById(HOST_ID);
    if (existingHost) {
      existingHost.remove();
    }
    window.__promptManagerInitialized = true;
    const host = document.createElement("div");
    host.id = HOST_ID;
    Object.assign(host.style, {
      all: "initial",
      position: "fixed",
      top: "0",
      left: "0",
      width: "0",
      /* Host has no size, children are fixed/modal */
      height: "0",
      zIndex: "2147483647",
      pointerEvents: "none"
      // Pass-through when closed
    });
    document.documentElement.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>${STYLES}</style>
    
    <!-- BACKDROP -->
    <div class="backdrop" id="backdrop">
      <div class="modal" id="modal">
        <!-- Placeholders for components -->
        <aside class="sidebar" id="sidebar"></aside>
        <main class="workspace" id="workspace"></main>
      </div>
    </div>

    <!-- TOAST (Fixed position relative to window) -->
    <div class="toast" id="toast"></div>
  `;
    const modal = shadow.getElementById("modal");
    if (modal)
      setupResizeHandles(modal, shadow);
    return { host, shadow };
  }

  // src/lib/storage.ts
  async function getStorage(key) {
    return new Promise((res, rej) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            rej(chrome.runtime.lastError);
          } else {
            res(result[key]);
          }
        });
      } catch (e) {
        rej(e);
      }
    });
  }
  async function setStorage(obj) {
    return new Promise((res, rej) => {
      try {
        chrome.storage.local.set(obj, () => {
          if (chrome.runtime.lastError) {
            rej(chrome.runtime.lastError);
          } else {
            res();
          }
        });
      } catch (e) {
        rej(e);
      }
    });
  }

  // src/lib/defaultPrompts.ts
  var DEFAULT_TAGS = [
    { name: "Writing", color: "#FF6B6B" },
    { name: "Code", color: "#6B9CFF" },
    { name: "Analysis", color: "#9AE66E" },
    { name: "Creative", color: "#D39BFF" }
  ];
  var DEFAULT_FOLDERS = [
    { name: "Organize prompts in folders" }
  ];
  var DEFAULT_PROMPTS = [
    {
      title: 'Type "expand" in your text bar',
      quick: ".expand",
      text: "1. Paste any prompt just by its shortcut\n2. To give access to any site, just press Alt + P there\n3. Organize prompts in folders",
      folderName: "Organize prompts in folders"
    },
    {
      title: "META_PROMPT_BUILDER (TOON formatted)",
      quick: "meta",
      text: `# META_PROMPT_BUILDER (TOON formatted)
# You are an expert Prompt Architect and Context Engineer.

meta[1]{role,goal,behavior}:
  PromptArchitect+ContextEngineer,Turn a brief into a production-ready TOON prompt,Ask bundled clarification questions when independent; ask sequentially only when dependent; continue until info complete or user denies; teach and use TOON

tips[6]{line}:
  I'll ask concise questions to clarify your task.
  Independent questions will be asked together to save time.
  Dependent questions will be asked later only if needed.
  You can answer briefly or say "skip" for any question.
  Say "stop" or "done" anytime to proceed with available info.
  Final structured outputs will use TOON format.

# TOON SYNTAX (teach the model and downstream LLMs)
toon_spec[5]{rule,example}:
  Definition: TOON = Token-Oriented Object Notation, a compact structured format for LLM prompts.
  Header: name[count]{field1,field2}:
  Rows: indented CSV-style values.
  Rules: no JSON braces or quotes; declare fields once.
  Example: users[2]{id,name}:
    1,Alice
    2,Bob

# REQUIRED INFO CHECKLIST
required_info[8]{field}:
  role
  goal
  inputs
  constraints
  output_format
  audience
  tone
  research_need

# QUESTIONING STRATEGY
question_strategy[6]{bundling,max_total,short_limit,numbering,skip_words,stop_words}:
  Bundle independent questions together.
  Max total questions: 6.
  Each question \u226414 words.
  Number questions Q1, Q2, Q3...
  Accept "skip" as valid answer.
  Stop on "stop|done".

# CLARIFICATION PHASE RULES
clarification[4]{phase1,phase2,phase3,exit}:
  Phase1: Ask a bundled set of independent questions (role, audience, tone, output format).
  Phase2: Ask a bundled set of task-specific questions (inputs, constraints, success criteria).
  Phase3: Ask dependent or follow-up questions only if gaps remain.
  Exit: When required_info is satisfied or user stops.

# RESEARCH RULES
research[4]{when,with_tool,summary_limit,no_tool}:
  When: domain is broad, niche, or time-sensitive.
  With_tool: do brief research (max 3 sources).
  Summary_limit: bullets only.
  No_tool: ask user whether to proceed without research or provide sources.

# FINAL PROMPT STRUCTURE (TOON)
final_prompt_structure[13]{section}:
  Title
  Role
  Goal
  Background
  Inputs
  Constraints
  Output_Format
  Tone
  Audience
  Examples
  Evaluation_Criteria
  Retrieval_Instructions
  Token_Guidance

# READY-TO-PASTE BLOCK
ready_block[2]{summary,final_prompt}:
  One-sentence intent summary,
  Full execution prompt (structured parts in TOON)

# OUTPUT RULES
output_rules[4]{teach_toon,format,examples,confirm}:
  Include TOON syntax explanation in final prompt.
  Use TOON for all structured sections.
  Include one good example and one anti-pattern.
  Ask user if refinements are needed.

# START
start[1]{prompt}:
  Please provide a one-paragraph brief of what you want to do.`
    }
  ];

  // src/content/store.ts
  var CURRENT_SCHEMA_VERSION = 2;
  var PROMPTS_KEY = "promptManager.prompts";
  var FOLDERS_KEY = "promptManager.folders";
  var SETTINGS_KEY = "promptManager.settings";
  var TAGS_KEY = "promptManager.tags";
  var DEFAULT_SETTINGS = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24,
    autoCloseOnHover: true,
    quickMenuLimit: 4
  };
  function uid() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  var MIGRATIONS = {
    // Migration v1 -> v2
    // Goal: Ensure 'attributes' object exists on all items
    2: (data) => {
      console.log("Migrating data to v2...");
      if (Array.isArray(data.prompts)) {
        data.prompts = data.prompts.map((p) => ({
          ...p,
          attributes: p.attributes || {}
          // Initialize if missing
        }));
      }
      if (Array.isArray(data.folders)) {
        data.folders = data.folders.map((f) => ({
          ...f,
          attributes: f.attributes || {}
          // Initialize if missing
        }));
      }
      return data;
    }
  };
  var Store = class {
    constructor() {
      // State
      this.prompts = [];
      this.tags = [];
      this.folders = [];
      // NEW: Initialize empty folder array
      this.settings = DEFAULT_SETTINGS;
      // UI State (transient)
      this.filterText = "";
      this.selectedTagIds = [];
      // Event System
      this.listeners = {};
      this.setupStorageListener();
    }
    reorderPromptsSilently(oldIndex, newIndex) {
      if (oldIndex === newIndex)
        return;
      const [item] = this.prompts.splice(oldIndex, 1);
      this.prompts.splice(newIndex, 0, item);
      setStorage({ [PROMPTS_KEY]: this.prompts });
    }
    setupStorageListener() {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local")
          return;
        if (changes[PROMPTS_KEY]) {
          this.prompts = changes[PROMPTS_KEY].newValue || [];
          this.notify("prompts_updated");
        }
        if (changes[TAGS_KEY]) {
          this.tags = changes[TAGS_KEY].newValue || [];
          this.notify("tags_updated");
        }
        if (changes[SETTINGS_KEY]) {
          this.settings = changes[SETTINGS_KEY].newValue || DEFAULT_SETTINGS;
          this.notify("settings_updated");
        }
        if (changes[FOLDERS_KEY]) {
          this.folders = changes[FOLDERS_KEY].newValue || [];
          this.notify("folders_updated");
        }
      });
    }
    /**
     * Pipelines the data through necessary migrations up to CURRENT_SCHEMA_VERSION.
     */
    migrateData(data) {
      let processed = JSON.parse(JSON.stringify(data));
      const fileVersion = processed.metadata?.schemaVersion || 0;
      if (fileVersion < CURRENT_SCHEMA_VERSION) {
        for (let v = fileVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
          if (MIGRATIONS[v]) {
            try {
              processed = MIGRATIONS[v](processed);
            } catch (e) {
              console.error(`Migration to v${v} failed`, e);
            }
          }
        }
        if (!processed.metadata)
          processed.metadata = {};
        processed.metadata.schemaVersion = CURRENT_SCHEMA_VERSION;
      }
      return processed;
    }
    async load() {
      try {
        const rawPrompts = await getStorage(PROMPTS_KEY) || [];
        const rawFolders = await getStorage(FOLDERS_KEY) || [];
        const rawSettings = await getStorage(SETTINGS_KEY) || DEFAULT_SETTINGS;
        const rawData = {
          metadata: {
            // If they have no version saved, assume 0 or 1
            schemaVersion: await getStorage("schema_version") || 1,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            itemCount: rawPrompts.length
          },
          prompts: rawPrompts,
          folders: rawFolders
        };
        const migratedData = this.migrateData(rawData);
        this.prompts = migratedData.prompts;
        this.folders = migratedData.folders;
        this.settings = rawSettings;
        this.tags = await getStorage(TAGS_KEY) || [];
        if (rawData.metadata.schemaVersion < CURRENT_SCHEMA_VERSION) {
          console.log("Upgrading local storage to v" + CURRENT_SCHEMA_VERSION);
          await this.savePrompts();
          await this.saveFolders();
          await setStorage({ "schema_version": CURRENT_SCHEMA_VERSION });
        }
        if (this.prompts.length === 0 && this.tags.length === 0) {
          await this.initializeDefaults();
        }
        this.notify("loaded");
        this.notify("prompts_updated");
        this.notify("tags_updated");
        this.notify("folders_updated");
        this.notify("settings_updated");
      } catch (e) {
        console.error("Store: Failed to load data", e);
      }
    }
    async initializeDefaults() {
      console.log("Store: Initializing default data...");
      this.tags = DEFAULT_TAGS.map((dt, index) => ({
        id: uid(),
        name: dt.name,
        color: dt.color,
        order: index
      }));
      this.prompts = DEFAULT_PROMPTS.map((dp) => {
        const promptTags = [];
        if (dp.tags) {
          for (const tagName of dp.tags) {
            const tag = this.tags.find((t) => t.name === tagName);
            if (tag)
              promptTags.push(tag.id);
          }
        }
        return {
          id: uid(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags
        };
      });
      this.prompts.forEach((p) => p.parentId = null);
      await Promise.all([
        this.savePrompts(),
        this.saveTags(),
        this.saveSettings(),
        this.saveFolders()
        // NEW: Save empty folder list
      ]);
    }
    // --- Persistence Methods ---
    /**
     * Prepares the JSON structure for export based on selected IDs.
     */
    prepareExportData(selectedPromptIds, selectedFolderIds) {
      const exportedPrompts = this.prompts.filter((p) => selectedPromptIds.includes(p.id));
      const exportedFolders = this.folders.filter((f) => selectedFolderIds.includes(f.id));
      return {
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          itemCount: exportedPrompts.length
        },
        prompts: exportedPrompts,
        folders: exportedFolders
      };
    }
    /**
     * Triggers a browser download of the provided data as a .json file.
     */
    triggerDownload(data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = `prompts_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    // src/content/store.ts -> validateImportData
    validateImportData(rawData) {
      const warnings = [];
      if (!rawData || !Array.isArray(rawData.prompts) || !Array.isArray(rawData.folders)) {
        throw new Error("Invalid backup format: Missing prompts or folders arrays.");
      }
      const fileVersion = rawData.metadata?.schemaVersion || 0;
      if (fileVersion > CURRENT_SCHEMA_VERSION) {
        warnings.push(`Backup is from a newer version (v${fileVersion}). Some features may be missing.`);
      }
      const data = this.migrateData(rawData);
      const validFolderIds = new Set(data.folders.map((f) => f.id));
      data.folders.forEach((f) => {
        if (f.parentId && !validFolderIds.has(f.parentId)) {
          f.parentId = null;
        }
        if (f.id === f.parentId) {
          console.warn(`Folder "${f.name}" refers to itself. Moving to Root.`);
          f.parentId = null;
        }
      });
      data.prompts.forEach((p) => {
        if (p.parentId && !validFolderIds.has(p.parentId)) {
          p.parentId = null;
        }
        if (p.id === p.parentId) {
          p.parentId = null;
        }
      });
      const folderMap = /* @__PURE__ */ new Map();
      data.folders.forEach((f) => folderMap.set(f.id, f.parentId));
      for (const folder of data.folders) {
        let currentId = folder.id;
        const visited = /* @__PURE__ */ new Set();
        let depth = 0;
        while (currentId) {
          if (visited.has(currentId)) {
            throw new Error(`Circular dependency detected in folder structure (Folder ID: ${folder.id})`);
          }
          visited.add(currentId);
          depth++;
          if (depth > 20) {
            throw new Error(`Folder structure too deep (Level ${depth}). Max allowed is 20.`);
          }
          currentId = folderMap.get(currentId) || null;
        }
      }
      const batchTitles = /* @__PURE__ */ new Set();
      const batchShortcuts = /* @__PURE__ */ new Set();
      const validatedPrompts = data.prompts.map((incoming) => {
        const normalizedTitle = incoming.title.trim().toLowerCase();
        const normalizedQuick = incoming.quick ? incoming.quick.trim().toLowerCase() : null;
        let titleMatch = this.prompts.some((p) => p.title.trim().toLowerCase() === normalizedTitle);
        let shortcutMatch = normalizedQuick ? this.prompts.some((p) => p.quick?.trim().toLowerCase() === normalizedQuick) : false;
        if (batchTitles.has(normalizedTitle))
          titleMatch = true;
        if (normalizedQuick && batchShortcuts.has(normalizedQuick))
          shortcutMatch = true;
        batchTitles.add(normalizedTitle);
        if (normalizedQuick)
          batchShortcuts.add(normalizedQuick);
        const matchingBodyPrompt = this.prompts.find((p) => p.text.trim() === incoming.text.trim());
        return {
          ...incoming,
          isExcluded: false,
          conflicts: {
            title: titleMatch,
            shortcut: shortcutMatch,
            body: matchingBodyPrompt ? matchingBodyPrompt.title : null
          }
        };
      });
      const validatedFolders = data.folders.map((incoming) => ({
        ...incoming,
        isExcluded: false
      }));
      return { prompts: validatedPrompts, folders: validatedFolders, warnings };
    }
    /**
     * Finalizes the import by merging folder structures and creating new prompts.
     */
    async finalizeImport(selectedPrompts, selectedFolders) {
      const idMap = /* @__PURE__ */ new Map();
      idMap.set(null, null);
      const processFolders = async (importedParentId, localParentId, depth) => {
        if (depth > 10)
          return;
        const children = selectedFolders.filter((f) => f.parentId === importedParentId);
        for (const importedFolder of children) {
          let existingLocal = this.folders.find(
            (f) => f.parentId === localParentId && f.name.trim().toLowerCase() === importedFolder.name.trim().toLowerCase()
          );
          let localId;
          if (existingLocal) {
            localId = existingLocal.id;
          } else {
            localId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
            this.folders.push({
              id: localId,
              name: importedFolder.name,
              parentId: localParentId,
              order: this.folders.length,
              isExpanded: true,
              attributes: importedFolder.attributes || {}
            });
          }
          idMap.set(importedFolder.id, localId);
          await processFolders(importedFolder.id, localId, depth + 1);
        }
      };
      await processFolders(null, null, 0);
      selectedPrompts.forEach((p) => {
        const newId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
        const mappedParentId = idMap.get(p.parentId || null) || null;
        this.prompts.push({
          id: newId,
          title: p.title,
          text: p.text,
          quick: p.quick,
          tags: [],
          // Tags removed as per requirement
          parentId: mappedParentId,
          isPinned: p.isPinned || false,
          // Preserve pin state
          lastUsed: p.lastUsed,
          // Preserve history
          attributes: p.attributes || {}
        });
      });
      await Promise.all([this.saveFolders(), this.savePrompts()]);
    }
    async savePrompts() {
      try {
        await setStorage({ [PROMPTS_KEY]: this.prompts });
        this.notify("prompts_updated");
      } catch (e) {
        console.warn("Store: Failed saving prompts", e);
      }
    }
    async saveTags() {
      try {
        await setStorage({ [TAGS_KEY]: this.tags });
        this.notify("tags_updated");
      } catch (e) {
        console.warn("Store: Failed saving tags", e);
      }
    }
    async saveSettings() {
      try {
        await setStorage({ [SETTINGS_KEY]: this.settings });
        this.notify("settings_updated");
      } catch (e) {
        console.warn("Store: Failed saving settings", e);
      }
    }
    // --- Folder Persistence ---
    async saveFolders() {
      try {
        await setStorage({ [FOLDERS_KEY]: this.folders });
        this.notify("folders_updated");
      } catch (e) {
        console.warn("Store: Failed saving folders", e);
      }
    }
    isTitleExists(title, excludeId) {
      const normalized = title.trim().toLowerCase();
      if (!normalized)
        return false;
      return this.prompts.some((p) => p.id !== excludeId && p.title.trim().toLowerCase() === normalized);
    }
    isFolderNameExists(name, excludeId) {
      const normalized = name.trim().toLowerCase();
      if (!normalized)
        return false;
      return this.folders.some((f) => f.id !== excludeId && f.name.trim().toLowerCase() === normalized);
    }
    isShortcutExists(quick, excludeId) {
      const normalized = quick.trim().toLowerCase();
      if (!normalized)
        return false;
      return this.prompts.some((p) => p.id !== excludeId && p.quick && p.quick.trim().toLowerCase() === normalized);
    }
    // --- Folder Operations ---
    async addFolder(name, parentId = null) {
      if (this.isFolderNameExists(name)) {
        throw new Error("A folder with this name already exists");
      }
      const newFolder = {
        id: uid(),
        // Uses existing uid() helper
        name,
        parentId,
        order: this.folders.length,
        isExpanded: true,
        attributes: {}
      };
      this.folders.push(newFolder);
      await this.saveFolders();
    }
    async updateFolder(id, updates) {
      const idx = this.folders.findIndex((f) => f.id === id);
      if (idx === -1)
        return;
      if (updates.name !== void 0) {
        if (this.isFolderNameExists(updates.name, id)) {
          throw new Error("A folder with this name already exists");
        }
      }
      this.folders[idx] = { ...this.folders[idx], ...updates };
      await this.saveFolders();
    }
    /**
     * Deletes a folder.
     * LOGIC: Prompts and Subfolders inside it are NOT deleted.
     * They are moved to the parent of the deleted folder.
     */
    async deleteFolder(folderId) {
      const folderToDelete = this.folders.find((f) => f.id === folderId);
      if (!folderToDelete)
        return;
      const newParentId = folderToDelete.parentId;
      this.folders.forEach((f) => {
        if (f.parentId === folderId) {
          f.parentId = newParentId;
        }
      });
      this.prompts.forEach((p) => {
        if (p.parentId === folderId) {
          p.parentId = newParentId;
        }
      });
      this.folders = this.folders.filter((f) => f.id !== folderId);
      await Promise.all([this.saveFolders(), this.savePrompts()]);
    }
    // --- Usage Tracking ---
    /**
     * Updates the lastUsed timestamp for a prompt and persists it.
     */
    async recordUsage(id) {
      const idx = this.prompts.findIndex((p) => p.id === id);
      if (idx === -1)
        return;
      this.prompts[idx].lastUsed = Date.now();
      await setStorage({ [PROMPTS_KEY]: this.prompts });
    }
    /**
     * Toggles the pinned state of a prompt.
     * Enforces a maximum of 5 pinned items.
     */
    async togglePin(id) {
      const p = this.prompts.find((x) => x.id === id);
      if (!p)
        return;
      if (!p.isPinned) {
        const currentPinnedCount = this.prompts.filter((x) => x.isPinned).length;
        if (currentPinnedCount >= 5) {
          throw new Error("Max 5 pinned prompts allowed");
        }
        p.isPinned = true;
      } else {
        p.isPinned = false;
      }
      await this.savePrompts();
    }
    /**
     * Returns the most recently used prompts based on the user's settings.
     * Falls back to "random" (first available) prompts if none have been used.
     */
    getRecentPrompts() {
      const recentsLimit = this.settings.quickMenuLimit || 4;
      const pinned = this.prompts.filter((p) => p.isPinned);
      const others = this.prompts.filter((p) => !p.isPinned && p.lastUsed !== void 0).sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
      const recents = others.slice(0, recentsLimit);
      return [...pinned, ...recents];
    }
    // --- Prompt Management ---
    async addPrompt(title, text, quick, tagIds, parentId = null) {
      if (this.isTitleExists(title)) {
        throw new Error("A prompt with this name already exists");
      }
      if (quick && this.isShortcutExists(quick)) {
        throw new Error("A shortcut with this name already exists");
      }
      const newPrompt = {
        id: uid(),
        title,
        text,
        quick,
        tags: tagIds,
        parentId,
        // Set parent
        attributes: {}
      };
      this.prompts.push(newPrompt);
      await this.savePrompts();
    }
    async updatePrompt(id, updates) {
      const idx = this.prompts.findIndex((p) => p.id === id);
      if (idx === -1)
        return;
      if (updates.title !== void 0) {
        if (this.isTitleExists(updates.title, id)) {
          throw new Error("A prompt with this name already exists");
        }
      }
      if (updates.quick !== void 0 && updates.quick) {
        if (this.isShortcutExists(updates.quick, id)) {
          throw new Error("A shortcut with this name already exists");
        }
      }
      this.prompts[idx] = { ...this.prompts[idx], ...updates };
      await this.savePrompts();
    }
    async deletePrompt(id) {
      this.prompts = this.prompts.filter((p) => p.id !== id);
      await this.savePrompts();
    }
    async reorderPrompts(srcId, targetId) {
      const srcIndex = this.prompts.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = this.prompts.splice(srcIndex, 1);
      if (targetId === null) {
        this.prompts.push(item);
      } else {
        const targetIndex = this.prompts.findIndex((x) => x.id === targetId);
        if (targetIndex !== -1) {
          this.prompts.splice(targetIndex, 0, item);
        } else {
          this.prompts.push(item);
        }
      }
      await this.savePrompts();
    }
    // --- Tag Management ---
    async addTag(name, color) {
      const newTag = {
        id: uid(),
        name,
        color,
        order: this.tags.length
      };
      this.tags.push(newTag);
      await this.saveTags();
    }
    // --- NEW: Add Tag with explicit ID (for UI selection) ---
    async addTagWithId(id, name, color) {
      const newTag = {
        id,
        // Use passed ID
        name,
        color,
        order: this.tags.length
      };
      this.tags.push(newTag);
      await this.saveTags();
    }
    // -------------------------------------------------------
    async updateTag(id, updates) {
      const idx = this.tags.findIndex((t) => t.id === id);
      if (idx === -1)
        return;
      this.tags[idx] = { ...this.tags[idx], ...updates };
      await this.saveTags();
    }
    async deleteTag(id) {
      this.tags = this.tags.filter((t) => t.id !== id);
      this.prompts.forEach((p) => {
        if (p.tags && p.tags.includes(id)) {
          p.tags = p.tags.filter((tid) => tid !== id);
        }
      });
      this.selectedTagIds = this.selectedTagIds.filter((tid) => tid !== id);
      await Promise.all([this.saveTags(), this.savePrompts()]);
      this.notify("filter_updated");
    }
    // --- UI Helper Methods ---
    toggleFolderExpansion(folderId) {
      const folder = this.folders.find((f) => f.id === folderId);
      if (folder) {
        folder.isExpanded = !folder.isExpanded;
        this.notify("folders_updated");
      }
    }
    setAllFoldersExpansion(isExpanded) {
      this.folders.forEach((f) => f.isExpanded = isExpanded);
      this.notify("folders_updated");
    }
    // --- Tag Reordering Logic ---
    async reorderTags(srcId, targetIndex) {
      const srcIndex = this.tags.findIndex((x) => x.id === srcId);
      if (srcIndex === -1)
        return;
      const [item] = this.tags.splice(srcIndex, 1);
      const clamped = Math.max(0, Math.min(targetIndex, this.tags.length));
      this.tags.splice(clamped, 0, item);
      this.tags = this.tags.map((t, i) => ({ ...t, order: i }));
      await this.saveTags();
    }
    // --------------------------------
    // --- Settings Management ---
    async updateSettings(updates) {
      this.settings = { ...this.settings, ...updates };
      await this.saveSettings();
    }
    // --- Filtering & Selection ---
    setFilter(text) {
      this.filterText = text;
      this.notify("filter_updated");
    }
    toggleTagSelection(tagId) {
      if (this.selectedTagIds.includes(tagId)) {
        this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
      } else {
        this.selectedTagIds.push(tagId);
      }
      this.notify("filter_updated");
    }
    clearTagSelection() {
      this.selectedTagIds = [];
      this.notify("filter_updated");
    }
    getFilteredPrompts() {
      const q = (this.filterText || "").trim().toLowerCase();
      let base = this.prompts;
      if (this.selectedTagIds.length > 0) {
        base = base.filter((p) => (p.tags || []).some((tid) => this.selectedTagIds.includes(tid)));
      }
      if (!q)
        return base;
      return base.filter(
        (p) => p.title && p.title.toLowerCase().includes(q) || p.quick && p.quick.toLowerCase().includes(q)
      );
    }
    // --- Event System ---
    subscribe(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return () => {
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      };
    }
    notify(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach((cb) => cb(data));
      }
    }
  };

  // src/content/components/Component.ts
  var Component = class {
    constructor(store, shadow) {
      this.element = null;
      this.store = store;
      this.shadow = shadow;
    }
    el(tag, className, text) {
      const e = document.createElement(tag);
      if (className)
        e.className = className;
      if (text)
        e.textContent = text;
      return e;
    }
  };

  // src/content/icons.ts
  var ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    folderOpen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><path d="M2 10h20"></path></svg>`,
    prompt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    chevronRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    kebab: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
    pin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`,
    magic: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>`,
    settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    expandAll: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v6m0-6h6M9 9 3 3m6 6V3m0 6H3m12-6 6-6m-6 6h6m0 0v-6M9 15l-6 6m6-6H3m0 0v6"/></svg>`,
    collapseAll: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-6 6m0 0h6m-6 0V6M6 18l6-6m0 0H6m6 0v6m6 0-6-6m0 0v6m0-6h6M6 6l6 6m0 0V6m0 6H6"/></svg>`
  };

  // src/content/utils/searchTree.ts
  function getVisibleIds(prompts, folders, filterText) {
    const visibleIds = /* @__PURE__ */ new Set();
    const query = filterText.toLowerCase().trim();
    if (!query)
      return visibleIds;
    const folderMap = /* @__PURE__ */ new Map();
    folders.forEach((f) => folderMap.set(f.id, f));
    const addWithAncestors = (parentId) => {
      let currentId = parentId;
      while (currentId) {
        if (visibleIds.has(currentId))
          break;
        visibleIds.add(currentId);
        const parent = folderMap.get(currentId);
        currentId = parent ? parent.parentId || null : null;
      }
    };
    prompts.forEach((p) => {
      if (p.title.toLowerCase().includes(query) || p.quick && p.quick.toLowerCase().includes(query)) {
        visibleIds.add(p.id);
        addWithAncestors(p.parentId);
      }
    });
    return visibleIds;
  }

  // src/content/components/Sidebar.ts
  var Sidebar = class extends Component {
    constructor() {
      super(...arguments);
      this.container = null;
      this.listContainer = null;
      this.searchInput = null;
      this.magicDropdown = null;
      this.mode = "normal";
      this.activeId = null;
      this.movingPromptId = null;
      this.targetFolderId = null;
      this.exportSelectedIds = /* @__PURE__ */ new Set();
      this.importSelectedIds = /* @__PURE__ */ new Set();
      this.importData = null;
    }
    mount(parent) {
      this.container = parent.querySelector("#sidebar");
      if (!this.container)
        return;
      this.renderSkeleton();
      this.listContainer = this.container.querySelector(".sb-list");
      this.searchInput = this.container.querySelector(".sb-search-input");
      this.setupListeners();
      this.store.subscribe("prompts_updated", () => this.renderTree());
      this.store.subscribe("folders_updated", () => this.renderTree());
      this.renderTree();
    }
    setNormalMode() {
      this.mode = "normal";
      this.container?.classList.remove("mode-move", "mode-export", "mode-import");
      this.renderSkeleton();
      this.setupListeners();
      this.renderTree();
    }
    startMoveMode(promptId) {
      this.mode = "move";
      this.movingPromptId = promptId;
      const p = this.store.prompts.find((x) => x.id === promptId);
      this.targetFolderId = p ? p.parentId || null : null;
      this.container?.classList.add("mode-move");
      this.container?.classList.remove("mode-export", "mode-import");
      this.renderSkeleton();
      this.setupListeners();
      this.renderTree();
    }
    startExportMode() {
      this.mode = "export";
      this.exportSelectedIds = /* @__PURE__ */ new Set([
        ...this.store.prompts.map((p) => p.id),
        ...this.store.folders.map((f) => f.id)
      ]);
      this.container?.classList.add("mode-export");
      this.container?.classList.remove("mode-move", "mode-import");
      this.renderSkeleton();
      this.setupListeners();
      this.renderTree();
    }
    startImportMode(data) {
      this.mode = "import";
      this.importData = data;
      this.importSelectedIds = /* @__PURE__ */ new Set([
        ...data.prompts.map((p) => p.id),
        ...data.folders.map((f) => f.id)
      ]);
      this.container?.classList.add("mode-import");
      this.container?.classList.remove("mode-move", "mode-export");
      this.renderSkeleton();
      this.setupListeners();
      this.renderTree();
    }
    refreshImportTree() {
      if (this.mode === "import")
        this.renderTree();
    }
    getImportPrompt(id) {
      return this.importData?.prompts.find((p) => p.id === id);
    }
    getImportData() {
      return this.importData;
    }
    renderSkeleton() {
      if (!this.container)
        return;
      let headerHTML = "";
      let footerHTML = "";
      if (this.mode === "normal") {
        headerHTML = `
                <div class="sb-search-wrapper">
                    <span class="sb-search-icon">${ICONS.search}</span>
                    <input type="text" class="sb-search-input" placeholder="Search prompts..." spellcheck="false">
                </div>
                <div style="display: flex; gap: 4px;">
                    <button class="icon-btn" id="btn-toggle-expansion" title="Expand/Collapse All">${this.areAllFoldersExpanded() ? ICONS.collapseAll : ICONS.expandAll}</button>
                    <button class="icon-btn" id="btn-magic" title="Magic Scripts">${ICONS.magic}</button>
                </div>`;
        footerHTML = `
                <div style="display: flex; gap: 8px;">
                    <button class="icon-btn" id="btn-settings" title="Settings">${ICONS.settings}</button>
                    <button class="icon-btn" id="btn-new-folder" title="New Folder">${ICONS.folder}</button>
                </div>
                <button class="btn-new" id="btn-new-root">${ICONS.plus} New Prompt</button>`;
      } else if (this.mode === "move") {
        headerHTML = `<div class="sb-move-title">Select Destination</div>`;
        footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Move Here</button>
                </div>`;
      } else if (this.mode === "export") {
        headerHTML = `
                <div class="sb-move-title">Select Items to Export</div>
                <div class="sb-selection-toggles">
                    <label class="sb-select-all-label">
                        <input type="checkbox" id="cb-select-all" class="sb-checkbox">
                        <span>Select All</span>
                    </label>
                </div>`;
        footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Export</button>
                </div>`;
      } else if (this.mode === "import") {
        headerHTML = `
                <div class="sb-move-title">Select Items to Import</div>
                <div class="sb-selection-toggles">
                    <label class="sb-select-all-label">
                        <input type="checkbox" id="cb-select-all" class="sb-checkbox">
                        <span>Select All</span>
                    </label>
                </div>`;
        footerHTML = `
                <div class="sb-move-actions">
                    <button class="btn-small btn-secondary" id="btn-cancel">Cancel</button>
                    <button class="btn-new" id="btn-confirm">Finalize Import</button>
                </div>`;
      }
      this.container.innerHTML = `
            <div class="sb-header">${headerHTML}</div>
            <div class="magic-dropdown" id="magic-dropdown"></div>
            <div class="sb-list"></div>
            <div class="sb-footer">${footerHTML}</div>
        `;
      this.listContainer = this.container.querySelector(".sb-list");
      this.searchInput = this.container.querySelector(".sb-search-input");
      this.magicDropdown = this.container.querySelector("#magic-dropdown");
    }
    setupListeners() {
      this.container?.querySelector("#btn-cancel")?.addEventListener("click", () => {
        this.shadow.dispatchEvent(new CustomEvent("app-mode-cancel"));
      });
      this.container?.querySelector("#btn-confirm")?.addEventListener("click", async () => {
        if (this.mode === "move" && this.movingPromptId) {
          await this.store.updatePrompt(this.movingPromptId, { parentId: this.targetFolderId });
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Moved" } }));
          this.shadow.dispatchEvent(new CustomEvent("app-mode-cancel"));
        } else if (this.mode === "export") {
          this.shadow.dispatchEvent(new CustomEvent("app-exec-export"));
        } else if (this.mode === "import") {
          this.shadow.dispatchEvent(new CustomEvent("app-exec-import"));
        }
      });
      if (this.mode === "normal") {
        this.searchInput?.addEventListener("input", () => {
          this.store.setFilter(this.searchInput.value);
          this.renderTree();
        });
        this.container?.querySelector("#btn-new-root")?.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("workspace-new-prompt", { detail: { parentId: null } }));
        });
        this.container?.querySelector("#btn-settings")?.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("workspace-settings"));
        });
        this.container?.querySelector("#btn-new-folder")?.addEventListener("click", () => {
          this.shadow.dispatchEvent(new CustomEvent("workspace-open-folder-editor", { detail: { folderId: null, parentId: null } }));
        });
        const magicBtn = this.container?.querySelector("#btn-magic");
        if (magicBtn && this.magicDropdown) {
          Promise.resolve().then(() => (init_magicScripts(), magicScripts_exports)).then(({ MAGIC_SCRIPTS: MAGIC_SCRIPTS2 }) => {
            if (!this.magicDropdown)
              return;
            this.magicDropdown.innerHTML = MAGIC_SCRIPTS2.map(
              (s) => `<div class="magic-item" data-text="${encodeURIComponent(s.text)}"><span>${s.icon}</span> ${s.name}</div>`
            ).join("");
            this.magicDropdown.querySelectorAll(".magic-item").forEach((el) => {
              el.addEventListener("click", () => {
                const scriptText = decodeURIComponent(el.dataset.text || "");
                this.shadow.dispatchEvent(new CustomEvent("app-apply-magic", { detail: { script: scriptText } }));
                this.magicDropdown?.classList.remove("open");
              });
            });
          });
          magicBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.magicDropdown?.classList.toggle("open");
          });
          document.addEventListener("click", () => this.magicDropdown?.classList.remove("open"));
        }
        this.container?.querySelector("#btn-toggle-expansion")?.addEventListener("click", () => {
          const anyExpanded = this.store.folders.some((f) => f.isExpanded);
          this.store.setAllFoldersExpansion(!anyExpanded);
        });
      }
      if (this.mode === "export" || this.mode === "import") {
        const cbAll = this.container?.querySelector("#cb-select-all");
        cbAll?.addEventListener("change", () => {
          this.toggleAllSelection(cbAll.checked);
        });
      }
    }
    areAllFoldersExpanded() {
      if (this.store.folders.length === 0)
        return false;
      return this.store.folders.every((f) => f.isExpanded);
    }
    renderTree() {
      if (!this.listContainer)
        return;
      const expBtn = this.container?.querySelector("#btn-toggle-expansion");
      if (expBtn)
        expBtn.innerHTML = this.store.folders.some((f) => f.isExpanded) ? ICONS.collapseAll : ICONS.expandAll;
      if (this.mode === "export" || this.mode === "import") {
        const cbAll = this.container?.querySelector("#cb-select-all");
        if (cbAll) {
          const set = this.mode === "export" ? this.exportSelectedIds : this.importSelectedIds;
          const totalIds = this.mode === "export" ? this.store.prompts.length + this.store.folders.length : (this.importData?.prompts.length || 0) + (this.importData?.folders.length || 0);
          cbAll.checked = set.size > 0 && set.size === totalIds;
          cbAll.indeterminate = set.size > 0 && set.size < totalIds;
        }
      }
      this.listContainer.innerHTML = "";
      if (this.mode === "import" && this.importData) {
        this.renderImportNode(null, 0);
        return;
      }
      const filter = this.store.filterText.trim().toLowerCase();
      if (filter && this.mode === "normal") {
        const visibleIds = getVisibleIds(this.store.prompts, this.store.folders, filter);
        if (visibleIds.size === 0) {
          this.listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--txt-muted); font-size:12px;">No results found.</div>`;
        } else {
          this.renderSearchNodes(null, 0, visibleIds);
        }
        return;
      }
      this.renderFoldersRecursively(null, 0);
      const rootPrompts = this.store.prompts.filter((p) => p.parentId === null);
      if (rootPrompts.length > 0 || this.mode === "move") {
        const header = document.createElement("div");
        header.className = "uncategorized-header";
        header.textContent = "uncategorized";
        if (this.mode === "move" && this.targetFolderId === null)
          header.classList.add("selected");
        if (this.mode === "move") {
          header.onclick = () => {
            this.targetFolderId = null;
            this.renderTree();
          };
        }
        this.listContainer.appendChild(header);
        rootPrompts.forEach((p) => {
          const row = this.createRow({
            id: p.id,
            name: p.title,
            shortcut: p.quick,
            icon: ICONS.prompt,
            type: "prompt",
            depth: 0,
            isPinned: p.isPinned
          });
          this.listContainer.appendChild(row);
        });
      }
    }
    renderFoldersRecursively(parentId, depth) {
      const folders = this.store.folders.filter((f) => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
      folders.forEach((f) => {
        const isExpanded = f.isExpanded || false;
        const isSelected = this.mode === "move" ? this.targetFolderId === f.id : this.mode === "export" ? this.exportSelectedIds.has(f.id) : false;
        const row = this.createRow({
          id: f.id,
          name: f.name,
          icon: isExpanded ? ICONS.folderOpen : ICONS.folder,
          type: "folder",
          depth,
          isExpanded,
          isSelected
        });
        this.listContainer.appendChild(row);
        if (isExpanded) {
          this.renderFoldersRecursively(f.id, depth + 1);
          const children = this.store.prompts.filter((p) => p.parentId === f.id);
          children.forEach((p) => {
            const pRow = this.createRow({
              id: p.id,
              name: p.title,
              shortcut: p.quick,
              icon: ICONS.prompt,
              type: "prompt",
              depth: depth + 1,
              isPinned: p.isPinned
            });
            this.listContainer.appendChild(pRow);
          });
        }
      });
    }
    renderSearchNodes(parentId, depth, visibleIds) {
      const folders = this.store.folders.filter((f) => f.parentId === parentId);
      const prompts = this.store.prompts.filter((p) => p.parentId === parentId);
      folders.forEach((f) => {
        if (!visibleIds.has(f.id))
          return;
        this.listContainer.appendChild(this.createRow({
          id: f.id,
          name: f.name,
          icon: ICONS.folderOpen,
          type: "folder",
          depth,
          isExpanded: true
        }));
        this.renderSearchNodes(f.id, depth + 1, visibleIds);
      });
      prompts.forEach((p) => {
        if (!visibleIds.has(p.id))
          return;
        this.listContainer.appendChild(this.createRow({
          id: p.id,
          name: p.title,
          shortcut: p.quick,
          icon: ICONS.prompt,
          type: "prompt",
          depth,
          isPinned: p.isPinned
        }));
      });
    }
    createRow(opts) {
      const row = document.createElement("div");
      row.className = "tree-row";
      row.setAttribute("data-type", opts.type);
      if (this.mode === "move" && opts.isSelected)
        row.classList.add("destination");
      if (this.mode === "export" && opts.isSelected)
        row.classList.add("selected");
      if (this.mode === "normal" && this.activeId === opts.id)
        row.classList.add("active");
      row.style.paddingLeft = `${12 + opts.depth * 16}px`;
      if (this.mode === "export") {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "sb-checkbox";
        const isChecked = this.exportSelectedIds.has(opts.id);
        cb.checked = isChecked;
        if (opts.type === "folder" && isChecked) {
          const descendants = this.getAllDescendants(opts.id, this.store.prompts, this.store.folders);
          const allSelected = descendants.every((id) => this.exportSelectedIds.has(id));
          if (descendants.length > 0 && !allSelected) {
            cb.indeterminate = true;
          }
        }
        cb.onclick = (e) => {
          e.stopPropagation();
          this.toggleSelection(this.exportSelectedIds, opts.id, opts.type, cb.checked);
        };
        row.appendChild(cb);
      }
      if (opts.type === "folder") {
        const chev = document.createElement("span");
        chev.innerHTML = opts.isExpanded ? ICONS.chevronDown : ICONS.chevronRight;
        chev.style.marginRight = "6px";
        chev.style.opacity = "0.5";
        chev.onclick = (e) => {
          e.stopPropagation();
          this.store.toggleFolderExpansion(opts.id);
        };
        row.appendChild(chev);
      } else {
        const sp = document.createElement("span");
        sp.style.width = "18px";
        row.appendChild(sp);
      }
      const icon = document.createElement("div");
      icon.className = "row-icon";
      icon.innerHTML = opts.isPinned && this.mode === "normal" ? ICONS.pin : opts.icon;
      if (opts.isPinned && this.mode === "normal")
        icon.style.color = "var(--accent)";
      row.appendChild(icon);
      const lbl = document.createElement("span");
      lbl.className = "row-label";
      lbl.textContent = opts.name;
      row.appendChild(lbl);
      if (opts.type === "prompt" && opts.shortcut) {
        const sh = document.createElement("span");
        sh.className = "row-shortcut";
        sh.textContent = opts.shortcut;
        row.appendChild(sh);
      }
      row.onclick = () => {
        if (opts.type === "folder") {
          if (this.mode === "move") {
            this.targetFolderId = opts.id;
            this.renderTree();
          } else {
            this.store.toggleFolderExpansion(opts.id);
          }
        } else if (opts.type === "prompt") {
          if (this.mode === "normal") {
            this.activeId = opts.id;
            this.renderTree();
            this.shadow.dispatchEvent(new CustomEvent("workspace-open-prompt", { detail: { promptId: opts.id } }));
          } else if (this.mode === "export") {
            this.activeId = opts.id;
            this.listContainer?.querySelectorAll(".tree-row").forEach((r) => r.classList.remove("active"));
            row.classList.add("active");
            this.shadow.dispatchEvent(new CustomEvent("workspace-preview-export", { detail: { promptId: opts.id } }));
          }
        }
      };
      if (this.mode === "normal" && opts.type === "prompt") {
        const acts = document.createElement("div");
        acts.className = "row-actions";
        const kebab = document.createElement("button");
        kebab.className = "icon-btn";
        kebab.innerHTML = ICONS.kebab;
        kebab.onclick = (e) => {
          e.stopPropagation();
          this.showContextMenu(e, opts.id, opts.isPinned);
        };
        acts.appendChild(kebab);
        row.appendChild(acts);
      }
      if (this.mode === "normal" && opts.type === "folder") {
        const acts = document.createElement("div");
        acts.className = "row-actions";
        const kebab = document.createElement("button");
        kebab.className = "icon-btn";
        kebab.innerHTML = ICONS.kebab;
        kebab.onclick = (e) => {
          e.stopPropagation();
          this.showFolderContextMenu(e, opts.id);
        };
        acts.appendChild(kebab);
        row.appendChild(acts);
      }
      return row;
    }
    toggleSelection(set, id, type, checked) {
      const isImport = this.mode === "import";
      const sourcePrompts = isImport ? this.importData.prompts : this.store.prompts;
      const sourceFolders = isImport ? this.importData.folders : this.store.folders;
      if (checked) {
        set.add(id);
        if (type === "folder") {
          const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
          descendants.forEach((dId) => set.add(dId));
        }
        this.selectAncestors(id, sourcePrompts, sourceFolders, set);
      } else {
        set.delete(id);
        if (type === "folder") {
          const descendants = this.getAllDescendants(id, sourcePrompts, sourceFolders);
          descendants.forEach((dId) => set.delete(dId));
        }
      }
      this.renderTree();
    }
    getAllDescendants(folderId, allPrompts, allFolders) {
      let ids = [];
      const childPrompts = allPrompts.filter((p) => p.parentId === folderId);
      const childFolders = allFolders.filter((f) => f.parentId === folderId);
      childPrompts.forEach((p) => ids.push(p.id));
      childFolders.forEach((f) => {
        ids.push(f.id);
        ids = ids.concat(this.getAllDescendants(f.id, allPrompts, allFolders));
      });
      return ids;
    }
    selectAncestors(itemId, allPrompts, allFolders, set) {
      const pObj = allPrompts.find((p) => p.id === itemId);
      const fObj = allFolders.find((f) => f.id === itemId);
      const parentId = pObj ? pObj.parentId : fObj ? fObj.parentId : null;
      if (parentId) {
        set.add(parentId);
        this.selectAncestors(parentId, allPrompts, allFolders, set);
      }
    }
    renderImportNode(parentId, depth) {
      if (!this.importData)
        return;
      const folders = this.importData.folders.filter((f) => f.parentId === parentId);
      const prompts = this.importData.prompts.filter((p) => p.parentId === parentId);
      folders.forEach((f) => {
        const row = this.createImportRow(f.name, "folder", depth, f.id, false);
        this.listContainer.appendChild(row);
        this.renderImportNode(f.id, depth + 1);
      });
      prompts.forEach((p) => {
        const hasConflict = p.conflicts.title || p.conflicts.shortcut;
        const hasBodyMatch = p.conflicts.body;
        const row = this.createImportRow(p.title, "prompt", depth, p.id, hasConflict, hasBodyMatch, p.quick);
        this.listContainer.appendChild(row);
      });
    }
    createImportRow(name, type, depth, id, isConflict, isWarning, shortcut) {
      const row = document.createElement("div");
      row.className = "tree-row";
      row.style.paddingLeft = `${12 + depth * 16}px`;
      if (this.activeId === id)
        row.classList.add("active");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "sb-checkbox";
      const isChecked = this.importSelectedIds.has(id);
      cb.checked = isChecked;
      if (type === "folder" && isChecked && this.importData) {
        const descendants = this.getAllDescendants(id, this.importData.prompts, this.importData.folders);
        const allSelected = descendants.every((dId) => this.importSelectedIds.has(dId));
        if (descendants.length > 0 && !allSelected) {
          cb.indeterminate = true;
        }
      }
      cb.onclick = (e) => {
        e.stopPropagation();
        this.toggleSelection(this.importSelectedIds, id, type, cb.checked);
      };
      row.appendChild(cb);
      const dot = document.createElement("div");
      dot.className = `status-dot ${isConflict ? "red" : isWarning ? "amber" : "green"}`;
      row.appendChild(dot);
      const icon = document.createElement("div");
      icon.className = "row-icon";
      icon.innerHTML = type === "folder" ? ICONS.folder : ICONS.prompt;
      row.appendChild(icon);
      const lbl = document.createElement("span");
      lbl.className = "row-label";
      lbl.textContent = name;
      row.appendChild(lbl);
      if (type === "prompt" && shortcut) {
        const sh = document.createElement("span");
        sh.className = "row-shortcut";
        sh.textContent = shortcut;
        row.appendChild(sh);
      }
      row.onclick = () => {
        if (type === "prompt") {
          this.activeId = id;
          this.renderTree();
          this.shadow.dispatchEvent(new CustomEvent("workspace-resolve-import", { detail: { promptId: id } }));
        }
      };
      return row;
    }
    showContextMenu(e, promptId, isPinned) {
      const existing = this.shadow.querySelector(".ctx-menu");
      if (existing)
        existing.remove();
      const menu = document.createElement("div");
      Object.assign(menu.style, {
        position: "fixed",
        top: `${e.clientY}px`,
        left: `${e.clientX}px`,
        background: "var(--bg-sidebar)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "4px",
        zIndex: "2147483647",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        minWidth: "120px"
      });
      menu.className = "ctx-menu";
      const createItem = (label, onClick, isDanger = false) => {
        const item = document.createElement("div");
        item.textContent = label;
        Object.assign(item.style, {
          padding: "6px 12px",
          fontSize: "13px",
          cursor: "pointer",
          color: isDanger ? "var(--danger)" : "var(--txt-primary)",
          borderRadius: "4px"
        });
        item.onmouseenter = () => item.style.background = "var(--bg-hover)";
        item.onmouseleave = () => item.style.background = "transparent";
        item.onclick = (ev) => {
          ev.stopPropagation();
          onClick();
          menu.remove();
        };
        return item;
      };
      menu.appendChild(createItem(isPinned ? "Unpin" : "Pin", async () => {
        try {
          await this.store.togglePin(promptId);
        } catch (err) {
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: err.message } }));
        }
      }));
      menu.appendChild(createItem("Copy", () => {
        const p = this.store.prompts.find((x) => x.id === promptId);
        if (p) {
          navigator.clipboard.writeText(p.text);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Copied" } }));
        }
      }));
      menu.appendChild(createItem("Move To...", () => this.startMoveMode(promptId)));
      menu.appendChild(createItem("Delete", async () => {
        if (confirm("Delete prompt?")) {
          await this.store.deletePrompt(promptId);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Deleted" } }));
        }
      }, true));
      const close = () => {
        menu.remove();
        document.removeEventListener("click", close);
      };
      setTimeout(() => document.addEventListener("click", close), 0);
      this.shadow.appendChild(menu);
    }
    showFolderContextMenu(e, folderId) {
      const existing = this.shadow.querySelector(".ctx-menu");
      if (existing)
        existing.remove();
      const menu = document.createElement("div");
      Object.assign(menu.style, {
        position: "fixed",
        top: `${e.clientY}px`,
        left: `${e.clientX}px`,
        background: "var(--bg-sidebar)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "4px",
        zIndex: "2147483647",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        minWidth: "120px"
      });
      menu.className = "ctx-menu";
      const createItem = (label, onClick, isDanger = false) => {
        const item = document.createElement("div");
        item.textContent = label;
        Object.assign(item.style, {
          padding: "6px 12px",
          fontSize: "13px",
          cursor: "pointer",
          color: isDanger ? "var(--danger)" : "var(--txt-primary)",
          borderRadius: "4px"
        });
        item.onmouseenter = () => item.style.background = "var(--bg-hover)";
        item.onmouseleave = () => item.style.background = "transparent";
        item.onclick = (ev) => {
          ev.stopPropagation();
          onClick();
          menu.remove();
        };
        return item;
      };
      menu.appendChild(createItem("New Prompt", () => {
        this.shadow.dispatchEvent(new CustomEvent("workspace-new-prompt", { detail: { parentId: folderId } }));
      }));
      menu.appendChild(createItem("New Subfolder", () => {
        this.shadow.dispatchEvent(new CustomEvent("workspace-open-folder-editor", { detail: { folderId: null, parentId: folderId } }));
      }));
      menu.appendChild(createItem("Rename", () => {
        this.shadow.dispatchEvent(new CustomEvent("workspace-open-folder-editor", { detail: { folderId } }));
      }));
      menu.appendChild(createItem("Delete Folder", async () => {
        if (confirm("Delete folder? Prompts and subfolders will move to parent.")) {
          await this.store.deleteFolder(folderId);
          this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Folder deleted" } }));
        }
      }, true));
      const close = () => {
        menu.remove();
        document.removeEventListener("click", close);
      };
      setTimeout(() => document.addEventListener("click", close), 0);
      this.shadow.appendChild(menu);
    }
    toggleAllSelection(checked) {
      const set = this.mode === "export" ? this.exportSelectedIds : this.importSelectedIds;
      set.clear();
      if (checked) {
        const isImport = this.mode === "import";
        const prompts = isImport ? this.importData.prompts : this.store.prompts;
        const folders = isImport ? this.importData.folders : this.store.folders;
        prompts.forEach((p) => set.add(p.id));
        folders.forEach((f) => set.add(f.id));
      }
      this.renderTree();
    }
  };

  // src/content/components/ControlPanel.ts
  var ControlPanel = class extends Component {
    constructor() {
      super(...arguments);
      this.container = null;
    }
    mount(parent) {
      this.container = parent;
      this.render();
    }
    render() {
      if (!this.container)
        return;
      const s = this.store.settings;
      this.container.innerHTML = `
            <div class="ws-header">
                <h2 style="margin:0; font-size:18px;">Control Panel</h2>
            </div>
            
            <div class="cp-container">
                <!-- SECTION 1: APPEARANCE -->
                <div>
                    <div class="cp-section-title">Appearance</div>
                    
                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Dark Mode</div>
                            <div class="cp-desc">Adjust interface contrast</div>
                        </div>
                        <label>
                            <input type="checkbox" id="cp-theme" style="display:none;" ${s.theme === "dark" ? "checked" : ""}>
                            <div class="toggle-switch"></div>
                        </label>
                    </div>

                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Font Size</div>
                            <div class="cp-desc">Base text scaling (${s.fontSizePx}px)</div>
                        </div>
                        <div style="display:flex; gap:4px; align-items:center;">
                            <button class="icon-btn" id="cp-font-dec" style="width:32px; height:32px; font-size:20px; justify-content:center; background:var(--bg-hover);">\u2013</button>
                            <button class="icon-btn" id="cp-font-inc" style="width:32px; height:32px; font-size:20px; justify-content:center; background:var(--bg-hover);">+</button>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: BEHAVIOR -->
                <div>
                    <div class="cp-section-title">Behavior</div>
                    <div class="cp-row">
                        <div>
                            <div class="cp-label">Quick Menu Limit</div>
                            <div class="cp-desc">Max items in ../ shortcut</div>
                        </div>
                        <input type="number" id="cp-limit" value="${s.quickMenuLimit}" min="1" max="6" class="ws-input" style="width:60px;">
                    </div>
                </div>

                <!-- SECTION 3: BACKUP -->
                <div>
                    <div class="cp-section-title">Backup Library</div>
                    <div class="backup-grid">
                        <div class="backup-card" id="cp-export">
                            <div class="backup-icon">\u{1F4E4}</div>
                            <div class="backup-title">Export Data</div>
                        </div>
                        <div class="backup-card" id="cp-import">
                            <div class="backup-icon">\u{1F4E5}</div>
                            <div class="backup-title">Import Data</div>
                        </div>
                    </div>
                    <input type="file" id="cp-file-input" accept=".json" style="display:none;" />
                </div>
            </div>
        `;
      this.setupListeners();
    }
    setupListeners() {
      this.container?.querySelector("#cp-theme")?.addEventListener("change", (e) => {
        const checkbox = e.target;
        const isDark = checkbox.checked;
        if (!isDark) {
          checkbox.checked = true;
          this.shadow.dispatchEvent(new CustomEvent("show-toast", {
            detail: { message: "Light is coming soon" }
          }));
        } else {
          this.store.updateSettings({ theme: "dark" });
        }
      });
      this.container?.querySelector("#cp-font-inc")?.addEventListener("click", () => {
        const current = this.store.settings.fontSizePx;
        this.store.updateSettings({ fontSizePx: current + 1 });
        this.render();
      });
      this.container?.querySelector("#cp-font-dec")?.addEventListener("click", () => {
        const current = this.store.settings.fontSizePx;
        this.store.updateSettings({ fontSizePx: Math.max(10, current - 1) });
        this.render();
      });
      this.container?.querySelector("#cp-limit")?.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        this.store.updateSettings({ quickMenuLimit: Math.min(6, Math.max(1, val)) });
      });
      this.container?.querySelector("#cp-export")?.addEventListener("click", () => {
        this.shadow.dispatchEvent(new CustomEvent("app-start-export"));
      });
      const fileInput = this.container?.querySelector("#cp-file-input");
      this.container?.querySelector("#cp-import")?.addEventListener("click", () => {
        fileInput?.click();
      });
      fileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file)
          return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result);
            this.shadow.dispatchEvent(new CustomEvent("app-start-import", { detail: { data: json } }));
          } catch (err) {
            this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Invalid JSON file" } }));
          }
        };
        reader.readAsText(file);
        fileInput.value = "";
      });
    }
  };

  // src/content/components/Workspace.ts
  var TIPS = [
    "Type `../` followed by Space in any text box to open the Quick Menu.",
    "To add te tool to any site, just click Alt + P",
    "Pin your prompts to access them in Quick Menu.",
    "Right-click text -> right-click -> save to drawer",
    "Export your data regularly to keep a safe backup.",
    "Add special characters in start of your shortcut so they dont interfear with your normal typing"
  ];
  var Workspace = class extends Component {
    constructor(store, shadow) {
      super(store, shadow);
      this.container = null;
      this.currentMode = "empty";
      // Editor State
      this.draftPrompt = {};
      this.draftFolder = {};
      this.isDirty = false;
      this.originalPromptId = null;
      // Null if new
      this.originalFolderId = null;
      this.tipInterval = null;
      this.controlPanel = new ControlPanel(store, shadow);
    }
    mount(parent) {
      this.container = parent.querySelector("#workspace");
      if (!this.container)
        return;
      this.store.subscribe("prompts_updated", () => this.handleExternalUpdate());
      this.renderEmpty();
    }
    openSettings() {
      if (this.checkUnsavedChanges())
        return;
      this.clearTipRotation();
      if (this.currentMode === "settings") {
        this.currentMode = "empty";
        this.renderEmpty();
        return;
      }
      this.currentMode = "settings";
      this.originalPromptId = null;
      this.isDirty = false;
      if (this.container) {
        this.controlPanel.mount(this.container);
      }
    }
    getDraftText() {
      if (this.currentMode !== "editor")
        return null;
      return this.draftPrompt.text || "";
    }
    handleExternalUpdate() {
      if (this.currentMode === "editor" && this.originalPromptId) {
        const exists = this.store.prompts.some((p) => p.id === this.originalPromptId);
        if (!exists) {
          this.isDirty = false;
          this.renderEmpty();
        }
      }
    }
    clearTipRotation() {
      if (this.tipInterval) {
        window.clearInterval(this.tipInterval);
        this.tipInterval = null;
      }
    }
    startTipRotation() {
      const tipEl = this.container?.querySelector("#ws-tip-text");
      if (!tipEl)
        return;
      let index = Math.floor(Math.random() * TIPS.length);
      tipEl.textContent = TIPS[index];
      this.tipInterval = window.setInterval(() => {
        tipEl.style.opacity = "0";
        setTimeout(() => {
          index = (index + 1) % TIPS.length;
          tipEl.textContent = TIPS[index];
          tipEl.style.opacity = "1";
        }, 300);
      }, 5e3);
    }
    openEditor(promptId, parentId = null, initialText = "") {
      if (this.checkUnsavedChanges())
        return;
      this.clearTipRotation();
      this.currentMode = "editor";
      this.originalPromptId = promptId;
      this.originalFolderId = null;
      this.isDirty = !!initialText;
      if (promptId) {
        const p = this.store.prompts.find((x) => x.id === promptId);
        if (p) {
          this.draftPrompt = { ...p };
        }
      } else {
        this.draftPrompt = {
          title: "",
          text: initialText,
          quick: "",
          parentId
        };
      }
      this.renderEditor();
    }
    openFolderEditor(folderId, parentId = null) {
      if (this.checkUnsavedChanges())
        return;
      this.clearTipRotation();
      this.currentMode = "editor";
      this.originalFolderId = folderId;
      this.originalPromptId = null;
      this.isDirty = false;
      if (folderId) {
        const f = this.store.folders.find((x) => x.id === folderId);
        if (f) {
          this.draftFolder = { ...f };
        }
      } else {
        this.draftFolder = {
          name: "",
          parentId
        };
      }
      this.renderFolderEditor();
    }
    renderEmpty() {
      if (!this.container)
        return;
      this.currentMode = "empty";
      this.clearTipRotation();
      this.container.innerHTML = `
            <div class="ws-empty">
                <div style="font-size: 24px; opacity: 0.2; margin-bottom: 16px;">${ICONS.prompt}</div>
                <div style="font-weight: 500; color: var(--txt-secondary);">Select a prompt to edit</div>
                <!-- Tip Container -->
                <div style="margin-top: 40px; max-width: 300px; text-align: center;">
                    <div id="ws-tip-text" style="font-size: 13px; color: var(--txt-muted); line-height: 1.5; min-height: 40px; transition: opacity 0.3s;">
                        ${TIPS[0]}
                    </div>
                </div>
            </div>
        `;
      this.startTipRotation();
    }
    renderEditor() {
      if (!this.container)
        return;
      const p = this.draftPrompt;
      this.container.innerHTML = `
            <!-- HEADER -->
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" id="ws-title" class="ws-title-input" placeholder="Untitled Prompt" value="${p.title || ""}" autocomplete="off" style="flex: 1;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="ws-quick" class="ws-input" placeholder="Shortcut (.code)" value="${p.quick || ""}" style="width: 140px;" autocomplete="off">
                        <select id="ws-folder" class="ws-select">
                            <option value="">(Root)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- BODY -->
            <textarea id="ws-body" class="ws-editor-body" placeholder="Type your prompt here..." spellcheck="false">${p.text || ""}</textarea>

            <!-- FOOTER -->
            <div class="ws-footer">
                <button id="ws-delete" class="btn-ghost" style="margin-right:auto; color:var(--danger); ${!this.originalPromptId ? "display:none" : ""}">Delete</button>
                <button id="ws-cancel" class="btn-ghost">Cancel</button>
                <button id="ws-save" class="btn-primary">Save Changes</button>
            </div>
        `;
      this.populateFolderSelect("#ws-folder", this.draftPrompt.parentId || null);
      this.setupEditorListeners();
      this.focusTitle();
    }
    renderFolderEditor() {
      if (!this.container)
        return;
      const f = this.draftFolder;
      this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" id="ws-folder-name" class="ws-title-input" placeholder="Folder Name" value="${f.name || ""}" autocomplete="off" style="flex: 1;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 12px; color: var(--txt-muted);">Location:</span>
                        <select id="ws-folder-parent" class="ws-select">
                            <option value="">(Root)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style="flex: 1; padding: 24px; color: var(--txt-muted); font-size: 13px;">
                Manage your prompts and subfolders within this folder.
            </div>
            <div class="ws-footer">
                <button id="ws-folder-delete" class="btn-ghost" style="margin-right:auto; color:var(--danger); ${!this.originalFolderId ? "display:none" : ""}">Delete Folder</button>
                <button id="ws-folder-cancel" class="btn-ghost">Cancel</button>
                <button id="ws-folder-save" class="btn-primary">Save Folder</button>
            </div>
        `;
      this.populateFolderSelect("#ws-folder-parent", f.parentId || null, this.originalFolderId);
      this.setupFolderEditorListeners();
      this.focusId("#ws-folder-name");
    }
    populateFolderSelect(selector, currentParentId, excludeId = null) {
      const select = this.container?.querySelector(selector);
      if (!select)
        return;
      const addOptions = (parentId, depth) => {
        const children = this.store.folders.filter((f) => f.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
        children.forEach((f) => {
          if (f.id === excludeId)
            return;
          const opt = document.createElement("option");
          opt.value = f.id;
          opt.textContent = `${"\xA0".repeat(depth * 3)}\u{1F4C1} ${f.name}`;
          if (currentParentId === f.id)
            opt.selected = true;
          select.appendChild(opt);
          addOptions(f.id, depth + 1);
        });
      };
      addOptions(null, 0);
    }
    setupEditorListeners() {
      const titleInp = this.container?.querySelector("#ws-title");
      const quickInp = this.container?.querySelector("#ws-quick");
      const bodyInp = this.container?.querySelector("#ws-body");
      const folderInp = this.container?.querySelector("#ws-folder");
      const markDirty = () => {
        this.isDirty = true;
      };
      titleInp.oninput = (e) => {
        this.draftPrompt.title = e.target.value;
        markDirty();
      };
      quickInp.onkeydown = (e) => {
        if (e.key === " ")
          e.preventDefault();
      };
      quickInp.oninput = (e) => {
        const val = e.target.value.replace(/\s/g, "");
        if (val !== e.target.value) {
          e.target.value = val;
        }
        this.draftPrompt.quick = val;
        markDirty();
      };
      bodyInp.oninput = (e) => {
        this.draftPrompt.text = e.target.value;
        markDirty();
      };
      folderInp.onchange = (e) => {
        this.draftPrompt.parentId = e.target.value || null;
        markDirty();
      };
      this.container?.querySelector("#ws-save")?.addEventListener("click", () => this.save());
      this.container?.querySelector("#ws-cancel")?.addEventListener("click", () => {
        if (this.checkUnsavedChanges())
          return;
        this.renderEmpty();
      });
      this.container?.querySelector("#ws-delete")?.addEventListener("click", () => this.delete());
    }
    setupFolderEditorListeners() {
      const nameInp = this.container?.querySelector("#ws-folder-name");
      const parentInp = this.container?.querySelector("#ws-folder-parent");
      const markDirty = () => {
        this.isDirty = true;
      };
      nameInp.oninput = (e) => {
        this.draftFolder.name = e.target.value;
        markDirty();
      };
      parentInp.onchange = (e) => {
        this.draftFolder.parentId = e.target.value || null;
        markDirty();
      };
      this.container?.querySelector("#ws-folder-save")?.addEventListener("click", () => this.saveFolder());
      this.container?.querySelector("#ws-folder-cancel")?.addEventListener("click", () => {
        if (this.checkUnsavedChanges())
          return;
        this.renderEmpty();
      });
      this.container?.querySelector("#ws-folder-delete")?.addEventListener("click", () => this.deleteFolder());
    }
    async save() {
      const title = this.draftPrompt.title?.trim();
      if (!title) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Title is required" } }));
        return;
      }
      try {
        if (this.originalPromptId) {
          await this.store.updatePrompt(this.originalPromptId, this.draftPrompt);
        } else {
          await this.store.addPrompt(
            title,
            this.draftPrompt.text || "",
            this.draftPrompt.quick || "",
            [],
            // Tags removed
            this.draftPrompt.parentId
          );
        }
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Saved" } }));
        this.isDirty = false;
        if (!this.originalPromptId) {
          this.renderEmpty();
        }
      } catch (e) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: e.message } }));
      }
    }
    async saveFolder() {
      const name = this.draftFolder.name?.trim();
      if (!name) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Name is required" } }));
        return;
      }
      try {
        if (this.originalFolderId) {
          await this.store.updateFolder(this.originalFolderId, this.draftFolder);
        } else {
          await this.store.addFolder(name, this.draftFolder.parentId);
        }
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "Saved" } }));
        this.isDirty = false;
        this.renderEmpty();
      } catch (e) {
        this.shadow.dispatchEvent(new CustomEvent("show-toast", { detail: { message: e.message } }));
      }
    }
    async deleteFolder() {
      if (!this.originalFolderId)
        return;
      if (confirm("Delete this folder? Prompts and subfolders will move up.")) {
        await this.store.deleteFolder(this.originalFolderId);
        this.renderEmpty();
      }
    }
    async delete() {
      if (!this.originalPromptId)
        return;
      if (confirm("Delete this prompt?")) {
        await this.store.deletePrompt(this.originalPromptId);
        this.renderEmpty();
      }
    }
    checkUnsavedChanges() {
      if (this.currentMode === "editor" && this.isDirty) {
        if (!confirm("You have unsaved changes. Discard them?")) {
          return true;
        }
      }
      return false;
    }
    focusTitle() {
      this.focusId("#ws-title");
    }
    focusId(selector) {
      setTimeout(() => {
        const el = this.container?.querySelector(selector);
        el?.focus();
      }, 50);
    }
    // --- EXPORT PREVIEW (Read Only Editor) ---
    previewExport(promptId) {
      this.clearTipRotation();
      if (!this.container)
        return;
      const p = this.store.prompts.find((x) => x.id === promptId);
      if (!p)
        return;
      this.currentMode = "empty";
      this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" class="ws-title-input" value="${this.escapeHtml(p.title)}" readonly style="flex: 1;">
                    <input type="text" class="ws-input" value="${p.quick || ""}" readonly style="width: 140px;" placeholder="No shortcut">
                </div>
            </div>
            <textarea class="ws-editor-body" readonly>${this.escapeHtml(p.text)}</textarea>
        `;
    }
    // --- IMPORT RESOLUTION (Editable, Inline Errors) ---
    resolveImport(prompt, onUpdate) {
      this.clearTipRotation();
      if (!this.container)
        return;
      const { title, shortcut, body } = prompt.conflicts;
      this.currentMode = "empty";
      this.container.innerHTML = `
            <div class="ws-header">
                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
                    <input type="text" id="res-title" class="ws-title-input ${title ? "error" : "success"}" value="${this.escapeHtml(prompt.title)}" style="flex: 1;">
                    <input type="text" id="res-quick" class="ws-input ${shortcut ? "error" : prompt.quick ? "success" : ""}" value="${prompt.quick || ""}" placeholder="Shortcut" style="width: 140px;">
                </div>
                <div id="err-title" class="validation-msg error" style="display:${title ? "block" : "none"}">Title already exists</div>
                <div id="err-quick" class="validation-msg error" style="display:${shortcut ? "block" : "none"}">Shortcut taken</div>
                <div id="warn-body" class="validation-msg warning" style="display:${body ? "block" : "none"}">Content matches existing prompt: "${body}"</div>
            </div>
            <textarea class="ws-editor-body" readonly>${this.escapeHtml(prompt.text)}</textarea>
        `;
      const titleInp = this.container.querySelector("#res-title");
      const quickInp = this.container.querySelector("#res-quick");
      const errTitle = this.container.querySelector("#err-title");
      const errQuick = this.container.querySelector("#err-quick");
      const handleInput = () => {
        const cleanQuick = quickInp.value.replace(/\s/g, "");
        if (cleanQuick !== quickInp.value) {
          quickInp.value = cleanQuick;
        }
        prompt.title = titleInp.value;
        prompt.quick = cleanQuick;
        const titleMatch = this.store.prompts.some((p) => p.title.trim().toLowerCase() === prompt.title.trim().toLowerCase());
        const quickMatch = prompt.quick ? this.store.prompts.some((p) => p.quick?.trim().toLowerCase() === prompt.quick.trim().toLowerCase()) : false;
        prompt.conflicts.title = titleMatch;
        prompt.conflicts.shortcut = quickMatch;
        titleInp.className = `ws-title-input ${titleMatch ? "error" : "success"}`;
        errTitle.style.display = titleMatch ? "block" : "none";
        quickInp.className = `ws-input ${quickMatch ? "error" : prompt.quick ? "success" : ""}`;
        errQuick.style.display = quickMatch ? "block" : "none";
        onUpdate(prompt);
      };
      quickInp.onkeydown = (e) => {
        if (e.key === " ")
          e.preventDefault();
      };
      titleInp.addEventListener("input", handleInput);
      quickInp.addEventListener("input", handleInput);
    }
    escapeHtml(text) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
  };

  // src/content/components/App.ts
  var App = class extends Component {
    constructor(store, shadow, host) {
      super(store, shadow);
      this.backdrop = null;
      this.modal = null;
      this.toastEl = null;
      this.toastTimer = null;
      this.host = host;
      this.sidebar = new Sidebar(store, shadow);
      this.workspace = new Workspace(store, shadow);
    }
    mount(parent) {
      this.backdrop = this.shadow.getElementById("backdrop");
      this.modal = this.shadow.getElementById("modal");
      this.toastEl = this.shadow.getElementById("toast");
      if (!this.backdrop || !this.modal) {
        console.error("App: Critical DOM elements missing.");
        return;
      }
      this.setupListeners();
      this.applySettings();
      this.sidebar.mount(this.modal);
      this.workspace.mount(this.modal);
      console.log("App: Components Mounted.");
    }
    // NEW: Apply Store Settings to CSS Variables
    applySettings() {
      const s = this.store.settings;
      this.host.style.setProperty("--font-size", `${s.fontSizePx || 13}px`);
    }
    toggle() {
      if (this.backdrop?.classList.contains("open")) {
        this.close();
      } else {
        this.open();
      }
    }
    // New Open/Close Logic
    open() {
      this.backdrop?.classList.add("open");
      this.host.style.pointerEvents = "auto";
    }
    close() {
      this.backdrop?.classList.remove("open");
      this.host.style.pointerEvents = "none";
    }
    openWithText(text) {
      this.open();
      this.workspace.openEditor(null, null, text);
    }
    destroy() {
      this.host.remove();
      window.__promptManagerInitialized = false;
    }
    setupListeners() {
      this.backdrop?.addEventListener("click", (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && this.backdrop?.classList.contains("open")) {
          ev.preventDefault();
          ev.stopPropagation();
          this.close();
        }
      });
      this.shadow.addEventListener("show-toast", (e) => {
        this.showToast(e.detail.message);
      });
      this.shadow.addEventListener("workspace-open-prompt", (e) => {
        this.workspace.openEditor(e.detail.promptId);
      });
      this.shadow.addEventListener("workspace-open-folder-editor", (e) => {
        this.workspace.openFolderEditor(e.detail.folderId, e.detail.parentId);
      });
      this.shadow.addEventListener("workspace-new-prompt", (e) => {
        this.workspace.openEditor(null, e.detail.parentId);
      });
      this.shadow.addEventListener("workspace-settings", () => {
        this.workspace.openSettings();
      });
      this.store.subscribe("settings_updated", () => {
        this.applySettings();
      });
      this.shadow.addEventListener("app-apply-magic", (e) => {
        const script = e.detail.script;
        const draft = this.workspace.getDraftText();
        let finalOutput = script;
        if (draft && draft.trim()) {
          if (script.includes("[Prompt]:")) {
            finalOutput = script + draft;
          } else {
            finalOutput = script + "\n\n" + draft;
          }
        }
        navigator.clipboard.writeText(finalOutput);
        this.showToast(draft ? "Applied to draft & copied" : "Script copied");
      });
      this.shadow.addEventListener("app-mode-cancel", () => {
        this.sidebar.setNormalMode();
        this.workspace.mount(this.modal);
      });
      this.shadow.addEventListener("app-start-export", () => {
        this.sidebar.startExportMode();
        this.workspace.mount(this.modal);
      });
      this.shadow.addEventListener("workspace-preview-export", (e) => {
        this.workspace.previewExport(e.detail.promptId);
      });
      this.shadow.addEventListener("app-exec-export", () => {
        const pIds = Array.from(this.sidebar.exportSelectedIds).filter((id) => this.store.prompts.some((p) => p.id === id));
        const fIds = Array.from(this.sidebar.exportSelectedIds).filter((id) => this.store.folders.some((f) => f.id === id));
        if (pIds.length === 0 && fIds.length === 0) {
          this.showToast("Nothing selected");
          return;
        }
        const data = this.store.prepareExportData(pIds, fIds);
        this.store.triggerDownload(data);
        this.showToast(`Exported ${pIds.length} prompts`);
        this.sidebar.setNormalMode();
        this.workspace.mount(this.modal);
      });
      this.shadow.addEventListener("app-start-import", (e) => {
        const rawData = e.detail.data;
        try {
          const validated = this.store.validateImportData(rawData);
          this.sidebar.startImportMode(validated);
          this.workspace.mount(this.modal);
        } catch (err) {
          this.showToast(err.message);
        }
      });
      this.shadow.addEventListener("workspace-resolve-import", (e) => {
        const p = this.sidebar.getImportPrompt(e.detail.promptId);
        if (p) {
          this.workspace.resolveImport(p, () => {
            this.sidebar.refreshImportTree();
          });
        }
      });
      this.shadow.addEventListener("app-exec-import", async () => {
        const data = this.sidebar.getImportData();
        const selectedIds = this.sidebar.importSelectedIds;
        if (!data)
          return;
        const promptsToImport = data.prompts.filter((p) => selectedIds.has(p.id));
        const foldersToImport = data.folders.filter((f) => selectedIds.has(f.id));
        if (promptsToImport.length === 0 && foldersToImport.length === 0) {
          this.showToast("Nothing selected");
          return;
        }
        const hasRed = promptsToImport.some((p) => p.conflicts.title || p.conflicts.shortcut);
        if (hasRed) {
          this.showToast("Resolve red conflicts in selected items");
          return;
        }
        await this.store.finalizeImport(promptsToImport, foldersToImport);
        this.showToast("Import Successful");
        this.sidebar.setNormalMode();
        this.workspace.mount(this.modal);
      });
    }
    showToast(msg) {
      if (!this.toastEl)
        return;
      this.toastEl.textContent = msg;
      this.toastEl.classList.add("show");
      if (this.toastTimer)
        clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        if (this.toastEl)
          this.toastEl.classList.remove("show");
        this.toastTimer = null;
      }, 1400);
    }
  };

  // src/content/ui.ts
  async function renderUI(opts) {
    const { host, shadow, prompts, tags, folders, settings } = opts;
    if (!host || !shadow)
      return;
    const store = new Store();
    window.debugStore = store;
    store.prompts = prompts;
    store.tags = tags;
    store.folders = folders || [];
    store.settings = settings;
    const app = new App(store, shadow, host);
    app.mount(host);
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === "TOGGLE_POPUP") {
        app.toggle();
        sendResponse({ ok: true });
      }
      if (msg.type === "OPEN_WITH_TEXT") {
        app.openWithText(msg.text || "");
        sendResponse({ ok: true });
      }
      if (msg.type === "PERMISSION_REMOVED" && msg.pattern) {
        const currentUrl = window.location.href;
        const origin = msg.pattern.replace(/\/\*$/, "");
        if (currentUrl.startsWith(origin)) {
          app.destroy();
        }
      }
      return true;
    });
    console.log("Prompt Manager UI initialized (V2 Architecture)");
  }

  // src/content/utils/CaretLocator.ts
  var CaretLocator = class {
    static getCaretCoords(el) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return this.getInputCoords(el);
      } else {
        return this.getContentEditableCoords(el);
      }
    }
    static getContentEditableCoords(el) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0)
        return { x: 0, y: 0, lineHeight: 20 };
      const range = sel.getRangeAt(0).cloneRange();
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect2 = rects[rects.length - 1];
        return {
          x: rect2.left,
          y: rect2.top,
          lineHeight: rect2.height
        };
      }
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        lineHeight: 20
      };
    }
    static getInputCoords(el) {
      const div = document.createElement("div");
      const copyStyles = window.getComputedStyle(el);
      for (const prop of copyStyles) {
        div.style.setProperty(prop, copyStyles.getPropertyValue(prop));
      }
      Object.assign(div.style, {
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflow: "hidden",
        top: "0",
        left: "0"
      });
      const value = el.value;
      const index = el.selectionStart || 0;
      const textBefore = value.substring(0, index);
      const textAfter = value.substring(index);
      div.textContent = textBefore;
      const span = document.createElement("span");
      span.textContent = textAfter.substring(0, 1) || ".";
      div.appendChild(span);
      document.body.appendChild(div);
      const rect = el.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      const x = rect.left + span.offsetLeft - el.scrollLeft;
      const y = rect.top + span.offsetTop - el.scrollTop;
      const lineHeight = spanRect.height;
      document.body.removeChild(div);
      return { x, y, lineHeight };
    }
  };

  // src/content/components/QuickMenu.ts
  var QuickMenu = class {
    constructor(store, shadow, onSelect) {
      this.prompts = [];
      this.selectedIndex = 0;
      this.store = store;
      this.shadow = shadow;
      this.onSelect = onSelect;
      this.el = document.createElement("div");
      this.setupStyles();
    }
    setupStyles() {
      Object.assign(this.el.style, {
        position: "fixed",
        zIndex: "2147483647",
        background: "var(--bg-panel, #18181b)",
        border: "1px solid var(--border-default, #3f3f46)",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        padding: "4px",
        display: "none",
        flexDirection: "column",
        minWidth: "200px",
        color: "var(--txt-primary, #fafafa)",
        fontFamily: "sans-serif",
        pointerEvents: "auto"
      });
    }
    open(coords) {
      this.prompts = this.store.getRecentPrompts();
      if (this.prompts.length === 0)
        return;
      this.selectedIndex = 0;
      this.render();
      this.shadow.appendChild(this.el);
      this.el.style.display = "flex";
      const menuHeight = this.el.offsetHeight || 160;
      const spaceBelow = window.innerHeight - (coords.y - window.scrollY);
      this.el.style.left = `${coords.x}px`;
      if (spaceBelow < menuHeight + 20) {
        this.el.style.top = `${coords.y - menuHeight - 5}px`;
      } else {
        this.el.style.top = `${coords.y + coords.lineHeight + 5}px`;
      }
    }
    close() {
      this.el.style.display = "none";
      if (this.el.parentNode)
        this.el.parentNode.removeChild(this.el);
    }
    moveSelection(dir) {
      if (dir === "up") {
        this.selectedIndex = (this.selectedIndex - 1 + this.prompts.length) % this.prompts.length;
      } else {
        this.selectedIndex = (this.selectedIndex + 1) % this.prompts.length;
      }
      this.render();
    }
    getSelectedPrompt() {
      return this.prompts[this.selectedIndex];
    }
    render() {
      this.el.innerHTML = "";
      this.prompts.forEach((p, i) => {
        const item = document.createElement("div");
        Object.assign(item.style, {
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          // Highlight if selected
          background: i === this.selectedIndex ? "var(--accent, #3b82f6)" : "transparent",
          color: i === this.selectedIndex ? "#fff" : "inherit",
          transition: "background 0.1s"
        });
        item.onmouseenter = () => {
          this.selectedIndex = i;
          Array.from(this.el.children).forEach((child, idx) => {
            const el = child;
            if (idx === i) {
              el.style.background = "var(--accent, #3b82f6)";
              el.style.color = "#fff";
              const icon = el.querySelector(".pin-icon");
              if (icon)
                icon.style.opacity = "1";
            } else {
              el.style.background = "transparent";
              el.style.color = "inherit";
              const icon = el.querySelector(".pin-icon");
              if (icon)
                icon.style.opacity = "0.7";
            }
          });
        };
        const left = document.createElement("div");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "8px";
        left.style.overflow = "hidden";
        left.style.pointerEvents = "none";
        if (p.isPinned) {
          const pinIcon = document.createElement("span");
          pinIcon.className = "pin-icon";
          pinIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="12" y1="17" x2="12" y2="22"></line></svg>`;
          pinIcon.style.display = "flex";
          pinIcon.style.opacity = i === this.selectedIndex ? "1" : "0.7";
          left.appendChild(pinIcon);
        }
        const title = document.createElement("span");
        title.textContent = p.title;
        title.style.whiteSpace = "nowrap";
        title.style.overflow = "hidden";
        title.style.textOverflow = "ellipsis";
        title.style.maxWidth = "250px";
        left.appendChild(title);
        item.appendChild(left);
        if (p.quick) {
          const sc = document.createElement("span");
          sc.textContent = p.quick;
          sc.style.opacity = "0.5";
          sc.style.fontSize = "10px";
          sc.style.fontFamily = "monospace";
          sc.style.pointerEvents = "none";
          item.appendChild(sc);
        }
        item.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.onSelect(p);
        };
        this.el.appendChild(item);
      });
    }
  };

  // src/content/utils/ClipboardInserter.ts
  var ClipboardInserter = class {
    /**
     * Tries to paste text using the Clipboard API.
     * Strategy: Save user's clip -> Copy new text -> Paste -> Restore user's clip.
     * Returns true if successful, false if the site blocked it.
     */
    static async insert(text) {
      try {
        const activeEl = document.activeElement;
        if (activeEl) {
          activeEl.focus();
        }
        let originalData = "";
        try {
          originalData = await navigator.clipboard.readText();
        } catch (e) {
        }
        await navigator.clipboard.writeText(text);
        const success = document.execCommand("paste");
        if (originalData) {
          setTimeout(() => {
            navigator.clipboard.writeText(originalData).catch(() => {
            });
          }, 50);
        }
        return success;
      } catch (e) {
        console.warn("Clipboard paste failed", e);
        return false;
      }
    }
  };

  // src/content/components/TextExpander.ts
  var SITE_CONFIG = {
    // ChatGPT blocks Async Clipboard (User Token expires). Needs Sync.
    "chatgpt.com": ["NATIVE", "SYNC_CLIPBOARD", "MANUAL"],
    "openai.com": ["NATIVE", "SYNC_CLIPBOARD", "MANUAL"],
    // Claude/Gemini handle Async Clipboard well, but Sync stealing focus confuses them.
    "claude.ai": ["NATIVE", "ASYNC_CLIPBOARD", "MANUAL"],
    "gemini.google.com": ["NATIVE", "ASYNC_CLIPBOARD", "MANUAL"],
    "aistudio.google.com": ["NATIVE", "ASYNC_CLIPBOARD", "MANUAL"],
    // Google Docs blocks native insert heavily. Needs Async Clipboard.
    "docs.google.com": ["ASYNC_CLIPBOARD", "MANUAL"]
  };
  var DEFAULT_STRATEGIES = ["NATIVE", "SYNC_CLIPBOARD", "ASYNC_CLIPBOARD", "MANUAL"];
  var TextExpander = class {
    constructor(store, shadow) {
      this.listening = false;
      this.menuOpen = false;
      this.targetEditor = null;
      this.handledEnter = false;
      this.handleOutsideClick = (ev) => {
        if (this.menuOpen) {
          const path = ev.composedPath?.() || [];
          if (!path.some((el) => el === this.menu.el)) {
            this.closeMenu();
          }
        }
      };
      this.handleKeyUp = (ev) => {
        if (this.handledEnter && ev.key === "Enter") {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          this.handledEnter = false;
        }
      };
      this.handleKeyDown = (ev) => {
        try {
          if (!chrome.runtime?.id)
            throw new Error();
        } catch (e) {
          this.destroy();
          return;
        }
        if (!this.shadow.host.isConnected) {
          this.destroy();
          return;
        }
        const activeEl = document.activeElement;
        if (!activeEl)
          return;
        if (this.menuOpen) {
          if (ev.key === "ArrowDown") {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.menu.moveSelection("down");
            return;
          }
          if (ev.key === "ArrowUp") {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.menu.moveSelection("up");
            return;
          }
          if (ev.key === "Enter" || ev.key === "Tab") {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            if (ev.key === "Enter")
              this.handledEnter = true;
            this.handleSelection(this.menu.getSelectedPrompt());
            return;
          }
          if (ev.key === "Escape") {
            ev.preventDefault();
            this.closeMenu();
            if (this.targetEditor)
              this.targetEditor.focus();
            return;
          }
          if (ev.key === " ") {
            this.closeMenu();
            return;
          }
          if (ev.key.length === 1) {
            this.closeMenu();
            return;
          }
        }
        if (ev.key === " " || ev.code === "Space") {
          const isInput = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";
          const isContentEditable = activeEl.isContentEditable;
          if (!isInput && !isContentEditable)
            return;
          const word = this.getWordBeforeCaret(activeEl);
          if (!word)
            return;
          if (word === "../") {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.openMenu(activeEl);
            return;
          }
          const shortcut = word;
          const match = this.store.prompts.find((p) => p.quick === shortcut);
          if (match) {
            console.log(`[PD] Shortcut detected: ${shortcut}`);
            ev.preventDefault();
            ev.stopImmediatePropagation();
            this.store.recordUsage(match.id);
            this.replaceText(activeEl, word, match.text);
          }
        }
      };
      this.store = store;
      this.shadow = shadow;
      this.menu = new QuickMenu(store, shadow, (p) => this.handleSelection(p));
    }
    mount() {
      if (this.listening)
        return;
      document.addEventListener("keydown", this.handleKeyDown, true);
      document.addEventListener("keyup", this.handleKeyUp, true);
      document.addEventListener("mousedown", this.handleOutsideClick, true);
      this.listening = true;
      console.log("[PD] TextExpander: Mounted");
    }
    destroy() {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      document.removeEventListener("keyup", this.handleKeyUp, true);
      document.removeEventListener("mousedown", this.handleOutsideClick, true);
      this.listening = false;
    }
    openMenu(el) {
      this.targetEditor = el;
      const coords = CaretLocator.getCaretCoords(el);
      this.menu.open(coords);
      this.menuOpen = true;
    }
    closeMenu() {
      this.menu.close();
      this.menuOpen = false;
      this.targetEditor = null;
    }
    handleSelection(p) {
      const el = this.targetEditor || document.activeElement;
      if (el) {
        el.focus();
        setTimeout(() => {
          this.replaceText(el, "../", p.text);
          this.store.recordUsage(p.id);
        }, 10);
      }
      this.closeMenu();
    }
    // --- SMART REPLACEMENT LOGIC ---
    getStrategies() {
      const hostname = window.location.hostname;
      const key = Object.keys(SITE_CONFIG).find((k) => hostname.includes(k));
      if (key) {
        console.log(`[PD] Using site-specific config for: ${key}`);
        return SITE_CONFIG[key];
      }
      return DEFAULT_STRATEGIES;
    }
    async replaceText(el, target, replacement) {
      this.deleteShortcut(el, target);
      el.focus();
      let strategies = this.getStrategies();
      if (replacement.length < 300) {
        strategies = ["NATIVE", ...strategies.filter((s) => s !== "NATIVE")];
      }
      for (const strategy of strategies) {
        console.log(`[PD] Trying Strategy: ${strategy}`);
        let success = false;
        switch (strategy) {
          case "NATIVE":
            success = this.tryNativeInsert(el, replacement);
            break;
          case "SYNC_CLIPBOARD":
            success = this.syncClipboardPaste(replacement, el);
            break;
          case "ASYNC_CLIPBOARD":
            success = await this.tryAsyncClipboard(replacement, el);
            break;
          case "MANUAL":
            this.manualInsertFallback(el, replacement);
            success = true;
            break;
        }
        if (success) {
          if (strategy === "MANUAL" || this.verifyInsertion(el, replacement)) {
            console.log(`[PD] Strategy ${strategy} Succeeded`);
            this.triggerEvents(el);
            return;
          }
        }
        console.warn(`[PD] Strategy ${strategy} Failed or was Blocked.`);
      }
    }
    // --- STRATEGY IMPLEMENTATIONS ---
    tryNativeInsert(el, text) {
      try {
        return document.execCommand("insertText", false, text);
      } catch (e) {
        return false;
      }
    }
    syncClipboardPaste(text, targetEl) {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      try {
        const textArea = document.createElement("textarea");
        Object.assign(textArea.style, { position: "fixed", left: "-9999px", top: "0", opacity: "0" });
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copySuccess = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!copySuccess)
          return false;
        targetEl.focus();
        if (range && selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return document.execCommand("paste");
      } catch (e) {
        targetEl.focus();
        return false;
      }
    }
    async tryAsyncClipboard(text, el) {
      const success = await ClipboardInserter.insert(text);
      el.focus();
      return success;
    }
    manualInsertFallback(el, replacement) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0)
        return;
      const range = sel.getRangeAt(0);
      const textNode = document.createTextNode(replacement);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
      this.triggerEvents(el);
    }
    // --- HELPERS ---
    verifyInsertion(el, text) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const input = el;
        return input.value.includes(text.substring(0, 10));
      }
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode)
        return false;
      const nodeText = sel.anchorNode.textContent || "";
      return nodeText.length > 0;
    }
    deleteShortcut(el, target) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const input = el;
        const start = input.selectionStart || 0;
        const replaceStart = Math.max(0, start - target.length);
        input.setRangeText("", replaceStart, start, "end");
      } else {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0)
          return;
        const range = sel.getRangeAt(0);
        try {
          if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const startOffset = Math.max(0, range.startOffset - target.length);
            range.setStart(range.startContainer, startOffset);
            range.deleteContents();
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            for (let i = 0; i < target.length; i++) {
              document.execCommand("delete");
            }
          }
        } catch (e) {
        }
      }
    }
    triggerEvents(el) {
      const eventTypes = ["input", "change"];
      for (const type of eventTypes) {
        const ev = new Event(type, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
      }
    }
    getWordBeforeCaret(el) {
      try {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          const input = el;
          const cursorPos = input.selectionStart || 0;
          const textBefore = input.value.slice(0, cursorPos);
          if (textBefore.endsWith("../"))
            return "../";
          const match = textBefore.match(/(\S+)$/);
          return match ? match[1] : null;
        } else {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0)
            return null;
          const range = sel.getRangeAt(0).cloneRange();
          if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const lookBack = Math.min(range.startOffset, 50);
            range.setStart(range.startContainer, range.startOffset - lookBack);
            const text = range.toString();
            if (text.endsWith("../"))
              return "../";
            const match = text.match(/(\S+)$/);
            return match ? match[1] : null;
          }
          const anchorNode = sel.anchorNode;
          if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
            const text = anchorNode.textContent || "";
            if (text.endsWith("../"))
              return "../";
            return null;
          }
          return null;
        }
      } catch (e) {
        return null;
      }
    }
  };

  // src/content/main.ts
  var PROMPTS_KEY2 = "promptManager.prompts";
  var SETTINGS_KEY2 = "promptManager.settings";
  var TAGS_KEY2 = "promptManager.tags";
  var FOLDERS_KEY2 = "promptManager.folders";
  var DEFAULT_SETTINGS2 = {
    popupHeightVh: 56,
    popupWidthPx: 340,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePx: 13,
    theme: "dark",
    hotspotPosition: "edge",
    hotspotWidthPx: 24,
    autoCloseOnHover: false,
    quickMenuLimit: 4
  };
  function uid2() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
  }
  async function loadAndInit() {
    let prompts = [];
    let settings = DEFAULT_SETTINGS2;
    let tags = [];
    let folders = [];
    let isFirstInstall = false;
    try {
      const p = await getStorage(PROMPTS_KEY2);
      prompts = Array.isArray(p) ? p : [];
      let needsMigrationSave = false;
      prompts.forEach((prompt) => {
        if (prompt.parentId === void 0) {
          prompt.parentId = null;
          needsMigrationSave = true;
        }
      });
      if (needsMigrationSave) {
        await setStorage({ [PROMPTS_KEY2]: prompts });
        console.log("Legacy prompts migrated to include parentId: null");
      }
    } catch (e) {
      prompts = [];
    }
    try {
      const s = await getStorage(SETTINGS_KEY2);
      settings = s ? s : DEFAULT_SETTINGS2;
    } catch (e) {
      settings = DEFAULT_SETTINGS2;
    }
    try {
      const t = await getStorage(TAGS_KEY2);
      tags = Array.isArray(t) ? t : [];
    } catch (e) {
      tags = [];
    }
    try {
      const f = await getStorage(FOLDERS_KEY2);
      folders = Array.isArray(f) ? f : [];
    } catch (e) {
      folders = [];
    }
    if (prompts.length === 0 && tags.length === 0 && folders.length === 0) {
      isFirstInstall = true;
      tags = DEFAULT_TAGS.map((dt, index) => ({
        id: uid2(),
        name: dt.name,
        color: dt.color,
        order: index
      }));
      folders = DEFAULT_FOLDERS.map((df, index) => ({
        id: uid2(),
        name: df.name,
        parentId: null,
        order: index,
        isExpanded: true
      }));
      prompts = DEFAULT_PROMPTS.map((dp) => {
        const promptTags = [];
        if (dp.tags) {
          for (const tagName of dp.tags) {
            const tag = tags.find((t) => t.name === tagName);
            if (tag)
              promptTags.push(tag.id);
          }
        }
        let parentId = null;
        if (dp.folderName) {
          const folder = folders.find((f) => f.name === dp.folderName);
          if (folder)
            parentId = folder.id;
        }
        return {
          id: uid2(),
          title: dp.title,
          text: dp.text,
          quick: dp.quick,
          tags: promptTags,
          parentId
        };
      });
      try {
        await Promise.all([
          setStorage({ [PROMPTS_KEY2]: prompts }),
          setStorage({ [TAGS_KEY2]: tags }),
          setStorage({ [SETTINGS_KEY2]: settings }),
          setStorage({ [FOLDERS_KEY2]: folders })
        ]);
      } catch (e) {
        console.warn("Failed to save default prompts/tags/folders:", e);
      }
    }
    const { host, shadow } = createOrGetHost();
    if (!host || !shadow)
      return;
    const store = new Store();
    store.prompts = prompts;
    store.tags = tags;
    store.settings = settings;
    store.folders = folders;
    const expander = new TextExpander(store, shadow);
    expander.mount();
    await renderUI({
      host,
      shadow,
      prompts,
      tags,
      settings,
      folders,
      PROMPTS_KEY: PROMPTS_KEY2,
      SETTINGS_KEY: SETTINGS_KEY2,
      TAGS_KEY: TAGS_KEY2,
      FOLDERS_KEY: FOLDERS_KEY2
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadAndInit().catch(console.error), { once: true });
  } else {
    loadAndInit().catch(console.error);
  }
})();
