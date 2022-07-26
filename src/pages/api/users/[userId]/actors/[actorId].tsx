import { NextApiHandler } from "next";
import { RatedTmdbCast } from "../../../../../common/types/db";
import { getMoviesForActorAndUser, getAverageRatingForActor } from "../../../../../db/client";
import { tmdb, TmdbCast, TmdbCrew } from "../../../../../lib/tmdb";
import { numericQueryParam } from "../../../../../lib/queryParams";

const UserStatsActorRoute: NextApiHandler = async (req, res) => {
  const { userId, actorId, castOrderThreshold } = req.query;

  const numericCastOrderThreshold = numericQueryParam(castOrderThreshold);
  const numericUserId = numericQueryParam(userId) || 0;
  const numericActorId = numericQueryParam(actorId) || 0;

  if (isNaN(numericActorId) || numericActorId === 0) {
    res.status(400).send("Numeric non-zero actor ID is required");
    return;
  }

  const [ratings, average, actor, credits] = await Promise.all([
    getMoviesForActorAndUser({
      userId: numericUserId,
      actorId: numericActorId,
      castOrderThreshold: numericCastOrderThreshold
    }),
    getAverageRatingForActor({
      userId: numericUserId,
      actorId: numericActorId,
      castOrderThreshold: numericCastOrderThreshold
    }),
    undefined, // getPerson(numericActorId),
    tmdb.personMovieCredits(numericActorId) as Promise<{ id: number; cast: TmdbCast[], crew: TmdbCrew[] }>
  ]);
  
  const ratingsMap = ratings.reduce<Record<number, number>>((map, rating) => {
    map[rating.id] = rating.stars;
    return map;
  }, {});

  const { cast = [] } = credits;
  const creditsWithRatings = cast
    .filter(credit => {
      return Boolean(
        typeof credit.order === 'number' && 
        typeof numericCastOrderThreshold === 'number' && 
        credit.order <= numericCastOrderThreshold
      );
    })
    .map<RatedTmdbCast>((credit) => {
      return { 
        ...credit,
        rating: credit.id ? ratingsMap[credit.id] : undefined
      };
    });
  
  res.json({ actor, ratings, ...average, cast_credits: creditsWithRatings });
}

export default UserStatsActorRoute;