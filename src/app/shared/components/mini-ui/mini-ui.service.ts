import { Injectable } from '@angular/core';
import {
  MiniUIBaseElement,
  MiniUIElem,
  MiniUIImage,
  MiniUIText,
} from '../../../core/mini-ui/mini-ui';
import {
  MiniUIBaseComponent,
  MiniUIImageComponent,
  MiniUITextComponent,
} from '../../../core/mini-ui/mini-ui-components';
import { ReactiveMap } from '../../../core/reactive/reactive-map';

@Injectable({ providedIn: 'root' })
export class MiniUIService {
  readonly regsitry = new ReactiveMap<
    typeof MiniUIBaseElement<unknown>,
    typeof MiniUIBaseComponent<MiniUIBaseElement<any>>
  >();

  constructor() {
    this.register(MiniUIText, MiniUITextComponent);
    this.register(MiniUIImage, MiniUIImageComponent);
  }

  register<T>(
    type: typeof MiniUIBaseElement<T>,
    componentClass: typeof MiniUIBaseComponent<MiniUIBaseElement<T>>,
  ): void {
    this.regsitry.set(type, componentClass);
  }

  getComponentForElem(elem: MiniUIElem): typeof MiniUIBaseComponent<MiniUIBaseElement<any>> {
    return this.regsitry.getOr((elem.elem as any).constructor) ?? MiniUIBaseComponent;
  }
}
