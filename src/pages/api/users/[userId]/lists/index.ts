import { In } from "typeorm";
import { LetterboxdListsForUserApiResponse } from "../../../../../common/types/api";
import { LetterboxdListMovieEntry } from "../../../../../db/entities";
import { getLetterboxdListMovieEntriesRepository, getLetterboxdListsRepository, getMoviesRepository, getUserRepository, getUserSettingsRepository } from "../../../../../db/repositories";
import { scrapeListsForUser } from "../../../../../lib/letterboxd";
import { numericQueryParam, singleQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";

const ListsForUserRoute = createApiRoute<LetterboxdListsForUserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortOrder) || 'DESC';
      const LetterboxdListsRepo = await getLetterboxdListsRepository();

      // console.log('GET users/:id/lists - sort by', sortBy);

      // let query = LetterboxdListsRepo.createQueryBuilder('list')
      //   .leftJoinAndSelect('list.movies', 'movieEntry')
      //   .leftJoinAndSelect('movieEntry.movie', 'movie')
      //   .leftJoinAndSelect('list.trackers', 'tracker')
      //   .where('list.ownerId = :userId', { userId })
      //   .groupBy('list.id')
      //   .addGroupBy('movieEntry.movieId');
      
      // console.log("Check Query", query.getSql());

      const orderBy = sortBy === 'filmCount' ? {} : {
        order: {
          [sortBy]: sortDir
        }
      };

      const lists = await LetterboxdListsRepo.find({
        relations: {
          movies: {
            movie: true
          },
          trackers: true
        },
        where: {
          owner: {
            id: userId
          }
        },
        ...orderBy
      });

      if (sortBy === 'filmCount') {
        lists.sort((a, b) => {
          console.log(a.title, a.movies.length, b.title, b.movies.length);
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

      // console.log('GET users/:id/lists - after sort, first list', lists[0].title);

      res.json({ success: true, lists });
    },
    post: async (req, res) => {
      // retrieve user's lists from Letterboxd
      const userId = numericQueryParam(req.query.userId)!
      const UsersRepo = await getUserRepository();
      const user = await UsersRepo.findOneBy({ id: userId });
      if (!user) {
        return res.status(401).json({ success: false, code: 401, message: 'User does not exist or does not have access to perform this operation.' })
      }
      const LetterboxdListsRepo = await getLetterboxdListsRepository();
      const MovieEntriesRepo = await getLetterboxdListMovieEntriesRepository();
      const numListsSynced = await scrapeListsForUser({
        username: user.username,
        processPage: async (lists) => {
          for (let i = 0; i < lists.length; i++) {
            const { details, movieIds } = lists[i];
            details.lastSynced = new Date();
            details.owner = user;
    
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
          }

          return {
            continue: true
          };
        }
      });
            
      res.status(200).json({ success: true, synced: numListsSynced });
    }
  }
});

export default ListsForUserRoute;