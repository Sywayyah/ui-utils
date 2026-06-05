import { BehaviorSubject, map, Observable } from 'rxjs';
import { MiniUI } from '../mini-ui/mini-ui';
import { ReactiveList } from '../reactive/reactive-list';
import { ReactiveMap } from '../reactive/reactive-map';
import { ReactiveSet } from '../reactive/reactive-set';
import { ReactiveValue } from '../reactive/reactive-value';
import { assertValue } from '../utils/general';
import { getEntries } from '../utils/objects';
import { UINode, UINodeFlags } from './node';
import { UINodeConfig } from './node-config';
import { InputContextInstance } from './node-input-context';
import { SerializedUINodeInput } from './node-inputs';
import { RootConfig } from './node-roots';

export interface SerializedNode {
  readonly id: string;
  readonly configId: string;
  readonly flags: number;
  readonly inputs: SerializedUINodeInput[];
  readonly children: SerializedNode[];
  readonly showChildren: boolean;
}

export enum NodesEditorState {
  LoadingNodes,
  Normal,
}

const defaultNodeRoot = 'default';

export interface SerializedEditorState {
  readonly roots: {
    readonly rootName: string;
    readonly nodes: SerializedNode[];
  }[];
}

export interface NodesRoot {
  readonly title: string;
  readonly rootName: string;
  // should only contain root nodes, no nested nodes
  readonly nodes: ReactiveList<UINode>;
  readonly nodeConfigs?: UINodeConfig[];
  readonly rootConfig?: RootConfig;
}

export type NodesEditorParams = {
  readonly configs: UINodeConfig[];
  readonly nodeRoots?: Record<
    string,
    {
      readonly title: string;
      readonly configs?: UINodeConfig[];
      readonly rootConfig?: RootConfig;
    }
  >;
  readonly nodePreviewer?: (node: UINode) => Observable<MiniUI>;
};

// todo: flush current state when opening new file
// todo: add more typization for T?
export class UINodesEditor<const T extends NodesEditorParams = NodesEditorParams> {
  private readonly nodes = new ReactiveSet<UINode>();
  private readonly nodesMap = new ReactiveMap<string, UINode>();
  private readonly nodesByConfigsMap = new ReactiveMap<UINodeConfig, ReactiveList<UINode>>();
  private readonly configsMap = new Map<string, UINodeConfig>();
  readonly nodeRoots = new ReactiveMap<string, NodesRoot>();

  private onNodesLoadedListeners: (() => void)[] = [];

  readonly isChildrenSelected = new ReactiveValue(false);
  readonly selectedNodesSet = new ReactiveSet<UINode>();

  readonly cutNodesSet = new ReactiveSet<UINode>();

  readonly selectedNodesState$ = this.selectedNodesSet.value$.pipe(
    map((nodesSet) => {
      const nodes = [...nodesSet];

      const configsSet = new Set<UINodeConfig>();
      const configs = [...configsSet];

      nodes.forEach((node) => configsSet.add(node.config.getValue()));

      if (nodesSet.size === 1) {
        return { selectedItems: nodes, onlyItem: nodes[0], configsSet, configs };
      }

      return { selectedItems: nodes, onlyItem: null, configsSet, configs };
    }),
  );

  private readonly state = new BehaviorSubject<NodesEditorState>(NodesEditorState.Normal);

  constructor(readonly params: T) {
    params.configs.forEach((config) => this.configsMap.set(config.id, config));

    const nodeRoots = params.nodeRoots;

    if (nodeRoots) {
      Object.entries(nodeRoots).forEach(([rootName, config]) => {
        this.nodeRoots.set(rootName, {
          rootName,
          title: config.title,
          nodes: new ReactiveList(),
          nodeConfigs: config.configs,
          rootConfig: config.rootConfig,
        });
      });
    } else {
      console.warn(`No nodeRoots were provided, creating 'default' root`);
      this.nodeRoots.set(defaultNodeRoot, {
        rootName: defaultNodeRoot,
        nodes: new ReactiveList(),
        title: 'Nodes',
      });
    }
  }

  deleteNodes(selectedNodes: UINode[]): void {
    selectedNodes.forEach((node) => {
      this.deleteNode(node);
    });
  }

  deleteNode(node: UINode): void {
    node.destroy({ editor: this });
    this.unregisterNode(node);
    node.parent.getValue()?.removeChildNode(node);
    node.parent.setValue(null);
    this.nodes.remove(node);
    // todo: registry with node roots?
    this.nodeRoots.getValues().forEach((nodeRoot) => nodeRoot.nodes.remove(node));

    if (this.selectedNodesSet.has(node)) {
      this.selectedNodesSet.remove(node);
    }

    // recursively delete child nodes
    node.childNodes.getValue().forEach((childNode) => this.deleteNode(childNode));
  }

  moveNode(item: UINode, offset: number): void {
    const parentNode = item.parent.getValue();
    if (parentNode) {
      parentNode.childNodes.moveItem(item, offset);
    } else {
      const rootWithItem = this.nodeRoots.getValues().find((root) => root.nodes.includes(item));
      rootWithItem?.nodes.moveItem(item, offset);
    }
  }

  private registerNode(node: UINode): void {
    this.nodes.add(node);
    this.nodesMap.set(node.id, node);

    if (node.flags.isFlagEnabled(UINodeFlags.Internal)) {
      return;
    }

    this.nodesByConfigsMap.updateEntry(node.config.getValue(), (list) => {
      return list ? list.push(node) : new ReactiveList([node]);
    });
  }

  private unregisterNode(node: UINode): void {
    this.nodesMap.remove(node.id);

    this.nodesByConfigsMap.updateEntry(node.getConfig(), (list) => list!.remove(node));
  }

