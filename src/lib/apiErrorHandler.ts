import { NextApiResponse } from "next";

export function handleGenericError(error: unknown, res: NextApiResponse) {
  res.statusCode = 500;
  const message = (error instanceof Error) 
    ? error.message
    : (typeof error === "string") 
      ? error
      : "An unknown error occurred";
  
  res.json({ success: false, errorMessage: message });
}