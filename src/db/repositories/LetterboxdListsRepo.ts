import { LetterboxdList, LetterboxdListFollow, LetterboxdListMovieEntry } from "../entities";
import { getDataSource } from "../orm";

export const getLetterboxdListsRepository = async () => (await getDataSource()).getRepository(LetterboxdList);

export const getLetterboxdListUserFollowersRepository = async () => (await getDataSource()).getRepository(LetterboxdListFollow);
export const getLetterboxdListMovieEntriesRepository = async () => (await getDataSource()).getRepository(LetterboxdListMovieEntry);