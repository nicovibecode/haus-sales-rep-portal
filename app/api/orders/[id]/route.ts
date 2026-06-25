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
    sql: "SELECT rep_email FROM orders WHERE id = ?",
    args: [params.id],
  });
  const order = result.rows[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.rep_email === session.repEmail;
  const isAdmin = session.tier === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.execute({
    sql: "DELETE FROM orders WHERE id = ?",
    args: [params.id],
  });

  return NextResponse.json({ ok: true });
}
