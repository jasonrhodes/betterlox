import { EntryApiResponse } from "../../common/types/api";
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

function sortByLetterboxdDate(a: EntryApiResponse, b: EntryApiResponse, sortDir: SortDir) {
  // sort by date DESC, then by sortId ASC
  // date is no longer tied to the entry date, but
  // rather to the 'collection' date, so we store
  // a sortId that shows what order it was on the
  // letterboxd page and use that instead -- but it's
  // only valid per collection, so we want the latest
  // collection batch first (we could maybe just use
  // sortId but for now we use both)
  if (!a.date && !b.date) {
    return 0;
  }
  if (!a.date) {
    return 1;
  }
  if (!b.date) {
    return -1;
  }
  if (a.date === b.date) {
    if (!a.sortId || !b.sortId) {
      return 0;
    }
    if (sortDir === 'ASC') {
      return a.sortId > b.sortId ? -1 : 1;
    } else {
      return a.sortId < b.sortId ? -1 : 1;
    }
  } else if (sortDir === 'ASC') {
    return a.date < b.date ? -1 : 1;
  } else {
    return a.date > b.date ? -1 : 1;
  }
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
          return sortByLetterboxdDate(a, b, sortDir);
        case 'stars':
          if (a.stars === b.stars) {
            return sortByLetterboxdDate(a, b, 'DESC');
          }
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