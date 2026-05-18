import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { inject } from '@angular/core';

export class BaseDialog<T, R = undefined> {
  readonly dialogData = inject<T>(DIALOG_DATA);
  readonly dialogRef = inject(DialogRef<R, T>);

  close(val?: R): void {
    this.dialogRef.close(val);
  }
}

export class DialogOpener {
  private readonly dialogService = inject(Dialog);

  open<T, R = undefined>(dialog: typeof BaseDialog<T, R>, { data }: { data: T }): DialogRef<R, T> {
    return this.dialogService.open(dialog as any, { data });
  }
}

export function injectDialogOpener(): DialogOpener {
  return new DialogOpener();
}
