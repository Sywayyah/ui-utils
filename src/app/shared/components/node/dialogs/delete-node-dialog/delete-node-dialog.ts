import { Component } from '@angular/core';
import { BaseDialog } from '../../../../../core/utils/dialogs';
import { UINode } from '../../../../../core/nodes/node';
import { Btn } from '../../../btn/btn';
import { Icon } from "../../../icon/icon";

@Component({
  selector: 'app-delete-node-dialog',
  imports: [Btn, Icon],
  templateUrl: './delete-node-dialog.html',
  styleUrl: './delete-node-dialog.scss',
})
export class DeleteNodeDialog extends BaseDialog<
  { readonly node: UINode },
  { readonly delete: boolean }
> {

}
