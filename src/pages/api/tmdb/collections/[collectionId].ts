import { ApiErrorResponse, TmdbCollectionByIdResponse } from "../../../../common/types/api";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { tmdb } from "@rhodesjason/loxdb/dist/lib/tmdb";



const TMDBCollectionByIdRoute = createApiRoute<TmdbCollectionByIdResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const cid = singleQueryParam(req.query.collectionId);
      if (!cid) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Collection ID is required'
        });
      }
      
      try {
        const collection = await tmdb.collectionInfo(cid);
        if (typeof collection.parts === "undefined") {
          throw new Error(`Collection ${cid} does not include any movie parts`);
        }
        const enhanced = await Promise.all(collection.parts.map(async (part) => {
          let imdbId = "";
          // this lookup seems to add TONS of time to the request, commenting out for now
          // if (part.id) {
          //   const movie = await tmdb.movieInfo(part.id);
          //   imdbId = movie.imdb_id || "";
          // }
          return { ...part, imdb_id: imdbId };
        }));
        res.json({ success: true, collection: { ...collection, parts: enhanced || [] } });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: err instanceof Error ? err.message : "Unknown error while retrieving collection info from TMDB API" });
      }
    }
  }
});

export default TMDBCollectionByIdRoute;