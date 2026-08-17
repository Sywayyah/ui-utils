import { ReactiveValue } from './reactive-value';

export class ReactiveState<T extends object> extends ReactiveValue<T> {
  patch(partialState: Partial<T>): void {
    this.update((val) => ({ ...val, ...partialState }));
  }

  updateWith(fn: (val: T) => T | void): T {
    const currentState = this.getValue();
    const newState = fn(currentState) ?? currentState;

    this.setValue(newState);

    return newState;
  }

  patchWith(fn: (prevState: T) => void | Partial<T>): T {
    const prevState = this.getValue();
    const newState = fn(prevState) ?? prevState;
    const updatedState = { ...prevState, ...newState };
    this.setValue(updatedState);
    return updatedState;
  }

  updateWithCopy(fn: (prevState: T) => void): T {
    const copiedPrevState = { ...this.getValue() };
    // mutates copied state
    fn(copiedPrevState);
    this.setValue(copiedPrevState);
    return copiedPrevState;
  }
}
