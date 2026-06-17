"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  category: string;
  retail_price_sqft: number;
  rep_price_sqft: number;
  sqft_per_box: number;
  recommended_overage?: number;
}

// Default maximum discounts — overridden by per-rep settings from admin
const DEFAULT_MAX_DISCOUNT: Record<string, number> = {
  "Marble Mosaics": 30,
  "Travertine": 30,
  "Ceramics": 15,
};

export default function CalculatorClient({
  products,
  tier,
  maxDiscounts = {},
}: {
  products: Product[];
  tier: string;
  maxDiscounts?: Record<string, number>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("productId") ?? products[0]?.id ?? "";
  const initialProduct = products.find((p) => p.id === initialId) ?? products[0];
  const [productId, setProductId] = useState(initialId);
  const [sqft, setSqft] = useState("");
  const [overage, setOverage] = useState(initialProduct?.recommended_overage ?? 10);
  const [discountPct, setDiscountPct] = useState(0);

  const product = products.find((p) => p.id === productId);

  // When product changes, reset discount to 0 and overage to product default
  function handleProductChange(id: string) {
    setProductId(id);
    setDiscountPct(0);
    const p = products.find((x) => x.id === id);
    if (p) setOverage(p.recommended_overage ?? 10);
  }

  const maxDiscount = product
    ? (maxDiscounts[product.category] ?? DEFAULT_MAX_DISCOUNT[product.category] ?? 10)
    : 10;

  const result = useMemo(() => {
    if (!product || !sqft || parseFloat(sqft) <= 0) return null;

    const baseSqft = parseFloat(sqft);
    const totalSqftWithOverage = baseSqft * (1 + overage / 100);
    const boxesNeeded = Math.ceil(totalSqftWithOverage / product.sqft_per_box);
    const finalSqft = boxesNeeded * product.sqft_per_box;

    const clientPriceSqft = product.retail_price_sqft * (1 - discountPct / 100);
    const retailTotal = finalSqft * product.retail_price_sqft;
    const clientTotal = finalSqft * clientPriceSqft;
    const repCostTotal = finalSqft * product.rep_price_sqft;
    const commission = clientTotal * 0.1;
    const clientSaves = retailTotal - clientTotal;

    return {
      baseSqft,
      totalSqftWithOverage,
      boxesNeeded,
      finalSqft,
      clientPriceSqft,
      retailTotal,
      clientTotal,
      repCostTotal,
      commission,
      clientSaves,
    };
  }, [product, sqft, overage, discountPct]);

  const byCategory = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  function pushToOrder() {
    if (!result || !product) return;
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.name,
      finalSqft: result.finalSqft.toFixed(2),
      boxesNeeded: result.boxesNeeded.toString(),
      overage: overage.toString(),
      discountPct: discountPct.toString(),
      retailPriceSqft: product.retail_price_sqft.toFixed(2),
      clientPriceSqft: result.clientPriceSqft.toFixed(2),
      retailTotal: result.retailTotal.toFixed(2),
      clientTotal: result.clientTotal.toFixed(2),
      commission: result.commission.toFixed(2),
    });
    router.push(`/portal/orders?${params.toString()}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Price Calculator</h1>
        <p className="text-sm text-stone-500 mt-1">
          Set client discount, calculate boxes, then push to order. Tier {tier} pricing.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {Object.entries(byCategory).map(([cat, prods]) => (
                <optgroup key={cat} label={cat}>
                  {prods.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Square Footage Needed
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Overage %
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={overage}
                onChange={(e) => setOverage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Discount slider + input */}
          {product && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">Client Discount</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxDiscount}
                    step={1}
                    value={discountPct}
                    onChange={(e) => {
                      const v = Math.min(maxDiscount, Math.max(0, parseInt(e.target.value) || 0));
                      setDiscountPct(v);
                    }}
                    className="w-16 text-center px-2 py-1 border border-stone-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-sm text-stone-600">% off</span>
                  <span className="text-xs text-stone-400 ml-1">
                    = ${(product.retail_price_sqft * (1 - discountPct / 100)).toFixed(2)}/sqft
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={maxDiscount}
                step={1}
                value={discountPct}
                onChange={(e) => setDiscountPct(parseInt(e.target.value))}
                className="w-full accent-stone-800"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>0% — full retail (max commission)</span>
                <span>{maxDiscount}% off — cost floor</span>
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Retail: ${product.retail_price_sqft.toFixed(2)}/sqft · Your cost: ${product.rep_price_sqft.toFixed(2)}/sqft
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && product && (
        <>
          <div className="bg-white border border-stone-200 rounded-xl p-6 mb-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-5">
              Order Summary
            </h2>

            {/* Top row: boxes / sqft */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Stat label="Boxes Needed" value={result.boxesNeeded.toString()} />
              <Stat label="Final SQFT Ordered" value={result.finalSqft.toFixed(2)} />
            </div>

            {/* Price breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Stat
                label="Retail Total"
                value={`$${fmt(result.retailTotal)}`}
                sub="List price × SQFT"
              />
              <Stat
                label={`Client Price${discountPct > 0 ? ` (${discountPct}% off)` : ""}`}
                value={`$${fmt(result.clientTotal)}`}
                sub={`$${result.clientPriceSqft.toFixed(2)}/sqft`}
                highlight
              />
              {result.clientSaves > 0 ? (
                <Stat
                  label="Client Saves"
                  value={`$${fmt(result.clientSaves)}`}
                  sub="vs. retail"
                  green
                />
              ) : (
                <Stat label="Client Pays" value="Full Retail" sub="0% discount" />
              )}
            </div>

            {/* Commission callout */}
            <div className="flex items-center gap-4 bg-stone-800 text-white rounded-xl px-5 py-4">
              <div className="flex-1">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-0.5">
                  Your Commission (10%)
                </p>
                <p className="text-2xl font-bold">${fmt(result.commission)}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  10% × ${fmt(result.clientTotal)} client price · excl. tax &amp; shipping
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={pushToOrder}
            className="w-full bg-stone-800 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            Push to Order Tab →
          </button>
          <p className="text-xs text-center text-stone-400 mt-2">
            You&apos;ll fill in client details on the next screen. Commission is locked at ${fmt(result.commission)}.
          </p>
        </>
      )}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Stat({
  label,
  value,
  sub,
  highlight,
  green,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${
        highlight
          ? "bg-stone-800 text-white"
          : green
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-stone-50 border border-stone-200"
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-stone-300" : green ? "text-emerald-600" : "text-stone-500"}`}>
        {label}
      </p>
      <p className={`text-lg font-semibold ${highlight ? "text-white" : green ? "text-emerald-700" : "text-stone-800"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-0.5 ${highlight ? "text-stone-400" : green ? "text-emerald-500" : "text-stone-400"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
