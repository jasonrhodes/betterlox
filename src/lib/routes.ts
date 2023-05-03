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

export interface RouteOptions<T> {
  isAdmin?: boolean;
  handlers: MethodMap<T>
}

export type MethodMap<T> = Record<string, NextApiHandler<T>>

export function createApiRoute<T>({
  handlers,
  isAdmin = false
}: RouteOptions<T>): NextApiHandler<T | ApiErrorResponse> {
  return async (req, res) => {
    try {
      const methods = Object.keys(handlers).map(m => m.toUpperCase());
      if (!req.method) {
        const message = `No method provided in request for ${req.url}`;
        respondWithError(res, 500, message);
        throw message;
      }
      if (req.method) {
        if (!methods.includes(req.method.toUpperCase())) {
          const message = `${req.method} not allowed, only ${methods.join(' | ')}`;
          respondWithError(res, 500, message);
          throw message;
        }
      }

      const handler = handlers[req.method.toLowerCase()];
      if (!handler || typeof handler !== "function") {
        throw new Error(`Handler error, likely problem with casing (${Object.keys(handlers)} vs. ${req.method})`);
      }

      if (isAdmin) {
        return await createAdminRoute<T>(handler)(req, res);
      } else {
        return await handler(req, res);
      }
    } catch (error: unknown) {
      // global error handler for all API routes
      const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error occurred";
      console.error(`[Global Error Handler] [${req.url}] ${message}`);
      res.status(500).json({ success: false, code: 500, message });
    }
  }
}