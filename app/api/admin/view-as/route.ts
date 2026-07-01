import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, VIEW_AS_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tier !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email } = await req.json();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VIEW_AS_COOKIE, email, { path: "/", httpOnly: true, sameSite: "lax" });
  return res;
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tier !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(VIEW_AS_COOKIE);
  return res;
}
