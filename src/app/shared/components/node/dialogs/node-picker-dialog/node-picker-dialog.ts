import { CdkListbox, CdkOption, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { Component, computed, forwardRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NodePickerConfig } from '../../../../../core/nodes/editing-context/node-ref';
import { UINode } from '../../../../../core/nodes/node';
import { getDefaultNodePreview, UINodesEditor } from '../../../../../core/nodes/nodes-editor';
import { BaseDialog } from '../../../../../core/utils/dialogs';
import { Btn } from '../../../btn/btn';
import { MiniUiComponent } from '../../../mini-ui/mini-ui';

@Component({
  selector: 'app-node-picker-dialog',
  imports: [FormsModule, Btn, CdkListbox, CdkOption, forwardRef(() => MiniUiComponent)],
  templateUrl: './node-picker-dialog.html',
  styleUrl: './node-picker-dialog.scss',
})
export class NodePickerDialog extends BaseDialog<
  {
    readonly editor: UINodesEditor;
    readonly nodePickerParams: NodePickerConfig;
    readonly node: UINode;
  },
  { readonly node?: UINode }
> {
  readonly searchTerm = signal('');

  readonly nodes = this.dialogData.nodePickerParams.picker({
    editor: this.dialogData.editor,
    node: this.dialogData.node,
  });

  readonly mappedItems = this.nodes.map((node) => ({
    ...(this.dialogData.nodePickerParams.nodeItemMapper?.(node) ??
      this.dialogData.editor.params.nodePreviewer?.(node) ??
      getDefaultNodePreview(node)),
    node,
  }));

  readonly finalItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.mappedItems;

    return this.mappedItems.filter((item) => item.text?.toLowerCase().includes(term));
  });

  pickOption(event: ListboxValueChangeEvent<unknown>): void {
    const node = event.option?.value;
    if (!node) return;
    this.pickNode(node as UINode);
  }

  pickNode(node: UINode): void {
    this.close({ node: node });
  }
}
