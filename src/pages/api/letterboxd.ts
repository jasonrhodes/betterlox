import { NextApiHandler } from "next";
import { ApiError } from "../../common/types/api";
import { getUserDetails } from "../../lib/letterboxd";
import { singleQueryParam } from "../../lib/queryParams";

export type ApiGetLetterboxdDetailsResponse = { details: Awaited<ReturnType<typeof getUserDetails>> } | ApiError;

const LetterboxdDetails: NextApiHandler<ApiGetLetterboxdDetailsResponse> = async (req, res) => {
  if (!req.query.username) {
    res.status(400).json({
      errorMessage: 'Username is required'
    });
  }
  const username = singleQueryParam(req.query.username);
  try {
    const details = await getUserDetails(username);
    res.json({ details });
  } catch (err: unknown) {
    console.log('error', err);
  }
}

export default LetterboxdDetails;