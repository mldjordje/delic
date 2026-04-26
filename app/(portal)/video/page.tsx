import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompleteClientProfile } from "@/lib/auth/profile-completion";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { PortalHero } from "@/components/portal/PortalHero";

export default async function VideoPortalPage() {
  await requireCompleteClientProfile();
  const db = getDb();
  const videos = await db
    .select()
    .from(schema.videoLinks)
    .where(eq(schema.videoLinks.isPublished, true))
    .orderBy(desc(schema.videoLinks.createdAt));

  return (
    <div className="space-y-6">
      <PortalHero
        eyebrow="Mediji"
        title="Video"
        description="YouTube video snimci objavljeni od strane administratora."
        imageSrc="/assets/images/tehnickiunutra4.jpg"
      />

      <div className="grid gap-4">
        {videos.map((v) => {
          const embed = toYouTubeEmbedUrl(v.youtubeUrl);
          return (
            <Card key={v.id} className="glass">
              <CardHeader>
                <CardTitle>{v.title}</CardTitle>
                <CardDescription>{v.youtubeUrl}</CardDescription>
              </CardHeader>
              <CardContent>
                {embed ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                    <iframe
                      src={embed}
                      title={v.title}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nevažeći YouTube link.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {videos.length === 0 ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Još nema videa</CardTitle>
            <CardDescription>Kada administrator objavi video, pojaviće se ovde.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Trenutno nema ničega za prikaz.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
