"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SessionPayload } from "@/lib/session";
import { getZoneFromZip, calcLTLShipping } from "@/lib/shipping";
import OrderDetailDrawer, { OrderDetail } from "@/components/OrderDetailDrawer";

interface Order {
  id: string;
  product: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  shipping_address?: string | null;
  created_at: string;
  status: string;
  retail_total?: number | null;
  client_total?: number | null;
  retail_price_sqft?: number | null;
  client_price_sqft?: number | null;
  commission_amount?: number | null;
  commission_paid?: string | null;
  discount_pct?: number | null;
  quantity_sqft?: number | null;
  boxes_needed?: number | null;
  notes?: string | null;
}

interface PushedOrder {
  productId: string;
  productName: string;
  finalSqft: string;
  boxesNeeded: string;
  overage: string;
  discountPct: string;
  retailPriceSqft: string;
  clientPriceSqft: string;
  retailTotal: string;
  clientTotal: string;
  commission: string;
}

interface Product {
  id: string;
  name: string;
  box_weight_lbs: number;
}


const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-sky-100 text-sky-800",
  Fulfilled: "bg-emerald-100 text-emerald-800",
};

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function OrdersInner({
  session,
  initialOrders,
  products,
}: {
  session: SessionPayload;
  initialOrders: Order[];
  products: Product[];
}) {
  const params = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string; commission: string } | null>(null);
  const [taxExempt, setTaxExempt] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState<"ltl" | "ups" | "pickup">("ltl");
  const [zipCode, setZipCode] = useState("");

  // Read pushed data from calculator
  const pushed: PushedOrder | null = params.get("productName")
    ? {
        productId: params.get("productId") ?? "",
        productName: params.get("productName") ?? "",
        finalSqft: params.get("finalSqft") ?? "",
        boxesNeeded: params.get("boxesNeeded") ?? "",
        overage: params.get("overage") ?? "",
        discountPct: params.get("discountPct") ?? "",
        retailPriceSqft: params.get("retailPriceSqft") ?? "",
        clientPriceSqft: params.get("clientPriceSqft") ?? "",
        retailTotal: params.get("retailTotal") ?? "",
        clientTotal: params.get("clientTotal") ?? "",
        commission: params.get("commission") ?? "",
      }
    : null;

  // Zip-to-zone detection
  const detectedZone = shippingMethod === "ltl" ? getZoneFromZip(zipCode) : null;

  // Calculate shipping cost
  const shippingCost = (() => {
    if (!pushed) return 0;
    if (shippingMethod === "pickup") return 0;
    if (shippingMethod === "ups") return 10;
    // LTL — need a valid zone
    if (!detectedZone) return 0;
    const product = products.find((p) => p.id === pushed.productId);
    const boxWeightLbs = product?.box_weight_lbs ?? 40;
    const totalWeight = parseInt(pushed.boxesNeeded) * boxWeightLbs;
    return calcLTLShipping(detectedZone, totalWeight);
  })();

  const clientTotal = pushed ? parseFloat(pushed.clientTotal) : 0;
  const orderTotal = clientTotal + shippingCost;

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    shipping_address: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pushed) return;
    setLoading(true);
    setConfirmed(null);
    setSubmitError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tax_exempt: taxExempt,
          product: pushed.productName,
          quantity_sqft: parseFloat(pushed.finalSqft),
          boxes_needed: parseInt(pushed.boxesNeeded),
          retail_price_sqft: parseFloat(pushed.retailPriceSqft),
          client_price_sqft: parseFloat(pushed.clientPriceSqft),
          discount_pct: parseFloat(pushed.discountPct),
          retail_total: parseFloat(pushed.retailTotal),
          client_total: parseFloat(pushed.clientTotal),
          commission_amount: parseFloat(pushed.commission),
        }),
      });

      let data: Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {
        // empty/non-JSON body
      }

      if (res.ok) {
        setConfirmed({ id: data.id as string, commission: pushed.commission });
        setOrders((prev) => [data as unknown as Order, ...prev]);
        setForm({ client_name: "", client_email: "", client_phone: "", shipping_address: "", notes: "" });
        setTaxExempt(false);
        window.history.replaceState({}, "", "/portal/orders");
      } else {
        setSubmitError((data.error as string) || `Submission failed (${res.status})`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Order Submission</h1>
        <p className="text-sm text-stone-500 mt-1">
          Orders are created from the Calculator. Go there first to set product, SQFT, and pricing.
        </p>
      </div>

      {/* Commission confirmed */}
      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-emerald-800 mb-0.5">
            Order submitted! ID: <span className="font-mono">{confirmed.id.slice(0, 8)}…</span>
          </p>
          <p className="text-sm text-emerald-700">
            Your commission on this order: <span className="font-bold">${parseFloat(confirmed.commission).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            {" "}(paid within 30 days of collection, per rep agreement)
          </p>
        </div>
      )}

      {/* No pushed order */}
      {!pushed && !confirmed && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-6 py-10 mb-8 text-center">
          <p className="text-stone-500 text-sm mb-4">
            No order in progress. Use the Calculator to select a product, set pricing, and push an order here.
          </p>
          <a
            href="/portal/calculator"
            className="inline-flex items-center gap-2 bg-stone-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-stone-700 transition-colors"
          >
            ← Go to Calculator
          </a>
        </div>
      )}

      {/* Pushed order form */}
      {pushed && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
          {/* Calculator summary banner */}
          <div className="bg-stone-800 text-white rounded-lg px-5 py-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">From Calculator</p>
                <p className="font-semibold text-lg">{pushed.productName}</p>
                <p className="text-sm text-stone-300 mt-0.5">
                  {pushed.boxesNeeded} boxes · {pushed.finalSqft} SQFT
                  {parseFloat(pushed.discountPct) > 0
                    ? ` · ${pushed.discountPct}% off retail`
                    : " · Full retail"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400 mb-0.5">Product Subtotal</p>
                <p className="text-xl font-bold">${fmt(clientTotal)}</p>
                <p className="text-xs text-stone-400 mt-1">
                  ${pushed.clientPriceSqft}/sqft
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-700 flex items-center justify-between">
              <p className="text-xs text-stone-400">
                Retail total: ${fmt(parseFloat(pushed.retailTotal))}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-stone-400">Your Commission (10%)</p>
                <p className="text-base font-bold text-emerald-400">
                  ${fmt(parseFloat(pushed.commission))}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Calculator */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Shipping Estimate</p>

            {/* Method selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { key: "ltl", label: "LTL Freight", sub: "Curbside delivery" },
                { key: "ups", label: "UPS Ground", sub: "$10 flat" },
                { key: "pickup", label: "Local Pickup", sub: "Free" },
              ].map(({ key, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setShippingMethod(key as "ltl" | "ups" | "pickup")}
                  className={`rounded-lg px-3 py-2.5 text-left border transition-colors ${
                    shippingMethod === key
                      ? "bg-stone-800 text-white border-stone-800"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <p className="text-xs font-semibold">{label}</p>
                  <p className={`text-xs mt-0.5 ${shippingMethod === key ? "text-stone-400" : "text-stone-400"}`}>{sub}</p>
                </button>
              ))}
            </div>

            {/* LTL zip input */}
            {shippingMethod === "ltl" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Zip Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="e.g. 90210"
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                {zipCode.length >= 3 && (
                  <div className="mt-1.5">
                    {detectedZone ? (
                      (() => {
                        const product = products.find((p) => p.id === pushed.productId);
                        const boxWeight = product?.box_weight_lbs ?? 40;
                        const totalWeight = parseInt(pushed.boxesNeeded) * boxWeight;
                        const weightCost = totalWeight * detectedZone.perLbRate;
                        return (
                          <p className="text-xs text-stone-500">
                            <span className="font-medium text-stone-700">{detectedZone.label}</span>
                            {" · "}base ${detectedZone.baseRate.toFixed(2)} + {totalWeight.toLocaleString()} lbs × ${detectedZone.perLbRate} = ${fmt(weightCost)} weight surcharge
                          </p>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-amber-600">Zip code not recognized — contact BSD Haus for a shipping quote.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {shippingMethod === "ups" && (
              <p className="text-xs text-stone-500 mb-4">
                UPS Ground flat rate applies to samples and small decorative items only.
              </p>
            )}

            {/* Cost breakdown */}
            <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white overflow-hidden">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-stone-600">Product subtotal</span>
                <span className="text-sm font-medium text-stone-800">${fmt(clientTotal)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-stone-600">
                  Shipping
                  {shippingMethod === "ltl" && detectedZone && ` (${detectedZone.label.split("—")[0].trim()})`}
                  {shippingMethod === "ltl" && !detectedZone && zipCode.length >= 3 && " (zip unrecognized)"}
                  {shippingMethod === "ltl" && zipCode.length < 3 && " (enter zip above)"}
                  {shippingMethod === "ups" && " (UPS Ground)"}
                  {shippingMethod === "pickup" && " (Local Pickup)"}
                </span>
                <span className="text-sm font-medium text-stone-800">
                  {shippingMethod === "ltl" && !detectedZone ? "—" : shippingCost === 0 ? "Free" : `$${fmt(shippingCost)}`}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-stone-50">
                <span className="text-sm font-semibold text-stone-800">Estimated Order Total</span>
                <span className="text-sm font-bold text-stone-900">
                  {shippingMethod === "ltl" && !detectedZone ? "—" : `$${fmt(orderTotal)}`}
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Shipping estimate only · final rate confirmed by BSD Haus · excludes tax
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Rep Name">
                <input value={session.repName} readOnly className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-500" />
              </Field>
              <Field label="Rep Email">
                <input value={session.repEmail} readOnly className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-500" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Name">
                <input required value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              </Field>
              <Field label="Client Email">
                <input type="email" value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Phone">
                <input value={form.client_phone} onChange={(e) => update("client_phone", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              </Field>
              <Field label="Shipping Address">
                <input required value={form.shipping_address} onChange={(e) => update("shipping_address", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              </Field>
            </div>

            <Field label="Notes / Special Instructions">
              <textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
            </Field>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={taxExempt} onChange={(e) => setTaxExempt(e.target.checked)} className="w-4 h-4 rounded border-stone-300" />
                <span className="text-sm text-stone-700">Tax exempt order</span>
              </label>
              {taxExempt && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Reminder: Attach a valid resale certificate before this order is processed.
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => window.history.back()} className="flex-1 border border-stone-300 text-stone-700 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">
                ← Back to Calculator
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-stone-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors">
                {loading ? "Submitting…" : `Submit Order · Commission $${fmt(parseFloat(pushed.commission))}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order history */}
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-stone-400 py-4">No orders submitted yet.</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                {["Order ID", "Product", "Client", "SQFT", "Client Price", "Commission", "Commission Paid", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-stone-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(o)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">{o.id?.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-stone-800">{o.product}</td>
                  <td className="px-4 py-3 text-stone-600">{o.client_name}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{o.quantity_sqft ? Number(o.quantity_sqft).toFixed(1) : "—"}</td>
                  <td className="px-4 py-3 text-stone-700 text-xs">
                    {o.client_total != null ? `$${fmt(Number(o.client_total))}` : "—"}
                    {o.discount_pct ? <span className="text-stone-400 ml-1">({Number(o.discount_pct)}% off)</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    {o.commission_amount != null ? (
                      <span className="text-emerald-700 font-semibold text-xs">${fmt(Number(o.commission_amount))}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.commission_paid ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
                      {o.commission_paid ? `Paid ${new Date(o.commission_paid).toLocaleDateString()}` : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[o.status] ?? "bg-stone-100 text-stone-600"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length > 0 && (
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <p className="text-xs text-stone-500">
                Total commission on record:{" "}
                <span className="font-semibold text-emerald-700">
                  ${fmt(orders.reduce((sum, o) => sum + (o.commission_amount ? Number(o.commission_amount) : 0), 0))}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <OrderDetailDrawer
        order={selectedOrder as OrderDetail | null}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export default function OrdersClient(props: {
  session: SessionPayload;
  initialOrders: Order[];
  products: Product[];
}) {
  return (
    <Suspense>
      <OrdersInner session={props.session} initialOrders={props.initialOrders} products={props.products} />
    </Suspense>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
