import { map, Observable } from 'rxjs';
import { assertValue } from '../utils/general';
import { ReactiveBase } from './reactive-base';

export class ReactiveMap<K, V> extends ReactiveBase<Map<K, V>> {
  constructor(initVal = new Map()) {
    super(initVal);
  }

  set(key: K, value: V): void {
    const newMap = this.cloneMap();
    newMap.set(key, value);

    this.setValue(newMap);
  }

  updateEntry(key: K, cb: (val?: V) => V): void {
    const val = this.getOr(key);

    const res = cb(val);

    this.set(key, res);
  }

  remove(key: K): void {
    const newMap = this.cloneMap();
    newMap.delete(key);
    this.setValue(newMap);
  }

  clear(): void {
    this.getValue().clear();
    this.setValue(new Map());
  }

  has(key: K): boolean {
    return this.getValue().has(key);
  }

  get(key: K): V {
    return assertValue(this.getValue().get(key));
  }

  getOr(key: K): V | undefined {
    return this.getValue().get(key) as V | undefined;
  }

  getEntries(): [K, V][] {
    return [...this.getValue().entries()];
  }

  getValues(): V[] {
    return [...this.getValue().values()];
  }

  listenEntries(): Observable<[K, V][]> {
    return this.listen().pipe(map(() => this.getEntries()));
  }

  listenValues(): Observable<V[]> {
    return this.listen().pipe(map(() => this.getValues()));
  }

  private cloneMap(): Map<K, V> {
    return new Map(this.getEntries());
  }
}

export class ObjectTypedMap<T extends object> {
  private readonly map = new Map<keyof T, T[keyof T]>();

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.map.set(key, value);
  }

  get<K extends keyof T>(key: K): T[K] {
    return assertValue(
      this.map.get(key),
      `Failed to get ${String(key)} key from object typed map`,
    ) as T[K];
  }

  getOr<K extends keyof T>(key: K): T[K] | undefined {
    return this.map.get(key) as T[K] | undefined;
  }

  clone(): ObjectTypedMap<T> {
    const newMap = new ObjectTypedMap<T>();
    this.entries().forEach(([key, val]) => newMap.set(key as keyof T, val as T[keyof T]));
    return newMap;
  }

  entries(): [keyof T, T[keyof T]][] {
    return [...this.map.entries()];
  }

  values(): T[keyof T][] {
    return [...this.map.values()];
  }
}

export class ReactiveObjectTypedMap<T extends Record<string, any>> extends ReactiveBase<
  ObjectTypedMap<T>
> {
  constructor(initVal: ObjectTypedMap<T> = new ObjectTypedMap()) {
    super(initVal);
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.update((map) => {
      const newMap = map.clone();
      newMap.set(key, value);
      return newMap;
    });
  }

  get<K extends keyof T>(key: K): T[K] {
    return assertValue(this.getValue().get(key)) as T[K];
  }

  getOr<K extends keyof T, R = undefined>(key: K, or = undefined as R): T[K] | R {
    return (this.getValue().get(key) as T[K] | undefined) ?? or;
  }

  getEntries(): [keyof T, T[keyof T]][] {
    return this.getValue().entries();
  }

  getValues(): T[keyof T][] {
    return this.getValue().values();
  }

  listenEntries(): Observable<[keyof T, T[keyof T]][]> {
    return this.listen().pipe(map((mapValue) => mapValue.entries()));
  }
}
