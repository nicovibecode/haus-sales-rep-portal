import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import OrdersClient from "./OrdersClient";
import productsData from "@/data/products.json";

export default async function OrdersPage() {
  const session = await getSession();

  let orders: Record<string, unknown>[] = [];
  try {
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE rep_email = ? ORDER BY created_at DESC",
      args: [session?.repEmail ?? ""],
    });
    orders = result.rows as unknown as Record<string, unknown>[];
  } catch {
    // DB not yet configured – show empty state
  }

  const products = productsData.map((p) => ({
    id: p.id,
    name: p.name,
    box_weight_lbs: (p as { box_weight_lbs?: number }).box_weight_lbs ?? 40,
  }));

  return (
    <OrdersClient
      session={session!}
      initialOrders={orders}
      products={products}
    />
  );
}
