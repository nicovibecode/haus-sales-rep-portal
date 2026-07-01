import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import repsSeed from "@/seeds/reps.json";

const COOKIE_NAME = "bsdhaus_session";
export const VIEW_AS_COOKIE = "bsdhaus_view_as";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  repId: string;
  repName: string;
  repEmail: string;
  tier: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

async function lookupRepSession(email: string): Promise<SessionPayload | null> {
  const seedRep = repsSeed.find((r) => r.email === email && r.tier !== "admin");
  if (seedRep) {
    return { repId: seedRep.id, repName: seedRep.name, repEmail: seedRep.email, tier: seedRep.tier };
  }
  try {
    const { db } = await import("./db");
    const result = await db.execute({ sql: "SELECT id, name, email FROM portal_users WHERE email = ? AND role = 'rep'", args: [email] });
    const row = result.rows[0];
    if (row) return { repId: row.id as string, repName: row.name as string, repEmail: row.email as string, tier: "A" };
  } catch { /* db unavailable */ }
  return null;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const realSession = await verifySession(token);
  if (realSession?.tier === "admin") {
    const viewAs = cookieStore.get(VIEW_AS_COOKIE)?.value;
    if (viewAs) {
      const repSession = await lookupRepSession(viewAs);
      if (repSession) return repSession;
    }
  }
  return realSession;
}

export async function getRealSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { COOKIE_NAME };
