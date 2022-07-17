import { User } from "../entities/User";
import { getDataSource } from "../orm";
import { getRememberMeToken, hash } from "../../lib/hashPassword";
import { LetterboxdAccountLevel } from "../../common/types/base";

export interface UserLetterboxdDetails {
  username: string;
  name: string;
  accountLevel: LetterboxdAccountLevel
};

export interface UserCreateOptions {
  email: string;
  password: string;
  avatarUrl: string;
  letterboxd: UserLetterboxdDetails;
  rememberMe?: boolean;
}

export class UserRepoError extends Error {};
export class LoginError extends UserRepoError {};
export class RegistrationError extends UserRepoError {};

function removeCredentials(user: User) {
  const { password, salt, ...userPublic } = user;
  return userPublic;
}

export const getUserRepository = async () => (await getDataSource()).getRepository(User).extend({
  // formerly checkLogin
  async login(email: string, password: string, rememberMe?: boolean) {
    const user = await this.findOne({
      where: { email }
    });

    if (user === null) {
      throw new LoginError(`User ${email} not found`);
    }

    const hashed = hash(password, user.salt);
    const valid = hashed === user.password;
    if (!valid) {
      throw new LoginError('Invalid password');
    }

    if (rememberMe) {
      // create remember me token, store in db, send it back
      user.rememberMeToken = getRememberMeToken();
      await this.save(user);
    }

    return { user: removeCredentials(user) };
  },

  async clearRememberMeToken(id: number) {
    return this.update(id, { rememberMeToken: undefined });
  },
  
  // formerly checkToken
  async getUserByRememberMeToken(token: string) {
    const user = await this.findOne({ where: { rememberMeToken: token }});
  
    if (!user) {
      throw new UserRepoError('User not found');
    }
    
    return { user: removeCredentials(user) };
  }
})