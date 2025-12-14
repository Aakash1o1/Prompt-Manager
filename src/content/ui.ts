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
  autoCloseOnHover: boolean;
};

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: any[];
  tags: any[];
  folders: any[];
  settings: Settings;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
  FOLDERS_KEY: string;
}) {
  const { host, shadow, prompts, tags, folders, settings } = opts;

  // Guard against null host (if createOrGetHost returned null)
  if (!host || !shadow) return;

  // Initialize Store
  const store = new Store();
  (window as any).debugStore = store; // Expose for debugging

  store.prompts = prompts;
  store.tags = tags;
  store.folders = folders || [];
  store.settings = settings;

  // Initialize App
  const app = new App(store, shadow, host);
  app.mount(shadow as any);

  // --- MESSAGE LISTENER ---
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // console.log("Prompt Drawer: Message received", msg); 

    if (msg.type === 'TOGGLE_POPUP') {
      app.toggle();
      sendResponse({ ok: true });
    }

    if (msg.type === 'PERMISSION_REMOVED' && msg.pattern) {
      // Check if current URL matches the removed pattern
      const currentUrl = window.location.href;
      const origin = msg.pattern.replace(/\/\*$/, '');
      if (currentUrl.startsWith(origin)) {
        app.destroy();
      }
    }
    return true;
  });

  console.log('Prompt Manager UI initialized');
}