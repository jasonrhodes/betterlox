import { createApiRoute } from "../../../lib/routes";

const MoviesApiRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      res.json({ message: "Welcome to the BetterLox API" });
    }
  }
});

export default MoviesApiRoute;