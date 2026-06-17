"use client";
import { useState } from "react";
import ProductDetailPanel, { ProductForPanel } from "@/components/ProductDetailPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Product extends ProductForPanel {
  detail?: any;
}

interface Group {
  category: string;
  products: Product[];
}

const stockDot: Record<string, string> = {
  "In Stock": "bg-emerald-400",
  "Low Stock": "bg-amber-400",
  "Out of Stock": "bg-red-400",
};

export default function PriceListClient({
  grouped,
  tier,
}: {
  grouped: Group[];
  tier: string;
}) {
  const [selected, setSelected] = useState<ProductForPanel | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Price List</h1>
        <p className="text-sm text-stone-500 mt-1">
          Tier {tier} pricing · Click any product for full specs
        </p>
      </div>

      <div className="space-y-10">
        {grouped.map(({ category, products }) => (
          <div key={category}>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              {category}
            </h2>
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left px-5 py-3 font-medium text-stone-500 text-xs">Product</th>
                    <th className="text-left px-5 py-3 font-medium text-stone-500 text-xs">SKU</th>
                    <th className="text-left px-5 py-3 font-medium text-stone-500 text-xs">Size</th>
                    <th className="text-left px-5 py-3 font-medium text-stone-500 text-xs">Finish</th>
                    <th className="text-right px-5 py-3 font-medium text-stone-500 text-xs">Retail / SQFT</th>
                    <th className="text-right px-5 py-3 font-medium text-stone-800 text-xs">Your Price / SQFT</th>
                    <th className="px-5 py-3 text-xs"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p as ProductForPanel)}
                      className="hover:bg-stone-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stockDot[p.stock_level] ?? "bg-stone-300"}`}
                            title={p.stock_level}
                          />
                          <div>
                            <p className="text-stone-800 font-medium group-hover:text-stone-900">{p.name}</p>
                            {p.subtitle && (
                              <p className="text-xs text-stone-400">{p.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 text-xs font-mono">{p.sku}</td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs">{p.size}</td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs">{p.finish}</td>
                      <td className="px-5 py-3.5 text-right text-stone-400 text-xs">${p.retail_price_sqft.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-stone-800">${p.rep_price_sqft.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-stone-300 group-hover:text-stone-500 transition-colors text-right">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="2" y1="7" x2="12" y2="7" />
                          <polyline points="8,3 12,7 8,11" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-400 mt-8">
        Colored dot = stock status · Contact{" "}
        <a href="mailto:infohaus@bsd.group" className="underline">infohaus@bsd.group</a>{" "}
        for custom pricing
      </p>

      {/* Downloads */}
      <div className="mt-8 border-t border-stone-200 pt-8">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Downloads</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/downloads/sales-rep-sheet.pdf"
            download
            className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3.5 hover:border-stone-400 transition-colors group"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="1.5" width="12" height="15" rx="1.5" />
                <line x1="6" y1="6" x2="12" y2="6" />
                <line x1="6" y1="9" x2="12" y2="9" />
                <line x1="6" y1="12" x2="10" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">Sales Rep Sheet</p>
              <p className="text-xs text-stone-400">PDF · Product images &amp; specs</p>
            </div>
            <svg className="ml-auto text-stone-300 group-hover:text-stone-600 transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="2" x2="7" y2="10" />
              <polyline points="4,7 7,10 10,7" />
              <line x1="2" y1="12" x2="12" y2="12" />
            </svg>
          </a>
          <a
            href="/downloads/price-list.xlsx"
            download
            className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3.5 hover:border-stone-400 transition-colors group"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="1.5" width="12" height="15" rx="1.5" />
                <line x1="6" y1="6" x2="12" y2="6" />
                <line x1="6" y1="9" x2="12" y2="9" />
                <line x1="6" y1="12" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">Price List</p>
              <p className="text-xs text-stone-400">Excel · Full pricing &amp; specs</p>
            </div>
            <svg className="ml-auto text-stone-300 group-hover:text-stone-600 transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="2" x2="7" y2="10" />
              <polyline points="4,7 7,10 10,7" />
              <line x1="2" y1="12" x2="12" y2="12" />
            </svg>
          </a>
        </div>
      </div>

      <ProductDetailPanel
        product={selected}
        tier={tier}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
