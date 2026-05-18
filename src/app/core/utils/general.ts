export function getCountValue(valA: number, valB: number, defaultVal = 0): string {
  if (typeof valA !== 'number' || typeof valB !== 'number') return `${defaultVal}`;

  const count = valA === valB ? `${valA}` : `${valA},${valB}`;

  return count;
}

export function assertValue<T>(val: T | null | undefined, ...msg: unknown[]): T {
  if (val === null || val === undefined) {
    console.error(`Asserted value is nullish: `, ...msg);
    throw new Error(`Asserted value is nullish`);
  }
  return val;
}

export function throwError(msg: string, ...data: unknown[]): never {
  console.error(msg, ...data);
  throw new Error(msg);
}
