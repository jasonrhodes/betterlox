import { Movie } from "../../db/entities";

export type LetterboxdAccountLevel = 'basic' | 'pro' | 'patron';
export type PartialMovie = Partial<Movie> & { id: number; };

export type ListSortBy = 'publishDate' | 'lastUpdated' | 'title';
export type ListScope = 'user-owned' | 'user-following' | 'all';

