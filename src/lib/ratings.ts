export {}
// import { parse } from "./parse";
// import { getTmdbIdFromShortUrl } from "./letterboxd";
// import {
//   getMovie,
//   addRating,
//   upsertMovie,
//   addGenre,
//   addGenreToMovie,
//   addProductionCompany,
//   addProductionCompanyToMovie,
//   addCastMemberToMovie,
//   addCrewMemberToMovie,
// } from "../db/client";
// import { tmdb, TmdbMovie } from "./tmdb";
// import { log } from "./logger";
// import axios from "axios";
// import { JOB_ALLOW_LIST } from "../common/constants";

// interface Rating {
//   Date: string;
//   Name: string;
//   Year: number;
//   "Letterboxd URI": string;
//   Rating: number;
// }

// interface ProcessRatingsOptions {
//   userId: number;
//   ratings: Rating[];
//   offset?: number;
// }

// async function getMovieInfoSafely(id: number): Promise<null | TmdbMovie> {
//   if (id === 0) {
//     return null;
//   }

//   try {
//     return await tmdb.movieInfo(id);
//   } catch (error: unknown) {
//     if (axios.isAxiosError(error) && error.response?.status === 404) {
//       console.log(
//         `The requested resource could not be found in the TMDB API, for id: ${id} - ignoring this error and moving on`
//       );
//       return null;
//     } else {
//       throw error;
//     }
//   }
// }

// export async function parseRatings(filePath: string) {
//   const ratings = await parse<Rating>({ filePath, returnAllRows: true });
//   return ratings;
// }

// export async function processRatings({
//   userId,
//   ratings,
//   offset = 0,
// }: ProcessRatingsOptions) {
//   log("info", `About to process ${ratings.length} ratings`);
//   let skippedCrew = 0;
//   let skippedCast = 0;
//   await Promise.all(
//     ratings.map(async (rating, localIndex) => {
//       const i = localIndex + offset;

//       log(
//         "info",
//         `Starting to process movie number ${i}: ${rating.Name} (${rating["Letterboxd URI"]})...`
//       );

//       const uri = rating["Letterboxd URI"];
//       const tmdbId = await getTmdbIdFromShortUrl(uri);
//       if (!tmdbId) {
//         // skip this rating - it's likely a TV series or some other non-movie entity
//         log(
//           "warning",
//           `Skipping rating for ${rating.Name} because it doesn't have a valid TMDB ID (${tmdbId})`
//         );
//         return;
//       }

//       log(
//         "debug",
//         `TMDB ID retrieved for ${rating.Name} ${rating["Letterboxd URI"]}: ${tmdbId}`
//       );

//       // add rating to db
//       await addRating(
//         userId,
//         tmdbId,
//         rating.Rating,
//         rating.Date,
//         rating.Name,
//         rating.Year
//       );

//       log("debug", "Rating added to DB");

//       // do we have this movie stored in our cache db?
//       const storedMovie = await getMovie(tmdbId);

//       if (!storedMovie) {
//         log("info", `No movie cached in the DB for ${rating.Name}`);

//         log(
//           "debug",
//           `Attempting tmdb look up for ID ${tmdbId}, ${rating.Name}`
//         );

//         // get movie from TMDB
//         const movie = await getMovieInfoSafely(tmdbId);

//         if (movie === null) {
//           return;
//         }

//         if (typeof movie.id === "undefined") {
//           throw new Error(
//             `Movie retrieved from TMDB is missing an ID, ${tmdbId} / ${rating.Name}`
//           );
//         }

//         log(
//           "debug",
//           `Successfully retrieved movie info for ID ${tmdbId}, ${rating.Name}`
//         );

//         // add movie to database
//         await upsertMovie(movie);
//         log("debug", `${movie.title} added to database`);

//         log(
//           "info",
//           `Adding genres and production companies for ${movie.title}`
//         );

//         // add genres
//         if (movie.genres) {
//           log("debug", `Adding ${movie.genres.length} genres`);
//           await Promise.all(
//             movie.genres.map(async ({ id, name }) => {
//               if (!id || !name) return;
//               await addGenre(id, name);
//               await addGenreToMovie(movie.id!, id);
//             })
//           );
//         }

