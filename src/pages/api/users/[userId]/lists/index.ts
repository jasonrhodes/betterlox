import { FindOptionsWhere, ILike, In } from "typeorm";
import { LetterboxdListsForUserApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { SyncStatus, SyncTrigger, SyncType } from "@rhodesjason/loxdb/dist/common/types/db";
import { LetterboxdList, LetterboxdListMovieEntry } from "@rhodesjason/loxdb/dist/db/entities";
import { getLetterboxdListMovieEntriesRepository, getLetterboxdListsRepository, getMoviesRepository, getSyncRepository, getUserRepository, getUserSettingsRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { scrapeListsForUser } from "@rhodesjason/loxdb/dist/lib/letterboxd";
import { numericQueryParam, singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";

const ListsForUserRoute = createApiRoute<LetterboxdListsForUserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortDir) || 'DESC';
      const limit = numericQueryParam(req.query.perPage, 10);
      const offset = (numericQueryParam(req.query.page, 1) - 1) * limit;
      const q = singleQueryParam(req.query.q);
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
          [sortBy]: sortDir.toLowerCase()
        }
      };

      const where: FindOptionsWhere<LetterboxdList> = {
        owner: {
          id: userId
        }
      };

      if (q) {
        where.title = ILike(`%${q}%`);
      }

      const totalCount = await LetterboxdListsRepo.countBy(where);

      const lists = await LetterboxdListsRepo.find({
        relations: {
          movies: {
            movie: true
          },
          owner: true,
          trackers: true
        },
        where,
        take: limit,
        skip: offset,
        ...orderBy
      });

      // console.log('GET users/:id/lists - after sort, first list', lists[0].title);

      res.json({ success: true, lists, totalCount });
    },
    post: async (req, res) => {
      // Deactivating this endpoint because the sync overload is massive, and users can sync one list at a time
      // on the /lists page which should prevent overload somewhat.
      res.status(403).json({ success: false, code: 403, message: 'This endpoint is currently deactivated for all users' });
      return;

      // // retrieve user's lists from Letterboxd
      // const userId = numericQueryParam(req.query.userId)!
      // const UsersRepo = await getUserRepository();
      // const user = await UsersRepo.findOneBy({ id: userId });

      // if (!user) {
      //   console.log("No user exists in user list request");
      //   return res.status(401).json({ 
      //     success: false, 
      //     code: 401,
      //     message: 'User does not exist or does not have access to perform this operation.' 
      //   });
      // }

      // const SyncsRepo = await getSyncRepository();
      // const { syncsInProgress, sync } = await SyncsRepo.queueSync({ trigger: SyncTrigger.USER, username: user.username });

      // if (syncsInProgress.length) {
      //   SyncsRepo.skipSync(sync);
      //   return res.status(429).json({
      //     success: false,
      //     code: 429,
      //     message: "Sync already in progress for this user"
      //   });
      // }

      // sync.type = SyncType.USER_LISTS;
      // SyncsRepo.startSync(sync);

      // res.status(200).json({
      //   success: true
      // });

      // try {
      //   const LetterboxdListsRepo = await getLetterboxdListsRepository();
      //   const MovieEntriesRepo = await getLetterboxdListMovieEntriesRepository();
        
      //   const numListsSynced = await scrapeListsForUser({
      //     username: user.username,
      //     processList: async ({ details, movieIds }) => {
      //       details.lastSynced = new Date();
      //       details.owner = user;
    
      //       const found = await LetterboxdListsRepo.findOneBy({ url: details.url });
      //       const updated = found 
      //         ? await LetterboxdListsRepo.preload({ ...details, id: found.id }) 
      //         : LetterboxdListsRepo.create(details);

      //       if (!updated) {
      //         throw new Error('Could not upsert list into DB');
      //       }

      //       const saved = await LetterboxdListsRepo.save(updated);

      //       const movieEntries = movieIds.map((id, i) => {
      //         return {
      //           movieId: id,
      //           listId: saved.id,
      //           order: i
      //         }
      //       });
      //       await MovieEntriesRepo.delete({ listId: saved.id });
      //       const result = await MovieEntriesRepo.upsert(movieEntries, ['movieId', 'listId']);
      //     }
      //   });

      //   SyncsRepo.endSync(sync, { status: SyncStatus.COMPLETE, numSynced: numListsSynced });
      // } catch (error: unknown) {
      //   SyncsRepo.endSync(sync, { 
      //     status: SyncStatus.FAILED,
      //     numSynced: 0,
      //     errorMessage: getErrorAsString(error) 
      //   });
      //   const message = getErrorAsString(error);
      //   console.log('ERROR CAUGHT AFTER RESPONSE', message);
      // }
    }
  }
});

export default ListsForUserRoute;