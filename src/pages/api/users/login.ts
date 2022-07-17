import { NextApiHandler } from "next";
import { UserPublic } from "../../../common/types/db";
import { getUserRepository, UserRepoError } from "../../../db/repositories/UserRepo";
import { handleGenericError } from "../../../lib/apiErrorHandler";
import { singleQueryParam } from "../../../lib/queryParams";

interface LoginApiResponseSuccess {
  success: true;
  user: UserPublic;
}

interface LoginApiResponseFailure {
  success: false;
  errorMessage: string;
}

type LoginApiResponse = LoginApiResponseSuccess | LoginApiResponseFailure;

const LoginRoute: NextApiHandler<LoginApiResponse> = async (req, res) => {
  const email = singleQueryParam(req.body.email);
  const password = singleQueryParam(req.body.password);
  const rememberMe = Boolean(singleQueryParam(req.body.rememberMe));

  console.log("In Login Route");

  const UserRepository = await getUserRepository();

  try {
    const { user } = await UserRepository.login(email, password, rememberMe);
    res.json({ success: true, user });
  } catch (error: unknown) {
    if (error instanceof UserRepoError) {
      res.statusCode = 401;
      res.json({ success: false, errorMessage: error.message });
    } else {
      handleGenericError(error, res);
    }
  }
}

export default LoginRoute;