import { EntryApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";

export type FilmEntrySortBy = 'date' | 'stars' | 'movie.title';
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

export function applySort(sortBy: FilmEntrySortBy, sortDir: SortDir, entries: EntryApiResponse[]) {
  if (!Array.isArray(entries)) {
    return [];
  }
  const unrated = entries.filter((e) => e.stars === null);
  const rated = entries.filter((e) => typeof e.stars === "number");
  rated.sort((a, b) => {
    try {
      switch (sortBy) {
        case 'date':  
          if (!a.date && !b.date) {
            return 0;
          }
          if (!a.date) {
            return 1;
          }
          if (!b.date) {
            return -1;
          }
          if (sortDir === 'ASC') {
            return a.date < b.date ? -1 : 1;
          } else {
            return a.date > b.date ? -1 : 1;
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