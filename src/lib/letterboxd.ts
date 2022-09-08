import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { ScrapedLetterboxdList } from "../common/types/api";
import { FilmEntry, LetterboxdList, Movie, PopularLetterboxdMovie } from "../db/entities";
import { getDataImageTagFromUrl } from "./dataImageUtils";
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

  if (tries >= MAX_TRIES) {
    throw new Error(`Exceeded max tries while attempting to reach ${url}`);
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

export async function findLastRatingsPage(username: string) {
  const { data } = await tryLetterboxd(`https://letterboxd.com/${username}/films/ratings/`);
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

interface ScrapeMoviesByPageOptions {
  baseUrl: string;
  page?: number;
  maxMovies?: number;
}

export async function scrapeMoviesByPage({
  baseUrl,
  page = 1,
  maxMovies
}: ScrapeMoviesByPageOptions): Promise<{ movies: Array<Partial<PopularLetterboxdMovie>> }> {
  const { data } = await tryLetterboxd(
    `${baseUrl}/page/${page}`
  );
  const $ = cheerio.load(data);
  // console.log('HTML', $.html());
  const elements = $('ul.poster-list li');

  if (!elements.length) {
    return { movies: [] };
  }

  const elementsToProcess = typeof maxMovies === "number" && elements.length > maxMovies
    ? elements.slice(0, maxMovies)
    : elements;

  const movies = await Promise.all(elementsToProcess.map(async (i, item) => {
    const m: Partial<PopularLetterboxdMovie> = {};

    const containerData = $(item).data() as { averageRating: number };
    m.averageRating = containerData.averageRating;

    const poster = $(item).find('.film-poster');
    const filmData = poster.data() as {
      filmSlug?: string;
      filmId?: string;
    };

    if (typeof filmData.filmSlug === "string") {
      m.letterboxdSlug = filmData.filmSlug;
      const id = Number(filmData.filmId);
      if (!isNaN(id)) {
        m.id = id;
      }
      
      if (!m.id) {
        const { data } = await tryLetterboxd(filmData.filmSlug);
        const $$ = cheerio.load(data);
        const { tmdbId } = $$("body").data();
        const id = Number(tmdbId);
        if (!isNaN(id)) {
          m.id = id;
        }
      }
    }

    const name = $(item).find("img")?.attr()?.alt;
    m.name = name;

    return m;
  }).get());

  return { movies };
}

interface ScrapeByPageOptions {
  username: string;
  page?: number;
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

export async function scrapeRatingsByPage({
  username,
  page = 1
}: ScrapeByPageOptions): Promise<{ ratings: Array<Partial<FilmEntry>> }> {
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${username}/films/ratings/page/${page}`
  );
  const $ = cheerio.load(data);
  const ratingElements = $('.poster-list li');

  if (!ratingElements.length) {
    return { ratings: [] };
  }

  // process ratings
  const ratings = await Promise.all(ratingElements.map(async (i, item) => {
    const r: Partial<FilmEntry> = {};

    const poster = $(item).find('.film-poster');
    const ratingData = poster.data();

    if (typeof ratingData.filmSlug === "string") {
      r.letterboxdSlug = ratingData.filmSlug;
      const { data } = await tryLetterboxd(ratingData.filmSlug);
      const $$ = cheerio.load(data);
      const { tmdbId } = $$("body").data();
      const id = Number(tmdbId);
      if (!isNaN(id)) {
        r.movieId = id;
      }
    }

    const name = $(item).find("img")?.attr()?.alt;
    if (typeof name === "string") {
      r.name = name;
    }

    const stars = $(item).find("span.rating")?.attr()?.class;
    if (typeof stars === "string") {
      r.stars = Number(stars.substring(13)) / 2;
    }

    const rateDate = $(item).find("time")?.attr()?.datetime;
    if (typeof rateDate === "string") {
      r.date = new Date(rateDate);
    }

    return r;
  }).get());

  return { ratings };
}

interface ScrapedList {
  details: Partial<LetterboxdList>;
  movieIds: number[];
}

interface ScrapeListsForUserOptions {
  username: string;
  processPage: (lists: ScrapedList[]) => Promise<{ continue: boolean; }>;
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
  const items = $("section.list-set > section.list");

  if (items.length === 0) {
    return count;
  }

  const batch = (await Promise.all(items.map(async (i, item) => {
    const itemData = $(item).data();

    if (!('filmListId' in itemData) || (typeof itemData.filmListId !== 'number')) {
      throw new Error('No film list ID in letterboxd list of lists page');
    }
    
    if (!('person' in itemData) || (typeof itemData.person !== 'string')) {
      throw new Error(`Person data not found on Letterboxd listing page ${options.username}/${page} for list index ${i}`)
    }

    const listLink = $(item).find('a.list-link');
    const listUrl = listLink.attr('href');
    
    if (!listUrl) {
      throw new Error(`URL data not found for list index ${i} on Letterboxd lists page ${options.username}/${page}`)
    }

    const { data } = await tryLetterboxd(`https://letterboxd.com${listUrl}`);
    const $$ = cheerio.load(data);

    const $published = $$("#content-nav .list-date > .published time");
    const pubDate = $published.attr("datetime");

    const $lastUpdated = $$("#content-nav .list-date > .updated time");
    const luDate = $lastUpdated.attr("datetime");

    const $listIntroSection = $$(".list-title-intro");
    const title = $listIntroSection.find("h1");
    const description = $listIntroSection.find(".body-text");

    const $filmsItems = $$(".poster-list.film-list .film-poster");
    const filmIds = await Promise.all($filmsItems.map(async (i, item) => {
      const itemData = $$(item).data();
      if (!('filmSlug' in itemData)) {
        return null;
      }

      const { data } = await tryLetterboxd(`https://letterboxd.com${itemData.filmSlug}`);
      const $filmPage = cheerio.load(data);
      const filmPageData = $filmPage('body').data();

      if (!('tmdbId' in filmPageData)) {
        console.log('no tmdbId in film page');
        return null;
      }

      const numId = Number(filmPageData.tmdbId);
      if (isNaN(numId)) {
        return null;
      }

      return numId;
    }).get());

    const filteredFilmIds = filmIds.filter(isNumber);
    const rankedItems = $$(".poster-list.film-list .poster-container.numbered-list-item");
    const isRanked = rankedItems.length > 0;
    const publishDate = pubDate ? new Date(pubDate) : undefined;
    const lastUpdated = luDate ? new Date(luDate) : publishDate;

    const details: Partial<LetterboxdList> = {
      letterboxdListId: itemData.filmListId,
      publishDate,
      lastUpdated,
      title: title.text().trim(),
      description: description.text().trim(),
      letterboxdUsername: itemData.person,
      url: listUrl,
      isRanked,
      visibility: 'public'
    };

    return {
      details,
      movieIds: filteredFilmIds
    };
  })));

  const result = await options.processPage(batch);
  
  if (result.continue) {
    return await scrapeListsForUser(options, count + batch.length, page + 1);
  }

  return count + batch.length;
}
