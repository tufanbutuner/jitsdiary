import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pb = createServerClient();

  const record = await pb.collection("belt_progressions").getOne(id);
  if (record.user_id !== authUser.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await pb.collection("belt_progressions").delete(id);
  return new Response(null, { status: 204 });
}
