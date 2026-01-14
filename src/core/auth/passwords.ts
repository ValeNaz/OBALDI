import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const hashBuffer = Buffer.from(hash, "hex");
  if (hashBuffer.length !== derived.length) return false;
  return crypto.timingSafeEqual(hashBuffer, derived);
};
