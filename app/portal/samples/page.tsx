import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import SamplesClient from "./SamplesClient";
import productsData from "@/data/products.json";

export default async function SamplesPage() {
  const session = await getSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let samples: any[] = [];
  try {
    const result = await db.execute({
      sql: "SELECT * FROM samples WHERE rep_email = ? ORDER BY created_at DESC",
      args: [session?.repEmail ?? ""],
    });
    samples = result.rows as unknown as any[];
  } catch {
    // DB not yet configured
  }

  const products = productsData.map((p) => ({ id: p.id, name: p.name }));

  return (
    <SamplesClient
      session={session!}
      initialSamples={samples}
      products={products}
    />
  );
}
