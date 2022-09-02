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
  moviesPerYear: number;
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

  // console.log(JSON.stringify(completedDuringPastInterval, null, 2));

  if (completedDuringPastInterval.length > 0) {
    return 0;
  }

  console.log("Should continue to sync");

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

  // console.log(JSON.stringify(lastPopularYearSync, null, 2));

  let startYear = 1900;
  let endYear = 1910;

  if (lastPopularYearSync.length > 0 && lastPopularYearSync[0].secondaryId) {
    const currentYear = now.getUTCFullYear();
    const lastRange = lastPopularYearSync[0].secondaryId;
    const possibleStartYear = Number(lastRange.substring(5));
    if (possibleStartYear < currentYear) {
      startYear = possibleStartYear;
      endYear = Math.min(currentYear, startYear + yearBatchSize);
    }
  }

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
  let numSynced = 0;

  for (let year = startYear; year < endYear; year++) {
    console.log(`Syncing popular letterboxd movies for year: ${year}`);
    const baseUrl = `https://letterboxd.com/films/ajax/popular/year/${year}/size/small`;
    try {
      let page = 1;
      while (numSynced < moviesPerYear) {
        const { movies } = await scrapeMoviesByPage({
          baseUrl, 
          page, 
          maxMovies: moviesPerYear - numSynced
        });
        numSynced += await processPage(movies);
        page += 1;
      }
      
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

  // console.log(
  //   'Genre Syncs Completed In Last Interval', 
  //   JSON.stringify(completedDuringPastInterval, null, 2)
  // );

  if (completedDuringPastInterval.length > 0) {
    return 0;
  }

  let numSynced = 0;

  for (let i = 0; i < genrePaths.length; i++) {
    let numPerGenre = 0;
    const genre = genrePaths[i];
    console.log(`Retrieving popular movies for genre: ${genre}`);
    const baseUrl = `https://letterboxd.com/films/ajax/popular/genre/${genre}/size/small`;
    let page = 1;
    try {
      while (numPerGenre < moviesPerGenre) {
        const { movies } = await scrapeMoviesByPage({
          baseUrl, 
          page,
          maxMovies: moviesPerGenre - numPerGenre
        });
        numPerGenre += await processPage(movies);
      }
      numSynced += numPerGenre;
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