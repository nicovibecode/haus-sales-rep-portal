"use client";
import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock_level: string;
  sqft_available: number;
}

const stockBadge: Record<string, string> = {
  "In Stock": "bg-emerald-100 text-emerald-800",
  "Low Stock": "bg-amber-100 text-amber-800",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function InventoryClient({
  initialInventory,
}: {
  initialInventory: InventoryItem[];
}) {
  const [inventory] = useState(initialInventory);
  const [lastRefreshed] = useState(() => new Date().toLocaleString());

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Inventory</h1>
          <p className="text-xs text-stone-400 mt-1">Last refreshed: {lastRefreshed}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 border border-stone-300 text-stone-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
        For real-time inventory, contact{" "}
        <a href="mailto:infohaus@bsd.group" className="underline font-medium">
          infohaus@bsd.group
        </a>{" "}
        or call the warehouse.
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {["Product", "Category", "Status", "SQFT Available"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium text-stone-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-stone-800">{item.name}</td>
                <td className="px-5 py-3.5 text-stone-500">{item.category}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      stockBadge[item.stock_level] ?? "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {item.stock_level}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-stone-600">
                  {item.sqft_available > 0
                    ? `${item.sqft_available.toLocaleString()} SQFT`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
