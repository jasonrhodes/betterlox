import { NextApiHandler } from "next";

const LoginRoute: NextApiHandler = async (req, res) => {
  res.json({ user: { id: 1, letterboxd: "rhodesjason" }});
}

export default LoginRoute;