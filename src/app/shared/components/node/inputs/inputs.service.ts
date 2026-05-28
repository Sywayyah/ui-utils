import { Injectable, Type } from '@angular/core';
import {
  BaseEditingContext,
  DefaultEditingContextParams,
} from '../../../../core/nodes/editing-context/context-base';
import { DropdownEditingContext } from '../../../../core/nodes/editing-context/dropdown';
import { ImageFileEditingContext } from '../../../../core/nodes/editing-context/image-file';
import { NestedNodeEditingContext } from '../../../../core/nodes/editing-context/nested-node';
import { NodeRefEditingContext } from '../../../../core/nodes/editing-context/node-ref';
import { PrimitiveEditingContext } from '../../../../core/nodes/editing-context/primitives';
import { InputContextInstance } from '../../../../core/nodes/node-input-context';
import { NodeInputOptions } from '../../../../core/nodes/node-inputs';
import { ReactiveMap } from '../../../../core/reactive/reactive-map';
import {
  ContextBaseComponent,
  DropdownEditingComponent,
  ImageFileEditingComponent,
  NestedNodeEditingComponent,
  NodeRefEditingComponent,
  PrimitiveComponent,
} from './input-components';

@Injectable({ providedIn: 'root' })
export class InputsService {
  readonly regsitry = new ReactiveMap<
    typeof BaseEditingContext<DefaultEditingContextParams>,
    Type<ContextBaseComponent>
  >();

  constructor() {
    this.register(PrimitiveEditingContext, PrimitiveComponent);
    this.register(DropdownEditingContext, DropdownEditingComponent);
    this.register(NodeRefEditingContext, NodeRefEditingComponent);
    this.register(NestedNodeEditingContext, NestedNodeEditingComponent);
    this.register(ImageFileEditingContext, ImageFileEditingComponent);
  }

  register<T extends ContextBaseComponent>(
    type: typeof BaseEditingContext<DefaultEditingContextParams>,
    componentClass: Type<T>,
  ): void {
    this.regsitry.set(type, componentClass);
  }

  getComponentForConfig(
    contextInstance: InputContextInstance<NodeInputOptions<any>>,
  ): Type<ContextBaseComponent> {
    return (
      this.regsitry.getOr((contextInstance.inputConfig.config as any).constructor) ??
      ContextBaseComponent
    );
  }
}
