import crypto from "crypto";
import { LetterboxdAccountLevel } from "../../common/types/base";
import { DBUser, UserPublic } from "../../common/types/db";
import { db } from "../db/client";
import ResponseError from "../ResponseError";

function hash(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export interface UserLetterboxdDetails {
  username: string;
  name: string;
  accountLevel: LetterboxdAccountLevel
};

export interface User {
  id: number;
  email: string;
  password: string;
  salt: string;
  letterboxd: UserLetterboxdDetails;
  avatarUrl: string;
  rememberMeToken?: string;
}

export interface UserCreateOptions {
  email: string;
  password: string;
  avatarUrl: string;
  letterboxd: UserLetterboxdDetails;
  rememberMe?: boolean;
}

export async function create({ email, password, letterboxd, avatarUrl, rememberMe }: UserCreateOptions) {
  const salt = crypto.randomBytes(16).toString("hex");

  console.log('Inside create hello', { email, password });

  try {
    const stmt = db.prepare<[string, string, string, string, string, string, string]>(`
      INSERT INTO users (
        email,
        password,
        salt,
        avatarUrl,
        letterboxdUsername,
        letterboxdName,
        letterboxdAccountLevel
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const hashed = hash(password, salt);

    console.log('Password hashed', { password, salt, hashed });
    const { lastInsertRowid } = await stmt.run(
      email,
      hashed,
      salt,
      avatarUrl,
      letterboxd.username,
      letterboxd.name,
      letterboxd.accountLevel
    );
    const id = lastInsertRowid as number;
    const created: Omit<User, "password" | "salt"> = {
      id,
      email,
      avatarUrl,
      letterboxd
    }
    let token;
    if (rememberMe) {
      token = await updateRememberMeToken(id);
    }
    return { created, token };
  } catch (error) {
    console.log('An error occurred here in create flow');

    if (!(error instanceof Error)) {
      console.log('unknown error', error);
      throw new Error(`Unknown object ${error} caught`);
    }
    if (error.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email") {
      throw new ResponseError(400, "This email is already in use");
    }
    if (error.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.letterboxdUsername") {
      throw new ResponseError(400, "This username is already registered");
    }

    console.log('unmatched error', error.message, error);
    throw error;
  }

  console.log('end of create flow that should be unreachable');
}

export async function getByEmail(email: string) {
  const stmt = db.prepare<string>(`
    SELECT * FROM users
    WHERE email = ?
  `);
  return stmt.get(email) as DBUser | undefined;
}

export async function getByRememberToken(token: string) {
  const stmt = db.prepare<string>(`
    SELECT * FROM users
    WHERE rememberMeToken = ?
  `);
  return stmt.get(token) as DBUser | undefined;
}

export async function update(id: number, user: Partial<DBUser>) {
  const fields = Object.keys(user).map(field => `${field} = ?`);
  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  return stmt.run(...Object.values(user), id);
}

export interface LoginResponse {
  user: UserPublic;
  rememberMeToken?: string;
}

function removeCredentials(user: DBUser): UserPublic {
  const {
    id,
    email,
    avatarUrl,
    letterboxdUsername,
    letterboxdName,
    letterboxdAccountLevel,
    rememberMeToken
  } = user;
  return {
    id,
    email,
    avatarUrl,
    letterboxdUsername,
    letterboxdName,
    letterboxdAccountLevel,
    rememberMeToken
  };
}

export async function checkLogin(email: string, password: string, rememberMe?: boolean): Promise<LoginResponse> {
  const user = await getByEmail(email);
  if (!user) {
    console.log('No user found', email);
    throw new ResponseError(401, "Invalid username or password");
  }
  const hashed = hash(password, user.salt);
  const valid = hashed === user.password;
  if (!valid) {
    console.log("Passwords don't match:", hashed, "|", user.password);
    throw new ResponseError(401, "Invalid username or password");
  }

  const userPublic = removeCredentials(user);

  if (rememberMe) {
    // create remember me token, store in db, send it back
    const rememberMeToken = await updateRememberMeToken(user.id);
    userPublic.rememberMeToken = rememberMeToken;
  }

  return { user: userPublic };
}

export async function updateRememberMeToken(id: number) {
  console.log('updating remember me token');
  const token = crypto.randomBytes(24).toString("hex");
  console.log('using token', token);
  await update(id, { rememberMeToken: token });
  return token;
}

export async function clearRememberMeToken(id: number) {
  return update(id, { rememberMeToken: null });
}

export async function checkToken(token: string) {
  const user = await getByRememberToken(token);

  if (!user) {
    throw new ResponseError(404, 'Remember me token not found');
  }
  
  return { user: removeCredentials(user) };
}