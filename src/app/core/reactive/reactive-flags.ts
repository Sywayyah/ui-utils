import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

// could be 2 classes, reactive/plain
export class ReactiveFlags<T extends number = number> {
  private readonly flagsSubject$: BehaviorSubject<number>;

  constructor(initialFlags = 0) {
    this.flagsSubject$ = new BehaviorSubject(initialFlags);
  }

  static combine<T extends number>(...flags: T[]): number {
    let mask = 0;

    for (let i = 0; i < flags.length; i++) {
      mask |= flags[i];
    }

    return mask;
  }

  setFlag(flag: T, enabled: boolean): void {
    const prev = this.flagsSubject$.getValue();
    const next = enabled ? prev | flag : prev & ~flag;

    if (prev !== next) {
      this.flagsSubject$.next(next);
    }
  }

  toggleFlag(flag: T): void {
    this.setFlag(flag, !this.isFlagEnabled(flag));
  }

  enableGroup(mask: number): void {
    const prev = this.flagsSubject$.getValue();
    const next = prev | mask;
    if (prev !== next) {
      this.flagsSubject$.next(next);
    }
  }

  disableGroup(mask: number): void {
    const prev = this.flagsSubject$.getValue();
    const next = prev & ~mask;
    if (prev !== next) {
      this.flagsSubject$.next(next);
    }
  }

  resetAll(): void {
    if (this.flagsSubject$.getValue() === 0) return;
    this.flagsSubject$.next(0);
  }

  getFlags(): T {
    return this.flagsSubject$.getValue() as T;
  }

  hasAny(mask: number): boolean {
    return (this.getFlags() & mask) !== 0;
  }

  hasAll(mask: number): boolean {
    return (this.getFlags() & mask) === mask;
  }

  isFlagEnabled(flag: T): boolean {
    return (this.flagsSubject$.getValue() & flag) !== 0;
  }

  listen(): Observable<number> {
    return this.flagsSubject$.asObservable();
  }

  listenIsFlagEnabled(flag: T): Observable<boolean> {
    return this.flagsSubject$.pipe(
      map((flags) => (flags & flag) !== 0),
      distinctUntilChanged(),
    );
  }

  listenHasAll(mask: number): Observable<boolean> {
    return this.flagsSubject$.pipe(
      map((current) => (current & mask) === mask),
      distinctUntilChanged(),
    );
  }
}
