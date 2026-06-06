import { map, merge, Observable, switchMap } from 'rxjs';
import { ReactiveFlags } from '../reactive/reactive-flags';
import { ReactiveList } from '../reactive/reactive-list';
import { ReactiveObjectTypedMap } from '../reactive/reactive-map';
import { ReactiveValue } from '../reactive/reactive-value';
import { ReactiveWeakSet } from '../reactive/reactive-weak-set';
import { assertValue } from '../utils/general';
import { UINodeConfig } from './node-config';
import { ContextProperty, InputContextInstance } from './node-input-context';
import { NodeInputOptions, NodeInputsMap, UINodeInput, UINodeInputsConfigMap } from './node-inputs';
import { UINodesEditor } from './nodes-editor';

type ParentNode = UINode | null;

export enum UINodeFlags {
  // internal nodes are not registered in the editor
  // and should not be present as children on any node
  Internal = 0b1,
}

export class UINode<const T extends UINodeConfig = UINodeConfig> {
  readonly id: string;
  // config-level methods for inferrence probably
  readonly config: ReactiveValue<T>;
  readonly childNodes = new ReactiveList<UINode<UINodeConfig>>();
  protected readonly inputsMap = new ReactiveObjectTypedMap<NodeInputsMap<T>>();
  readonly parent = new ReactiveValue<ParentNode>(null);
  readonly referencedByPropertiesSet = new ReactiveWeakSet<ContextProperty<any, any>>();
  readonly flags = new ReactiveFlags<UINodeFlags>();
  readonly showChildren = new ReactiveValue(true);

  private constructor({ id, config }: { readonly id: string; readonly config: T }) {
    this.id = id;
    this.config = new ReactiveValue<T>(config);
  }

  static async createNew<const T extends UINodeConfig>({
    config,
    id = `node-${crypto.randomUUID()}`,
    initInputs = true,
    flags,
  }: {
    readonly config: T;
    readonly id?: string;
    // if specified - populates inputs with 1 default context instances
    readonly initInputs?: boolean;
    readonly flags?: UINodeFlags;
    // todo: allow to pass preexisting values
  }): Promise<UINode<T>> {
    const newNode = new UINode({ config, id });

    if (flags) {
      newNode.flags.enableGroup(flags);
    }

    Object.entries(config.inputs).forEach(([inputName, options]) => {
      newNode.inputsMap.set(inputName, new UINodeInput(inputName, options, new ReactiveList()));
    });

    if (initInputs) {
      await Promise.all(
        Object.entries(config.inputs).map(async ([inputName]) => {
          await newNode.addInputValue(inputName);
        }),
      );
    }

    return newNode;
  }

  // misc

  getConfig(): UINodeConfig {
    return this.config.getValue();
  }

  getConfigId(): string {
    return this.config.getValue().id;
  }

  getConfigName(): string {
    return this.config.getValue().name;
  }

  // lifecycle

  destroy(params: { readonly editor: UINodesEditor }): void {
    this.inputsMap.getValues().forEach((nodeInput) => {
      nodeInput.list.getValue().forEach((context) => context.destroy({ editor: params.editor }));
    });
  }

  // methods - inputs

  listenInputs(): Observable<UINodeInput<T, keyof T['inputs']>[]> {
    const newLocal = this.inputsMap.listen().pipe(
      switchMap((inputsMap) => {
        const nodeInputs = inputsMap.values();
        return merge(
          ...nodeInputs.map((nodeInput) =>
            merge(nodeInput.enabled.listen(), nodeInput.list.listen()),
          ),
        ).pipe(map(() => nodeInputs.filter((nodeInput) => nodeInput.enabled.getValue())));
      }),
    );

    return newLocal;
  }

  setInputEnabled(inputName: keyof T['inputs'], enabled = true): void {
    const nodeInput = this.inputsMap.get(inputName);

    if (!nodeInput.inputConfig.optional) {
      console.warn(
        `Tring to change enabled state of non-optional input in node ${this.getConfigId()}`,
        this,
        inputName,
      );
      return;
    }

    nodeInput.enabled.setValue(enabled);
  }

  listenDisabledInputsNames(): Observable<(keyof T['inputs'])[]> {
    return merge(this.inputsMap.getValues().map((input) => input.enabled.listen())).pipe(
      map(() =>
        this.inputsMap
          .getValues()
          .filter((input) => !input.enabled.getValue())
          .map((input) => input.inputName),
      ),
    );
  }

  isInputEnabled(inputName: keyof T['inputs']): boolean {
    const nodeInput = this.inputsMap.get(inputName);
    return !nodeInput.inputConfig.optional || nodeInput.enabled.getValue();
  }

  getInputByName<const K extends keyof T['inputs']>(inputName: K): UINodeInput<T, K> {
    return this.inputsMap.get(inputName);
  }

  getInputs(): UINodeInput<T, keyof T['inputs']>[] {
    return this.inputsMap.getValues();
  }

  // methods - input values

  async addInputValue<const K extends keyof T['inputs']>(inputName: K): Promise<void> {
    const inputOptions = this.config.getValue().inputs[inputName as keyof UINodeConfig['inputs']];

    const context = await InputContextInstance.createNew({
      inputConfig: inputOptions,
      parentNode: this,
    });

    const nodeInput = this.inputsMap.get(inputName);
    nodeInput.list.push(context);
  }

  deleteInputValueByIndex<const K extends keyof T['inputs']>(
    inputName: K,
    index: number,
    editor: UINodesEditor,
  ): void {
    const nodeInput = this.inputsMap.get(inputName);
    // todo: context teardown logic + custom teardown logic
    nodeInput.list.at(index)?.destroy({ editor });
    nodeInput.list.removeByIndex(index);
  }

