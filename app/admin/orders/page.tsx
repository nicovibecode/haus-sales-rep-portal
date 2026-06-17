import { db } from "@/lib/db";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, rep_name TEXT, rep_email TEXT, client_name TEXT,
      client_email TEXT, client_phone TEXT, shipping_address TEXT, product TEXT,
      quantity_sqft REAL, boxes_needed INTEGER, retail_price_sqft REAL,
      client_price_sqft REAL, discount_pct REAL, retail_total REAL,
      client_total REAL, commission_amount REAL, notes TEXT, status TEXT, created_at TEXT
    )`);
    const result = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    orders = result.rows as unknown as any[];
  } catch {
    // DB not yet configured
  }

  return <AdminOrdersClient initialOrders={orders} />;
}
