"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SessionPayload } from "@/lib/session";

const navItems = [
  {
    label: "Price List",
    href: "/portal/price-list",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="12" height="12" rx="1.5" />
        <line x1="5" y1="5.5" x2="11" y2="5.5" />
        <line x1="5" y1="8" x2="11" y2="8" />
        <line x1="5" y1="10.5" x2="8.5" y2="10.5" />
      </svg>
    ),
  },
  {
    label: "FAQ",
    href: "/portal/faq",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8c0 1.16.3 2.25.82 3.2L1.5 14.5l3.3-.82A6.5 6.5 0 1 0 8 1.5z" />
        <path d="M6.5 6.2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.3" />
        <circle cx="8" cy="10.5" r=".6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Calculator",
    href: "/portal/calculator",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
        <rect x="4.5" y="3.5" width="7" height="2.5" rx=".5" />
        <circle cx="5" cy="9" r=".75" fill="currentColor" stroke="none" />
        <circle cx="8" cy="9" r=".75" fill="currentColor" stroke="none" />
        <circle cx="11" cy="9" r=".75" fill="currentColor" stroke="none" />
        <circle cx="5" cy="11.5" r=".75" fill="currentColor" stroke="none" />
        <circle cx="8" cy="11.5" r=".75" fill="currentColor" stroke="none" />
        <circle cx="11" cy="11.5" r=".75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/portal/inventory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 5.5L8 2l6 3.5V11l-6 3.5L2 11V5.5z" />
        <path d="M8 2v13" />
        <path d="M2 5.5l6 3.5 6-3.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/portal/orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2h1.5l2 7h7l1.5-5H5" />
        <circle cx="6.5" cy="12.5" r="1" />
        <circle cx="11.5" cy="12.5" r="1" />
      </svg>
    ),
  },
  {
    label: "Samples",
    href: "/portal/samples",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5.5" height="5.5" rx=".75" />
        <rect x="8.5" y="2" width="5.5" height="5.5" rx=".75" />
        <rect x="2" y="8.5" width="5.5" height="5.5" rx=".75" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx=".75" />
      </svg>
    ),
  },
];

const tierColors: Record<string, string> = {
  A: "bg-amber-100 text-amber-800",
  B: "bg-sky-100 text-sky-800",
  C: "bg-stone-100 text-stone-700",
};

const adminIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l5.5 2.5v3.5c0 4-2.5 6-5.5 7-3-1-5.5-3-5.5-7V4l5.5-2.5z" />
  </svg>
);

export default function Sidebar({
  session,
  repList = [],
  currentViewAs,
}: {
  session: SessionPayload;
  repList?: { name: string; email: string }[];
  currentViewAs?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleViewAs(email: string) {
    if (!email) return;
    setSwitchingTo(email);
    await fetch("/api/admin/view-as", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    router.push("/portal/price-list");
    router.refresh();
    setSwitchingTo(null);
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-stone-200 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stone-800 rounded-sm flex-shrink-0" />
          <span className="font-semibold text-stone-800 tracking-tight text-lg">BSD Haus</span>
        </div>
        <p className="text-xs text-stone-400 mt-0.5 ml-9">Rep Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-stone-800 text-white"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
            >
              <span className="flex-shrink-0 opacity-80">{icon}</span>
              {label}
            </Link>
          );
        })}

        {repList.length > 0 && (
          <>
            <div className="my-3 border-t border-stone-200" />
            <div className="px-3 py-1">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">View as Rep</p>
              <select
                value={currentViewAs ?? ""}
                onChange={(e) => handleViewAs(e.target.value)}
                disabled={!!switchingTo}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white disabled:opacity-50"
              >
                <option value="">— Select a rep —</option>
                {repList.map((r) => (
                  <option key={r.email} value={r.email}>{r.name}</option>
                ))}
              </select>
            </div>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-stone-800 text-white"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
            >
              <span className="flex-shrink-0 opacity-80">{adminIcon}</span>
              Admin Dashboard
            </Link>
          </>
        )}
      </nav>

      {/* Rep info + logout */}
      <div className="px-4 py-4 border-t border-stone-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-600">
            {session.repName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{session.repName}</p>
            <p className="text-xs text-stone-400 truncate">{session.repEmail}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${tierColors[session.tier] ?? "bg-stone-100 text-stone-700"}`}>
            {session.tier}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-stone-500 hover:text-stone-800 transition-colors py-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
