import { signal, Signal, WritableSignal } from '@angular/core';

export class SignalArray<T> {
  private readonly _items: WritableSignal<T[]>;
  public readonly value: Signal<T[]>;

  constructor(initialValue: T[] = []) {
    this._items = signal<T[]>(initialValue);
    this.value = this._items.asReadonly();
  }

  // signals api
  set(items: T[]): void {
    this._items.set(items);
  }

  get(): T[] {
    return this._items();
  }

  // --- reading ---
  get length(): number {
    return this._items().length;
  }

  at(index: number): T | undefined {
    return this._items()[index];
  }

  // --- adding ---
  push(...items: T[]): void {
    this._items.update((arr) => [...arr, ...items]);
  }

  unshift(...items: T[]): void {
    this._items.update((arr) => [...items, ...arr]);
  }

  insert(index: number, item: T): void {
    this._items.update((arr) => {
      const clone = [...arr];
      clone.splice(index, 0, item);
      return clone;
    });
  }

  // --- deletion ---
  pop(): T | undefined {
    let removed: T | undefined;
    this._items.update((arr) => {
      if (arr.length === 0) return arr;
      const clone = [...arr];
      removed = clone.pop();
      return clone;
    });
    return removed;
  }

  shift(): T | undefined {
    let removed: T | undefined;
    this._items.update((arr) => {
      if (arr.length === 0) return arr;
      const clone = [...arr];
      removed = clone.shift();
      return clone;
    });
    return removed;
  }

  removeAt(index: number): void {
    this._items.update((arr) => arr.filter((_, i) => i !== index));
  }

  removeItem(item: T): void {
    const newItems = [...this._items()];
    const itemIndex = newItems.indexOf(item);

    if (itemIndex !== -1) {
      newItems.splice(itemIndex, 1);
    }

    this._items.set(newItems);
  }

  clear(): void {
    this._items.set([]);
  }

  // utils
  getRandom(): T | undefined {
    const arr = this._items();
    if (arr.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  shuffle(): void {
    this._items.update((arr) => {
      const clone = [...arr];
      for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
      }
      return clone;
    });
  }

  updateAt(index: number, newItem: T): void {
    this._items.update((arr) => arr.map((item, i) => (i === index ? newItem : item)));
  }
}

export function signalArray<T>(initialValue: T[] = []): SignalArray<T> {
  return new SignalArray<T>(initialValue);
}
