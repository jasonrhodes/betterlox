import { UserSettings } from "../entities";
import { getDataSource } from "../orm";

export const getUserSettingsRepository = async () => (await getDataSource()).getRepository(UserSettings);