  moveInputValue<const K extends keyof T['inputs']>(
    inputName: K,
    prevIndex: number,
    nextIndex: number,
  ): void {
    const nodeInput = this.inputsMap.get(inputName);
    nodeInput.list.moveFromToIndex(prevIndex, nextIndex);
  }

  getInputValue<const K extends keyof T['inputs']>(
    inputName: K,
  ): UINodeInputsConfigMap<T, 'vType'>[K] {
    const nodeInput = this.inputsMap.get(inputName);

    if (!this.isInputEnabled(inputName)) return undefined as UINodeInputsConfigMap<T, 'vType'>[K];

    const valuesList = nodeInput.list
      .getValue()
      .filter((ctx) => (nodeInput.inputConfig.multi ? ctx.enabled.getValue() : true))
      .map((ctx) => nodeInput.inputConfig.config.value({ context: ctx.instance }));

    return (nodeInput.inputConfig.multi ? valuesList : valuesList[0]) as UINodeInputsConfigMap<
      T,
      'vType'
    >[K];
  }

  getInputValues(): UINodeInputsConfigMap<T, 'vType'> {
    const entries = this.inputsMap.getEntries();
    const valuesObject = {} as UINodeInputsConfigMap<T, 'vType'>;

    entries.forEach(([inputName]) => {
      if (!this.isInputEnabled(inputName)) {
        return;
      }
      valuesObject[inputName] = this.getInputValue(inputName);
    });

    return valuesObject;
  }

  listenInputValue<const K extends keyof T['inputs']>(
    inputName: K,
  ): Observable<UINodeInputsConfigMap<T, 'vType'>[K]> {
    return this.inputsMap.get(inputName).list.value$.pipe(
      switchMap((values) => merge(...values.map((val) => val.changes$))),
      map(() => this.getInputValue(inputName)),
    );
  }

  listenInputsValues(): Observable<UINodeInputsConfigMap<T, 'vType'>> {
    return this.inputsMap.listenEntries().pipe(
      switchMap((entries) =>
        merge(...entries.map(([inputName]) => this.listenInputValue(inputName))),
      ),
      map(() => this.getInputValues()),
    );
  }

  // methods - contexts

  getInputContext<const K extends keyof T['inputs']>(
    inputName: K,
  ): UINodeInputsConfigMap<T, 'context'>[K] {
    const inputContent = this.inputsMap.get(inputName);

    const ctxInstances = inputContent.list.getValue().map((context) => context.instance);

    return (
      inputContent.inputConfig.multi ? ctxInstances : ctxInstances[0]
    ) as UINodeInputsConfigMap<T, 'context'>[K];
  }

  getInputsContexts(): UINodeInputsConfigMap<T, 'context'> {
    const contexts = {} as UINodeInputsConfigMap<T, 'context'>;

    this.inputsMap.getEntries().forEach(([propName]) => {
      contexts[propName] = this.getInputContext(propName);
    });

    return contexts;
  }

  // methods - context instances

  getInputContextInstance<const K extends keyof T['inputs']>(
    inputName: K,
    i = 0,
  ): InputContextInstance<NodeInputOptions<T['inputs'][K]['config']['__editingParam']>> {
    const inputContent = this.inputsMap.get(inputName);

    const ctxInstances = inputContent.list.getValue();

    return assertValue(ctxInstances.at(i));
  }

  getInputContextInstances<const K extends keyof T['inputs']>(
    inputName: K,
  ): InputContextInstance<NodeInputOptions<T['inputs'][K]['config']['__editingParam']>>[] {
    const inputContent = this.inputsMap.get(inputName);

    const ctxInstances = inputContent.list.getValue();

    return ctxInstances;
  }

  // methods - children

  get<const C extends UINodeConfig>(config: C): UINode<C> {
    return assertValue(this.childNodes.getValue().find((node) => node.isNodeOfType(config)));
  }

  getOr<const C extends UINodeConfig, R = undefined>(
    config: C,
    orVal: R = undefined as R,
  ): UINode<C> | R {
    return this.childNodes.getValue().find((node) => node.isNodeOfType(config)) ?? orVal;
  }

  getAll<const C extends UINodeConfig>(config: C): UINode<C>[] {
    return this.childNodes.getValue().filter((node) => node.isNodeOfType(config));
  }

  isNodeOfType<const C extends UINodeConfig>(config: C): this is UINode<C> {
    return this.config.getValue() === (config as UINodeConfig);
  }

  addChildNode<const C extends UINodeConfig>(node: UINode<C>): UINode<C> {
    const previousParent = node.parent;
    const previousParentNode = previousParent.getValue();

    if (previousParentNode === (this as UINode<any>)) {
      console.warn(`Node ${this.id} is already parent of ${node.id}`);
      return node;
    }

    // remove child node from previous parent
    previousParentNode?.removeChildNode(node);

    this.childNodes.push(node as UINode<any>);
    previousParent.setValue(this as UINode<any>);

    return node;
  }

  removeChildNode<const C extends UINodeConfig>(node: UINode<C>): UINode<C> | undefined {
    if (node.parent.getValue() !== (this as UINode<any>)) {
      console.warn(`Removing: Node `, this, ` is not a parent of `, node);
      return;
    }

    this.childNodes.remove(node as UINode<any>);
    node.parent.setValue(null);

    return node;
  }

  // methods - parents

  isDeepChildOf(targetNode: UINode): boolean {
    const parent = this.parent.getValue();

    if (!parent) return false;

    return parent === targetNode ? true : parent?.isDeepChildOf(targetNode);
  }

  detachFromParent(): void {
    const parent = this.parent.getValue();

    if (!parent) return;

    parent.removeChildNode(this);
  }
}
