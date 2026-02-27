"use client";

import { useState } from "react";

interface BeltProgressionFormData {
  belt: string;
  stripes: string;
  promoted_on: string;
  gym_id: string;
  notes: string;
}

export interface BeltProgression {
  id: string;
  belt: string;
  stripes: number;
  promoted_on: string;
  gym_id?: string;
  notes?: string;
}

export function useBeltProgressions() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createProgression(
    data: BeltProgressionFormData
  ): Promise<BeltProgression | null> {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/belt-progressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function deleteProgression(id: string): Promise<boolean> {
    setDeletingId(id);
    try {
      await fetch(`/api/belt-progressions/${id}`, { method: "DELETE" });
      return true;
    } finally {
      setDeletingId(null);
    }
  }

  return { saving, error, deletingId, createProgression, deleteProgression };
}
