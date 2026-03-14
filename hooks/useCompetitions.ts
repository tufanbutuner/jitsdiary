"use client";

import { useMutation } from "@tanstack/react-query";

interface CompetitionFormData {
  name: string;
  date: string;
  location: string;
  division: string;
  weight_class: string;
  result: string;
  notes: string;
}

async function fetchCompetition(url: string, method: string, data: CompetitionFormData) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = method === "POST" ? "Failed to create competition" : "Failed to update competition";
    try { message = JSON.parse(text).error ?? message; } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function useCompetitions() {
  const createMutation = useMutation({
    mutationFn: (data: CompetitionFormData) => fetchCompetition("/api/competitions", "POST", data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompetitionFormData }) =>
      fetchCompetition(`/api/competitions/${id}`, "PATCH", data),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/competitions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete competition");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const error =
    createMutation.error?.message ??
    updateMutation.error?.message ??
    deleteMutation.error?.message ??
    "";

  async function createCompetition(data: CompetitionFormData): Promise<boolean> {
    try {
      await createMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }

  async function updateCompetition(id: string, data: CompetitionFormData): Promise<boolean> {
    try {
      await updateMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }

  async function deleteCompetition(id: string): Promise<boolean> {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }

  return { submitting: isPending, error, createCompetition, updateCompetition, deleteCompetition };
}
