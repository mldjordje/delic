import { desc } from "drizzle-orm";
import { z } from "zod";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const db = getDb();
  const rows = await db.select().from(schema.videoLinks).orderBy(desc(schema.videoLinks.createdAt));
  return ok({ ok: true, videos: rows });
}

const createSchema = z.object({
  youtubeUrl: z.string().url(),
  title: z.string().min(1).max(255),
  isPublished: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const body = await readJson(request);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravni podaci", parsed.error.flatten());
  }
  const db = getDb();
  const [row] = await db
    .insert(schema.videoLinks)
    .values({
      youtubeUrl: parsed.data.youtubeUrl,
      title: parsed.data.title,
      isPublished: parsed.data.isPublished ?? true,
    })
    .returning();
  return created({ ok: true, video: row });
}
