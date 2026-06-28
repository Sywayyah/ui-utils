import { getRandomInt } from './common';
import { throwError } from './general';

export function splitChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function removeItem<T>(arr: T[], item: T): void {
  const index = arr.indexOf(item);
  if (index === -1) return;
  arr.splice(index, 1);
}

export function removeItemCopy<T>(arr: T[], item: T): T[] {
  const newArr = [...arr];
  const index = newArr.indexOf(item);
  if (index === -1) return newArr;

  newArr.splice(index, 1);

  return newArr;
}

export function removeItemByIndex<T>(arr: T[], index: number): T[] {
  const newArr = [...arr];

  if (index === -1 || index > arr.length - 1) return newArr;

  newArr.splice(index, 1);

  return newArr;
}

export function binarySearch<T>(arr: T[], target: T): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (
      arr[mid] === target ||
      (typeof target === 'string' && (arr[mid] as string).includes(target))
    ) {
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

export function partitionBy<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}

export function insertItem<T>(arr: T[], item: T, index: number): T[] {
  if (index > arr.length - 1) return [...arr, item];
  if (index < 0) return [item, ...arr];

  const newArr = [...arr];
  newArr.splice(index, 0, item);
  return newArr;
}

export function groupByMap<T, R>(arr: T[], mapperFn: (item: T) => R): Map<R, T[]> {
  return arr.reduce((map, nextItem) => {
    const key = mapperFn(nextItem);
    const arr = map.get(key);
    if (arr) {
      arr.push(nextItem);
    } else {
      map.set(key, [nextItem]);
    }
    return map;
  }, new Map<R, T[]>());
}

export function getRandomItem<T>(arr: T[]): T {
  if (!arr.length) throwError('Selecting random item from empty array');

  return arr[getRandomInt(0, arr.length - 1)];
}
