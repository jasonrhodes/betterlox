import { NextApiHandler } from "next";
import { create, User, UserLetterboxdDetails } from "../../../lib/models/users";
import { singleQueryParam } from "../../../lib/queryParams";
import ResponseError from "../../../lib/ResponseError";

interface RegisterApiResponseSuccess {
  success: true;
  rememberMe: boolean;
  created: Omit<User, "password" | "salt">;
  token?: string;
}

interface RegisterApiResponseFailure {
  success: false;
  errorMessage: string;
}

type RegisterApiResponse = RegisterApiResponseSuccess | RegisterApiResponseFailure;

const RegisterRoute: NextApiHandler<RegisterApiResponse> = async (req, res) => {
  const opts: Record<string, string | boolean> = {};
  opts.email = singleQueryParam(req.body.email);
  opts.password = singleQueryParam(req.body.password);
  opts.avatarUrl = singleQueryParam(req.body.avatarUrl);
  opts.letterboxdUsername = singleQueryParam(req.body.letterboxdUsername);
  opts.letterboxdName = singleQueryParam(req.body.letterboxdName);
  opts.letterboxdAccountLevel = singleQueryParam(req.body.letterboxdAccountLevel);
  opts.rememberMe = Boolean(singleQueryParam(req.body.rememberMe));

  const missingRequiredKeys = [];

  for (let key of ['email', 'password', 'avatarUrl', 'letterboxdUsername', 'letterboxdName', 'letterboxdAccountLevel']) {
    if (!opts[key]) {
      missingRequiredKeys.push(key);
    }
  }

  if (missingRequiredKeys.length > 0) {
    res.status(400).json({ success: false, errorMessage: `Missing required properties ${missingRequiredKeys.join(', ')}`});
    return;
  }

  const letterboxd: UserLetterboxdDetails = {
    username: opts.letterboxdUsername,
    name: opts.letterboxdName,
    accountLevel: opts.letterboxdAccountLevel === 'pro'
      ? 'pro'
      : opts.letterboxdAccountLevel === 'patron'
        ? 'patron'
        : 'basic'
  }

  console.log('create request received');

  try {
    const { created, token } = await create({
      email: opts.email,
      password: opts.password,
      letterboxd,
      avatarUrl: opts.avatarUrl
    });
    res.json({ success: true, rememberMe: opts.rememberMe, created, token });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      res.status(error.statusCode).json({ success: false, errorMessage: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ success: false, errorMessage: error.message })
    } else {
      console.log('Unknown error that is not an instance of Error?', error);
      res.status(500).json({ success: false, errorMessage: 'Unknown error occurred' })
    }
  }
}

export default RegisterRoute;