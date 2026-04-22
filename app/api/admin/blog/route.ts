import { z } from "zod";
import { desc } from "drizzle-orm";
import { created, fail, ok, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[čć]/g, "c")
    .replace(/[đ]/g, "d")
    .replace(/[š]/g, "s")
    .replace(/[ž]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const postSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().min(1).max(2000),
  content: z.string().min(1).max(200_000),
  imageUrls: z.array(z.string().min(1).max(2000)).max(20).default([]),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.blogPosts)
    .orderBy(desc(schema.blogPosts.createdAt));
  return ok({ ok: true, posts: rows });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const body = await readJson(request);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Neispravan zahtev", parsed.error.flatten());
  }
  const baseSlug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  if (!baseSlug) {
    return fail(400, "Nedostaje validan slug / naslov.");
  }
  const db = getDb();
  const now = new Date();
  const [row] = await db
    .insert(schema.blogPosts)
    .values({
      title: parsed.data.title.trim(),
      slug: baseSlug,
      excerpt: parsed.data.excerpt.trim(),
      content: parsed.data.content,
      imageUrls: parsed.data.imageUrls,
      isPublished: parsed.data.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created({ ok: true, post: row });
}
