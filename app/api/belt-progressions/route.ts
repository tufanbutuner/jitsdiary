import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const { items } = await pb.collection("belt_progressions").getList(1, 100, {
    filter: `user_id = "${authUser.userId}"`,
    sort: "promoted_on",
  });
  return Response.json(items);
}

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const pb = createServerClient();
  try {
    const record = await pb.collection("belt_progressions").create({
      user_id: authUser.userId,
      belt: body.belt,
      stripes: Number(body.stripes ?? 0),
      promoted_on: body.promoted_on,
      gym_id: body.gym_id || null,
      notes: body.notes || null,
    });
    return Response.json(record, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return Response.json({ error: message }, { status: 500 });
  }
}
