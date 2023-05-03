import { GlobalFilters } from "../common/types/api";

export function convertFiltersToQueryString(filters: GlobalFilters) {
  const keys = Object.keys(filters) as Array<keyof GlobalFilters>;  
  const queries = keys.reduce<string[]>((queries, key) => {
    const values = filters[key];
    if (!values) {
      return queries;
    }
    if (Array.isArray(values)) {
      queries.push(`${String(key)}=${values.join(',')}`);
    } else {
      queries.push(`${String(key)}=${values}`);
    }
    return queries;
  }, []);

  return queries.join('&');
}