import { CdkMenu, CdkMenuBar, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { AsyncPipe } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import { UINode } from '../../../../core/nodes/node';
import { UINodeConfig } from '../../../../core/nodes/node-config';
import {
  NodesRoot,
  SerializedEditorState,
  UINodesEditor,
} from '../../../../core/nodes/nodes-editor';
import { fromObservableInput } from '../../../../core/utils/effects';
import { FileHandler } from '../../../../core/utils/file-system';
import { Btn } from '../../btn/btn';
import { Icon } from '../../icon/icon';
import { LayoutPanels } from '../../layout/components/layout-panels/layout-panels';
import { Panel } from '../../layout/core/panel';
import { NodeEditorTreeItem } from '../node-editor-tree-item/node-editor-tree-item';
import { NodeInlineView } from '../node-inline-view/node-inline-view';
import { Node } from '../node/node';

@Component({
  selector: 'app-node-editor',
  imports: [
    LayoutPanels,
    Panel,
    Btn,
    Icon,
    AsyncPipe,
    Node,
    CdkMenuBar,
    CdkMenuItem,
    CdkMenu,
    CdkMenuTrigger,
    NodeEditorTreeItem,
    NodeInlineView,
  ],
  templateUrl: './node-editor.html',
  styleUrl: './node-editor.scss',
})
export class NodeEditor {
  readonly editor = input.required<UINodesEditor>();
  readonly activeRoot = model<string>('');

  readonly fsHandler = new FileHandler<SerializedEditorState>();

  readonly roots = fromObservableInput(() => this.editor().nodeRoots.value$, null);
  readonly activeNodeRoot = computed(() => this.roots()?.get(this.activeRoot()));

  cutNode() {
    const editor = this.editor();
    editor.cutNodesSet.setValue(editor.selectedNodesSet.getValue());
  }

  cancelCut() {
    this.editor().cutNodesSet.clear();
  }

  paste() {
    const selectedNodes = this.editor().selectedNodesSet;

    const cutNodesSet = this.editor().cutNodesSet;
    const targetNode = selectedNodes.getItems().at(0);
    const cutNodes = cutNodesSet.getItems();

    if (selectedNodes.size > 1) {
      console.error('Need only 1 node to be selected in order to paste cut nodes');
      return;
    }

    if (!targetNode) {
      cutNodes.forEach((node) => {
        this.activeNodeRoot()?.nodes.push(node);
        node.detachFromParent();
      });

      this.editor().cutNodesSet.clear();
      return;
    }

    const pastingIntoCut = cutNodes.some((node) => selectedNodes.has(node));

    if (pastingIntoCut) {
      console.error('Cannot paste into a node being cut');

      this.editor().cutNodesSet.clear();
      return;
    }

    const isPastingParentIntoChild = cutNodes.some((node) => targetNode.isDeepChildOf(node));

    if (isPastingParentIntoChild) {
      console.error('Cannot paste into a child of a parent being cut');
      return;
    }

    cutNodesSet.getItems().forEach((cutNode) => {
      targetNode.addChildNode(cutNode);

      this.editor()
        .nodeRoots.getEntries()
        .forEach(([name, list]) => {
          list.nodes.remove(cutNode);
        });
    });

    this.editor().cutNodesSet.clear();
  }

  selectNode(node: UINode): void {
    const selectedNodesSet = this.editor().selectedNodesSet;
    this.editor().isChildrenSelected.setValue(false);

    if (selectedNodesSet.has(node)) {
      this.editor().selectedNodesSet.clear();
      return;
    }

    this.editor().selectedNodesSet.clear();
    this.editor().selectedNodesSet.add(node);
  }

  setActiveRoot(root: NodesRoot) {
    this.activeRoot.set(root.rootName);
    this.editor().selectedNodesSet.clear();
    this.editor().cutNodesSet.clear();
  }

  async addChildNode(root: NodesRoot | undefined, config: UINodeConfig) {
    if (!root) {
      return;
    }

    const editor = this.editor();
    const selectedItems = editor.selectedNodesSet.getItems();
    const isChildrenSelected = editor.isChildrenSelected.getValue();

    if (selectedItems.length === 1) {
      if (isChildrenSelected) {
        const node = await editor.addChildNodeToNodeByConfig(config, selectedItems[0]);
        this.selectNode(node);
        return;
      }

      const parent = selectedItems[0].parent.getValue();

      if (parent) {
        const node = await editor.addChildNodeToNodeByConfig(config, parent);
        this.selectNode(node);
        return;
      }
    }

    const nodes = await editor.addNodeByConfig(root.rootName, config);
    this.selectNode(nodes[0]);
  }

  moveSelectedNode(dir: 'up' | 'down'): void {
    const items = this.editor().selectedNodesSet.getItems();
    items.forEach((item) => {
      this.editor().moveNode(item, dir === 'down' ? 1 : -1);
    });
  }

  deleteSelectedNodes(): void {
    const selectedNodes = this.editor().selectedNodesSet.getItems();
    this.editor().deleteNodes(selectedNodes);
  }

  log(): void {
    // todo: simplified nodes log
    console.log(this.editor().nodeRoots.getValue());
  }

  async save() {
    this.fsHandler.save(await this.editor().serialize());
  }

  async load() {
    await this.editor().deserialize(await this.fsHandler.loadFromFile());
  }
}
