import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const { items } = await pb.collection("gyms").getList(1, 100, {
    filter: `user_id = "${userId}"`,
    sort: "name",
  });
  return Response.json(items);
}
