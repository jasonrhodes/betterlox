import { NextApiHandler } from "next";
import { UserPublic } from "../../../common/types/db";
import { checkLogin, checkToken, User } from "../../../lib/models/users";
import { singleQueryParam } from "../../../lib/queryParams";
import ResponseError from "../../../lib/ResponseError";

interface CheckTokenApiResponseSuccess {
  success: true;
  user: UserPublic;
}

interface CheckTokenApiResponseFailure {
  success: false;
  errorMessage: string;
}

export type CheckTokenApiResponse = CheckTokenApiResponseSuccess | CheckTokenApiResponseFailure;

export interface CheckTokenApiRequest {
  token: string;
}

const CheckTokenRoute: NextApiHandler<CheckTokenApiResponse> = async (req, res) => {
  const token = singleQueryParam(req.body.token);

  try {
    const { user } = await checkToken(token);
    res.json({ success: true, user });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      res.json({ success: false, errorMessage: error.message });
    }
  }
}

export default CheckTokenRoute;