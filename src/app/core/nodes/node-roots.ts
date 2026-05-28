import { Observable } from 'rxjs';
import { MiniUI } from '../mini-ui/mini-ui';
import { ReactiveMap } from '../reactive/reactive-map';
import { throwError } from '../utils/general';
import { UINode } from './node';
import { UINodeConfig, UINodeConfigParams } from './node-config';
import { UINodesEditor } from './nodes-editor';

export class RootConfig {
  readonly nodeConfigsMap = new ReactiveMap<string, UINodeConfig>();

  // params should become const T?
  constructor(readonly params: RootParams) {}

  createNodeConfig<const T extends UINodeConfigParams>(params: T): UINodeConfig<T> {
    const id = `${this.params.idPrefix}:${params.id}`;

    if (this.nodeConfigsMap.has(id)) throwError(`Config with id ${id} is already registered`);

    const newConfig = {
      id: id,
      name: params.name,
      inputs: params.inputs,
    };

    this.nodeConfigsMap.set(newConfig.id, newConfig);

    return newConfig;
  }
}

export enum RootStyle {
  Inline = 'inline',
  Normal = 'normal',
}

interface RootParams {
  readonly idPrefix: string;
  readonly style?: RootStyle;
  readonly getInlineUI?: (params: {
    readonly node: UINode;
    readonly editor: UINodesEditor;
  }) => Observable<MiniUI>;
}

export function createRootConfig(params: RootParams): RootConfig {
  return new RootConfig(params);
}
