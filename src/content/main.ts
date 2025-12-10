// src/content/main.ts
import { createOrGetHost } from './host';
import { renderUI } from './ui';
import { getStorage, setStorage } from '../lib/storage';
import { DEFAULT_PROMPTS, DEFAULT_TAGS } from '../lib/defaultPrompts';
import { TextExpander } from './components/TextExpander'; 
import { Store } from './store'; // --- ADDED IMPORT ---

type Prompt = { id: string; title: string; text: string; quick?: string; tags?: string[] };
type Tag = { id: string; name: string; color: string; order: number };

type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontFamily: string;
  fontSizePx: number; 
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
};

const PROMPTS_KEY = 'promptManager.prompts';
const SETTINGS_KEY = 'promptManager.settings';
const TAGS_KEY = 'promptManager.tags';

const DEFAULT_SETTINGS: Settings = {
  popupHeightVh: 56,
  popupWidthPx: 340,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSizePx: 13,
  theme: 'dark',
  hotspotPosition: 'edge',
  hotspotWidthPx: 24
};

function uid() { return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9); }

async function loadAndInit() {
  let prompts: Prompt[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  let tags: Tag[] = [];
  let isFirstInstall = false;

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

  try {
    const t = await getStorage<Tag[]>(TAGS_KEY);
    tags = Array.isArray(t) ? t : [];
  } catch (e) {
    tags = [];
  }

  // Check if this is first install (no prompts and no tags)
  if (prompts.length === 0 && tags.length === 0) {
    isFirstInstall = true;
    
    // Create default tags
    tags = DEFAULT_TAGS.map((dt, index) => ({
      id: uid(),
      name: dt.name,
      color: dt.color,
      order: index
    }));
    
    // Create default prompts with tag references
    prompts = DEFAULT_PROMPTS.map(dp => {
      const promptTags: string[] = [];
      if (dp.tags) {
        for (const tagName of dp.tags) {
          const tag = tags.find(t => t.name === tagName);
          if (tag) promptTags.push(tag.id);
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
    
    // Save default data
    try {
      await Promise.all([
        setStorage({ [PROMPTS_KEY]: prompts }),
        setStorage({ [TAGS_KEY]: tags }),
        setStorage({ [SETTINGS_KEY]: settings })
      ]);
    } catch (e) {
      console.warn('Failed to save default prompts/tags:', e);
    }
  }

  const { host, shadow } = createOrGetHost();
  if (!host || !shadow) return; 

  // --- Initialize Store ---
  // We initialize the store with the data we already loaded above
  const store = new Store();
  store.prompts = prompts;
  store.tags = tags;
  store.settings = settings;

  // render main UI
  await renderUI({ host, shadow, prompts, tags, settings, PROMPTS_KEY, SETTINGS_KEY, TAGS_KEY });

  // --- NEW CODE: Initialize Text Expander ---
  // The expander works globally on the page
  const expander = new TextExpander(store);
  expander.mount();
  // ------------------------------------------
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadAndInit().catch(console.error), { once: true });
} else {
  loadAndInit().catch(console.error);
}