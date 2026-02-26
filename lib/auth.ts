import { cookies } from "next/headers";
import { createServerClient } from "@/lib/pocketbase-server";
import type { TypedPocketBase } from "@/types/pocketbase";

export interface AuthUser {
  userId: string;
  pb: TypedPocketBase;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get("pb_auth")?.value;
  if (!token) return null;
  const pb = createServerClient();
  pb.authStore.save(token);
  try {
    await pb.collection("users").authRefresh();
  } catch {
    return null;
  }
  const userId = pb.authStore.record?.id;
  if (!userId) return null;
  return { userId, pb };
}
