// src/lib/storage.ts
// Small promise wrapper around chrome.storage.async for get/set operations.

export async function getStorage<T = any>(key: string): Promise<T | undefined> {
  return new Promise((res, rej) => {
    try {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        } else {
          res(result[key] as T | undefined);
        }
      });
    } catch (e) {
      rej(e);
    }
  });
}

export async function setStorage(obj: Record<string, any>): Promise<void> {
  return new Promise((res, rej) => {
    try {
      chrome.storage.local.set(obj, () => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        } else {
          res();
        }
      });
    } catch (e) {
      rej(e);
    }
  });
}
