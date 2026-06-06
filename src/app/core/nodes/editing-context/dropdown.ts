import { Observable } from 'rxjs';
import { MiniUI } from '../../mini-ui/mini-ui';
import { throwError } from '../../utils/general';
import {
  ContextProperty,
  ContextPropertyConfig,
  SerializedContextProp,
} from '../node-input-context';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';
import { BaseEditingContext, EditingContextDeserializeParams, EditingContextParams } from './context-base';

export interface DropdownParams<Item, Value> {
  readonly items: Item[];
  getValue(params: { readonly item: Item }): Value;
  getItem(params: { readonly value: Value; readonly items: Item[] }): Item;
  getDefaultValue?(items: Item[]): Item | undefined;
  getItemParts(item: Item): MiniUI;
  getTriggerParts(item: Item): MiniUI;
}

export type DropdownContextParams<Item, Value> = EditingContextParams<{
  readonly context: {
    readonly prop: ContextProperty<Item, Value>;
  };
  readonly params: DropdownParams<Item, Value>;
  readonly sType: { readonly val: SerializedContextProp<Value> };
  readonly vType: { readonly item: Item };
}>;

function dropdownPropConfig<Item, Value>(
  params: DropdownParams<Item, Value>,
): ContextPropertyConfig<Item, Value> {
  return {
    deserialize: async ({ sVal }) => {
      return params.getItem({ value: sVal, items: params.items });
    },
    serialize: async ({ val }) => {
      return params.getValue({ item: val });
    },
  };
}

export class DropdownEditingContext<
  T extends DropdownContextParams<any, any>,
> extends BaseEditingContext<T> {
  constructor(params: T['params']) {
    super(params);

    if (!params.items.length) {
      throwError(`Error: creating dropdown editing context without items`, params);
    }
  }

  static create<Item, Value>(
    params: DropdownContextParams<Item, Value>['params'],
  ): DropdownEditingContext<DropdownContextParams<Item, Value>> {
    return new DropdownEditingContext(params);
  }

  override changes(params: { readonly context: T['context'] }): Observable<unknown> {
    return params.context.prop.value.listen();
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      prop: await ContextProperty.createNew({
        initVal: this.params.getDefaultValue?.(this.params.items) ?? this.params.items[0],
        propConfig: dropdownPropConfig(this.params),
        parentNode: params.parentNode,
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return { val: await params.context.prop.serialize({ editor: params.editor }) };
  }

  override async deserialize(params: EditingContextDeserializeParams<T>): Promise<T['context']> {
    return {
      prop: await ContextProperty.deserialize({
        editor: params.editor,
        propConfig: dropdownPropConfig(this.params),
        sProp: params.sVal.val,
        parentNode: params.parentNode,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return { item: params.context.prop.value.getValue() };
  }
}
