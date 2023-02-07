import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { ScrapedLetterboxdList } from "../common/types/api";
import { FilmEntry, LetterboxdList, Movie, PopularLetterboxdMovie } from "../db/entities";
import { getDataImageTagFromUrl } from "./dataImageUtils";
import { getErrorAsString } from "./getErrorAsString";
import { isNumber } from "./typeGuards";
const MAX_TRIES = 5;

interface FoundLetterboxdAccount {
  found: true;
  avatar: string | null | undefined;
  avatarUrl: string;
  name: string;
  isPro: boolean;
  isPatron: boolean;
}

interface UnfoundLetterboxdAccount {
  found: false;
}

export type LetterboxdDetails = FoundLetterboxdAccount | UnfoundLetterboxdAccount;

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const RETRYABLE_ERRORS = ["ECONNRESET", "ENOTFOUND"];

async function tryLetterboxd(
  url: string,
  tries: number = 0
): Promise<AxiosResponse<any, any>> {
  if (!url.startsWith('http')) {
    url = `https://letterboxd.com${url}`;
  }

  if (url.split('/')[2] !== "letterboxd.com") {
    throw new Error(`Invalid URL passed to tryLetterboxd ${url}`);
  }

  if (tries >= MAX_TRIES) {
    throw new Error(`Exceeded max tries (${MAX_TRIES}) while attempting to reach ${url}`);
  }

  try {
    const response = await axios.get(url);
    // if (!response.data) {
    //   throw new Error(`Request for ${url} resulted in a malformed response with only keys ${Object.keys(response)}`);
    // }
    return response;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      typeof error.code === "string" &&
      RETRYABLE_ERRORS.includes(error.code)
    ) {
      await wait(Math.pow(2, tries)); // exponential backoff base 2
      return tryLetterboxd(url, tries++);
    } else {
      throw error;
    }
  }
}

export async function getTmdbIdFromShortUrl(shortUrl: string) {
  const html = await tryLetterboxd(shortUrl);

  const $ = cheerio.load(html.data);
  const id = $("body").data("tmdb-id") as string;
  return Number(id);
}

export async function getUserDetails(username: string): Promise<LetterboxdDetails> {
  let html = '';
  try {
    const response = await tryLetterboxd(`https://letterboxd.com/${username}`);
    html = response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        found: false
      };
    } else {
      throw error;
    }
  }

  const $ = cheerio.load(html);

  const avatar = $('.profile-avatar .avatar > img');
  const name = $('.profile-name h1');
  const isPro = $('.profile-name .badge.-pro');
  const isPatron = $('.profile-name .badge.-patron');

  let avatarDataSrc = '';
  const avatarSrc = (avatar.length === 1) ? avatar.attr()?.src : null;

  if (avatarSrc) {
    avatarDataSrc = await getDataImageTagFromUrl(avatarSrc);
  }

  return {
    found: true,
    avatar: avatarSrc,
    avatarUrl: avatarDataSrc,
    name: name.length === 1 ? name.text() : '',
    isPro: isPro.length === 1 || isPatron.length === 1 ? true : false,
    isPatron: isPatron.length === 1 ? true : false
  };
}

export async function findLastDiaryPage(username: string) {
  const { data } = await tryLetterboxd(`https://letterboxd.com/${username}/films/diary/`);
  const $ = cheerio.load(data);
  const lastPageLink = $('.paginate-pages li.paginate-page:last-child');
  const lastPage = lastPageLink.text();
  return Number(lastPage);
}

export async function findLastWatchesPage(username: string) {
  const { data } = await tryLetterboxd(`https://letterboxd.com/${username}/films/`);
  const $ = cheerio.load(data);
  const lastPageLink = $('.paginate-pages li.paginate-page:last-child');
  const lastPage = lastPageLink.text();
  return Number(lastPage);
}

export interface ScrapedMovie {
  id?: number;
  averageRating?: number;
  letterboxdSlug?: string;
  name?: string;
}

// recursively calls scrapeMoviesByPage for you
export async function scrapeMoviesOverPages({
  baseUrl,
  maxMovies,
  maxPages = 50,
  page = 1,
  movies = [],
  processPage
}: {
  baseUrl: string;
  maxMovies?: number;
  maxPages?: number;
  page?: number;
  movies?: ScrapedMovie[];
  processPage?: (set: ScrapedMovie[]) => Promise<ScrapedMovie[]>;
}): Promise<ScrapedMovie[]> {
  const maxMoviesForPage = typeof maxMovies === "number" ? maxMovies - movies.length : undefined;
  const result = await scrapeMoviesByPage({ baseUrl, maxMoviesForPage, page });
  const batch = (typeof processPage === "function") ? (await processPage(result.movies)) : result.movies;
  const accumulator = [ ...movies, ...batch ];
  
  if (
      batch.length === 0 ||
      (typeof maxPages === "number" && page === maxPages) || 
      (typeof maxMovies === "number" && accumulator.length >= maxMovies)
    ) {
    return accumulator;
  }
  return await scrapeMoviesOverPages({
    baseUrl,
    maxMovies,
    maxPages,
    page: page + 1,
    movies: accumulator
  });
}

