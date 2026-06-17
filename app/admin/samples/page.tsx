import { db } from "@/lib/db";
import AdminSamplesClient from "./AdminSamplesClient";

export default async function AdminSamplesPage() {
  let samples: Record<string, unknown>[] = [];
  try {
    const result = await db.execute(
      "SELECT * FROM samples ORDER BY created_at DESC"
    );
    samples = result.rows as unknown as Record<string, unknown>[];
  } catch {
    // DB not yet configured
  }

  return <AdminSamplesClient initialSamples={samples} />;
}
