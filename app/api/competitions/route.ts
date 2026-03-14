import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const pb = authUser.pb;
    const competition = await pb.collection("competitions").create({
      user_id: authUser.userId,
      name: body.name,
      date: body.date,
      location: body.location || undefined,
      division: body.division || undefined,
      weight_class: body.weight_class || undefined,
      result: body.result || undefined,
      notes: body.notes || undefined,
    });
    return Response.json(competition, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create competition";
    return Response.json({ error: message }, { status: 500 });
  }
}
