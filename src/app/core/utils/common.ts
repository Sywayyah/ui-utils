export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollChance(chance: number = 0.5): boolean {
  return Math.random() <= chance;
}
