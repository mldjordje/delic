import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePanel } from "@/components/portal/ProfilePanel";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const forceComplete = String(sp.complete || "") === "1";

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Clean account panel for name and phone (not a raw form).
        </p>
      </div>

      {forceComplete ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>Name + phone are required for booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This takes less than a minute. After saving, you’ll return to the dashboard.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <ProfilePanel forceComplete={forceComplete} />
    </div>
  );
}

