import { createApiRoute } from "../../lib/routes";

const HomeRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      res.json({ message: "Welcome to the BetterLox API" });
    }
  }
});

export default HomeRoute;