import { AsyncPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { UINode } from '../../../../core/nodes/node';
import { UINodesEditor } from '../../../../core/nodes/nodes-editor';
import { MiniUiComponent } from '../../mini-ui/mini-ui';

@Component({
  selector: 'app-node-editor-tree-item',
  imports: [AsyncPipe, MiniUiComponent],
  templateUrl: './node-editor-tree-item.html',
  styleUrl: './node-editor-tree-item.scss',
})
export class NodeEditorTreeItem {
  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();
  readonly previewer = computed(() => this.editor().params.nodePreviewer?.(this.node()));

  selectNodeChildren(): void {
    const editor = this.editor();
    editor.isChildrenSelected.setValue(true);

    editor.selectedNodesSet.clear();
    editor.selectedNodesSet.add(this.node());
  }

  selectNode(node: UINode): void {
    const selectedNodesSet = this.editor().selectedNodesSet;
    const editor = this.editor();
    const wasChildrenSelected = editor.isChildrenSelected.getValue();
    editor.isChildrenSelected.setValue(false);

    if (selectedNodesSet.has(node) && !wasChildrenSelected) {
      selectedNodesSet.clear();
      return;
    }

    selectedNodesSet.clear();
    selectedNodesSet.add(node);
  }
}
