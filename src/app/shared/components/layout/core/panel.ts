import { Directive, effect, inject, input, model, TemplateRef, untracked } from '@angular/core';

@Directive({
  selector: '[appPanel]',
})
export class Panel {
  readonly templateRef = inject(TemplateRef);

  readonly id = input<string>('', { alias: 'appPanel' });

  readonly width = model(100, { alias: 'appPanelWidth' });
  readonly height = model(100, { alias: 'appPanelHeight' });

  readonly minWidth = model(100, { alias: 'appPanelMinWidth' });
  readonly minHeight = model(100, { alias: 'appPanelMinHeight' });

  readonly filler = input(false, { alias: 'appPanelFiller' });

  constructor() {
    effect(() => {
      const minWidth = this.minWidth();

      untracked(() => {
        const w = this.width();
        if (w < minWidth) {
          this.width.set(minWidth);
        }
      });
    });
  }
}
