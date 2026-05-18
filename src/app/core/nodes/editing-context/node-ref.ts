import { Observable } from 'rxjs';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';
import { BaseEditingContext, EditingContextParams } from './context-base';
import { MiniUI } from '../../mini-ui/mini-ui';
import { ContextProperty, ContextPropertyConfig, SerializedContextProp } from '../node-input-context';

// todo: can try to introduce genercis
export interface NodePickerConfig {
  readonly pickerTitle?: string;
  picker: (params: { readonly node: UINode; readonly editor: UINodesEditor }) => UINode<any>[];
  nodeItemMapper(node: UINode): {
    readonly text: string;
    parts(): MiniUI;
  };
  resultParts: (node: NodeRefValue) => Observable<MiniUI>;
}

export type NodeRefValue = { readonly node: UINode | null };
export type SerializedNodeRefValue = { readonly nodeId: string | null };

export type NodePickerParams = EditingContextParams<{
  readonly context: {
    readonly prop: ContextProperty<NodeRefValue, SerializedNodeRefValue>;
  };
  readonly sType: {
    readonly value: SerializedContextProp<SerializedNodeRefValue>;
  };
  readonly vType: NodeRefValue;
  readonly params: NodePickerConfig;
}>;

const nodeRefPropConfig = (): ContextPropertyConfig<
  NodeRefValue,
  SerializedNodeRefValue
> => ({
  async deserialize() {
    // let onPropCreated handle deferred initialization
    return { node: null };
  },
  async serialize({ val }) {
    return { nodeId: val.node?.id ?? null };
  },
  onPropCreated({ editor, prop, sVal }) {
    const nodeId = sVal.nodeId;

    if (nodeId) {
      editor.onNodesLoadedListener(() => prop.value.setValue({ node: editor.getNodeById(nodeId) }));
    }
  },
});

export class NodeRefEditingContext<const T extends NodePickerParams> extends BaseEditingContext<T> {
  override changes(params: { readonly context: T['context'] }): Observable<unknown> {
    return params.context.prop.value.listen();
  }

  static create<const T extends NodePickerConfig>(
    params: T,
  ): NodeRefEditingContext<NodePickerParams> {
    return new NodeRefEditingContext(params);
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      prop: await ContextProperty.createNew({
        initVal: { node: null },
        propConfig: nodeRefPropConfig(),
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
        propConfig: nodeRefPropConfig(),
        sProp: params.sVal.value,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return params.context.prop.value.getValue();
  }
}
