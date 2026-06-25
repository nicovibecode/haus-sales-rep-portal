"use client";
import { useState } from "react";
import SampleDetailDrawer, { SampleDetail } from "@/components/SampleDetailDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Sample {
  id: string;
  rep_name: string;
  rep_email: string;
  client_name: string;
  client_email: string;
  shipping_address: string;
  products: string;
  notes: string;
  status: string;
  created_at: string;
}

const statusOptions = ["Requested", "Sent", "Delivered"];

const statusStyle: Record<string, string> = {
  Requested: "bg-amber-100 text-amber-800",
  Sent: "bg-sky-100 text-sky-800",
  Delivered: "bg-emerald-100 text-emerald-800",
};

export default function AdminSamplesClient({ initialSamples }: { initialSamples: Sample[] }) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [search, setSearch] = useState("");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sample | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteSample() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/samples/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setSamples((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSelectedSample(null);
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/samples/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSamples((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    }
  }

  const filtered = samples.filter(
    (s) =>
      !search ||
      s.rep_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-800">All Sample Requests</h1>
        <input
          placeholder="Search rep or client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm w-52 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {["Ticket ID", "Rep", "Client", "Products", "Date", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-stone-600 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400 text-sm">No sample requests found.</td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-stone-50 transition-colors cursor-pointer"
                onClick={() => setSelectedSample(s)}
              >
                <td className="px-4 py-3 font-mono text-xs text-stone-400">{s.id?.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-800">{s.rep_name}</p>
                  <p className="text-xs text-stone-400">{s.rep_email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-stone-700">{s.client_name}</p>
                  <p className="text-xs text-stone-400">{s.client_email}</p>
                </td>
                <td className="px-4 py-3 text-stone-600 text-xs max-w-xs">{s.products}</td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusStyle[s.status] ?? "bg-stone-100 text-stone-600"}`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SampleDetailDrawer
        sample={selectedSample as SampleDetail | null}
        onClose={() => setSelectedSample(null)}
        showRep
        onDeleteClick={(s) => setDeleteTarget(s as unknown as Sample)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this sample request?"
        message={`Are you sure you want to delete the sample request for "${deleteTarget?.client_name}"? This cannot be undone.`}
        onConfirm={handleDeleteSample}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
