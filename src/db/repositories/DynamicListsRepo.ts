import { DynamicList } from "../entities";
import { getDataSource } from "../orm";

export const getDynamicListsRepository = async () => (await getDataSource()).getRepository(DynamicList);