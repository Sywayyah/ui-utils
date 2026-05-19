import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
} from '@angular/core';
import { of } from 'rxjs';
import { MiniUI } from '../../../core/mini-ui/mini-ui';
import { fromObservableInput } from '../../../core/utils/effects';
import { MiniUIService } from './mini-ui.service';

@Component({
  selector: 'app-mini-ui',
  imports: [NgComponentOutlet],
  templateUrl: './mini-ui.html',
  styleUrl: './mini-ui.scss',
  host: {
    '[style]': 'hostStyles()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniUiComponent {
  readonly miniUiService = inject(MiniUIService);
  readonly injector = inject(Injector);

  readonly miniUi = input<MiniUI | null>();

  readonly elems = fromObservableInput(() => this.miniUi()?.elems.value$ ?? of([]), []);
  readonly hostStyles = computed(() => this.miniUi()?.params.hostStyles);
}
