import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; stId: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, stId } = await params;
  const pb = createServerClient();

  // Verify session belongs to this user
  const session = await pb.collection("sessions").getOne(id);
  if (session.user_id !== authUser.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await pb.collection("session_techniques").delete(stId);
  return new Response(null, { status: 204 });
}
