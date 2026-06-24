import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    client_name,
    client_email,
    client_phone,
    shipping_address,
    product,
    quantity_sqft,
    boxes_needed,
    retail_price_sqft,
    client_price_sqft,
    discount_pct,
    retail_total,
    client_total,
    commission_amount,
    notes,
  } = body;

  if (!client_name || !shipping_address || !product || !quantity_sqft) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure table exists (ignore errors if it already does, or if DDL isn't supported in this request context)
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      rep_name TEXT,
      rep_email TEXT,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      shipping_address TEXT,
      product TEXT,
      quantity_sqft REAL,
      boxes_needed INTEGER,
      retail_price_sqft REAL,
      client_price_sqft REAL,
      discount_pct REAL,
      retail_total REAL,
      client_total REAL,
      commission_amount REAL,
      notes TEXT,
      status TEXT,
      created_at TEXT,
      commission_paid TEXT
    )`);
  } catch {
    // table likely already exists
  }

  const id = uuidv4();
  const created_at = new Date().toISOString();
  const status = "Pending";

  await db.execute({
    sql: `INSERT INTO orders (
            id, rep_name, rep_email, client_name, client_email, client_phone,
            shipping_address, product, quantity_sqft, boxes_needed,
            retail_price_sqft, client_price_sqft, discount_pct,
            retail_total, client_total, commission_amount,
            notes, status, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id,
      session.repName,
      session.repEmail,
      client_name,
      client_email ?? "",
      client_phone ?? "",
      shipping_address,
      product,
      parseFloat(quantity_sqft),
      boxes_needed ? parseInt(boxes_needed) : null,
      retail_price_sqft ? parseFloat(retail_price_sqft) : null,
      client_price_sqft ? parseFloat(client_price_sqft) : null,
      discount_pct != null ? parseFloat(discount_pct) : null,
      retail_total ? parseFloat(retail_total) : null,
      client_total ? parseFloat(client_total) : null,
      commission_amount ? parseFloat(commission_amount) : null,
      notes ?? "",
      status,
      created_at,
    ],
  });

  return NextResponse.json({
    id,
    product,
    client_name,
    created_at,
    status,
    quantity_sqft: parseFloat(quantity_sqft),
    boxes_needed: boxes_needed ? parseInt(boxes_needed) : null,
    retail_total: retail_total ? parseFloat(retail_total) : null,
    client_total: client_total ? parseFloat(client_total) : null,
    commission_amount: commission_amount ? parseFloat(commission_amount) : null,
    discount_pct: discount_pct != null ? parseFloat(discount_pct) : null,
  });
}
