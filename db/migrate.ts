import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error("TURSO_DATABASE_URL is not set in .env.local");

const client = createClient({ url, authToken });

const NEW_ORDER_COLUMNS = [
  "ALTER TABLE orders ADD COLUMN boxes_needed INTEGER",
  "ALTER TABLE orders ADD COLUMN retail_price_sqft REAL",
  "ALTER TABLE orders ADD COLUMN client_price_sqft REAL",
  "ALTER TABLE orders ADD COLUMN discount_pct REAL",
  "ALTER TABLE orders ADD COLUMN retail_total REAL",
  "ALTER TABLE orders ADD COLUMN client_total REAL",
  "ALTER TABLE orders ADD COLUMN commission_amount REAL",
];

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log("Running:", stmt.slice(0, 60) + "...");
    await client.execute(stmt);
  }

  // Add new columns to existing orders table (safe to re-run; errors ignored)
  for (const alter of NEW_ORDER_COLUMNS) {
    try {
      await client.execute(alter);
      console.log("✓", alter);
    } catch {
      // Column already exists — skip
    }
  }

  // Seed default rep_settings for Dom if not present
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO rep_settings (rep_email, disabled_product_ids, max_discounts, updated_at)
            VALUES (?, '[]', '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}', datetime('now'))`,
      args: ["dominicfoucault7@gmail.com"],
    });
    console.log("✓ Seeded rep_settings for Dom");
  } catch (e) {
    console.log("rep_settings seed skipped:", e);
  }

  console.log("✅ Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
