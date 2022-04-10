import crypto from "crypto";
import { LetterboxdAccountLevel } from "../../common/types/base";
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
  return stmt.get(email) as User | undefined;
}

export async function update(id: number, user: Partial<User>) {
  const fields = Object.keys(user).map(field => `${field} = ?`);
  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  return stmt.run(...Object.values(user), id);
}

export async function checkLogin(email: string, password: string, rememberMe?: boolean) {
  const user = await getByEmail(email);
  if (!user) {
    throw new ResponseError(401, "Invalid username or password");
  }
  const valid = hash(password, user.salt) === user.password;
  if (!valid) {
    throw new ResponseError(401, "Invalid username or password");
  }

  if (rememberMe) {
    // create remember me token, store in db, send it back
    const token = await updateRememberMeToken(user.id);
    return { user, token, rememberMe };
  }

  return { user, rememberMe };
}

export async function updateRememberMeToken(id: number) {
  const token = crypto.randomBytes(24).toString("hex");
  await update(id, { rememberMeToken: token });
  return token;
}