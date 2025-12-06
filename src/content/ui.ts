// src/content/ui.ts
import { Store } from './store';
import { App } from './components/App';

type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontFamily: string;
  fontSizePx: number;
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: any[];
  tags: any[];
  settings: Settings;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
}) {
  const { host, shadow, prompts, tags, settings } = opts;
  
  // Guard against null host (if createOrGetHost returned null)
  if (!host || !shadow) return;

  // Initialize Store
  const store = new Store();
  store.prompts = prompts;
  store.tags = tags;
  store.settings = settings;

  // Initialize App
  const app = new App(store, shadow, host);
  app.mount(shadow as any);

  // --- RESTORED MESSAGE LISTENER ---
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'TOGGLE_POPUP') {
      app.toggle();
      sendResponse({ ok: true });
    }
    
    if (msg.type === 'PERMISSION_REMOVED' && msg.pattern) {
       // Check if current URL matches the removed pattern
       const currentUrl = window.location.href;
       // Simple check: if pattern is "https://example.com/*", remove "/*" and check startsWith
       const origin = msg.pattern.replace(/\/\*$/, '');
       if (currentUrl.startsWith(origin)) {
           app.destroy();
       }
    }
    // Return true for async response if needed (not strictly needed here but good practice)
    return true; 
  });

  console.log('Prompt Manager UI initialized');
}