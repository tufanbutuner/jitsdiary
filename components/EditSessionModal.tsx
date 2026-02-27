"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGyms } from "@/hooks/useGyms";
import { useSessions } from "@/hooks/useSessions";

interface Props {
  session: {
    id: string;
    date: string;
    session_type: string;
    gym_id?: string;
    duration_minutes?: number;
    coach?: string;
    notes?: string;
  };
}

export default function EditSessionModal({ session }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    date: session.date.slice(0, 10),
    session_type: session.session_type,
    gym_id: session.gym_id ?? "",
    duration_minutes: session.duration_minutes?.toString() ?? "",
    coach: session.coach ?? "",
    notes: session.notes ?? "",
  });

  const gyms = useGyms(open);
  const { submitting, error, updateSession } = useSessions();

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
    const ok = await updateSession(session.id, form);
    if (ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Edit Session</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Edit Session</CardTitle>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
                type="button"
              >
                ×
              </button>
            </CardHeader>
            <CardContent>
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
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
