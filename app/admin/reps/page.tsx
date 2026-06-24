import { db } from "@/lib/db";
import productsData from "@/data/products.json";
import AdminRepsClient from "./AdminRepsClient";

const REPS = [
  { name: "Dominic Foucault", email: "dominicfoucault7@gmail.com", tier: "A" },
];

const CATEGORIES = ["Marble Mosaics", "Travertine", "Ceramics"];

const products = productsData
  .filter((p) => CATEGORIES.includes(p.category))
  .map((p) => ({ id: p.id, name: p.name, category: p.category, sku: p.sku }));

async function getRepSettings(email: string) {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM rep_settings WHERE rep_email = ?",
      args: [email],
    });
    const row = result.rows[0];
    if (!row) return {
      disabled_product_ids: [] as string[],
      max_discounts: { "Marble Mosaics": 30, Travertine: 30, Ceramics: 15 } as Record<string, number>,
    };
    return {
      disabled_product_ids: JSON.parse(row.disabled_product_ids as string) as string[],
      max_discounts: JSON.parse(row.max_discounts as string) as Record<string, number>,
    };
  } catch {
    return {
      disabled_product_ids: [] as string[],
      max_discounts: { "Marble Mosaics": 30, Travertine: 30, Ceramics: 15 } as Record<string, number>,
    };
  }
}

export default async function AdminRepsPage() {
  // Ensure table exists on first load
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS rep_settings (
      rep_email TEXT PRIMARY KEY,
      disabled_product_ids TEXT NOT NULL DEFAULT '[]',
      max_discounts TEXT NOT NULL DEFAULT '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}',
      updated_at TEXT
    )`);
  } catch { /* already exists */ }

  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO rep_settings (rep_email, disabled_product_ids, max_discounts, updated_at)
            VALUES (?, '[]', '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}', datetime('now'))`,
      args: ["dominicfoucault7@gmail.com"],
    });
  } catch { /* already exists */ }

  const settings = await Promise.all(
    REPS.map(async (rep) => ({
      ...rep,
      settings: await getRepSettings(rep.email),
    }))
  );

  return <AdminRepsClient reps={settings} products={products} />;
}
