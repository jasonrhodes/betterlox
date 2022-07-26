import { getResetToken } from "../../lib/hashPassword";
import { ResetToken, User } from "../entities";
import { getDataSource } from "../orm";

export const getResetTokensRepository = async () => (await getDataSource()).getRepository(ResetToken).extend({
  async clearExpired() {
    // do this later
  },

  async generateForUser(user: User) {
    const token = getResetToken();
    console.log('have token, creating now');
    const created = this.create({ token, user });
    console.log('created, about to save');
    return this.save(created);
  }
});