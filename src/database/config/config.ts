import { Options } from "sequelize";

export type Environment = 'development' | 'production' | 'test';
export const environments: Record<Environment, Options> = {
  "development": {
    "storage": ":memory:",
    "dialect": "sqlite"
  },
  "test": {
    "storage": "./.db/movies.db",
    "dialect": "sqlite"
  },
  "production": {
    "storage": process.env.DATABASE_URL,
    "dialect": "postgres"
  }
}