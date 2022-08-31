import { UnknownItem } from "../entities";
import { getDataSource } from "../orm";

export const getUnknownItemsRepository = async () => (await getDataSource()).getRepository(UnknownItem);