import { SyncType, SyncStatus } from "../../common/types/db";
import { Movie, PopularLetterboxdMovie, Sync } from "../../db/entities";
import { 
  getSyncRepository, 
  getFilmEntriesRepository, 
  getMoviesRepository, 
  getPopularLetterboxdMoviesRepository 
} from "../../db/repositories";
import { BetterloxApiError } from "../BetterloxApiError";
import { ScrapedMovie, scrapeMoviesByPage, scrapeMoviesOverPages } from "../letterboxd";
import { MoreThan } from "typeorm";
import { GENRES } from "../../common/constants";
import axios from "axios";

export interface SyncAllMoviesByDateRangeOptions {
  startYear: number;
  endYear: number;
  moviesPerYear: number;
}

async function processPopularPage(set: Partial<ScrapedMovie>[]) {
  const PopularLetterboxdMoviesRepo = await getPopularLetterboxdMoviesRepository();
  const processed: ScrapedMovie[] = [];
  for (let i = 0; i < set.length; i++) {
    const plm = set[i];
    try {
      const created = PopularLetterboxdMoviesRepo.create(plm);
      processed.push(await PopularLetterboxdMoviesRepo.save(created));
    } catch (error: unknown) {
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found while processing page of popular movies', plm.name);
      throw new BetterloxApiError('', { error });
    }
  }
  return processed;
}

export interface SyncPopularMoviesPerYearOptions {
  yearBatchSize: number;
  force?: boolean;
  moviesPerYear: number;
}

export async function syncPopularMoviesPerYear(sync: Sync, {
  yearBatchSize,
  moviesPerYear
}: SyncPopularMoviesPerYearOptions) {
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

  console.log('movies per year status:', JSON.stringify(completedDuringPastInterval, null, 2));

  if (completedDuringPastInterval.length > 0) {
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

  console.log(JSON.stringify(lastPopularYearSync, null, 2));

  const currentYear = now.getUTCFullYear();
  let startYear = 1900;

  if (lastPopularYearSync.length > 0 && lastPopularYearSync[0].secondaryId) {
    const lastRange = lastPopularYearSync[0].secondaryId;
    const possibleStartYear = Number(lastRange.substring(5));
    if (possibleStartYear < currentYear) {
      startYear = possibleStartYear;
    }
  }

  const endYear = Math.min(currentYear, startYear + yearBatchSize);

  console.log('Syncing popular movies by date range...', `(${startYear} - ${endYear})`);
  // sync movies from letterboxd /by/year pages
  const numSynced = await syncPopularMoviesByDateRange({
    startYear,
    endYear,
    moviesPerYear
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
  endYear,
  moviesPerYear
}: SyncAllMoviesByDateRangeOptions) {
  let results: ScrapedMovie[] = [];
  for (let year = startYear; year < endYear; year++) {
    
    console.log(`Syncing popular letterboxd movies for year: ${year}`);
    const baseUrl = `https://letterboxd.com/films/ajax/popular/year/${year}/size/small`;
    try {
      const nextBatch = await scrapeMoviesOverPages({ baseUrl, maxMovies: moviesPerYear, processPage: processPopularPage });
      results = results.concat(nextBatch);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const { status, statusText } = error.response || {};
        
        if (error.response?.status === 404) {
          continue;
        }
      }
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found during year-by-year page scraping and processing, for year:', year);
      throw new BetterloxApiError('', { error });
    }
  }

  return results.length;
}

const excludedGenresForSyncing = ['TV Movie'];
const genrePaths = GENRES
  .filter(g => !excludedGenresForSyncing.includes(g))
  .map((genre) => {
    return genre.toLowerCase().replace(/ /g, '-');
  });

interface SyncPopularMoviesPerGenreOptions {
  force?: boolean;
  moviesPerGenre: number;
}

export async function syncPopularMoviesPerGenre(sync: Sync, {
  force,
  moviesPerGenre
}: SyncPopularMoviesPerGenreOptions) {
  const SyncRepo = await getSyncRepository();
  sync.type = SyncType.POPULAR_MOVIES_GENRE;
  SyncRepo.save(sync);

  const now = new Date();
  const hoursBetween = 1;
  const cutoff = (new Date(now.getTime() - (1000 * 60 * 60 * hoursBetween))).toISOString();

  const completedDuringPastInterval = await SyncRepo.findBy({
    finished: MoreThan(new Date(cutoff)),
    status: SyncStatus.COMPLETE,
    type: SyncType.POPULAR_MOVIES_GENRE
  });

  if (completedDuringPastInterval.length > 0) {
    return 0;
  }

  let results: ScrapedMovie[] = [];

  for (let i = 0; i < genrePaths.length; i++) {
    const genre = genrePaths[i];
    console.log(`Retrieving popular movies for genre: ${genre}`);
    const baseUrl = `https://letterboxd.com/films/ajax/popular/genre/${genre}/size/small`;
    try {
      const nextBatch = await scrapeMoviesOverPages({ baseUrl, maxMovies: moviesPerGenre, processPage: processPopularPage });
      results = results.concat(nextBatch);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log('Axios error with genres', 'url:', error.request?.url, 'error message:', error.message, 'status text:', error.response?.statusText, 'status:', error.response?.status);
      }
      if (error instanceof BetterloxApiError) {
        throw error;
      }
      console.log('Error found during genre page scraping and processing, for genre:', genre);
      throw new BetterloxApiError('', { error });
    }
  }

  await SyncRepo.endSync(sync, {
    status: SyncStatus.COMPLETE,
    numSynced: results.length
  });

  return results.length;
}