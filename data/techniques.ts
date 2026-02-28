import { createServerClient } from "@/lib/pocketbase-server";
import type { TechniquesResponse } from "@/types/pocketbase";

export async function getTechniques(): Promise<TechniquesResponse[]> {
  const pb = createServerClient();
  const { items } = await pb.collection("techniques").getList(1, 500, {
    sort: "category,name",
  });
  return items as TechniquesResponse[];
}
