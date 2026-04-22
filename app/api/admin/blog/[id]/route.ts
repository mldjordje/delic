import { z } from "zod";
import { eq } from "drizzle-orm";
import { fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().min(1).max(2000).optional(),
  content: z.string().min(1).max(200_000).optional(),
  imageUrls: z.array(z.string().min(1).max(2000)).max(20).optional(),
  isPublished: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await ctx.params;
  const body = await readJson(request);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }
  const db = getDb();
  const d = parsed.data;
  const [row] = await db
    .update(schema.blogPosts)
    .set({
      ...(d.title !== undefined ? { title: d.title.trim() } : {}),
      ...(d.slug !== undefined ? { slug: d.slug.trim() } : {}),
      ...(d.excerpt !== undefined ? { excerpt: d.excerpt.trim() } : {}),
      ...(d.content !== undefined ? { content: d.content } : {}),
      ...(d.imageUrls !== undefined ? { imageUrls: d.imageUrls } : {}),
      ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.blogPosts.id, id))
    .returning();
  if (!row) {
    return fail(404, "Nije pronađeno.");
  }
  return ok({ ok: true, post: row });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const { id } = await ctx.params;
  const db = getDb();
  await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
  return ok({ ok: true });
}
