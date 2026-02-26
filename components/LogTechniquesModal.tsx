"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Technique {
  id: string;
  name: string;
  category: string;
}

interface SessionTechnique {
  id: string;
  technique_id: string;
  expand: { technique_id: Technique };
}

interface Props {
  sessionId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  guard: "Guard",
  mount: "Mount",
  takedown: "Takedown",
  submission: "Submission",
  escape: "Escape",
  transition: "Transition",
};

export default function LogTechniquesModal({ sessionId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState<Technique[]>([]);
  const [logged, setLogged] = useState<SessionTechnique[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/techniques").then((r) => r.json()),
      fetch(`/api/sessions/${sessionId}/techniques`).then((r) => r.json()),
    ]).then(([lib, log]) => {
      setLibrary(lib);
      setLogged(log);
    }).catch(() => {});
  }, [open, sessionId]);

  const loggedIds = useMemo(() => new Set(logged.map((l) => l.technique_id)), [logged]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return library.filter(
      (t) => !loggedIds.has(t.id) && (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    );
  }, [library, search, loggedIds]);

  const grouped = useMemo(() => {
    const map: Record<string, Technique[]> = {};
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [filtered]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleRemove(st: SessionTechnique) {
    await fetch(`/api/sessions/${sessionId}/techniques/${st.id}`, { method: "DELETE" });
    setLogged((prev) => prev.filter((l) => l.id !== st.id));
    router.refresh();
  }

  async function handleSave() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/techniques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Failed to log techniques");
      setSelected(new Set());
      // Refresh logged list
      const updated = await fetch(`/api/sessions/${sessionId}/techniques`).then((r) => r.json());
      setLogged(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Log Techniques
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Log Techniques
              </h2>
              <button
                onClick={() => { setOpen(false); setSelected(new Set()); setSearch(""); }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Already logged */}
            {logged.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                  Already logged
                </p>
                <div className="flex flex-wrap gap-2">
                  {logged.map((st) => (
                    <span
                      key={st.id}
                      className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {st.expand?.technique_id?.name ?? st.technique_id}
                      <button
                        onClick={() => handleRemove(st)}
                        className="ml-1 text-zinc-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <input
              type="text"
              placeholder="Search techniques..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />

            {/* Library */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {Object.keys(grouped).length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No techniques found</p>
              ) : (
                Object.entries(grouped).map(([category, techniques]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                      {CATEGORY_LABELS[category] ?? category}
                    </p>
                    <div className="space-y-1">
                      {techniques.map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(t.id)}
                            onChange={() => toggle(t.id)}
                            className="rounded"
                          />
                          <span className="text-sm text-zinc-900 dark:text-zinc-100">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-zinc-500">
                {selected.size > 0 ? `${selected.size} selected` : ""}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSelected(new Set()); setSearch(""); }}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  disabled={submitting || selected.size === 0}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {submitting ? "Saving..." : "Add Selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
