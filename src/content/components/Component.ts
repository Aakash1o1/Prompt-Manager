import { Store } from '../store';

export abstract class Component {
    protected store: Store;
    protected element: HTMLElement | null = null;
    protected shadow: ShadowRoot;

    constructor(store: Store, shadow: ShadowRoot) {
        this.store = store;
        this.shadow = shadow;
    }

    abstract mount(parent: HTMLElement): void;

    protected el(tag: string, className?: string, text?: string): HTMLElement {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text) e.textContent = text;
        return e;
    }
}
