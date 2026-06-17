import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import JoinClient from "./JoinClient";

export default async function JoinPage({ params }: { params: { token: string } }) {
  let invite = null;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM invites WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')",
      args: [params.token],
    });
    invite = result.rows[0] ?? null;
  } catch {
    // table doesn't exist yet
  }

  if (!invite) {
    redirect("/login?error=invalid-invite");
  }

  return (
    <JoinClient
      token={params.token}
      email={invite.email as string}
      role={invite.role as string}
      suggestedName={invite.name as string}
    />
  );
}
