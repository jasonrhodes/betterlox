import Database from "better-sqlite3";

export type AdapterType = 'sqlite' | 'postgresql';
export type SqliteDatabaseInstance = InstanceType<typeof Database>;
export type DBInstance = SqliteDatabaseInstance;

export interface SqliteAdapterConfig {
  path: string;
}

export interface PostGresQLAdapterConfig {

}

export type AdapterConfig = SqliteAdapterConfig | PostGresQLAdapterConfig;

interface DBRunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export interface DBStatement<V extends any[], R = unknown> {
  run: (...values: V) => Promise<DBRunResult>,
  all: (...values: V) => Promise<R[]>,
  get: (...values: V) => Promise<R | undefined>
}

export interface DBClient {
  prepare: <V extends any[], R = unknown>(query: string) => DBStatement<V, R>
}