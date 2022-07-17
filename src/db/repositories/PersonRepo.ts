import { Person } from "../entities";
import { getDataSource } from "../orm";

export const getPersonRepository = async () => (await getDataSource()).getRepository(Person);