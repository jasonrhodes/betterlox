import { FindOptionsWhere, ILike } from "typeorm";
import { LetterboxdListsManagementApiResponse } from "../../../../common/types/api";
import { LetterboxdList } from "../../../../db/entities";
import { getLetterboxdListMovieEntriesRepository, getLetterboxdListsRepository, getUserRepository } from "../../../../db/repositories";
import { scrapeListByUrl } from "../../../../lib/letterboxd";
import { numericQueryParam, singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const ListsManagementRoute = createApiRoute<LetterboxdListsManagementApiResponse>({
  handlers: {
    get: async (req, res) => {
      const limit = numericQueryParam(req.query.perPage, 100);
      const offset = numericQueryParam(req.query.page, 1) - 1;
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortOrder) || 'DESC';
      const q = singleQueryParam(req.query.q);
      const ListsRepo = await getLetterboxdListsRepository();

      const orderBy = sortBy === 'filmCount' ? {} : {
        order: {
          [sortBy]: sortDir
        }
      };

      const where: FindOptionsWhere<LetterboxdList> = {};

      if (q) {
        where.title = ILike(`%${q}%`);
      }

      const lists = await ListsRepo.find({
        relations: {
          movies: {
            movie: true
          },
          trackers: true
        },
        where,
        take: limit,
        skip: offset,
        ...orderBy
      });

      if (sortBy === 'filmCount') {
        lists.sort((a, b) => {
          const compare = a.movies.length > b.movies.length;
          if (sortDir === "ASC") {
            return compare ? 1 : -1;
          }
          if (sortDir === "DESC") {
            return compare ? -1 : 1;
          }
          return 0;
        });
      }

      res.json({ success: true, lists });
    },
    post: async (req, res) => {
      const url = singleQueryParam(req.body.url);
      if (!url) {
        res.status(400).json({ success: false, code: 400, message: 'url is required and must be a valid Letterboxd list url' });
        return;
      }
      const LetterboxdListsRepo = await getLetterboxdListsRepository();
      const UsersRepo = await getUserRepository();
      const MovieEntriesRepo = await getLetterboxdListMovieEntriesRepository();

      const { details, movieIds, owner } = await scrapeListByUrl(url);
      const user = await UsersRepo.findOneBy({ username: owner });

      details.lastSynced = new Date();
      
      if (user) {
        details.owner = user;
      }

      const found = await LetterboxdListsRepo.findOneBy({ url: details.url });
      const updated = found 
        ? await LetterboxdListsRepo.preload({ ...details, id: found.id }) 
        : LetterboxdListsRepo.create(details);

      if (!updated) {
        throw new Error('Could not upsert list into DB');
      }

      const saved = await LetterboxdListsRepo.save(updated);

      const movieEntries = movieIds.map((id, i) => {
        return {
          movieId: id,
          listId: saved.id,
          order: i
        }
      });
      await MovieEntriesRepo.delete({ listId: saved.id });
      await MovieEntriesRepo.upsert(movieEntries, ['movieId', 'listId']);
      res.json({ success: true, list: details });
    }
  }
});

export default ListsManagementRoute;