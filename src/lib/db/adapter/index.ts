import { AdapterType, AdapterConfig, DBInstance, DBClient } from "./types";
import { getClient as getSqliteClient } from "./sqlite3";

export function getDBClient(type: AdapterType, config: AdapterConfig): DBClient {
  if (type === "sqlite" && "path" in config) {
    return getSqliteClient(config);
  }

  throw new Error(`Type "${type}" and provided config do not match any known db adapters`);
}