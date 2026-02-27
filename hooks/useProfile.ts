"use client";

import { useState, useEffect } from "react";

interface Profile {
  gym_id?: string;
  belt?: string;
  stripes?: number;
  display_name?: string;
}

export function useProfile(enabled: boolean) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {});
  }, [enabled]);

  return profile;
}
