export function singleQueryParam<T extends string>(x: string[] | string | undefined) {
  const single = Array.isArray(x) ? x[0] : x;
  return single as T | undefined;
}

export function stringListQueryParam<T extends string>(x: string[] | string | undefined) {
  const single = singleQueryParam<T>(x);
  return single ? single.split(',') : [];
}

export function numericQueryParam(x: string[] | string | undefined, fallback: number): number;
export function numericQueryParam(x: string[] | string | undefined): number | undefined;

export function numericQueryParam(x: string[] | string | undefined, fallback?: number) {
  const single = singleQueryParam(x);
  if (typeof single === "undefined" && typeof fallback !== "undefined") {
    return fallback;
  }
  const num = Number(single);
  return isNaN(num) ? fallback : num;
}