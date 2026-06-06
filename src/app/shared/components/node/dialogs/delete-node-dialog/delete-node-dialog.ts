import { Component, signal } from '@angular/core';
import { BaseDialog } from '../../../../../core/utils/dialogs';
import { UINode } from '../../../../../core/nodes/node';
import { Btn } from '../../../btn/btn';
import { Icon } from '../../../icon/icon';
import { UINodesEditor } from '../../../../../core/nodes/nodes-editor';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MiniUiComponent } from '../../../mini-ui/mini-ui';
import { TypedTemplateDirective } from '../../../../directives/typed-template';

@Component({
  selector: 'app-delete-node-dialog',
  imports: [Btn, Icon, MiniUiComponent, AsyncPipe, NgTemplateOutlet, TypedTemplateDirective],
  templateUrl: './delete-node-dialog.html',
  styleUrl: './delete-node-dialog.scss',
})
export class DeleteNodeDialog extends BaseDialog<
  { readonly node: UINode; readonly editor: UINodesEditor },
  { readonly delete: boolean }
> {
  readonly showReferences = signal(true);

  readonly ParentTemplate!: { readonly node: UINode };
}
