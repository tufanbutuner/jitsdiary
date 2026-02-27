"use client";

import { useState, useEffect } from "react";

export interface Technique {
  id: string;
  name: string;
  category: string;
}

export interface SessionTechnique {
  id: string;
  technique_id: string;
  expand: { technique_id: Technique };
}

export function useTechniques(sessionId: string, enabled: boolean) {
  const [library, setLibrary] = useState<Technique[]>([]);
  const [logged, setLogged] = useState<SessionTechnique[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    Promise.all([
      fetch("/api/techniques").then((r) => r.json()),
      fetch(`/api/sessions/${sessionId}/techniques`).then((r) => r.json()),
    ])
      .then(([lib, log]) => {
        setLibrary(lib);
        setLogged(log);
      })
      .catch(() => {});
  }, [enabled, sessionId]);

  async function logTechniques(techniqueIds: string[]): Promise<boolean> {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/techniques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_ids: techniqueIds }),
      });
      if (!res.ok) throw new Error("Failed to log techniques");
      const updated: SessionTechnique[] = await fetch(
        `/api/sessions/${sessionId}/techniques`
      ).then((r) => r.json());
      setLogged(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function removeTechnique(st: SessionTechnique): Promise<void> {
    await fetch(`/api/sessions/${sessionId}/techniques/${st.id}`, {
      method: "DELETE",
    });
    setLogged((prev) => prev.filter((l) => l.id !== st.id));
  }

  return { library, logged, submitting, error, logTechniques, removeTechnique };
}
