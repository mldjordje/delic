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
  let post: any | null = null;
  try {
    const db = getDb();
    const [p] = await db
      .select()
      .from(schema.blogPosts)
      .where(and(eq(schema.blogPosts.slug, slug), eq(schema.blogPosts.isPublished, true)))
      .limit(1);
    post = p ?? null;
  } catch {
    post = null;
  }
  if (!post) {
    return { title: "Nije pronađeno" };
  }
  const base = getPublicAppUrl();
  return {
    title: `${post.title} | Auto Delić`,
    description: post.excerpt.slice(0, 160),
    keywords: ["Auto Delić", "tehnički pregled", post.title],
    openGraph: {
      title: post.title,
      description: post.excerpt.slice(0, 160),
      type: "article",
      url: `${base}/blog/${slug}`,
      publishedTime: post.createdAt?.toISOString?.(),
      modifiedTime: post.updatedAt?.toISOString?.(),
      authors: ["Auto Delić"],
      images: Array.isArray(post.imageUrls) && post.imageUrls[0]
        ? [{ url: post.imageUrls[0], alt: post.title }]
        : [{ url: "/assets/images/logonovi.png", width: 512, height: 512, alt: "Auto Delić" }],
    },
    alternates: { canonical: `${base}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: any | null = null;
  try {
    const db = getDb();
    const [p] = await db
      .select()
      .from(schema.blogPosts)
      .where(and(eq(schema.blogPosts.slug, slug), eq(schema.blogPosts.isPublished, true)))
      .limit(1);
    post = p ?? null;
  } catch {
    post = null;
  }
  if (!post) {
    notFound();
  }

  const base = getPublicAppUrl();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt.slice(0, 160),
    datePublished: post.createdAt?.toISOString?.(),
    dateModified: post.updatedAt?.toISOString?.(),
    author: {
      "@type": "Organization",
      name: "Auto Delić",
      url: base,
    },
    publisher: {
      "@type": "Organization",
      name: "Auto Delić",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/assets/images/logonovi.png` },
    },
    image: Array.isArray(post.imageUrls) && post.imageUrls[0]
      ? post.imageUrls[0]
      : `${base}/assets/images/logonovi.png`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/blog/${post.slug}` },
  };

  return (
    <main className="dark-bg-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="container top-bottom-padding-120" style={{ maxWidth: 780 }}>
        <p className="small-title-oswald text-color-4">
          <Link href="/blog" className="animsition-link">
            ← Blog
          </Link>
        </p>
        <h1 className="large-title-bold text-color-4 top-margin-20">
          {post.title}
        </h1>
        <p className="p-style-bold-up text-color-4 top-margin-20" style={{ opacity: 0.9 }}>
          {post.excerpt}
        </p>
        {Array.isArray(post.imageUrls) &&
          post.imageUrls.map((u: string, i: number) => (
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
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
        >
          {post.content}
        </div>
      </div>
    </main>
  );
}
