import { NextApiHandler } from "next";
import { UserPublic } from "../../../common/types/db";
import { checkLogin, User } from "../../../lib/models/users";
import { singleQueryParam } from "../../../lib/queryParams";
import ResponseError from "../../../lib/ResponseError";

interface LoginApiResponseSuccess {
  success: true;
  user: UserPublic;
  rememberMeToken?: string;
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

  try {
    const { user, rememberMeToken } = await checkLogin(email, password, rememberMe);
    res.json({ success: true, user, rememberMeToken });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      res.json({ success: false, errorMessage: error.message });
    }
  }
}

export default LoginRoute;