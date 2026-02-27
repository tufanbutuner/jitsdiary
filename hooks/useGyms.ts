"use client";

import { useState, useEffect } from "react";

export interface Gym {
  id: string;
  name: string;
}

export function useGyms(enabled: boolean) {
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/gyms")
      .then((r) => r.json())
      .then(setGyms)
      .catch(() => {});
  }, [enabled]);

  return gyms;
}
