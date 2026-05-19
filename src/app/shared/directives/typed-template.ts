import { Directive, input } from '@angular/core';

@Directive({ selector: 'ng-template[typedTemplate]' })
export class TypedTemplateDirective<T> {
  readonly typeToken = input.required<T>({ alias: 'typedTemplate' });

  static ngTemplateContextGuard<T>(dir: TypedTemplateDirective<T>, ctx: unknown): ctx is T {
    return true;
  }
}
