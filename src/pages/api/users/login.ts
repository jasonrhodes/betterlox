import { NextApiHandler } from "next";
import { checkLogin, User } from "../../../lib/models/users";
import { singleQueryParam } from "../../../lib/queryParams";
import ResponseError from "../../../lib/ResponseError";

interface LoginApiResponseSuccess {
  success: true;
  rememberMe: boolean;
  user: User;
  token?: string;
}

interface LoginApiResponseFailure {
  success: false;
  errorMessage: string;
}

type LoginApiResponse = LoginApiResponseSuccess | LoginApiResponseFailure;

const LoginRoute: NextApiHandler<LoginApiResponse> = async (req, res) => {
  const email = singleQueryParam(req.query.email);
  const password = singleQueryParam(req.query.password);
  const rememberMe = Boolean(singleQueryParam(req.query.remember_me));

  try {
    const { user, token } = await checkLogin(email, password, rememberMe);
    res.json({ success: true, rememberMe, user, token });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      res.json({ success: false, errorMessage: error.message });
    }
  }
}

export default LoginRoute;