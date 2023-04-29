import { UserResponse } from "@rhodesjason/loxdb/dist/common/types/db";
import { UserRepoError, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories/UserRepo";
import { handleGenericError } from "@rhodesjason/loxdb/dist/lib/apiErrorHandler";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

interface CheckTokenApiResponseSuccess {
  success: true;
  user: UserResponse;
}

interface CheckTokenApiResponseFailure {
  success: false;
  errorMessage: string;
}

export type CheckTokenApiResponse = CheckTokenApiResponseSuccess | CheckTokenApiResponseFailure;

export interface CheckTokenApiRequest {
  token: string;
}

const CheckTokenRoute = createApiRoute<CheckTokenApiResponse>({
  handlers: {
    post: async (req, res) => {
      const token = singleQueryParam(req.body.token) || '';
      const UserRepository = await getUserRepository();

      try {
        const { user } = await UserRepository.getUserByRememberMeToken(token);
        const now = new Date();
        await UserRepository.update({ id: user.id }, { lastLogin: now.toISOString() });
        res.json({ success: true, user });
      } catch (error: unknown) {
        if (error instanceof UserRepoError) {
          res.statusCode = 200; // return 200 with success: false
          res.json({ success: false, errorMessage: error.message });
        } else {
          handleGenericError(error, res);
        }
      }
    }
  }
});

export default CheckTokenRoute;