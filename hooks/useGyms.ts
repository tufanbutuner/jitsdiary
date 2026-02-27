"use client";

import { useQuery } from "@tanstack/react-query";

export interface Gym {
  id: string;
  name: string;
}

export function useGyms(enabled: boolean) {
  const { data = [] } = useQuery<Gym[]>({
    queryKey: ["gyms"],
    queryFn: () => fetch("/api/gyms").then((r) => r.json()),
    enabled,
  });
  return data;
}
