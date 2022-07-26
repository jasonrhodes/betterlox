import crypto from "crypto";

export function hash(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export function getSalt() {
  return crypto.randomBytes(16).toString("hex");
}

export function getRememberMeToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function getResetToken() {
  return crypto.randomBytes(24).toString("hex");
}