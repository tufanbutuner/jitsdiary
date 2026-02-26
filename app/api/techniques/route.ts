import { createServerClient } from "@/lib/pocketbase-server";

export async function GET() {
  const pb = createServerClient();
  const { items } = await pb.collection("techniques").getList(1, 500, {
    sort: "category,name",
  });
  return Response.json(items);
}
