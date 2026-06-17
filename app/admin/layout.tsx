export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-800 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white/20 rounded-sm" />
          <span className="font-semibold tracking-tight">BSD Haus – Admin</span>
        </div>
        <nav className="flex gap-6 text-sm text-stone-300">
          <a href="/admin/orders" className="hover:text-white transition-colors">Orders</a>
          <a href="/admin/samples" className="hover:text-white transition-colors">Samples</a>
          <a href="/admin/reps" className="hover:text-white transition-colors">Reps</a>
          <a href="/portal/price-list" className="hover:text-white transition-colors">← Portal</a>
        </nav>
      </header>
      <main className="px-8 py-8">{children}</main>
    </div>
  );
}
