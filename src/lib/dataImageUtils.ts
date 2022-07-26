import axios from "axios";

export async function getBase64ImageFromUrl(url: string) {
  const image = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(image.data).toString('base64');
}

export function getDataImageTagSource(base64string: string) {
  return `data:image/jpeg;base64,${base64string}`;
}

export async function getDataImageTagFromUrl(url: string) {
  const b64 = await getBase64ImageFromUrl(url);
  return getDataImageTagSource(b64);
}