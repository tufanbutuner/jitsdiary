import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(request: Request) {
  const pb = createServerClient();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const sessions = await pb.collection("sessions").getList(page, 20, {
    expand: "gym_id",
    sort: "-date",
  });
  return Response.json(sessions);
}
