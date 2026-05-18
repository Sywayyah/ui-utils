function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getInputElemValue(input: HTMLInputElement): any {
  switch (input.type) {
    case 'checkbox':
      return input.checked;

    case 'number':
    case 'range':
      return input.value === '' ? null : input.valueAsNumber;

    case 'date':
      return input.valueAsDate;

    case 'datetime-local':
      return input.value ? new Date(input.value) : null;

    case 'time':
      return input.value;

    default:
      return input.value;
  }
}

export function setInputElemValue(input: HTMLInputElement, value: any): void {
  switch (input.type) {
    case 'checkbox':
      input.checked = !!value;
      break;

    case 'number':
    case 'range':
      input.value = value ?? '';
      break;

    case 'date':
      input.valueAsDate = value ?? null;
      break;

    case 'datetime-local':
      input.value = value ? toDateTimeLocal(value) : '';
      break;

    case 'time':
      input.value = value ?? '';
      break;

    default:
      input.value = value ?? '';
  }
}
