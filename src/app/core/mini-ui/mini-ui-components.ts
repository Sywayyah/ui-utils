import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MiniUIBaseElement, MiniUIElem, MiniUIImage, MiniUIText } from './mini-ui';

@Component({ template: `Unknown Element`, changeDetection: ChangeDetectionStrategy.OnPush })
export class MiniUIBaseComponent<T extends MiniUIBaseElement<unknown>> {
  readonly elem = input.required<MiniUIElem<T>>();
}

@Component({
  template: `<span>{{ elem().elem.params }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class MiniUITextComponent extends MiniUIBaseComponent<MiniUIText> {}

@Component({
  template: `<img [src]="elem().elem.params.src" alt="" [style]="elem().styles" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class MiniUIImageComponent extends MiniUIBaseComponent<MiniUIImage> {}
