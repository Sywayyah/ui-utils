import {
  Component,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, switchMap, takeUntil, tap } from 'rxjs';
import { fromObservableInput, subscriptionEffect } from '../../../../../core/utils/effects';
import { injectHostElem } from '../../../../../core/utils/inject';
import { Icon } from '../../../../components/icon/icon';
import { WindowPanel } from '../../core/layouts';
import { ResizeService } from '../../core/resize.service';
import { WindowPanelsService } from '../../core/window-panels.service';
import { ResizeHandler } from '../resize-handler/resize-handler';

@Component({
  selector: 'app-layout-window-panel',
  imports: [ResizeHandler, Icon],
  templateUrl: './layout-window-panel.html',
  styleUrl: './layout-window-panel.scss',
  host: {
    '[style.width.px]': 'width()',
    '[style.height.px]': 'height()',
    '[style.top.px]': 'top()',
    '[style.right.px]': 'right()',
    '[style.bottom.px]': 'bottom()',
    '[style.left.px]': 'left()',
    '[style.zIndex]': 'order()',
    '[style.minWidth.px]': 'minWidth()',
    '[style.minHeight.px]': 'minHeight()',
    '(mousedown)': 'panelClicked()',
    '[class.dragging]': 'dragging()',
  },
  providers: [ResizeService],
})
export class LayoutWindowPanel {
  private readonly resizeSerivce = inject(ResizeService);
  private readonly windowPanelsService = inject(WindowPanelsService);
  private readonly hostElem = injectHostElem();

  readonly panel = input.required<WindowPanel>();

  readonly width = fromObservableInput(() => this.panel().width.value$, 100);
  readonly height = fromObservableInput(() => this.panel().height.value$, 100);

  readonly top = fromObservableInput(() => this.panel().top.value$, 0);
  readonly right = fromObservableInput(() => this.panel().right.value$, 0);
  readonly bottom = fromObservableInput(() => this.panel().bottom.value$, 0);
  readonly left = fromObservableInput(() => this.panel().left.value$, 0);
  readonly order = fromObservableInput(() => this.panel().order.value$, 0);
  readonly minWidth = fromObservableInput(() => this.panel().minWidth.value$, 0);
  readonly minHeight = fromObservableInput(() => this.panel().minHeight.value$, 0);

  readonly dragging = signal(false);

  readonly template = contentChild(TemplateRef);
  readonly headerElem = viewChild.required<ElementRef<HTMLElement>>('header');

  constructor() {
    effect(() => {
      this.windowPanelsService.panels.push(this.panel());

      this.panel().order.setValue(this.windowPanelsService.panels.length);

      return () => this.windowPanelsService.panels.remove(this.panel());
    });

    this.resizeSerivce.click$.pipe(takeUntilDestroyed()).subscribe((data) => {
      const panel = this.panel();
      const rect = this.hostElem.getBoundingClientRect();
      const { right, left, top, bottom } = rect;

      const distanceToRight = document.documentElement.clientWidth - right;
      const distanceToBottom = document.documentElement.clientHeight - bottom;

      if (data.vertSide === 'left') {
        panel.left.setValue(null);
        panel.right.setValue(distanceToRight);
      }
      if (data.vertSide === 'right') {
        panel.left.setValue(left);
        panel.right.setValue(null);
      }
      if (data.horSide === 'top') {
        panel.top.setValue(null);
        panel.bottom.setValue(distanceToBottom);
      }
      if (data.horSide === 'bottom') {
        panel.top.setValue(top);
        panel.bottom.setValue(null);
      }
    });

    this.resizeSerivce.resizeSubject$.pipe(takeUntilDestroyed()).subscribe((data) => {
      const panel = this.panel();

      if (data.vertSide === 'left') {
        panel.width.update((w) => w - data.movementData.xMovement);
      }
      if (data.vertSide === 'right') {
        panel.width.update((w) => w + data.movementData.xMovement);
      }
      if (data.horSide === 'top') {
        panel.height.update((y) => y - data.movementData.yMovement);
      }
      if (data.horSide === 'bottom') {
        panel.height.update((y) => y + data.movementData.yMovement);
      }

      panel.updateDimensions();
    });

    subscriptionEffect(() => {
      const headerElem = this.headerElem().nativeElement;

      return fromEvent<MouseEvent>(headerElem, 'mousedown')
        .pipe(
          switchMap(() => {
            this.dragging.set(true);
            this.resetPositioningToTopLeft();
            return fromEvent<MouseEvent>(document, 'mousemove').pipe(
              tap((mousemove) => {
                this.panel().left.update((x) => (x ?? 0) + mousemove.movementX);
                this.panel().top.update((y) => (y ?? 0) + mousemove.movementY);
              }),
              takeUntil(
                fromEvent(document, 'mouseup').pipe(
                  tap(() => {
                    this.resetPositioningToTopLeft();
                    this.dragging.set(false);
                  }),
                ),
              ),
            );
          }),
        )
        .subscribe(() => {});
    });
  }

  protected panelClicked(): void {
    this.panel().order.setValue(this.windowPanelsService.getHighestOrder() + 1);
  }

  private resetPositioningToTopLeft(): void {
    const rect = this.hostElem.getBoundingClientRect();
    const { left, top } = rect;

    const panel = this.panel();

    panel.left.setValue(left);
    panel.top.setValue(top);
    panel.bottom.setValue(null);
    panel.right.setValue(null);
  }
}
