"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      const updated = await fetch(`/api/sessions/${sessionId}/techniques`).then((r) => r.json());
      setLogged(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSelected(new Set());
    setSearch("");
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Log Techniques</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Log Techniques</CardTitle>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
                type="button"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {logged.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Already logged</p>
                <div className="flex flex-wrap gap-2">
                  {logged.map((st) => (
                    <span
                      key={st.id}
                      className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {st.expand?.technique_id?.name ?? st.technique_id}
                      <button onClick={() => handleRemove(st)} className="ml-1 text-zinc-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Input
              placeholder="Search techniques..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />

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

            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-muted-foreground">
                {selected.size > 0 ? `${selected.size} selected` : ""}
              </span>
              <div className="flex gap-3">
                <Button variant="outline" type="button" onClick={handleClose}>Close</Button>
                <Button onClick={handleSave} disabled={submitting || selected.size === 0}>
                  {submitting ? "Saving..." : "Add Selected"}
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
