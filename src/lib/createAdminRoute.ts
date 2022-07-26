import { NextApiHandler, NextApiResponse } from "next";
import { ApiErrorResponse } from "../common/types/api";
const { BETTERLOX_API_TOKEN } = process.env;

function respondWithError(res: NextApiResponse, code: number, message: string) {
  res.status(code).json({ success: false, code, message });
}

export function createAdminRoute<T>(fn: NextApiHandler<T>): NextApiHandler<T | ApiErrorResponse> {
  return (req, res) => {
    if (!BETTERLOX_API_TOKEN) {
      respondWithError(res, 500, 'A system error occurred, authentication token cannot be validated');
      return;
    }

    const headerToken = req.headers['x-betterlox-api-token'];

    if (!headerToken || headerToken !== BETTERLOX_API_TOKEN) {
      respondWithError(res, 401, 'You are not authorized to access this route without an API token');
      return;
    }

    return fn(req, res);
  }
}