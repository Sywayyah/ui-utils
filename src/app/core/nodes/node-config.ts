import { DefaultEditingContextParams, EditingContextParams } from './editing-context/context-base';
import { NodeInputOptions } from './node-inputs';

export type UINodeOptions = Partial<{
  // default - false
  // basic, will need to think about this concept later
  readonly canHaveChildren: boolean;
}>;

export type UINodeConfigParams = {
  readonly id: string;
  readonly name: string;
  readonly inputs: {
    readonly [K in string]: NodeInputOptions<EditingContextParams<DefaultEditingContextParams>>;
  };
  readonly options?: UINodeOptions;
};

export interface UINodeConfig<T extends UINodeConfigParams = UINodeConfigParams> {
  readonly id: T['id'];
  readonly inputs: T['inputs'];
  readonly name: string;
  readonly options?: UINodeOptions;
}

export function createNodeConfig<const T extends UINodeConfigParams>(params: T): UINodeConfig<T> {
  return {
    id: params.id,
    name: params.name,
    inputs: params.inputs,
    options: {
      canHaveChildren: false,
      ...params.options,
    },
  };
}
