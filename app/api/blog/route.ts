import { desc, eq } from "drizzle-orm";
import { ok } from "@/lib/api/http";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.isPublished, true))
    .orderBy(desc(schema.blogPosts.createdAt));

  return ok({
    ok: true,
    posts: rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      imageUrls: p.imageUrls,
      createdAt: p.createdAt,
    })),
  });
}
