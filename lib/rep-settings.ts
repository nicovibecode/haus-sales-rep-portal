import { db } from "@/lib/db";

export interface RepSettings {
  disabled_product_ids: string[];
  max_discounts: Record<string, number>;
}

const DEFAULTS: RepSettings = {
  disabled_product_ids: [],
  max_discounts: { "Marble Mosaics": 30, Travertine: 30, Ceramics: 15 },
};

export async function getRepSettings(email: string): Promise<RepSettings> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM rep_settings WHERE rep_email = ?",
      args: [email],
    });
    const row = result.rows[0];
    if (!row) return DEFAULTS;
    return {
      disabled_product_ids: JSON.parse(row.disabled_product_ids as string),
      max_discounts: JSON.parse(row.max_discounts as string),
    };
  } catch {
    return DEFAULTS;
  }
}
