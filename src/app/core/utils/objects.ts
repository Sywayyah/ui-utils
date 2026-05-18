export function isNotNullish<T>(val: T | null | undefined): val is T {
  return val !== undefined && val !== null;
}

export type Entries<T> = {
  [K in keyof Required<T>]: [K, T[K]];
}[keyof T][];

export const getEntries = <T extends object>(obj: T) => Object.entries(obj) as Entries<T>;

export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];
