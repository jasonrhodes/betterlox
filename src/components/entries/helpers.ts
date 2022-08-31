import { EntryApiResponse } from "../../common/types/api";
import { getErrorAsString } from "../../lib/getErrorAsString";

export type SortBy = 'dateRated' | 'stars' | 'movie.title';
export type SortDir = 'ASC' | 'DESC';

export function applyTitleFilter(filterString: string, entries?: EntryApiResponse[]) {
  if (!entries) {
    return [];
  }
  if (filterString.length === 0) {
    return entries;
  }
  return entries.filter((r) => {
    const spacesReplaced = filterString.replace(' ', '.*')
    const regexp = new RegExp(`.*${spacesReplaced}.*`, 'i');
    return regexp.test(r.name);
  });
}

export function applySort(sortBy: SortBy, sortDir: SortDir, entries: EntryApiResponse[]) {
  if (!Array.isArray(entries)) {
    return [];
  }
  const unrated = entries.filter((e) => e.stars === null);
  const rated = entries.filter((e) => typeof e.stars === "number");
  rated.sort((a, b) => {
    try {
      switch (sortBy) {
        case 'dateRated':  
          if (!a.dateRated && !b.dateRated) {
            return 0;
          }
          if (!a.dateRated) {
            return 1;
          }
          if (!b.dateRated) {
            return -1;
          }
          if (sortDir === 'ASC') {
            return a.dateRated < b.dateRated ? -1 : 1;
          } else {
            return a.dateRated > b.dateRated ? -1 : 1;
          }
        case 'stars':
          if (sortDir === 'ASC') {
            return a.stars! < b.stars! ? -1 : 1;
          } else {
            return a.stars! > b.stars! ? -1 : 1;
          }
        case 'movie.title':
          if (sortDir === 'ASC') {
            return a.movie.title.localeCompare(b.movie.title);
          } else {
            return a.movie.title.localeCompare(b.movie.title) * -1;
          }
        default:
          return 0;
      }
    } catch (error: unknown) {
      console.log('oh no an error hath happened', getErrorAsString(error), a.name);
      throw error;
    }
  });
  // return unrated;
  return [...rated, ...unrated];
}