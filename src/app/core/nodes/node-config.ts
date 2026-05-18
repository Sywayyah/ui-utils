import { DefaultEditingContextParams, EditingContextParams } from './editing-context/context-base';
import { NodeInputOptions } from './node-inputs';

export type UINodeConfigParams = {
  readonly id: string;
  readonly name: string;
  readonly inputs: {
    readonly [K in string]: NodeInputOptions<EditingContextParams<DefaultEditingContextParams>>;
  };
};

export interface UINodeConfig<T extends UINodeConfigParams = UINodeConfigParams> {
  readonly id: T['id'];
  readonly inputs: T['inputs'];
  readonly name: string;
}

export function createNodeConfig<const T extends UINodeConfigParams>(params: T): UINodeConfig<T> {
  return { id: params.id, name: params.name, inputs: params.inputs };
}
