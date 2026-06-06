import { map, merge, Observable } from 'rxjs';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';
import {
  BaseEditingContext,
  EditingContextDeserializeParams,
  EditingContextParams,
} from './context-base';
import {
  ContextProperty,
  ContextPropertyConfig,
  SerializedContextProp,
} from '../node-input-context';

type NumRangeType = number | undefined;

type NumRangeParams = {
  readonly initMin?: number;
  readonly initMax?: number;
};

export type NumRangeContextParams = EditingContextParams<{
  context: {
    readonly min: ContextProperty<NumRangeType, NumRangeType>;
    readonly max: ContextProperty<NumRangeType, NumRangeType>;
  };
  params: NumRangeParams;
  sType: {
    readonly min: SerializedContextProp<NumRangeType>;
    readonly max: SerializedContextProp<NumRangeType>;
  };
  vType: { readonly min: NumRangeType; readonly max: NumRangeType };
}>;

const createNumRangePropConfig = (): ContextPropertyConfig<NumRangeType, NumRangeType> => ({
  async deserialize({ sVal }) {
    return sVal;
  },
  async serialize({ val }) {
    return val;
  },
});

export class NumRangeEditingContext<T extends NumRangeContextParams> extends BaseEditingContext<T> {
  static create(params: NumRangeParams): NumRangeEditingContext<NumRangeContextParams> {
    return new NumRangeEditingContext({ ...params });
  }

  override changes(params: { readonly context: T['context'] }): Observable<T['vType']> {
    return merge(params.context.max.value.listen(), params.context.min.value.listen()).pipe(
      map(() => this.value(params)),
    );
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      min: await ContextProperty.createNew({
        initVal: this.params.initMin,
        propConfig: createNumRangePropConfig(),
        parentNode: params.parentNode,
      }),
      max: await ContextProperty.createNew({
        initVal: this.params.initMin,
        propConfig: createNumRangePropConfig(),
        parentNode: params.parentNode,
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return {
      min: await params.context.min.serialize({ editor: params.editor }),
      max: await params.context.max.serialize({ editor: params.editor }),
    };
  }

  override async deserialize(params: EditingContextDeserializeParams<T>): Promise<T['context']> {
    return {
      min: await ContextProperty.deserialize({
        sProp: params.sVal.min,
        propConfig: createNumRangePropConfig(),
        editor: params.editor,
        parentNode: params.parentNode,
      }),
      max: await ContextProperty.deserialize({
        sProp: params.sVal.max,
        propConfig: createNumRangePropConfig(),
        editor: params.editor,
        parentNode: params.parentNode,
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    const minV = params.context.min.value.getValue();
    const maxV = params.context.max.value.getValue();

    const isMinNum = typeof minV === 'number';
    const isMaxNum = typeof maxV === 'number';

    if (!isMinNum && !isMaxNum) {
      return { min: 0, max: 0 };
    }

    if (!isMinNum && isMaxNum) {
      return { min: maxV, max: maxV };
    }

    if (!isMaxNum && isMinNum) {
      return { min: minV, max: minV };
    }

    const min = Math.min(minV!, maxV!);
    const max = Math.max(minV!, maxV!);

    return {
      min: min,
      max: max,
    };
  }
}
