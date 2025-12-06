export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key.startsWith('on') && typeof val === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), val);
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else {
      (element as any)[key] = val;
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  });
  return element;
}