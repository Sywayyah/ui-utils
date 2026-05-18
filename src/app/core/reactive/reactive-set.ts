import { ReactiveBase } from './reactive-base';

// mutable for now
export class ReactiveSet<T> extends ReactiveBase<Set<T>> {
  get size(): number {
    return this.getValue().size;
  }

  get length(): number {
    return this.getValue().size;
  }

  constructor(initVal = new Set<T>()) {
    super(initVal);
  }

  add(item: T): void {
    this.update((v) => {
      this.getValue().add(item);

      return v;
    });
  }

  remove(item: T): void {
    this.update((v) => {
      this.getValue().delete(item);

      return v;
    });
  }

  has(item: T): boolean {
    return this.getValue().has(item);
  }

  clear(): void {
    this.setValue(new Set());
  }

  toggle(item: T): boolean {
    if (this.has(item)) {
      this.remove(item);
      return false;
    }

    this.add(item);
    return true;
  }

  getItems(): T[] {
    return [...this.getValue()];
  }
}
