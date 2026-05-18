export async function serializeFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}

export function deserializeToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

export function deserializeToFile(dataUrl: string, fileName: string): File {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) throw new Error('Not DataURL');

  const base64Data = dataUrl.substring(commaIndex + 1);
  const header = dataUrl.substring(0, commaIndex);

  const cleanBase64 = base64Data.replace(/\s/g, '');

  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';

  return new File([bytes], fileName, { type: mime });
}
