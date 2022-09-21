import { NextApiHandler } from "next";
import { TypeORMError } from "typeorm";
import { DEFAULT_USER_SETTINGS } from "../../../common/constants";
import { UserPublic } from "../../../common/types/db";
import { User } from "../../../db/entities";
import { getUserRepository } from "../../../db/repositories/UserRepo";
import { handleGenericError } from "../../../lib/apiErrorHandler";
import { singleQueryParam } from "../../../lib/queryParams";
import { syncAllEntriesForUser } from "../../../lib/syncAllEntriesForUser";

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
  const userOptions: Partial<User> = {};
  userOptions.email = (singleQueryParam(req.body.email) || '').toLowerCase(); // lowercase ALL emails
  userOptions.password = singleQueryParam(req.body.password);
  userOptions.avatarUrl = singleQueryParam(req.body.avatarUrl);
  userOptions.username = singleQueryParam(req.body.username);
  userOptions.name = singleQueryParam(req.body.name);
  userOptions.letterboxdAccountLevel = singleQueryParam(req.body.letterboxdAccountLevel) || 'basic';
  userOptions.rememberMe = Boolean(singleQueryParam(req.body.rememberMe));

  const requiredKeys: Array<keyof User> = ['email', 'password', 'avatarUrl', 'username', 'name', 'letterboxdAccountLevel'];
  const missingRequiredKeys: Array<keyof User> = [];

  console.log(`Registering user ${userOptions.username}`);

  for (let key of requiredKeys) {
    if (!userOptions[key]) {
      missingRequiredKeys.push(key);
    }
  }

  if (missingRequiredKeys.length > 0) {
    res.status(400).json({ success: false, errorMessage: `Missing required properties ${missingRequiredKeys.join(', ')}`});
    return;
  }

  console.log('Registration required keys are all present');

  const UserRepository = await getUserRepository();

  console.log('Registration user repository loaded');
  
  // TODO: validate lb account level? use enum column type in entity ...

  try {
    const user = UserRepository.create(userOptions);
    const saved = await UserRepository.save(user);

    console.log('Registration - User saved', user.username);

    user.settings = { ...DEFAULT_USER_SETTINGS, userId: saved.id };
    await UserRepository.save(user);

    console.log('Registration - User settings saved', user.username);
    
    res.json({ success: true, created: user });

    console.log(`Registration for ${userOptions.username} completed successfully, sync will begin now`);

    // after responding to the request, kick off a ratings sync for this user
    syncAllEntriesForUser({ userId: user.id, username: user.username, order: "DESC" });
  } catch (error: unknown) {
    if (error instanceof TypeORMError) {
      if (error.message.startsWith("duplicate key value violates unique constraint")) {
        res.statusCode = 409;
        res.json({ success: false, errorMessage: 'User with this name already exists, please login' });
      } else {
        res.statusCode = 400;
        console.log(`Database error while trying to register account ${JSON.stringify(userOptions)}, received message: ${error.message}`)
        res.json({ success: false, errorMessage: `Error while registering` });
      }
    } else {
      handleGenericError(error, res);
    }
  }
}

export default RegisterRoute;