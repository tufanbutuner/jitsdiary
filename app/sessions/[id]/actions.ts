"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function updateSessionNotes(sessionId: string, notes: string) {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");

  const pb = createServerClient();

  const existing = await pb.collection("sessions").getOne(sessionId);
  if (existing.user_id !== authUser.userId) throw new Error("Forbidden");

  await pb.collection("sessions").update(sessionId, { notes: notes || null });

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");
}
