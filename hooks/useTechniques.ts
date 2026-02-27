"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data: library = [] } = useQuery<Technique[]>({
    queryKey: ["techniques"],
    queryFn: () => fetch("/api/techniques").then((r) => r.json()),
    enabled,
  });

  const { data: logged = [] } = useQuery<SessionTechnique[]>({
    queryKey: ["session-techniques", sessionId],
    queryFn: () =>
      fetch(`/api/sessions/${sessionId}/techniques`).then((r) => r.json()),
    enabled,
  });

  const logMutation = useMutation({
    mutationFn: (techniqueIds: string[]) =>
      fetch(`/api/sessions/${sessionId}/techniques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_ids: techniqueIds }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to log techniques");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-techniques", sessionId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (st: SessionTechnique) =>
      fetch(`/api/sessions/${sessionId}/techniques/${st.id}`, {
        method: "DELETE",
      }),
    onMutate: async (st) => {
      await queryClient.cancelQueries({ queryKey: ["session-techniques", sessionId] });
      const previous = queryClient.getQueryData<SessionTechnique[]>(["session-techniques", sessionId]);
      queryClient.setQueryData<SessionTechnique[]>(
        ["session-techniques", sessionId],
        (old = []) => old.filter((l) => l.id !== st.id)
      );
      return { previous };
    },
    onError: (_err, _st, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["session-techniques", sessionId], context.previous);
      }
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
    library,
    logged,
    submitting: logMutation.isPending,
    error: logMutation.error?.message ?? "",
    logTechniques,
    removeTechnique,
  };
}
