import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (session?.tier !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role, name } = await req.json();
  if (!email || !role) {
    return NextResponse.json({ error: "Email and role required" }, { status: 400 });
  }

  // Ensure tables exist
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS invites (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT
    )`);
  } catch { /* already exists */ }

  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS portal_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);
  } catch { /* already exists */ }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.execute({
    sql: `INSERT OR REPLACE INTO invites (token, email, role, name, created_at, expires_at)
          VALUES (?, ?, ?, ?, datetime('now'), ?)`,
    args: [token, email, role, name ?? "", expiresAt],
  });

  const baseUrl = req.nextUrl.origin;
  const inviteUrl = `${baseUrl}/join/${token}`;

  // Send email if Resend key is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const roleLabel = role === "admin" ? "Admin" : `Sales Rep (Tier ${role.replace("rep-", "").toUpperCase()})`;
    await resend.emails.send({
      from: "BSD Haus <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to the BSD Haus Sales Rep Portal",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1c1917; margin-bottom: 8px;">You're invited to BSD Haus Portal</h2>
          <p style="color: #57534e; margin-bottom: 24px;">
            You've been invited as a <strong>${roleLabel}</strong>. Click the link below to set up your account.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background: #1c1917; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Accept Invite
          </a>
          <p style="color: #a8a29e; font-size: 13px; margin-top: 24px;">
            This link expires in 7 days. If you didn't expect this invite, you can ignore it.
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, inviteUrl, emailSent: !!resendKey });
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (session?.tier !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS invites (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT
    )`);
  } catch { /* already exists */ }

  try {
    const result = await db.execute(
      "SELECT token, email, role, name, created_at, used_at FROM invites ORDER BY created_at DESC LIMIT 50"
    );
    return NextResponse.json({ invites: result.rows });
  } catch {
    return NextResponse.json({ invites: [] });
  }
}