interface ScrapeMoviesByPageOptions {
  baseUrl: string;
  page?: number;
  maxMoviesForPage?: number;
}

export async function scrapeMoviesByPage({
  baseUrl,
  page = 1,
  maxMoviesForPage
}: ScrapeMoviesByPageOptions): Promise<{ movies: Partial<ScrapedMovie>[] }> {
  const pageUrl = `${baseUrl}/page/${page}`;
  console.log(`Syncing: ${pageUrl}`);
  const { data } = await tryLetterboxd(pageUrl);
  const $ = cheerio.load(data); 
  const elements = $('.col-main > ul.poster-list > li');

  if (!elements.length) {
    return { movies: [] };
  }

  const elementsToProcess = typeof maxMoviesForPage === "number" && elements.length > maxMoviesForPage
    ? elements.slice(0, maxMoviesForPage)
    : elements;
  
  const movies = await Promise.all(elementsToProcess.map(async (i, item) => {
    const m: Partial<ScrapedMovie> = {};

    const containerData = $(item).data() as { averageRating?: number };
    if (containerData.averageRating) {
      m.averageRating = containerData.averageRating;
    }
    
    const poster = $(item).find('.film-poster');
    const filmData = poster.data() as undefined | {
      filmSlug?: string;
      filmId?: string;
      filmName?: string;
    };

    if (filmData && 'filmName' in filmData) {
      m.name = filmData.filmName;
    }

    if (filmData && typeof filmData.filmSlug === "string") {
      m.letterboxdSlug = filmData.filmSlug;
      
      const { id, name } = await scrapeMovieByUrl(filmData.filmSlug);
      if (id) {
        m.id = id;
      }

      if (name) {
        m.name = name;
      }
    }

    if (!m.name) {
      const name = $(item).find("img")?.attr()?.alt;
      m.name = name;
    } 

    return m;
  }).get());

  return { movies };
}

export async function scrapeMovieByUrl(url: string): Promise<ScrapedMovie> {
  const { data } = await tryLetterboxd(url);
  const $$ = cheerio.load(data);
  const { tmdbId } = $$("body").data();
  const _id = Number(tmdbId);
  const id = isNaN(_id) ? undefined : _id;
  const name = $$("h1.headline-1").text();

  return {
    id,
    name,
    letterboxdSlug: url
  };
}

interface ScrapeByPageOptions {
  username: string;
  page?: number;
  direction?: 'up' | 'down';
}

