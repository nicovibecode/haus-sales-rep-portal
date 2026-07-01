import { getSession, getRealSession, VIEW_AS_COOKIE } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import repsSeed from "@/seeds/reps.json";
import Sidebar from "@/components/Sidebar";
import ViewAsBanner from "@/components/ViewAsBanner";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const realSession = await getRealSession();
  const viewAsEmail = cookies().get(VIEW_AS_COOKIE)?.value ?? null;
  const isViewingAs = realSession?.tier === "admin" && !!viewAsEmail;

  // Build rep list for admin switcher
  let repList: { name: string; email: string }[] = [];
  if (realSession?.tier === "admin") {
    const seedReps = repsSeed
      .filter((r) => r.tier !== "admin")
      .map((r) => ({ name: r.name, email: r.email }));
    const seedEmails = new Set(seedReps.map((r) => r.email));
    let portalReps: { name: string; email: string }[] = [];
    try {
      const result = await db.execute("SELECT name, email FROM portal_users WHERE role = 'rep'");
      portalReps = result.rows
        .filter((r) => !seedEmails.has(r.email as string))
        .map((r) => ({ name: r.name as string, email: r.email as string }));
    } catch { /* table may not exist yet */ }
    repList = [...seedReps, ...portalReps];
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar session={session} repList={repList} currentViewAs={viewAsEmail} />
      <main className="flex-1 ml-64 min-h-screen">
        {isViewingAs && <ViewAsBanner repName={session.repName} repEmail={viewAsEmail!} />}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
