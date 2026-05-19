import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import {
  BaseEditingContext,
  DefaultEditingContextParams,
} from '../../../../core/nodes/editing-context/context-base';
import {
  DropdownContextParams,
  DropdownEditingContext,
} from '../../../../core/nodes/editing-context/dropdown';
import {
  ImageFileEditingContext,
  ImageFileParams,
  ImageFileValue,
} from '../../../../core/nodes/editing-context/image-file';
import {
  NestedNodeEditingContext,
  NestedNodeParams,
} from '../../../../core/nodes/editing-context/nested-node';
import {
  NodePickerParams,
  NodeRefEditingContext,
} from '../../../../core/nodes/editing-context/node-ref';
import {
  PrimitiveContextParams,
  PrimitiveEditingContext,
} from '../../../../core/nodes/editing-context/primitives';
import { UINode } from '../../../../core/nodes/node';
import { UINodeConfig } from '../../../../core/nodes/node-config';
import { InputContextInstance } from '../../../../core/nodes/node-input-context';
import { NodeInputOptions } from '../../../../core/nodes/node-inputs';
import { UINodesEditor } from '../../../../core/nodes/nodes-editor';
import { injectDialogOpener } from '../../../../core/utils/dialogs';
import { fromObservableInput } from '../../../../core/utils/effects';
import { ReactiveValueBindDirective } from '../../../directives/reactive-bind';
import { Btn } from '../../btn/btn';
import { DropdownOptionComponent } from '../../dropdown/dropdown-option.component';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { MiniUiComponent } from '../../mini-ui/mini-ui';
import { NodeInputs } from '../node-inputs/node-inputs';
import { NodePickerDialog } from '../node-picker-dialog/node-picker-dialog';

@Component({
  template: 'Component is not recognized',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextBaseComponent<
  T extends BaseEditingContext<DefaultEditingContextParams> =
    BaseEditingContext<DefaultEditingContextParams>,
> {
  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();
  readonly inputParams = input.required<T['params']>();
  readonly context = input.required<InputContextInstance<NodeInputOptions<T['__editingParam']>>>();
}

@Component({
  template: `<input
    [type]="inputParams().inputType"
    [appValueBind]="context().instance.prop.value"
  />`,
  imports: [ReactiveValueBindDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimitiveComponent extends ContextBaseComponent<
  PrimitiveEditingContext<PrimitiveContextParams>
> {}

@Component({
  template: `
    @let selectedItem = context().instance.prop.value.getValue();
    @let params = inputParams();

    <app-dropdown
      [selectedItem]="params.getValue({ item: selectedItem })"
      (optionChanged)="
        context().instance.prop.value.setValue(
          params.getItem({ items: params.items, value: $event })
        )
      "
    >
      <div class="trigger">
        <app-mini-ui [miniUi]="params.getTriggerParts(selectedItem)" />
      </div>

      @for (item of params.items; track $index) {
        <app-dropdown-option [value]="params.getValue({ item })">
          <app-mini-ui [miniUi]="params.getItemParts(item)" />
        </app-dropdown-option>
      }
    </app-dropdown>
  `,
  imports: [DropdownOptionComponent, DropdownComponent, MiniUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownEditingComponent extends ContextBaseComponent<
  DropdownEditingContext<DropdownContextParams<any, any>>
> {}

@Component({
  template: `
    @let params = inputParams();

    <button (click)="openPickerDialog()">
      <app-mini-ui
        [miniUi]="params.resultParts((context().instance.prop.value.value$ | async)!) | async"
      />
    </button>
  `,
  imports: [Btn, AsyncPipe, MiniUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeRefEditingComponent extends ContextBaseComponent<
  NodeRefEditingContext<NodePickerParams>
> {
  private readonly dialogOpener = injectDialogOpener();

  openPickerDialog(): void {
    this.dialogOpener
      .open(NodePickerDialog, {
        data: {
          editor: this.editor(),
          node: this.node(),
          nodePickerParams: this.context().inputConfig.config.params,
        },
      })
      .closed.subscribe((v) => {
        this.context().instance.prop.value.setValue({ node: v?.node ?? null });
      });
  }
}

@Component({
  template: `
    @let nestedNode = context().instance.prop.value.getValue().node;

    @if (nestedNode) {
      <app-node-inputs [node]="nestedNode" [editor]="editor()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [forwardRef(() => NodeInputs)],
})
export class NestedNodeEditingComponent extends ContextBaseComponent<
  NestedNodeEditingContext<UINodeConfig[], NestedNodeParams<UINodeConfig[]>>
> {}

@Component({
  template: `
    <button (click)="imageInput.click()">
      @let img = image();
      @if (img.image) {
        <div class="img">
          {{ img.image.file.name }}
          <img [src]="img.image.objectUrl" alt="" />
        </div>
      } @else {
        No Image
      }
    </button>

    <input #imageInput type="file" accept="image/*" (change)="setImage($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Btn],
  styles: `
    input {
      display: none;
    }

    img {
      min-width: 100px;
      min-height: 100px;
      max-width: 200px;
      max-height: 200px;
    }

    .img {
      display: flex;
      flex-direction: column;
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.186);
    }
  `,
})
export class ImageFileEditingComponent extends ContextBaseComponent<
  ImageFileEditingContext<ImageFileParams>
> {
  readonly image = fromObservableInput(() => this.context().instance.prop.value.value$, {
    image: null,
  });

  setImage(event: Event): void {
    const file = (event?.target as HTMLInputElement)?.files?.[0];

    const prop = this.context().instance.prop;

    const newVal: ImageFileValue = file
      ? { image: { file, objectUrl: URL.createObjectURL(file) } }
      : { image: null };

    prop.setValue(newVal);
  }
}
