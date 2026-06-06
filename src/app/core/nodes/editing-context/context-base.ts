import { Observable } from 'rxjs';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';

export interface DefaultEditingContextParams {
  readonly context: any;
  readonly params: any;
  readonly sType: any;
  readonly vType: any;
}
// todo: not sure if both DefaultEditingContextParams & EditingContextParams are needed
export type EditingContextParams<T extends DefaultEditingContextParams> = T;

export interface EditingContext<T extends EditingContextParams<DefaultEditingContextParams>> {
  // tech prop
  readonly __editingParam: T;
}

export interface EditingContextDeserializeParams<T extends EditingContextParams<DefaultEditingContextParams>> {
  readonly editor: UINodesEditor;
  readonly sVal: T['sType'];
  readonly parentNode: UINode;
}

export abstract class BaseEditingContext<
  T extends EditingContextParams<DefaultEditingContextParams>,
> implements EditingContext<T> {
  // tech prop
  readonly __editingParam!: T;

  constructor(readonly params: T['params']) {}

  abstract createContext(params: { readonly parentNode: UINode }): Promise<T['context']>;

  abstract serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']>;

  abstract deserialize(params: EditingContextDeserializeParams<T>): Promise<T['context']>;

  abstract value(params: { readonly context: T['context'] }): T['vType'];

  abstract changes(params: { readonly context: T['context'] }): Observable<unknown>;

  destroy(params: { readonly context: T['context'] }): void {}
}
