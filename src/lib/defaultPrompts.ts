// src/lib/defaultPrompts.ts
// Default prompts that are automatically installed on first use

export interface DefaultPrompt {
  title: string;
  text: string;
  quick?: string;
  tags?: string[];
  folderName?: string; // NEW: Support for placing default prompts in folders
}

export interface DefaultTag {
  name: string;
  color: string;
}

export interface DefaultFolder {
  name: string;
}

export const DEFAULT_TAGS: DefaultTag[] = [
  { name: 'Writing', color: '#FF6B6B' },
  { name: 'Code', color: '#6B9CFF' },
  { name: 'Analysis', color: '#9AE66E' },
  { name: 'Creative', color: '#D39BFF' }
];

export const DEFAULT_FOLDERS: DefaultFolder[] = [
  { name: 'Organize prompts in folders' }
];

export const DEFAULT_PROMPTS: DefaultPrompt[] = [
  {
    title: 'Type "expand" in your text bar',
    quick: 'expand',
    text: '1. Paste any prompt just by its shortcut\n2. To give access to any site, just press Alt + P there\n3. Organize prompts in folders',
    folderName: 'Organize prompts in folders'
  }
];