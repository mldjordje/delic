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
        eyebrow="Nalog"
        title={forceComplete ? "Dopunite profil" : "Profil"}
        description={
          forceComplete
            ? "Ime i telefon su obavezni za zakazivanje."
            : "Upravljajte ličnim podacima."
        }
        imageSrc="/assets/images/znak3.jpg"
      />

      {forceComplete ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Dopunite profil</CardTitle>
            <CardDescription>Ime i telefon su obavezni za zakazivanje.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Popunjavanje traje manje od minut. Nakon čuvanja, bićete vraćeni na pregled.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <ProfilePanel forceComplete={forceComplete} />
    </div>
  );
}
