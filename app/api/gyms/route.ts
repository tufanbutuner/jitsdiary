import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const { items } = await pb.collection("gyms").getList(1, 100, {
    sort: "name",
  });
  return Response.json(items);
}
