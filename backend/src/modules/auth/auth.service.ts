import { prisma } from '../../config/prisma.js';
import { DEFAULT_CATEGORIES } from '../../config/constants.js';
import { AppError } from '../../utils/AppError.js';
import { signToken } from '../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string };
}

/**
 * Creates a user, seeds their default categories in the same transaction, and
 * returns a signed JWT.
 */
export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      categories: {
        create: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
      },
    },
    select: { id: true, name: true, email: true },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user };
};

/** Verifies credentials and returns a signed JWT. */
export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same generic error whether the email or the password is wrong, so we don't
  // leak which accounts exist.
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/** Returns the current user's public profile. */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
};
