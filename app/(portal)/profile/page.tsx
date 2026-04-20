import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePanel } from "@/components/portal/ProfilePanel";
import { PortalHero } from "@/components/portal/PortalHero";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const forceComplete = String(sp.complete || "") === "1";

  return (
    <div className="space-y-6">
      <PortalHero
        eyebrow="Account"
        title={forceComplete ? "Complete profile" : "Profile"}
        description={
          forceComplete
            ? "Name + phone are required for booking."
            : "Clean account panel for your personal details."
        }
        imageSrc="/assets/images/znak3.jpg"
      />

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

