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
    description: post.excerpt.slice(0, 180),
    openGraph: { title: post.title, description: post.excerpt.slice(0, 180) },
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
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt.slice(0, 180),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "Auto Delić", url: base },
    publisher: {
      "@type": "Organization",
      name: "Auto Delić",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/assets/images/logonovi.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/blog/${slug}` },
    ...(Array.isArray(post.imageUrls) && post.imageUrls[0]
      ? { image: post.imageUrls[0] }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Početna", item: base },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${base}/blog/${slug}` },
    ],
  };

  return (
    <main className="dark-bg-1" itemScope itemType="https://schema.org/Article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
          itemProp="articleBody"
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
        >
          {post.content}
        </div>
      </div>
    </main>
  );
}
