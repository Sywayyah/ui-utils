import { Directive, effect, input } from '@angular/core';
import { bindReactiveValueToElement } from '../../core/reactive/html/reactive-value-bind';
import { ReactiveValue } from '../../core/reactive/reactive-value';
import { injectCdr, injectHostElem } from '../../core/utils/inject';

@Directive({
  selector: '[appValueBind]',
})
export class ReactiveValueBindDirective<T> {
  private readonly hostElem = injectHostElem<HTMLInputElement>();
  private readonly cdr = injectCdr();
  readonly value = input.required<ReactiveValue<T>>({ alias: 'appValueBind' });

  constructor() {
    effect((onCleanup) => {
      const bindRef = bindReactiveValueToElement(this.hostElem, this.value(), {
        onValueChange: () => this.cdr.markForCheck(),
      });

      onCleanup(() => {
        bindRef.stop();
      });
    });
  }
}
