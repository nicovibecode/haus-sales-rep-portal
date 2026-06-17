import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status } = await req.json();
  const valid = ["Requested", "Sent", "Delivered"];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.execute({
    sql: "UPDATE samples SET status = ? WHERE id = ?",
    args: [status, params.id],
  });

  return NextResponse.json({ ok: true });
}
