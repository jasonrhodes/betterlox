import { DBClient, DBStatement, SqliteAdapterConfig } from "./types";
import Database, { Statement } from "better-sqlite3";

export function getClient(config: SqliteAdapterConfig) {
  return new SqliteClient(config);
}

class SqliteClient implements DBClient {
  db: InstanceType<typeof Database>;

  constructor(config: SqliteAdapterConfig) {
    this.db = new Database(config.path);
  }

  prepare<V extends any[], R = unknown>(query: string) {
    const stmt = this.db.prepare<V>(query);
    return new SqliteStatement<V, R>(stmt);
  }
}

class SqliteStatement<V extends any[], R = unknown> implements DBStatement<V, R> {
  stmt: Statement<V>;

  constructor(stmt: Statement<V>) {
    this.stmt = stmt;
  }

  async run(...values: V) {
    return this.stmt.run(...values);
  }

  async all(...values: V) {
    return this.stmt.all(...values) as R[];
  }

  async get(...values: V) {
    return this.stmt.get(...values) as R | undefined;
  }
}