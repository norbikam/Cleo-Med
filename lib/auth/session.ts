import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions, clients } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "gm_session";
const TTL_DAYS = 30;

export interface SessionPayload {
  clientId: string;
  role: string;
  tokenHash: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(clientId: string, role: string): Promise<string> {
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  const rawToken = crypto.randomUUID();
  const tokenHash = hashToken(rawToken);

  await db.insert(sessions).values({ clientId, tokenHash, expiresAt });

  const jwt = await new SignJWT({ clientId, role, tokenHash })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${TTL_DAYS}d`)
    .sign(secret);

  return jwt;
}

export async function setSessionCookie(jwt: string) {
  (await cookies()).set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(COOKIE_NAME)?.value;
  if (!jwt) return null;

  try {
    const { payload } = await jwtVerify(jwt, secret);
    const { clientId, role, tokenHash } = payload as unknown as SessionPayload;

    const now = new Date();
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          eq(sessions.clientId, clientId),
          gt(sessions.expiresAt, now)
        )
      )
      .limit(1);

    if (!session) return null;

    const [client] = await db
      .select({ active: clients.active })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client?.active) return null;

    return { clientId, role, tokenHash };
  } catch {
    return null;
  }
}

export async function refreshSession(tokenHash: string) {
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  await db
    .update(sessions)
    .set({ expiresAt })
    .where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSession(tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
