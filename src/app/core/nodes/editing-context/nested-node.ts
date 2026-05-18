import { Observable } from 'rxjs';
import { UINode, UINodeFlags } from '../node';
import { UINodeConfig } from '../node-config';
import { ContextProperty, ContextPropertyConfig, SerializedContextProp } from '../node-input-context';
import { UINodeInputsConfigMap } from '../node-inputs';
import { SerializedNodeV3, UINodesEditor } from '../nodes-editor';
import { BaseEditingContext, EditingContextParams } from './context-base';

export interface NestedNodeConfig<C extends UINodeConfig[]> {
  readonly configs: C;
  readonly defaultConfig: C[number];
}

export type NestedNodeRefValue<C extends UINodeConfig[]> = {
  readonly node: UINode<C[number]>;
};
export type SerializedNestedNodeRefValue = { readonly node: SerializedNodeV3 };

export type NestedNodeParams<C extends UINodeConfig[]> = EditingContextParams<{
  readonly context: {
    readonly prop: ContextProperty<NestedNodeRefValue<C>, SerializedNestedNodeRefValue>;
  };
  readonly sType: {
    readonly value: SerializedContextProp<SerializedNestedNodeRefValue>;
  };
  readonly vType: {
    [K in keyof C]: {
      readonly id: C[K]['id'];
      readonly values: UINodeInputsConfigMap<C[K], 'vType'>;
      readonly node: UINode<C[K]>;
    };
  }[number];
  readonly params: NestedNodeConfig<C>;
}>;

const nestedNodePropConfig = <const C extends UINodeConfig[]>(): ContextPropertyConfig<
  NestedNodeRefValue<C>,
  SerializedNestedNodeRefValue
> => ({
  async deserialize({ editor, sVal }) {
    return { node: await editor.deserializeNode(sVal.node) };
  },
  async serialize({ val, editor }) {
    return { node: await editor.serializeNode(val.node) };
  },
});

// can be used as simple inputs reusing
// for more complex scenarios, child nodes should be used
export class NestedNodeEditingContext<
  const C extends UINodeConfig[],
  const T extends NestedNodeParams<C>,
> extends BaseEditingContext<T> {
  override changes(params: { readonly context: T['context'] }): Observable<unknown> {
    return params.context.prop.value.listen();
  }

  static create<const C extends UINodeConfig[]>(
    configs: C,
    defaultConfig: C[number],
  ): NestedNodeEditingContext<C, NestedNodeParams<C>> {
    return new NestedNodeEditingContext({ configs, defaultConfig });
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    const newNode = await UINode.createNew({ config: this.params.defaultConfig });
    newNode.flags.setFlag(UINodeFlags.Internal, true);

    return {
      prop: await ContextProperty.createNew({
        initVal: { node: newNode },
        propConfig: nestedNodePropConfig(),
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return { value: await params.context.prop.serialize({ editor: params.editor }) };
  }

  override async deserialize(params: {
    readonly editor: UINodesEditor;
    readonly sVal: T['sType'];
  }): Promise<T['context']> {
    return {
      prop: await ContextProperty.deserialize({
        editor: params.editor,
        propConfig: nestedNodePropConfig(),
        sProp: params.sVal.value,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    const node = params.context.prop.value.getValue().node;
    // todo: get rid of null
    return {
      id: node?.id,
      values: node?.getInputValues(),
      node,
    } as T['vType'];
  }
}
