"use client";

import { useMutation } from "@tanstack/react-query";

interface SessionFormData {
  date: string;
  session_type: string;
  gym_id: string;
  duration_minutes: string;
  coach: string;
  notes: string;
}

async function fetchSession(url: string, method: string, data: SessionFormData) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = method === "POST" ? "Failed to create session" : "Failed to update session";
    try { message = JSON.parse(text).error ?? message; } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function useSessions() {
  const createMutation = useMutation({
    mutationFn: (data: SessionFormData) => fetchSession("/api/sessions", "POST", data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionFormData }) =>
      fetchSession(`/api/sessions/${id}`, "PATCH", data),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error =
    createMutation.error?.message ?? updateMutation.error?.message ?? "";

  async function createSession(data: SessionFormData): Promise<boolean> {
    try {
      await createMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }

  async function updateSession(id: string, data: SessionFormData): Promise<boolean> {
    try {
      await updateMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }

  return { submitting: isPending, error, createSession, updateSession };
}
