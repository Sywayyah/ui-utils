import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  Injector,
  input,
} from '@angular/core';
import { UINode } from '../../../../core/nodes/node';
import { UINodeConfig } from '../../../../core/nodes/node-config';
import { UINodesEditor } from '../../../../core/nodes/nodes-editor';
import { fromObservableInput } from '../../../../core/utils/effects';
import { ReactiveValueBindDirective } from '../../../directives/reactive-bind';
import { Btn } from '../../btn/btn';
import { DropdownOptionComponent } from '../../dropdown/dropdown-option.component';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { Icon } from '../../icon/icon';
import { MiniUiComponent } from '../../mini-ui/mini-ui';
import { InputsService } from '../inputs/inputs.service';

@Component({
  selector: 'app-node-inputs',
  imports: [
    Btn,
    CdkDropList,
    CdkDrag,
    AsyncPipe,
    Icon,
    ReactiveValueBindDirective,
    NgComponentOutlet,
    DropdownComponent,
    DropdownOptionComponent,
    forwardRef(() => MiniUiComponent),
  ],
  templateUrl: './node-inputs.html',
  styleUrl: './node-inputs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeInputs {
  readonly injector = inject(Injector);
  readonly inputsService = inject(InputsService);

  readonly node = input.required<UINode>();
  readonly editor = input.required<UINodesEditor>();

  readonly inputs = fromObservableInput(() => this.node().listenInputs(), []);

  addInputValue(inputName: keyof UINodeConfig['inputs']): void {
    this.node().addInputValue(inputName);
  }
}
