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
    const stripes = Number(body.stripes ?? 0);
    // PocketBase rejects 0 for required number fields — send null for zero stripes
    // and handle display client-side
    const record = await pb.collection("belt_progressions").create({
      user_id: authUser.userId,
      belt: body.belt,
      stripes: stripes === 0 ? null : stripes,
      // date input gives "YYYY-MM-DD", PB needs a full datetime string
      promoted_on: body.promoted_on.length === 10
        ? `${body.promoted_on} 00:00:00.000Z`
        : body.promoted_on,
      gym_id: body.gym_id || null,
      notes: body.notes || null,
    });
    return Response.json(record, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return Response.json({ error: message }, { status: 500 });
  }
}
