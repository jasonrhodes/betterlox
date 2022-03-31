import { LOG_LEVELS } from "../common/constants";

const { LOG_LEVEL = "info" } = process.env;

export const log = (level: string, ...messages: Array<any>) => {
  if (LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(LOG_LEVEL)) {
    console.log(`${level}:`, ...messages);
  }
};

export const separator = (level: string) => {
  if (LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(LOG_LEVEL)) {
    console.log("\n---\n");
  }
};
