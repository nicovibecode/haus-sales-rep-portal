"use client";
import { useEffect } from "react";

interface Detail {
  tagline: string;
  type: string;
  surface_type: string;
  pieces_per_box: string;
  grout_joint: string;
  grout_type: string;
  substrate: string;
  thinset: string;
  intended_use: string;
}

export interface ProductForPanel {
  id: string;
  name: string;
  subtitle?: string;
  category: string;
  material: string;
  size: string;
  finish: string;
  sku: string;
  sqft_per_box: number;
  retail_price_sqft: number;
  rep_price_sqft: number;
  recommended_overage: number;
  stock_level: string;
  sqft_available: number;
  website_url?: string;
  detail?: Detail;
}

const stockBadge: Record<string, string> = {
  "In Stock": "bg-emerald-100 text-emerald-800",
  "Low Stock": "bg-amber-100 text-amber-800",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function ProductDetailPanel({
  product,
  tier,
  onClose,
}: {
  product: ProductForPanel | null;
  tier: string;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;

  const d = product.detail;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-stone-200">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">
              {product.category}
            </p>
            <h2 className="text-xl font-semibold text-stone-800">{product.name}</h2>
            {product.subtitle && (
              <p className="text-sm text-stone-500 mt-0.5">{product.subtitle}</p>
            )}
            {d?.tagline && (
              <p className="text-xs text-stone-400 italic mt-1">{d.tagline}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 text-stone-400 hover:text-stone-800 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-800 text-white rounded-xl px-4 py-3">
              <p className="text-xs text-stone-400 mb-0.5">Your Price / SQFT</p>
              <p className="text-2xl font-bold">${product.rep_price_sqft.toFixed(2)}</p>
              <p className="text-xs text-stone-400 mt-0.5">Tier {tier}</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
              <p className="text-xs text-stone-500 mb-0.5">Retail / SQFT</p>
              <p className="text-2xl font-semibold text-stone-800">${product.retail_price_sqft.toFixed(2)}</p>
              <p className="text-xs text-stone-400 mt-0.5">List price</p>
            </div>
          </div>

          {/* Stock + website link */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stockBadge[product.stock_level] ?? "bg-stone-100 text-stone-600"}`}>
                {product.stock_level}
              </span>
              {product.sqft_available > 0 && (
                <span className="text-xs text-stone-400">{product.sqft_available.toLocaleString()} SQFT available</span>
              )}
            </div>
            {product.website_url && (
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition-colors underline underline-offset-2"
              >
                View on bsdhaus.com
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 8.5L8.5 1.5M8.5 1.5H4M8.5 1.5V6" />
                </svg>
              </a>
            )}
          </div>

          {/* Specs grid */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Specifications</p>
            <dl className="divide-y divide-stone-100">
              {[
                ["SKU", product.sku],
                ["Material", product.material],
                ["Size", product.size],
                ["Finish", product.finish],
                ["Surface Type", d?.surface_type],
                ["Type", d?.type],
                ["Pieces / Box", d?.pieces_per_box],
                ["SQFT / Box", product.sqft_per_box.toString()],
                ["Recommended Overage", `${product.recommended_overage}%`],
                ["Grout Joint", d?.grout_joint],
                ["Grout Type", d?.grout_type],
                ["Substrate", d?.substrate],
                ["Thinset", d?.thinset],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-sm text-stone-500 flex-shrink-0">{label}</dt>
                    <dd className="text-sm text-stone-800 text-right">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Intended use */}
          {d?.intended_use && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Intended Use</p>
              <p className="text-sm text-stone-700 leading-relaxed">{d.intended_use}</p>
            </div>
          )}

          {/* Contact line */}
          <div className="text-xs text-stone-400 pt-2 border-t border-stone-100">
            Questions? Contact{" "}
            <a href="mailto:infohaus@bsd.group" className="underline text-stone-600">infohaus@bsd.group</a>
            {" "}· (562) 286-0626
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white">
          <a
            href={`/portal/calculator?productId=${product.id}`}
            className="block w-full text-center bg-stone-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Open in Calculator →
          </a>
        </div>
      </aside>
    </>
  );
}
