import { BehaviorSubject, Observable } from 'rxjs';

export class ReactiveBase<T> {
  protected readonly valueSubject$: BehaviorSubject<T>;
  readonly value$: Observable<T>;

  constructor(initVal: T) {
    this.valueSubject$ = new BehaviorSubject(initVal);
    this.value$ = this.valueSubject$.asObservable();
  }

  setValue(val: T): void {
    this.valueSubject$.next(val);
  }

  // i don't like this for list, maybe another base class
  getValue(): T {
    return this.valueSubject$.getValue();
  }

  update(fn: (prev: T) => T): void {
    this.valueSubject$.next(fn(this.valueSubject$.getValue()));
  }

  listen(): Observable<T> {
    return this.valueSubject$;
  }
}
