"use client";

interface Rep {
  id: string;
  name: string;
  region: string;
  email: string;
  phone: string;
  status: string;
}

function downloadCSV(reps: Rep[]) {
  const headers = ["Name", "Region", "Email", "Phone", "Status"];
  const rows = reps.map((r) => [r.name, r.region, r.email, r.phone, r.status]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bsdhaus-reps.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function RepsClient({ reps }: { reps: Rep[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Sales Reps</h1>
          <p className="text-sm text-stone-500 mt-1">
            This roster is also available on{" "}
            <span className="underline">bsdhaus.com</span>
          </p>
        </div>
        <button
          onClick={() => downloadCSV(reps)}
          className="flex items-center gap-2 bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
        >
          ↓ Download CSV
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {["Rep Name", "Region", "Email", "Phone", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 font-medium text-stone-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {reps.map((r) => (
              <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-stone-800">{r.name}</td>
                <td className="px-5 py-3.5 text-stone-600">{r.region}</td>
                <td className="px-5 py-3.5 text-stone-600">{r.email}</td>
                <td className="px-5 py-3.5 text-stone-600">{r.phone}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
