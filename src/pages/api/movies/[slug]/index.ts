import { In, LessThanOrEqual } from "typeorm";
import { MovieApiResponse } from "../../../../common/types/api";
import { getCastRepository, getCrewRepository, getMoviesRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const MoviesApiRoute = createApiRoute<MovieApiResponse>({
  handlers: {
    get: async (req, res) => {
      const slug = singleQueryParam(req.query.slug)!;
      const filmSlashSlugSlash = `/film/${slug}/`;
      const MoviesRepo = await getMoviesRepository();
      const CrewRepo = await getCrewRepository();
      const CastRepo = await getCastRepository();
      
      try {
        const movie = await MoviesRepo.findOne({
          select: {
            entries: {
              user: {
                username: true,
                avatarUrl: true,
                letterboxdAccountLevel: true
              }
            }
          },
          relations: {
            collections: true,
            cast: false,
            crew: false,
            entries: {
              user: true
            },
            lists: false // introducing this here causes a lot of slowness in the queries, we'll do this lookup separately
          },
          where: {
            letterboxdSlug: filmSlashSlugSlash
          }
        });

        if (!movie) {
          return res.status(404).json({ success: false, code: 404, message: `No movie found by ${slug}`})
        }

        movie.cast = await CastRepo.find({
          relations: {
            actor: true
          },
          where: {
            movieId: movie.id,
            castOrder: LessThanOrEqual(10)
          },
          order: {
            castOrder: 'ASC'
          }
        });

        movie.crew = await CrewRepo.find({
          relations: {
            person: true
          },
          where: {
            movieId: movie.id,
            job: In(['Director', 'Screenplay', 'Writer', 'Editor', 'Original Music Composer', 'Cinematography', 'Director of Photography'])
          },
          order: {
            person: {
              popularity: 'DESC'
            }
          }
        });
        
        res.json({ success: true, movie });
      } catch (error: unknown) {
        console.log('Get Movie Query Blew Up //', getErrorAsString(error));
        res.status(500).json({ success: false, code: 500, message: 'System error occurred' });
      }
    }
  }
});

export default MoviesApiRoute;