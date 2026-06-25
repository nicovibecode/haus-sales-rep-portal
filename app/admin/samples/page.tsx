import { db } from "@/lib/db";
import AdminSamplesClient from "./AdminSamplesClient";

export const dynamic = "force-dynamic";

export default async function AdminSamplesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let samples: any[] = [];
  try {
    const result = await db.execute(
      "SELECT * FROM samples ORDER BY created_at DESC"
    );
    samples = result.rows as unknown as any[];
  } catch {
    // DB not yet configured
  }

  return <AdminSamplesClient initialSamples={samples} />;
}
