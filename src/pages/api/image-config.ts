import { NextApiHandler } from "next";
import { tmdb } from "../../lib/tmdb";

const ImageConfigRoute: NextApiHandler = async (req, res) => {
  const config = await tmdb.configuration();
  res.json({ ...config.images });
}

export default ImageConfigRoute;