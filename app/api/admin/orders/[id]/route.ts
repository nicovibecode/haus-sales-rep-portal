import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  if ("status" in body) {
    const valid = ["Pending", "Confirmed", "Fulfilled"];
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.execute({
      sql: "UPDATE orders SET status = ? WHERE id = ?",
      args: [body.status, params.id],
    });
  }

  if ("commission_paid" in body) {
    // Ensure column exists
    try {
      await db.execute("ALTER TABLE orders ADD COLUMN commission_paid TEXT");
    } catch {
      // already exists
    }
    await db.execute({
      sql: "UPDATE orders SET commission_paid = ? WHERE id = ?",
      args: [body.commission_paid, params.id],
    });
  }

  return NextResponse.json({ ok: true });
}
