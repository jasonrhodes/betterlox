import {
  findMissingCastMembers,
  findMissingCrewMembers,
  getPerson,
  insertPerson,
} from "../db/client";
import { log, separator } from "./logger";
import { tmdb } from "./tmdb";
import { backoff } from "./backoff";

export async function syncPeople(batchSize: number) {
  const missingCastIds = await findMissingCastMembers();
  separator("debug");
  log("info", `Total missing cast members remaining: ${missingCastIds.length}`);
  separator("debug");

  if (missingCastIds.length > 0) {
    const batch = missingCastIds.slice(0, batchSize);
    log(
      "debug",
      `About to sync ${batch.length} cast members (${batch.join(", ")})`
    );
    await syncPeopleIds(batch);
    return { continue: true };
  }

  const missingCrewIds = await findMissingCrewMembers();
  separator("debug");
  log("info", `Total missing crew members remaining: ${missingCrewIds.length}`);
  separator("debug");

  if (missingCrewIds.length > 0) {
    const batch = missingCrewIds.slice(0, batchSize);
    log(
      "debug",
      `About to sync ${batch.length} crew members (${batch.join(", ")})`
    );
    await syncPeopleIds(batch);
    return { continue: true };
  }

  log("info", "All people have been synced");
  return { continue: false };
}

async function syncPeopleIds(ids: number[]) {
  return Promise.all(ids.map((id) => getPersonAndStore(id)));
}

async function getPersonAndStore(tmdbPersonId: number) {
  // look up person from TMDB
  const person = await backoff(() => tmdb.personInfo(tmdbPersonId), 5); // todo move backoff to tmdb class or something

  log("verbose", "Person retrieved", JSON.stringify(person));

  if (!person.id) {
    throw new Error(
      `person retreived from TMDB API with no id value ${tmdbPersonId}`
    );
  }

  // add person to cache database
  log(
    "debug",
    `upserting person now ${person.name} (${person.id} / ${tmdbPersonId})`
  );
  await insertPerson(person);

  log("debug", `finished upserting ${person.name} (${person.id})`);
}
