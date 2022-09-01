import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { FilmEntry, Movie, PopularLetterboxdMovie } from "../db/entities";
import { getDataImageTagFromUrl } from "./dataImageUtils";
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

export async function scrapeMoviesByPage(baseUrl: string, page: number = 1): Promise<{ movies: Array<Partial<PopularLetterboxdMovie>> }> {
  const { data } = await tryLetterboxd(
    `${baseUrl}/page/${page}`
  );
  const $ = cheerio.load(data);
  // console.log('HTML', $.html());
  const elements = $('ul.poster-list li');

  if (!elements.length) {
    return { movies: [] };
  }

  const movies = await Promise.all(elements.map(async (i, item) => {
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
