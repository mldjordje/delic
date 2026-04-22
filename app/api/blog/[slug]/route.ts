import { and, eq } from "drizzle-orm";
import { fail, ok } from "@/lib/api/http";
import { getDb, schema } from "@/lib/db/client";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.blogPosts)
    .where(and(eq(schema.blogPosts.slug, slug), eq(schema.blogPosts.isPublished, true)))
    .limit(1);
  if (!row) {
    return fail(404, "Tekst nije pronađen.");
  }
  return ok({ ok: true, post: row });
}
