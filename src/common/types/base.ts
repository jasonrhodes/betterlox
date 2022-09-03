import { Movie } from "../../db/entities";

export type LetterboxdAccountLevel = 'basic' | 'pro' | 'patron';
export type PartialMovie = Partial<Movie> & { id: number; };

