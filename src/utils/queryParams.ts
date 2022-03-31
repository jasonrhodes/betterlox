export function singleQueryParam(x: string[] | string) {
  return Array.isArray(x) ? x[0] : x;
}

export function numericQueryParam(x: string[] | string) {
  const single = singleQueryParam(x);
  return Number(single);
}