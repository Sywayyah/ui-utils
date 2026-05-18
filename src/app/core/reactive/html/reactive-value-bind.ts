import { Subscription } from 'rxjs';
import { ReactiveValue } from '../reactive-value';
import { getInputElemValue, setInputElemValue } from './html-utils';

type ReactiveElementBindParams<T> = Partial<{
  readonly onValueChange: (val: T) => void;
}>;

// optimized not to rely on closures
export class ReactiveValueBindRef<T> implements EventListenerObject {
  private subscription?: Subscription;

  constructor(
    private readonly elem: HTMLElement,
    private readonly value: ReactiveValue<T>,
    private readonly params: ReactiveElementBindParams<T> = {},
  ) {
    // Model -> View
    this.subscription = this.value.listen().subscribe((val) => {
      this.setInputElemValue(val);
      this.params.onValueChange?.(val);
    });

    // View -> Model
    this.elem.addEventListener('input', this);
    this.elem.addEventListener('change', this);
  }

  // implementing EventListenerObject for optimization
  handleEvent(event: Event): void {
    if (event.type === 'input' || event.type === 'change') {
      this.value.setValue(this.getInputElemValue());
    }
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;

    this.elem.removeEventListener('input', this);
    this.elem.removeEventListener('change', this);
  }

  private getInputElemValue(): T {
    return getInputElemValue(this.elem as HTMLInputElement);
  }

  private setInputElemValue(value: T): void {
    setInputElemValue(this.elem as HTMLInputElement, value);
  }
}

export function bindReactiveValueToElement<T>(
  elem: HTMLElement,
  value: ReactiveValue<T>,
  params: ReactiveElementBindParams<T> = {},
): ReactiveValueBindRef<T> {
  return new ReactiveValueBindRef(elem, value, params);
}
