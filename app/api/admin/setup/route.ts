import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const pwd = req.headers.get("x-admin-password");
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.execute(`CREATE TABLE IF NOT EXISTS rep_settings (
    rep_email TEXT PRIMARY KEY,
    disabled_product_ids TEXT NOT NULL DEFAULT '[]',
    max_discounts TEXT NOT NULL DEFAULT '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}',
    updated_at TEXT
  )`);

  await db.execute({
    sql: `INSERT OR IGNORE INTO rep_settings (rep_email, disabled_product_ids, max_discounts, updated_at)
          VALUES (?, '[]', '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}', datetime('now'))`,
    args: ["dominicfoucault7@gmail.com"],
  });

  return NextResponse.json({ ok: true });
}
