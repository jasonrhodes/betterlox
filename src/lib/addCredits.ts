import { CreditsResponse } from "moviedb-promise/dist/request-types";
import { JOB_ALLOW_LIST } from "../common/constants";
import { Movie } from "../db/entities";
import { getCastRepository, getCrewRepository } from "../db/repositories";

export async function addCast({ cast, movie }: { cast: CreditsResponse['cast'], movie: Movie }) {
  if (!cast) {
    return [];
  }
  const CastRepo = await getCastRepository();
  const filtered = cast.filter((role) => typeof role.order === "number" && role.order <= 50);
  const synced = await Promise.all(
    filtered.map(
      role => CastRepo.createFromTmdb(movie.id, role)
    )
  );
  return synced;
}

export async function addCrew({ crew, movie }: { crew: CreditsResponse['crew'], movie: Movie }) {
  if (!crew) {
    return [];
  }
  const CrewRepo = await getCrewRepository();
  const filtered = crew.filter((role) => role.job && JOB_ALLOW_LIST.includes(role.job));
  const synced = await Promise.all(
    filtered.map(
      role => CrewRepo.createFromTmdb(movie.id, role)
    )
  );
  return synced;
}