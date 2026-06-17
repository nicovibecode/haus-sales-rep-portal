import { db } from "@/lib/db";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  try {
    const result = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    orders = result.rows as unknown as any[];
  } catch {
    // DB not yet configured
  }

  return <AdminOrdersClient initialOrders={orders} />;
}
