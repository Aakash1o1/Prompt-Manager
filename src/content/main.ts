// src/content/main.ts
import { createOrGetHost } from './host';
import { renderUI } from './ui';
import { getStorage } from '../lib/storage';

type Prompt = { id: string; title: string; text: string; quick?: string };
type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontFamily: string;
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

const PROMPTS_KEY = 'promptManager.prompts';
const SETTINGS_KEY = 'promptManager.settings';

const DEFAULT_SETTINGS: Settings = {
  popupHeightVh: 50,
  popupWidthPx: 360,
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  theme: 'dark',
  hotspotPosition: 'corner',
  hotspotWidthPx: 28
};

async function loadAndInit() {
  let prompts: Prompt[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  try {
    const p = await getStorage<Prompt[]>(PROMPTS_KEY);
    prompts = Array.isArray(p) ? p : [];
  } catch (e) {
    prompts = [];
  }
  try {
    const s = await getStorage<Settings>(SETTINGS_KEY);
    settings = s ? s : DEFAULT_SETTINGS;
  } catch (e) {
    settings = DEFAULT_SETTINGS;
  }

  const { host, shadow } = createOrGetHost();
  // render main UI
  await renderUI({ host, shadow, prompts, settings, PROMPTS_KEY, SETTINGS_KEY });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadAndInit().catch(console.error), { once: true });
} else {
  loadAndInit().catch(console.error);
}
