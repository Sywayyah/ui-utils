import { combineLatest, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { DefaultEditingContextParams } from './editing-context/context-base';
import { UINodesEditor } from './nodes-editor';
import { UINode } from './node';
import { ReactiveValue } from '../reactive/reactive-value';
import { NodeInputOptions } from './node-inputs';
import { ReactiveList } from '../reactive/reactive-list';

export type SerializedContextProp<S> = { readonly id: string; readonly val: S };

// todo: can become class to have identity
export interface ContextPropertyConfig<V, S> {
  serialize(params: { readonly editor: UINodesEditor; readonly val: V }): Promise<S>;
  deserialize(params: { readonly editor: UINodesEditor; readonly sVal: S }): Promise<V>;
  // enables deferred prop initialization, e.g. based on some events, etc.
  onPropCreated?(params: {
    readonly prop: ContextProperty<V, S>;
    readonly editor: UINodesEditor;
    readonly sVal: S;
  }): void;
  onValueSet?(params: {
    readonly prevVal?: V;
    readonly nextVal: V;
    readonly prop: ContextProperty<V, S>;
  }): void;
  onDestroyed?(params: {
    readonly value?: V;
    readonly prop: ContextProperty<V, S>;
    readonly editor: UINodesEditor;
  }): void;
}

export class ContextProperty<T, S = T> {
  readonly value: ReactiveValue<T>;

  private constructor(
    readonly id: string,
    initVal: T,
    protected readonly propConfig: ContextPropertyConfig<T, S>,
    readonly parentNode: UINode,
  ) {
    this.value = new ReactiveValue<T>(initVal);
  }

  static async createNew<T, S = T>(params: {
    readonly initVal: T;
    readonly propConfig: ContextPropertyConfig<T, S>;
    readonly parentNode: UINode;
  }): Promise<ContextProperty<T, S>> {
    return new ContextProperty<T, S>(
      `input-${crypto.randomUUID()}`,
      params.initVal,
      params.propConfig,
      params.parentNode,
    );
  }

  static async deserialize<T, S = T>({
    sProp,
    propConfig,
    editor,
    parentNode,
  }: {
    readonly editor: UINodesEditor;
    readonly sProp: SerializedContextProp<S>;
    readonly propConfig: ContextPropertyConfig<T, S>;
    readonly parentNode: UINode;
  }): Promise<ContextProperty<T, S>> {
    const val = await propConfig.deserialize({ sVal: sProp.val, editor });
    const prop = new ContextProperty<T, S>(sProp.id, val, propConfig, parentNode);
    propConfig.onPropCreated?.({ prop, editor, sVal: sProp.val });
    propConfig.onValueSet?.({ prop, nextVal: val });
    return prop;
  }

  async serialize({
    editor,
  }: {
    readonly editor: UINodesEditor;
  }): Promise<SerializedContextProp<S>> {
    const sVal = await this.propConfig.serialize({ val: this.value.getValue(), editor });
    return { id: this.id, val: sVal };
  }

  setValue(val: T): void {
    const prevVal = this.value.getValue();
    this.propConfig.onValueSet?.({
      prevVal,
      nextVal: val,
      prop: this,
    });
    this.value.setValue(val);
  }

  getValue(): T {
    return this.value.getValue();
  }

  destroy(params: { readonly editor: UINodesEditor }): void {
    this.propConfig.onDestroyed?.({ value: this.getValue(), prop: this, editor: params.editor });
  }
}

export interface SerializedContextInstance<
  C extends NodeInputOptions<DefaultEditingContextParams>,
> {
  readonly id: string;
  readonly ctx: C['config']['__editingParam']['context'];
  readonly enabled: boolean;
}

export class InputContextInstance<const T extends NodeInputOptions<DefaultEditingContextParams>> {
  // todo: destroy logic for context properties
  readonly enabled = new ReactiveValue(true);

  private readonly changeSourcesList = new ReactiveList<Observable<unknown>>();

  private readonly destroySubject$ = new Subject<void>();

  readonly changes$ = this.changeSourcesList.listen().pipe(
    switchMap((sources) => combineLatest(sources)),
    takeUntil(this.destroySubject$),
  );

  private constructor(
    readonly inputConfig: T,
    readonly instance: T['config']['__editingParam']['context'],
    readonly id = `ctx-${crypto.randomUUID()}`,
  ) {
    this.addSource(this.enabled.listen());
    this.addSource(inputConfig.config.changes({ context: instance }));
  }

  // todo: methods to create context properties out of CtxInstance?
  // then sources will be added automatically

  static async createNew<const T extends NodeInputOptions<DefaultEditingContextParams>>({
    inputConfig,
    parentNode,
  }: {
    readonly inputConfig: T;
    readonly parentNode: UINode<any>;
  }): Promise<InputContextInstance<T>> {
    const instance = await inputConfig.config.createContext({ parentNode });

    return new InputContextInstance(inputConfig, instance);
  }

  async serialize({
    editor,
  }: {
    readonly editor: UINodesEditor;
  }): Promise<SerializedContextInstance<T>> {
    return {
      id: this.id,
      ctx: await this.inputConfig.config.serialize({
        context: this.instance,
        editor,
      }),
      enabled: this.enabled.getValue(),
    };
  }

  static async deserialize<const T extends NodeInputOptions<DefaultEditingContextParams>>({
    inputConfig,
    serialized,
    editor,
    parentNode,
  }: {
    readonly inputConfig: T;
    readonly serialized: SerializedContextInstance<T>;
    readonly editor: UINodesEditor;
    readonly parentNode: UINode;
  }): Promise<InputContextInstance<T>> {
    const instance = await inputConfig.config.deserialize({
      editor,
      sVal: serialized.ctx,
      parentNode,
    });

    const ctx = new InputContextInstance(inputConfig, instance, serialized.id);

    ctx.enabled.setValue(serialized.enabled);

    return ctx;
  }

  destroy(params: { readonly editor: UINodesEditor }): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
    this.inputConfig.config.destroy({ context: this.instance, editor: params.editor });
  }

  private addSource(source: Observable<unknown>): void {
    this.changeSourcesList.push(source);
  }
}
