import { Injectable } from '@angular/core';
import { fromEvent, map } from 'rxjs';

export enum Key {
  tilde = 'Backquote',
}

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  readonly keysStream$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    map((event) => ({
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      key: event.code as Key,
    })),
  );
}
