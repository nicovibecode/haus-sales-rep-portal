"use client";
import { useState, useRef } from "react";

interface FAQ {
  q: string;
  a: string;
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnswer("");
    setLoading(true);

    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnswer((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAnswer("Sorry, something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">FAQ</h1>
        <p className="text-sm text-stone-500 mt-1">
          Ask anything about BSD Haus products, policies, and processes.
        </p>
      </div>

      {/* AI Search */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <form onSubmit={handleAsk} className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What's the lead time for Carrara marble?"
            className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Ask"}
          </button>
        </form>

        {(answer || loading) && (
          <div className="mt-5 pt-5 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              AI Answer
            </p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
              {answer}
              {loading && <span className="animate-pulse">▌</span>}
            </p>
          </div>
        )}
      </div>

      {/* Hardcoded FAQ cards */}
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
        Common Questions
      </h2>
      <div className="grid gap-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200 rounded-xl px-5 py-4"
          >
            <p className="text-sm font-semibold text-stone-800 mb-1">{faq.q}</p>
            <p className="text-sm text-stone-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
