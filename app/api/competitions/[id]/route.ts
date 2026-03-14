import { getAuthUser } from "@/lib/auth";
import { getCompetitionById } from "@/lib/pocketbase-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const existing = await getCompetitionById(id);
    if (existing.user_id !== authUser.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const pb = authUser.pb;
    const competition = await pb.collection("competitions").update(id, {
      name: body.name,
      date: body.date,
      location: body.location || undefined,
      division: body.division || undefined,
      weight_class: body.weight_class || undefined,
      result: body.result || undefined,
      notes: body.notes || undefined,
    });
    return Response.json(competition);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update competition";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const existing = await getCompetitionById(id);
    if (existing.user_id !== authUser.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const pb = authUser.pb;
    await pb.collection("competitions").delete(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete competition";
    return Response.json({ error: message }, { status: 500 });
  }
}
