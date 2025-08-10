// src/lib/storage.ts
// Small promise wrappers for chrome.storage.sync

export function getStorage<T = any>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result: Record<string, any>) => {
      resolve(result[key]);
    });
  });
}

export function setStorage(obj: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(obj, () => resolve());
  });
}
