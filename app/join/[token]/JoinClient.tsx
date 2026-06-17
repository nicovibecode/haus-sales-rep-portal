"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  "rep-a": "Sales Rep — Tier A",
  "rep-b": "Sales Rep — Tier B",
  "rep-c": "Sales Rep — Tier C",
  "admin": "Admin",
};

export default function JoinClient({
  token,
  email,
  role,
  suggestedName,
}: {
  token: string;
  email: string;
  role: string;
  suggestedName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(suggestedName ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!name.trim()) { setError("Name is required"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });

    if (res.ok) {
      router.push("/portal/price-list");
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-stone-800 rounded-xl mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-stone-800">Set up your account</h1>
          <p className="text-sm text-stone-500 mt-1">
            You&apos;ve been invited as <span className="font-medium">{ROLE_LABELS[role] ?? role}</span>
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
