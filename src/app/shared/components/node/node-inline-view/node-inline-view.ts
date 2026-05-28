import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UINode } from '../../../../core/nodes/node';
import { NodesRoot, UINodesEditor } from '../../../../core/nodes/nodes-editor';
import { MiniUiComponent } from '../../mini-ui/mini-ui';

@Component({
  selector: 'app-node-inline-view',
  imports: [MiniUiComponent, AsyncPipe],
  template: `<app-mini-ui [miniUi]="ui$() | async" />`,
  styleUrl: './node-inline-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeInlineView {
  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();
  readonly root = input.required<NodesRoot>();

  readonly ui$ = computed(() => {
    const root = this.root();
    const node = this.node();
    const editor = this.editor();

    return root.rootConfig?.params?.getInlineUI?.({ node: node, editor: editor });
  });
}
