import { ApiErrorResponse } from "../../common/types/api";
import { getUserDetails, LetterboxdDetails } from "@rhodesjason/loxdb/dist/lib/letterboxd";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../lib/routes";

export type ApiGetLetterboxdDetailsResponse = { success: true, details: LetterboxdDetails } | ApiErrorResponse;

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
        res.json({ success: true, details });
      } catch (err: unknown) {
        console.log('error', err);
      }
    }
  }
});

export default LetterboxdDetails;