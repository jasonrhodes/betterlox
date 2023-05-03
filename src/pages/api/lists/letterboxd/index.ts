import { FindOptionsWhere, ILike } from "typeorm";
import { LetterboxdListsManagementApiResponse } from "../../../../common/types/api";
import { LetterboxdList } from "@rhodesjason/loxdb/dist/db/entities";
import { getLetterboxdListMovieEntriesRepository, getLetterboxdListsRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { scrapeListByUrl } from "@rhodesjason/loxdb/dist/lib/letterboxd";
import { numericQueryParam, singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const ListsManagementRoute = createApiRoute<LetterboxdListsManagementApiResponse>({
  handlers: {
    get: async (req, res) => {
      const limit = numericQueryParam(req.query.perPage, 10);
      const offset = (numericQueryParam(req.query.page, 1) - 1) * limit;
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortDir) || 'DESC';
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

      const totalCount = await ListsRepo.countBy(where);

      const lists = await ListsRepo.find({
        relations: {
          movies: {
            movie: true
          },
          owner: true,
          trackers: true,
          followers: true
        },
        where,
        take: limit,
        skip: offset,
        ...orderBy
      });

      res.json({ success: true, lists, totalCount });
    },
    post: async (req, res) => {
      const url = singleQueryParam(req.body.url);
      const autofollower = numericQueryParam(req.body.autofollower);
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

      if (autofollower) {
        const follower = await UsersRepo.findOneBy({ id: autofollower });
        if (follower) {
          updated.followers.push(follower);
        }
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