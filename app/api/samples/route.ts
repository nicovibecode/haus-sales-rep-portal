import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { client_name, client_email, shipping_address, products, notes } = body;

  if (!client_name || !shipping_address || !products?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure table exists (ignore errors if it already does)
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS samples (
      id TEXT PRIMARY KEY,
      rep_name TEXT,
      rep_email TEXT,
      client_name TEXT,
      client_email TEXT,
      shipping_address TEXT,
      products TEXT,
      notes TEXT,
      status TEXT,
      created_at TEXT
    )`);
  } catch {
    // table likely already exists
  }

  const id = uuidv4();
  const created_at = new Date().toISOString();
  const status = "Requested";
  const productsStr = Array.isArray(products) ? products.join(", ") : products;

  await db.execute({
    sql: `INSERT INTO samples (id, rep_name, rep_email, client_name, client_email, shipping_address, products, notes, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      session.repName,
      session.repEmail,
      client_name,
      client_email ?? "",
      shipping_address,
      productsStr,
      notes ?? "",
      status,
      created_at,
    ],
  });

  return NextResponse.json({ id, products: productsStr, client_name, created_at, status });
}
