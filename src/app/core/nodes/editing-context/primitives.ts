import { Observable } from 'rxjs';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';
import { BaseEditingContext, EditingContextParams } from './context-base';
import { ContextProperty, ContextPropertyConfig, SerializedContextProp } from '../node-input-context';

type InputType = 'text' | 'number' | 'checkbox';

export type PrimitiveContextParams<V = any> = EditingContextParams<{
  context: { readonly prop: ContextProperty<V, V> };
  params: { readonly inputType: InputType; readonly initVal: V };
  sType: SerializedContextProp<V>;
  vType: V;
}>;

const createPlainValuePropConfig = <const T>(): ContextPropertyConfig<T, T> => ({
  async deserialize({ sVal }) {
    return sVal;
  },
  async serialize({ val }) {
    return val;
  },
});

type PrimitiveCreationParams<T> = Omit<PrimitiveContextParams<T>['params'], 'inputType'>;

export class PrimitiveEditingContext<
  T extends PrimitiveContextParams,
> extends BaseEditingContext<T> {
  static createText(
    params: PrimitiveCreationParams<string>,
  ): PrimitiveEditingContext<PrimitiveContextParams<string>> {
    return new PrimitiveEditingContext({ ...params, inputType: 'text' });
  }

  static createNumber(
    params: PrimitiveCreationParams<number>,
  ): PrimitiveEditingContext<PrimitiveContextParams<number>> {
    return new PrimitiveEditingContext({ ...params, inputType: 'number' });
  }

  static createCheckbox(
    params: PrimitiveCreationParams<boolean>,
  ): PrimitiveEditingContext<PrimitiveContextParams<boolean>> {
    return new PrimitiveEditingContext({ ...params, inputType: 'checkbox' });
  }

  override changes(params: { readonly context: T['context'] }): Observable<T['vType']> {
    return params.context.prop.value.listen();
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      prop: await ContextProperty.createNew({
        initVal: this.params.initVal,
        propConfig: createPlainValuePropConfig(),
      }),
    };
  }
  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return params.context.prop.serialize({ editor: params.editor });
  }

  override async deserialize(params: {
    readonly editor: UINodesEditor;
    readonly sVal: T['sType'];
  }): Promise<T['context']> {
    return {
      prop: await ContextProperty.deserialize({
        sProp: params.sVal,
        propConfig: createPlainValuePropConfig<T['vType']>(),
        editor: params.editor,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return params.context.prop.value.getValue();
  }
}
