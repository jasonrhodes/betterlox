import { UserPublic } from "../common/types/db";

const ADMIN_USER_IDS = [1];

export function isAdmin(user?: UserPublic) {
  return Boolean(user && user.id && ADMIN_USER_IDS.includes(user.id));
}