import { Component, computed, inject, input, output, signal } from '@angular/core';
import { fromEvent, switchMap, takeUntil, tap } from 'rxjs';
import { injectHostElem } from '../../../../../core/utils/inject';
import { ResizeService } from '../../core/resize.service';

export type ResizeHandlerType = 'horizontal' | 'vertical' | 'corner';

export type HanderHorSide = 'top' | 'bottom';
export type HanderVertSide = 'left' | 'right';

// export type

export interface HandlerResizeEvent {
  readonly xDiff: number;
  readonly yDiff: number;
  readonly xMovement: number;
  readonly yMovement: number;
  readonly xDirection: 'none' | 'left' | 'right';
  readonly yDirection: 'none' | 'up' | 'down';
}

@Component({
  selector: 'app-resize-handler',
  imports: [],
  templateUrl: './resize-handler.html',
  styleUrl: './resize-handler.scss',
  host: {
    '[class]': 'hostClass()',
  },
})
export class ResizeHandler {
  private readonly hostElem = injectHostElem();
  private readonly resizeSerivce = inject(ResizeService, { optional: true });

  readonly type = input<ResizeHandlerType>('horizontal');

  readonly horSide = input<HanderHorSide>();
  readonly vertSide = input<HanderVertSide>();

  readonly hostClass = computed(() =>
    [this.type(), this.vertSide(), this.horSide()].filter(Boolean).join(' '),
  );

  readonly resize = output<HandlerResizeEvent>();

  readonly showOverlay = signal(false);

  constructor() {
    fromEvent<MouseEvent>(this.hostElem, 'mousedown')
      .pipe(
        tap(() => this.showOverlay.set(true)),
        switchMap((mousedown) => {
          const handlerData = {
            type: this.type(),
            horSide: this.horSide(),
            vertSide: this.vertSide(),
          };
          this.resizeSerivce?.click$.next(handlerData);
          return fromEvent<MouseEvent>(document, 'mousemove').pipe(
            tap((mousemove) => {
              const movementData: HandlerResizeEvent = {
                xDiff: mousemove.clientX - mousedown.clientX,
                yDiff: mousemove.clientY - mousedown.clientY,
                xMovement: mousemove.movementX,
                yMovement: mousemove.movementY,
                xDirection:
                  mousemove.movementX === 0 ? 'none' : mousemove.movementX > 0 ? 'right' : 'left',
                yDirection:
                  mousemove.movementY === 0 ? 'none' : mousemove.movementY > 0 ? 'down' : 'up',
              };

              this.resizeSerivce?.resizeSubject$.next({
                ...handlerData,
                movementData: movementData,
              });

              this.resize.emit(movementData);
            }),
            takeUntil(fromEvent(document, 'mouseup').pipe(tap(() => this.showOverlay.set(false)))),
          );
        }),
      )
      .subscribe();
  }
}
