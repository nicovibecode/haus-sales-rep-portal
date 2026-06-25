"use client";

export interface OrderDetail {
  id: string;
  rep_name?: string;
  rep_email?: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  shipping_address?: string | null;
  product: string;
  quantity_sqft?: number | null;
  boxes_needed?: number | null;
  retail_price_sqft?: number | null;
  client_price_sqft?: number | null;
  discount_pct?: number | null;
  retail_total?: number | null;
  client_total?: number | null;
  commission_amount?: number | null;
  commission_paid?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
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

export default function OrderDetailDrawer({
  order,
  onClose,
  showRep = false,
}: {
  order: OrderDetail | null;
  onClose: () => void;
  showRep?: boolean;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 font-mono">{order.id.slice(0, 8)}…</p>
            <h2 className="text-lg font-semibold text-stone-800">{order.product}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[order.status] ?? "bg-stone-100 text-stone-600"}`}>
              {order.status}
            </span>
            <span className="text-xs text-stone-400">
              {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
            </span>
          </div>

          {/* Rep info (admin view only) */}
          {showRep && (
            <Section title="Sales Rep">
              <Row label="Name" value={order.rep_name} />
              <Row label="Email" value={order.rep_email} />
            </Section>
          )}

          {/* Client info */}
          <Section title="Client">
            <Row label="Name" value={order.client_name} />
            <Row label="Email" value={order.client_email} />
            <Row label="Phone" value={order.client_phone} />
            <Row label="Shipping Address" value={order.shipping_address} />
          </Section>

          {/* Order details */}
          <Section title="Order Details">
            <Row label="Product" value={order.product} />
            <Row label="SQFT Ordered" value={order.quantity_sqft != null ? `${Number(order.quantity_sqft).toFixed(2)} sqft` : "—"} />
            <Row label="Boxes Needed" value={order.boxes_needed != null ? String(order.boxes_needed) : "—"} />
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <Row label="Retail Price / SQFT" value={order.retail_price_sqft != null ? `$${fmt(Number(order.retail_price_sqft))}` : "—"} />
            <Row label="Client Price / SQFT" value={order.client_price_sqft != null ? `$${fmt(Number(order.client_price_sqft))}` : "—"} />
            <Row label="Discount" value={order.discount_pct != null ? `${Number(order.discount_pct)}%` : "—"} />
            <Row label="Retail Total" value={order.retail_total != null ? `$${fmt(Number(order.retail_total))}` : "—"} />
            <Row label="Client Total" value={order.client_total != null ? `$${fmt(Number(order.client_total))}` : "—"} bold />
          </Section>

          {/* Commission */}
          <Section title="Commission">
            <Row label="Amount" value={order.commission_amount != null ? `$${fmt(Number(order.commission_amount))}` : "—"} bold green />
            <Row
              label="Paid Status"
              value={
                order.commission_paid
                  ? `Paid ${new Date(order.commission_paid).toLocaleDateString()}`
                  : "Unpaid"
              }
            />
          </Section>

          {/* Notes */}
          {order.notes && (
            <Section title="Notes / Special Instructions">
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{order.notes}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string | null | undefined;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-stone-500">{label}</span>
      <span
        className={`text-sm text-right ${bold ? "font-semibold" : ""} ${
          green ? "text-emerald-700 font-semibold" : "text-stone-800"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
