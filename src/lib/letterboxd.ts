import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
// import { Cast, Crew } from "moviedb-promise/dist/request-types";
const MAX_TRIES = 5;

// function findValues(crew: Crew[] = []) {
//   const jobs = new Set();
//   const departments = new Set();

//   for (let i = 0; i < crew.length; i++) {
//     jobs.add(crew[i].job);
//     departments.add(crew[i].department);
//   }

//   return { jobs, departments };
// }

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

  // const movie = await tmdb.movieInfo(id);
  // return movie;
  // const { cast, crew } = await tmdb.movieCredits(id);

  // const { jobs, departments } = findValues(crew);

  // console.log("HTML", "\n\nMOVIE\n\n", movie, "\n\nCREDITS\n\n", jobs, departments);

  // if (crew && crew.length > 0) {
  //   console.log(crew.slice(0, 5));
  // } else {
  //   console.log("No crew");
  // }
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

  if (avatar.length === 1) {
    let image = await axios.get(avatar.attr().src, { responseType: 'arraybuffer' });
    const avatarB64string = Buffer.from(image.data).toString('base64');
    avatarUrl = `data:image/jpeg;base64,${avatarB64string}`;
  }

  return {
    avatar: avatar.length === 1 ? avatar.attr().src : '',
    avatarUrl,
    name: name.length === 1 ? name.text() : '',
    isPro: isPro.length === 1 || isPatron.length === 1 ? true : false,
    isPatron: isPatron.length === 1 ? true : false
  };
}

// src="data:image/jpeg;base64,{{ base64 string }}"
