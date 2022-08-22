import { RatingsFilters, StatsFilters } from "../common/types/api";

type FilterValue = string | number | boolean | Array<FilterValue>;

export function convertFiltersToQueryString<T extends RatingsFilters | StatsFilters>(filters: T) {
  const keys = Object.keys(filters) as Array<keyof T>;
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