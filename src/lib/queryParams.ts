export function singleQueryParam(x: string[] | string | undefined) {
  return Array.isArray(x) ? x[0] : x;
}

export function numericQueryParam(x: string[] | string | undefined, fallback?: number) {
  const single = singleQueryParam(x);
  const num = Number(single);
  return isNaN(num) ? fallback : num;
}