import { LetterboxdList, LetterboxdListMovieEntry } from "../entities";
import { getDataSource } from "../orm";

export const getLetterboxdListsRepository = async () => (await getDataSource()).getRepository(LetterboxdList);

export const getLetterboxdListMovieEntriesRepository = async () => (await getDataSource()).getRepository(LetterboxdListMovieEntry);