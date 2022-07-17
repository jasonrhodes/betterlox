import { NextApiHandler } from "next";
import { TypeORMError } from "typeorm";
import { UserPublic } from "../../../common/types/db";
import { getUserRepository } from "../../../db/repositories/UserRepo";
import { handleGenericError } from "../../../lib/apiErrorHandler";
import { singleQueryParam } from "../../../lib/queryParams";

interface RegisterApiResponseSuccess {
  success: true;
  created: UserPublic;
}

interface RegisterApiResponseFailure {
  success: false;
  errorMessage: string;
}

type RegisterApiResponse = RegisterApiResponseSuccess | RegisterApiResponseFailure;

const RegisterRoute: NextApiHandler<RegisterApiResponse> = async (req, res) => {
  const userOptions: Record<string, string | boolean> = {};
  userOptions.email = singleQueryParam(req.body.email);
  userOptions.password = singleQueryParam(req.body.password);
  userOptions.avatarUrl = singleQueryParam(req.body.avatarUrl);
  userOptions.username = singleQueryParam(req.body.username);
  userOptions.name = singleQueryParam(req.body.name);
  userOptions.letterboxdAccountLevel = singleQueryParam(req.body.letterboxdAccountLevel) || 'basic';
  userOptions.rememberMe = Boolean(singleQueryParam(req.body.rememberMe));

  const missingRequiredKeys = [];

  for (let key of ['email', 'password', 'avatarUrl', 'username', 'name', 'letterboxdAccountLevel']) {
    if (!userOptions[key]) {
      missingRequiredKeys.push(key);
    }
  }

  if (missingRequiredKeys.length > 0) {
    res.status(400).json({ success: false, errorMessage: `Missing required properties ${missingRequiredKeys.join(', ')}`});
    return;
  }

  const UserRepository = await getUserRepository();
  
  // validate lb account level? use enum column type in entity ...

  try {
    const user = UserRepository.create(userOptions);
    await UserRepository.save(user);
    res.json({ success: true, created: user });
  } catch (error: unknown) {
    // TODO: Need to inspect error that comes back if email already exists
    if (error instanceof TypeORMError) {
      res.statusCode = 400;
      res.json({ success: false, errorMessage: error.message });
    } else {
      handleGenericError(error, res);
    }
  }
}

export default RegisterRoute;