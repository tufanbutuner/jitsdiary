"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useTechniqueMutations(sessionId: string, initialLogged: SessionTechnique[]) {
  const queryClient = useQueryClient();
  const [logged, setLogged] = useState<SessionTechnique[]>(initialLogged);

  const logMutation = useMutation({
    mutationFn: (techniqueIds: string[]) =>
      fetch(`/api/sessions/${sessionId}/techniques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_ids: techniqueIds }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to log techniques");
        return r.json() as Promise<SessionTechnique[]>;
      }),
    onSuccess: (created) => {
      setLogged((prev) => [...prev, ...created]);
      queryClient.invalidateQueries({ queryKey: ["session-techniques", sessionId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (st: SessionTechnique) =>
      fetch(`/api/sessions/${sessionId}/techniques/${st.id}`, {
        method: "DELETE",
      }),
    onMutate: (st) => {
      setLogged((prev) => prev.filter((l) => l.id !== st.id));
    },
  });

  async function logTechniques(techniqueIds: string[]): Promise<boolean> {
    try {
      await logMutation.mutateAsync(techniqueIds);
      return true;
    } catch {
      return false;
    }
  }

  async function removeTechnique(st: SessionTechnique): Promise<void> {
    await removeMutation.mutateAsync(st);
  }

  return {
    logged,
    submitting: logMutation.isPending,
    error: logMutation.error?.message ?? "",
    logTechniques,
    removeTechnique,
  };
}
