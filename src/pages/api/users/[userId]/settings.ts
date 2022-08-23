import { ApiErrorResponse, UpdateUserSettingsResponse } from "../../../../common/types/api";
import { getUserSettingsRepository } from "../../../../db/repositories";
import { numericQueryParam, singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const UserSettingsRoute = createApiRoute<UpdateUserSettingsResponse | ApiErrorResponse>({
  handlers: {
    patch: async (req, res) => {
      const { settings } = req.body;

      if (!settings) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: "No settings provided"
        });
      }

      const UserSettingsRepo = await getUserSettingsRepository();
      const userId = numericQueryParam(req.query.userId)!;
      const updated = await UserSettingsRepo.preload({ ...settings, userId });

      if (updated) {
        await UserSettingsRepo.save(updated);
      }

      res.json({ success: true, settings: updated });    
    },
  }
});

export default UserSettingsRoute;