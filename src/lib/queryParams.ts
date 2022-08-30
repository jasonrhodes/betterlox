type QueryParam = string[] | string | undefined;

export function singleQueryParam<T extends string>(x: QueryParam) {
  const single = Array.isArray(x) ? x[0] : x;
  return single as T | undefined;
}

export function stringListQueryParam<T extends string>(x: QueryParam) {
  const single = singleQueryParam<T>(x);
  return single ? single.split(',') : [];
}

export function numberListQueryParam<T extends string>(x: QueryParam) {
  const list = stringListQueryParam<T>(x);
  return list ? list.map(v => Number(v)) : [];
}

export function numericQueryParam(x: QueryParam, fallback: number): number;
export function numericQueryParam(x: QueryParam): number | undefined;

export function numericQueryParam(x: QueryParam, fallback?: number) {
  const single = singleQueryParam(x);
  if (typeof single === "undefined" && typeof fallback !== "undefined") {
    return fallback;
  }
  const num = Number(single);
  return isNaN(num) ? fallback : num;
}