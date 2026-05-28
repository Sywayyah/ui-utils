import { NgComponentOutlet } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, Injector, computed } from "@angular/core";
import { InputsService } from "../../shared/components/node/inputs/inputs.service";
import { MiniUINodeInput } from "./mini-ui";
import { MiniUIBaseComponent } from "./mini-ui-components";

@Component({
  template: `
    @let component = cmp();
    <ng-container
      *ngComponentOutlet="
        component;
        injector: injector;
        inputs: {
          node: node(),
          editor: editor(),
          context: context(),
          inputParams: context().inputConfig.config.params,
        }
      "
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
})
// basic input
export class MiniUINodeInputComponent extends MiniUIBaseComponent<MiniUINodeInput<any, any>> {
  readonly inputsService = inject(InputsService);
  readonly injector = inject(Injector);

  readonly node = computed(() => this.elem().elem.params.node);
  readonly editor = computed(() => this.elem().elem.params.editor);

  readonly context = computed(() => {
    const elem = this.elem();
    const ctx = elem.elem.params.node.getInputContextInstance(elem.elem.params.inputName);

    return ctx;
  });

  readonly cmp = computed(() => {
    return this.inputsService.getComponentForConfig(this.context());
  });
}
