import "reflect-metadata";
import { DataSource } from "typeorm";

// interface GetOptions {
//   forceRefresh?: boolean;
// }

// let cachedDataSource: DataSource | null = null;

export const dataSource = new DataSource({
  type: "sqlite",
  database: "../../.db/movies.db",
  entities: [__dirname + '/../entities/*.{js,ts}']
});

// export function getDataSource({ forceRefresh = false }: GetOptions | undefined = {}) {
//   if (cachedDataSource === null || forceRefresh) {
//     cachedDataSource = new DataSource({
//       type: "sqlite",
//       database: "../../.db/movies.db",
//       entities: [__dirname + '/../entities/*.{js,ts}']
//     });

//     cachedDataSource.initialize();
//   }

//   return cachedDataSource;
// }