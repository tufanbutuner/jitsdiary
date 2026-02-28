import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";
import type { ProfilesResponse, GymsResponse } from "@/types/pocketbase";

type ProfileWithGym = ProfilesResponse<{ gym_id: GymsResponse }>;

export async function getProfile(): Promise<ProfileWithGym | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;
  const pb = createServerClient();
  const { items } = await pb.collection("profiles").getList(1, 1, {
    filter: `user_id = "${authUser.userId}"`,
    expand: "gym_id",
  });
  return (items[0] as ProfileWithGym) ?? null;
}
