import { NextApiHandler } from "next";
import { ApiErrorResponse } from "../../common/types/api";
import { getUserDetails } from "../../lib/letterboxd";
import { singleQueryParam } from "../../lib/queryParams";
import { createApiRoute } from "../../lib/routes";

export type ApiGetLetterboxdDetailsResponse = { details: Awaited<ReturnType<typeof getUserDetails>> } | ApiErrorResponse;

const LetterboxdDetails = createApiRoute<ApiGetLetterboxdDetailsResponse>({
  handlers: {
    get: async (req, res) => {
      const { username = '' } = req.query;
      if (username.length === 0) {
        res.status(400).json({
          success: false,
          code: 400,
          message: 'Username is required'
        });
      }
      const singleUsername = singleQueryParam(username) || '';
      try {
        const details = await getUserDetails(singleUsername);
        res.json({ details });
      } catch (err: unknown) {
        console.log('error', err);
      }
    }
  }
});

export default LetterboxdDetails;