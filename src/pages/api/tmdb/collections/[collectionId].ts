import { ApiErrorResponse, ApiSuccessResponse, TmdbCollectionByIdResponse } from "../../../../common/types/api";
import { singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { tmdb, TmdbCollection } from "../../../../lib/tmdb";



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
        res.json({ success: true, collection });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: err instanceof Error ? err.message : "Unknown error while retrieving collection info from TMDB API" });
      }
    }
  }
});

export default TMDBCollectionByIdRoute;