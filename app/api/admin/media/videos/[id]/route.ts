import { eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  youtubeUrl: z.string().url().optional(),
  title: z.string().min(1).max(255).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await context.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravni podaci", parsed.error.flatten());
  }
  const db = getDb();
  const [row] = await db
    .update(schema.videoLinks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.videoLinks.id, id))
    .returning();
  if (!row) {
    return fail(404, "Video nije pronađen.");
  }
  return ok({ ok: true, video: row });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await context.params;
  const db = getDb();
  await db.delete(schema.videoLinks).where(eq(schema.videoLinks.id, id));
  return ok({ ok: true });
}
