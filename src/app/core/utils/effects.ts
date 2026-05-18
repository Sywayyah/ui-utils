import { CreateEffectOptions, effect, EffectRef, signal, Signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

export function subscriptionEffect(
  subFn: () => Subscription | undefined | null,
  options?: CreateEffectOptions,
): EffectRef {
  return effect((onCleanup) => {
    const sub = subFn();
    if (!sub) return;
    onCleanup(() => sub.unsubscribe());
  }, options);
}

export function fromObservableInput<T>(getter: () => Observable<T>, initialValue: T): Signal<T> {
  const valueSignal = signal<T>(initialValue);

  subscriptionEffect(() => getter().subscribe((val) => valueSignal.set(val)));

  return valueSignal;
}

export function nullableSignal<T>(val: T | null = null): WritableSignal<T | null> {
  return signal<T | null>(val);
}
