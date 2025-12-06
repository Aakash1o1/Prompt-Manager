// src/lib/permissions.ts

export async function getAllowedOrigins(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.permissions.getAll((permissions) => {
      resolve(permissions.origins || []);
    });
  });
}

export async function requestPermission(pattern: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      chrome.permissions.request({ origins: [pattern] }, (granted) => {
        if (chrome.runtime.lastError) {
          console.error('Permission request error', chrome.runtime.lastError);
          resolve(false);
          return;
        }
        resolve(Boolean(granted));
      });
    } catch (e) {
      console.error('permissions.request threw', e);
      resolve(false);
    }
  });
}

export async function removePermission(pattern: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.permissions.remove({ origins: [pattern] }, (removed) => {
       if (chrome.runtime.lastError) {
         console.error('Permission remove error', chrome.runtime.lastError);
       }
       resolve(Boolean(removed));
    });
  });
}

export function normalizePattern(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (s.endsWith('/*')) {
      try {
        const candidate = s.replace(/\*.*$/, '');
        const u = new URL(candidate);
        if (!u.hostname) return '';
        return `${u.protocol}//${u.hostname}/*`;
      } catch { }
  }
  try {
    let candidate = s;
    if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
    const u = new URL(candidate);
    if (!u.hostname) return '';
    return `${u.protocol}//${u.hostname}/*`;
  } catch {
    return '';
  }
}