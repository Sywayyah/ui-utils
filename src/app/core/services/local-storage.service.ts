import { inject, Injectable } from '@angular/core';

const APP_KEY_PREFIX = 'app-';

type DefaultStorageModel = Record<string, unknown>;

export const injectLocalStorage = <T extends DefaultStorageModel>(): LocalStorageService<T> =>
  inject(LocalStorageService<T>);

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService<T extends DefaultStorageModel = DefaultStorageModel> {
  save<K extends keyof T, D extends T[K]>(key: K, value: D): void {
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  remove<K extends keyof T>(key: K): void {
    localStorage.removeItem(this.getKey(key));
  }

  load<K extends keyof T, D extends T[K]>(key: K): D | undefined;
  load<K extends keyof T, D extends T[K]>(key: K, fallbackValue: D): D;
  load<K extends keyof T, D extends T[K]>(key: K, fallbackValue?: D): D | undefined {
    const prevVal = localStorage.getItem(this.getKey(key));

    try {
      return prevVal ? JSON.parse(prevVal) : fallbackValue;
    } catch {
      return fallbackValue as D;
    }
  }

  protected getKey<K extends keyof T>(key: K): string {
    return APP_KEY_PREFIX + (key as string);
  }
}
