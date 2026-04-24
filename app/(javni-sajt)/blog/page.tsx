import type { Metadata } from "next";
import Link from "next/link";
import { getDb, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Blog | Auto Delić",
  description: "Vesti, saveti i obaveštenja o tehničkom pregledu i servisu.",
  openGraph: { title: "Blog | Auto Delić" },
};

export const revalidate = 120;

export default async function BlogListPage() {
  let posts: any[] = [];
  try {
    const db = getDb();
    posts = await db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.isPublished, true))
      .orderBy(desc(schema.blogPosts.createdAt));
  } catch {
    posts = [];
  }

  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <header>
          <p className="small-title-oswald text-color-4">Blog</p>
          <h1 className="large-title-bold text-color-4 top-margin-10">Tekstovi i obaveštenja</h1>
        </header>
        <ul className="top-margin-40" style={{ listStyle: "none", padding: 0, maxWidth: 720 }}>
          {posts.map((p) => (
            <li key={p.id} className="top-margin-30" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
              {Array.isArray(p.imageUrls) && p.imageUrls[0] ? (
                <div className="top-margin-10" style={{ borderRadius: 8, overflow: "hidden", maxWidth: 560 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrls[0]}
                    alt=""
                    className="full-width"
                    style={{ objectFit: "cover", maxHeight: 220 }}
                    loading="lazy"
                  />
                </div>
              ) : null}
              <h2 className="medium-title text-color-4 top-margin-20" style={{ marginBottom: 8 }}>
                <Link href={`/blog/${p.slug}`} className="animsition-link">
                  {p.title}
                </Link>
              </h2>
              <p className="p-style-bold-up text-height-20 text-color-4" style={{ opacity: 0.9 }}>
                {p.excerpt}
              </p>
              <p className="top-margin-15">
                <Link className="border-btn-box border-btn-red animsition-link" href={`/blog/${p.slug}`}>
                  <span className="border-btn" data-text="Pročitajte više" style={{ padding: "10px 20px" }}>
                    Pročitajte više
                  </span>
                </Link>
              </p>
            </li>
          ))}
        </ul>
        {posts.length === 0 ? (
          <p className="p-style-bold-up top-margin-40 text-color-4" style={{ opacity: 0.7 }}>
            Još nema objava.
          </p>
        ) : null}
      </div>
    </main>
  );
}
