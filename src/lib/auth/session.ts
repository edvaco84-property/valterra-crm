import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "valterra_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
  v: 1;
};

function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (secret && !["change-me", "replace-with-a-long-random-secret"].includes(secret)) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "valterra-local-dev-secret";
  }

  throw new Error("SESSION_SECRET o NEXTAUTH_SECRET debe configurarse con un valor seguro en producción.");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(rawPayload: string) {
  try {
    return JSON.parse(Buffer.from(rawPayload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

function verifySignature(rawPayload: string, rawSignature: string) {
  const expected = signPayload(rawPayload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(rawSignature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createSessionToken(userId: string, maxAge = SESSION_MAX_AGE_SECONDS) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + maxAge,
    v: 1,
  };
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function getSessionPayloadFromToken(token?: string) {
  if (!token) return null;

  const [rawPayload, rawSignature] = token.split(".");

  if (!rawPayload || !rawSignature || !verifySignature(rawPayload, rawSignature)) {
    return null;
  }

  const payload = decodePayload(rawPayload);

  if (!payload || payload.v !== 1 || !payload.sub || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const payload = getSessionPayloadFromToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      market: true,
      active: true,
      updatedAt: true,
    },
  });

  if (!user || !user.active) {
    return null;
  }

  if (toUnixSeconds(user.updatedAt) > payload.iat) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    market: user.market,
    active: user.active,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user || !user.active) {
    redirect("/login");
  }

  return user;
}

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS };
