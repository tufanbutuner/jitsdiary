import PocketBase from "pocketbase";
import type { TypedPocketBase } from "@/types/pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export function createServerClient() {
  return new PocketBase(PB_URL) as TypedPocketBase;
}
