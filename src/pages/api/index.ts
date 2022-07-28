import { NextApiHandler } from "next";

const HomeRoute: NextApiHandler = async (req, res) => {
  res.json({ message: "Welcome to the BetterLox API" });
}

export default HomeRoute;