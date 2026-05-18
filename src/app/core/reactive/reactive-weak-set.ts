import { ReactiveBase } from './reactive-base';

export class DynamicWeakSet<T extends object> {
  private count = 0;
  private itemsSet = new WeakSet<T>();

  private registry = new FinalizationRegistry(() => {
    this.count--;
    this.handlers?.forEach((handler) => handler.onCleanup());
  });

  // maybe should become 2 classes
  constructor(private readonly handlers?: { onCleanup(): void }[]) {}

  get size(): number {
    return this.count;
  }

  add(item: T): DynamicWeakSet<T> {
    if (!this.itemsSet.has(item)) {
      this.itemsSet.add(item);
      this.registry.register(item, null, item);
      this.count++;
    }
    return this;
  }

  remove(item: T): boolean {
    if (this.itemsSet.has(item)) {
      this.itemsSet.delete(item);
      this.registry.unregister(item);
      this.count--;
      return true;
    }
    return false;
  }

  has(obj: T): boolean {
    return this.itemsSet.has(obj);
  }
}

// mutable for now
export class ReactiveWeakSet<T extends object> extends ReactiveBase<DynamicWeakSet<T>> {
  get size(): number {
    return this.getValue().size;
  }

  get length(): number {
    return this.getValue().size;
  }

  constructor(
    initialValue = new DynamicWeakSet([
      {
        onCleanup: () => {
          this.setValue(this.getValue());
        },
      },
    ]),
  ) {
    super(initialValue);
  }

  add(item: T): void {
    this.setValue(this.getValue().add(item));
  }

  remove(item: T): boolean {
    const itemsSet = this.getValue();
    const res = itemsSet.remove(item);
    this.setValue(itemsSet);
    return res;
  }

  has(item: T): boolean {
    return this.getValue().has(item);
  }
}
