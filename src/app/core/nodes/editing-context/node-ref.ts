import { Observable } from 'rxjs';
import { MiniUI } from '../../mini-ui/mini-ui';
import { UINode } from '../node';
import {
  ContextProperty,
  ContextPropertyConfig,
  SerializedContextProp,
} from '../node-input-context';
import { UINodesEditor } from '../nodes-editor';
import {
  BaseEditingContext,
  EditingContextDeserializeParams,
  EditingContextDestroyParams,
  EditingContextParams,
} from './context-base';

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

const nodeRefPropConfig = (): ContextPropertyConfig<NodeRefValue, SerializedNodeRefValue> => ({
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
      editor.onNodesLoadedListener(() => {
        const node = editor.tryGetNodeById(nodeId);

        if (!node) {
          console.warn(
            `Couldn't find node by id ${nodeId} while deserializing Node Ref editing context for node ${prop.parentNode.id} of type ${prop.parentNode.getConfigId()}`,
          );
        }

        prop.setValue({ node: node });
      });
    }
  },
  onValueSet({ nextVal, prevVal, prop }): void {
    prevVal?.node?.referencedByPropertiesSet.remove(prop);
    nextVal?.node?.referencedByPropertiesSet.add(prop);
  },
  onDestroyed({ value, prop }): void {
    value?.node?.referencedByPropertiesSet.remove(prop);
  },
  // todo: self-delete when referenced node is removed?
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
        parentNode: params.parentNode,
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return { value: await params.context.prop.serialize({ editor: params.editor }) };
  }

  override async deserialize(params: EditingContextDeserializeParams<T>): Promise<T['context']> {
    return {
      prop: await ContextProperty.deserialize({
        editor: params.editor,
        propConfig: nodeRefPropConfig(),
        sProp: params.sVal.value,
        parentNode: params.parentNode,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return params.context.prop.value.getValue();
  }

  override destroy(params: EditingContextDestroyParams<T>): void {
    params.context.prop.destroy({ editor: params.editor });
  }
}
