"use client";

import { useQuery } from "@tanstack/react-query";

interface Profile {
  gym_id?: string;
  belt?: string;
  stripes?: number;
  display_name?: string;
}

export function useProfile(enabled: boolean) {
  const { data = null } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then((r) => r.json()),
    enabled,
  });
  return data;
}
