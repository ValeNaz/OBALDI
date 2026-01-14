import crypto from "crypto";
import { prisma } from "@/src/core/db";

export const SESSION_COOKIE_NAME = "obaldi_session";
const SESSION_TTL_DAYS = 28;

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required to manage sessions.");
  }
  return secret;
};

const hashSessionToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(`${token}.${getSessionSecret()}`)
    .digest("hex");
};

const generateSessionToken = () => crypto.randomBytes(32).toString("hex");

export const createSession = async (userId: string) => {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });

  return { session, token };
};

export const getSessionByToken = async (token: string) => {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const now = new Date();

  return prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: now }
    },
    include: {
      user: {
        include: {
          membership: {
            include: { plan: true }
          }
        }
      }
    }
  });
};

export const deleteSessionByToken = async (token: string) => {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
};
