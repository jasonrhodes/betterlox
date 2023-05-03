import { PersonStats, AllStatsType, StatMode } from "@rhodesjason/loxdb/dist/common/types/db";
import { Collection } from "@rhodesjason/loxdb/dist/db/entities";

export function isPeople(list: PersonStats[] | Collection[], type: AllStatsType): list is PersonStats[] {
  return ["actors", "directors", "writers", "cinematographers", "editors"].includes(type);
}

export function isCollections(list: PersonStats[] | Collection[], type: AllStatsType): list is Collection[] {
  return type === "collections";
}

export function getTitleByMode(mode: StatMode, value: string) {
  const prefix = mode === "most" ? "Most Watched" : "Highest Rated";
  return `My ${prefix} ${value}`;
}
