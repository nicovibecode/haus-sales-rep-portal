import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/session";

async function isAdmin(req: NextRequest) {
  const pwd = req.headers.get("x-admin-password");
  if (pwd === process.env.ADMIN_PASSWORD) return true;
  const session = await getSessionFromRequest(req);
  return session?.tier === "admin";
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const result = await db.execute({
    sql: "SELECT * FROM rep_settings WHERE rep_email = ?",
    args: [email],
  });

  const row = result.rows[0];
  if (!row) {
    // Return defaults if no row yet
    return NextResponse.json({
      rep_email: email,
      disabled_product_ids: [],
      max_discounts: { "Marble Mosaics": 30, Travertine: 30, Ceramics: 15 },
    });
  }

  return NextResponse.json({
    rep_email: row.rep_email,
    disabled_product_ids: JSON.parse(row.disabled_product_ids as string),
    max_discounts: JSON.parse(row.max_discounts as string),
  });
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rep_email, disabled_product_ids, max_discounts } = await req.json();

  await db.execute({
    sql: `INSERT INTO rep_settings (rep_email, disabled_product_ids, max_discounts, updated_at)
          VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT(rep_email) DO UPDATE SET
            disabled_product_ids = excluded.disabled_product_ids,
            max_discounts = excluded.max_discounts,
            updated_at = excluded.updated_at`,
    args: [
      rep_email,
      JSON.stringify(disabled_product_ids),
      JSON.stringify(max_discounts),
    ],
  });

  return NextResponse.json({ ok: true });
}
