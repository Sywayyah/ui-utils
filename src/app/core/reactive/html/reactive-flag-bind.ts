import { Subscription } from 'rxjs';
import { ReactiveFlags } from '../reactive-flags';
import { getInputElemValue, setInputElemValue } from './html-utils';


type ReactiveFlagsBindParams = Partial<{
  readonly onValueChange: (val: boolean) => void;
}>;

// optimized not to rely on closures
export class ReactiveFlagsBindRef<T extends number> implements EventListenerObject {
  private subscription?: Subscription;

  constructor(
    private readonly elem: HTMLElement,
    private readonly flags: ReactiveFlags<T>,
    private readonly flag: T,
    private readonly params: ReactiveFlagsBindParams = {},
  ) {
    // Model -> View
    this.subscription = this.flags.listenIsFlagEnabled(flag).subscribe((val) => {
      this.setInputElemValue(val);
      this.params.onValueChange?.(val);
    });

    // View -> Model
    this.elem.addEventListener('input', this);
  }

  // implementing EventListenerObject for optimization
  handleEvent(event: Event): void {
    if (event.type === 'input') {
      this.flags.setFlag(this.flag, this.getInputElemValue());
    }
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    this.elem.removeEventListener('input', this);
  }

  private getInputElemValue(): boolean {
    return getInputElemValue(this.elem as HTMLInputElement);
  }

  private setInputElemValue(value: boolean): void {
    setInputElemValue(this.elem as HTMLInputElement, value);
  }
}

export function bindReactiveFlagToElement<T extends number>(
  elem: HTMLElement,
  value: ReactiveFlags<T>,
  flag: T,
  params: ReactiveFlagsBindParams = {},
): ReactiveFlagsBindRef<T> {
  return new ReactiveFlagsBindRef(elem, value, flag, params);
}
