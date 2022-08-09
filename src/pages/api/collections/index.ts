import { FindManyOptions, FindOptionsWhere, ILike, In, Like, MoreThan } from "typeorm";
import { CollectionsApiResponse } from "../../../common/types/api";
import { Person, Collection } from "../../../db/entities";
import { getCollectionsRepository } from "../../../db/repositories";
import { singleQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

function forceArray(value: string | string[] | undefined) {
  if (value === undefined) return value;
  return (Array.isArray(value) ? value.map(v => v.split(',')) : value.split(',')).flat();
}

const CollectionsApiRoute = createApiRoute<CollectionsApiResponse>({
  handlers: {
    get: async (req, res) => {
      const CollectionsRepo = await getCollectionsRepository();
      const options: FindManyOptions<Collection> = {};
      const limit = singleQueryParam(req.query.limit);

      const where: FindOptionsWhere<Person> = {};
      const ids = forceArray(req.query.ids);
      if (ids) {
        where.id = In(ids);
      }
      const namePattern = singleQueryParam(req.query.name);
      if (namePattern) {
        where.name = ILike(`%${namePattern.replace(' ', '%')}%`);
      }
      const exactName = singleQueryParam(req.query.exactName);
      if (exactName) {
        where.name = exactName;
      }

      const query = CollectionsRepo.createQueryBuilder('collection')
        .select('collection.id', 'id')
        .addSelect('collection.name', 'name')
        .addSelect('COUNT(rating.movieId) as ratingCount')
        .where(where)
        .leftJoin("collection.movies", "movie")
        .leftJoin("movie.ratings", "rating")
        .groupBy('collection.id')
        .addGroupBy('collection.name')
        .having('COUNT(rating.movieId) > 0')
        .orderBy('ratingCount', 'DESC')
        .take(limit ? Number(limit) : undefined);

      const collections = await query.getRawMany<Pick<Collection, 'id' | 'name'>>();
      res.json({ success: true, collections });
    }
  }
});

export default CollectionsApiRoute;