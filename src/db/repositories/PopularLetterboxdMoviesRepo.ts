import { PopularLetterboxdMovie } from "../entities";
import { getDataSource } from "../orm";

export const getPopularLetterboxdMoviesRepository = async () => (await getDataSource()).getRepository(PopularLetterboxdMovie);