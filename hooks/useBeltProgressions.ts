"use client";

import { useMutation } from "@tanstack/react-query";

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
  const createMutation = useMutation({
    mutationFn: async (data: BeltProgressionFormData): Promise<BeltProgression> => {
      const res = await fetch("/api/belt-progressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save");
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/belt-progressions/${id}`, { method: "DELETE" }),
  });

  async function createProgression(
    data: BeltProgressionFormData
  ): Promise<BeltProgression | null> {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  }

  async function deleteProgression(id: string): Promise<boolean> {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }

  return {
    saving: createMutation.isPending,
    error: createMutation.error?.message ?? "",
    deletingId: deleteMutation.isPending ? deleteMutation.variables ?? null : null,
    createProgression,
    deleteProgression,
  };
}
