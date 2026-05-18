import { ReactiveBase } from './reactive-base';

export class ReactiveValue<T> extends ReactiveBase<T> {
  constructor(readonly initVal: T) {
    super(initVal);
  }
}
