import { RatingsFilters } from "../../common/types/api";
import { Rating } from "../../db/entities";

export type SortBy = 'date' | 'stars' | 'movie.title';
export type SortDir = 'ASC' | 'DESC';

export function applyTitleFilter(filterString: string, ratings?: Rating[]) {
  if (!ratings) {
    return [];
  }
  if (filterString.length === 0) {
    return ratings;
  }
  return ratings.filter((r) => {
    const spacesReplaced = filterString.replace(' ', '.*')
    const regexp = new RegExp(`.*${spacesReplaced}.*`, 'i');
    return regexp.test(r.name);
  });
}

export function applySort(sortBy: SortBy, sortDir: SortDir, ratings: Rating[]) {
  if (!Array.isArray(ratings)) {
    return [];
  }
  const sorted = ratings.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        if (sortDir === 'ASC') {
          return a.date < b.date ? -1 : 1;
        } else {
          return a.date > b.date ? -1 : 1;
        }
      case 'stars':
        if (sortDir === 'ASC') {
          return a.stars < b.stars ? -1 : 1;
        } else {
          return a.stars > b.stars ? -1 : 1;
        }
      case 'movie.title':
        if (sortDir === 'ASC') {
          return a.movie?.title.localeCompare(b.movie?.title);
        } else {
          return a.movie?.title.localeCompare(b.movie?.title) * -1;
        }
    }
  });
  return sorted;
}

export function convertFiltersToQueryString(filters: RatingsFilters) {
  const keys = Object.keys(filters) as Array<keyof RatingsFilters>;
  const queries = keys.reduce<string[]>((queries, key) => {
    const values = filters[key];
    if (!values) {
      return queries;
    }
    if (Array.isArray(values)) {
      queries.push(`${key}=${values.join(',')}`);
    } else {
      queries.push(`${key}=${values}`);
    }
    return queries;
  }, []);

  return queries.join('&');
}