import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";
import type { BeltProgressionsResponse } from "@/types/pocketbase";

export async function getBeltProgressions(): Promise<BeltProgressionsResponse[]> {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  const pb = createServerClient();
  const { items } = await pb.collection("belt_progressions").getList(1, 100, {
    filter: `user_id = "${authUser.userId}"`,
    sort: "promoted_on",
  });
  return items as BeltProgressionsResponse[];
}