//         // add production companies
//         if (movie.production_companies) {
//           log(
//             "debug",
//             `Adding ${movie.production_companies.length} production companies`
//           );
//           await Promise.all(
//             movie.production_companies.map(
//               async ({
//                 id,
//                 logo_path = "",
//                 name,
//                 origin_country = "unknown",
//               }) => {
//                 if (!id || !name) return;
//                 await addProductionCompany(id, name, logo_path, origin_country);
//                 await addProductionCompanyToMovie(movie.id!, id);
//               }
//             )
//           );
//         }

//         // get cast and crew
//         const { cast = [], crew = [] } = await tmdb.movieCredits(tmdbId);

//         log(
//           "info",
//           `Adding ${cast.length} cast and ${crew.length} crew to movies and people caches for ${movie.title}`
//         );

//         const castActions = cast.map(async (castMember) => {
//           if (!castMember.id) {
//             log(
//               "error",
//               `Missing person ID for this cast member ${JSON.stringify(
//                 castMember
//               )}`
//             );
//             return;
//           }

//           if (castMember.order && castMember.order > 50) {
//             skippedCast++;
//             return;
//           }

//           await addCastMemberToMovie(
//             movie.id!,
//             castMember.id,
//             castMember.cast_id,
//             castMember.character,
//             castMember.order,
//             castMember.credit_id
//           );
//           log(
//             "debug",
//             `Cast member added for ${castMember.id} / ${castMember.name} as ${castMember.character}`
//           );

//           // const storedPerson = await getPerson(castMember.id);
//           // log("debug", `Person in database? ${typeof storedPerson === "undefined" ? "no" : "yes"}`);

//           // if (typeof storedPerson === "undefined") {
//           //   return await getPersonAndStore(castMember.id, castMember.name);
//           // } else {
//           //   log("debug", `${castMember.name} already in database: ${storedPerson.name}`);
//           //   return;
//           // }
//         });

//         const crewActions = crew.map(async (crewMember) => {
//           if (!crewMember.id) {
//             log(
//               "error",
//               `Missing person ID for this cast member ${JSON.stringify(
//                 crewMember
//               )}`
//             );
//             return;
//           }

//           if (!crewMember.job || !JOB_ALLOW_LIST.includes(crewMember.job)) {
//             skippedCrew++;
//             return;
//           }

//           await addCrewMemberToMovie(
//             movie.id!,
//             crewMember.id,
//             crewMember.job,
//             crewMember.department,
//             crewMember.credit_id
//           );
//           log(
//             "debug",
//             `Crew member added for ${crewMember.id} / ${crewMember.name} (${crewMember.job} / ${crewMember.department})`
//           );

//           // const storedPerson = await getPerson(crewMember.id);
//           // log("debug", `${crewMember.name} in database? ${typeof storedPerson === "undefined" ? "no" : "yes"}`);

//           // if (typeof storedPerson === "undefined") {
//           //   return await getPersonAndStore(crewMember.id, crewMember.name);
//           // } else {
//           //   log("debug", `${crewMember.name} already in database: ${storedPerson.name}`);
//           //   return;
//           // }
//         });

//         await Promise.all([...castActions, ...crewActions]);
//         log("info", `Finished processing movie ${i}: ${movie.title}`);
//       }
//     })
//   );

//   return {
//     skippedCrew,
//     skippedCast,
//   };
// }

// interface Results {
//   skippedCast: number;
//   skippedCrew: number;
// }

// export interface BatchProcessOptions extends ProcessRatingsOptions {
//   batchSize: number;
//   results?: Results;
//   offset?: number;
// }

// export async function batchProcessRatings({
//   userId,
//   ratings,
//   offset = 0,
//   batchSize,
//   results = {
//     skippedCast: 0,
//     skippedCrew: 0,
//   },
// }: BatchProcessOptions): Promise<Results> {
//   const batchStart = 0 + offset;
//   const batchEnd = batchStart + batchSize;
//   log("info", `Processing batch of ratings ${batchStart} to ${batchEnd}`);

//   const batch = ratings.slice(batchStart, batchEnd);
//   const batchResults = await processRatings({
//     userId,
//     ratings: batch,
//     offset: batchStart,
//   });

//   batchResults.skippedCast += results.skippedCast;
//   batchResults.skippedCrew += results.skippedCrew;

//   if (batchEnd >= ratings.length) {
//     log("info", "Finished processing all batches");
//     return batchResults;
//   } else {
//     return await batchProcessRatings({
//       userId,
//       ratings,
//       offset: batchEnd,
//       batchSize,
//       results: batchResults,
//     });
//   }
// }
