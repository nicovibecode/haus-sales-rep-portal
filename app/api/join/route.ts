import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/session";

const ROLE_TO_TIER: Record<string, string> = {
  "rep-a": "A",
  "rep-b": "B",
  "rep-c": "C",
  "admin": "admin",
};

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json();

  if (!token || !name || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Look up invite
  const inviteResult = await db.execute({
    sql: "SELECT * FROM invites WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')",
    args: [token],
  });

  const invite = inviteResult.rows[0];
  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 400 });
  }

  // Ensure users table exists
  await db.execute(`CREATE TABLE IF NOT EXISTS portal_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);

  const id = crypto.randomUUID();

  try {
    await db.execute({
      sql: `INSERT INTO portal_users (id, name, email, password, role, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [id, name, invite.email as string, password, invite.role as string],
    });
  } catch {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
  }

  // Mark invite as used
  await db.execute({
    sql: "UPDATE invites SET used_at = datetime('now') WHERE token = ?",
    args: [token],
  });

  const tier = ROLE_TO_TIER[invite.role as string] ?? "C";

  const sessionToken = await createSession({
    repId: id,
    repName: name,
    repEmail: invite.email as string,
    tier,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
