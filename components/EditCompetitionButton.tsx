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
import { useCompetitions } from "@/hooks/useCompetitions";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import type { CompetitionsResponse } from "@/types/pocketbase";

interface Props {
  competition: CompetitionsResponse;
}

export default function EditCompetitionButton({ competition }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: competition.name,
    date: competition.date.split("T")[0],
    location: competition.location ?? "",
    division: competition.division ?? "",
    weight_class: competition.weight_class ?? "",
    result: competition.result ?? "",
    notes: competition.notes ?? "",
  });

  const { submitting, error, updateCompetition } = useCompetitions();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSelect(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value === "none" ? "" : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await updateCompetition(competition.id, form);
    if (ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>

      {open && (
        <Modal title="Edit Competition" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Name">
              <Input type="text" name="name" required value={form.name} onChange={handleChange} />
            </FormField>

            <FormField label="Date">
              <Input type="date" name="date" required value={form.date} onChange={handleChange} />
            </FormField>

            <FormField label="Location">
              <Input type="text" name="location" value={form.location} onChange={handleChange} />
            </FormField>

            <FormField label="Division">
              <Select value={form.division || "none"} onValueChange={(v) => handleSelect("division", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="gi">Gi</SelectItem>
                  <SelectItem value="no_gi">No-Gi</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Weight Class">
              <Input type="text" name="weight_class" value={form.weight_class} onChange={handleChange} />
            </FormField>

            <FormField label="Result">
              <Select value={form.result || "none"} onValueChange={(v) => handleSelect("result", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="no_placement">No placement</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Notes">
              <Textarea name="notes" rows={3} value={form.notes} onChange={handleChange} />
            </FormField>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-3 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
