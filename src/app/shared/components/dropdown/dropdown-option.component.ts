import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { injectHostElem } from '../../../core/utils/inject';
import { DropdownComponent } from './dropdown.component';

@Component({
  selector: 'app-dropdown-option',
  template: `<ng-content />`,
  styles: `
    :host {
      cursor: pointer;
      padding: 4px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }

      &.selected {
        background: rgba(254, 158, 40, 0.74);
      }
    }
  `,
  host: {
    '[class.selected]': 'isSelected()',
    '(click)': 'selected()',
  },
})
export class DropdownOptionComponent<T> {
  readonly hostElem = injectHostElem();
  readonly dropdownRef = inject(DropdownComponent<T>);

  readonly value = input.required<T>();

  readonly isSelected = computed(() => this.value() === this.dropdownRef.selectedItem());

  constructor() {
    this.dropdownRef.registerOption(this);

    inject(DestroyRef).onDestroy(() => this.dropdownRef.unregisterOption(this));
  }

  selected(): void {
    this.dropdownRef.selectedItem.set(this.value());
    this.dropdownRef.menuTriggerRef().close();
    this.dropdownRef.optionChanged.emit(this.value());
  }

  focusIntoView(): void {
    this.hostElem.scrollIntoView({ block: 'center' });
  }
}
