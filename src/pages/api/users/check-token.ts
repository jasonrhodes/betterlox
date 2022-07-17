import { NextApiHandler } from "next";
import { UserPublic } from "../../../common/types/db";
import { UserRepoError, getUserRepository } from "../../../db/repositories/UserRepo";
import { handleGenericError } from "../../../lib/apiErrorHandler";
import { singleQueryParam } from "../../../lib/queryParams";

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

  console.log("check token route 1");

  const UserRepository = await getUserRepository();

  console.log("check token route 2");

  try {
    const { user } = await UserRepository.getUserByRememberMeToken(token);
    res.json({ success: true, user });
  } catch (error: unknown) {
    console.log("check token route 3");
    if (error instanceof UserRepoError) {
      res.statusCode = 404;
      res.json({ success: false, errorMessage: error.message });
    } else {
      handleGenericError(error, res);
    }
  }
}

export default CheckTokenRoute;