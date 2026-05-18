import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectorRef, DestroyRef, ElementRef, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, takeUntil } from 'rxjs';

export function injectCdr(): ChangeDetectorRef {
  return inject(ChangeDetectorRef);
}

export function injectDialog(): Dialog {
  return inject(Dialog);
}

export function injector(): Injector {
  return inject(Injector);
}

export function injectHostElem<T extends HTMLElement = HTMLElement>(): T {
  return inject(ElementRef).nativeElement as T;
}

export function injectDialogConfig<T>(): { data: T; ref: DialogRef<any, any> } {
  return { data: inject(DIALOG_DATA) as T, ref: inject(DialogRef) };
}

export function onDestroyed(): { until(): <T>(obs: Observable<T>) => Observable<T> } {
  const destroyRef = inject(DestroyRef);

  return {
    until(): <T>(obs: Observable<T>) => Observable<T> {
      return <T>(obs: Observable<T>) => obs.pipe(takeUntilDestroyed(destroyRef));
    },
  };
}
