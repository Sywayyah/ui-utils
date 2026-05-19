import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  ElementRef,
  input,
  Signal,
  viewChildren,
} from '@angular/core';
import { subscriptionEffect } from '../../../../../core/utils/effects';
import { injectHostElem } from '../../../../../core/utils/inject';
import { observeResize } from '../../../../../core/utils/resize';
import { Panel } from '../../core/panel';
import {
  HandlerResizeEvent,
  ResizeHandler,
  ResizeHandlerType,
} from '../resize-handler/resize-handler';

export type PanelsDirection = 'row' | 'column';

class PanelEntry {
  constructor(
    readonly panel: Panel,
    readonly elem: HTMLElement,
  ) {}

  getAvailableWidth(): number {
    return this.panel.width() - this.panel.minWidth();
  }

  getAvailableHeight(): number {
    return this.panel.height() - this.panel.minHeight();
  }
}

interface ResizablePanel {
  readonly panel: PanelEntry;
  quota: number;
  readonly maxQuota: number;
}

class ResizablePanelsGroup {
  readonly resizablePanels: ResizablePanel[];

  constructor(readonly panels: PanelEntry[]) {
    this.resizablePanels = panels.map((panel) => ({ panel, quota: 1, maxQuota: 1 }));
  }

  getAvailableWidth(): number {
    return this.resizablePanels.reduce((acc, next) => acc + next.panel.getAvailableWidth(), 0);
  }

  addWidth(width: number): void {
    for (let i = 0; i < width; i++) {
      [...this.resizablePanels]
        .reverse()
        .at(0)
        ?.panel.panel.width.update((w) => ++w);
    }
  }

  removeWidth(width: number): void {
    for (let i = 0; i < width; i++) {
      const freeWidthPanel = [...this.resizablePanels]
        .reverse()
        .find((panel) => panel.panel.getAvailableWidth() > 0);
      freeWidthPanel?.panel.panel.width.update((w) => --w);
    }
  }

  addHeight(height: number): void {}
  removeHeight(height: number): void {}
}

@Component({
  selector: 'app-layout-panels',
  imports: [ResizeHandler, NgTemplateOutlet],
  templateUrl: './layout-panels.html',
  styleUrl: './layout-panels.scss',
  host: {
    '[class]': 'direction()',
  },
})
export class LayoutPanels {
  private readonly hostElem = injectHostElem();

  readonly direction = input<PanelsDirection>('row');

  protected readonly resizeType: Signal<ResizeHandlerType> = computed(() =>
    this.direction() === 'column' ? 'horizontal' : 'vertical',
  );

  readonly panels = contentChildren(Panel);
  readonly panelElems = viewChildren<ElementRef<HTMLElement>>('panelElem');

  constructor() {
    subscriptionEffect(() => {
      const panels = this.panels();

      return observeResize(this.hostElem).subscribe((event) => {
        const hostWidth = event.offsetWidth;
        if (this.direction() === 'row') {
          panels.forEach((panel) => panel.height.set(event.offsetHeight));

          const combinedWidth = panels.reduce((acc, next) => acc + next.width(), 0);

          if (combinedWidth < hostWidth) {
            const fillerPanel = panels.find((panel) => panel.filler());
            fillerPanel?.width.set(fillerPanel.width() + hostWidth - combinedWidth);
          }
        }
      });
    });
  }

  onPanelResize(event: HandlerResizeEvent, panel: Panel, elem: HTMLElement, index: number): void {
    const panelIndex = index + 1;
    console.log(event);
    const panels = this.getPanels();

    const panelsBeforeGroup = new ResizablePanelsGroup(panels.slice(0, panelIndex));
    const panelsAfterGroup = new ResizablePanelsGroup(panels.slice(panelIndex));

    if (this.direction() === 'row') {
      const width = Math.abs(event.xMovement);

      if (event.xDirection === 'left') {
        if (panelsBeforeGroup.getAvailableWidth() <= 0) return;
        panelsBeforeGroup.removeWidth(width);
        panelsAfterGroup.addWidth(width);
      } else {
        if (panelsAfterGroup.getAvailableWidth() <= 0) return;
        panelsAfterGroup.removeWidth(width);
        panelsBeforeGroup.addWidth(width);
      }
    } else {
      const height = Math.abs(event.yMovement);

      if (event.yDirection === 'up') {
        panelsBeforeGroup.removeHeight(height);
        panelsAfterGroup.addHeight(height);
      } else {
        panelsAfterGroup.removeHeight(height);
        panelsBeforeGroup.addHeight(height);
      }
    }
  }

  private getPanels(): PanelEntry[] {
    return this.panels().map(
      (panel, i) => new PanelEntry(panel, this.panelElems().at(i)!.nativeElement),
    );
  }
}
