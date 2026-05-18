import { MiniUI } from '../mini-ui/mini-ui';
import { ReactiveList } from '../reactive/reactive-list';
import { ReactiveValue } from '../reactive/reactive-value';
import {
  BaseEditingContext,
  DefaultEditingContextParams,
  EditingContext,
  EditingContextParams,
} from './editing-context/context-base';
import { UINodeConfig } from './node-config';
import { InputContextInstance, SerializedContextInstance } from './node-input-context';

export type SerializedUINodeInput = {
  readonly name: string;
  readonly enabled: boolean;
  readonly contexts: SerializedContextInstance<NodeInputOptions<DefaultEditingContextParams>>[];
};

export class UINodeInput<const T extends UINodeConfig, const K extends keyof T['inputs']> {
  readonly enabled = new ReactiveValue(true);

  constructor(
    readonly inputName: K,
    readonly inputConfig: NodeInputOptions<T['inputs'][K]['config']['__editingParam']>,
    readonly list: ReactiveList<
      InputContextInstance<NodeInputOptions<T['inputs'][K]['config']['__editingParam']>>
    >,
  ) {}
}

export type NodeInputsMap<T extends UINodeConfig> = {
  readonly [K in keyof T['inputs']]: UINodeInput<T, K>;
};

export type NodeInputOptions<T extends EditingContextParams<DefaultEditingContextParams>> = {
  readonly multi?: boolean;
  readonly optional?: boolean;
  readonly config: BaseEditingContext<T>;
  // only applicable to multi
  readonly canDisable?: boolean;
  readonly uiParts: () => MiniUI;
};

type UINodeInputTypeParamsProperty<
  S extends EditingContextParams<DefaultEditingContextParams>,
  T extends NodeInputOptions<DefaultEditingContextParams>,
  P extends keyof S,
  // acts as type variable, shouldn't be changed
  V = S[P],
> = T['optional'] extends true
  ? T['multi'] extends true
    ? V[] | undefined
    : V | undefined
  : T['multi'] extends true
    ? V[]
    : V;

export type UINodeInputsConfigMap<
  T extends UINodeConfig,
  // todo: probably could have editing context on this level
  S extends keyof EditingContextParams<DefaultEditingContextParams>,
> = {
  [K in keyof T['inputs']]: T['inputs'][K]['config'] extends EditingContext<infer U>
    ? UINodeInputTypeParamsProperty<U, T['inputs'][K], S>
    : never;
};
