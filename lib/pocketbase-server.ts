import PocketBase from "pocketbase";
import type { TypedPocketBase, RollingRoundsResponse, SessionsResponse } from "@/types/pocketbase";
import { connect } from "node:net";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export function createServerClient() {
  return new PocketBase(PB_URL) as TypedPocketBase;
}

/**
 * Raw TCP GET — bypasses all Node.js http/fetch monkey-patching done by Next.js.
 * Needed because Next.js patches globalThis.fetch AND node:http in dev mode,
 * re-encoding query params and breaking PocketBase v0.36's filter parser.
 */
function rawGet(path: string): Promise<Record<string, unknown>> {
  const url = new URL(PB_URL);
  const host = url.hostname;
  const port = Number(url.port) || 8090;
  const request = `GET ${path} HTTP/1.1\r\nHost: ${host}:${port}\r\nConnection: close\r\n\r\n`;

  return new Promise((resolve, reject) => {
    const socket = connect(port, host, () => socket.write(request));
    let raw = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => (raw += chunk));
    socket.on("end", () => {
      const bodyStart = raw.indexOf("\r\n\r\n");
      if (bodyStart === -1) return reject(new Error("No HTTP body"));
      try {
        resolve(JSON.parse(raw.slice(bodyStart + 4)));
      } catch (e) {
        reject(e);
      }
    });
    socket.on("error", reject);
  });
}

export async function getSessionById(id: string): Promise<SessionsResponse> {
  const path = `/api/collections/sessions/records/${id}?expand=gym_id`;
  const json = await rawGet(path);
  if (typeof json.status === "number" && json.status >= 400) {
    throw new Error((json.message as string) ?? "Session not found");
  }
  return json as unknown as SessionsResponse;
}

export async function getRoundsForSession(sessionId: string): Promise<RollingRoundsResponse[]> {
  const filter = `session_id=%22${sessionId}%22`;
  const path = `/api/collections/rolling_rounds/records?perPage=200&filter=${filter}`;
  const json = await rawGet(path);
  if (typeof json.status === "number" && json.status >= 400) {
    console.error("getRoundsForSession PocketBase error:", JSON.stringify(json));
    throw new Error(`getRoundsForSession failed: ${(json.message as string) ?? "unknown"}`);
  }
  return (json.items as RollingRoundsResponse[]) ?? [];
}

export async function getSessionsForUser(userId: string): Promise<SessionsResponse[]> {
  const filter = `user_id=%22${userId}%22`;
  const path = `/api/collections/sessions/records?perPage=50&sort=-date&expand=gym_id&filter=${filter}`;
  const json = await rawGet(path);
  if (typeof json.status === "number" && json.status >= 400) {
    throw new Error((json.message as string) ?? "Failed to fetch sessions");
  }
  return (json.items as SessionsResponse[]) ?? [];
}
