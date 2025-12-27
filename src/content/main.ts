// src/content/main.ts
import { createOrGetHost } from './host';
import { renderUI } from './ui';
import { getStorage, setStorage } from '../lib/storage';
import { DEFAULT_PROMPTS, DEFAULT_TAGS, DEFAULT_FOLDERS } from '../lib/defaultPrompts';
import { TextExpander } from './components/TextExpander';
import { Store } from './store';

type Prompt = { id: string; title: string; text: string; quick?: string; tags?: string[]; parentId?: string | null };
type Tag = { id: string; name: string; color: string; order: number };
type Folder = { id: string; name: string; parentId: string | null; order: number; isExpanded?: boolean };

type Settings = {
  popupHeightVh: number;
  popupWidthPx: number;
  fontFamily: string;
  fontSizePx: number;
  theme: 'light' | 'dark';
  hotspotPosition: 'corner' | 'edge';
  hotspotWidthPx: number;
  autoCloseOnHover: boolean;
  quickMenuLimit: number;
};

// Constants
const PROMPTS_KEY = 'promptManager.prompts';
const SETTINGS_KEY = 'promptManager.settings';
const TAGS_KEY = 'promptManager.tags';
const FOLDERS_KEY = 'promptManager.folders';

const DEFAULT_SETTINGS: Settings = {
  popupHeightVh: 56,
  popupWidthPx: 340,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSizePx: 13,
  theme: 'dark',
  hotspotPosition: 'edge',
  hotspotWidthPx: 24,
  autoCloseOnHover: false,
  quickMenuLimit: 4
};

function uid() { return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9); }

async function loadAndInit() {
  // 1. Define variables once
  let prompts: Prompt[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  let tags: Tag[] = [];
  let folders: Folder[] = [];
  let isFirstInstall = false;

  // 2. Load Data
  try {
    const p = await getStorage<Prompt[]>(PROMPTS_KEY);
    prompts = Array.isArray(p) ? p : [];

    // --- LEGACY DATA MIGRATION ---
    // If user has old prompts without parentId, normalize them now.
    let needsMigrationSave = false;
    prompts.forEach(prompt => {
      if (prompt.parentId === undefined) {
        prompt.parentId = null;
        needsMigrationSave = true;
      }
    });

    if (needsMigrationSave) {
      await setStorage({ [PROMPTS_KEY]: prompts });
      console.log('Legacy prompts migrated to include parentId: null');
    }
    // -----------------------------
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

  try {
    const f = await getStorage<Folder[]>(FOLDERS_KEY);
    folders = Array.isArray(f) ? f : [];
  } catch (e) {
    folders = [];
  }

  // 3. First Install Logic
  if (prompts.length === 0 && tags.length === 0 && folders.length === 0) {
    isFirstInstall = true;

    // Create default tags
    tags = DEFAULT_TAGS.map((dt, index) => ({
      id: uid(),
      name: dt.name,
      color: dt.color,
      order: index
    }));

    // Create default folders
    folders = DEFAULT_FOLDERS.map((df, index) => ({
      id: uid(),
      name: df.name,
      parentId: null,
      order: index,
      isExpanded: true
    }));

    // Create default prompts
    prompts = DEFAULT_PROMPTS.map(dp => {
      const promptTags: string[] = [];
      if (dp.tags) {
        for (const tagName of dp.tags) {
          const tag = tags.find(t => t.name === tagName);
          if (tag) promptTags.push(tag.id);
        }
      }

      // Find parent folder ID if specified
      let parentId: string | null = null;
      if (dp.folderName) {
        const folder = folders.find(f => f.name === dp.folderName);
        if (folder) parentId = folder.id;
      }

      return {
        id: uid(),
        title: dp.title,
        text: dp.text,
        quick: dp.quick,
        tags: promptTags,
        parentId: parentId
      };
    });

    // Save default data
    try {
      await Promise.all([
        setStorage({ [PROMPTS_KEY]: prompts }),
        setStorage({ [TAGS_KEY]: tags }),
        setStorage({ [SETTINGS_KEY]: settings }),
        setStorage({ [FOLDERS_KEY]: folders })
      ]);
    } catch (e) {
      console.warn('Failed to save default prompts/tags/folders:', e);
    }
  }

  const { host, shadow } = createOrGetHost();
  if (!host || !shadow) return;

  // 4. Initialize Text Expander (Global)
  // We initialize a temporary store for the expander to work immediately
  const store = new Store();
  store.prompts = prompts;
  store.tags = tags;
  store.settings = settings;
  store.folders = folders;

  const expander = new TextExpander(store, shadow);
  expander.mount();

  // 5. Render UI
  await renderUI({
    host,
    shadow,
    prompts,
    tags,
    settings,
    folders,
    PROMPTS_KEY,
    SETTINGS_KEY,
    TAGS_KEY,
    FOLDERS_KEY
  });
}

// 6. Boot Logic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadAndInit().catch(console.error), { once: true });
} else {
  loadAndInit().catch(console.error);
}