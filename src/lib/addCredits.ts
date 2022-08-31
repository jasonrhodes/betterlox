import { CreditsResponse } from "moviedb-promise/dist/request-types";
import { JOB_ALLOW_LIST } from "../common/constants";
import { Movie } from "../db/entities";
import { getCastRepository, getCrewRepository } from "../db/repositories";

export async function addCast({ cast, movieId }: { cast: CreditsResponse['cast'], movieId: number }) {
  if (!cast) {
    return [];
  }
  const CastRepo = await getCastRepository();
  const filtered = cast.filter((role) => typeof role.order === "number" && role.order <= 50);
  const synced = await Promise.all(
    filtered.map(
      role => CastRepo.createFromTmdb(movieId, role)
    )
  );
  return synced;
}

export async function addCrew({ crew, movieId }: { crew: CreditsResponse['crew'], movieId: number }) {
  if (!crew) {
    return [];
  }
  const CrewRepo = await getCrewRepository();
  const filtered = crew.filter((role) => role.job && JOB_ALLOW_LIST.includes(role.job));
  const synced = await Promise.all(
    filtered.map(
      role => CrewRepo.createFromTmdb(movieId, role)
    )
  );
  return synced;
}