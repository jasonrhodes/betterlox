import { CastRole } from "../entities";
import { getDataSource } from "../orm";

export const getCastRepository = async () => (await getDataSource()).getRepository(CastRole);