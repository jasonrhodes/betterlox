import { NextApiResponse } from "next";

export function handleGenericError(error: unknown, res: NextApiResponse) {
  res.statusCode = 500;
  const message = (error instanceof Error) 
    ? error.message
    : (typeof error === "string") 
      ? error
      : "An unknown error occurred";
  
  console.log(message);
  
  res.json({ success: false, code: 500, errorMessage: "An unexpected error occurred" });
}