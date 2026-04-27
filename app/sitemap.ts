import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getPublicAppUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicAppUrl();
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    const db = getDb();
    posts = await db
      .select({ slug: schema.blogPosts.slug, updatedAt: schema.blogPosts.updatedAt })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.isPublished, true))
      .orderBy(desc(schema.blogPosts.createdAt));
  } catch {
    // blog / migration not ready
  }

  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/zakazivanje`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/polovni-automobili`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
