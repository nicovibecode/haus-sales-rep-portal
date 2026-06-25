"use client";
import { useState } from "react";
import OrderDetailDrawer, { OrderDetail } from "@/components/OrderDetailDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Order {
  id: string;
  rep_name: string;
  rep_email: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  shipping_address: string;
  product: string;
  quantity_sqft: number;
  boxes_needed: number | null;
  retail_total: number | null;
  client_total: number | null;
  discount_pct: number | null;
  commission_amount: number | null;
  commission_paid: string | null;
  notes: string;
  status: string;
  created_at: string;
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const statusOptions = ["Pending", "Confirmed", "Fulfilled"];

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-sky-100 text-sky-800",
  Fulfilled: "bg-emerald-100 text-emerald-800",
};

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteOrder() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setSelectedOrder(null);
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  }

  async function toggleCommissionPaid(id: string, currentlyPaid: boolean) {
    const commission_paid = currentlyPaid ? null : new Date().toISOString();
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_paid }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, commission_paid } : o))
      );
    }
  }

  const totalOwed = orders
    .filter((o) => !o.commission_paid)
    .reduce((sum, o) => sum + (o.commission_amount ? Number(o.commission_amount) : 0), 0);
  const totalPaid = orders
    .filter((o) => o.commission_paid)
    .reduce((sum, o) => sum + (o.commission_amount ? Number(o.commission_amount) : 0), 0);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.rep_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex-1">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Commission Owed</p>
          <p className="text-xl font-bold text-amber-700">${fmt(totalOwed)}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex-1">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Commission Paid</p>
          <p className="text-xl font-bold text-emerald-700">${fmt(totalPaid)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-800">All Orders</h1>
        <div className="flex gap-3">
          <input
            placeholder="Search rep or client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm w-52 focus:outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none"
          >
            <option>All</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {["Order ID", "Rep", "Client", "Product", "SQFT", "Client Price", "Commission", "Date", "Status", "Commission Paid"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-stone-600 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-stone-400 text-sm">
                  No orders found.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-stone-50 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(o)}
              >
                <td className="px-4 py-3 font-mono text-xs text-stone-400">{o.id?.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-800">{o.rep_name}</p>
                  <p className="text-xs text-stone-400">{o.rep_email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-stone-700">{o.client_name}</p>
                  <p className="text-xs text-stone-400">{o.client_email}</p>
                </td>
                <td className="px-4 py-3 text-stone-700">{o.product}</td>
                <td className="px-4 py-3 text-stone-600 text-xs">{o.quantity_sqft}</td>
                <td className="px-4 py-3 text-xs">
                  {o.client_total != null ? (
                    <span className="text-stone-700">${fmt(Number(o.client_total))}</span>
                  ) : "—"}
                  {o.discount_pct ? <span className="text-stone-400 ml-1">({Number(o.discount_pct)}% off)</span> : null}
                </td>
                <td className="px-4 py-3 text-xs">
                  {o.commission_amount != null ? (
                    <span className="text-emerald-700 font-semibold">${fmt(Number(o.commission_amount))}</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusStyle[o.status] ?? "bg-stone-100 text-stone-600"}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleCommissionPaid(o.id, !!o.commission_paid)}
                    className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-colors ${
                      o.commission_paid ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {o.commission_paid
                      ? `Paid ${new Date(o.commission_paid).toLocaleDateString()}`
                      : "Mark Paid"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailDrawer
        order={selectedOrder as OrderDetail | null}
        onClose={() => setSelectedOrder(null)}
        showRep
        onDeleteClick={(o) => setDeleteTarget(o as unknown as Order)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this order?"
        message={`Are you sure you want to delete the order for "${deleteTarget?.client_name}"? This cannot be undone.`}
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
