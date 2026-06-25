"use client";
import { useState } from "react";
import { SessionPayload } from "@/lib/session";
import SampleDetailDrawer, { SampleDetail } from "@/components/SampleDetailDrawer";

interface Sample {
  id: string;
  products: string;
  client_name: string;
  client_email?: string | null;
  shipping_address?: string | null;
  notes?: string | null;
  created_at: string;
  status: string;
}

const statusStyle: Record<string, string> = {
  Requested: "bg-amber-100 text-amber-800",
  Sent: "bg-sky-100 text-sky-800",
  Delivered: "bg-emerald-100 text-emerald-800",
};

export default function SamplesClient({
  session,
  initialSamples,
  products,
}: {
  session: SessionPayload;
  initialSamples: Sample[];
  products: { id: string; name: string }[];
}) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    shipping_address: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleProduct(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return alert("Select at least one product.");
    setLoading(true);
    setConfirmed(null);

    const res = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, products: selected }),
    });

    const data = await res.json();
    if (res.ok) {
      setConfirmed(data.id);
      setSamples((prev) => [data, ...prev]);
      setForm({ client_name: "", client_email: "", shipping_address: "", notes: "" });
      setSelected([]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Sample Requests</h1>
        <p className="text-sm text-stone-500 mt-1">Request product samples for a client. Ships within 3–5 business days.</p>
      </div>

      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-medium text-emerald-800">
            Sample request submitted! Ticket ID:{" "}
            <span className="font-mono font-bold">{confirmed}</span>
          </p>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
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
              <input required value={form.client_name} onChange={(e) => update("client_name", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none" />
            </Field>
            <Field label="Client Email">
              <input type="email" value={form.client_email} onChange={(e) => update("client_email", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none" />
            </Field>
          </div>

          <Field label="Shipping Address">
            <input required value={form.shipping_address} onChange={(e) => update("shipping_address", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none" />
          </Field>

          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Products Requested</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-3">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.name)}
                    onChange={() => toggleProduct(p.name)}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          <Field label="Notes">
            <textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none resize-none" />
          </Field>

          <button type="submit" disabled={loading} className="w-full bg-stone-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors">
            {loading ? "Submitting…" : "Submit Sample Request"}
          </button>
        </form>
      </div>

      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">My Sample Tickets</h2>
      {samples.length === 0 ? (
        <p className="text-sm text-stone-400 py-4">No sample requests yet.</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                {["Ticket ID", "Products", "Client", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-stone-600 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {samples.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSample(s)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{s.id?.toString().slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-stone-700 text-xs max-w-xs truncate">{s.products?.toString()}</td>
                  <td className="px-4 py-3 text-stone-600">{s.client_name?.toString()}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{s.created_at ? new Date(s.created_at.toString()).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[s.status?.toString() ?? ""] ?? "bg-stone-100 text-stone-600"}`}>
                      {s.status?.toString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SampleDetailDrawer
        sample={selectedSample as SampleDetail | null}
        onClose={() => setSelectedSample(null)}
      />
    </div>
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
