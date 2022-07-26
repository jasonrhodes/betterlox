import { NextApiHandler } from "next";
import { ApiError } from "../../common/types/api";
import { getUserDetails } from "../../lib/letterboxd";
import { singleQueryParam } from "../../lib/queryParams";

export type ApiGetLetterboxdDetailsResponse = { details: Awaited<ReturnType<typeof getUserDetails>> } | ApiError;

const LetterboxdDetails: NextApiHandler<ApiGetLetterboxdDetailsResponse> = async (req, res) => {
  const { username = '' } = req.query;
  if (username.length === 0) {
    res.status(400).json({
      errorMessage: 'Username is required'
    });
  }
  const singleUsername = singleQueryParam(username);
  try {
    const details = await getUserDetails(singleUsername);
    res.json({ details });
  } catch (err: unknown) {
    console.log('error', err);
  }
}

export default LetterboxdDetails;