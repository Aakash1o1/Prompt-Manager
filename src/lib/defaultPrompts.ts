// src/lib/defaultPrompts.ts
// Default prompts that are automatically installed on first use

export interface DefaultPrompt {
  title: string;
  text: string;
  quick?: string;
  tags?: string[];
}

export interface DefaultTag {
  name: string;
  color: string;
}

export const DEFAULT_TAGS: DefaultTag[] = [
  { name: 'Writing', color: '#FF6B6B' },
  { name: 'Code', color: '#6B9CFF' },
  { name: 'Analysis', color: '#9AE66E' },
  { name: 'Creative', color: '#D39BFF' }
];

export const DEFAULT_PROMPTS: DefaultPrompt[] = [
  {
    title: 'Explain Code',
    quick: 'explain',
    text: 'Please explain this code in simple terms, including what it does, how it works, and any important concepts:',
    tags: ['Code']
  },
  {
    title: 'Improve Writing',
    quick: 'improve',
    text: 'Please improve the following text for clarity, grammar, and readability while maintaining the original meaning:',
    tags: ['Writing']
  },
  {
    title: 'Summarize Content',
    quick: 'summary',
    text: 'Please provide a concise summary of the following content, highlighting the key points:',
    tags: ['Analysis']
  },
  {
    title: 'Creative Brainstorm',
    quick: 'brainstorm',
    text: 'Help me brainstorm creative ideas for the following topic. Provide diverse, innovative suggestions:',
    tags: ['Creative']
  },
  {
    title: 'Debug Code',
    quick: 'debug',
    text: 'Help me debug this code. Identify potential issues and suggest fixes:',
    tags: ['Code']
  },
  {
    title: 'Professional Email',
    quick: 'email',
    text: 'Help me write a professional email for the following situation:',
    tags: ['Writing']
  }
];