"use client";

import { useState } from "react";

interface SessionFormData {
  date: string;
  session_type: string;
  gym_id: string;
  duration_minutes: string;
  coach: string;
  notes: string;
}

interface UseMutationResult {
  submitting: boolean;
  error: string;
  createSession: (data: SessionFormData) => Promise<boolean>;
  updateSession: (id: string, data: SessionFormData) => Promise<boolean>;
}

export function useSessions(): UseMutationResult {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function createSession(data: SessionFormData): Promise<boolean> {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to create session";
        try { message = JSON.parse(text).error ?? message; } catch {}
        throw new Error(message);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSession(id: string, data: SessionFormData): Promise<boolean> {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to update session";
        try { message = JSON.parse(text).error ?? message; } catch {}
        throw new Error(message);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, error, createSession, updateSession };
}
