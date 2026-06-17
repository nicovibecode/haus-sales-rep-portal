import { db } from "@/lib/db";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  let orders: Record<string, unknown>[] = [];
  try {
    const result = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    orders = result.rows as unknown as Record<string, unknown>[];
  } catch {
    // DB not yet configured
  }

  return <AdminOrdersClient initialOrders={orders} />;
}
