import PocketBase from "pocketbase";
import type { TypedPocketBase } from "@/types/pocketbase";

export function createServerClient() {
  return new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
  ) as TypedPocketBase;
}
