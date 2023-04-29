import { NextApiHandler } from "next";
import { UserPublic } from "@rhodesjason/loxdb/dist/common/types/db";
import { getUserRepository, UserRepoError } from "@rhodesjason/loxdb/dist/db/repositories/UserRepo";
import { handleGenericError } from "@rhodesjason/loxdb/dist/lib/apiErrorHandler";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { syncAllEntriesForUser } from "@rhodesjason/loxdb/dist/lib/syncAllEntriesForUser";

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
  const email = singleQueryParam(req.body.email) || "";
  const password = singleQueryParam(req.body.password) || "";
  const rememberMe = Boolean(singleQueryParam(req.body.rememberMe));
  const UserRepository = await getUserRepository();

  try {
    const { user } = await UserRepository.login(email, password, rememberMe);
    const now = new Date();
    await UserRepository.update({ id: user.id }, { lastLogin: now.toISOString() });

    res.json({ success: true, user });

    try {
      // after responding to the request, kick off a ratings sync for this user
      syncAllEntriesForUser({ userId: user.id, username: user.username, order: "ASC" });
    } catch (e) {
      // ignore this error
      console.log(`Error while trying to do post-login entries sync for user ${user.username}`)
    }
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