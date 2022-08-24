import { FilmEntry } from "../../db/entities";

export type SortBy = 'dateRated' | 'stars' | 'movie.title';
export type SortDir = 'ASC' | 'DESC';

export function applyTitleFilter(filterString: string, entries?: FilmEntry[]) {
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

export function applySort(sortBy: SortBy, sortDir: SortDir, entries: FilmEntry[]) {
  if (!Array.isArray(entries)) {
    return [];
  }
  const sorted = entries.sort((a, b) => {
    switch (sortBy) {
      case 'dateRated':
        if (a.date === undefined || b.date === undefined) {
          return 0;
        }
        if (sortDir === 'ASC') {
          return a.date < b.date ? -1 : 1;
        } else {
          return a.date > b.date ? -1 : 1;
        }
      case 'stars':
        if (a.stars === undefined || b.stars === undefined) {
          return 0;
        }
        if (sortDir === 'ASC') {
          return a.stars < b.stars ? -1 : 1;
        } else {
          return a.stars > b.stars ? -1 : 1;
        }
      case 'movie.title':
        if (sortDir === 'ASC') {
          return a.movie.title.localeCompare(b.movie.title);
        } else {
          return a.movie.title.localeCompare(b.movie.title) * -1;
        }
    }
  });
  return sorted;
}