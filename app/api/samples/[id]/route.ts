import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.execute({
    sql: "SELECT rep_email FROM samples WHERE id = ?",
    args: [params.id],
  });
  const sample = result.rows[0];
  if (!sample) {
    return NextResponse.json({ error: "Sample request not found" }, { status: 404 });
  }

  const isOwner = sample.rep_email === session.repEmail;
  const isAdmin = session.tier === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.execute({
    sql: "DELETE FROM samples WHERE id = ?",
    args: [params.id],
  });

  return NextResponse.json({ ok: true });
}
