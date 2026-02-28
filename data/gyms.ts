import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";
import type { GymsResponse } from "@/types/pocketbase";

export async function getGyms(): Promise<GymsResponse[]> {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  const pb = createServerClient();
  const { items } = await pb.collection("gyms").getList(1, 100, { sort: "name" });
  return items as GymsResponse[];
}
