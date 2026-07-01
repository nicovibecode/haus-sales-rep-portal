import { db } from "@/lib/db";
import productsData from "@/data/products.json";
import repsSeed from "@/seeds/reps.json";
import AdminRepsClient from "./AdminRepsClient";

export const dynamic = "force-dynamic";

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
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS rep_settings (
      rep_email TEXT PRIMARY KEY,
      disabled_product_ids TEXT NOT NULL DEFAULT '[]',
      max_discounts TEXT NOT NULL DEFAULT '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}',
      updated_at TEXT
    )`);
  } catch { /* already exists */ }

  // Fetch portal_users and invites to build full rep list
  let portalUsers: { name: string; email: string; role: string }[] = [];
  let invites: { email: string; used_at: string | null }[] = [];
  try {
    const [usersResult, invitesResult] = await Promise.all([
      db.execute("SELECT name, email, role FROM portal_users WHERE role = 'rep'"),
      db.execute("SELECT email, used_at FROM invites"),
    ]);
    portalUsers = usersResult.rows.map((r) => ({
      name: r.name as string,
      email: r.email as string,
      role: r.role as string,
    }));
    invites = invitesResult.rows.map((r) => ({
      email: r.email as string,
      used_at: r.used_at as string | null,
    }));
  } catch { /* tables may not exist yet */ }

  const signedUpEmails = new Set(portalUsers.map((u) => u.email));
  const pendingInviteEmails = new Set(
    invites.filter((inv) => !inv.used_at).map((inv) => inv.email)
  );

  // Seeds reps (non-admin) are always active
  const seedReps = repsSeed
    .filter((r) => r.tier !== "admin")
    .map((r) => ({
      name: r.name,
      email: r.email,
      tier: r.tier as string,
      region: r.region,
      phone: r.phone,
      signupStatus: "active" as const,
    }));

  const seedEmails = new Set(seedReps.map((r) => r.email));

  // Portal users not in seeds
  const portalReps = portalUsers
    .filter((u) => !seedEmails.has(u.email))
    .map((u) => ({
      name: u.name || u.email,
      email: u.email,
      tier: "A",
      region: "",
      phone: "",
      signupStatus: "active" as const,
    }));

  // Pending invites not yet signed up
  const pendingReps = invites
    .filter((inv) => !inv.used_at && !seedEmails.has(inv.email) && !signedUpEmails.has(inv.email))
    .map((inv) => ({
      name: inv.email,
      email: inv.email,
      tier: "A",
      region: "",
      phone: "",
      signupStatus: "pending" as const,
    }));

  const allReps = [...seedReps, ...portalReps, ...pendingReps];

  // Ensure rep_settings rows exist for all active reps
  for (const rep of [...seedReps, ...portalReps]) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO rep_settings (rep_email, disabled_product_ids, max_discounts, updated_at)
              VALUES (?, '[]', '{"Marble Mosaics":30,"Travertine":30,"Ceramics":15}', datetime('now'))`,
        args: [rep.email],
      });
    } catch { /* ignore */ }
  }

  const settings = await Promise.all(
    allReps.map(async (rep) => ({
      ...rep,
      settings: await getRepSettings(rep.email),
    }))
  );

  return <AdminRepsClient reps={settings} products={products} />;
}
