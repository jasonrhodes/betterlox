import { NextApiHandler } from "next";
import { CastRole, Movie, Rating } from "../../../../../db/entities";
import { getPeopleRepository } from "../../../../../db/repositories/PeopleRepo";

const UserStatsActorsRoute: NextApiHandler = async (req, res) => {
  const { userId, castOrderThreshold } = req.query;
  const numericUserId = Number(userId);
  const numericCastOrderThreshold = Number(castOrderThreshold);

  // const actors = await getActorsForUser({
  //   userId: numericUserId,
  //   castOrderThreshold: !isNaN(numericCastOrderThreshold) ? numericCastOrderThreshold : undefined
  // });

  const PeopleRepository = await getPeopleRepository();
  // const actors = await ActorsRepository.find({
  //   where: {
  //     castRoles: {
  //       movie: {
  //         ratings: {
  //           userId: numericUserId
  //         }
  //       }
  //     }
  //   },
  //   relations: {
  //     castRoles: {
  //       movie: {
  //         ratings: true
  //       }
  //     }
  //   }
  // });

  const query = PeopleRepository
    .createQueryBuilder("actor")
    .leftJoin("actor.castRoles", 'castRole')
    .leftJoin("castRole.movie", 'movie')
    .leftJoin("movie.ratings", 'rating')
    .select("actor.id", "actorId")
    .addSelect("actor.name", "name")
    .addSelect("actor.profilePath", "profilePath")
    .addSelect("AVG(rating.rating)", "avgRating")
    .addSelect("COUNT(movie.id)", "countMoviesSeen")
    .where("rating.userId = :userId", { userId: numericUserId })
    .andWhere("castRole.castOrder < :castOrderThreshold", { castOrderThreshold })
    .groupBy("actor.id")
    .having("countMoviesSeen > :minMovies", { minMovies: 1 })
    .orderBy("avgRating", "DESC");

  console.log(query.getSql());

  const actors = await query.getRawMany();

  // console.log({ actors });

  res.json({ actors });
}

export default UserStatsActorsRoute;