export async function scrapeWatchesByPage({
  username,
  page = 1
}: ScrapeByPageOptions): Promise<{ watches: Array<Partial<FilmEntry>> }> {
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${username}/films/by/date/page/${page}`
  );
  const $ = cheerio.load(data);
  const watchElements = $('.poster-list li');

  if (!watchElements.length) {
    return { watches: [] };
  }

  const watches = await Promise.all(watchElements.map(async (i, item) => {
    const w: Partial<FilmEntry> = {};

    const poster = $(item).find('.film-poster');
    const filmData = poster.data();

    if (typeof filmData.filmSlug === "string") {
      w.letterboxdSlug = filmData.filmSlug;
      const { data } = await tryLetterboxd(filmData.filmSlug);
      const $$ = cheerio.load(data);
      const { tmdbId } = $$("body").data();
      const id = Number(tmdbId);
      if (!isNaN(id)) {
        w.movieId = id;
      }
    }

    const name = $(item).find("img")?.attr()?.alt;
    if (typeof name === "string") {
      w.name = name;
    }

    return w;
  }).get());

  return { watches };
}

export async function scrapeDiaryEntriesByPage({
  username,
  page = 1,
  direction = 'down'
}: ScrapeByPageOptions): Promise<{ diaryEntries: Array<Partial<FilmEntry>> }> {
  // previously: `https://letterboxd.com/${username}/films/ratings/page/${page}`
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${username}/films/diary/page/${page}`
  );
  const $ = cheerio.load(data);
  const diaryRows = $('#diary-table tr.diary-entry-row');

  if (!diaryRows.length) {
    return { diaryEntries: [] };
  }

  const rows = diaryRows.get();

  if (direction === 'up') {
    rows.reverse();
  }

  // process diary entries
  const diaryEntries = await Promise.all(rows.map(async (item, i) => {
    const r: Partial<FilmEntry> = {};

    const poster = $(item).find('.film-poster');
    const ratingData = poster.data();

    if (typeof ratingData.filmSlug === "string") {
      r.letterboxdSlug = ratingData.filmSlug;
      const { data } = await tryLetterboxd(ratingData.filmSlug);
      const $$ = cheerio.load(data);
      const { tmdbId, tmdbType } = $$("body").data();
      const id = Number(tmdbId);
      if (!isNaN(id) && tmdbType === "movie") {
        r.movieId = id;
      }
    }

    const name = $(item).find("img")?.attr()?.alt;
    if (typeof name === "string") {
      r.name = name;
    }

    const ratingClassString = $(item).find("td.td-rating span.rating")?.attr()?.class;
    if (typeof ratingClassString === "string") {
      const classes = ratingClassString.split(" ");
      const ratedClass = classes.find((c) => c.startsWith("rated-"));

      if (ratedClass) {
        r.stars = Number(ratedClass.substring(6)) / 2;
      }
    }

    const likeSpans = $(item).find(".diary-like span");
    if (likeSpans && likeSpans.length === 3) {
      r.heart = true;
    }

    const rewatch = $(item).find(".td-rewatch");
    if (rewatch && typeof rewatch.hasClass === "function") {
      r.rewatch = !rewatch.hasClass("icon-status-off");
    }

    const entryUrl = $(item).find(".diary-day > a")?.attr()?.href;
    if (typeof entryUrl === "string") {
      const date = entryUrl.split('/').slice(5, 8).join('/');
      r.date = new Date(date);
    }

    return r;
  }));

  return { diaryEntries };
}

interface ScrapedList {
  details: Partial<LetterboxdList>;
  movieIds: number[];
  owner?: string;
}

interface ScrapeListsForUserOptions {
  username: string;
  processList: (list: ScrapedList) => void;
}

export async function scrapeListsForUser(
  options: ScrapeListsForUserOptions,
  count: number = 0,
  page: number = 1
): Promise<number> {
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${options.username}/lists/public/by/created-oldest/page/${page}`
  );
  const $ = cheerio.load(data);
  const listsOnPage = $("section.list-set > section.list");

  if (listsOnPage.length === 0) {
    return count;
  }

  let batchCount = 0;

  for (let i = 0; i < listsOnPage.length; i ++) {
    const list = listsOnPage[i];
    const listData = $(list).data();

    const listLink = $(list).find('a.list-link');
    const listUrl = listLink.attr('href');
    
    if (!listUrl) {
      throw new Error(`URL data not found for list index ${i} on Letterboxd lists page ${options.username}/${page}`)
    }

    const fullListUrl = `https://letterboxd.com${listUrl}`;
    const { details, movieIds } = await scrapeListByUrl(fullListUrl);
    await options.processList({ details, movieIds });

    batchCount++;
  }
  
  return await scrapeListsForUser(options, count + batchCount, page + 1);
}

export async function scrapeListByUrl(url: string): Promise<ScrapedList> {
  const { data } = await tryLetterboxd(url);
  const $$ = cheerio.load(data);

  const body = $$("body");
  const bodyData = body.data();
  const owner = typeof bodyData.owner === "string" ? bodyData.owner : undefined;

  const $published = body.find("#content-nav .list-date > .published time");
  const pubDate = $published.attr("datetime");

  const $lastUpdated = body.find("#content-nav .list-date > .updated time");
  const luDate = $lastUpdated.attr("datetime");

  const $listIntroSection = body.find(".list-title-intro");
  const title = $listIntroSection.find("h1").text().trim();
  const description = $listIntroSection.find(".body-text");
  const rankedItems = body.find(".poster-list.film-list .poster-container.numbered-list-item");
  const isRanked = rankedItems.length > 0;
  const publishDate = pubDate ? new Date(pubDate) : undefined;
  const lastUpdated = luDate ? new Date(luDate) : publishDate;

  let movieIds: number[] = [];
  try {
    const films = await scrapeMoviesOverPages({ baseUrl: url });
    movieIds = films.map(f => f.id).filter(isNumber);  
    if (movieIds.length < films.length) {
      console.log(`Warning: Dropped ${films.length - movieIds.length} movie IDs for not having a numeric ID, which may indicate a bug`);
    }  
  } catch (error) {
    console.log("error while scrapeMoviesOverPages", getErrorAsString(error));
    throw error;
  }

  const details: Partial<LetterboxdList> = {
    publishDate,
    lastUpdated,
    title,
    description: description.text().trim(),
    letterboxdUsername: owner,
    url: url,
    isRanked,
    visibility: 'public'
  };

  return { details, movieIds, owner };
}
