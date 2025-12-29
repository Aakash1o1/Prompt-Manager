// src/content/ui.ts
import { Store } from './store';
import { App } from './components/App';

export async function renderUI(opts: {
  host: HTMLElement;
  shadow: ShadowRoot;
  prompts: any[];
  tags: any[];
  folders: any[];
  settings: any;
  PROMPTS_KEY: string;
  SETTINGS_KEY: string;
  TAGS_KEY: string;
  FOLDERS_KEY: string;
}) {
  const { host, shadow, prompts, tags, folders, settings } = opts;

  if (!host || !shadow) return;

  const store = new Store();
  (window as any).debugStore = store; 

  store.prompts = prompts;
  store.tags = tags;
  store.folders = folders || [];
  store.settings = settings;

  // Initialize App
  const app = new App(store, shadow, host);
  app.mount(host); // Pass host, though App looks up internal elements

  // Message Listeners (Keep existing logic)
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'TOGGLE_POPUP') {
      app.toggle();
      sendResponse({ ok: true });
    }
    if (msg.type === 'OPEN_WITH_TEXT') {
      app.openWithText(msg.text || '');
      sendResponse({ ok: true });
    }
    if (msg.type === 'PERMISSION_REMOVED' && msg.pattern) {
      const currentUrl = window.location.href;
      const origin = msg.pattern.replace(/\/\*$/, '');
      if (currentUrl.startsWith(origin)) {
        app.destroy();
      }
    }
    return true;
  });

  console.log('Prompt Manager UI initialized (V2 Architecture)');
}