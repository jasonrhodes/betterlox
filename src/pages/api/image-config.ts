import { NextApiHandler } from "next";
import { tmdb } from "../../server/lib/tmdb";

const ImageConfigRoute: NextApiHandler = async (req, res) => {
  const config = await tmdb.configuration();
  res.json({ ...config.images });
}

export default ImageConfigRoute;