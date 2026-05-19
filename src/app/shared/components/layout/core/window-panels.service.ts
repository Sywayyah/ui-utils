import { Injectable } from '@angular/core';
import { ReactiveList } from '../../../../core/reactive/reactive-list';
import { WindowPanel } from './layouts';

@Injectable({ providedIn: 'root' })
export class WindowPanelsService {
  readonly panels = new ReactiveList<WindowPanel>();

  getHighestOrder(): number {
    return this.panels.getValue().reduce((highest, panel) => {
      const panelOrder = panel.order.getValue();
      return highest < panelOrder ? panelOrder : highest;
    }, 0);
  }
}
