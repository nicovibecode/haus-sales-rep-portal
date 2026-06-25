"use client";

export interface SampleDetail {
  id: string;
  rep_name?: string;
  rep_email?: string;
  client_name: string;
  client_email?: string | null;
  shipping_address?: string | null;
  products: string;
  notes?: string | null;
  status: string;
  created_at: string;
}

const statusStyle: Record<string, string> = {
  Requested: "bg-amber-100 text-amber-800",
  Sent: "bg-sky-100 text-sky-800",
  Delivered: "bg-emerald-100 text-emerald-800",
};

export default function SampleDetailDrawer({
  sample,
  onClose,
  showRep = false,
}: {
  sample: SampleDetail | null;
  onClose: () => void;
  showRep?: boolean;
}) {
  if (!sample) return null;

  const productList = sample.products?.toString().split(",").map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 font-mono">{sample.id.slice(0, 8)}…</p>
            <h2 className="text-lg font-semibold text-stone-800">Sample Request</h2>
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
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[sample.status] ?? "bg-stone-100 text-stone-600"}`}>
              {sample.status}
            </span>
            <span className="text-xs text-stone-400">
              {sample.created_at ? new Date(sample.created_at).toLocaleString() : "—"}
            </span>
          </div>

          {/* Rep info (admin view only) */}
          {showRep && (
            <Section title="Sales Rep">
              <Row label="Name" value={sample.rep_name} />
              <Row label="Email" value={sample.rep_email} />
            </Section>
          )}

          {/* Client info */}
          <Section title="Client">
            <Row label="Name" value={sample.client_name} />
            <Row label="Email" value={sample.client_email} />
            <Row label="Shipping Address" value={sample.shipping_address} />
          </Section>

          {/* Products */}
          <Section title={`Products Requested (${productList.length})`}>
            <ul className="space-y-1.5">
              {productList.map((p, i) => (
                <li key={i} className="text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                  {p}
                </li>
              ))}
            </ul>
          </Section>

          {/* Notes */}
          {sample.notes && (
            <Section title="Notes">
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{sample.notes}</p>
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

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm text-right text-stone-800">{value || "—"}</span>
    </div>
  );
}
