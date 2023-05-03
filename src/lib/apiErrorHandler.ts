import { NextApiResponse } from "next";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";

export function handleGenericError(error: unknown, res: NextApiResponse) {
  res.statusCode = 500;
  const message = getErrorAsString(error);
  console.log(`Generic error handler: ${message}`);
  res.json({ success: false, code: 500, errorMessage: "An unexpected error occurred" });
}