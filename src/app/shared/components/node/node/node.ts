import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { fromObservableInput } from '../../../../core/utils/effects';
import { Btn } from '../../btn/btn';
import { Icon } from '../../icon/icon';
import { NodeInputs } from '../node-inputs/node-inputs';
import { UINode } from '../../../../core/nodes/node';
import { UINodesEditor } from '../../../../core/nodes/nodes-editor';

@Component({
  selector: 'app-node',
  imports: [Btn, Icon, NodeInputs],
  templateUrl: './node.html',
  styleUrl: './node.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Node {
  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();

  readonly config = fromObservableInput(() => {
    const node = this.node();
    return node.config.value$;
  }, undefined);
}
