import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getPublicAppUrl } from "@/lib/env";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(and(eq(schema.blogPosts.slug, slug), eq(schema.blogPosts.isPublished, true)))
    .limit(1);
  if (!post) {
    return { title: "Nije pronađeno" };
  }
  const base = getPublicAppUrl();
  return {
    title: `${post.title} | Auto Delić`,
    description: post.excerpt.slice(0, 180),
    openGraph: { title: post.title, description: post.excerpt.slice(0, 180) },
    alternates: { canonical: `${base}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(and(eq(schema.blogPosts.slug, slug), eq(schema.blogPosts.isPublished, true)))
    .limit(1);
  if (!post) {
    notFound();
  }

  return (
    <main className="dark-bg-1" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content={post.title} />
      <div className="container top-bottom-padding-120" style={{ maxWidth: 780 }}>
        <p className="small-title-oswald text-color-4">
          <Link href="/blog" className="animsition-link">
            ← Blog
          </Link>
        </p>
        <h1 className="large-title-bold text-color-4 top-margin-20" itemProp="name">
          {post.title}
        </h1>
        <p
          className="p-style-bold-up text-color-4 top-margin-20"
          style={{ opacity: 0.9 }}
          itemProp="description"
        >
          {post.excerpt}
        </p>
        {Array.isArray(post.imageUrls) &&
          post.imageUrls.map((u, i) => (
            <p key={i} className="top-margin-30" style={{ margin: "24px 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u}
                alt={`${post.title} — slika ${i + 1}`}
                className="full-width"
                style={{ borderRadius: 8, objectFit: "cover", maxHeight: 400 }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </p>
          ))}
        <div
          className="p-style-bold-up top-margin-30 text-color-4"
          itemProp="articleBody"
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
        >
          {post.content}
        </div>
      </div>
    </main>
  );
}
