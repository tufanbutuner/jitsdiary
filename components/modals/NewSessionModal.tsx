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
import { useSessions } from "@/hooks/useSessions";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import type { Gym } from "@/types/index";

interface Props {
  gyms: Gym[];
  defaultGymId: string;
}

export default function NewSessionModal({ gyms, defaultGymId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    session_type: "gi",
    gym_id: "",
    duration_minutes: "",
    coach: "",
    notes: "",
  });

  const { submitting, error, createSession } = useSessions();

  const gym_id = form.gym_id || defaultGymId;

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
    const ok = await createSession({ ...form, gym_id });
    if (ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Session</Button>

      {open && (
        <Modal title="New Session" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Date">
              <Input type="date" name="date" required value={form.date} onChange={handleChange} />
            </FormField>

            <FormField label="Type">
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
            </FormField>

            <FormField label="Gym">
              <Select value={gym_id || "none"} onValueChange={(v) => handleSelect("gym_id", v)}>
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
            </FormField>

            <FormField label="Duration (minutes)">
              <Input type="number" name="duration_minutes" min="1" value={form.duration_minutes} onChange={handleChange} placeholder="e.g. 90" />
            </FormField>

            <FormField label="Coach">
              <Input type="text" name="coach" value={form.coach} onChange={handleChange} placeholder="e.g. John Smith" />
            </FormField>

            <FormField label="Notes">
              <Textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="How did it go?" />
            </FormField>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-3 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Session"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
