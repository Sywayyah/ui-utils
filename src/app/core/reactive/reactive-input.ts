import { map, Observable } from 'rxjs';
import { ReactiveValue } from './reactive-value';
import { removeItem } from '../utils/arrays';
import { isNotNullish } from '../utils/objects';

export interface InputValidationError {
  readonly errorCode: string;
  readonly description?: string;
}

export interface InputValidator<T> {
  (val: T): InputValidationError | undefined;
}

export class ReactiveInput<T> extends ReactiveValue<T> {
  private validators?: InputValidator<T>[];

  addValidator(validator: InputValidator<T>): void {
    if (!this.validators) {
      this.validators = [validator];
      return;
    }

    this.validators.push(validator);
  }

  removeValidator(validator: InputValidator<T>): void {
    if (!this.validators) return;

    removeItem(this.validators, validator);

    if (!this.validators.length) this.validators = undefined;
  }

  getErrors(): InputValidationError[] {
    return this.validators?.map((validator) => validator(this.getValue())).filter(isNotNullish) ?? [];
  }

  isValid(): boolean {
    return this.getErrors().length === 0;
  }

  listenIsValid(): Observable<boolean> {
    return this.listen().pipe(map(() => this.isValid()));
  }
}
