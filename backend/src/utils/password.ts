import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hashes a plain-text password with bcrypt. */
export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

/** Verifies a plain-text password against a stored bcrypt hash. */
export const verifyPassword = (
  plain: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(plain, hash);