  getNodesByConfig<const C extends UINodeConfig>(config: C): UINode<C>[] {
    return (this.nodesByConfigsMap.getOr(config)?.getValue() ?? []) as UINode<any>[];
  }

  getNodeById(id: string): UINode {
    return this.nodesMap.get(id);
  }

  getNodesByConfigs<const C extends UINodeConfig[]>(...configs: C): UINode<C[number]>[] {
    const nodes = [
      ...configs.flatMap((config) => this.nodesByConfigsMap.getOr(config)?.getValue() ?? []),
    ];

    return nodes as UINode<C[number]>[];
  }

  onNodesLoadedListener(listener: () => void): void {
    if (this.state.getValue() !== NodesEditorState.LoadingNodes) {
      console.warn(`Attempting to wait for editor to load nodes while nodes aren't loading`);
    }
    this.onNodesLoadedListeners.push(listener);
  }

  async serializeNode(node: UINode): Promise<SerializedNode> {
    const serializedInputs = await Promise.all(
      node.getInputs().map(async (nodeInput) => {
        const serializedInputs = await Promise.all(
          nodeInput.list.getValue().map((context) => context.serialize({ editor: this })),
        );

        return {
          name: nodeInput.inputName,
          enabled: nodeInput.enabled.getValue(),
          contexts: serializedInputs,
        };
      }),
    );

    const sNode: SerializedNode = {
      id: node.id,
      configId: node.getConfigId(),
      flags: node.flags.getFlags(),
      inputs: serializedInputs,
      children: await this.serializeNodes(node.childNodes.getValue()),
      showChildren: node.showChildren.getValue(),
    };

    return sNode;
  }

  async serializeNodes(nodes: UINode[] = this.nodes.getItems()): Promise<SerializedNode[]> {
    const sNodes = await Promise.all(nodes.map(async (node) => this.serializeNode(node)));
    return sNodes;
  }

  async serialize(): Promise<SerializedEditorState> {
    const sEditorState: SerializedEditorState = {
      roots: [],
    };

    await Promise.all(
      this.nodeRoots.getValues().map(async (root) => {
        sEditorState.roots.push({
          rootName: root.rootName,
          nodes: await this.serializeNodes(root.nodes.getValue()),
        });
      }),
    );

    return sEditorState;
  }

  async deserialize(serializedState: SerializedEditorState): Promise<void> {
    this.state.next(NodesEditorState.LoadingNodes);

    await Promise.all(
      getEntries(this.params.nodeRoots!).map(async ([rootName, rootConfig]) => {
        const sRoot = assertValue(
          serializedState.roots.find((sRoot) => sRoot.rootName === rootName),
          `Editor deserialization: Failed to deserialize node root '${rootName}', roots config:`,
          this.params.nodeRoots,
          serializedState.roots,
        );

        this.nodeRoots.set(rootName, {
          title: rootConfig.title,
          rootName: rootName,
          nodes: new ReactiveList(await this.deserializeNodes(sRoot?.nodes)),
          nodeConfigs: rootConfig.configs,
          rootConfig: rootConfig.rootConfig,
        });
      }),
    );

    this.onNodesLoadedListeners.forEach((listener) => {
      listener();
    });

    this.onNodesLoadedListeners = [];

    this.state.next(NodesEditorState.Normal);
  }

  async deserializeNode(sNode: SerializedNode): Promise<UINode> {
    const configById = assertValue(
      this.configsMap.get(sNode.configId),
      `Nodes deserialzation: failed to find config with id ${sNode.configId}`,
    );

    const node = await UINode.createNew({
      config: configById,
      id: sNode.id,
      initInputs: false,
      flags: sNode.flags,
    });

    node.showChildren.setValue(sNode.showChildren);

    await getEntries(configById.inputs).map(async ([inputName, inputOptions]) => {
      const sNodeInput = sNode.inputs.find((sInput) => sInput.name === inputName);

      if (!sNodeInput) {
        await node.addInputValue(inputName);
        return;
      }

      if (!sNodeInput.contexts.length && !inputOptions.multi) {
        await node.addInputValue(inputName);
        return;
      }

      const nodeInput = node.getInputByName(inputName);
      nodeInput.enabled.setValue(sNodeInput.enabled);

      const deserializedContexts = await Promise.all(
        sNodeInput.contexts.map((sContext) =>
          InputContextInstance.deserialize({
            editor: this,
            inputConfig: nodeInput.inputConfig,
            serialized: sContext,
          }),
        ),
      );

      deserializedContexts.forEach((instance) => {
        return nodeInput.list.push(instance);
      });
    });

    const childNodes = await this.deserializeNodes(sNode.children);

    childNodes.forEach((childNode) => node.addChildNode(childNode));

    return node;
  }

  async deserializeNodes(serializedNodes: SerializedNode[]): Promise<UINode[]> {
    const nodes = await Promise.all(
      serializedNodes.map(async (sNode) => this.deserializeNode(sNode)),
    );

    nodes.forEach((node) => this.registerNode(node));
    return nodes;
  }

  async addChildNodeToNodeByConfig(config: UINodeConfig, targetNode: UINode): Promise<UINode> {
    const newNode = await UINode.createNew({ config });
    this.registerNode(newNode);

    targetNode.addChildNode(newNode);

    return newNode;
  }

  async addNodeByConfig(rootName = defaultNodeRoot, ...configs: UINodeConfig[]): Promise<UINode[]> {
    const newNodes = await Promise.all(
      configs.map(async (config) => {
        return UINode.createNew({ config });
      }),
    );

    this.nodeRoots.get(rootName).nodes.push(...newNodes);
    newNodes.forEach((node) => this.registerNode(node));

    return newNodes;
  }
}
