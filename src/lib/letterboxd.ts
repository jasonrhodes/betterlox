import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { Rating } from "../db/entities";
import { getDataImageTagFromUrl } from "./dataImageUtils";
const MAX_TRIES = 5;

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

export async function getUserDetails(username: string) {
  let html = '';
  try {
    const response = await tryLetterboxd(`https://letterboxd.com/${username}`);
    html = response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      html = '';
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

interface ScrapeRatingsByPageOptions {
  username: string;
  page?: number;
}

export async function scrapeRatingsByPage({
  username,
  page = 1
}: ScrapeRatingsByPageOptions): Promise<{ ratings: Array<Promise<Partial<Rating>>> }> {
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${username}/films/ratings/page/${page}`
  );
  const $ = cheerio.load(data);
  const ratingElements = $('.poster-list li');

  if (!ratingElements.length) {
    return { ratings: [] };
  }

  // process ratings
  const ratings = await ratingElements.map(async (i, item) => {
    const r: Partial<Rating> = {};

    const ratingData = $(item).find('.film-poster').data();
    if (typeof ratingData.filmSlug === "string") {
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
  }).get();

  return { ratings };
}
