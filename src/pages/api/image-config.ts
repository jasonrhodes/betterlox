import { ConfigurationResponse } from "moviedb-promise/dist/request-types";
import { createApiRoute } from "../../lib/routes";
import { tmdb } from "../../lib/tmdb";

// TODO: Not sure if this is worth looking up ever, or if it always stays the same.
// But for now, I'm leaving this as a back-up option when the other lookup fails.
const HARD_CODED_CONFIG = {"base_url":"http://image.tmdb.org/t/p/","secure_base_url":"https://image.tmdb.org/t/p/","backdrop_sizes":["w300","w780","w1280","original"],"logo_sizes":["w45","w92","w154","w185","w300","w500","original"],"poster_sizes":["w92","w154","w185","w342","w500","w780","original"],"profile_sizes":["w45","w185","h632","original"],"still_sizes":["w92","w185","w300","original"]}

let cachedConfig: ConfigurationResponse['images'] | null = null;

async function getConfig() {
  try {
    const { images } = await tmdb.configuration();
    return images;
  } catch (err) {
    return HARD_CODED_CONFIG;
  }
}

const ImageConfigRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      const config = cachedConfig ? cachedConfig : await getConfig();
      if (!cachedConfig) {
        cachedConfig = config;
      }
      res.json({ ...config });
    }
  }
});

export default ImageConfigRoute;