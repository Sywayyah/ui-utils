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
  }

  async addChildNode(root: NodesRoot | undefined, config: UINodeConfig) {
    if (!root) {
      return;
    }

    const editor = this.editor();
    const selectedItems = editor.selectedNodesSet.getItems();
    const isChildrenSelected = editor.isChildrenSelected.getValue();

    if (selectedItems.length === 1 && isChildrenSelected) {
      const node = await editor.addChildNodeToNodeByConfig(config, selectedItems[0]);
      this.selectNode(node);
      return;
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
