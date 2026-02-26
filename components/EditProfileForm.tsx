"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Profile {
  id: string;
  display_name?: string;
  belt?: string;
  stripes?: number;
  gym_id?: string;
}

interface Props {
  profile: Profile | null;
  gyms: Gym[];
}

export default function EditProfileForm({ profile, gyms }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    display_name: profile?.display_name ?? "",
    belt: profile?.belt ?? "",
    stripes: profile?.stripes?.toString() ?? "0",
    gym_id: profile?.gym_id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSelect(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value === "none" ? "" : value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to save profile";
        try { message = JSON.parse(text).error ?? message; } catch {}
        throw new Error(message);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Display name</label>
        <Input type="text" name="display_name" value={form.display_name} onChange={handleChange} placeholder="e.g. Tufan" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Belt</label>
        <Select value={form.belt} onValueChange={(v) => handleSelect("belt", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select belt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
            <SelectItem value="brown">Brown</SelectItem>
            <SelectItem value="black">Black</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Stripes</label>
        <Select value={form.stripes} onValueChange={(v) => handleSelect("stripes", v)}>
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Home gym</label>
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

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-600 dark:text-green-400">Profile saved.</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
      </div>
    </form>
  );
}
