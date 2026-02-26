import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/pocketbase-server";
import { GymsResponse, ProfilesResponse } from "@/types/pocketbase";
import EditProfileForm from "@/components/EditProfileForm";
import { Card, CardContent } from "@/components/ui/card";

type ProfileWithGym = ProfilesResponse<{ gym_id: GymsResponse }>;

const BELT_COLORS: Record<string, string> = {
  white: "bg-white border-2 border-zinc-300",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  brown: "bg-amber-800",
  black: "bg-zinc-900 dark:bg-zinc-700",
};

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const pb = createServerClient();
  const [{ items: profiles }, { items: gyms }] = await Promise.all([
    pb.collection("profiles").getList(1, 1, {
      filter: `user_id = "${userId}"`,
      expand: "gym_id",
    }),
    pb.collection("gyms").getList(1, 100, { sort: "name" }),
  ]);

  const profile = (profiles[0] as ProfileWithGym) ?? null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Profile</h1>

        {/* Belt display */}
        {profile?.belt && (
          <Card className="py-4">
            <CardContent className="flex items-center gap-4 py-0">
              <div className={`h-10 w-10 rounded-full ${BELT_COLORS[profile.belt]}`} />
              <div>
                <p className="font-medium capitalize">
                  {profile.belt} Belt
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.stripes
                    ? `${profile.stripes} stripe${profile.stripes > 1 ? "s" : ""}`
                    : "No stripes"}
                  {profile.expand?.gym_id ? ` · ${profile.expand.gym_id.name}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <EditProfileForm profile={profile} gyms={gyms} />
      </div>
    </div>
  );
}
