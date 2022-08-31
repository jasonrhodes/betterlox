import { SyncType, SyncStatus } from "../../common/types/db";
import { Movie, PopularLetterboxdMovie, Sync } from "../../db/entities";
import { getSyncRepository, getFilmEntriesRepository, getMoviesRepository, getPopularLetterboxdMoviesRepository } from "../../db/repositories";
import { BetterloxApiError } from "../BetterloxApiError";
import { scrapeMoviesByYearByPage } from "../letterboxd";

export interface SyncAllMoviesByYearOptions {
  startYear: number;
  endYear?: number;
}

function isNumber(v: unknown): v is number {
  return typeof v === "number";
}

async function processPage(set: Partial<PopularLetterboxdMovie>[]) {
  const PopularLetterboxdMoviesRepo = await getPopularLetterboxdMoviesRepository();
  let numSynced = 0;
  for (let i = 0; i < set.length; i++) {
    const plm = set[i];
    try {
      const created = PopularLetterboxdMoviesRepo.create(plm);
      await PopularLetterboxdMoviesRepo.save(created);
    } catch (error: unknown) {
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found while saving popular movie', plm.name);
      throw new BetterloxApiError('', { error });
    }
    numSynced++;
  }
  return numSynced;
}

export async function syncAllMoviesByYear(sync: Sync, options: SyncAllMoviesByYearOptions) {
  const SyncRepo = await getSyncRepository();
  const now = new Date();
  const { startYear, endYear = now.getFullYear() } = options;

  let numSynced = 0;

  for (let year = startYear; year < endYear; year++) {
    console.log(`Syncing popular letterboxd movies for year: ${year}`)
    try {
      const page1 = await scrapeMoviesByYearByPage(year, 1);
      numSynced += await processPage(page1.movies);
      const page2 = await scrapeMoviesByYearByPage(year, 2);    
      numSynced += await processPage(page2.movies);
    } catch (error: unknown) {
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found during year-by-year page scraping and processing, for year:', year);
      throw new BetterloxApiError('', { error });
    }
  }

  await SyncRepo.endSync(sync, {
    type: SyncType.MOVIES,
    status: SyncStatus.COMPLETE,
    numSynced
  });

  return numSynced;
}