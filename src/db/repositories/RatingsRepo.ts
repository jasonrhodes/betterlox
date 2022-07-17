import { Rating } from "../entities/Rating";
import { getDataSource } from "../orm";

export const getRatingsRepository = async () => (await getDataSource()).getRepository(Rating);