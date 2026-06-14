import { ReactiveValue } from '../reactive/reactive-value';
import { throwError } from './general';

export class FileHandler<T> {
  private readonly defaultFileTypes: FilePickerAcceptType[] = [
    { accept: { 'application/json': '.json' } },
  ];

  readonly fileData = new ReactiveValue<null | {
    readonly file: File;
    readonly handler: FileSystemFileHandle;
  }>(null);

  async loadFromFile(): Promise<T> {
    const [handler] = await window.showOpenFilePicker({
      types: this.defaultFileTypes,
    });
    const file = await handler.getFile();
    this.fileData.setValue({ file, handler });
    const content = await file.text();
    return await JSON.parse(content);
  }

  async save(data: T): Promise<void> {
    const fileData = this.fileData.getValue();
    if (!fileData) throwError("Cannot save since current file isn't opened");
    const writable = await fileData.handler.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();
  }

  async saveAs(data: T): Promise<void> {
    const handle = await window.showSaveFilePicker({
      types: this.defaultFileTypes,
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();
  }
}
