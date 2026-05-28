import { Observable } from 'rxjs';
import { UINode } from '../node';
import {
  ContextProperty,
  ContextPropertyConfig,
  SerializedContextProp,
} from '../node-input-context';
import { UINodesEditor } from '../nodes-editor';
import { BaseEditingContext, EditingContextParams } from './context-base';

interface ScriptEditingParams {
  readonly types: string;
}

export type ScriptContextParams<V extends string> = EditingContextParams<{
  context: { readonly script: ContextProperty<V, V>; readonly compiled: ContextProperty<V, V> };
  params: ScriptEditingParams;
  sType: {
    script: SerializedContextProp<V>;
    compiled: SerializedContextProp<V>;
  };
  vType: V;
}>;

const scriptPropConfig = <const T>(): ContextPropertyConfig<T, T> => ({
  async deserialize({ sVal }) {
    return sVal;
  },
  async serialize({ val }) {
    return val;
  },
});

export class ScriptEditingContext<
  T extends ScriptContextParams<string>,
> extends BaseEditingContext<T> {
  static createScriptEditor(
    params: ScriptEditingParams,
  ): ScriptEditingContext<ScriptContextParams<string>> {
    return new ScriptEditingContext({ ...params });
  }

  override changes(params: { readonly context: T['context'] }): Observable<T['vType']> {
    return params.context.script.value.listen();
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      script: await ContextProperty.createNew({
        initVal: '',
        propConfig: scriptPropConfig(),
      }),
      compiled: await ContextProperty.createNew({
        initVal: '',
        propConfig: scriptPropConfig(),
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return {
      script: await params.context.script.serialize({ editor: params.editor }),
      compiled: await params.context.compiled.serialize({ editor: params.editor }),
    };
  }

  override async deserialize(params: {
    readonly editor: UINodesEditor;
    readonly sVal: T['sType'];
  }): Promise<T['context']> {
    return {
      script: await ContextProperty.deserialize({
        sProp: params.sVal.script,
        propConfig: scriptPropConfig<T['vType']>(),
        editor: params.editor,
      }),
      compiled: await ContextProperty.deserialize({
        sProp: params.sVal.compiled,
        propConfig: scriptPropConfig<T['vType']>(),
        editor: params.editor,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return params.context.compiled.value.getValue();
  }
}
