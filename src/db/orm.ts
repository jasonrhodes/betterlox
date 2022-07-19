import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as entities from "./entities";

type Mutable<T> = { -readonly [P in keyof T ]: T[P] };
type MyDataSourceOptions = Mutable<DataSourceOptions>;

let dataSource: DataSource | null = null;

async function init() {
  const { DATABASE_TYPE } = process.env;
  let dbOptions: MyDataSourceOptions = {} as MyDataSourceOptions;

  if (!DATABASE_TYPE) {
    throw new Error("Invalid database configuration, no database type provided");
  }

  switch (DATABASE_TYPE) {
    case "sqlite":
    case "better-sqlite3":
      dbOptions.type = "sqlite";
      const { DATABASE_PATH } = process.env;
      if (!DATABASE_PATH) {
        throw new Error(`Invalid database configuration, sqlite chosen but no path provided`);
      }
      dbOptions.database = DATABASE_PATH;
      break;
    case "postgres":
      const { DATABASE_URL } = process.env;
      if (!DATABASE_URL) {
        throw new Error(`Invalid database configuration, postgres chosen but url or authentication not provided`);
      }
      dbOptions = {
        type: "postgres",
        url: DATABASE_URL
      };
      if (process.env.DATABASE_MODE && process.env.DATABASE_MODE === "dev") {
        dbOptions.ssl = {
          rejectUnauthorized: false
        }
      } else {
        dbOptions.ssl = true;
      }
      if (process.env.DATABASE_HOST) {
        dbOptions.host = process.env.DATABASE_HOST;
      }
      if (process.env.DATABASE_PORT) {
        dbOptions.port = Number(process.env.DATABASE_PORT);
      }
      if (process.env.DATABASE_USERNAME) {
        dbOptions.username = process.env.DATABASE_USERNAME;
      }
      if (process.env.DATABASE_PASSWORD) {
        dbOptions.password = process.env.DATABASE_PASSWORD;
      }
      if (process.env.DATABASE_NAME) {
        dbOptions.database = process.env.DATABASE_NAME;
      }
      if (process.env.DATABASE_SCHEMA) {
        dbOptions.schema = process.env.DATABASE_SCHEMA;
      }
      break;
  }
  const ds = new DataSource({
    ...dbOptions,
    entities,
    logging: false,
    synchronize: true
  });

  dataSource = await ds.initialize();
}

init();

export async function getDataSource(): Promise<DataSource> {
  if (dataSource === null) {
    return await new Promise((resolve) => setTimeout(() => resolve(getDataSource()), 100));
  }

  return dataSource;
}