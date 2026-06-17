"use client";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
}

interface RepSettings {
  disabled_product_ids: string[];
  max_discounts: Record<string, number>;
}

interface Rep {
  name: string;
  email: string;
  tier: string;
  settings: RepSettings;
}

const CATEGORIES = ["Marble Mosaics", "Travertine", "Ceramics"];
const DEFAULT_MAX: Record<string, number> = {
  "Marble Mosaics": 30,
  Travertine: 30,
  Ceramics: 15,
};

export default function AdminRepsClient({
  reps,
  products,
}: {
  reps: Rep[];
  products: Product[];
}) {
  const [selectedEmail, setSelectedEmail] = useState(reps[0]?.email ?? "");
  const [disabled, setDisabled] = useState<Record<string, string[]>>(
    Object.fromEntries(reps.map((r) => [r.email, r.settings.disabled_product_ids]))
  );
  const [maxDiscounts, setMaxDiscounts] = useState<Record<string, Record<string, number>>>(
    Object.fromEntries(reps.map((r) => [r.email, r.settings.max_discounts]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const rep = reps.find((r) => r.email === selectedEmail)!;
  const repDisabled = disabled[selectedEmail] ?? [];
  const repMaxDiscounts = maxDiscounts[selectedEmail] ?? DEFAULT_MAX;

  function toggleProduct(productId: string) {
    setDisabled((prev) => {
      const current = prev[selectedEmail] ?? [];
      return {
        ...prev,
        [selectedEmail]: current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      };
    });
    setSaved(false);
  }

  function setDiscount(category: string, value: number) {
    setMaxDiscounts((prev) => ({
      ...prev,
      [selectedEmail]: { ...(prev[selectedEmail] ?? DEFAULT_MAX), [category]: value },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/rep-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rep_email: selectedEmail,
        disabled_product_ids: repDisabled,
        max_discounts: repMaxDiscounts,
      }),
    });
    setSaving(false);
    setSaved(true);
  }

  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category === cat),
  }));

  const enabledCount = products.length - repDisabled.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Rep Management</h1>
        <p className="text-sm text-stone-500 mt-1">
          Control product visibility and discount limits per rep.
        </p>
      </div>

      {/* Rep selector */}
      <div className="flex gap-3 mb-8">
        {reps.map((r) => (
          <button
            key={r.email}
            onClick={() => { setSelectedEmail(r.email); setSaved(false); }}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              selectedEmail === r.email
                ? "bg-stone-800 text-white border-stone-800"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
            }`}
          >
            {r.name}
            <span className={`ml-2 text-xs ${selectedEmail === r.email ? "text-stone-400" : "text-stone-400"}`}>
              Tier {r.tier}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {/* Discount limits */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-1">Max Discount by Category</h2>
          <p className="text-xs text-stone-400 mb-5">
            The highest discount {rep.name} can offer clients. Affects the calculator slider ceiling.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <p className="text-xs font-medium text-stone-500 mb-3">{cat}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={repMaxDiscounts[cat] ?? DEFAULT_MAX[cat]}
                    onChange={(e) => setDiscount(cat, Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center px-2 py-1.5 border border-stone-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <span className="text-sm text-stone-500">% max off</span>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Default: {DEFAULT_MAX[cat]}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Product toggles */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-stone-700">Product Visibility</h2>
            <span className="text-xs text-stone-400">
              {enabledCount} of {products.length} products visible
            </span>
          </div>
          <p className="text-xs text-stone-400 mb-5">
            Disabled products are hidden from {rep.name}&apos;s price list and calculator.
          </p>

          <div className="space-y-6">
            {byCategory.map(({ category, products: catProducts }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{category}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const ids = catProducts.map((p) => p.id);
                        setDisabled((prev) => ({
                          ...prev,
                          [selectedEmail]: (prev[selectedEmail] ?? []).filter((id) => !ids.includes(id)),
                        }));
                        setSaved(false);
                      }}
                      className="text-xs text-stone-400 hover:text-stone-700"
                    >
                      Enable all
                    </button>
                    <span className="text-stone-300">·</span>
                    <button
                      onClick={() => {
                        const ids = catProducts.map((p) => p.id);
                        setDisabled((prev) => {
                          const current = prev[selectedEmail] ?? [];
                          return {
                            ...prev,
                            [selectedEmail]: Array.from(new Set([...current, ...ids])),
                          };
                        });
                        setSaved(false);
                      }}
                      className="text-xs text-stone-400 hover:text-stone-700"
                    >
                      Disable all
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {catProducts.map((p) => {
                    const isDisabled = repDisabled.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                          isDisabled
                            ? "bg-stone-50 border-stone-200 opacity-50"
                            : "bg-white border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                          isDisabled ? "border-stone-300 bg-white" : "border-stone-800 bg-stone-800"
                        }`}>
                          {!isDisabled && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1,4 3,6 7,2" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-800">{p.name}</p>
                          <p className="text-xs text-stone-400 font-mono">{p.sku}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && <p className="text-sm text-emerald-600 font-medium">Saved successfully</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-stone-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
