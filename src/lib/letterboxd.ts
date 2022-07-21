import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { Rating } from "../common/types/db";
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

  let avatarUrl = '';

  const avatarSrc = (avatar.length === 1) ? avatar.attr()?.src : null;

  if (avatarSrc) {
    let image = await axios.get(avatarSrc, { responseType: 'arraybuffer' });
    const avatarB64string = Buffer.from(image.data).toString('base64');
    avatarUrl = `data:image/jpeg;base64,${avatarB64string}`;
  }

  return {
    avatar: avatarSrc,
    avatarUrl,
    name: name.length === 1 ? name.text() : '',
    isPro: isPro.length === 1 || isPatron.length === 1 ? true : false,
    isPatron: isPatron.length === 1 ? true : false
  };
}

interface ScrapeRatingsOptions {
  username: string;
  allProcessed?: Array<Partial<Rating>>;
  totalSynced?: number;
  page?: number;
}

export async function scrapeRatings({
  username,
  allProcessed = [], 
  totalSynced = 0,
  page = 0
}: ScrapeRatingsOptions): Promise<{ ratings: Array<Partial<Rating>> }> {
  const pagePath = page ? `/page/${page}` : '';
  const { data } = await tryLetterboxd(
    `https://letterboxd.com/${username}/films/ratings${pagePath}`
  );
  const $ = cheerio.load(data);
  const ratings = $('.poster-list li');
  if (!ratings.length) {
    return { ratings: allProcessed };
  }

  const processed: Array<Partial<Rating>> = [];

  // process ratings
  await ratings.each(async (_, i, item) => {
    const r: Partial<Rating> = {};
    const ratingData = $(item).find('.film-poster').data();
    if (typeof ratingData.filmSlug === "string") {
      const { data } = await tryLetterboxd(ratingData.filmSlug);
      const $$ = cheerio.load(data);
      const { tmdbId } = $$("body").data();
      const id = Number(tmdbId);
      if (!isNaN(id)) {
        r.movie_id = id;
      }
    }
    const name = $(item).find("img")?.attr()?.alt;
    if (typeof name === "string") {
      r.name = name;
    }

    const stars = $(item).find("span.rating")?.attr()?.class;
    if (typeof stars === "string") {
      r.rating = Number(stars.substring(13)) / 2;
    }

    const rateDate = $(item).find("time")?.attr()?.datetime;
    if (typeof rateDate === "string") {
      r.date = rateDate.substring(0, 10);
    }

    processed.push(r);
  });

  return scrapeRatings({
    username,
    allProcessed: [...allProcessed, ...processed]
  });
}
