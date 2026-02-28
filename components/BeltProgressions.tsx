"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBeltProgressions,
  type BeltProgression,
} from "@/hooks/useBeltProgressions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Gym {
  id: string;
  name: string;
}

interface Props {
  progressions: BeltProgression[];
  gyms: Gym[];
}

const BELT_COLORS: Record<string, string> = {
  white: "bg-white border-2 border-zinc-300",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  brown: "bg-amber-800",
  black: "bg-zinc-900 dark:bg-zinc-600",
};

const BELT_LABELS: Record<string, string> = {
  white: "White",
  blue: "Blue",
  purple: "Purple",
  brown: "Brown",
  black: "Black",
};

const EMPTY_FORM = {
  belt: "",
  stripes: "0",
  promoted_on: "",
  gym_id: "",
  notes: "",
};

export default function BeltProgressions({
  progressions: initial,
  gyms,
}: Props) {
  const router = useRouter();
  const [progressions, setProgressions] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { saving, error, deletingId, createProgression, deleteProgression } =
    useBeltProgressions();

  function handleSelect(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value === "none" ? "" : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const record = await createProgression(form);
    if (record) {
      setProgressions((prev) =>
        [...prev, record].sort(
          (a, b) =>
            new Date(a.promoted_on).getTime() -
            new Date(b.promoted_on).getTime(),
        ),
      );
      setForm(EMPTY_FORM);
      setShowForm(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    const ok = await deleteProgression(id);
    if (ok) {
      setProgressions((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Belt History
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add promotion"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Belt
                  </label>
                  <Select
                    value={form.belt}
                    onValueChange={(v) => handleSelect("belt", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select belt" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(BELT_COLORS).map((belt) => (
                        <SelectItem key={belt} value={belt}>
                          {BELT_LABELS[belt]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Stripes
                  </label>
                  <Select
                    value={form.stripes}
                    onValueChange={(v) => handleSelect("stripes", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date promoted
                </label>
                <Input
                  type="date"
                  value={form.promoted_on}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, promoted_on: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Gym
                </label>
                <Select
                  value={form.gym_id || "none"}
                  onValueChange={(v) => handleSelect("gym_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No gym" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No gym</SelectItem>
                    {gyms.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </label>
                <Input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving || !form.belt || !form.promoted_on}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {progressions.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground">
          No promotions recorded yet.
        </p>
      ) : (
        <ol className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-0">
          {progressions.map((p, i) => {
            const isLatest = i === progressions.length - 1;
            return (
              <li key={p.id} className="ml-6 pb-8 last:pb-0">
                {/* dot */}
                <span
                  className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950 ${BELT_COLORS[p.belt] ?? "bg-zinc-400"}`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {BELT_LABELS[p.belt] ?? p.belt} Belt
                      {p.stripes > 0 && (
                        <span className="ml-2 text-sm font-normal text-zinc-500">
                          {p.stripes} stripe{p.stripes !== 1 ? "s" : ""}
                        </span>
                      )}
                      {isLatest && (
                        <span className="ml-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        p.promoted_on.slice(0, 10) + "T12:00:00",
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {p.notes && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {p.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="shrink-0 text-xs text-zinc-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {deletingId === p.id ? "…" : "Remove"}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
