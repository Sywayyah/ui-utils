import { Observable } from 'rxjs';

export function observeResize(
  elem: HTMLElement,
): Observable<{
  readonly entries: ResizeObserverEntry[];
  readonly offsetWidth: number;
  readonly offsetHeight: number;
}> {
  return new Observable((observer) => {
    const resizeObserver = new ResizeObserver((entries) =>
      observer.next({ entries, offsetWidth: elem.offsetWidth, offsetHeight: elem.offsetHeight }),
    );

    resizeObserver.observe(elem);

    return () => resizeObserver.disconnect();
  });
}
