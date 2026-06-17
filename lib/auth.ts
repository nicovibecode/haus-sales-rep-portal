import repsData from "@/seeds/reps.json";
import { db } from "@/lib/db";

interface Rep {
  id: string;
  name: string;
  email: string;
  plain_password: string;
  tier: string;
  region: string;
  phone: string;
  status: string;
}

const ROLE_TO_TIER: Record<string, string> = {
  "rep-a": "A",
  "rep-b": "B",
  "rep-c": "C",
  "admin": "admin",
};

const reps = repsData as Rep[];

export function authenticateRep(email: string, password: string): Rep | null {
  const rep = reps.find(
    (r) =>
      r.email.toLowerCase() === email.toLowerCase() &&
      r.plain_password === password &&
      r.status === "Active"
  );
  return rep ?? null;
}

export async function authenticateUser(email: string, password: string) {
  // Check static reps first
  const rep = authenticateRep(email, password);
  if (rep) return { id: rep.id, name: rep.name, email: rep.email, tier: rep.tier };

  // Check DB users (created via invite)
  try {
    const result = await db.execute({
      sql: "SELECT * FROM portal_users WHERE email = ? AND password = ?",
      args: [email.toLowerCase(), password],
    });
    const user = result.rows[0];
    if (user) {
      const tier = ROLE_TO_TIER[user.role as string] ?? "C";
      return { id: user.id as string, name: user.name as string, email: user.email as string, tier };
    }
  } catch {
    // table doesn't exist yet, fall through
  }

  return null;
}
