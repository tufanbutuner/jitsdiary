import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

async function getProfile(userId: string) {
  const pb = createServerClient();
  const { items } = await pb.collection("profiles").getList(1, 1, {
    filter: `user_id = "${userId}"`,
    expand: "gym_id",
  });
  return items[0] ?? null;
}

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfile(authUser.userId);
  return Response.json(profile);
}

export async function PUT(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const body = await request.json();

  const data = {
    user_id: authUser.userId,
    belt: body.belt || null,
    stripes: body.stripes != null ? Number(body.stripes) : null,
    gym_id: body.gym_id || null,
    display_name: body.display_name || null,
  };

  try {
    const existing = await getProfile(authUser.userId);
    const profile = existing
      ? await pb.collection("profiles").update(existing.id, data)
      : await pb.collection("profiles").create(data);
    return Response.json(profile);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save profile";
    return Response.json({ error: message }, { status: 500 });
  }
}
