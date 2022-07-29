import { getResetToken } from "../../lib/hashPassword";
import { ResetToken, User } from "../entities";
import { getDataSource } from "../orm";

export const getResetTokensRepository = async () => (await getDataSource()).getRepository(ResetToken).extend({
  async clearExpired() {
    // do this later
  },

  async generateForUser(user: User) {
    const token = getResetToken();
    const created = this.create({ token, user });
    return this.save(created);
  }
});