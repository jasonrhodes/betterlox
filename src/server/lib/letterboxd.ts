import axios, { AxiosResponse } from "axios";
import cheerio, { Node } from "cheerio";
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
