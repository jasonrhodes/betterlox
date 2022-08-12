export function singleQueryParam<T extends string>(x: string[] | string | undefined) {
  const single = Array.isArray(x) ? x[0] : x;
  return single as T | undefined;
}

export function numericQueryParam(x: string[] | string | undefined, fallback?: number) {
  const single = singleQueryParam(x);
  const num = Number(single);
  return isNaN(num) ? fallback : num;
}