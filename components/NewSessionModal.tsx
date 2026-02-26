"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Gym {
  id: string;
  name: string;
}

export default function NewSessionModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    session_type: "gi",
    gym_id: "",
    duration_minutes: "",
    coach: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/gyms")
      .then((r) => r.json())
      .then(setGyms)
      .catch(() => {});
  }, [open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSelect(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value === "none" ? "" : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to create session";
        try { message = JSON.parse(text).error ?? message; } catch {}
        throw new Error(message);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Session</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                New Session
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
                <Input type="date" name="date" required value={form.date} onChange={handleChange} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                <Select value={form.session_type} onValueChange={(v) => handleSelect("session_type", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gi">Gi</SelectItem>
                    <SelectItem value="no_gi">No-Gi</SelectItem>
                    <SelectItem value="open_mat">Open Mat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gym</label>
                <Select value={form.gym_id || "none"} onValueChange={(v) => handleSelect("gym_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No gym" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No gym</SelectItem>
                    {gyms.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration (minutes)</label>
                <Input type="number" name="duration_minutes" min="1" value={form.duration_minutes} onChange={handleChange} placeholder="e.g. 90" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Coach</label>
                <Input type="text" name="coach" value={form.coach} onChange={handleChange} placeholder="e.g. John Smith" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
                <Textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="How did it go?" />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Session"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
