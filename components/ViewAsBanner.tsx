"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ViewAsBanner({ repName, repEmail }: { repName: string; repEmail: string }) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  async function handleExit() {
    setExiting(true);
    await fetch("/api/admin/view-as", { method: "DELETE" });
    router.push("/admin/orders");
    router.refresh();
  }

  return (
    <div className="bg-amber-400 text-amber-950 px-6 py-2.5 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.5l5.5 2.5v3.5c0 4-2.5 6-5.5 7-3-1-5.5-3-5.5-7V4l5.5-2.5z" />
        </svg>
        Viewing as <span className="font-bold">{repName}</span>
        <span className="opacity-60">({repEmail})</span>
      </div>
      <button
        onClick={handleExit}
        disabled={exiting}
        className="bg-amber-950 text-amber-100 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-amber-900 disabled:opacity-50 transition-colors"
      >
        {exiting ? "Exiting…" : "Exit Rep View"}
      </button>
    </div>
  );
}
