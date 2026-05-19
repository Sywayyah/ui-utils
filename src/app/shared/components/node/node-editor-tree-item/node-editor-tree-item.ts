import { Component, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { UINode } from '../../../../core/nodes/node';
import { UINodesEditor } from '../../../../core/nodes/nodes-editor';

@Component({
  selector: 'app-node-editor-tree-item',
  imports: [AsyncPipe],
  templateUrl: './node-editor-tree-item.html',
  styleUrl: './node-editor-tree-item.scss',
})
export class NodeEditorTreeItem {
  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();

  selectNode(node: UINode): void {
    const selectedNodesSet = this.editor().selectedNodesSet;

    if (selectedNodesSet.has(node)) {
      this.editor().selectedNodesSet.clear();
      return;
    }

    this.editor().selectedNodesSet.clear();
    this.editor().selectedNodesSet.add(node);
  }
}
