import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Verify a password against its hash
 *
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
