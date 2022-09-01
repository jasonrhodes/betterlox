import { SyncType, SyncStatus } from "../../common/types/db";
import { Movie, PopularLetterboxdMovie, Sync } from "../../db/entities";
import { 
  getSyncRepository, 
  getFilmEntriesRepository, 
  getMoviesRepository, 
  getPopularLetterboxdMoviesRepository 
} from "../../db/repositories";
import { BetterloxApiError } from "../BetterloxApiError";
import { scrapeMoviesByPage } from "../letterboxd";
import { MoreThan } from "typeorm";
import { GENRES } from "../../common/constants";

export interface SyncAllMoviesByDateRangeOptions {
  startYear: number;
  endYear: number;
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

export async function syncPopularMoviesPerYear(sync: Sync) {
  const SyncRepo = await getSyncRepository();
  sync.type = SyncType.POPULAR_MOVIES_YEAR;
  await SyncRepo.save(sync);
  const now = new Date();
  const hoursBetween = 1;
  const cutoff = (new Date(now.getTime() - (1000 * 60 * 60 * hoursBetween))).toISOString();

  const completedDuringPastInterval = await SyncRepo.findBy({
    finished: MoreThan(new Date(cutoff)),
    status: SyncStatus.COMPLETE,
    type: SyncType.POPULAR_MOVIES_YEAR
  });

  if (completedDuringPastInterval) {
    return 0;
  }

  const lastPopularYearSync = await SyncRepo.find({
    where: {
      type: SyncType.POPULAR_MOVIES_YEAR,
      status: SyncStatus.COMPLETE
    },
    order: {
      finished: 'DESC'
    },
    take: 1
  });

  let startYear = 1900;
  let endYear = 1910;

  if (lastPopularYearSync.length > 0 && lastPopularYearSync[0].secondaryId) {
    const lastRange = lastPopularYearSync[0].secondaryId;
    startYear = Number(lastRange.substring(5));
    const now = new Date();
    endYear = Math.min(now.getUTCFullYear(), startYear + 20);
  }

  console.log('Syncing popular movies by date range...', `(${startYear} - ${endYear})`);
  // sync movies from letterboxd /by/year pages
  const numSynced = await syncPopularMoviesByDateRange({
    startYear,
    endYear
  });

  await SyncRepo.endSync(sync, {
    status: SyncStatus.COMPLETE,
    secondaryId: `${startYear}-${endYear}`,
    numSynced
  });

  return numSynced;
}

export async function syncPopularMoviesByDateRange({
  startYear,
  endYear
}: SyncAllMoviesByDateRangeOptions) {
  let numSynced = 0;

  for (let year = startYear; year < endYear; year++) {
    console.log(`Syncing popular letterboxd movies for year: ${year}`)
    try {
      const baseUrl = `https://letterboxd.com/films/ajax/popular/year/${year}/size/small`;
      const page1 = await scrapeMoviesByPage(baseUrl, 1);
      numSynced += await processPage(page1.movies);
      const page2 = await scrapeMoviesByPage(baseUrl, 2);    
      numSynced += await processPage(page2.movies);
    } catch (error: unknown) {
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found during year-by-year page scraping and processing, for year:', year);
      throw new BetterloxApiError('', { error });
    }
  }

  return numSynced;
}

const excludedGenresForSyncing = ['TV Movie'];
const genrePaths = GENRES
  .filter(g => !excludedGenresForSyncing.includes(g))
  .map((genre) => {
    return genre.toLowerCase().replace(/ /g, '-');
  });

export async function syncPopularMoviesPerGenre(sync: Sync) {
  const SyncRepo = await getSyncRepository();
  sync.type = SyncType.POPULAR_MOVIES_GENRE;
  SyncRepo.save(sync);

  const now = new Date();
  const hoursBetween = 1;
  const cutoff = (new Date(now.getTime() - (1000 * 60 * 60 * hoursBetween))).toISOString();

  const completedDuringPastInterval = await SyncRepo.findBy({
    finished: MoreThan(new Date(cutoff)),
    status: SyncStatus.COMPLETE,
    type: SyncType.POPULAR_MOVIES_YEAR
  });

  if (completedDuringPastInterval) {
    return 0;
  }

  let numSynced = 0;

  for (let i = 0; i < genrePaths.length; i++) {
    const genre = genrePaths[i];
    console.log(`Retrieving popular movies for genre: ${genre}`);
    try {
      const baseUrl = `https://letterboxd.com/films/ajax/popular/genre/${genre}/size/small`;
      const page1 = await scrapeMoviesByPage(baseUrl, 1);
      numSynced += await processPage(page1.movies);
      const page2 = await scrapeMoviesByPage(baseUrl, 2);    
      numSynced += await processPage(page2.movies);
    } catch (error: unknown) {
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found during genre page scraping and processing, for genre:', genre);
      throw new BetterloxApiError('', { error });
    }
  }

  await SyncRepo.endSync(sync, {
    status: SyncStatus.COMPLETE,
    numSynced
  });

  return numSynced;
}