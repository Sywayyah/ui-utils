export class FileHandler<T> {
  private readonly defaultFileTypes: FilePickerAcceptType[] = [
    { accept: { 'application/json': '.json' } },
  ];

  async loadFromFile(): Promise<T> {
    const [handler] = await window.showOpenFilePicker({
      types: this.defaultFileTypes,
    });
    const file = await handler.getFile();
    const content = await file.text();
    return await JSON.parse(content);
  }

  async save(data: T) {
    const handle = await window.showSaveFilePicker({
      types: this.defaultFileTypes,
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();
  }
}
