Step 05: Settings UI Update
Objective: Add a control to the Settings page allowing users to define how many items (1–6) appear in the ../ Quick Menu.
Files to Modify:
src/content/components/SettingsModal.ts
Tasks:
1. Update renderUI to include the Slider
Add a new row to the Settings HTML for the Quick Menu limit.
code
TypeScript
// src/content/components/SettingsModal.ts -> inside renderUI method

// Insert this block BEFORE the "Dark theme" toggle row (or grouped with other preferences)

<!-- Quick Menu Limit -->
<div class="settings-row">
    <div style="display:flex; flex-direction:column; gap:2px;">
        <label style="color: var(--txt-secondary); font-size: 13px;">Quick Menu Limit</label>
        <span style="font-size:11px; color:var(--txt-muted);">Max items shown for "../"</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
        <input type="range" id="s-quick-limit" min="1" max="6" step="1" style="width: 80px; cursor: pointer;">
        <span id="s-quick-limit-val" style="font-size: 13px; font-weight: 600; width: 12px; text-align: center;">4</span>
    </div>
</div>
2. Update setupListeners to Handle Slider Input
Add a listener to update the number display in real-time as the user drags the slider.
code
TypeScript
// src/content/components/SettingsModal.ts -> inside setupListeners method

const limitSlider = this.area?.querySelector('#s-quick-limit') as HTMLInputElement;
const limitVal = this.area?.querySelector('#s-quick-limit-val') as HTMLElement;

if (limitSlider && limitVal) {
    limitSlider.addEventListener('input', () => {
        limitVal.textContent = limitSlider.value;
    });
}
3. Update loadSettings to Populate the Slider
Read the current value from the store when opening the modal.
code
TypeScript
// src/content/components/SettingsModal.ts -> inside loadSettings method

const limitSlider = this.area?.querySelector('#s-quick-limit') as HTMLInputElement;
const limitVal = this.area?.querySelector('#s-quick-limit-val') as HTMLElement;
if (limitSlider && limitVal) {
    const val = this.store.settings.quickMenuLimit || 4;
    limitSlider.value = String(val);
    limitVal.textContent = String(val);
}
4. Update save to Persist the Value
Capture the slider value when clicking "Save".
code
TypeScript
// src/content/components/SettingsModal.ts -> inside save method

const limitSlider = this.area?.querySelector('#s-quick-limit') as HTMLInputElement;
if (limitSlider) {
    updates.quickMenuLimit = parseInt(limitSlider.value, 10);
}
