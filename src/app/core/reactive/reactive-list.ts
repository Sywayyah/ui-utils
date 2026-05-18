import { insertItem, removeItemByIndex, removeItemCopy } from '../utils/arrays';
import { assertValue } from '../utils/general';
import { ReactiveBase } from './reactive-base';

// composition? take ReactiveValue as param instead of extending it? this way, ReactiveValue can be extended by other
export class ReactiveList<T> extends ReactiveBase<T[]> {
  get length(): number {
    return this.valueSubject$.getValue().length;
  }

  constructor(initialVal: T[] = []) {
    super(initialVal);
  }

  clear(): void {
    this.setValue([]);
  }

  includes(item: T): boolean {
    return this.getValue().includes(item);
  }

  indexOf(item: T): number {
    return this.getValue().indexOf(item);
  }

  at(index: number): T | undefined {
    return this.valueSubject$.getValue().at(index);
  }

  atIndex(index: number): T {
    return assertValue(this.valueSubject$.getValue().at(index), `No item found at index ${index}`);
  }

  push(...val: T[]): ReactiveList<T> {
    this.update((prev) => [...prev, ...val]);
    return this;
  }

  unshift(val: T): void {
    this.update((prev) => [val, ...prev]);
  }

  removeByIndex(index: number): void {
    this.update((prev) => removeItemByIndex(prev, index));
  }

  remove(val: T): ReactiveList<T> {
    this.update((prev) => removeItemCopy(prev, val));
    return this;
  }

  insertItem(item: T, index: number): void {
    this.update((prev) => insertItem(prev, item, index));
  }

  moveFromToIndex(initialIndex: number, newIndex: number): void {
    this.update((prev) => {
      if (newIndex < 0 || initialIndex >= prev.length) return prev;

      const newArr = [...prev];
      const [element] = newArr.splice(initialIndex, 1);
      newArr.splice(newIndex, 0, element);
      return newArr;
    });
  }

  moveItem(item: T, offset: number): void {
    const itemIndex = this.getValue().indexOf(item);
    this.moveFromToIndex(itemIndex, itemIndex + offset);
  }
}
