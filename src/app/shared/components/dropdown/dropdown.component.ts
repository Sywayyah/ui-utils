import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

import {
  Component,
  ElementRef,
  HostListener,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { removeItemCopy } from '../../../core/utils/arrays';
import { injectHostElem } from '../../../core/utils/inject';
import { isNotNullish } from '../../../core/utils/objects';
import type { DropdownOptionComponent } from './dropdown-option.component';

@Component({
  selector: 'app-dropdown',
  imports: [CdkMenuTrigger],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent<T> {
  private readonly hostElem = injectHostElem();

  readonly selectedItem = model<T | null | undefined>();

  readonly optionChanged = output<T>();

  protected readonly options = signal<DropdownOptionComponent<T>[]>([]);

  readonly menuTriggerRef = viewChild.required<CdkMenuTrigger>('menuTrigger');
  readonly optionsRef = viewChild<ElementRef<HTMLElement>>('optionsRef');

  protected readonly menuPosition = [
    new ConnectionPositionPair(
      { originX: 'center', originY: 'bottom' },
      { overlayX: 'center', overlayY: 'top' },
    ),
  ];

  registerOption(option: DropdownOptionComponent<T>): void {
    this.options.update((options) => [...options, option]);
  }

  unregisterOption(option: DropdownOptionComponent<T>): void {
    this.options.update((options) => removeItemCopy(options, option));
  }

  onOpen() {
    const selectedItem = this.selectedItem();

    if (selectedItem) {
      // give a short delay for menu items to appear
      setTimeout(() => {
        const selectedOption = this.options().find((option) => option.value() === selectedItem);
        selectedOption?.focusIntoView();
      }, 0);
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    // simple "click-outside" check
    if (!this.menuTriggerRef().opened) {
      return;
    }

    if (
      ![this.optionsRef()?.nativeElement, this.hostElem]
        .filter(isNotNullish)
        .some((elem) => elem.contains(event.target as HTMLElement))
    ) {
      this.menuTriggerRef().close();
    }
  }
}
